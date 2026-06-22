import { expect, test as base } from "@playwright/test";

export const apiBaseUrl = process.env.PLAYWRIGHT_API_URL || "http://localhost:5082/api";
export const appBaseUrl = process.env.PLAYWRIGHT_BASE_URL || "http://localhost:5182";
export const e2ePassword = "TaskFlow#2026";
export const securityQuestion = "What was your first school?";
export const securityAnswer = "school";

function uniqueId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
}

function appHostname() {
  return new URL(appBaseUrl).hostname;
}

async function expectJson(response, expectedStatus, label) {
  const bodyText = await response.text();
  let body = null;
  try {
    body = bodyText ? JSON.parse(bodyText) : null;
  } catch (_error) {
    body = bodyText;
  }

  expect(response.status(), `${label}: ${JSON.stringify(body)}`).toBe(expectedStatus);
  return body;
}

class TaskflowApi {
  constructor(request) {
    this.request = request;
  }

  async fetch(method, path, { token, data, expectedStatus = 200, maxRedirects } = {}) {
    const response = await this.request.fetch(`${apiBaseUrl}${path}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}`, Cookie: "" } : {}),
      },
      data,
      maxRedirects,
    });
    return expectJson(response, expectedStatus, `${method} ${path}`);
  }

  async raw(method, path, options = {}) {
    return this.request.fetch(`${apiBaseUrl}${path}`, { method, ...options });
  }

  async registerUser(prefix = "user") {
    const id = uniqueId(prefix);
    const user = {
      name: `E2E ${prefix} ${id.slice(-6)}`,
      email: `${id}@example.com`,
      password: e2ePassword,
      securityQuestion,
      securityAnswer,
    };
    const body = await this.fetch("POST", "/auth/register", { data: user, expectedStatus: 201 });
    return { ...user, token: body.token, user: body.user };
  }

  async login(email, password = e2ePassword) {
    return this.fetch("POST", "/auth/login", { data: { email, password } });
  }

  async listWorkspaces(token) {
    const body = await this.fetch("GET", "/workspaces", { token });
    return body.workspaces ?? [];
  }

  async createWorkspace(token, payload) {
    const body = await this.fetch("POST", "/workspaces", { token, data: payload, expectedStatus: 201 });
    return body.workspace;
  }

  async deleteWorkspace(token, workspaceId) {
    return this.fetch("DELETE", `/workspaces/${workspaceId}`, { token });
  }

  async invite(token, workspaceId, payload) {
    return this.fetch("POST", `/workspaces/${workspaceId}/invitations`, { token, data: payload, expectedStatus: 201 });
  }

  async acceptInvitation(token, inviteUrl) {
    const inviteToken = new URL(inviteUrl).searchParams.get("invite");
    return this.fetch("POST", "/workspaces/invitations/accept", { token, data: { token: inviteToken } });
  }

  async createTeam(prefix = "team") {
    const owner = await this.registerUser(`${prefix}-owner`);
    const admin = await this.registerUser(`${prefix}-admin`);
    const member = await this.registerUser(`${prefix}-member`);
    const workspace = await this.createWorkspace(owner.token, {
      name: `E2E ${prefix} Workspace`,
      description: "Playwright RBAC workspace",
    });

    const adminInvite = await this.invite(owner.token, workspace._id, { email: admin.email, role: "Admin" });
    const memberInvite = await this.invite(owner.token, workspace._id, { email: member.email, role: "Member" });
    await this.acceptInvitation(admin.token, adminInvite.inviteUrl);
    await this.acceptInvitation(member.token, memberInvite.inviteUrl);

    return { owner, admin, member, workspace };
  }
}

export const test = base.extend({
  taskflowApi: async ({ request }, use) => {
    await use(new TaskflowApi(request));
  },
});

export async function authenticatePage(page, token) {
  await page.context().addCookies([
    {
      name: "taskflow_token",
      value: token,
      domain: appHostname(),
      path: "/",
      httpOnly: true,
      sameSite: "Lax",
      secure: false,
    },
  ]);
}

export function inviteTokenFromUrl(inviteUrl) {
  return new URL(inviteUrl).searchParams.get("invite");
}

export { expect };
