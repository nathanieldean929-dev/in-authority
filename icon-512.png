# IN AUTHORITY

GitHub-ready Cloudflare Workers application. The public website lives in `public/`; the Cloudflare Worker in `worker.js` provides same-origin APIs for congressional data and ZIP representative lookup.

## Upload to GitHub
1. Create a new repository named `in-authority`.
2. Leave it Public or Private as you prefer.
3. Upload the contents of this repository to the root of that GitHub repository. GitHub supports `Add file` → `Upload files`.
4. Make sure `worker.js`, `wrangler.jsonc`, `package.json`, and the `public/` folder are at the repository root.

## Connect to Cloudflare
In Cloudflare: **Workers & Pages → Create application → Import a repository**. Choose your GitHub account and the `in-authority` repository. Cloudflare Workers Builds can automatically deploy future pushes.

## Local development
Requires Node.js. Then:

```bash
npm install
npm run dev
```

## Deploy from a terminal

```bash
npm install
npm run deploy
```

## What this fixes
- Browser calls `/api/members` on the same IN AUTHORITY domain instead of calling the external roster host directly.
- Browser calls `/api/reps?zip=XXXXX` on the same IN AUTHORITY domain. The Worker fetches and caches the outside data sources.
- The Congress state dropdown is populated from the loaded member roster and text search covers state names, abbreviations, names, districts, party, and chamber.
- PWA assets and service-worker files are included.

## Security
No Cloudflare credentials, API tokens, or secrets are included. Do not put those in GitHub.
