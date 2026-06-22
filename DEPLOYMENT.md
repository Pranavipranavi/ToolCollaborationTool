# Deployment Guide – TaskFlow Platform

This document describes the steps required to deploy the **TaskFlow** platform in both local development and cloud production environments. 

---

## 1. Local Development Setup

TaskFlow consists of a React single-page frontend (using Vite) and a Node.js Express backend API.

### Prerequisites
* **Node.js:** v18.0.0 or higher
* **npm:** v9.0.0 or higher
* **MongoDB:** A running local MongoDB instance or a MongoDB Atlas cloud cluster connection string.

### Setup Instructions

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/Pranavipranavi/Task-Collaboration-Tool.git
   cd Task-Collaboration-Tool
   ```

2. **Install Dependencies:**
   Run the installation helper script from the root folder:
   ```bash
   npm run install:all
   ```
   This will install dependencies for the root test runner, the frontend client (`client/`), and the backend API server (`server/`).

3. **Configure Environment Variables:**
   Copy the example environment files in both folders:
   * **Backend:**
     ```bash
     copy server\.env.example server\.env
     ```
   * **Frontend:**
     ```bash
     copy client\.env.example client\.env
     ```

4. **Update Environment Files:**
   * Open `server/.env` and insert your MongoDB Atlas URI, JWT Secret, and Google OAuth credentials.
   * Open `client/.env` and update the API and socket URLs if using non-default ports.

5. **Start Dev Mode:**
   Run the concurrent dev command from the root:
   ```bash
   npm run dev
   ```
   * **Frontend Client:** Available at `http://localhost:5182`
   * **Backend API Server:** Available at `http://localhost:5082`

---

## 2. Environment Variables Reference

### Backend Configuration (`server/.env`)

```env
PORT=5082
NODE_ENV=development
CLIENT_URL=http://localhost:5182
SERVER_URL=http://localhost:5082

# MongoDB Atlas database URI
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<dbname>

# JWT Session encryption keys
JWT_SECRET=development-taskflow-secret-hash-at-least-32-chars-long
JWT_EXPIRES_IN=7d

# Google OAuth Client Credentials (optional for local, required for SSO)
GOOGLE_CLIENT_ID=your-google-oauth-client-id
GOOGLE_CLIENT_SECRET=your-google-oauth-client-secret
```

### Frontend Configuration (`client/.env`)

```env
VITE_API_URL=http://localhost:5082/api
VITE_SOCKET_URL=http://localhost:5082
```

---

## 3. Production Deployment Guide

### Database Setup: MongoDB Atlas
1. Log in to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a shared cluster (M0 sandbox is sufficient).
3. Under **Database Access**, create a user with read/write privileges.
4. Under **Network Access**, whitelist connection IP addresses (use `0.0.0.0/0` to allow serverless hosts like Render to connect).
5. Retrieve your application connection string.

### Backend Setup: Render
1. Register/log in to [Render](https://render.com).
2. Create a new **Web Service** and connect your TaskFlow GitHub repository.
3. Configure the following service parameters:
   * **Root Directory:** `server`
   * **Runtime:** `Node`
   * **Build Command:** `npm install`
   * **Start Command:** `node src/server.js`
4. Add the following **Environment Variables** in Render's dashboard:
   * `PORT=10000` (Render binds its internal port dynamically)
   * `NODE_ENV=production`
   * `CLIENT_URL=https://task-collaboration-tool.vercel.app` (Your vercel client domain)
   * `SERVER_URL=https://your-taskflow-backend.onrender.com` (Your Render server domain)
   * `MONGODB_URI=your-atlas-connection-string`
   * `JWT_SECRET=generate-a-strong-64-character-random-key`
   * `JWT_EXPIRES_IN=7d`
   * `GOOGLE_CLIENT_ID=production-google-client-id`
   * `GOOGLE_CLIENT_SECRET=production-google-client-secret`

### Frontend Setup: Vercel
1. Register/log in to [Vercel](https://vercel.com).
2. Import your TaskFlow repository.
3. Configure the project settings:
   * **Framework Preset:** `Vite` (Vercel automatically detects this)
   * **Root Directory:** `client`
   * **Build Command:** `npm run build`
   * **Output Directory:** `dist`
4. Configure the build environment variables:
   * `VITE_API_URL=https://your-taskflow-backend.onrender.com/api`
   * `VITE_SOCKET_URL=https://your-taskflow-backend.onrender.com`
5. Click **Deploy**. Vercel will build the frontend React application and deploy it.

---

## 4. Troubleshooting Guide

### Issue: MONGODB_URI is not set / Database not connected
* **Symptom:** API logs display warning, or requests return HTTP `503 Service Unavailable`.
* **Fix:** Ensure `MONGODB_URI` is declared in `server/.env` (for local setup) or in Render's environment dashboard (for production). Double-check database network settings in Atlas and make sure connections from all IPs (`0.0.0.0/0`) are whitelisted.

### Issue: Port Conflicts on 5173 / 5000
* **Symptom:** Dev server starts but displays different landing pages (e.g. "Finora" or another app), or console displays `EADDRINUSE`.
* **Fix:** We isolated TaskFlow dev ports to `5182` (client) and `5082` (server). If these are in use, open `client/vite.config.js` and edit the port, and match the references in `server/.env`, `client/.env`, and `playwright.config.js`.

### Issue: Google OAuth Callback Errors (Redirect URI Mismatch)
* **Symptom:** User clicks Google Login and receives Google Error 400 `redirect_uri_mismatch`.
* **Fix:** Go to Google Cloud Console > Credentials. Ensure that the Authorised redirect URIs list contains the exact callback endpoint:
  * Local: `http://localhost:5082/api/auth/google/callback`
  * Production: `https://your-taskflow-backend.onrender.com/api/auth/google/callback`

### Issue: WebSockets (Socket.io) failing to connect in Production
* **Symptom:** Board changes do not sync in real-time, or client log shows polling errors.
* **Fix:** Ensure `VITE_SOCKET_URL` is set to the HTTPS domain of your Render backend without trailing slashes. Verify CORS origin configs in Render are whitelisting Vercel's address.
