# Deploying MAHI Spiritual System to Netlify

## Prerequisites

- GitHub repo: `https://github.com/kamelmh/mahi-spiritual.git`
- Netlify account (free tier works)
- Repo pushed to GitHub with `netlify.toml` at root

## Step 1: Connect to Netlify

1. Go to [app.netlify.com](https://app.netlify.com)
2. Click **"Add new site" → "Import an existing project"**
3. Select **GitHub**
4. Search for `kamelmh/mahi-spiritual`
5. Click **"Import site"**

## Step 2: Configure Build Settings

Netlify reads `netlify.toml` from the repo root. Verify these settings on the build page:

| Setting | Value |
|---------|-------|
| **Build command** | `pip install -r backend/requirements.txt && python -m backend.generate` |
| **Publish directory** | `frontend` |
| **Python version** | `3.11` (set in `[build.environment]`) |

Click **"Deploy site"** — the build should complete in ~2 minutes.

## Step 3: Environment Variables (if needed)

The system works without any environment variables — all data is generated at build time from the Python ephemeris.

If you add API keys later (e.g., for live data), add them in **Site settings → Build & deploy → Environment variables**.

## Step 4: Verify Deployment

After deploy completes:

1. Click the **"Preview"** URL (looks like `https://random-name.netlify.app`)
2. Check the main dashboard loads
3. Open browser DevTools → Network tab, reload — confirm no 404s
4. Test each page: Dashboard, Charts, Transits, Dasha, Family, Practice

## Step 5: Custom Domain (optional)

1. Go to **Site settings → Domain management → Add custom domain**
2. Enter your domain (e.g., `spiritual.kamelmahi.com`)
3. In your DNS provider, add:
   - `CNAME` record: `@ → random-name.netlify.app`
4. Wait for DNS propagation (~5 min)
5. Netlify auto-provisions SSL

## Troubleshooting

### Build fails with "pip: not found"
- Netlify uses `PYTHON_VERSION` env var from `netlify.toml`
- Ensure the root `netlify.toml` exists (not just `deploy/netlify.toml`)

### Build fails with "No module named backend"
- The build command runs from repo root
- `python -m backend.generate` must find `backend/__init__.py`

### Generated JSON files not found
- `python -m backend.generate` outputs to `frontend/data/`
- Check build logs for errors during generation
- `.gitignore` excludes these files — they must be generated at build time

### 404 on page refresh
- The `[[redirects]]` section in `netlify.toml` serves `index.html` for all routes
- If using a SPA framework, ensure this redirect is present

## Architecture

```
mahi-spiritual/
├── netlify.toml          ← Netlify reads this from root
├── backend/
│   ├── requirements.txt  ← skyfield, numpy
│   └── generate.py       ← Builds JSON from ephemeris
├── frontend/
│   ├── index.html        ← Published directory
│   ├── css/
│   ├── js/
│   └── data/             ← Generated at build time
└── deploy/
    └── github-deploy.yml ← CI/CD alternative (optional)
```

The build pipeline:
1. `pip install` skyfield + numpy
2. `python -m backend.generate` creates `frontend/data/*.json`
3. Netlify publishes `frontend/` as the site
