/**
 * PORTFOLIO BACKEND SERVER - ARJUN KRISHNA B
 * Zero-dependency Node.js HTTP server supporting REST APIs, Admin Auth, File Storage & Resume PDF Uploads.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = __dirname;
const DATA_DIR = path.join(__dirname, 'data');
const UPLOADS_DIR = path.join(__dirname, 'uploads');

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

const PROJECTS_FILE = path.join(DATA_DIR, 'projects.json');
const CERTS_FILE = path.join(DATA_DIR, 'certs.json');
const MESSAGES_FILE = path.join(DATA_DIR, 'contact_messages.json');
const ADMIN_CONFIG_FILE = path.join(DATA_DIR, 'admin_config.json');

if (!fs.existsSync(PROJECTS_FILE)) fs.writeFileSync(PROJECTS_FILE, '[]', 'utf8');
if (!fs.existsSync(CERTS_FILE)) fs.writeFileSync(CERTS_FILE, '[]', 'utf8');
if (!fs.existsSync(MESSAGES_FILE)) fs.writeFileSync(MESSAGES_FILE, '[]', 'utf8');
if (!fs.existsSync(ADMIN_CONFIG_FILE)) {
  fs.writeFileSync(ADMIN_CONFIG_FILE, JSON.stringify({ passcode: "arjun2026", resumeUrl: "/uploads/resume.pdf" }, null, 2), 'utf8');
}

function readJson(filePath, defaultValue = []) {
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    return defaultValue;
  }
}

function writeJson(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
}

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.pdf': 'application/pdf',
  '.ico': 'image/x-icon'
};

function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

function sendJson(res, statusCode, body) {
  setCors(res);
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(body));
}

function getRequestBody(req) {
  return new Promise((resolve, reject) => {
    let chunks = [];
    req.on('data', chunk => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const method = req.method;

  if (method === 'OPTIONS') {
    setCors(res);
    res.writeHead(204);
    return res.end();
  }

  // GET /api/projects
  if (pathname === '/api/projects' && method === 'GET') {
    return sendJson(res, 200, readJson(PROJECTS_FILE, []));
  }

  // GET /api/certs
  if (pathname === '/api/certs' && method === 'GET') {
    return sendJson(res, 200, readJson(CERTS_FILE, []));
  }

  // GET /api/resume
  if (pathname === '/api/resume' && method === 'GET') {
    const cfg = readJson(ADMIN_CONFIG_FILE, { resumeUrl: "/uploads/resume.pdf", portfolioUrl: "https://arjunportfolio.super.site" });
    return sendJson(res, 200, { resumeUrl: cfg.resumeUrl || "/uploads/resume.pdf" });
  }

  // GET /api/messages
  if (pathname === '/api/messages' && method === 'GET') {
    return sendJson(res, 200, readJson(MESSAGES_FILE, []));
  }

  // GET /api/config
  if (pathname === '/api/config' && method === 'GET') {
    const cfg = readJson(ADMIN_CONFIG_FILE, { resumeUrl: "/uploads/resume.pdf" });
    return sendJson(res, 200, {
      resumeUrl: cfg.resumeUrl || "/uploads/resume.pdf"
    });
  }

  // POST ENDPOINTS
  if (method === 'POST') {
    try {
      const buffer = await getRequestBody(req);
      const payload = buffer.length ? JSON.parse(buffer.toString('utf8')) : {};

      if (pathname === '/api/config') {
        const cfg = readJson(ADMIN_CONFIG_FILE, {});
        if (payload.portfolioUrl) cfg.portfolioUrl = payload.portfolioUrl.trim();
        if (payload.resumeUrl) cfg.resumeUrl = payload.resumeUrl.trim();
        writeJson(ADMIN_CONFIG_FILE, cfg);
        return sendJson(res, 200, { success: true, config: cfg });
      }

      // Admin Auth Verification
      if (pathname === '/api/admin/verify') {
        const input = (payload.passcode || '').trim();
        const cfg = readJson(ADMIN_CONFIG_FILE, { passcode: "arjun2026" });
        if (input === cfg.passcode) {
          return sendJson(res, 200, { success: true, token: `admin_tok_${Date.now()}` });
        } else {
          return sendJson(res, 401, { success: false, error: 'Invalid admin passcode' });
        }
      }

      // Change Admin Passcode
      if (pathname === '/api/admin/change-passcode') {
        const curr = (payload.currentPasscode || '').trim();
        const nextPass = (payload.newPasscode || '').trim();
        const cfg = readJson(ADMIN_CONFIG_FILE, { passcode: "arjun2026" });

        if (!nextPass || nextPass.length < 4) {
          return sendJson(res, 400, { error: 'New passcode must be at least 4 characters' });
        }
        if (curr !== cfg.passcode) {
          return sendJson(res, 401, { error: 'Incorrect current passcode' });
        }

        cfg.passcode = nextPass;
        writeJson(ADMIN_CONFIG_FILE, cfg);
        return sendJson(res, 200, { success: true, message: 'Passcode changed successfully' });
      }

      // Upload Resume PDF
      if (pathname === '/api/resume') {
        if (!payload.base64) return sendJson(res, 400, { error: 'Missing base64 data' });
        const savePath = path.join(UPLOADS_DIR, 'resume.pdf');
        const base64Data = payload.base64.replace(/^data:[^;]+;base64,/, '');
        fs.writeFileSync(savePath, Buffer.from(base64Data, 'base64'));

        const resumeUrl = `/uploads/resume.pdf?v=${Date.now()}`;
        const cfg = readJson(ADMIN_CONFIG_FILE, {});
        cfg.resumeUrl = resumeUrl;
        writeJson(ADMIN_CONFIG_FILE, cfg);

        return sendJson(res, 200, { success: true, resumeUrl });
      }

      // Save Project
      if (pathname === '/api/projects') {
        let projects = readJson(PROJECTS_FILE, []);
        if (payload.id) {
          const idx = projects.findIndex(p => p.id === payload.id);
          if (idx !== -1) projects[idx] = { ...projects[idx], ...payload };
          else projects.push(payload);
        } else {
          payload.id = 'p_' + Date.now();
          projects.push(payload);
        }
        writeJson(PROJECTS_FILE, projects);
        return sendJson(res, 200, { success: true, project: payload, projects });
      }

      // Save Certificate
      if (pathname === '/api/certs') {
        let certs = readJson(CERTS_FILE, []);
        if (payload.id) {
          const idx = certs.findIndex(c => c.id === payload.id);
          if (idx !== -1) certs[idx] = { ...certs[idx], ...payload };
          else certs.push(payload);
        } else {
          payload.id = 'c_' + Date.now();
          certs.push(payload);
        }
        writeJson(CERTS_FILE, certs);
        return sendJson(res, 200, { success: true, cert: payload, certs });
      }

      // Upload File
      if (pathname === '/api/upload') {
        if (!payload.base64) return sendJson(res, 400, { error: 'Missing base64 data' });
        const ext = path.extname(payload.filename || '') || '.bin';
        const cleanName = path.basename(payload.filename || 'file', ext).replace(/[^a-zA-Z0-9_-]/g, '_');
        const uniqueFilename = `${cleanName}_${Date.now()}${ext}`;
        const savePath = path.join(UPLOADS_DIR, uniqueFilename);
        const base64Data = payload.base64.replace(/^data:[^;]+;base64,/, '');

        fs.writeFileSync(savePath, Buffer.from(base64Data, 'base64'));
        const fileUrl = `/uploads/${uniqueFilename}`;

        if (payload.certId) {
          let certs = readJson(CERTS_FILE, []);
          const idx = certs.findIndex(c => c.id === payload.certId);
          if (idx !== -1) {
            certs[idx].fileUrl = fileUrl;
            writeJson(CERTS_FILE, certs);
          }
        }
        return sendJson(res, 200, { success: true, fileUrl, filename: uniqueFilename });
      }

      // Contact Form
      if (pathname === '/api/contact') {
        payload.timestamp = new Date().toISOString();
        let messages = readJson(MESSAGES_FILE, []);
        messages.push(payload);
        writeJson(MESSAGES_FILE, messages);
        return sendJson(res, 200, { success: true, message: 'Message saved' });
      }
    } catch (err) {
      return sendJson(res, 500, { error: err.message });
    }
  }

  // DELETE ENDPOINTS
  if (pathname.startsWith('/api/projects/') && method === 'DELETE') {
    const id = pathname.split('/')[3];
    let projects = readJson(PROJECTS_FILE, []).filter(p => p.id !== id);
    writeJson(PROJECTS_FILE, projects);
    return sendJson(res, 200, { success: true, projects });
  }

  if (pathname.startsWith('/api/certs/') && method === 'DELETE') {
    const id = pathname.split('/')[3];
    let certs = readJson(CERTS_FILE, []).filter(c => c.id !== id);
    writeJson(CERTS_FILE, certs);
    return sendJson(res, 200, { success: true, certs });
  }

  // STATIC FILE SERVING
  let safePath = path.normalize(pathname).replace(/^(\.\.[\/\\])+/, '');
  if (safePath === '/' || safePath === '\\') safePath = '/index.html';
  const filePath = path.join(PUBLIC_DIR, safePath);

  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403);
    return res.end('Forbidden');
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/html' });
      return res.end('<h1>404 - Not Found</h1>');
    }
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    setCors(res);
    res.writeHead(200, { 'Content-Type': contentType });
    fs.createReadStream(filePath).pipe(res);
  });
});

server.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(` PORTFOLIO BACKEND SERVER RUNNING AT: http://localhost:${PORT}`);
  console.log(`=======================================================`);
});
