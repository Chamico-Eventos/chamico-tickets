// api/save.js — Vercel proxy para iOS
// Node.js 18+ tiene fetch global que sigue redirects automáticamente

const SHEET_URL = 'https://script.google.com/macros/s/AKfycbxVWEywmYVj59mvdUYhkxhZJOwNxvj5rWZUOtqbi8uCLj3kQiVFRiG5BqunH0zSnO4/exec';

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const body   = req.body || {};
    const data   = typeof body === 'string' ? body : JSON.stringify(body);
    const url    = `${SHEET_URL}?action=save&data=${encodeURIComponent(data)}`;

    console.log('[proxy] calling Apps Script, data length:', data.length);

    // fetch global disponible en Node 18+ — sigue redirects 302 automáticamente
    const r = await fetch(url, {
      method:   'GET',
      redirect: 'follow',
      headers:  { 'User-Agent': 'Mozilla/5.0 (compatible; Vercel-Proxy)' },
    });

    console.log('[proxy] Apps Script responded:', r.status);
    return res.status(200).json({ status: 'ok', upstream: r.status });

  } catch (err) {
    console.error('[proxy] error:', err.message);
    return res.status(500).json({ status: 'error', message: err.message });
  }
};
