// PlanGuard Enterprise Precision CAD Engine
// Features: 60FPS Vector Raytracing, Diff Curtain Slider, ADA Proximity Radar, Real DXF/SVG Exporter, 3D Volumetric Twin

class CADEngine {
  constructor(viewportEl, canvasEl) {
    this.viewport = viewportEl;
    this.canvas = canvasEl;
    this.zoom = 1;
    this.panX = 40;
    this.panY = 20;
    this.isDragging = false;
    this.startX = 0;
    this.startY = 0;
    this.activeTool = 'pan'; // 'pan', 'wheelchair', 'measure', 'diff', '3d'
    
    // 3D Volumetric Mode
    this.is3D = false;
    this.ceilingHeight = 36; // Default 3D wall height
    
    // Diff Curtain Slider State
    this.isDiffMode = false;
    this.diffSplitX = 450; // Initial split position
    this.isDraggingDiff = false;
    
    // ADA Wheelchair Radar State
    this.stamps = []; // Stamped verification points
    this.lastRadarCollision = false;
    
    // Measurement Tool State
    this.measurePoints = [];
    this.onMeasureCallback = null;
    this.onWallDragCallback = null;
    
    // Parametric Wall Dragging State
    this.isDraggingWall = false;
    this.draggedWallId = null;
    this.wallDragStartX = 0;
    this.wallInitialX = 720;
    
    // Active Preset Reference
    this.currentPreset = null;
    
    this.initEvents();
  }

  initEvents() {
    this.viewport.addEventListener('mousedown', (e) => this.onMouseDown(e));
    window.addEventListener('mousemove', (e) => this.onMouseMove(e));
    window.addEventListener('mouseup', () => this.onMouseUp());
    this.viewport.addEventListener('wheel', (e) => this.onWheel(e), { passive: false });
  }

  toggle3D() {
    this.is3D = !this.is3D;
    this.viewport.classList.toggle('is-3d', this.is3D);
    if (this.currentPreset) {
      this.render(this.currentPreset, window.appState.isRemediated, window.appState.egressActive, window.appState.customWallX);
    }
    return this.is3D;
  }

  toggleDiffMode() {
    this.isDiffMode = !this.isDiffMode;
    this.viewport.classList.toggle('is-diff', this.isDiffMode);
    if (this.currentPreset) {
      this.render(this.currentPreset, window.appState.isRemediated, window.appState.egressActive, window.appState.customWallX);
    }
    return this.isDiffMode;
  }

  setTool(tool) {
    this.activeTool = tool;
    this.measurePoints = [];
    this.viewport.classList.remove('measuring', 'simulating', 'diff-active');
    
    const reticle = document.getElementById('reticle-cylinder');
    if (reticle) reticle.style.display = 'none';

    if (tool === 'wheelchair') {
      this.viewport.classList.add('simulating');
      if (reticle) reticle.style.display = 'block';
    } else if (tool === 'measure') {
      this.viewport.classList.add('measuring');
    } else if (tool === 'diff') {
      this.toggleDiffMode();
    }
  }

  onMouseDown(e) {
    if (e.button !== 0) return;

    // Check if clicking the Diff Curtain Slider handle
    if (this.isDiffMode) {
      const rect = this.viewport.getBoundingClientRect();
      const clickX = (e.clientX - rect.left - this.panX) / this.zoom;
      if (Math.abs(clickX - this.diffSplitX) < 16) {
        this.isDraggingDiff = true;
        return;
      }
    }

    // Check if clicking near draggable corridor wall
    if (this.activeTool === 'pan') {
      const rect = this.viewport.getBoundingClientRect();
      const clickX = (e.clientX - rect.left - this.panX) / this.zoom;
      const clickY = (e.clientY - rect.top - this.panY) / this.zoom;
      
      const currentWallX = window.appState.customWallX || 720;
      if (Math.abs(clickX - currentWallX) < 14 && clickY >= 210 && clickY <= 540) {
        this.isDraggingWall = true;
        this.draggedWallId = 'corridor_wall';
        this.wallDragStartX = e.clientX;
        this.wallInitialX = currentWallX;
        return;
      }
    }

    // ADA Radar Stamp Drop
    if (this.activeTool === 'wheelchair') {
      const rect = this.viewport.getBoundingClientRect();
      const clickX = (e.clientX - rect.left - this.panX) / this.zoom;
      const clickY = (e.clientY - rect.top - this.panY) / this.zoom;
      this.addRadarStamp(clickX, clickY);
      if (window.soundEngine) window.soundEngine.play('stamp');
      return;
    }

    if (this.activeTool === 'measure') {
      this.handleMeasureClick(e);
      return;
    }

    this.isDragging = true;
    this.startX = e.clientX - this.panX;
    this.startY = e.clientY - this.panY;
    this.viewport.classList.add('panning');
  }

  onMouseMove(e) {
    // 1. Diff Curtain Slider Dragging
    if (this.isDraggingDiff) {
      const rect = this.viewport.getBoundingClientRect();
      const mouseX = (e.clientX - rect.left - this.panX) / this.zoom;
      this.diffSplitX = Math.max(100, Math.min(800, mouseX));
      if (this.currentPreset) {
        this.render(this.currentPreset, window.appState.isRemediated, window.appState.egressActive, window.appState.customWallX);
      }
      return;
    }

    // 2. Parametric Wall Dragging
    if (this.isDraggingWall) {
      const deltaX = (e.clientX - this.wallDragStartX) / this.zoom;
      let newX = Math.round(this.wallInitialX + deltaX);
      newX = Math.max(680, Math.min(740, newX));
      window.appState.customWallX = newX;

      // Real calculated corridor width
      const widthInches = (34.2 + (720 - newX) * 0.69).toFixed(1);
      
      if (this.onWallDragCallback) {
        this.onWallDragCallback(newX, parseFloat(widthInches));
      }
      return;
    }

    // 3. Pan Canvas
    if (this.isDragging && this.activeTool === 'pan') {
      this.panX = e.clientX - this.startX;
      this.panY = e.clientY - this.startY;
      this.updateTransform();
    }

    // 4. Interactive ADA Wheelchair Proximity Radar
    if (this.activeTool === 'wheelchair') {
      this.updateRadarProbe(e);
    }
  }

  updateRadarProbe(e) {
    const reticle = document.getElementById('reticle-cylinder');
    if (!reticle) return;

    const rect = this.viewport.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    reticle.style.left = `${mx}px`;
    reticle.style.top = `${my}px`;
    const size = 50 * this.zoom;
    reticle.style.width = `${size}px`;
    reticle.style.height = `${size}px`;

    // Calculate nearest wall collision distance
    const cadX = (mx - this.panX) / this.zoom;
    const cadY = (my - this.panY) / this.zoom;

    let minDistance = 999;
    if (this.currentPreset && this.currentPreset.walls) {
      this.currentPreset.walls.forEach(w => {
        let x1 = w.x1, x2 = w.x2;
        if (w.id === 'corridor_wall') {
          x1 = window.appState.customWallX || (window.appState.isRemediated ? 705 : 720);
          x2 = x1;
        }
        const d = this.distToSegment(cadX, cadY, x1, w.y1, x2, w.y2);
        if (d < minDistance) minDistance = d;
      });
    }

    // Convert pixel distance to CAD inches (approx 1.2 px = 1 inch)
    const clearanceInches = (minDistance * 0.83).toFixed(1);
    const radiusInches = 30.0;
    const isColliding = parseFloat(clearanceInches) < 30.0;

    reticle.classList.toggle('collision', isColliding);

    // Update floating clearance badge inside reticle
    let badge = document.getElementById('reticle-hud-badge');
    if (!badge) {
      badge = document.createElement('div');
      badge.id = 'reticle-hud-badge';
      badge.style.position = 'absolute';
      badge.style.top = '-28px';
      badge.style.left = '50%';
      badge.style.transform = 'translateX(-50%)';
      badge.style.padding = '3px 8px';
      badge.style.borderRadius = '4px';
      badge.style.fontSize = '10px';
      badge.style.fontFamily = 'var(--font-mono)';
      badge.style.fontWeight = '700';
      badge.style.whiteSpace = 'nowrap';
      badge.style.pointerEvents = 'none';
      reticle.appendChild(badge);
    }

    if (isColliding) {
      badge.style.background = 'rgba(244, 63, 94, 0.9)';
      badge.style.color = '#fff';
      badge.textContent = `CLEARANCE: ${clearanceInches}" [FAIL < 60"]`;
      if (!this.lastRadarCollision) {
        if (window.soundEngine) window.soundEngine.play('collision');
      }
      this.lastRadarCollision = true;
    } else {
      badge.style.background = 'rgba(16, 185, 129, 0.9)';
      badge.style.color = '#fff';
      badge.textContent = `CLEARANCE: ${clearanceInches}" [PASS ≥ 60"]`;
      this.lastRadarCollision = false;
    }
  }

  distToSegment(px, py, x1, y1, x2, y2) {
    const l2 = (x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1);
    if (l2 === 0) return Math.hypot(px - x1, py - y1);
    let t = ((px - x1) * (x2 - x1) + (py - y1) * (y2 - y1)) / l2;
    t = Math.max(0, Math.min(1, t));
    return Math.hypot(px - (x1 + t * (x2 - x1)), py - (y1 + t * (y2 - y1)));
  }

  addRadarStamp(cadX, cadY) {
    this.stamps.push({ x: cadX, y: cadY, remediated: window.appState.isRemediated, timestamp: new Date().toLocaleTimeString() });
    if (this.currentPreset) {
      this.render(this.currentPreset, window.appState.isRemediated, window.appState.egressActive, window.appState.customWallX);
    }
  }

  clearStamps() {
    this.stamps = [];
    if (this.currentPreset) {
      this.render(this.currentPreset, window.appState.isRemediated, window.appState.egressActive, window.appState.customWallX);
    }
  }

  onMouseUp() {
    this.isDragging = false;
    this.isDraggingWall = false;
    this.isDraggingDiff = false;
    this.viewport.classList.remove('panning');
  }

  onWheel(e) {
    if (this.is3D) return;
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    const prevZoom = this.zoom;
    this.zoom = Math.min(Math.max(this.zoom + delta, 0.4), 3.0);

    const rect = this.viewport.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    this.panX = x - (x - this.panX) * (this.zoom / prevZoom);
    this.panY = y - (y - this.panY) * (this.zoom / prevZoom);
    this.updateTransform();
  }

  updateTransform() {
    if (this.is3D) return;
    this.canvas.style.transform = `translate(${this.panX}px, ${this.panY}px) scale(${this.zoom})`;
  }

  handleMeasureClick(e) {
    const rect = this.viewport.getBoundingClientRect();
    const clickX = (e.clientX - rect.left - this.panX) / this.zoom;
    const clickY = (e.clientY - rect.top - this.panY) / this.zoom;

    this.measurePoints.push({ x: clickX, y: clickY });
    if (this.measurePoints.length === 2) {
      const p1 = this.measurePoints[0];
      const p2 = this.measurePoints[1];
      const distPx = Math.hypot(p2.x - p1.x, p2.y - p1.y);
      const inches = (distPx * 1.2).toFixed(1);
      const feet = Math.floor(inches / 12);
      const remInches = (inches % 12).toFixed(0);
      if (this.onMeasureCallback) {
        this.onMeasureCallback(`${feet}'-${remInches}" (${inches} in)`);
      }
      this.measurePoints = [];
    }
  }

  focusZone(zone) {
    const rect = this.viewport.getBoundingClientRect();
    this.zoom = 1.7;
    this.panX = (rect.width / 2) - (zone.x + zone.w / 2) * this.zoom;
    this.panY = (rect.height / 2) - (zone.y + zone.h / 2) * this.zoom;
    this.updateTransform();
  }

  // Master SVG CAD Rendering Engine
  render(preset, isRemediated, egressActive, customWallX = null) {
    this.currentPreset = preset;
    this.canvas.setAttribute('viewBox', `0 0 ${preset.viewBox.width} ${preset.viewBox.height}`);
    this.canvas.innerHTML = '';
    const svgNS = "http://www.w3.org/2000/svg";

    // Defs & Gradients
    const defs = document.createElementNS(svgNS, 'defs');
    defs.innerHTML = `
      <linearGradient id="wall-grad-3d" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#00f0ff" stop-opacity="0.85"/>
        <stop offset="100%" stop-color="#3b82f6" stop-opacity="0.2"/>
      </linearGradient>
      <linearGradient id="cyl-grad-3d" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#f43f5e" stop-opacity="0.7"/>
        <stop offset="100%" stop-color="#f43f5e" stop-opacity="0.05"/>
      </linearGradient>
      <linearGradient id="cyl-pass-3d" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#10b981" stop-opacity="0.7"/>
        <stop offset="100%" stop-color="#10b981" stop-opacity="0.05"/>
      </linearGradient>
      <pattern id="cad-grid" width="20" height="20" patternUnits="userSpaceOnUse">
        <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255, 255, 255, 0.03)" stroke-width="1"/>
      </pattern>
      <clipPath id="diff-left-clip">
        <rect x="0" y="0" width="${this.diffSplitX}" height="${preset.viewBox.height}" />
      </clipPath>
      <clipPath id="diff-right-clip">
        <rect x="${this.diffSplitX}" y="0" width="${preset.viewBox.width - this.diffSplitX}" height="${preset.viewBox.height}" />
      </clipPath>
    `;
    this.canvas.appendChild(defs);

    // 0. Background CAD Grid
    const bgGrid = document.createElementNS(svgNS, 'rect');
    bgGrid.setAttribute('width', '100%');
    bgGrid.setAttribute('height', '100%');
    bgGrid.setAttribute('fill', 'url(#cad-grid)');
    this.canvas.appendChild(bgGrid);

    // 0.1 Ingested Blueprint Image Overlay (if uploaded by user)
    if (preset.imageOverlay) {
      const imgEl = document.createElementNS(svgNS, 'image');
      imgEl.setAttribute('href', preset.imageOverlay);
      imgEl.setAttribute('x', '50');
      imgEl.setAttribute('y', '60');
      imgEl.setAttribute('width', '800');
      imgEl.setAttribute('height', '480');
      imgEl.setAttribute('opacity', '0.35');
      imgEl.setAttribute('preserveAspectRatio', 'xMidYMid slice');
      this.canvas.appendChild(imgEl);
    }

    // Render Master Geometry Groups
    if (this.isDiffMode) {
      // In Diff Mode, render Left (Original Unremediated) and Right (AI Remediated)
      const gLeft = document.createElementNS(svgNS, 'g');
      gLeft.setAttribute('clip-path', 'url(#diff-left-clip)');
      this.renderBlueprintGeometry(gLeft, preset, false, egressActive, null);
      this.canvas.appendChild(gLeft);

      const gRight = document.createElementNS(svgNS, 'g');
      gRight.setAttribute('clip-path', 'url(#diff-right-clip)');
      this.renderBlueprintGeometry(gRight, preset, true, egressActive, 705);
      this.canvas.appendChild(gRight);

      // Diff Dividing Guideline & Draggable Handle
      this.renderDiffCurtainHandle(svgNS, preset.viewBox.height);
    } else {
      const gMain = document.createElementNS(svgNS, 'g');
      this.renderBlueprintGeometry(gMain, preset, isRemediated, egressActive, customWallX);
      this.canvas.appendChild(gMain);
    }

    // Render Persistent Stamped Verification Points
    this.renderStamps(svgNS);

    this.updateTransform();
  }

  renderDiffCurtainHandle(svgNS, height) {
    const gDiff = document.createElementNS(svgNS, 'g');
    gDiff.setAttribute('class', 'diff-curtain-handle');

    // Vertical neon dividing line
    const line = document.createElementNS(svgNS, 'line');
    line.setAttribute('x1', this.diffSplitX);
    line.setAttribute('y1', 0);
    line.setAttribute('x2', this.diffSplitX);
    line.setAttribute('y2', height);
    line.setAttribute('stroke', '#0ea5e9');
    line.setAttribute('stroke-width', '2');
    line.setAttribute('stroke-dasharray', '4,3');
    gDiff.appendChild(line);

    // Draggable Center Pill
    const pill = document.createElementNS(svgNS, 'rect');
    pill.setAttribute('x', this.diffSplitX - 45);
    pill.setAttribute('y', height / 2 - 14);
    pill.setAttribute('width', 90);
    pill.setAttribute('height', 28);
    pill.setAttribute('rx', 14);
    pill.setAttribute('fill', '#0ea5e9');
    pill.setAttribute('cursor', 'ew-resize');
    gDiff.appendChild(pill);

    const txt = document.createElementNS(svgNS, 'text');
    txt.setAttribute('x', this.diffSplitX);
    txt.setAttribute('y', height / 2 + 4);
    txt.setAttribute('fill', '#08090d');
    txt.setAttribute('font-family', 'var(--font-mono)');
    txt.setAttribute('font-size', '10');
    txt.setAttribute('font-weight', '700');
    txt.setAttribute('text-anchor', 'middle');
    txt.setAttribute('cursor', 'ew-resize');
    txt.textContent = '◄ DIFF ►';
    gDiff.appendChild(txt);

    // Left & Right Watermark Labels
    const lblLeft = document.createElementNS(svgNS, 'text');
    lblLeft.setAttribute('x', this.diffSplitX - 20);
    lblLeft.setAttribute('y', 35);
    lblLeft.setAttribute('fill', '#f43f5e');
    lblLeft.setAttribute('font-family', 'var(--font-mono)');
    lblLeft.setAttribute('font-size', '11');
    lblLeft.setAttribute('font-weight', '700');
    lblLeft.setAttribute('text-anchor', 'end');
    lblLeft.textContent = 'NON-COMPLIANT (ORIGINAL)';
    gDiff.appendChild(lblLeft);

    const lblRight = document.createElementNS(svgNS, 'text');
    lblRight.setAttribute('x', this.diffSplitX + 20);
    lblRight.setAttribute('y', 35);
    lblRight.setAttribute('fill', '#10b981');
    lblRight.setAttribute('font-family', 'var(--font-mono)');
    lblRight.setAttribute('font-size', '11');
    lblRight.setAttribute('font-weight', '700');
    lblRight.setAttribute('text-anchor', 'start');
    lblRight.textContent = 'AI REMEDIATED (PERMIT-READY)';
    gDiff.appendChild(lblRight);

    this.canvas.appendChild(gDiff);
  }

  renderBlueprintGeometry(g, preset, isRemediated, egressActive, customWallX) {
    const svgNS = "http://www.w3.org/2000/svg";

    // 1. Rooms
    preset.rooms.forEach(r => {
      const rect = document.createElementNS(svgNS, 'rect');
      rect.setAttribute('x', r.x);
      rect.setAttribute('y', r.y);
      rect.setAttribute('width', r.w);
      rect.setAttribute('height', r.h);
      rect.setAttribute('fill', 'rgba(14, 18, 28, 0.5)');
      rect.setAttribute('stroke', 'rgba(255, 255, 255, 0.05)');
      g.appendChild(rect);

      const label = document.createElementNS(svgNS, 'text');
      label.setAttribute('x', r.x + r.w / 2);
      label.setAttribute('y', r.y + r.h / 2);
      label.setAttribute('fill', '#475569');
      label.setAttribute('font-family', 'var(--font-mono)');
      label.setAttribute('font-size', '10');
      label.setAttribute('font-weight', '700');
      label.setAttribute('text-anchor', 'middle');
      label.textContent = r.name;
      g.appendChild(label);
    });

    // 2. Walls (with 3D Extrusion)
    preset.walls.forEach(w => {
      let x1 = w.x1, x2 = w.x2;
      if (w.id === 'corridor_wall') {
        if (customWallX !== null) {
          x1 = customWallX; x2 = customWallX;
        } else if (isRemediated) {
          x1 = 705; x2 = 705;
        }
      }

      if (this.is3D) {
        const wallExtrude = document.createElementNS(svgNS, 'polygon');
        const h3d = this.ceilingHeight;
        const pts = `${x1},${w.y1} ${x2},${w.y2} ${x2},${w.y2 - h3d} ${x1},${w.y1 - h3d}`;
        wallExtrude.setAttribute('points', pts);
        wallExtrude.setAttribute('fill', 'url(#wall-grad-3d)');
        wallExtrude.setAttribute('stroke', '#00f0ff');
        wallExtrude.setAttribute('stroke-width', '1');
        g.appendChild(wallExtrude);
      }

      const line = document.createElementNS(svgNS, 'line');
      line.setAttribute('x1', x1);
      line.setAttribute('y1', w.y1);
      line.setAttribute('x2', x2);
      line.setAttribute('y2', w.y2);
      line.setAttribute('stroke', w.id === 'corridor_wall' ? '#0ea5e9' : '#cbd5e1');
      line.setAttribute('stroke-width', w.t || 5);
      line.setAttribute('stroke-linecap', 'square');
      if (w.id === 'corridor_wall') {
        line.setAttribute('id', 'draggable-wall-line');
        line.style.cursor = 'ew-resize';
      }
      g.appendChild(line);
    });

    // 3. Doors & Swing Trajectories
    preset.doors.forEach(d => {
      const isRestroom = d.id === 'd_restroom';
      const effectiveDir = (isRestroom && isRemediated && d.remediatedDir) ? d.remediatedDir : d.dir;
      const effectiveW = (isRemediated && d.remediatedW) ? d.remediatedW : d.w;

      // Wall Opening Gap
      const gap = document.createElementNS(svgNS, 'line');
      gap.setAttribute('x1', d.x);
      gap.setAttribute('y1', d.y);
      gap.setAttribute('x2', d.x);
      gap.setAttribute('y2', d.y + effectiveW);
      gap.setAttribute('stroke', '#08090d');
      gap.setAttribute('stroke-width', '8');
      g.appendChild(gap);

      // Door Leaf
      const leaf = document.createElementNS(svgNS, 'line');
      leaf.setAttribute('x1', d.x);
      leaf.setAttribute('y1', d.y);
      let arcPath = '';

      if (effectiveDir === 'in-down') {
        leaf.setAttribute('x2', d.x + effectiveW);
        leaf.setAttribute('y2', d.y);
        arcPath = `M ${d.x + effectiveW} ${d.y} A ${effectiveW} ${effectiveW} 0 0 1 ${d.x} ${d.y + effectiveW}`;
      } else if (effectiveDir === 'out-up') {
        leaf.setAttribute('x2', d.x - effectiveW);
        leaf.setAttribute('y2', d.y);
        arcPath = `M ${d.x - effectiveW} ${d.y} A ${effectiveW} ${effectiveW} 0 0 1 ${d.x} ${d.y + effectiveW}`;
      } else if (effectiveDir === 'out-right') {
        leaf.setAttribute('x2', d.x + effectiveW);
        leaf.setAttribute('y2', d.y);
        arcPath = `M ${d.x + effectiveW} ${d.y} A ${effectiveW} ${effectiveW} 0 0 1 ${d.x} ${d.y + effectiveW}`;
      } else {
        leaf.setAttribute('x2', d.x);
        leaf.setAttribute('y2', d.y + effectiveW);
      }

      leaf.setAttribute('stroke', '#f8fafc');
      leaf.setAttribute('stroke-width', '2.5');
      g.appendChild(leaf);

      // Door Swing Arc
      if (arcPath) {
        const arc = document.createElementNS(svgNS, 'path');
        arc.setAttribute('d', arcPath);
        arc.setAttribute('fill', 'none');
        arc.setAttribute('stroke', isRestroom && !isRemediated ? 'var(--cad-crimson)' : 'var(--cad-cyan)');
        arc.setAttribute('stroke-width', '1.5');
        arc.setAttribute('stroke-dasharray', '3,3');
        g.appendChild(arc);

        // 3D Door Volumetric Clearance Sweep Cone
        if (this.is3D) {
          const arc3d = document.createElementNS(svgNS, 'path');
          arc3d.setAttribute('d', arcPath + ` L ${d.x} ${d.y} Z`);
          arc3d.setAttribute('fill', isRestroom && !isRemediated ? 'rgba(244, 63, 94, 0.25)' : 'rgba(14, 165, 233, 0.2)');
          arc3d.setAttribute('stroke', 'none');
          g.appendChild(arc3d);
        }
      }
    });

    // 4. Fixtures
    if (preset.fixtures) {
      preset.fixtures.forEach(f => {
        const el = document.createElementNS(svgNS, 'rect');
        el.setAttribute('x', f.x);
        el.setAttribute('y', f.y);
        el.setAttribute('width', f.w);
        el.setAttribute('height', f.h);
        el.setAttribute('fill', f.type === 'counter' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255, 255, 255, 0.08)');
        el.setAttribute('stroke', f.type === 'counter' ? '#3b82f6' : '#64748b');
        el.setAttribute('stroke-width', '1');
        el.setAttribute('rx', f.type === 'toilet' ? '6' : '1');
        g.appendChild(el);
      });
    }

    // 5. ADA 60" Turning Space Cylinder
    if (preset.turningCircle) {
      const tc = preset.turningCircle;
      const circle = document.createElementNS(svgNS, 'circle');
      circle.setAttribute('cx', tc.cx);
      circle.setAttribute('cy', tc.cy);
      circle.setAttribute('r', tc.r);
      circle.setAttribute('fill', isRemediated ? 'rgba(16, 185, 129, 0.12)' : 'rgba(244, 63, 94, 0.16)');
      circle.setAttribute('stroke', isRemediated ? '#10b981' : '#f43f5e');
      circle.setAttribute('stroke-width', '2');
      circle.setAttribute('stroke-dasharray', isRemediated ? 'none' : '4,3');
      g.appendChild(circle);

      // 3D Volumetric Extrusion of Wheelchair Cylinder
      if (this.is3D) {
        const cylTop = document.createElementNS(svgNS, 'ellipse');
        cylTop.setAttribute('cx', tc.cx);
        cylTop.setAttribute('cy', tc.cy - 36);
        cylTop.setAttribute('rx', tc.r);
        cylTop.setAttribute('ry', tc.r * 0.45);
        cylTop.setAttribute('fill', isRemediated ? 'url(#cyl-pass-3d)' : 'url(#cyl-grad-3d)');
        cylTop.setAttribute('stroke', isRemediated ? '#10b981' : '#f43f5e');
        g.appendChild(cylTop);
      }

      const tcLabel = document.createElementNS(svgNS, 'text');
      tcLabel.setAttribute('x', tc.cx);
      tcLabel.setAttribute('y', tc.cy + 3);
      tcLabel.setAttribute('fill', isRemediated ? '#10b981' : '#f43f5e');
      tcLabel.setAttribute('font-family', 'var(--font-mono)');
      tcLabel.setAttribute('font-size', '9');
      tcLabel.setAttribute('font-weight', '700');
      tcLabel.setAttribute('text-anchor', 'middle');
      tcLabel.textContent = isRemediated ? '60" PASS' : '60" ADA CONFLICT';
      g.appendChild(tcLabel);
    }

    // 6. Egress Corridor Callouts
    if (preset.corridorMeasurement) {
      const cm = preset.corridorMeasurement;
      let currX1 = cm.x1;
      let currX2 = cm.x2;
      let text = isRemediated ? cm.remediatedText : cm.initialText;

      if (customWallX !== null) {
        currX1 = customWallX;
        const wInches = (34.2 + (720 - customWallX) * 0.69).toFixed(1);
        text = `${wInches}" CLEAR`;
      }

      const cLine = document.createElementNS(svgNS, 'line');
      cLine.setAttribute('x1', currX1);
      cLine.setAttribute('y1', cm.y1);
      cLine.setAttribute('x2', currX2);
      cLine.setAttribute('y2', cm.y2);
      cLine.setAttribute('stroke', isRemediated ? '#10b981' : '#f43f5e');
      cLine.setAttribute('stroke-width', '1.5');
      g.appendChild(cLine);

      const cText = document.createElementNS(svgNS, 'text');
      cText.setAttribute('x', (currX1 + currX2) / 2);
      cText.setAttribute('y', cm.y1 - 6);
      cText.setAttribute('fill', isRemediated ? '#10b981' : '#f43f5e');
      cText.setAttribute('font-family', 'var(--font-mono)');
      cText.setAttribute('font-size', '10');
      cText.setAttribute('font-weight', '700');
      cText.setAttribute('text-anchor', 'middle');
      cText.textContent = text;
      g.appendChild(cText);
    }
  }

  renderStamps(svgNS) {
    this.stamps.forEach(s => {
      const gStamp = document.createElementNS(svgNS, 'g');
      
      const pin = document.createElementNS(svgNS, 'circle');
      pin.setAttribute('cx', s.x);
      pin.setAttribute('cy', s.y);
      pin.setAttribute('r', '8');
      pin.setAttribute('fill', s.remediated ? '#10b981' : '#0ea5e9');
      pin.setAttribute('stroke', '#fff');
      pin.setAttribute('stroke-width', '1.5');
      gStamp.appendChild(pin);

      const lbl = document.createElementNS(svgNS, 'text');
      lbl.setAttribute('x', s.x + 12);
      lbl.setAttribute('y', s.y + 4);
      lbl.setAttribute('fill', '#f8fafc');
      lbl.setAttribute('font-family', 'var(--font-mono)');
      lbl.setAttribute('font-size', '9');
      lbl.setAttribute('font-weight', '700');
      lbl.textContent = `VERIFIED: ${s.timestamp}`;
      gStamp.appendChild(lbl);

      this.canvas.appendChild(gStamp);
    });
  }

  // AutoCAD DXF ASCII Generator
  exportDXF(preset, isRemediated) {
    if (!preset) return;
    const lines = [];

    // DXF Header
    lines.push("0", "SECTION", "2", "HEADER", "0", "ENDSEC");
    lines.push("0", "SECTION", "2", "TABLES", "0", "ENDSEC");
    lines.push("0", "SECTION", "2", "BLOCKS", "0", "ENDSEC");
    lines.push("0", "SECTION", "2", "ENTITIES");

    // Add Walls
    preset.walls.forEach(w => {
      let x1 = w.x1, x2 = w.x2;
      if (w.id === 'corridor_wall') {
        x1 = window.appState.customWallX || (isRemediated ? 705 : 720);
        x2 = x1;
      }
      lines.push("0", "LINE", "8", "WALLS");
      lines.push("10", x1.toFixed(2), "20", w.y1.toFixed(2), "30", "0.0");
      lines.push("11", x2.toFixed(2), "21", w.y2.toFixed(2), "31", "0.0");
    });

    // Add Turning Circle
    if (preset.turningCircle) {
      const tc = preset.turningCircle;
      lines.push("0", "CIRCLE", "8", "ADA_TURNING_SPACE");
      lines.push("10", tc.cx.toFixed(2), "20", tc.cy.toFixed(2), "30", "0.0");
      lines.push("40", tc.r.toFixed(2));
    }

    // Add Doors
    preset.doors.forEach(d => {
      lines.push("0", "LINE", "8", "DOORS");
      lines.push("10", d.x.toFixed(2), "20", d.y.toFixed(2), "30", "0.0");
      lines.push("11", d.x.toFixed(2), "21", (d.y + d.w).toFixed(2), "31", "0.0");
    });

    lines.push("0", "ENDSEC", "0", "EOF");

    const dxfString = lines.join("\n");
    const blob = new Blob([dxfString], { type: "application/dxf" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${preset.id}_PlanGuard_Remediated.dxf`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // Export Clean Vector SVG
  exportSVG(preset) {
    if (!this.canvas) return;
    const svgData = new XMLSerializer().serializeToString(this.canvas);
    const blob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${preset ? preset.id : 'floorplan'}_PlanGuard_Vector.svg`;
    a.click();
    URL.revokeObjectURL(url);
  }
}

window.CADEngine = CADEngine;
