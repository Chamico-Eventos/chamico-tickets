// ─────────────────────────────────────────────────────────────────
//  Vercel Proxy — api/save.js
//  Recibe datos del browser (mismo dominio → sin bloqueos iOS)
//  y los reenvía a Google Apps Script desde el servidor.
//  Subir a GitHub en la carpeta "api/" junto al index.html
// ─────────────────────────────────────────────────────────────────

const SHEET_URL = 'https://script.google.com/macros/s/AKfycbxVWEywmYVj59mvdUYhkxhZJOwNxvj5rWZUOtqbi8uCLj3kQiVFRiG5BqunH0zSnO4/exec';

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST')    return res.status(405).json({ error: 'Method not allowed' });

  try {
    const data = typeof req.body === 'string'
      ? req.body
      : JSON.stringify(req.body);

    const url = `${SHEET_URL}?action=save&data=${encodeURIComponent(data)}`;
    await fetch(url, { method: 'GET', redirect: 'follow' });

    return res.status(200).json({ status: 'ok' });
  } catch (err) {
    console.error('[save-proxy]', err.message);
    return res.status(200).json({ status: 'ok' });
  }
};
