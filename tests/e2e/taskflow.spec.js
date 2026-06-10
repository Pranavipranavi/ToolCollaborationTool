import { authenticatePage, e2ePassword, expect, inviteTokenFromUrl, test } from "./fixtures/taskflow.fixture";

test.describe("TaskFlow E2E", () => {
  test("registration creates an authenticated account", async ({ page }) => {
    const id = Date.now();
    await page.goto("/register");

    await page.getByPlaceholder("Full name").fill(`E2E Register ${id}`);
    await page.getByPlaceholder("Email").fill(`e2e-register-${id}@example.com`);
    await page.getByPlaceholder("Password").fill(e2ePassword);
    await page.locator("select").selectOption("What was your first school?");
    await page.getByPlaceholder("Security answer").fill("school");
    await page.getByRole("button", { name: "Register" }).click();

    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(page.getByText("Workspace Intelligence")).toBeVisible();
  });

  test("email/password login works", async ({ page, taskflowApi }) => {
    const user = await taskflowApi.registerUser("login");

    await page.goto("/login");
    await page.getByLabel("Email").fill(user.email);
    await page.getByLabel("Password").fill(user.password);
    await page.getByRole("button", { name: "Login" }).click();

    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(page.getByText("Workspace Intelligence")).toBeVisible();
  });

  test("Google login route is registered and redirects to Google", async ({ taskflowApi }) => {
    const response = await taskflowApi.raw("GET", "/auth/google", { maxRedirects: 0 });
    expect([302, 303]).toContain(response.status());
    expect(response.headers().location).toContain("accounts.google.com");
  });

  test("workspace, project, task, assignment, comments, invite, switching, and notifications work", async ({ browser, page, taskflowApi }) => {
    const id = Date.now();
    const owner = await taskflowApi.registerUser("owner-ui");
    const member = await taskflowApi.registerUser("member-ui");
    const workspaceName = `E2E Product Workspace ${id}`;
    const projectName = `Launch Plan ${id}`;
    const taskName = `Draft release checklist ${id}`;
    const commentBody = `Ready for review ${id}`;
    const ownerDefaultWorkspace = `${owner.name}'s Workspace`;
    let workspaceId;

    await authenticatePage(page, owner.token);
    await page.goto("/workspace");
    await expect(page.getByRole("heading", { name: ownerDefaultWorkspace })).toBeVisible();

    const workspaceForm = page.locator("form").filter({ has: page.getByPlaceholder("Workspace name") });
    await workspaceForm.getByPlaceholder("Workspace name").fill(workspaceName);
    await workspaceForm.getByPlaceholder("Description").fill("Created through Playwright");
    await workspaceForm.getByRole("button", { name: "Create" }).click();
    await expect(page.getByRole("heading", { name: workspaceName })).toBeVisible();

    const workspaces = await taskflowApi.listWorkspaces(owner.token);
    workspaceId = workspaces.find((workspace) => workspace.name === workspaceName)?._id;
    expect(workspaceId).toBeTruthy();

    await page.locator("#invite-form").getByPlaceholder("teammate@email.com").fill(member.email);
    await page.locator("#invite-form").locator("select").selectOption("Member");
    await page.locator("#invite-form").getByRole("button", { name: "Generate" }).click();
    await expect(page.getByText("Invite link generated")).toBeVisible();
    const inviteUrl = await page.locator("input[readonly]").inputValue();
    expect(inviteUrl).toContain("/login?invite=");

    const memberContext = await browser.newContext();
    const memberPage = await memberContext.newPage();
    await memberPage.goto(`/login?invite=${encodeURIComponent(inviteTokenFromUrl(inviteUrl))}`);
    await memberPage.getByLabel("Email").fill(member.email);
    await memberPage.getByLabel("Password").fill(member.password);
    await memberPage.getByRole("button", { name: "Login" }).click();
    await expect(memberPage).toHaveURL(/\/workspace\?invite=accepted$/);
    await memberPage.getByLabel("Switch workspace").click();
    await memberPage.getByRole("button", { name: new RegExp(workspaceName) }).click();
    await expect(memberPage.getByRole("heading", { name: workspaceName })).toBeVisible();
    await expect(memberPage.getByRole("button", { name: "Create project" })).toHaveCount(0);
    await expect(memberPage.locator("#invite-form")).toHaveCount(0);

    await page.reload();
    await expect(page.getByText(member.name)).toBeVisible();

    const projectForm = page.locator("form").filter({ has: page.getByPlaceholder("Project name") });
    await projectForm.getByPlaceholder("Project name").fill(projectName);
    await projectForm.getByPlaceholder("Project description").fill("Project created through Playwright");
    await projectForm.getByRole("button", { name: "Create project" }).click();
    await expect(page.getByRole("heading", { name: projectName })).toBeVisible();

    await page.goto("/board");
    await expect(page.getByRole("heading", { name: projectName })).toBeVisible();
    await page.getByRole("button", { name: "Add task" }).click();

    const taskSection = page.locator("section").filter({ has: page.getByRole("heading", { name: "Create task" }) });
    await taskSection.getByPlaceholder("Task title").fill(taskName);
    await taskSection.getByPlaceholder("Description").fill("Task created through Playwright");
    await taskSection.locator("select").nth(1).selectOption({ label: member.name });
    await taskSection.getByRole("button", { name: "Create task", exact: true }).click();
    await expect(page.getByRole("heading", { name: taskName })).toBeVisible();

    await page.getByRole("button", { name: "Open task", exact: true }).click();
    await page.getByLabel("Add comment").fill(commentBody);
    await page.getByRole("button", { name: "Add comment" }).click();
    await expect(page.getByText(commentBody)).toBeVisible();
    await page.getByLabel("Close task details").click();

    await memberPage.goto("/notifications");
    await expect(memberPage.getByRole("heading", { name: "Notifications" })).toBeVisible();
    await expect(memberPage.getByText(taskName).first()).toBeVisible();

    await page.goto("/workspace");
    await page.getByLabel("Switch workspace").click();
    await page.getByRole("button", { name: new RegExp(ownerDefaultWorkspace.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")) }).click();
    await expect(page.getByRole("heading", { name: ownerDefaultWorkspace })).toBeVisible();
    await page.getByLabel("Switch workspace").click();
    await page.getByRole("button", { name: new RegExp(workspaceName) }).click();
    await expect(page.getByRole("heading", { name: workspaceName })).toBeVisible();

    await memberContext.close();
    await taskflowApi.deleteWorkspace(owner.token, workspaceId);
  });

  test("role permissions are enforced by the API", async ({ taskflowApi }) => {
    const { owner, admin, member, workspace } = await taskflowApi.createTeam(`rbac-${Date.now()}`);

    const project = await taskflowApi.fetch("POST", `/${workspace._id}/projects`, {
      token: owner.token,
      data: { title: "Owner project", description: "RBAC project" },
      expectedStatus: 201,
    });

    await taskflowApi.fetch("PATCH", `/workspaces/${workspace._id}`, {
      token: admin.token,
      data: { name: "Blocked admin edit" },
      expectedStatus: 403,
    });
    await taskflowApi.fetch("POST", `/${workspace._id}/projects`, {
      token: member.token,
      data: { title: "Blocked member project" },
      expectedStatus: 403,
    });
    await taskflowApi.fetch("DELETE", `/${workspace._id}/projects/${project.project._id}`, {
      token: admin.token,
      expectedStatus: 403,
    });

    const task = await taskflowApi.fetch("POST", `/${workspace._id}/projects/${project.project._id}/tasks`, {
      token: owner.token,
      data: { title: "Assigned RBAC task", assignedUser: member.user.id },
      expectedStatus: 201,
    });
    await taskflowApi.fetch("PATCH", `/${workspace._id}/projects/${project.project._id}/tasks/${task.task._id}`, {
      token: member.token,
      data: { status: "In Progress" },
      expectedStatus: 200,
    });
    await taskflowApi.fetch("PATCH", `/${workspace._id}/projects/${project.project._id}/tasks/${task.task._id}`, {
      token: member.token,
      data: { assignedUser: owner.user.id },
      expectedStatus: 403,
    });
    await taskflowApi.fetch("POST", `/workspaces/${workspace._id}/invitations`, {
      token: member.token,
      data: { email: `blocked-${Date.now()}@example.com`, role: "Member" },
      expectedStatus: 403,
    });

    await taskflowApi.deleteWorkspace(owner.token, workspace._id);
  });
});
