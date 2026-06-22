# TaskFlow – Task Collaboration & Team Productivity Platform

### Internship Project Submission
* **Organization:** Codtech IT Solutions Private Limited
* **Intern ID:** CITS1993
* **Full Name:** Naguru Suhas
* **Duration:** 8 Weeks (April 2026 – June 2026)
* **Domain:** Full-Stack Web Development

---

## 1. Project Overview & Scope

**TaskFlow** is a modern, production-grade task collaboration and team productivity platform designed to support modern agile workflows. It bridges the gap between high-level project management and real-time developer collaboration. 

The application organizes work hierarchically through workspaces and project boards, allowing team members to create tasks, assign them, drag-and-drop them through status columns, add comments, and receive real-time notifications when task updates or assignments occur.

TaskFlow is designed to be recruiter-ready, showcasing clean full-stack architectural practices, secure state hydration, robust Role-Based Access Control (RBAC), and socket integrations.

---

## 2. Key Features

* **Multi-Tenant Workspaces:** Create, edit, switch, or delete workspaces to isolate resources.
* **Project Tracking:** Set up multiple active or planning projects within each workspace.
* **Kanban Board:** Dynamic drag-and-drop task status board powered by `react-beautiful-dnd`.
* **Real-Time Synchronizations:** Server-client synchronization of task moves and comments via WebSockets (Socket.io).
* **Role-Based Access Control (RBAC):** Strict permissions dividing Owners, Admins, and Members.
* **Integrated Authentication:** JWT-based session security via HTTP-only cookies, password recovery via security questions, and Google OAuth SSO.
* **Analytics Dashboards:** Workspace summaries showing completion rates, workload distribution, and chronological activity feeds using Recharts.
* **Global Search:** Find projects, tasks, or teammates across the active workspace.
* **Dark Mode:** Polished dark theme toggling using Tailwind utility classes.

---

## 3. Tech Stack

* **Frontend:** React (Vite), Zustand, Tailwind CSS, Framer Motion, Axios, TanStack React Query, Recharts, React Beautiful DnD
* **Backend:** Node.js, Express, Socket.io, Passport.js, jsonwebtoken, BcryptJS
* **Database:** MongoDB Atlas, Mongoose ODM
* **Deployment:** Vercel (Frontend Client), Render (Backend API), MongoDB Atlas (Cloud Database)
* **Testing:** Playwright E2E testing framework

---

## 4. Architecture Overview

TaskFlow follows a decoupled Client-Server architecture:
* The **React Client** communicates with the server via RESTful HTTP calls and maintains an open WebSocket channel for real-time collaboration.
* The **Express Server** validates JWT sessions from secure cookies, enforces role controls, processes database queries through Mongoose models, and broadcasts changes to active project socket rooms.
* **MongoDB Atlas** stores all documents, ensuring quick indexes on search text queries and references.

---

## 5. Folder Structure

```
client/
  src/
    components/
      kanban/          # Kanban board, columns, cards, and task modals
      layout/          # App shell, Topbar header, navigation sidebar
      ui/              # Reusable button, state, and card components
    hooks/             # TanStack React Query queries and mutations
    lib/               # Axios configurations, WebSockets, normalizers
    pages/             # Pages (Dashboard, Workspace, Profile, Login)
    store/             # Zustand stores for global auth and settings
server/
  src/
    config/            # DB, Passport, and environment variables
    controllers/       # HTTP route handlers for auth, tasks, workspaces
    middleware/        # Auth verification, error catching, RBAC checks
    models/            # Mongoose schemas (User, Workspace, Task, Project)
    routes/            # Express endpoint mappings
    services/          # Socket.io listeners and notifications
screenshots/          # Page captures
output-images/        # Success state captures
documentation/        # Detailed Project_Documentation (PDF & Markdown)
```

---

## 6. Installation & Local Setup

1. **Install dependencies:**
   ```bash
   npm run install:all
   ```

2. **Configure environment variables:**
   Copy the example environment files:
   ```bash
   copy server\.env.example server\.env
   copy client\.env.example client\.env
   ```

3. **Update credentials:**
   * In `server/.env`, insert your MongoDB URI, JWT Secrets, and Google credentials.
   * In `client/.env`, verify that URLs point to the backend server.

4. **Seed professional demo data:**
   TaskFlow includes a database seeder to load a full demo workspace for testing:
   ```bash
   node server/scripts/seed.js
   ```

5. **Start development mode:**
   ```bash
   npm run dev
   ```
   * Frontend: `http://localhost:5182`
   * Backend: `http://localhost:5082`

---

## 7. Environment Variables Reference

### Backend (`server/.env`)
```env
PORT=5082
NODE_ENV=development
CLIENT_URL=http://localhost:5182
SERVER_URL=http://localhost:5082
MONGODB_URI=your-mongodb-connection-string
JWT_SECRET=your-32-char-jwt-secret-hash
JWT_EXPIRES_IN=7d
GOOGLE_CLIENT_ID=google-oauth-client-id
GOOGLE_CLIENT_SECRET=google-oauth-client-secret
```

### Frontend (`client/.env`)
```env
VITE_API_URL=http://localhost:5082/api
VITE_SOCKET_URL=http://localhost:5082
```

---

## 8. Database Schema Overview

```
User: { name, email, password, providers: { google }, securityQuestion, securityAnswerHash }
Workspace: { name, description, owner, members: [ { user, role } ], inviteCode }
Project: { workspace, title, description, status, members: [ user ], createdBy }
Task: { workspace, project, title, description, status, priority, assignedUser, dueDate, tags }
Comment: { task, user, body }
Notification: { user, workspace, type, title, body, unread, entity: { kind, id } }
Activity: { workspace, actor, action, targetType, targetName }
```

---

## 9. Role-Based Access Control (RBAC) Matrix

| Operation | Owner | Admin | Member |
|---|:---:|:---:|:---:|
| Delete Workspace | ✓ | | |
| Update Workspace Details | ✓ | | |
| Promote Members to Admin | ✓ | | |
| Remove Workspace Members | ✓ | | |
| Create Projects | ✓ | ✓ | |
| Create & Assign Tasks | ✓ | ✓ | |
| Invite Members via Code | ✓ | ✓ | |
| Drag-and-drop Assigned Tasks | ✓ | ✓ | ✓ |
| Add Comments to Tasks | ✓ | ✓ | ✓ |
| View Boards and Analytics | ✓ | ✓ | ✓ |

---

## 10. API Endpoints Catalog

* **Authentication:**
  * `POST /api/auth/register` - Sign up new user
  * `POST /api/auth/login` - Authenticate credentials and sign token cookie
  * `POST /api/auth/logout` - Clear JWT authentication cookie
  * `GET /api/auth/me` - Retrieve current session details
* **Workspaces:**
  * `GET /api/workspaces` - List user's workspaces
  * `POST /api/workspaces` - Create new workspace
  * `POST /api/workspaces/:id/invitations` - Create signed invitation link
* **Projects & Tasks:**
  * `POST /api/:workspaceId/projects` - Create a project inside a workspace
  * `POST /api/:workspaceId/projects/:pId/tasks` - Add task card to project
  * `PATCH /api/:workspaceId/projects/:pId/tasks/:tId` - Edit task properties or status
* **Collaboration & Feed:**
  * `POST /api/:workspaceId/tasks/:tId/comments` - Add comment thread message
  * `GET /api/notifications` - Retrieve list of notifications
  * `GET /api/analytics/dashboard` - Get completion charts and timelines

---

## 11. Deployment Configuration

TaskFlow is configured for cloud deployment:
* **Frontend:** Hosted on **Vercel** with SPA rewrites in `client/vercel.json`.
* **Backend:** Hosted on **Render** (build config defined in `render.yaml` at root).
* **Database:** Hosted on **MongoDB Atlas** shared database cluster.

---

## 12. Visual Walkthrough

### Pages (`screenshots/`)
1. **Landing Page:** [screenshots/landing_page.png](screenshots/landing_page.png)
2. **Kanban Task Board:** [screenshots/kanban_board.png](screenshots/kanban_board.png)
3. **Workspace Dashboard:** [screenshots/workspace_management.png](screenshots/workspace_management.png)
4. **Analytics Reports:** [screenshots/analytics_dashboard.png](screenshots/analytics_dashboard.png)
5. **Dark Mode View:** [screenshots/dark_mode.png](screenshots/dark_mode.png)

### Success States (`output-images/`)
1. **Registration Success:** [output-images/registration_success.png](output-images/registration_success.png)
2. **Login Success:** [output-images/login_success.png](output-images/login_success.png)
3. **Workspace Created:** [output-images/workspace_creation_success.png](output-images/workspace_creation_success.png)
4. **Project Created:** [output-images/project_creation_success.png](output-images/project_creation_success.png)
5. **Task Assigned:** [output-images/task_assignment_success.png](output-images/task_assignment_success.png)
6. **Comment Added:** [output-images/comment_added.png](output-images/comment_added.png)
7. **Member Invited:** [output-images/member_invitation_created.png](output-images/member_invitation_created.png)

---

## 13. Documentation & Reports

Exhaustive details are present inside the physical repository files:
* **Detailed Project Design:** [documentation/Project_Documentation.md](documentation/Project_Documentation.md)
* **Printable PDF Documentation:** [documentation/Project_Documentation.pdf](documentation/Project_Documentation.pdf)
* **Deployment Instructions:** [DEPLOYMENT.md](DEPLOYMENT.md)
* **Auditing Checklists:** [SUBMISSION_CHECKLIST.md](SUBMISSION_CHECKLIST.md)

---

## 14. Conclusion

TaskFlow has been enhanced to be fully internship-submission ready. Under the 8-week curriculum at Codtech IT Solutions Private Limited, all requested features, databases, security standards, real-time events, and QA automation coverages have been verified and packaged successfully.
