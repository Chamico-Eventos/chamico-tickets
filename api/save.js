// api/save.js — Posts data to Apps Script doPost (no redirect chain)
const https = require('https');

const SHEET_URL = 'https://script.google.com/macros/s/AKfycbyq687XCjn2YbtAjLHvrWE0RZ5u-Tyijhoa_5nWHkJorE62_G1xYLEvEmx3dTA9Zs9k/exec';

function post(targetUrl, body, hops) {
  hops = hops || 0;
  if (hops > 6) return Promise.resolve('too many redirects');
  return new Promise(function(resolve) {
    try {
      var parsed  = new URL(targetUrl);
      var payload = JSON.stringify(body);
      var opts = {
        hostname: parsed.hostname,
        port:     443,
        path:     parsed.pathname + parsed.search,
        method:   'POST',
        headers: {
          'Content-Type':   'application/json',
          'Content-Length': Buffer.byteLength(payload),
          'User-Agent':     'Mozilla/5.0',
        }
      };
      var req = https.request(opts, function(res) {
        res.resume();
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          var next = new URL(res.headers.location, targetUrl).toString();
          console.log('[save] redirect', hops, '->', res.statusCode, next.substring(0, 80));
          // Apps Script redirects POST to GET on the final URL — follow with GET
          resolve(get(next, hops + 1));
        } else {
          console.log('[save] final status:', res.statusCode);
          resolve('ok:' + res.statusCode);
        }
      });
      req.on('error', function(e) {
        console.error('[save] req error:', e.message);
        resolve('error:' + e.message);
      });
      req.setTimeout(10000, function() { req.destroy(); resolve('timeout'); });
      req.write(payload);
      req.end();
    } catch(e) {
      console.error('[save] catch:', e.message);
      resolve('exception:' + e.message);
    }
  });
}

// Follow redirects with GET (Apps Script final URL after auth redirect)
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
        headers:  { 'Accept': 'application/json', 'User-Agent': 'Mozilla/5.0' }
      };
      var req = https.request(opts, function(res) {
        res.resume();
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          var next = new URL(res.headers.location, targetUrl).toString();
          console.log('[save] get redirect', hops, '->', res.statusCode);
          resolve(get(next, hops + 1));
        } else {
          console.log('[save] get final status:', res.statusCode);
          resolve('ok:' + res.statusCode);
        }
      });
      req.on('error', function(e) { resolve('error:' + e.message); });
      req.setTimeout(10000, function() { req.destroy(); resolve('timeout'); });
      req.end();
    } catch(e) {
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
    var body = req.body || {};
    if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch(e) {}
    }

    // Tag with action so Apps Script doPost router knows this is a ticket save
    body.action = 'save_ticket';
    console.log('[save] posting row for:', body['Nombre'] || body['N° ticket en orden'] || '?');
    var result = await post(SHEET_URL, body);
    console.log('[save] result:', result);
    return res.status(200).json({ status: 'ok', result: result });
  } catch(e) {
    console.error('[save] handler error:', e.message);
    return res.status(500).json({ status: 'error', message: e.message });
  }
};
