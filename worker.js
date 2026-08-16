const ROSTER_URL = "https://unitedstates.github.io/congress-legislators/legislators-current.json";
const REPSCONTACT_URL = "https://repscontact.com/api/reps";
const ROSTER_CACHE_KEY = "https://in-authority.local/api/members";
const ROSTER_TTL_MS = 6 * 60 * 60 * 1000;
const REPS_TTL_MS = 15 * 60 * 1000;

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" }
  });
}

async function cachedFetch(key, url, ttlMs) {
  const cache = caches.default;
  const req = new Request(key);
  const hit = await cache.match(req);
  if (hit) {
    const savedAt = Number(hit.headers.get("x-in-authority-cached-at") || 0);
    if (savedAt && Date.now() - savedAt < ttlMs) return hit;
  }
  const response = await fetch(url, { headers: { accept: "application/json" } });
  if (!response.ok) throw new Error(`Upstream returned ${response.status}`);
  const headers = new Headers(response.headers);
  headers.set("x-in-authority-cached-at", String(Date.now()));
  headers.set("cache-control", "no-store");
  const copy = new Response(response.body, { status: response.status, headers });
  await cache.put(req, copy.clone());
  return copy;
}

function addSecurityHeaders(response) {
  const headers = new Headers(response.headers);
  headers.set("x-content-type-options", "nosniff");
  headers.set("referrer-policy", "strict-origin-when-cross-origin");
  headers.set("permissions-policy", "geolocation=(), microphone=(), camera=()");
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    try {
      if (url.pathname === "/api/health") return json({ ok: true, service: "in-authority" });

      if (url.pathname === "/api/members") {
        const response = await cachedFetch(ROSTER_CACHE_KEY, ROSTER_URL, ROSTER_TTL_MS);
        return json(await response.json());
      }

      if (url.pathname === "/api/reps") {
        const zip = (url.searchParams.get("zip") || "").trim();
        if (!/^\d{5}$/.test(zip)) return json({ error: "A valid 5-digit ZIP code is required." }, 400);
        const apiUrl = `${REPSCONTACT_URL}?zip=${encodeURIComponent(zip)}`;
        const key = `https://in-authority.local/api/reps?zip=${encodeURIComponent(zip)}`;
        const response = await cachedFetch(key, apiUrl, REPS_TTL_MS);
        return json(await response.json());
      }

      return addSecurityHeaders(await env.ASSETS.fetch(request));
    } catch (error) {
      return json({ error: "Service temporarily unavailable." }, 502);
    }
  }
};
