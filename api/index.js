const fs = require('fs');
const path = require('path');
const url = require('url');

const DATA_DIR = path.join(process.cwd(), 'data');
const TMP_DIR = '/tmp';

const PROJECTS_FILE = path.join(DATA_DIR, 'projects.json');
const CERTS_FILE = path.join(DATA_DIR, 'certs.json');
const MESSAGES_FILE = path.join(DATA_DIR, 'contact_messages.json');
const ADMIN_CONFIG_FILE = path.join(DATA_DIR, 'admin_config.json');

function readJson(filePath, defaultValue = []) {
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    try {
      const tmpPath = path.join(TMP_DIR, path.basename(filePath));
      const rawTmp = fs.readFileSync(tmpPath, 'utf8');
      return JSON.parse(rawTmp);
    } catch (e) {
      return defaultValue;
    }
  }
}

function writeJson(filePath, data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    try {
      const tmpPath = path.join(TMP_DIR, path.basename(filePath));
      fs.writeFileSync(tmpPath, JSON.stringify(data, null, 2), 'utf8');
    } catch (e) {}
  }
}

function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

function sendJson(res, statusCode, body) {
  setCors(res);
  res.status ? res.status(statusCode).json(body) : (res.statusCode = statusCode, res.setHeader('Content-Type', 'application/json'), res.end(JSON.stringify(body)));
}

module.exports = async (req, res) => {
  setCors(res);
  if (req.method === 'OPTIONS') {
    return res.status ? res.status(204).end() : (res.statusCode = 204, res.end());
  }

  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const method = req.method;

  // 1. Projects API
  if (pathname === '/api/projects') {
    if (method === 'GET') {
      return sendJson(res, 200, readJson(PROJECTS_FILE, []));
    }
    if (method === 'POST') {
      const payload = req.body || {};
      let projects = readJson(PROJECTS_FILE, []);
      const projId = payload.id;
      if (projId) {
        const idx = projects.findIndex(p => p.id === projId);
        if (idx !== -1) projects[idx] = { ...projects[idx], ...payload };
        else projects.push(payload);
      } else {
        payload.id = 'p_' + Date.now();
        projects.push(payload);
      }
      writeJson(PROJECTS_FILE, projects);
      return sendJson(res, 200, { success: true, project: payload, projects });
    }
  }

  if (pathname.startsWith('/api/projects/') && method === 'DELETE') {
    const id = pathname.split('/')[3];
    let projects = readJson(PROJECTS_FILE, []);
    projects = projects.filter(p => p.id !== id);
    writeJson(PROJECTS_FILE, projects);
    return sendJson(res, 200, { success: true, id, projects });
  }

  // 2. Certs API
  if (pathname === '/api/certs') {
    if (method === 'GET') {
      return sendJson(res, 200, readJson(CERTS_FILE, []));
    }
    if (method === 'POST') {
      const payload = req.body || {};
      let certs = readJson(CERTS_FILE, []);
      const certId = payload.id;
      if (certId) {
        const idx = certs.findIndex(c => c.id === certId);
        if (idx !== -1) certs[idx] = { ...certs[idx], ...payload };
        else certs.push(payload);
      } else {
        payload.id = 'c_' + Date.now();
        certs.push(payload);
      }
      writeJson(CERTS_FILE, certs);
      return sendJson(res, 200, { success: true, cert: payload, certs });
    }
  }

  if (pathname.startsWith('/api/certs/') && method === 'DELETE') {
    const id = pathname.split('/')[3];
    let certs = readJson(CERTS_FILE, []);
    certs = certs.filter(c => c.id !== id);
    writeJson(CERTS_FILE, certs);
    return sendJson(res, 200, { success: true, id, certs });
  }

  // 3. Config API
  if (pathname === '/api/config') {
    let cfg = readJson(ADMIN_CONFIG_FILE, { passcode: 'arjun2026', resumeUrl: '/uploads/resume.pdf', portfolioUrl: 'https://arjunportfolio.super.site', profilePhotoUrl: '', showProfilePhoto: false });
    if (method === 'GET') {
      return sendJson(res, 200, cfg);
    }
    if (method === 'POST') {
      const payload = req.body || {};
      if (payload.portfolioUrl !== undefined) cfg.portfolioUrl = payload.portfolioUrl;
      if (payload.resumeUrl !== undefined) cfg.resumeUrl = payload.resumeUrl;
      if (payload.profilePhotoUrl !== undefined) cfg.profilePhotoUrl = payload.profilePhotoUrl;
      if (payload.showProfilePhoto !== undefined) cfg.showProfilePhoto = Boolean(payload.showProfilePhoto);
      writeJson(ADMIN_CONFIG_FILE, cfg);
      return sendJson(res, 200, { success: true, config: cfg });
    }
  }

  // 4. Contact API
  if (pathname === '/api/contact' && method === 'POST') {
    const payload = req.body || {};
    payload.timestamp = payload.timestamp || new Date().toISOString();
    let messages = readJson(MESSAGES_FILE, []);
    messages.push(payload);
    writeJson(MESSAGES_FILE, messages);
    return sendJson(res, 200, { success: true, message: 'Message saved' });
  }

  // 5. Messages API
  if (pathname === '/api/messages' && method === 'GET') {
    return sendJson(res, 200, readJson(MESSAGES_FILE, []));
  }

  // 6. Admin Auth API
  if (pathname === '/api/admin/verify' && method === 'POST') {
    const passcode = (req.body && req.body.passcode) || '';
    const cfg = readJson(ADMIN_CONFIG_FILE, { passcode: 'arjun2026' });
    if (passcode === cfg.passcode) {
      return sendJson(res, 200, { success: true, token: 'admin_tok_' + Date.now() });
    }
    return sendJson(res, 401, { success: false, error: 'Invalid passcode' });
  }

  // 7. Upload API
  if (pathname === '/api/upload' && method === 'POST') {
    const payload = req.body || {};
    const base64Str = payload.base64 || '';
    if (!base64Str) return sendJson(res, 400, { error: 'Missing base64 data' });

    return sendJson(res, 200, {
      success: true,
      fileUrl: base64Str,
      filename: payload.filename || 'upload.bin'
    });
  }

  return sendJson(res, 404, { error: 'API route not found' });
};
