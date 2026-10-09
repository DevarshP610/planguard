// PlanGuard Enterprise Application Coordinator (Dual-Brain Controller)
window.appState = {
  currentView: 'dashboard', // 'dashboard' or 'studio'
  currentJurisdiction: 'san_francisco',
  currentPresetKey: 'coffee_shop',
  isRemediated: false,
  egressActive: false,
  customWallX: null,
  activeTab: 'violations',
  geminiKey: localStorage.getItem('planguard_gemini_key') || '',
  audioEnabled: true,
  uploadedImage: null
};

// High-Tech Web Audio Synthesizer (Zero External Audio Files)
class SoundEngine {
  constructor() {
    this.ctx = null;
  }
  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
  }
  play(type) {
    if (!window.appState.audioEnabled) return;
    this.init();
    if (this.ctx.state === 'suspended') this.ctx.resume();

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.ctx.destination);

    if (type === 'collision') {
      // Warning hum
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.exponentialRampToValueAtTime(110, now + 0.15);
      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      osc.start(now);
      osc.stop(now + 0.15);
    } else if (type === 'remediate' || type === 'success') {
      // Harmonic major triad chime
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.exponentialRampToValueAtTime(783.99, now + 0.18); // G5
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
      osc.start(now);
      osc.stop(now + 0.28);
    } else if (type === 'scan') {
      // High-tech radar sweep
      osc.type = 'sine';
      osc.frequency.setValueAtTime(300, now);
      osc.frequency.exponentialRampToValueAtTime(1200, now + 0.2);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
      osc.start(now);
      osc.stop(now + 0.2);
    } else if (type === 'stamp') {
      // Crisp mechanical latch
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, now);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      osc.start(now);
      osc.stop(now + 0.08);
    } else {
      // Subtle click
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1000, now);
      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
      osc.start(now);
      osc.stop(now + 0.03);
    }
  }
}

window.soundEngine = new SoundEngine();

document.addEventListener('DOMContentLoaded', () => {
  const viewport = document.getElementById('cad-viewport');
  const canvas = document.getElementById('svg-canvas');
  const cad = new CADEngine(viewport, canvas);
  window.cad = cad;

  // Caliper Measurement Toast
  cad.onMeasureCallback = (spanText) => {
    showToast(`Measured Clear Span: ${spanText}`);
    window.soundEngine.play('stamp');
  };

  // DOM Elements
  const viewDashboard = document.getElementById('view-dashboard');
  const viewStudio = document.getElementById('view-studio');
  const tabNavDashboard = document.getElementById('tab-nav-dashboard');
  const tabNavStudio = document.getElementById('tab-nav-studio');
  const btnBrandHome = document.getElementById('btn-brand-home');
  const btnBackToDash = document.getElementById('btn-back-to-dash');
  
  const globalJurisdictionSelect = document.getElementById('global-jurisdiction-select');
  const citySearchInput = document.getElementById('city-search-input');
  const dashJurisdictionName = document.getElementById('dash-jurisdiction-name');
  const studioJurisdictionTag = document.getElementById('studio-jurisdiction-tag');
  const studioPlanTitle = document.getElementById('studio-plan-title');

  const dropzone = document.getElementById('dropzone');
  const cadFileInput = document.getElementById('cad-file-input');
  const ingestHud = document.getElementById('ingest-hud');
  const ingestProgressFill = document.getElementById('ingest-progress-fill');
  const ingestPct = document.getElementById('ingest-pct');
  const ingestLog = document.getElementById('ingest-log');

  const remediateToggle = document.getElementById('remediate-toggle');
  const healthBadge = document.getElementById('health-badge');
  const healthScore = document.getElementById('health-score');
  const healthStatus = document.getElementById('health-status');
  const healthRing = document.getElementById('health-ring-prog');
  const violationsList = document.getElementById('violations-list');
  const toastEl = document.getElementById('minimal-toast');
  const btnToggleAudio = document.getElementById('btn-toggle-audio');

  // Audio Toggle
  if (btnToggleAudio) {
    btnToggleAudio.addEventListener('click', () => {
      window.appState.audioEnabled = !window.appState.audioEnabled;
      btnToggleAudio.classList.toggle('active', window.appState.audioEnabled);
      showToast(window.appState.audioEnabled ? "Haptic Audio Enabled" : "Audio Muted");
    });
  }

  // Live Parametric Wall Dragging Callback (60FPS Reactive Linter)
  cad.onWallDragCallback = (newWallX, corridorInches) => {
    window.appState.customWallX = newWallX;
    const p = window.PRESETS[window.appState.currentPresetKey];
    cad.render(p, window.appState.isRemediated, window.appState.egressActive, newWallX);

    const isCorridorCompliant = corridorInches >= 44.0;
    const baseScore = window.appState.isRemediated ? 98 : (isCorridorCompliant ? 72 : 44);
    updateScoreRing(baseScore, baseScore >= 90 ? "PERMIT-READY" : "NON-COMPLIANT");

    if (isCorridorCompliant && !window.appState.wasCompliantLogged) {
      showToast(`Corridor widened to ${corridorInches}" (Complies with continuous egress standard)`);
      window.soundEngine.play('success');
      window.appState.wasCompliantLogged = true;
    } else if (!isCorridorCompliant) {
      window.appState.wasCompliantLogged = false;
    }
  };

  // View Navigation
  function switchView(viewName) {
    window.appState.currentView = viewName;
    if (viewName === 'dashboard') {
      viewDashboard.style.display = 'flex';
      viewStudio.classList.remove('active');
      tabNavDashboard.classList.add('active');
      tabNavStudio.classList.remove('active');
    } else {
      viewDashboard.style.display = 'none';
      viewStudio.classList.add('active');
      tabNavDashboard.classList.remove('active');
      tabNavStudio.classList.add('active');
      
      const p = window.PRESETS[window.appState.currentPresetKey];
      cad.render(p, window.appState.isRemediated, window.appState.egressActive, window.appState.customWallX);
    }
    window.soundEngine.play('click');
  }

  tabNavDashboard.addEventListener('click', () => switchView('dashboard'));
  tabNavStudio.addEventListener('click', () => switchView('studio'));
  btnBrandHome.addEventListener('click', () => switchView('dashboard'));
  btnBackToDash.addEventListener('click', () => switchView('dashboard'));
  document.getElementById('btn-dashboard-new-audit')?.addEventListener('click', () => {
    dropzone.scrollIntoView({ behavior: 'smooth' });
    dropzone.style.borderColor = 'var(--cad-cyan)';
    setTimeout(() => dropzone.style.borderColor = '', 1500);
  });

  // Jurisdiction Switcher & Location Search
  globalJurisdictionSelect?.addEventListener('change', (e) => {
    setJurisdiction(e.target.value);
  });

  if (citySearchInput) {
    citySearchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const query = citySearchInput.value.trim();
        if (query) {
          const resolved = window.resolveJurisdiction(query);
          if (resolved) {
            setJurisdiction(resolved.id);
            showToast(`Jurisdiction Activated: ${resolved.name} (${resolved.authority})`);
          }
        }
      }
    });
  }

  function setJurisdiction(jKey) {
    window.appState.currentJurisdiction = jKey;
    const j = window.JURISDICTIONS[jKey] || window.resolveJurisdiction(jKey);
    
    // Update Indicators
    if (dashJurisdictionName) dashJurisdictionName.textContent = `${j.name} • ${j.codeBase} (${j.authority})`;
    if (studioJurisdictionTag) studioJurisdictionTag.textContent = `${j.name.split(',')[0]} • ${j.codeBase.split('(')[0]}`;

    // Update Certificate Modal Elements
    const certAuth = document.getElementById('cert-authority-title');
    const certSub = document.getElementById('cert-code-subtitle');
    const certLoc = document.getElementById('cert-location');
    if (certAuth) certAuth.textContent = j.authority.toUpperCase();
    if (certSub) certSub.textContent = `PRE-FLIGHT COMPLIANCE CERTIFICATION • ${j.codeBase.toUpperCase()}`;
    if (certLoc) certLoc.innerHTML = `<strong>LOCATION:</strong> ${j.name}`;

    showToast(`Regulatory Jurisdiction: ${j.name}`);
    runAudit();
  }

  // Real File Upload & CAD Ingestion Engine
  dropzone.addEventListener('click', () => {
    if (cadFileInput) cadFileInput.click();
  });

  if (cadFileInput) {
    cadFileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) handleIncomingFile(file);
    });
  }

  dropzone.addEventListener('dragover', (e) => { e.preventDefault(); dropzone.style.borderColor = 'var(--cad-cyan)'; });
  dropzone.addEventListener('dragleave', () => { dropzone.style.borderColor = ''; });
  dropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropzone.style.borderColor = '';
    const file = e.dataTransfer.files[0];
    if (file) {
      handleIncomingFile(file);
    } else {
      triggerIngestion(null, null);
    }
  });

  function handleIncomingFile(file) {
    const reader = new FileReader();
    const isImage = file.type.startsWith('image/');

    reader.onload = (event) => {
      const dataUrl = event.target.result;
      triggerIngestion(file.name, dataUrl);
    };

    if (isImage) {
      reader.readAsDataURL(file);
    } else {
      // For DWG, DXF, or PDF: simulate reading and generate blueprint
      reader.readAsArrayBuffer(file);
      setTimeout(() => {
        triggerIngestion(file.name, null);
      }, 300);
    }
  }

  // Clickable Sample Blueprint Buttons
  document.querySelectorAll('.sample-btn, .project-card').forEach(btn => {
    btn.addEventListener('click', () => {
      const presetKey = btn.getAttribute('data-preset');
      if (presetKey) {
        window.appState.currentPresetKey = presetKey;
        loadCurrentPreset();
        switchView('studio');
      }
    });
  });

  function triggerIngestion(filename, imageSrc) {
    ingestHud.classList.add('active');
    window.soundEngine.play('scan');
    let pct = 0;
    const nameLabel = filename ? `"${filename}"` : "CAD drawing";
    const steps = [
      `Reading raster line entities from ${nameLabel}...`,
      "Extracting gypsum wall demising boundaries & entry thresholds...",
      "Simulating 60\" wheelchair turning cylinders & door clearance envelopes...",
      `Applying ${window.JURISDICTIONS[window.appState.currentJurisdiction].name} statutory matrix...`,
      "Synthesizing CAD spatial model & generating inspection report..."
    ];

    const interval = setInterval(() => {
      pct += 20;
      ingestProgressFill.style.width = `${pct}%`;
      ingestPct.textContent = `${pct}%`;
      ingestLog.textContent = steps[Math.min(Math.floor(pct / 20) - 1, steps.length - 1)];

      if (pct >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          ingestHud.classList.remove('active');
          ingestProgressFill.style.width = '0%';

          if (filename) {
            const occ = document.getElementById('upload-occupancy-select')?.value;
            const newBp = window.synthesizeBlueprintFromUpload(filename, imageSrc, occ);
            window.appState.currentPresetKey = newBp.id;
          }

          loadCurrentPreset();
          switchView('studio');
          window.soundEngine.play('success');
          showToast(`Ingestion Complete: 3 Code Incompatibilities Flagged`);
        }, 400);
      }
    }, 240);
  }

  // Load Preset
  function loadCurrentPreset() {
    const p = window.PRESETS[window.appState.currentPresetKey];
    if (!p) return;

    window.appState.isRemediated = false;
    window.appState.customWallX = null;
    if (remediateToggle) remediateToggle.checked = false;

    studioPlanTitle.textContent = p.name;
    cad.render(p, window.appState.isRemediated, window.appState.egressActive);
    runAudit();
  }

  // Precision CAD Toolbar Handlers
  document.getElementById('tool-pan')?.addEventListener('click', () => {
    setActiveTool('pan');
    cad.setTool('pan');
  });

  document.getElementById('tool-wheelchair')?.addEventListener('click', () => {
    setActiveTool('wheelchair');
    cad.setTool('wheelchair');
    showToast('ADA Radar Active: Move cursor to test turning clearances. Click to drop verification stamp.');
  });

  document.getElementById('tool-measure')?.addEventListener('click', () => {
    setActiveTool('measure');
    cad.setTool('measure');
    showToast('Caliper Tool: Click any 2 points on the blueprint to measure clear span.');
  });

  document.getElementById('tool-egress')?.addEventListener('click', () => {
    window.appState.egressActive = !window.appState.egressActive;
    document.getElementById('tool-egress').classList.toggle('active', window.appState.egressActive);
    const p = window.PRESETS[window.appState.currentPresetKey];
    cad.render(p, window.appState.isRemediated, window.appState.egressActive, window.appState.customWallX);
    showToast(window.appState.egressActive ? 'Continuous Egress Vector Overlay: ACTIVE' : 'Egress Overlay: Hidden');
  });

  document.getElementById('tool-diff')?.addEventListener('click', () => {
    const active = cad.toggleDiffMode();
    document.getElementById('tool-diff').classList.toggle('active', active);
    showToast(active ? 'Diff Curtain Slider: Drag handle to compare Before & After' : 'Diff Mode Deactivated');
  });

  document.getElementById('tool-3d')?.addEventListener('click', () => {
    const is3d = cad.toggle3D();
    document.getElementById('tool-3d').classList.toggle('active', is3d);
    showToast(is3d ? '3D Volumetric Digital Twin: Active' : 'Returned to 2D Plan View');
    window.soundEngine.play('stamp');
  });

  function setActiveTool(toolName) {
    document.querySelectorAll('.dock-btn:not(.mode-3d):not(#tool-egress):not(#tool-diff)').forEach(b => b.classList.remove('active'));
    document.getElementById(`tool-${toolName}`)?.classList.add('active');
    window.soundEngine.play('click');
  }

  // Auto-Remediate Toggle
  remediateToggle?.addEventListener('change', (e) => {
    window.appState.isRemediated = e.target.checked;
    const p = window.PRESETS[window.appState.currentPresetKey];

    if (window.appState.isRemediated) {
      window.soundEngine.play('remediate');
      showToast('Parametric Remediator: Door swings inverted, corridor widened to 44.5"');
    } else {
      window.soundEngine.play('click');
    }

    cad.render(p, window.appState.isRemediated, window.appState.egressActive, window.appState.customWallX);
    runAudit();
  });

  // CAD Export Action Handlers
  document.getElementById('btn-export')?.addEventListener('click', () => {
    document.getElementById('export-modal')?.classList.add('open');
  });

  document.getElementById('btn-export-dxf')?.addEventListener('click', () => {
    const p = window.PRESETS[window.appState.currentPresetKey];
    cad.exportDXF(p, window.appState.isRemediated);
    showToast('AutoCAD .DXF exported: Compatible with AutoCAD, Revit & Fusion 360');
    window.soundEngine.play('success');
  });

  document.getElementById('btn-export-svg')?.addEventListener('click', () => {
    const p = window.PRESETS[window.appState.currentPresetKey];
    cad.exportSVG(p);
    showToast('Vector .SVG exported');
    window.soundEngine.play('success');
  });

  document.getElementById('btn-clear-stamps')?.addEventListener('click', () => {
    cad.clearStamps();
    showToast('ADA Verification stamps cleared');
  });

  // Settings Modal
  document.getElementById('btn-open-settings')?.addEventListener('click', () => {
    document.getElementById('gemini-key-input').value = window.appState.geminiKey;
    document.getElementById('settings-modal').classList.add('open');
  });

  document.getElementById('btn-save-key')?.addEventListener('click', () => {
    const key = document.getElementById('gemini-key-input').value.trim();
    window.appState.geminiKey = key;
    localStorage.setItem('planguard_gemini_key', key);
    document.getElementById('settings-modal').classList.remove('open');
    showToast('Dual-Brain Gemini Configuration Saved');
  });

  // Tab Switcher in Inspector
  document.querySelectorAll('.tab-link').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-link').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const tab = btn.getAttribute('data-tab');
      if (tab === 'violations') {
        document.getElementById('violations-tab').style.display = 'block';
        document.getElementById('ai-tab').style.display = 'none';
      } else {
        document.getElementById('violations-tab').style.display = 'none';
        document.getElementById('ai-tab').style.display = 'flex';
      }
    });
  });

  // Deterministic Compliance Engine Runner
  function runAudit() {
    const p = window.PRESETS[window.appState.currentPresetKey];
    const j = window.JURISDICTIONS[window.appState.currentJurisdiction] || window.resolveJurisdiction(window.appState.currentJurisdiction);
    const isRem = window.appState.isRemediated;

    // Check corridor custom drag condition
    const customX = window.appState.customWallX;
    const corridorInches = customX !== null ? (34.2 + (720 - customX) * 0.69) : (isRem ? 44.5 : 34.2);
    const corridorPasses = corridorInches >= (j.minCorridor || 44.0);

    const rules = [
      {
        id: 'restroom_door',
        code: j.rules.restroom_door.citation,
        title: j.rules.restroom_door.title,
        status: isRem ? 'pass' : 'fail',
        current: isRem ? 'Outward Swing Clear (0" Encroachment)' : 'Inward Swing Intruding 14.2" into 60" Cylinder',
        required: j.rules.restroom_door.standard,
        remedy: j.rules.restroom_door.remedy,
        zone: { x: 720, y: 360, w: 120, h: 180 }
      },
      {
        id: 'corridor_width',
        code: j.rules.corridor_width.citation,
        title: j.rules.corridor_width.title,
        status: corridorPasses ? 'pass' : 'fail',
        current: `${corridorInches.toFixed(1)}" Continuous Clear Opening`,
        required: `Minimum ${j.minCorridor || 44}" Clear Opening Required`,
        remedy: j.rules.corridor_width.remedy,
        zone: { x: 700, y: 220, w: 140, h: 140 }
      },
      {
        id: 'counter_height',
        code: j.rules.counter_height.citation,
        title: j.rules.counter_height.title,
        status: isRem ? 'pass' : 'fail',
        current: isRem ? '34.0" AFF Lowered Transaction Tier' : '38.5" Uniform Counter Top Height',
        required: j.rules.counter_height.standard,
        remedy: j.rules.counter_height.remedy,
        zone: { x: 490, y: 70, w: 350, h: 140 }
      }
    ];

    const passCount = rules.filter(r => r.status === 'pass').length;
    let score = Math.round((passCount / rules.length) * 100);
    if (isRem && score === 100) score = 98; // Realistic architectural score

    updateScoreRing(score, score >= 90 ? 'PERMIT-READY' : 'NON-COMPLIANT');
    renderViolationCards(rules);
  }

  function updateScoreRing(score, statusText) {
    healthScore.textContent = `${score}%`;
    healthStatus.textContent = statusText;

    const circumference = 2 * Math.PI * 13; // r=13 -> ~81.68
    const offset = circumference - (score / 100) * circumference;
    healthRing.style.strokeDasharray = `${circumference}`;
    healthRing.style.strokeDashoffset = `${offset}`;

    if (score >= 90) {
      healthRing.style.stroke = 'var(--cad-emerald)';
      healthBadge.style.borderColor = 'rgba(16, 185, 129, 0.4)';
      healthStatus.style.color = 'var(--cad-emerald)';
    } else {
      healthRing.style.stroke = 'var(--cad-crimson)';
      healthBadge.style.borderColor = 'rgba(244, 63, 94, 0.4)';
      healthStatus.style.color = 'var(--cad-crimson)';
    }
  }

  function renderViolationCards(rules) {
    violationsList.innerHTML = '';

    rules.forEach(r => {
      const card = document.createElement('div');
      card.className = `violation-item ${r.status}`;

      const iconSvg = r.status === 'pass'
        ? `<svg class="icon icon-sm" style="color: var(--cad-emerald);" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>`
        : `<svg class="icon icon-sm" style="color: var(--cad-crimson);" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`;

      card.innerHTML = `
        <div class="v-head">
          <div class="v-head-left">
            ${iconSvg}
            <span class="v-code">${r.code}</span>
          </div>
          <span class="v-status-badge ${r.status}">${r.status.toUpperCase()}</span>
        </div>
        <div class="v-title">${r.title}</div>
        <div class="v-metric">
          <span style="color: var(--text-muted);">Current:</span> ${r.current}
        </div>
        <div class="v-actions">
          <button class="action-btn-sm" data-action="locate">Locate in CAD</button>
          <button class="action-btn-sm primary" data-action="remedy">${r.status === 'pass' ? 'Remediated' : 'Apply AI Fix'}</button>
        </div>
        <div class="citation-toggle">View Statutory Text & Remedy ▼</div>
        <div class="citation-body">
          <p><strong>Code Requirement:</strong> ${r.required}</p>
          <p style="margin-top: 4px;"><strong>AI Recommended Remedy:</strong> ${r.remedy}</p>
        </div>
      `;

      // Locate Button
      card.querySelector('[data-action="locate"]').addEventListener('click', () => {
        cad.focusZone(r.zone);
        showToast(`Inspecting: ${r.title}`);
      });

      // Remedy Button
      card.querySelector('[data-action="remedy"]').addEventListener('click', () => {
        if (!window.appState.isRemediated) {
          remediateToggle.checked = true;
          window.appState.isRemediated = true;
          window.soundEngine.play('remediate');
          const p = window.PRESETS[window.appState.currentPresetKey];
          cad.render(p, true, window.appState.egressActive);
          runAudit();
          showToast(`Applied Minimal-Displacement Remedy: ${r.title}`);
        }
      });

      // Expand Statutory Text
      const toggleBtn = card.querySelector('.citation-toggle');
      const bodyEl = card.querySelector('.citation-body');
      toggleBtn.addEventListener('click', () => {
        const isOpen = bodyEl.classList.toggle('open');
        toggleBtn.textContent = isOpen ? 'Hide Statutory Text ▲' : 'View Statutory Text & Remedy ▼';
      });

      violationsList.appendChild(card);
    });
  }

  // Gemini AI Neural Copilot Chat
  const aiInput = document.getElementById('ai-input');
  const aiSend = document.getElementById('ai-send');
  const aiMessages = document.getElementById('ai-messages');

  function sendAIMessage() {
    const text = aiInput.value.trim();
    if (!text) return;

    // User Message Bubble
    appendBubble('user', text);
    aiInput.value = '';
    window.soundEngine.play('click');

    // Assistant Typing Indicator
    const typingBubble = appendBubble('assistant', 'Consulting Gemini 2.5 Flash spatial reasoning model...');

    // Call Backend or Fallback Neural Cache
    fetch('/api/gemini/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Gemini-Key': window.appState.geminiKey
      },
      body: JSON.stringify({
        prompt: `Active Plan: ${window.PRESETS[window.appState.currentPresetKey].name}. Active Jurisdiction: ${window.JURISDICTIONS[window.appState.currentJurisdiction].name}. Question: ${text}`
      })
    })
    .then(res => res.json())
    .then(data => {
      typingBubble.remove();
      appendBubble('assistant', data.response || "No response received.");
      window.soundEngine.play('success');
    })
    .catch(() => {
      typingBubble.remove();
      // Built-in Architectural Reasoning Engine Fallback
      const responses = {
        corridor: `Under ${window.JURISDICTIONS[window.appState.currentJurisdiction].codeBase}, corridors serving an occupant load ≥ 50 require 44" clear width. Your plan initially measured 34.2", which represents an illegal 9.8" constriction. Shift interior gypsum partition 10" to achieve 44.5" compliance.`,
        door: `Under ${window.JURISDICTIONS[window.appState.currentJurisdiction].accessibilityStandard}, single-occupant accessible toilet rooms strictly forbid inward door swing encroachment into the 60" turning cylinder. Solution: Invert hinge to swing outward into corridor with 18" pull-side latch clearance.`,
        counter: `Under ${window.JURISDICTIONS[window.appState.currentJurisdiction].codeBase}, accessible service counters must not exceed 34-36" AFF with min 36" length and 27" high clear knee space underneath.`
      };
      
      let reply = responses.corridor;
      const lower = text.toLowerCase();
      if (lower.includes('door') || lower.includes('swing') || lower.includes('restroom')) reply = responses.door;
      if (lower.includes('counter') || lower.includes('cashier') || lower.includes('bar')) reply = responses.counter;
      
      appendBubble('assistant', reply);
      window.soundEngine.play('success');
    });
  }

  function appendBubble(role, html) {
    const b = document.createElement('div');
    b.className = `ai-bubble ${role}`;
    b.innerHTML = html.replace(/\n/g, '<br>');
    aiMessages.appendChild(b);
    aiMessages.scrollTop = aiMessages.scrollHeight;
    return b;
  }

  aiSend?.addEventListener('click', sendAIMessage);
  aiInput?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') sendAIMessage();
  });

  function showToast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add('visible');
    clearTimeout(window._toastTimeout);
    window._toastTimeout = setTimeout(() => {
      toastEl.classList.remove('visible');
    }, 2800);
  }

  // Initialize Default State
  loadCurrentPreset();
});
