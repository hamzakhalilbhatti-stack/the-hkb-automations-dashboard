/**
 * FlowPulse — Cloudflare Worker Proxy for n8n Cloud API
 * ─────────────────────────────────────────────────────
 * This worker sits between your dashboard and n8n Cloud API.
 * It handles CORS so your GitHub Pages site can fetch live data.
 *
 * HOW TO DEPLOY (5 minutes):
 * 1. Go to https://workers.cloudflare.com and sign up (free)
 * 2. Click "Create Worker"
 * 3. Delete all default code and paste this entire file
 * 4. Click "Save and Deploy"
 * 5. Copy your worker URL (e.g. https://flowpulse.yourname.workers.dev)
 * 6. Paste that URL into the dashboard settings
 */

const ALLOWED_ORIGINS = [
  'https://yourusername.github.io',   // ← replace with your GitHub Pages URL
  'http://localhost:3000',             // for local testing
  'http://127.0.0.1:5500',            // VS Code Live Server
];

export default {
  async fetch(request, env, ctx) {
    const origin = request.headers.get('Origin') || '';

    // ── CORS preflight ──────────────────────────────────────────────────────
    if (request.method === 'OPTIONS') {
      return corsResponse(null, 204, origin);
    }

    // ── Only allow GET and POST ─────────────────────────────────────────────
    if (!['GET', 'POST'].includes(request.method)) {
      return corsResponse(JSON.stringify({ error: 'Method not allowed' }), 405, origin);
    }

    // ── Parse request body ──────────────────────────────────────────────────
    let body;
    try {
      body = await request.json();
    } catch {
      return corsResponse(JSON.stringify({ error: 'Invalid JSON body' }), 400, origin);
    }

    const { apiKey, instanceUrl, endpoint } = body;

    if (!apiKey || !instanceUrl || !endpoint) {
      return corsResponse(
        JSON.stringify({ error: 'Missing required fields: apiKey, instanceUrl, endpoint' }),
        400, origin
      );
    }

    // ── Validate instanceUrl format ─────────────────────────────────────────
    if (!instanceUrl.includes('n8n.cloud') && !instanceUrl.includes('localhost')) {
      return corsResponse(JSON.stringify({ error: 'Invalid n8n instance URL' }), 400, origin);
    }

    // ── Build target URL ────────────────────────────────────────────────────
    const cleanBase = instanceUrl.replace(/\/$/, '');
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const targetUrl = `${cleanBase}/api/v1${cleanEndpoint}`;

    // ── Forward request to n8n Cloud ────────────────────────────────────────
    try {
      const n8nResponse = await fetch(targetUrl, {
        method: 'GET',
        headers: {
          'X-N8N-API-KEY': apiKey,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      const data = await n8nResponse.text();

      return corsResponse(data, n8nResponse.status, origin, {
        'Content-Type': 'application/json',
        'X-Proxy-Status': 'ok',
      });

    } catch (err) {
      return corsResponse(
        JSON.stringify({ error: 'Failed to reach n8n instance', details: err.message }),
        502, origin
      );
    }
  }
};

// ── Helper: build response with CORS headers ─────────────────────────────────
function corsResponse(body, status, origin, extraHeaders = {}) {
  const isAllowed = ALLOWED_ORIGINS.some(o => origin.startsWith(o)) || origin === '';
  return new Response(body, {
    status,
    headers: {
      'Access-Control-Allow-Origin': isAllowed ? origin : ALLOWED_ORIGINS[0],
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
      ...extraHeaders,
    },
  });
}
