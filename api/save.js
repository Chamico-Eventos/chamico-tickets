// api/save.js — Vercel proxy para iOS
// Usa https built-in (no requiere fetch en Node.js, más confiable)

const https = require('https');

const SHEET_URL = 'https://script.google.com/macros/s/AKfycbxVWEywmYVj59mvdUYhkxhZJOwNxvj5rWZUOtqbi8uCLj3kQiVFRiG5BqunH0zSnO4/exec';

// GET con seguimiento manual de redirects (Apps Script hace 302)
function httpsGet(targetUrl, hops) {
  hops = hops || 0;
  if (hops > 5) return Promise.resolve();
  return new Promise(function(resolve) {
    https.get(targetUrl, function(res) {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        res.resume();
        resolve(httpsGet(res.headers.location, hops + 1));
      } else {
        res.resume();
        resolve();
      }
    }).on('error', function(err) {
      console.error('[proxy] https error:', err.message);
      resolve();
    });
  });
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST')    return res.status(405).json({ error: 'Method not allowed' });

  try {
    const body = req.body;
    const data = typeof body === 'string' ? body : JSON.stringify(body);
    const url  = `${SHEET_URL}?action=save&data=${encodeURIComponent(data)}`;

    console.log('[proxy] forwarding to Apps Script');
    await httpsGet(url);
    console.log('[proxy] done');

    return res.status(200).json({ status: 'ok' });
  } catch (err) {
    console.error('[proxy] error:', err.message);
    return res.status(500).json({ status: 'error', message: err.message });
  }
};
