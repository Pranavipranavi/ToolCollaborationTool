# TaskFlow Environment Configuration Audit

Generated from the actual frontend and backend source code after the authentication update.

## Files Created Or Updated

- `client/.env`
- `client/.env.example`
- `server/.env`
- `server/.env.example`
- `render.yaml`

## Environment Variables

| Variable | Required | Used In | Purpose | Example |
| --- | --- | --- | --- | --- |
| `PORT` | Optional locally, required on some hosts | `server/src/config/env.js`, `server/src/server.js` | Backend HTTP and Socket.io port. | `5000` |
| `NODE_ENV` | Optional locally, required in production | `server/src/config/env.js`, `server/src/app.js`, `server/src/controllers/auth.controller.js`, `server/src/middleware/security.middleware.js`, `server/src/utils/tokens.js` | Controls production checks, logging, secure cookies, and security behavior. | `development` or `production` |
| `CLIENT_URL` | Required for frontend/backend integration | `server/src/config/env.js`, `server/src/app.js`, `server/src/server.js`, `server/src/controllers/auth.controller.js`, `server/src/controllers/workspace.controller.js`, `server/src/routes/auth.routes.js` | CORS origin, Google OAuth failure/success redirects, workspace invitation links. | `http://localhost:5173` |
| `SERVER_URL` | Required for Google OAuth | `server/src/config/env.js`, `server/src/config/passport.js` | Builds the Google OAuth callback URL. | `http://localhost:5000` |
| `MONGODB_URI` | Required for real app use and production | `server/src/config/env.js`, `server/src/config/db.js` | MongoDB Atlas connection for users, workspaces, projects, tasks, comments, notifications, activities, and security-question reset sessions. | `mongodb+srv://user:pass@cluster.mongodb.net/taskflow?retryWrites=true&w=majority` |
| `JWT_SECRET` | Required for auth and production | `server/src/config/env.js`, `server/src/utils/tokens.js`, `server/src/middleware/auth.middleware.js` | Signs and verifies JWT session cookies. | `a-long-random-hex-or-base64-secret` |
| `JWT_EXPIRES_IN` | Optional | `server/src/config/env.js`, `server/src/utils/tokens.js` | JWT lifetime passed to `jsonwebtoken`. | `7d` |
| `GOOGLE_CLIENT_ID` | Required for Google OAuth | `server/src/config/env.js`, `server/src/config/passport.js` | Registers the Passport Google OAuth strategy. | `123456.apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | Required for Google OAuth | `server/src/config/env.js`, `server/src/config/passport.js` | Secret used by the backend Passport OAuth callback exchange. | `GOCSPX-your-secret` |
| `VITE_API_URL` | Required for deployed frontend, optional locally | `client/src/lib/api.js`, `client/src/pages/Login.jsx` | Frontend API base URL and Google login button target. | `http://localhost:5000/api` |
| `VITE_SOCKET_URL` | Required for deployed frontend, optional locally | `client/src/lib/socket.js` | Socket.io server URL. | `http://localhost:5000` |
| `import.meta.env.DEV` | Built-in, do not set manually | `client/src/lib/silenceKnownDevWarnings.js` | Vite development-mode flag for warning filtering. | Managed by Vite |

## Removed Variables

The current implementation no longer uses these variables:

- `GITHUB_CLIENT_ID`
- `GITHUB_CLIENT_SECRET`
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_SECURE`
- `SMTP_USER`
- `SMTP_PASS`
- `EMAIL_FROM`

## Authentication Model

- Email/password registration stores a selected security question and bcrypt-hashed security answer.
- Forgot password no longer sends email. It asks for email, displays the saved security question, verifies the answer, then allows password reset with a short-lived reset token.
- Security answer attempts are rate-limited at the route layer and also tracked per user with a lockout after repeated failures.
- Google login uses Passport Google OAuth on the backend.
- GitHub OAuth has been removed.

## Current Local Verification Targets

- Frontend: `http://localhost:5173`
- Backend health: `http://localhost:5000/health`
- Google callback URL: `http://localhost:5000/api/auth/google/callback`

## Missing Credentials

Provide these for full local functionality:

- MongoDB Atlas connection string for `MONGODB_URI`.
- Strong JWT secret for `JWT_SECRET`.
- Google OAuth `GOOGLE_CLIENT_ID`.
- Google OAuth `GOOGLE_CLIENT_SECRET`.

No SMTP credentials are required.

## Local Setup Steps

1. Install dependencies:

   ```powershell
   npm run install:all
   ```

2. Generate a JWT secret:

   ```powershell
   node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
   ```

   Paste the output into `server/.env` as `JWT_SECRET`.

3. Create a MongoDB Atlas cluster.

   Create a database user, allow your current IP address in Network Access, then copy the SRV connection string into `server/.env`:

   ```env
   MONGODB_URI=mongodb+srv://YOUR_USER:YOUR_PASSWORD@YOUR_CLUSTER.mongodb.net/taskflow?retryWrites=true&w=majority
   ```

4. Configure Google OAuth.

   Use a Web OAuth client. Set the redirect URI to:

   ```text
   http://localhost:5000/api/auth/google/callback
   ```

   Then paste the client ID and client secret into `server/.env`.

5. Start the app:

   ```powershell
   npm run dev
   ```

6. Open the frontend:

   ```text
   http://localhost:5173
   ```

7. Check backend health:

   ```text
   http://localhost:5000/health
   ```

   After `MONGODB_URI` is valid, the database field should be `connected`.
