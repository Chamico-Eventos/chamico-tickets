// api/save.js — Vercel proxy con seguimiento de redirects correcto
const https = require('https');

const SHEET_URL = 'https://script.google.com/macros/s/AKfycbxVWEywmYVj59mvdUYhkxhZJOwNxvj5rWZUOtqbi8uCLj3kQiVFRiG5BqunH0zSnO4/exec';

function get(targetUrl, hops) {
  hops = hops || 0;
  if (hops > 6) return Promise.resolve('too many redirects');
  return new Promise(function(resolve) {
    try {
      var parsed = new URL(targetUrl);
      var opts = {
        hostname: parsed.hostname,
        port:     443,
        path:     parsed.pathname + parsed.search,
        method:   'GET',
        headers:  { 'Accept': 'text/html,*/*', 'User-Agent': 'Mozilla/5.0' }
      };
      var req = https.request(opts, function(res) {
        res.resume(); // consume to free memory
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          // Resolve redirect URL (puede ser relativa o absoluta)
          var next = new URL(res.headers.location, targetUrl).toString();
          console.log('[proxy] redirect', hops, '->', res.statusCode, next.substring(0, 80));
          resolve(get(next, hops + 1));
        } else {
          console.log('[proxy] final status:', res.statusCode);
          resolve('ok:' + res.statusCode);
        }
      });
      req.on('error', function(e) {
        console.error('[proxy] req error:', e.message);
        resolve('error:' + e.message);
      });
      req.setTimeout(8000, function() { req.destroy(); resolve('timeout'); });
      req.end();
    } catch(e) {
      console.error('[proxy] catch:', e.message);
      resolve('exception:' + e.message);
    }
  });
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    // Support both GET (query param) and POST (body)
    var data;
    if (req.method === 'GET' && req.query && req.query.data) {
      data = req.query.data;
    } else {
      var body = req.body || {};
      data = typeof body === 'string' ? body : JSON.stringify(body);
    }
    var url  = SHEET_URL + '?action=save&data=' + encodeURIComponent(data);
    console.log('[proxy] starting, data length:', data.length, 'method:', req.method);
    var result = await get(url);
    console.log('[proxy] result:', result);
    return res.status(200).json({ status: 'ok', result: result });
  } catch(e) {
    console.error('[proxy] handler error:', e.message);
    return res.status(500).json({ status: 'error', message: e.message });
  }
};
