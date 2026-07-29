# 🚀 Render Deployment Guide for Valora Sovereign Private Banking

This guide details the steps to deploy your full-stack, secure banking website onto **Render** (https://render.com) with absolute ease and high-performance routing.

---

## 📋 Prerequisites
1. A **GitHub**, **GitLab**, or **Bitbucket** repository containing the project files.
2. A free or paid **Render** account.
3. Your **SMTP email server credentials** (e.g., Gmail App Passwords, SendGrid, or Resend API key) to power the **Email OTP Transaction Authorization System**.

---

## 🛠️ Step 1: Push Your Code to GitHub
Ensure all your files (including `package.json`, `server.ts`, `vite.config.ts`, and `index.html`) are pushed to your remote repository:
```bash
git init
git add .
git commit -m "feat: secure OTP transaction engine and render compatibility"
git remote add origin https://github.com/your-username/valora-private-banking.git
git branch -M main
git push -u origin main
```

---

## 🌐 Step 2: Create a New Web Service on Render
1. Log in to your **Render Dashboard** (https://dashboard.render.com).
2. Click **New +** and select **Web Service**.
3. Connect your **GitHub / GitLab** account and select the repository you just pushed.
4. Configure the following settings:
   - **Name**: `valora-banking` (or any descriptive name)
   - **Region**: Select the region closest to you (e.g., `Oregon (US West)` or `Frankfurt (EU)`)
   - **Branch**: `main`
   - **Runtime**: `Node`
   - **Build Command**: `bun install && bun run build` (or `npm install && npm run build`)
   - **Start Command**: `bun run start` (or `npm run start`)
   - **Instance Type**: `Free` or `Starter` (The free instance is 100% sufficient!)

---

## 🔒 Step 3: Configure Environment Variables
In the **Environment** section of your Render Web Service settings, add the following environment keys to activate the **SMTP Secure Email Gateway**:

| Key | Description | Example Value |
| :--- | :--- | :--- |
| `NODE_ENV` | Enforces production optimizations | `production` |
| `SMTP_HOST` | Outbound mail server host address | `smtp.gmail.com` |
| `SMTP_PORT` | Encryption port for mail | `465` (for SSL) or `587` (for STARTTLS) |
| `SMTP_SECURE` | Set to true to use SSL/TLS directly | `true` |
| `SMTP_USER` | Authorized sender account address | `your-email@gmail.com` |
| `SMTP_PASS` | Secure App Password or API Token | `xxxx xxxx xxxx xxxx` |
| `SMTP_FROM` | Label that recipients see in their inbox | `"Valora Private Security" <your-email@gmail.com>` |
| `GEMINI_API_KEY` | Optional: Gemini AI key for intelligence services | `AIzaSy...` |

> **💡 Gmail Setup Tip:** If using Gmail, go to your **Google Account Settings -> Security -> 2-Step Verification -> App Passwords**, generate an app password named "Valora", and copy-paste the 16-character code into `SMTP_PASS`.

---

## 🔄 Step 4: Deploy & Verify
1. Click **Deploy Web Service** at the bottom of the page.
2. Render will automatically clone your repository, run `npm run build` (which compiles the Vite front-end assets and bundles the backend TypeScript server cleanly with `esbuild` into `dist/server.cjs`), and boot the server via `npm run start` on port `3000` (which Render maps automatically).
3. Once the logs say `Server running on http://0.0.0.0:3000` and the status turns **Live**, click the generated URL to access your premium private banking web app!

---

## 🛠️ Advanced: Render Blueprints (Optional)
If you prefer push-button, infrastructure-as-code deploys, you can place a `render.yaml` file in your root folder. Render will automatically read it and prompt you to spin up the service:

```yaml
services:
  - type: web
    name: valora-sovereign-banking
    env: node
    buildCommand: npm install && npm run build
    startCommand: npm run start
    envVars:
      - key: NODE_ENV
        value: production
      - key: SMTP_HOST
        sync: false
      - key: SMTP_PORT
        sync: false
      - key: SMTP_SECURE
        value: "true"
      - key: SMTP_USER
        sync: false
      - key: SMTP_PASS
        sync: false
      - key: SMTP_FROM
        sync: false
      - key: GEMINI_API_KEY
        sync: false
```
