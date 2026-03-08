# ⚡ FlowPulse — Setup Guide
Get your live n8n dashboard running in ~10 minutes.

---

## What You're Deploying

```
Your Browser (GitHub Pages)
        ↓  fetch every 10s
Cloudflare Worker (free proxy)
        ↓  authenticated request
n8n Cloud API
        ↓  live workflow data
Back to your dashboard ✓
```

---

## Step 1 — Deploy the Cloudflare Worker (5 min)

This proxy solves the CORS problem so your GitHub Pages site can call n8n Cloud.

1. Go to **https://workers.cloudflare.com** and sign up (free, no card needed)
2. Click **"Create Worker"**
3. Delete all the default code
4. Open `worker.js` from this repo and paste the entire contents
5. Find this line near the top and replace with your GitHub Pages URL:
   ```js
   'https://yourusername.github.io',  // ← your URL here
   ```
6. Click **"Save and Deploy"**
7. Copy your worker URL — it looks like:
   `https://flowpulse.yourname.workers.dev`

---

## Step 2 — Get Your n8n Cloud API Key (2 min)

1. Log in to **https://app.n8n.cloud**
2. Click your profile icon → **Settings**
3. Go to **API** → **Create API Key**
4. Copy the key (starts with `n8n_`)

Your instance URL looks like:
`https://yourname.app.n8n.cloud`

---

## Step 3 — Deploy to GitHub Pages (3 min)

1. Create a new GitHub repo (e.g. `flowpulse-dashboard`)
2. Upload these files:
   - `index.html`
   - `worker.js`
   - `SETUP.md`
3. Go to repo **Settings → Pages**
4. Under **Source**, select `main` branch → `/ (root)`
5. Click **Save**
6. Your live URL: `https://yourusername.github.io/flowpulse-dashboard`

---

## Step 4 — Connect in the Dashboard

1. Open your GitHub Pages URL
2. Log in with any email + password (6+ chars) — this is a local session
3. Check **"Connect n8n Cloud API on login"**
4. Fill in:
   - **API Key**: your n8n API key (`n8n_xxx...`)
   - **Instance URL**: `https://yourname.app.n8n.cloud`
   - **Worker URL**: your Cloudflare Worker URL
5. Click **Sign In** — live data loads immediately!

You can also update these anytime via **Settings → API Settings** in the sidebar.

---

## What Data You'll See (Live, every 10s)

| Feature | Source |
|---|---|
| Total Workflows | `GET /api/v1/workflows` |
| Active / Inactive count | workflow `active` field |
| Executions Today | `GET /api/v1/executions?limit=50` |
| Success Rate | execution `status` field |
| Workflow Health % | per-workflow success ratio |
| Live Execution Log | last 12 executions |
| Error Alerts | executions with `status: error` |
| Activity Chart | executions grouped by day |

---

## Troubleshooting

**"Fetch failed" error**
- Check your Worker URL is correct (no trailing slash)
- Make sure you updated `ALLOWED_ORIGINS` in `worker.js` with your GitHub Pages URL

**"HTTP 401" error**
- Your n8n API key is wrong or expired — regenerate it in n8n Settings

**"HTTP 404" error**
- Your instance URL is wrong — check it matches exactly what you see in your browser when logged into n8n

**Data not updating**
- Dashboard auto-refreshes every 10 seconds
- Click the **↻ Refresh** button to force an immediate sync

---

## Next Steps (Future Features)

- [ ] Real authentication (Supabase or Firebase)
- [ ] Email/Slack alerts when workflows fail
- [ ] Mobile app (React Native)
- [ ] Multi-user team access
- [ ] Public client-facing status pages
- [ ] AI-powered failure insights

---

*Built with FlowPulse — n8n Automation Intelligence*
