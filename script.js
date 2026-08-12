/* ==========================================================================
   ARJUN KRISHNA B — PORTFOLIO DYNAMIC SYSTEM ENGINE (CRUD & MEDIA VIEWER)
   ========================================================================== */

// GLOBAL STATE
let adminMode = false;
let projectsData = [];
let certsData = [];

// INITIAL DEFAULT PROJECTS DATASET
const DEFAULT_PROJECTS = [
  {
    id: 'p1',
    title: 'Fake Job Posting Detection Using ML & NLP',
    category: 'ml python',
    desc: 'Developed an intelligent fraud detection system to classify job postings as genuine or fraudulent using Machine Learning & Natural Language Processing. Implemented TF-IDF & CountVectorizer feature extraction with rigorous F1-score testing.',
    tags: ['PYTHON', 'SCIKIT-LEARN', 'PANDAS', 'NLTK', 'TF-IDF', 'JUPYTER'],
    thumbnail: '',
    link: 'https://github me'
  },
  {
    id: 'p2',
    title: 'Vulnerability Scanner Using Python',
    category: 'security python',
    desc: 'Developed a high-concurrency Python vulnerability scanner for automated host discovery, multi-threaded port scanning, service enumeration, and CVE triage. Generates structured JSON reports for risk mitigation.',
    tags: ['PYTHON', 'NMAP', 'SOCKETS', 'TCP/IP', 'THREADING', 'LINUX'],
    thumbnail: '',
    link: ''
  },
  {
    id: 'p3',
    title: 'Network Traffic Analyzer Using Python',
    category: 'security python',
    desc: 'Built a real-time network protocol analyzer to capture and parse communications across TCP, UDP, ICMP, DNS, and HTTP protocols. Performs deep packet inspection (DPI), payload inspection, and anomaly detection.',
    tags: ['PYTHON', 'SCAPY', 'WIRESHARK', 'PANDAS', 'MATPLOTLIB', 'TCP/IP'],
    thumbnail: '',
    link: ''
  },
  {
    id: 'p4',
    title: 'AI Threat Detection System',
    category: 'ml security python',
    desc: 'Constructed an AI-driven threat monitoring system that automatically detects malicious telemetry patterns in enterprise traffic data. Features Isolation Forest anomaly detection models and an interactive Streamlit dashboard.',
    tags: ['PYTHON', 'SCIKIT-LEARN', 'STREAMLIT', 'ANOMALY_DETECTION', 'NUMPY'],
    thumbnail: '',
    link: ''
  },
  {
    id: 'p5',
    title: 'Responsive Web UI & Component System',
    category: 'ui',
    desc: 'Designed and built modular, responsive front-end user interface components and layout systems. Developed during internship at Techgentsia Software Technologies, focusing on usability, cross-browser compatibility, and UI testing.',
    tags: ['HTML5', 'CSS3', 'JAVASCRIPT', 'UI/UX DESIGN', 'RESPONSIVE', 'COMPONENT_LIB'],
    thumbnail: '',
    link: ''
  },
  {
    id: 'p6',
    title: 'Custom Web UI Project Slot',
    category: 'ui',
    desc: 'Reserved custom slot for your additional UI/UX design or web project! Click Edit to customize this title, description, thumbnail image, tech tags, and live URL.',
    tags: ['UI/UX DESIGN', 'WEB APP', 'FRONTEND', 'CUSTOM_SLOT'],
    thumbnail: '',
    link: ''
  }
];

// INITIAL DEFAULT CERTIFICATIONS DATASET
const DEFAULT_CERTS = [
  {
    id: 'c1',
    title: 'Junior Cybersecurity Analyst Career Path',
    issuer: 'Cisco Networking Academy',
    date: '2026',
    fileUrl: ''
  },
  {
    id: 'c2',
    title: 'Endpoint Security',
    issuer: 'Oracle Cloud Infrastructure',
    date: '2025',
    fileUrl: ''
  },
  {
    id: 'c3',
    title: 'Certified AI Foundations Associate',
    issuer: 'Oracle Certified Professional',
    date: '2025',
    fileUrl: ''
  },
  {
    id: 'c4',
    title: 'Getting Started with Cybersecurity',
    issuer: 'IBM',
    date: '2024',
    fileUrl: ''
  },
  {
    id: 'c5',
    title: 'Network Support and Security',
    issuer: 'Cisco / Industry Credential',
    date: '2025',
    fileUrl: ''
  },
  {
    id: 'c6',
    title: 'OCI Certified Foundations Associate',
    issuer: 'Oracle Cloud Infrastructure',
    date: '2025',
    fileUrl: ''
  },
  {
    id: 'c7',
    title: 'Cyber Threat Management',
    issuer: 'Cisco / Security Operations',
    date: '2025',
    fileUrl: ''
  },
  {
    id: 'c8',
    title: 'Oracle AI Database Certified Associate',
    issuer: 'Oracle',
    date: '2025',
    fileUrl: ''
  }
];

document.addEventListener('DOMContentLoaded', () => {
  initTypewriter();
  initLiveClock();
  initPacketCounterAnimation();
  initNocTerminalStream();
  initThemeToggle();
  initAdminToggle();
  loadDatasets();
  initSystemMapInteractions();
  initProjectFilters();
  initTerminal();
});

/* --------------------------------------------------------------------------
   01. DATASET INITIALIZATION & PERSISTENCE WITH BACKEND API SYNC
   -------------------------------------------------------------------------- */
async function loadDatasets() {
  try {
    const projRes = await fetch('/api/projects');
    if (projRes.ok) {
      projectsData = await projRes.json();
    } else {
      throw new Error('Projects API offline');
    }
  } catch (e) {
    const savedProjects = localStorage.getItem('arjun_portfolio_projects_v2');
    if (savedProjects) {
      try { projectsData = JSON.parse(savedProjects); } catch (err) { projectsData = DEFAULT_PROJECTS; }
    } else {
      projectsData = DEFAULT_PROJECTS;
    }
  }

  try {
    const certRes = await fetch('/api/certs');
    if (certRes.ok) {
      certsData = await certRes.json();
    } else {
      throw new Error('Certs API offline');
    }
  } catch (e) {
    const savedCerts = localStorage.getItem('arjun_portfolio_certs_v2');
    if (savedCerts) {
      try { certsData = JSON.parse(savedCerts); } catch (err) { certsData = DEFAULT_CERTS; }
    } else {
      certsData = DEFAULT_CERTS;
    }
  }

  try {
    const configRes = await fetch('/api/config');
    if (configRes.ok) {
      const configData = await configRes.json();
      globalConfig = { ...globalConfig, ...configData };
      const heroResume = document.getElementById('heroResumeBtn');
      const heroPort = document.getElementById('heroPortfolioBtn');
      if (heroResume && configData.resumeUrl) heroResume.href = configData.resumeUrl;
      if (heroPort && configData.portfolioUrl) heroPort.href = configData.portfolioUrl;
    }
  } catch (e) {
    const savedConfig = localStorage.getItem('arjun_portfolio_config_v1');
    if (savedConfig) {
      try { globalConfig = JSON.parse(savedConfig); } catch (err) {}
    }
  }

  renderProjects();
  renderCerts();
  renderProfilePhoto();
  updateStatsCounters();
}

let globalConfig = {
  resumeUrl: '/uploads/resume.pdf',
  portfolioUrl: 'https://arjunportfolio.super.site',
  profilePhotoUrl: '',
  showProfilePhoto: false
};

function renderProfilePhoto() {
  const containerEl = document.querySelector('.profile-card-col');
  const imgEl = document.getElementById('whoamiProfileImg');
  const fallbackEl = document.getElementById('whoamiProfileFallback');
  const btnEl = document.getElementById('changeProfilePhotoBtn');

  const navBtnText = document.getElementById('togglePhotoBtnText');
  const navBtn = document.getElementById('togglePhotoDisplayBtn');
  if (navBtn) navBtn.style.display = adminMode ? 'inline-flex' : 'none';
  if (navBtnText) navBtnText.textContent = globalConfig.showProfilePhoto ? 'PHOTO: ON' : 'PHOTO: OFF';

  if (!containerEl) return;

  // HIDE PROFILE PHOTO CONTAINER UNLESS ENABLED BY ADMIN (OR IN ADMIN MODE FOR MANAGEMENT)
  const isVisible = Boolean(globalConfig.showProfilePhoto) || adminMode;

  if (isVisible) {
    containerEl.style.display = 'flex';

    if (btnEl) {
      btnEl.style.display = adminMode ? 'inline-block' : 'none';
    }

    if (imgEl && fallbackEl) {
      if (globalConfig.profilePhotoUrl) {
        const photoUrl = globalConfig.profilePhotoUrl.startsWith('data:')
          ? globalConfig.profilePhotoUrl
          : `${globalConfig.profilePhotoUrl}${globalConfig.profilePhotoUrl.includes('?') ? '&' : '?'}v=${Date.now()}`;
        imgEl.src = photoUrl;
        imgEl.style.display = 'block';
        fallbackEl.style.display = 'none';
      } else {
        imgEl.style.display = 'none';
        fallbackEl.style.display = 'flex';
      }
    }
  } else {
    containerEl.style.display = 'none';
  }
}

async function toggleProfilePhotoDisplay() {
  globalConfig.showProfilePhoto = !globalConfig.showProfilePhoto;

  try {
    const res = await fetch('/api/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ showProfilePhoto: globalConfig.showProfilePhoto })
    });
    if (res.ok) {
      const data = await res.json();
      if (data.config) globalConfig = { ...globalConfig, ...data.config };
    }
  } catch (err) {}

  localStorage.setItem('arjun_portfolio_config_v1', JSON.stringify(globalConfig));
  renderProfilePhoto();
  alert(`✓ Profile photo option in WHOAMI section is now ${globalConfig.showProfilePhoto ? 'ENABLED (VISIBLE)' : 'DISABLED (HIDDEN)'}!`);
}

function triggerProfilePhotoUpload() {
  const inputEl = document.getElementById('profilePhotoFileInput');
  if (inputEl) inputEl.click();
}

async function handleProfilePhotoFileUpload(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = async function(evt) {
    const base64Data = evt.target.result;
    let newPhotoUrl = base64Data;

    try {
      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: file.name, base64: base64Data })
      });

      if (uploadRes.ok) {
        const uploadData = await uploadRes.json();
        newPhotoUrl = uploadData.fileUrl;
      }

      const configRes = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profilePhotoUrl: newPhotoUrl })
      });

      if (configRes.ok) {
        const resData = await configRes.json();
        if (resData.config) globalConfig = resData.config;
      } else {
        globalConfig.profilePhotoUrl = newPhotoUrl;
      }
    } catch (err) {
      globalConfig.profilePhotoUrl = base64Data;
    }

    localStorage.setItem('arjun_portfolio_config_v1', JSON.stringify(globalConfig));
    renderProfilePhoto();
    alert('✓ Profile photo updated successfully!');
  };
  reader.readAsDataURL(file);
}

function saveProjectsDataset() {
  localStorage.setItem('arjun_portfolio_projects_v2', JSON.stringify(projectsData));
  renderProjects();
  updateStatsCounters();
}

function saveCertsDataset() {
  localStorage.setItem('arjun_portfolio_certs_v2', JSON.stringify(certsData));
  renderCerts();
  updateStatsCounters();
}

function updateStatsCounters() {
  const projCountEl = document.getElementById('statProjCount');
  const certCountEl = document.getElementById('statCertCount');
  if (projCountEl) projCountEl.textContent = String(projectsData.length).padStart(2, '0');
  if (certCountEl) certCountEl.textContent = String(certsData.length).padStart(2, '0');
}

/* --------------------------------------------------------------------------
   02. TYPEWRITER & LIVE CLOCK
   -------------------------------------------------------------------------- */
function initTypewriter() {
  const target = document.getElementById('typewriterText');
  if (!target) return;
  const text = 'Arjun Krishna B';
  let index = 0;

  function type() {
    if (index < text.length) {
      target.textContent += text.charAt(index);
      index++;
      setTimeout(type, 85);
    }
  }

  setTimeout(type, 200);
}

function initLiveClock() {
  const clockEl = document.getElementById('liveClock');
  if (!clockEl) return;

  function updateClock() {
    const now = new Date();
    clockEl.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
  }

  updateClock();
  setInterval(updateClock, 1000);
}

function initPacketCounterAnimation() {
  const counterEl = document.getElementById('livePacketCounter');
  if (!counterEl) return;

  let packets = 1428950;
  setInterval(() => {
    packets += Math.floor(Math.random() * 45) + 12;
    counterEl.textContent = `PACKET STREAM: ${packets.toLocaleString()} PKTS/S`;
  }, 400);
}

function initNocTerminalStream() {
  const streamEl = document.getElementById('nocTerminalStream');
  if (!streamEl) return;

  const logs = [
    '> [SYS_EXEC] fortigate_inspect --vlan 10 --traffic OK',
    '> [RAW_SOCKET] sniffing eth0 -> captured 256 pkts',
    '> [AI_ENGINE] anomaly_score=0.002 (TRAFFIC NORMAL)',
    '> [CVE_SCANNER] nmap -sV 192.168.1.1 --json export OK',
    '> [SOC_TRIAGE] IPS log correlated -> 0 threat alerts',
    '> [TRAFFIC_DPI] HTTP/2 header stream validated (200 OK)',
    '> [NLP_FRAUD] scikit-learn model precision = 99.4%',
    '> [WEB_UI] Techgentsia responsive DOM render 60 FPS'
  ];

  let index = 0;
  setInterval(() => {
    index = (index + 1) % logs.length;
    streamEl.style.opacity = '0';
    setTimeout(() => {
      streamEl.textContent = logs[index];
      streamEl.style.opacity = '1';
    }, 150);
  }, 2200);
}

/* --------------------------------------------------------------------------
   03. THEME TOGGLE & ADMIN MANAGE MODE
   -------------------------------------------------------------------------- */
function initThemeToggle() {
  const btn = document.getElementById('themeToggleBtn');
  if (!btn) return;

  const savedTheme = localStorage.getItem('arjun_portfolio_theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeButtonText(savedTheme);

  btn.addEventListener('click', () => {
    document.documentElement.classList.add('theme-transition');

    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const nextTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', nextTheme);
    localStorage.setItem('arjun_portfolio_theme', nextTheme);
    updateThemeButtonText(nextTheme);

    setTimeout(() => {
      document.documentElement.classList.remove('theme-transition');
    }, 300);
  });
}

function updateThemeButtonText(theme) {
  const btnText = document.querySelector('#themeToggleBtn .theme-text');
  if (btnText) {
    btnText.textContent = theme === 'dark' ? 'DESIGN: BLACK CYBER' : 'DESIGN: WHITE BLUEPRINT';
  }
}

function initAdminToggle() {
  const savedToken = sessionStorage.getItem('arjun_admin_token');
  if (savedToken) {
    adminMode = true;
    updateAdminUiState();
  }
}

function handleAdminToggleClick() {
  if (adminMode) {
    // Logout Admin Mode
    adminMode = false;
    sessionStorage.removeItem('arjun_admin_token');
    updateAdminUiState();
  } else {
    // Check if valid token exists
    const savedToken = sessionStorage.getItem('arjun_admin_token');
    if (savedToken) {
      adminMode = true;
      updateAdminUiState();
    } else {
      // Prompt Admin Passcode Modal
      document.getElementById('adminPasscodeKey').value = '';
      document.getElementById('adminAuthStatus').textContent = '';
      openModalDirect('adminAuthModal');
    }
  }
}

async function submitAdminPasscode(e) {
  e.preventDefault();
  const inputEl = document.getElementById('adminPasscodeKey');
  const statusEl = document.getElementById('adminAuthStatus');
  const key = inputEl.value.trim();

  if (!key) return;

  statusEl.innerHTML = '<span style="color:#22d3ee;">[+] Verifying cryptographic sudo credentials...</span>';

  try {
    const res = await fetch('/api/admin/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ passcode: key })
    });

    const data = await res.json();
    if (res.ok && data.success) {
      statusEl.innerHTML = '<span style="color:#34d399;">[+] Passcode hash verified. Granting sudo privileges...</span>';
      setTimeout(() => {
        adminMode = true;
        sessionStorage.setItem('arjun_admin_token', data.token);
        updateAdminUiState();
        closeModalDirect('adminAuthModal');
      }, 450);
    } else {
      setTimeout(() => {
        statusEl.innerHTML = `<span style="color:#ef4444;">sudo: 1 incorrect password attempt. ${data.error || 'Access Denied.'}</span>`;
      }, 300);
    }
  } catch (err) {
    if (key === 'arjun2026') {
      statusEl.innerHTML = '<span style="color:#34d399;">[+] Local sudo authentication verified. Access granted.</span>';
      setTimeout(() => {
        adminMode = true;
        sessionStorage.setItem('arjun_admin_token', 'local_tok');
        updateAdminUiState();
        closeModalDirect('adminAuthModal');
      }, 450);
    } else {
      setTimeout(() => {
        statusEl.innerHTML = '<span style="color:#ef4444;">sudo: 1 incorrect password attempt. Access Denied.</span>';
      }, 300);
    }
  }
}

function updateAdminUiState() {
  const btn = document.getElementById('adminToggleBtn');
  const textEl = document.getElementById('adminToggleText');
  const resumeBtn = document.getElementById('uploadResumeBtn');
  const messagesBtn = document.getElementById('viewMessagesBtn');
  const changePassBtn = document.getElementById('changePassBtn');

  const togglePhotoBtn = document.getElementById('togglePhotoDisplayBtn');
  if (btn) btn.classList.toggle('active', adminMode);
  if (textEl) textEl.textContent = adminMode ? 'MANAGE MODE: ON (ADMIN)' : 'MANAGE MODE: OFF';
  if (resumeBtn) resumeBtn.style.display = adminMode ? 'inline-flex' : 'none';
  if (messagesBtn) messagesBtn.style.display = adminMode ? 'inline-flex' : 'none';
  if (changePassBtn) changePassBtn.style.display = adminMode ? 'inline-flex' : 'none';
  if (togglePhotoBtn) togglePhotoBtn.style.display = adminMode ? 'inline-flex' : 'none';

  renderProjects();
  renderCerts();
  renderProfilePhoto();
}

async function openMessagesModal() {
  const bodyEl = document.getElementById('messagesModalBody');
  if (!bodyEl) return;

  bodyEl.innerHTML = '<p style="font-size:0.85rem; color:var(--text-subtle);">Fetching transmitted contact messages...</p>';
  openModalDirect('messagesModal');

  let serverMsgs = [];
  let localMsgs = [];

  try {
    const saved = localStorage.getItem('arjun_contact_messages_v1');
    if (saved) localMsgs = JSON.parse(saved);
  } catch (e) {}

  try {
    const res = await fetch('/api/messages');
    if (res.ok) {
      serverMsgs = await res.json();
    }
  } catch (err) {}

  const combined = [...(Array.isArray(serverMsgs) ? serverMsgs : []), ...(Array.isArray(localMsgs) ? localMsgs : [])];
  const uniqueMap = new Map();
  combined.forEach(m => {
    const key = (m.timestamp || '') + '|' + (m.email || '') + '|' + (m.message || m.msg || '');
    if (!uniqueMap.has(key)) {
      uniqueMap.set(key, m);
    }
  });

  const mergedMsgs = Array.from(uniqueMap.values());

  if (mergedMsgs.length === 0) {
    bodyEl.innerHTML = `
      <div style="text-align:center; padding:24px; color:var(--text-subtle); font-size:0.85rem;">
        [ℹ] No transmitted contact messages received yet.
      </div>
    `;
    return;
  }

  let html = '<div style="display:flex; flex-direction:column; gap:14px;">';
  mergedMsgs.slice().reverse().forEach((msg) => {
    const timeStr = msg.timestamp || new Date().toISOString();
    const contentStr = msg.message || msg.msg || '';
    html += `
      <div style="background:var(--bg-alt); border:1px solid var(--border-light); padding:14px; border-radius:4px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
          <strong style="font-size:0.9rem; color:var(--text-main);">${escapeHtml(msg.name || 'Anonymous')}</strong>
          <span style="font-size:0.75rem; color:var(--text-subtle);">${escapeHtml(timeStr)}</span>
        </div>
        <div style="font-size:0.8rem; color:var(--accent-cyan); margin-bottom:8px;">
          <a href="mailto:${escapeHtml(msg.email)}" style="color:inherit; text-decoration:underline;">${escapeHtml(msg.email || '')}</a>
        </div>
        <div style="font-size:0.85rem; color:var(--text-muted); line-height:1.5; white-space:pre-wrap;">${escapeHtml(contentStr)}</div>
      </div>
    `;
  });
  html += '</div>';
  bodyEl.innerHTML = html;
}

async function submitPortfolioLink(e) {
  e.preventDefault();
  const inputEl = document.getElementById('portfolioUrlInput');
  const statusEl = document.getElementById('portfolioLinkStatus');
  const newUrl = inputEl.value.trim();

  if (!newUrl) return;

  statusEl.textContent = 'Updating portfolio link on backend server...';
  statusEl.style.color = 'var(--text-subtle)';

  try {
    const res = await fetch('/api/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ portfolioUrl: newUrl })
    });
    const data = await res.json();
    if (res.ok && data.success) {
      const heroBtn = document.getElementById('heroPortfolioBtn');
      if (heroBtn) heroBtn.href = newUrl;
      statusEl.textContent = '[✓] Portfolio link updated successfully!';
      statusEl.style.color = 'var(--accent-green-dark)';
      setTimeout(() => closeModalDirect('editPortfolioModal'), 1200);
    } else {
      statusEl.textContent = '[×] Failed to update portfolio link.';
      statusEl.style.color = '#ef4444';
    }
  } catch (err) {
    const heroBtn = document.getElementById('heroPortfolioBtn');
    if (heroBtn) heroBtn.href = newUrl;
    statusEl.textContent = '[✓] Portfolio link updated locally!';
    statusEl.style.color = 'var(--accent-green-dark)';
    setTimeout(() => closeModalDirect('editPortfolioModal'), 1200);
  }
}

function openChangePasscodeModal() {
  document.getElementById('currPasscode').value = '';
  document.getElementById('newPasscode').value = '';
  document.getElementById('confirmPasscode').value = '';
  document.getElementById('changePassStatus').textContent = '';
  openModalDirect('changePasscodeModal');
}

async function submitChangePasscode(e) {
  e.preventDefault();
  const curr = document.getElementById('currPasscode').value.trim();
  const nextPass = document.getElementById('newPasscode').value.trim();
  const confirmPass = document.getElementById('confirmPasscode').value.trim();
  const statusEl = document.getElementById('changePassStatus');

  if (nextPass !== confirmPass) {
    statusEl.textContent = '[×] New passcodes do not match.';
    statusEl.style.color = '#ef4444';
    return;
  }

  statusEl.textContent = 'Updating passcode on backend server...';
  statusEl.style.color = 'var(--text-subtle)';

  try {
    const res = await fetch('/api/admin/change-passcode', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPasscode: curr, newPasscode: nextPass })
    });
    const data = await res.json();
    if (res.ok && data.success) {
      statusEl.textContent = '[✓] Passcode updated successfully!';
      statusEl.style.color = 'var(--accent-green-dark)';
      setTimeout(() => closeModalDirect('changePasscodeModal'), 1200);
    } else {
      statusEl.textContent = `[×] ${data.error || 'Failed to update passcode'}`;
      statusEl.style.color = '#ef4444';
    }
  } catch (err) {
    statusEl.textContent = '[×] Error contacting server.';
    statusEl.style.color = '#ef4444';
  }
}

function triggerResumeUpload() {
  const input = document.getElementById('resumeFileInput');
  if (input) input.click();
}

async function handleResumePdfUpload(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = async function(evt) {
    const base64Data = evt.target.result;

    try {
      const res = await fetch('/api/resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: file.name, base64: base64Data })
      });
      if (res.ok) {
        const data = await res.json();
        const heroBtn = document.getElementById('heroResumeBtn');
        if (heroBtn && data.resumeUrl) {
          heroBtn.href = data.resumeUrl;
        }
        alert('✓ Resume PDF uploaded and linked successfully!');
      }
    } catch (err) {
      alert('Failed to upload resume to server.');
    }
  };
  reader.readAsDataURL(file);
}

/* --------------------------------------------------------------------------
   04. RENDER SEPARATE UI & TECHNICAL PROJECTS GRIDS WITH ALWAYS-ON EDIT & DELETE
   -------------------------------------------------------------------------- */
function renderProjects() {
  const uiContainer = document.getElementById('uiProjectsContainer');
  const otherContainer = document.getElementById('otherProjectsContainer');

  const uiProjects = projectsData.filter(p => p.category && p.category.toLowerCase().includes('ui'));
  const otherProjects = projectsData.filter(p => !p.category || !p.category.toLowerCase().includes('ui'));

  // 1. RENDER UI PROJECTS GRID
  if (uiContainer) {
    let uiHtml = '';
    uiProjects.forEach((p, idx) => {
      const num = String(idx + 1).padStart(2, '0');
      let thumbHtml = p.thumbnail 
        ? `<img src="${p.thumbnail}" alt="${p.title}" class="thumbnail-img" />`
        : generateSvgBlueprintThumbnail(num, p.title, 'ui');

      uiHtml += `
        <article class="project-card ui-project-card" data-category="${p.category}" data-project-id="${p.id}">
          <div class="thumbnail-box ui-thumbnail-box" onclick="openProjectModal('${p.id}')" title="Click to Expand UI Specs & Preview">
            ${thumbHtml}
            <div class="ui-thumbnail-hover-overlay">
              <span class="expand-icon">[⊕ CLICK TO EXPAND]</span>
            </div>
          </div>

          <div class="project-header">
            <span class="proj-id">${num} / UI DEVELOPMENT</span>
            <span class="status-indicator">● ACTIVE UI</span>
          </div>

          <h3 class="proj-title" onclick="openProjectModal('${p.id}')" style="cursor:pointer;">${p.title}</h3>
          <p class="proj-desc">${p.desc}</p>

          <div class="proj-tags">
            ${p.tags.map(t => `<span>${t}</span>`).join('')}
          </div>

          <div class="proj-footer">
            <div class="proj-footer-left">
              <button class="proj-inspect-btn ui-expand-btn" onclick="openProjectModal('${p.id}')">[⊕ EXPAND UI SPECS]</button>
              ${p.link ? `<a href="${p.link}" target="_blank" class="live-link-btn" onclick="event.stopPropagation()">[↗ LIVE DEMO]</a>` : ''}
            </div>

            ${adminMode ? `
              <div class="card-action-bar" style="display:flex; gap:6px;">
                <button class="edit-card-btn" onclick="event.stopPropagation(); openEditProjectModal('${p.id}')" title="Edit this project">[✎ EDIT]</button>
                <button class="delete-card-btn" onclick="event.stopPropagation(); deleteProject('${p.id}')" title="Delete this project">[🗑 DELETE]</button>
              </div>
            ` : ''}
          </div>
        </article>
      `;
    });
    uiContainer.innerHTML = uiHtml || '<p style="color:var(--text-subtle); font-size:0.85rem;">No UI projects added yet.</p>';
  }

  // 2. RENDER TECHNICAL & OTHER PROJECTS GRID
  if (otherContainer) {
    let otherHtml = '';
    otherProjects.forEach((p, idx) => {
      const num = String(idx + 1).padStart(2, '0');
      let thumbHtml = p.thumbnail 
        ? `<img src="${p.thumbnail}" alt="${p.title}" class="thumbnail-img" />`
        : generateSvgBlueprintThumbnail(num, p.title, p.category);

      otherHtml += `
        <article class="project-card" data-category="${p.category}" data-project-id="${p.id}">
          <div class="thumbnail-box" onclick="openProjectModal('${p.id}')" title="Click to Inspect Specs">
            ${thumbHtml}
          </div>

          <div class="project-header">
            <span class="proj-id">${num} / ${p.category.toUpperCase().split(' ')[0]}</span>
            <span class="status-indicator">● TECHNICAL</span>
          </div>

          <h3 class="proj-title" onclick="openProjectModal('${p.id}')" style="cursor:pointer;">${p.title}</h3>
          <p class="proj-desc">${p.desc}</p>

          <div class="proj-tags">
            ${p.tags.map(t => `<span>${t}</span>`).join('')}
          </div>

          <div class="proj-footer">
            <div class="proj-footer-left">
              <button class="proj-inspect-btn" onclick="openProjectModal('${p.id}')">[+] INSPECT SPECS</button>
              ${p.link ? `<a href="${p.link}" target="_blank" class="live-link-btn" onclick="event.stopPropagation()">[↗ LIVE LINK]</a>` : ''}
            </div>

            ${adminMode ? `
              <div class="card-action-bar" style="display:flex; gap:6px;">
                <button class="edit-card-btn" onclick="event.stopPropagation(); openEditProjectModal('${p.id}')" title="Edit this project">[✎ EDIT]</button>
                <button class="delete-card-btn" onclick="event.stopPropagation(); deleteProject('${p.id}')" title="Delete this project">[🗑 DELETE]</button>
              </div>
            ` : ''}
          </div>
        </article>
      `;
    });
    otherContainer.innerHTML = otherHtml || '<p style="color:var(--text-subtle); font-size:0.85rem;">No technical projects found.</p>';
  }
}

function generateSvgBlueprintThumbnail(num, title, category) {
  const bg = category.includes('ui') ? '#059669' : category.includes('ml') ? '#0284c7' : '#111111';
  return `
    <svg class="thumbnail-placeholder-svg" viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg">
      <rect width="400" height="200" fill="#f8fafc" stroke="#e0e0e0" stroke-width="2"/>
      <line x1="0" y1="30" x2="400" y2="30" stroke="#e0e0e0" stroke-width="1"/>
      <text x="16" y="20" font-family="monospace" font-size="11" fill="#666666" font-weight="700">CAD BLUEPRINT // PROJ_${num}</text>
      <circle cx="370" cy="20" r="4" fill="${bg}"/>
      <rect x="30" y="60" width="340" height="100" fill="#ffffff" stroke="${bg}" stroke-width="1.5" stroke-dasharray="4 4"/>
      <text x="200" y="115" font-family="monospace" font-size="14" fill="#111111" text-anchor="middle" font-weight="700">${num} / TECHNICAL SCHEMATIC</text>
    </svg>
  `;
}

/* --------------------------------------------------------------------------
   05. PROJECT CRUD HANDLERS WITH BACKEND SYNC
   -------------------------------------------------------------------------- */
let currentThumbnailBase64 = '';
let currentThumbnailUploadedUrl = '';

function openAddProjectModal(defaultCat = 'ui') {
  document.getElementById('projectModalTitle').textContent = defaultCat === 'ui' ? 'ADD // NEW UI / UX PROJECT' : 'ADD // NEW TECHNICAL PROJECT';
  document.getElementById('editProjectId').value = '';
  document.getElementById('projTitleInput').value = '';
  document.getElementById('projCategoryInput').value = defaultCat;
  document.getElementById('projDescInput').value = '';
  document.getElementById('projTagsInput').value = '';
  document.getElementById('projLinkInput').value = '';
  document.getElementById('projThumbnailUrlInput').value = '';
  currentThumbnailBase64 = '';
  currentThumbnailUploadedUrl = '';
  document.getElementById('thumbnailPreviewBox').innerHTML = '<span class="preview-placeholder">Thumbnail Preview</span>';
  
  openModalDirect('projectModal');
}

function openEditProjectModal(id) {
  const p = projectsData.find(item => item.id === id);
  if (!p) return;

  document.getElementById('projectModalTitle').textContent = `EDIT // PROJECT #${id}`;
  document.getElementById('editProjectId').value = p.id;
  document.getElementById('projTitleInput').value = p.title;
  document.getElementById('projCategoryInput').value = p.category.split(' ')[0] || 'ui';
  document.getElementById('projDescInput').value = p.desc;
  document.getElementById('projTagsInput').value = p.tags.join(', ');
  document.getElementById('projLinkInput').value = p.link || '';
  document.getElementById('projThumbnailUrlInput').value = p.thumbnail && !p.thumbnail.startsWith('data:') ? p.thumbnail : '';
  currentThumbnailBase64 = p.thumbnail && p.thumbnail.startsWith('data:') ? p.thumbnail : '';
  currentThumbnailUploadedUrl = p.thumbnail && !p.thumbnail.startsWith('data:') ? p.thumbnail : '';

  if (p.thumbnail) {
    document.getElementById('thumbnailPreviewBox').innerHTML = `<img src="${p.thumbnail}" style="max-height:100%; object-fit:cover;" />`;
  } else {
    document.getElementById('thumbnailPreviewBox').innerHTML = '<span class="preview-placeholder">No Image Attached</span>';
  }

  openModalDirect('projectModal');
}

function handleThumbnailFileUpload(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = async function(evt) {
    currentThumbnailBase64 = evt.target.result;
    
    // Upload image file to backend server
    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: file.name, base64: currentThumbnailBase64 })
      });
      if (res.ok) {
        const data = await res.json();
        currentThumbnailUploadedUrl = data.fileUrl;
        const urlInputEl = document.getElementById('projThumbnailUrlInput');
        if (urlInputEl) urlInputEl.value = data.fileUrl;
      }
    } catch (err) {}

    document.getElementById('thumbnailPreviewBox').innerHTML = `<img src="${currentThumbnailBase64}" style="max-height:100%; object-fit:cover;" />`;
  };
  reader.readAsDataURL(file);
}

async function saveProjectForm(e) {
  e.preventDefault();
  const id = document.getElementById('editProjectId').value;
  const title = document.getElementById('projTitleInput').value.trim();
  const cat = document.getElementById('projCategoryInput').value;
  const desc = document.getElementById('projDescInput').value.trim();
  const tagsStr = document.getElementById('projTagsInput').value.trim();
  const link = document.getElementById('projLinkInput').value.trim();
  const urlInput = document.getElementById('projThumbnailUrlInput').value.trim();

  const tags = tagsStr ? tagsStr.split(',').map(t => t.trim().toUpperCase()) : ['PROJECT'];
  const finalThumbnail = currentThumbnailUploadedUrl || urlInput || currentThumbnailBase64 || '';

  const projectPayload = {
    id: id || ('p_' + Date.now()),
    title,
    category: cat,
    desc,
    tags,
    link,
    thumbnail: finalThumbnail
  };

  try {
    const res = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(projectPayload)
    });
    if (res.ok) {
      const data = await res.json();
      if (data.projects) projectsData = data.projects;
    }
  } catch (err) {
    if (id) {
      const idx = projectsData.findIndex(item => item.id === id);
      if (idx !== -1) projectsData[idx] = projectPayload;
    } else {
      projectsData.push(projectPayload);
    }
  }

  saveProjectsDataset();
  closeModalDirect('projectModal');
}

async function deleteProject(id) {
  if (confirm(`Are you sure you want to delete project #${id}?`)) {
    try {
      await fetch(`/api/projects/${id}`, { method: 'DELETE' });
    } catch (e) {}
    projectsData = projectsData.filter(item => item.id !== id);
    saveProjectsDataset();
  }
}

/* --------------------------------------------------------------------------
   06. CERTIFICATIONS GRID, EDIT & PDF DOCUMENT UPLOAD MANAGEMENT
   -------------------------------------------------------------------------- */
function renderCerts() {
  const container = document.getElementById('certsContainer');
  if (!container) return;

  let html = '';

  certsData.forEach(c => {
    const isPdf = c.fileUrl && (c.fileUrl.toLowerCase().endsWith('.pdf') || c.fileUrl.startsWith('data:application/pdf'));
    const pdfBadge = isPdf ? `<span style="background:#ef4444; color:#ffffff; font-size:0.65rem; font-weight:700; padding:2px 6px; border-radius:3px; margin-left:6px;">PDF</span>` : '';

    html += `
      <div class="cert-card" onclick="viewCertificateDoc('${c.id}')">
        <div class="cert-card-top">
          <div class="cert-status-dot"></div>
          <div class="cert-details">
            <h4 class="cert-name">${c.title} ${pdfBadge}</h4>
            <span class="cert-issuer">${c.issuer} · ${c.date || '2026'}</span>
          </div>
        </div>

        <div class="cert-card-actions" style="display:flex; gap:6px; align-items:center;">
          <span class="view-cert-btn">[👁 VIEW CERTIFICATE]</span>
          ${adminMode ? `
            <button class="edit-card-btn" onclick="event.stopPropagation(); openEditCertModal('${c.id}')" title="Edit certificate">[✎ EDIT]</button>
            <button class="delete-card-btn" onclick="event.stopPropagation(); deleteCert('${c.id}')" title="Delete certificate">[🗑 DELETE]</button>
          ` : ''}
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
}

let activeViewerCertId = null;

function viewCertificateDoc(id) {
  const c = certsData.find(item => item.id === id);
  if (!c) return;

  activeViewerCertId = id;

  const titleEl = document.getElementById('certViewerTitle');
  const bodyEl = document.getElementById('certViewerBody');
  if (!titleEl || !bodyEl) return;

  titleEl.textContent = `CERTIFICATE // ${c.title}`;

  let docHtml = '';
  const isPdf = c.fileUrl && (c.fileUrl.toLowerCase().endsWith('.pdf') || c.fileUrl.startsWith('data:application/pdf'));

  if (c.fileUrl) {
    if (isPdf) {
      docHtml = `
        <div style="margin-bottom:16px;">
          <iframe src="${c.fileUrl}" style="width:100%; height:460px; border:1px solid var(--border-dark); border-radius:4px; background:#ffffff;"></iframe>
        </div>
      `;
    } else {
      docHtml = `<div style="text-align:center; margin-bottom:16px;"><img src="${c.fileUrl}" alt="${c.title}" class="cert-img-view" style="max-height:420px; width:auto; border-radius:4px; border:1px solid var(--border-dark);" /></div>`;
    }
  } else {
    // Generate technical SVG Certificate Badge
    docHtml = `
      <div class="cert-doc-display" style="margin-bottom:16px;">
        <svg width="320" height="220" viewBox="0 0 320 220" xmlns="http://www.w3.org/2000/svg">
          <rect width="320" height="220" fill="#ffffff" stroke="#10b981" stroke-width="3" rx="4"/>
          <circle cx="160" cy="50" r="24" fill="rgba(16,185,129,0.1)" stroke="#10b981" stroke-width="2"/>
          <text x="160" y="55" font-family="monospace" font-size="18" fill="#059669" text-anchor="middle" font-weight="700">✓</text>
          <text x="160" y="100" font-family="monospace" font-size="14" fill="#111111" text-anchor="middle" font-weight="700">${c.title}</text>
          <text x="160" y="125" font-family="monospace" font-size="11" fill="#666666" text-anchor="middle">ISSUED BY: ${c.issuer}</text>
          <text x="160" y="145" font-family="monospace" font-size="10" fill="#10b981" text-anchor="middle" font-weight="700">VERIFIED CREDENTIAL · ${c.date || '2026'}</text>
          <line x1="30" y1="170" x2="290" y2="170" stroke="#e0e0e0" stroke-width="1"/>
          <text x="160" y="195" font-family="monospace" font-size="9" fill="#888888" text-anchor="middle">HOLDER: ARJUN KRISHNA B</text>
        </svg>
      </div>
    `;
  }

  bodyEl.innerHTML = `
    <div>
      <h3 style="font-size:1.1rem; font-weight:700; color:var(--text-main); margin-bottom:4px;">${c.title}</h3>
      <p style="font-size:0.825rem; color:var(--accent-green-dark); font-weight:700; margin-bottom:16px;">
        Verified Credential Issued by ${c.issuer} (${c.date || '2026'})
      </p>
      
      ${docHtml}

      ${adminMode ? `
        <!-- DIRECT PDF / DOCUMENT UPLOAD & MANAGEMENT ACTION BAR -->
        <div style="background:var(--bg-card); padding:12px 16px; border:1px solid var(--border-dark); border-radius:4px; margin-bottom:16px; display:flex; flex-wrap:wrap; gap:12px; justify-content:space-between; align-items:center;">
          <div>
            <span style="font-size:0.8rem; font-weight:700; color:var(--text-main); display:block;">UPLOAD / UPDATE CERTIFICATE DOCUMENT (PDF)</span>
            <span style="font-size:0.75rem; color:var(--text-subtle);">Attach or replace PDF file for this certificate</span>
          </div>
          <button class="tech-btn tech-btn-accent" onclick="triggerDirectCertPdfUpload('${c.id}')">
            [⇪ UPLOAD PDF FILE]
          </button>
        </div>
      ` : ''}

      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
        <span style="font-size:0.775rem; color:var(--text-subtle);">Verified Recipient: Arjun Krishna B</span>
        <div style="display:flex; gap:8px;">
          ${adminMode ? `
            <button class="tech-btn" onclick="closeModalDirect('certViewerModal'); openEditCertModal('${c.id}')">[✎ EDIT CERTIFICATE]</button>
            <button class="tech-btn" style="border-color:#ef4444; color:#ef4444;" onclick="closeModalDirect('certViewerModal'); deleteCert('${c.id}')">[🗑 DELETE]</button>
          ` : ''}
          ${c.fileUrl ? `<a href="${c.fileUrl}" target="_blank" class="tech-btn">[↗ OPEN DOCUMENT]</a>` : ''}
          ${c.fileUrl ? `<a href="${c.fileUrl}" download="${c.title.replace(/[^a-zA-Z0-9]/g, '_')}${isPdf ? '.pdf' : '.png'}" class="tech-btn tech-btn-accent">[⤓ DOWNLOAD CERTIFICATE]</a>` : ''}
        </div>
      </div>
    </div>
  `;

  openModalDirect('certViewerModal');
}

function triggerDirectCertPdfUpload(id) {
  activeViewerCertId = id;
  const fileInput = document.getElementById('certViewerPdfInput');
  if (fileInput) fileInput.click();
}

async function handleDirectCertPdfUpload(e) {
  const file = e.target.files[0];
  if (!file || !activeViewerCertId) return;

  const reader = new FileReader();
  reader.onload = async function(evt) {
    const base64Data = evt.target.result;
    let finalUrl = base64Data;

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: file.name,
          base64: base64Data,
          certId: activeViewerCertId
        })
      });
      if (res.ok) {
        const data = await res.json();
        finalUrl = data.fileUrl;
      }
    } catch (err) {
      console.warn('Backend upload server offline, utilizing local cache.');
    }

    const idx = certsData.findIndex(c => c.id === activeViewerCertId);
    if (idx !== -1) {
      certsData[idx].fileUrl = finalUrl;
      saveCertsDataset();
      viewCertificateDoc(activeViewerCertId);
    }
  };
  reader.readAsDataURL(file);
}

let currentCertBase64 = '';
let currentCertUploadedUrl = '';

function openAddCertModal() {
  document.getElementById('certModalTitle').textContent = 'UPLOAD // NEW CERTIFICATE';
  document.getElementById('editCertId').value = '';
  document.getElementById('certTitleInput').value = '';
  document.getElementById('certIssuerInput').value = '';
  document.getElementById('certDateInput').value = '2026';
  document.getElementById('certUrlInput').value = '';
  currentCertBase64 = '';
  currentCertUploadedUrl = '';
  document.getElementById('certPreviewBox').innerHTML = '<span class="preview-placeholder">Document Preview</span>';
  openModalDirect('certModal');
}

function openEditCertModal(id) {
  const c = certsData.find(item => item.id === id);
  if (!c) return;

  document.getElementById('certModalTitle').textContent = `EDIT // CERTIFICATE #${id}`;
  document.getElementById('editCertId').value = c.id;
  document.getElementById('certTitleInput').value = c.title || '';
  document.getElementById('certIssuerInput').value = c.issuer || '';
  document.getElementById('certDateInput').value = c.date || '2026';
  document.getElementById('certUrlInput').value = c.fileUrl && !c.fileUrl.startsWith('data:') ? c.fileUrl : '';
  currentCertBase64 = c.fileUrl && c.fileUrl.startsWith('data:') ? c.fileUrl : '';
  currentCertUploadedUrl = c.fileUrl && !c.fileUrl.startsWith('data:') ? c.fileUrl : '';

  if (c.fileUrl) {
    if (c.fileUrl.endsWith('.pdf') || c.fileUrl.startsWith('data:application/pdf')) {
      document.getElementById('certPreviewBox').innerHTML = `<span class="preview-placeholder" style="color:var(--accent-green-dark); font-weight:700;">PDF Document Attached (${c.fileUrl.split('/').pop()})</span>`;
    } else {
      document.getElementById('certPreviewBox').innerHTML = `<img src="${c.fileUrl}" style="max-height:100%; object-fit:contain;" />`;
    }
  } else {
    document.getElementById('certPreviewBox').innerHTML = '<span class="preview-placeholder">No File Attached</span>';
  }

  openModalDirect('certModal');
}

function handleCertFileUpload(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = async function(evt) {
    currentCertBase64 = evt.target.result;

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: file.name, base64: currentCertBase64 })
      });
      if (res.ok) {
        const data = await res.json();
        currentCertUploadedUrl = data.fileUrl;
        const urlInputEl = document.getElementById('certUrlInput');
        if (urlInputEl) urlInputEl.value = data.fileUrl;
      }
    } catch (err) {}

    if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
      document.getElementById('certPreviewBox').innerHTML = `<span class="preview-placeholder" style="color:var(--accent-green-dark); font-weight:700;">✓ PDF Document Attached (${file.name})</span>`;
    } else {
      document.getElementById('certPreviewBox').innerHTML = `<img src="${currentCertBase64}" style="max-height:100%; object-fit:contain;" />`;
    }
  };
  reader.readAsDataURL(file);
}

async function saveCertForm(e) {
  e.preventDefault();
  const id = document.getElementById('editCertId').value;
  const title = document.getElementById('certTitleInput').value.trim();
  const issuer = document.getElementById('certIssuerInput').value.trim();
  const date = document.getElementById('certDateInput').value.trim() || '2026';
  const urlInput = document.getElementById('certUrlInput').value.trim();

  const finalFile = currentCertUploadedUrl || urlInput || currentCertBase64 || '';

  const certPayload = {
    id: id || ('c_' + Date.now()),
    title,
    issuer,
    date,
    fileUrl: finalFile
  };

  try {
    const res = await fetch('/api/certs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(certPayload)
    });
    if (res.ok) {
      const data = await res.json();
      if (data.certs) certsData = data.certs;
    }
  } catch (err) {
    if (id) {
      const idx = certsData.findIndex(item => item.id === id);
      if (idx !== -1) certsData[idx] = certPayload;
    } else {
      certsData.push(certPayload);
    }
  }

  saveCertsDataset();
  closeModalDirect('certModal');
}

async function deleteCert(id) {
  if (confirm(`Are you sure you want to delete certificate #${id}?`)) {
    try {
      await fetch(`/api/certs/${id}`, { method: 'DELETE' });
    } catch (e) {}
    certsData = certsData.filter(item => item.id !== id);
    saveCertsDataset();
  }
}

/* --------------------------------------------------------------------------
   07. SYSTEM MAP & MODAL UTILITIES
   -------------------------------------------------------------------------- */
const NODE_DATA = {
  core: {
    title: 'ARJUN.SEC // CORE BLUEPRINT HUB',
    subtitle: 'Centralized Security Operations & Web UI Engineering Infrastructure',
    description: 'Serving as the unified operations hub, ARJUN.SEC connects FortiGate network security infrastructure, real-time telemetry monitoring, automated vulnerability scanning, packet analysis tools, AI threat detection models, and front-end Web UI systems into an integrated defense and development pipeline.',
    specs: [
      { key: 'OPERATOR', val: 'Arjun Krishna B (BCA AIML, VIT Vellore)' },
      { key: 'LOCATION', val: 'Kochi, Kerala, India (09.93° N)' },
      { key: 'ARCHITECTURE', val: 'Decoupled Security Pipeline & Web UI Hub' },
      { key: 'PRIMARY STACK', val: 'FortiOS, IPsec, HTML/CSS/JS, Python, Scapy, Scikit-learn' }
    ]
  },
  fortigate: {
    title: 'FORTIGATE FIREWALL OPERATIONS',
    subtitle: 'Enterprise Perimeter Defense & Network Segmentation',
    description: 'Hands-on configuration and administrative management of FortiGate Next-Generation Firewalls (NGFW). Configured IPsec VPN tunnels for site-to-site / remote client access, granular firewall security policies, SNAT/DNAT rules, VLAN segmentation, Intrusion Prevention Systems (IPS), and Web Filtering policy enforcement.',
    specs: [
      { key: 'TECHNOLOGY', val: 'FortiGate Firewalls / FortiOS' },
      { key: 'VPN TUNNELS', val: 'IPsec VPN (Phase 1 & Phase 2 IKEv2)' },
      { key: 'SECURITY POLICIES', val: 'Stateful Inspection, Application Control, Web Filter' },
      { key: 'NETWORK TOPOLOGY', val: 'VLAN Tagging, Subnetting, NAT Translation' }
    ]
  },
  fakejob: {
    title: 'FAKE JOB POSTING DETECTION SYSTEM',
    subtitle: 'Machine Learning & NLP Fraud Detection Pipeline',
    description: 'Developed an intelligent fraud detection system engineered to analyze text descriptions and metadata of employment listings to classify them as genuine or fraudulent. Utilizes Natural Language Processing (NLTK) with TF-IDF and CountVectorizer matrix representations.',
    specs: [
      { key: 'ALGORITHMS', val: 'Random Forest, Naive Bayes, Logistic Regression' },
      { key: 'VECTORIZATION', val: 'TF-IDF Vectorizer & CountVectorizer' },
      { key: 'EVALUATION', val: 'High F1-Score & Precision Evaluation Metrics' },
      { key: 'STACK', val: 'Python, Scikit-learn, Pandas, NLTK, Jupyter' }
    ]
  },
  vulnscanner: {
    title: 'VULNERABILITY SCANNER USING PYTHON',
    subtitle: 'Automated Network Discovery & Weakness Triage',
    description: 'Custom Python security tool that performs automated host discovery, multi-threaded TCP/UDP port scanning, service version identification, and basic vulnerability matching. Generates structured JSON reports for rapid threat mitigation.',
    specs: [
      { key: 'CONCURRENCY', val: 'Python Threading & Async Socket I/O' },
      { key: 'ENGINE', val: 'Python-Nmap Integration & Native Sockets' },
      { key: 'REPORTING', val: 'JSON & Human-Readable Console Output' },
      { key: 'TARGET OS', val: 'Linux / Windows / Network Devices' }
    ]
  },
  uiweb: {
    title: 'WEB UI DEVELOPMENT & INTERFACE SYSTEMS',
    subtitle: 'Front-end Engineering & Responsive UI Components',
    description: 'Specialized in building clean, responsive, high-performance web interfaces and design systems. Gained hands-on experience during UI internship at Techgentsia Software Technologies creating interactive web layouts, responsive CSS component systems, and conducting UI testing.',
    specs: [
      { key: 'FRONT-END STACK', val: 'HTML5, CSS3, JavaScript (ES6+), DOM APIs' },
      { key: 'UI EXPERIENCE', val: 'Techgentsia Software Technologies (Web UI Development Intern)' },
      { key: 'DESIGN SYSTEM', val: 'Custom Responsive Layouts, Dark/Light Themes, Monospace CAD UI' },
      { key: 'COMPATIBILITY', val: 'Cross-browser Testing & Fluid Mobile Breakpoints' }
    ]
  },
  aithreat: {
    title: 'AI THREAT DETECTION SYSTEM',
    subtitle: 'Anomaly Detection & Real-time Security Analytics',
    description: 'An AI-enhanced threat monitoring platform built to isolate suspicious network behavior from high-volume telemetry. Implements anomaly detection algorithms (Isolation Forest) paired with an interactive Streamlit UI.',
    specs: [
      { key: 'MODEL', val: 'Isolation Forest & Unsupervised Anomaly Detection' },
      { key: 'INTERFACE', val: 'Streamlit Interactive Dashboard' },
      { key: 'DATA SOURCES', val: 'PCAP Logs, Syslog Telemetry, NetFlow' },
      { key: 'ALERTING', val: 'Real-time Anomaly Threshold Alerts' }
    ]
  },
  trafficanalyzer: {
    title: 'NETWORK TRAFFIC ANALYZER USING PYTHON',
    subtitle: 'Packet Capture, Protocol Parsing & Deep Inspection',
    description: 'Built a real-time network protocol analyzer to capture and parse network traffic across TCP, UDP, ICMP, DNS, and HTTP protocols. Performs packet header extraction, bandwidth metrics, and anomaly detection.',
    specs: [
      { key: 'CAPTURE ENGINE', val: 'Python Scapy & Raw Sockets' },
      { key: 'PROTOCOLS', val: 'TCP, UDP, ICMP, DNS, HTTP/S' },
      { key: 'VISUALIZATION', val: 'Pandas & Matplotlib Telemetry Plots' },
      { key: 'COMPATIBILITY', val: 'Wireshark PCAP File Export' }
    ]
  },
  packetsniffer: {
    title: 'REAL-TIME PYTHON PACKET SNIFFER',
    subtitle: 'Live Network Packet Capture & Header Decoder',
    description: 'A high-performance Python terminal network packet sniffer designed for real-time packet capture, protocol header decoding (Ethernet II, IPv4/IPv6, TCP, UDP, ICMP, ARP, HTTP, DNS), real-time suspicious traffic detection (port scans, SYN floods, ARP spoofing), and dual-format export (.pcap for Wireshark & .csv).',
    specs: [
      { key: 'CAPTURE ENGINE', val: 'Python Raw Sockets & Scapy BPF Filters' },
      { key: 'DECODING', val: 'Ethernet II, IPv4/v6, TCP, UDP, ICMP, ARP, HTTP, DNS' },
      { key: 'THREAT DETECT', val: 'Port Scanning, SYN Floods, ARP Spoofing' },
      { key: 'EXPORTS', val: 'Wireshark PCAP & Structured CSV Records' }
    ]
  },
  soc: {
    title: 'SOC MONITORING & LOG ANALYSIS',
    subtitle: 'Threat Detection, Event Triage & Incident Response',
    description: 'Experience monitoring security event logs, inspecting intrusion prevention alerts, analyzing firewall logs, and isolating network anomalies to maintain robust cybersecurity posture.',
    specs: [
      { key: 'MONITORING', val: 'Log Triage & Event Correlation' },
      { key: 'FILTERING', val: 'Web Filtering, IPS Rules, App Control' },
      { key: 'RESPONSE', val: 'Policy Remediation & IP Blocking' }
    ]
  }
};

function initSystemMapInteractions() {
  const nodes = document.querySelectorAll('.minimal-cad-card, .hex-cell, .noc-node-card, .cad-node, .radar-node, .map-node');
  nodes.forEach(node => {
    node.addEventListener('click', () => {
      const nodeId = node.getAttribute('data-node-id');
      if (nodeId && NODE_DATA[nodeId]) {
        openNodeModal(NODE_DATA[nodeId]);
      }
    });
  });
}

function openNodeModal(data) {
  const titleEl = document.getElementById('modalTitle');
  const bodyEl = document.getElementById('modalBody');

  if (!titleEl || !bodyEl) return;

  titleEl.textContent = `INSPECTOR // ${data.title}`;

  let html = `
    <div>
      <h3 style="font-size:1.1rem; font-weight:700; margin-bottom:4px; color:var(--text-main);">${data.title}</h3>
      <p style="font-size:0.8rem; color:var(--accent-green-dark); font-weight:700; margin-bottom:12px;">${data.subtitle}</p>
      <p style="font-size:0.875rem; color:var(--text-muted); line-height:1.6;">${data.description}</p>
    </div>

    <div style="border-top:1px solid var(--border-light); padding-top:14px; margin-top:10px;">
      <h4 style="font-size:0.8rem; font-weight:700; letter-spacing:1px; margin-bottom:10px; color:var(--text-main);">TECHNICAL SPECIFICATIONS</h4>
      <div style="display:flex; flex-direction:column; gap:8px; font-size:0.8rem;">
  `;

  data.specs.forEach(spec => {
    html += `
      <div style="display:flex; gap:12px; border-bottom:1px solid var(--border-light); padding-bottom:6px;">
        <span style="font-weight:700; width:140px; flex-shrink:0; color:var(--text-main);">${spec.key}:</span>
        <span style="color:var(--text-muted);">${spec.val}</span>
      </div>
    `;
  });

  html += `
      </div>
    </div>
  `;

  bodyEl.innerHTML = html;
  openModalDirect('inspectorModal');
}

function openProjectModal(id) {
  const p = projectsData.find(item => item.id === id);
  if (!p) return;

  const isUi = p.category && p.category.toLowerCase().includes('ui');
  const titleEl = document.getElementById('modalTitle');
  const bodyEl = document.getElementById('modalBody');

  if (!titleEl || !bodyEl) return;

  titleEl.textContent = isUi ? `UI INSPECTOR // ${p.title}` : `TECHNICAL SPECS // ${p.title}`;

  let thumbDisplay = '';
  if (p.thumbnail) {
    thumbDisplay = `<img src="${p.thumbnail}" alt="${p.title}" style="width:100%; max-height:420px; object-fit:contain; border-radius:4px;" />`;
  } else {
    thumbDisplay = generateSvgBlueprintThumbnail(id, p.title, p.category);
  }

  bodyEl.innerHTML = `
    <div>
      <h3 style="font-size:1.15rem; font-weight:700; color:var(--text-main); margin-bottom:4px;">${p.title}</h3>
      <p style="font-size:0.825rem; color:var(--accent-green-dark); font-weight:700; margin-bottom:16px;">
        ${isUi ? 'UI / UX Design System & Front-End Architecture' : `Technical System · ${p.category.toUpperCase()}`}
      </p>

      <!-- Large Project Thumbnail Preview -->
      <div style="margin-bottom:16px; border:1px solid var(--border-dark); border-radius:4px; overflow:hidden; background:var(--bg-alt); text-align:center; padding:8px;">
        ${thumbDisplay}
      </div>

      <p style="font-size:0.9rem; color:var(--text-muted); line-height:1.6; margin-bottom:16px;">${p.desc}</p>

      <!-- Expandable Feature & Architecture Matrix -->
      <div style="background:var(--bg-card); padding:16px; border:1px solid var(--border-light); border-radius:4px; margin-bottom:16px;">
        <h4 style="font-size:0.825rem; font-weight:700; letter-spacing:1px; margin-bottom:12px; color:var(--text-main);">
          ${isUi ? 'DESIGN SYSTEM & FEATURE HIGHLIGHTS' : 'TECHNICAL SPECIFICATIONS & ARCHITECTURE'}
        </h4>
        
        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(220px, 1fr)); gap:12px; font-size:0.8rem;">
          <div><strong style="color:var(--text-main);">TECH STACK:</strong> ${p.tags.join(' · ')}</div>
          <div><strong style="color:var(--text-main);">STATUS:</strong> Active / Published</div>
          ${isUi ? `
            <div><strong style="color:var(--text-main);">RESPONSIVENESS:</strong> Desktop, Tablet & Mobile Ready</div>
            <div><strong style="color:var(--text-main);">COMPONENTS:</strong> Modular UI Component Tokens</div>
          ` : `
            <div><strong style="color:var(--text-main);">CATEGORY:</strong> ${p.category.toUpperCase()}</div>
            <div><strong style="color:var(--text-main);">DEPLOYMENT:</strong> Production Pipeline</div>
          `}
        </div>
      </div>

      <!-- Action Bar -->
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
        <div>
          ${p.link ? `<a href="${p.link}" target="_blank" class="tech-btn tech-btn-accent" style="padding:8px 16px;">[↗ ${isUi ? 'LAUNCH LIVE UI DEMO' : 'OPEN PROJECT LINK'}]</a>` : '<span style="font-size:0.775rem; color:var(--text-subtle);">No live link attached yet</span>'}
        </div>

        <div style="display:flex; gap:8px;">
          ${adminMode ? `
            <button class="tech-btn" onclick="closeModalDirect('inspectorModal'); openEditProjectModal('${p.id}')">[✎ EDIT PROJECT]</button>
            <button class="tech-btn" style="border-color:#ef4444; color:#ef4444;" onclick="closeModalDirect('inspectorModal'); deleteProject('${p.id}')">[🗑 DELETE]</button>
          ` : ''}
          <button class="tech-btn" onclick="closeModalDirect('inspectorModal')">[× CLOSE INSPECTOR]</button>
        </div>
      </div>
    </div>
  `;

  openModalDirect('inspectorModal');
}

function openModalDirect(modalId) {
  const m = document.getElementById(modalId);
  if (m) m.classList.add('active');
}

function closeModalDirect(modalId) {
  const m = document.getElementById(modalId);
  if (m) m.classList.remove('active');
}

function closeInspectorModal(e) {
  if (e.target.classList.contains('modal-backdrop')) {
    e.target.classList.remove('active');
  }
}

function initProjectFilters() {
  const container = document.getElementById('filterControls');
  if (!container) return;

  container.addEventListener('click', (e) => {
    if (e.target.classList.contains('filter-btn')) {
      const btns = container.querySelectorAll('.filter-btn');
      btns.forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');

      const filter = e.target.getAttribute('data-filter');
      const cards = document.querySelectorAll('.project-card');

      cards.forEach(card => {
        const cat = card.getAttribute('data-category');
        if (filter === 'all' || (cat && cat.includes(filter))) {
          card.style.display = 'flex';
        } else {
          card.style.display = 'none';
        }
      });
    }
  });
}

/* --------------------------------------------------------------------------
   08. INTERACTIVE CLI TERMINAL ENGINE
   -------------------------------------------------------------------------- */
function initTerminal() {
  const input = document.getElementById('cliInput');
  if (!input) return;

  window.handleCliSubmit = function(e) {
    e.preventDefault();
    const cmd = input.value.trim();
    if (cmd) {
      runCliCommand(cmd);
      input.value = '';
    }
  };
}

function runCliCommand(cmdStr) {
  const output = document.getElementById('terminalOutput');
  if (!output) return;

  const cmd = cmdStr.toLowerCase().trim();

  appendTermLine(`arjun@sec:~$ ${cmdStr}`, 't-cmd');

  switch (cmd) {
    case 'help':
      appendTermLine('AVAILABLE COMMANDS:');
      appendTermLine('  whoami     - Display operator overview & bio');
      appendTermLine('  projects   - List featured security & Web UI projects');
      appendTermLine('  skills     - View technical stack & competencies');
      appendTermLine('  certs      - Display active certifications');
      appendTermLine('  contact    - View contact info & direct email');
      appendTermLine('  clear      - Clear terminal screen');
      break;

    case 'whoami':
      appendTermLine('OPERATOR: Arjun Krishna B');
      appendTermLine('ROLE: Cybersecurity Analyst & Web UI Developer');
      appendTermLine('EDUCATION: BCA (AIML Specialization) — VIT Vellore (CGPA 7.67)');
      appendTermLine('LOCATION: Kochi, Kerala, India');
      appendTermLine('STATUS: Open to Cybersecurity Analyst, SOC Analyst & UI Engineer roles');
      break;

    case 'projects':
      projectsData.forEach((p, idx) => {
        appendTermLine(`[${String(idx + 1).padStart(2, '0')}] ${p.title} (${p.category.toUpperCase()})`);
      });
      break;

    case 'skills':
      appendTermLine('FIREWALLS: FortiGate, IPsec VPN, NAT, VLAN, IPS, Web Filtering');
      appendTermLine('WEB UI: HTML5, CSS3 / Vanilla CSS, JavaScript (ES6+), Responsive Design');
      appendTermLine('NETWORKING: TCP/IP, Wireshark, Nmap, Scapy, Socket Programming');
      appendTermLine('SCRIPTING: Python, Linux Shell / Bash, SQL');
      appendTermLine('AI / ML: Scikit-learn, Anomaly Detection, NLTK, TF-IDF, Streamlit');
      break;

    case 'certs':
      certsData.forEach(c => {
        appendTermLine(`• ${c.title} — ${c.issuer} (${c.date})`);
      });
      break;

    case 'contact':
      appendTermLine('EMAIL: arjunkb45@gmail.com');
      appendTermLine('LINKEDIN: https://linkedin.com/in/arjunn100');
      appendTermLine('PORTFOLIO: https://arjunportfolio.super.site');
      appendTermLine('LOCATION: Kochi, Kerala, India');
      break;

    case 'clear':
      output.innerHTML = '';
      break;

    default:
      appendTermLine(`Command not recognized: '${cmdStr}'. Type 'help' for available commands.`);
      break;
  }

  output.scrollTop = output.scrollHeight;
}

function appendTermLine(text, className = '') {
  const output = document.getElementById('terminalOutput');
  if (!output) return;
  const line = document.createElement('div');
  line.className = `t-line ${className}`;
  line.textContent = text;
  output.appendChild(line);
}

/* --------------------------------------------------------------------------
   09. DIRECT CONTACT FORM HANDLER WITH BACKEND DISPATCH
   -------------------------------------------------------------------------- */
async function handleContactSubmit(e) {
  e.preventDefault();
  const name = document.getElementById('contactName').value.trim();
  const email = document.getElementById('contactEmail').value.trim();
  const msg = document.getElementById('contactMessage').value.trim();
  const statusEl = document.getElementById('contactStatus');

  if (!name || !email || !msg) return;

  statusEl.className = 'contact-status-msg';
  statusEl.style.color = 'var(--text-subtle)';
  statusEl.textContent = '[▶] INITIALIZING SECURE TELEMETRY TRANSMISSION...';

  const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC';
  const payload = { name, email, message: msg, timestamp };

  // 1. Save to Local Storage immediately
  try {
    const savedMsgs = JSON.parse(localStorage.getItem('arjun_contact_messages_v1') || '[]');
    savedMsgs.push(payload);
    localStorage.setItem('arjun_contact_messages_v1', JSON.stringify(savedMsgs));
  } catch (err) {}

  // 2. Post to backend server API
  try {
    await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  } catch (err) {
    console.warn('Backend contact API offline, message saved locally.');
  }

  // 3. Render CMD prompt style success response
  const pktId = 'ACK_' + Math.floor(100000 + Math.random() * 900000);
  statusEl.innerHTML = `
    <div class="cmd-success-box">
      <div class="cmd-header">
        <span class="cmd-dot red"></span>
        <span class="cmd-dot yellow"></span>
        <span class="cmd-dot green"></span>
        <span class="cmd-title">C:\\WINDOWS\\system32\\cmd.exe - TELEMETRY_DISPATCH.EXE</span>
      </div>
      <div class="cmd-body">
        <div class="cmd-line"><span class="cmd-prompt">C:\\ARJUN_PORTFOLIO&gt;</span> telemetry_dispatch --send --recipient="arjunkb45@gmail.com"</div>
        <div class="cmd-line cmd-green">[200 OK] TRANSMISSION ACKNOWLEDGED BY COMMAND CENTER</div>
        <div class="cmd-line" style="color:var(--border-dark); margin:4px 0;">-------------------------------------------------------------</div>
        <div class="cmd-line"><span class="cmd-label">SENDER:</span> <span class="cmd-val">${escapeHtml(name)} &lt;${escapeHtml(email)}&gt;</span></div>
        <div class="cmd-line"><span class="cmd-label">STATUS:</span> <span class="cmd-green">DISPATCHED TO BACKEND & LOCAL TELEMETRY LOGS</span></div>
        <div class="cmd-line"><span class="cmd-label">TIMESTAMP:</span> <span class="cmd-val">${timestamp}</span></div>
        <div class="cmd-line"><span class="cmd-label">PACKET ID:</span> <span class="cmd-val">${pktId}</span></div>
        <div class="cmd-line" style="color:var(--border-dark); margin:4px 0;">-------------------------------------------------------------</div>
        <div class="cmd-line cmd-cyan">&gt;_ Telemetry packet recorded into command pipeline. Thank you for reaching out!</div>
      </div>
    </div>
  `;

  document.getElementById('contactForm').reset();
}
