import * as THREE from 'three';

const _GP_STYLE_ID = 'gp-premium-styles';
const _MAX_DRAG_ANGLE = 1.22;
const _LAUNCH_ANGLE = 0.44;
const _RESET_DURATION = 0.8;
const _STR_LENGTH_STEP = 0.2;
const _STR_LENGTH_MIN = 1.2;
const _STR_LENGTH_MAX = 3.0;
const _STR_LENGTH_TWEEN_DURATION = 0.5;

const _GP_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Press+Start+2P&display=swap');
.gp-panel {
  position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%);
  z-index: 99997;
  display: flex; flex-wrap: wrap; align-items: center; justify-content: center;
  gap: 8px;
  padding: 12px 20px;
  background: rgba(5, 5, 20, 0.82);
  border: 1.5px solid rgba(0, 255, 255, 0.2);
  border-radius: 2px;
  font-family: 'Press Start 2P', 'Courier New', monospace;
  font-size: 8px;
  color: rgba(255, 255, 255, 0.7);
  user-select: none;
  -webkit-backdrop-filter: blur(4px);
  backdrop-filter: blur(4px);
  pointer-events: auto;
}
.gp-group { display: flex; align-items: center; gap: 4px; }
.gp-label { color: rgba(0, 255, 255, 0.5); font-size: 7px; letter-spacing: 1px; margin-right: 4px; white-space: nowrap; }
.gp-btn {
  font-family: 'Orbitron', 'Courier New', monospace;
  font-size: 9px; font-weight: 700;
  color: rgba(255, 255, 255, 0.6);
  background: rgba(0, 255, 255, 0.06);
  border: 1.5px solid rgba(0, 255, 255, 0.2);
  border-radius: 2px;
  padding: 6px 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  letter-spacing: 1px;
}
.gp-btn:hover { background: rgba(0, 255, 255, 0.12); border-color: rgba(0, 255, 255, 0.5); color: #fff; }
.gp-btn:active { transform: scale(0.95); }
.gp-btn.gp--active { background: rgba(0, 255, 255, 0.15); border-color: rgba(0, 255, 255, 0.6); color: #fff; box-shadow: 0 0 12px rgba(0,255,255,0.15); }
.gp-btn.gp--pause { color: #ffcc44; border-color: rgba(255, 204, 68, 0.3); }
.gp-btn.gp--pause:hover { border-color: rgba(255, 204, 68, 0.6); }
.gp-btn.gp--danger { color: #ff6a44; border-color: rgba(255, 106, 68, 0.3); }
.gp-btn.gp--danger:hover { border-color: rgba(255, 106, 68, 0.6); }
.gp-btn.gp--disabled { opacity: 0.3; cursor: default; pointer-events: none; }
.gp-sep { width: 1px; height: 20px; background: rgba(0, 255, 255, 0.15); margin: 0 4px; flex-shrink: 0; }
.gp-vol-bar {
  display: inline-block; width: 30px; height: 4px;
  background: rgba(0, 255, 255, 0.15); border-radius: 2px; vertical-align: middle; margin: 0 3px; overflow: hidden;
}
.gp-vol-fill { height: 100%; background: rgba(0, 255, 255, 0.5); border-radius: 2px; transition: width 0.15s; }
.gp-str-bar {
  display: inline-block; width: 20px; height: 4px;
  background: rgba(0, 255, 255, 0.15); border-radius: 2px; vertical-align: middle; margin: 0 3px; overflow: hidden;
}
.gp-str-fill { height: 100%; background: rgba(0, 255, 255, 0.5); border-radius: 2px; transition: width 0.15s; }
.gp-cursor-drag { cursor: grabbing !important; }
@media (max-width: 700px) {
  .gp-panel { padding: 8px 12px; gap: 4px; font-size: 6px; bottom: 12px; }
  .gp-btn { font-size: 7px; padding: 4px 8px; }
  .gp-sep { display: none; }
}
`;

export class GuiPanel {
  constructor({ renderer, camera, ballGroup, cradleFrame, physicsEngine, hidden = false }) {
    this.renderer = renderer;
    this.camera = camera;
    this.ballGroup = ballGroup;
    this.cradleFrame = cradleFrame;
    this.physics = physicsEngine;

    this.speedMultiplier = 1;
    this.isPaused = false;
    this.isDragging = false;
    this.isResetting = false;
    this.isStringLengthBusy = false;
    this.volume = 0.6;

    this._draggedIndex = -1;
    this._dragAngle = 0;
    this._resetProgress = 0;
    this._resetStartAngles = null;
    this._strLengthPhase = 'idle';
    this._strLengthFrom = 0;
    this._strLengthTo = 0;
    this._strLengthProgress = 0;
    this._plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
    this._point = new THREE.Vector3();
    this._raycaster = new THREE.Raycaster();
    this._onVolumeChange = null;

    this._injectStyles();
    this._buildUI();
    this._setupPointer();
    this._setupKeyboard();

    if (hidden) {
      this._panel.style.display = 'none';
    }
  }

  set onVolumeChange(fn) { this._onVolumeChange = fn; }

  get isBusy() { return this.isResetting || this.isStringLengthBusy; }

  show() {
    this._panel.style.display = '';
  }

  applyDrag() {
    if (!this.isDragging) return;
    this._carryNeighbors();
  }

  update(delta) {
    if (this.isResetting) {
      this._resetProgress += delta;
      const t = Math.min(this._resetProgress / _RESET_DURATION, 1);
      const eased = 1 - (1 - t) * (1 - t) * (1 - t);

      for (let i = 0; i < this.physics.ballCount; i++) {
        const start = this._resetStartAngles[i];
        const angle = start + (0 - start) * eased;
        this.physics.setAngle(i, angle);
        this.physics.setAngularVelocity(i, 0);
      }

      if (t >= 1) {
        this.isResetting = false;
        this._resetStartAngles = null;
        if (this._strLengthPhase === 'resetting') {
          this._strLengthPhase = 'tweening';
          this._strLengthProgress = 0;
        }
      }
    }

    if (this._strLengthPhase === 'tweening') {
      this._strLengthProgress += delta / _STR_LENGTH_TWEEN_DURATION;
      const t = Math.min(this._strLengthProgress, 1);
      const eased = 1 - (1 - t) * (1 - t) * (1 - t);
      const current = this._strLengthFrom + (this._strLengthTo - this._strLengthFrom) * eased;

      this.cradleFrame.stringLength = current;
      this.physics.stringLength = current;
      this.ballGroup.setStringLength(current);

      const angles = this.physics.getAngles();
      for (let i = 0; i < this.physics.ballCount; i++) {
        this.ballGroup.setAngle(i, angles[i]);
      }

      if (t >= 1) {
        this.cradleFrame.stringLength = this._strLengthTo;
        this.physics.stringLength = this._strLengthTo;
        this.ballGroup.setStringLength(this._strLengthTo);
        for (let i = 0; i < this.physics.ballCount; i++) {
          this.ballGroup.setAngle(i, this.physics.getAngles()[i]);
        }

        this._strLengthPhase = 'idle';
        this.isStringLengthBusy = false;
        this._updateStrButtons();
      }
    }
  }

  dispose() {
    window.removeEventListener('resize', this._onResize);
    if (this._styleEl && this._styleEl.parentNode) {
      this._styleEl.parentNode.removeChild(this._styleEl);
    }
    if (this._panel && this._panel.parentNode) {
      this._panel.parentNode.removeChild(this._panel);
    }
  }

  _injectStyles() {
    if (document.getElementById(_GP_STYLE_ID)) return;
    this._styleEl = document.createElement('style');
    this._styleEl.id = _GP_STYLE_ID;
    this._styleEl.textContent = _GP_CSS;
    document.head.appendChild(this._styleEl);
  }

  _buildUI() {
    this._panel = document.createElement('div');
    this._panel.className = 'gp-panel';

    this._buildGroup('SPEED', (g) => {
      this._speedBtns = {};
      for (const val of [1, 2, 4]) {
        const btn = this._makeBtn(`${val}×`, () => this._setSpeed(val));
        if (val === this.speedMultiplier) btn.classList.add('gp--active');
        this._speedBtns[val] = btn;
        g.appendChild(btn);
      }
    });
    this._sep();
    this._pauseBtn = this._makeBtn('⏸', () => this._togglePause(), 'pause');
    this._panel.appendChild(this._pauseBtn);
    this._sep();
    this._panel.appendChild(this._makeBtn('↺', () => this._triggerReset(), 'danger'));
    this._sep();

    this._buildStrControls();
    this._sep();

    this._volBtnMinus = this._makeBtn('−', () => this._adjustVolume(-0.2));
    this._volBtnPlus = this._makeBtn('+', () => this._adjustVolume(0.2));
    this._volFill = document.createElement('span');
    this._volFill.className = 'gp-vol-fill';
    this._volFill.style.width = `${this.volume * 100}%`;
    const volBar = document.createElement('span');
    volBar.className = 'gp-vol-bar';
    volBar.appendChild(this._volFill);
    this._panel.appendChild(this._volBtnMinus);
    this._panel.appendChild(volBar);
    this._panel.appendChild(this._volBtnPlus);

    document.body.appendChild(this._panel);
  }

  _buildStrControls() {
    const range = _STR_LENGTH_MAX - _STR_LENGTH_MIN;
    const pct = ((this.cradleFrame.stringLength - _STR_LENGTH_MIN) / range) * 100;

    this._strMinusBtn = this._makeBtn('−', () => this._changeStringLength(-_STR_LENGTH_STEP));
    this._strPlusBtn = this._makeBtn('+', () => this._changeStringLength(_STR_LENGTH_STEP));

    this._strFill = document.createElement('span');
    this._strFill.className = 'gp-str-fill';
    this._strFill.style.width = `${pct}%`;
    const strBar = document.createElement('span');
    strBar.className = 'gp-str-bar';
    strBar.appendChild(this._strFill);

    this._buildGroup('STR', (g) => {
      g.appendChild(this._strMinusBtn);
      g.appendChild(strBar);
      g.appendChild(this._strPlusBtn);
    });

    this._updateStrButtons();
  }

  _updateStrButtons() {
    const cur = this.cradleFrame.stringLength;
    this._strMinusBtn.classList.toggle('gp--disabled', cur <= _STR_LENGTH_MIN);
    this._strPlusBtn.classList.toggle('gp--disabled', cur >= _STR_LENGTH_MAX);
    const range = _STR_LENGTH_MAX - _STR_LENGTH_MIN;
    const pct = ((cur - _STR_LENGTH_MIN) / range) * 100;
    this._strFill.style.width = `${pct}%`;
  }

  _buildGroup(label, populate) {
    const g = document.createElement('span');
    g.className = 'gp-group';
    const lbl = document.createElement('span');
    lbl.className = 'gp-label';
    lbl.textContent = label;
    g.appendChild(lbl);
    populate(g);
    this._panel.appendChild(g);
  }

  _makeBtn(text, onClick, extraCls) {
    const btn = document.createElement('button');
    btn.className = 'gp-btn';
    if (extraCls) btn.classList.add(`gp--${extraCls}`);
    btn.textContent = text;
    btn.addEventListener('click', onClick);
    return btn;
  }

  _sep() {
    const s = document.createElement('span');
    s.className = 'gp-sep';
    this._panel.appendChild(s);
  }

  _setSpeed(val) {
    this.speedMultiplier = val;
    for (const [k, btn] of Object.entries(this._speedBtns)) {
      btn.classList.toggle('gp--active', Number(k) === val);
    }
  }

  _togglePause() {
    this.isPaused = !this.isPaused;
    this._pauseBtn.textContent = this.isPaused ? '▶' : '⏸';
  }

  _triggerReset() {
    if (this.isResetting) return;
    this.isResetting = true;
    this._resetProgress = 0;
    this._resetStartAngles = this.physics.getAngles();
  }

  _changeStringLength(delta) {
    if (this.isStringLengthBusy || this.isResetting || this.ballGroup.isAssembling) return;

    const newLen = Math.max(_STR_LENGTH_MIN, Math.min(_STR_LENGTH_MAX, this.cradleFrame.stringLength + delta));
    if (newLen === this.cradleFrame.stringLength) return;

    this.isStringLengthBusy = true;
    this._strLengthFrom = this.cradleFrame.stringLength;
    this._strLengthTo = newLen;

    const angles = this.physics.getAngles();
    let needsReset = false;
    for (let i = 0; i < angles.length; i++) {
      if (Math.abs(angles[i]) > 0.01) { needsReset = true; break; }
    }

    if (needsReset) {
      this._strLengthPhase = 'resetting';
      this.isResetting = true;
      this._resetProgress = 0;
      this._resetStartAngles = this.physics.getAngles();
    } else {
      this._strLengthPhase = 'tweening';
      this._strLengthProgress = 0;
    }
  }

  _adjustVolume(delta) {
    this.volume = Math.max(0, Math.min(1, this.volume + delta));
    this._volFill.style.width = `${this.volume * 100}%`;
    if (this._onVolumeChange) this._onVolumeChange(this.volume);
  }

  _setupPointer() {
    const canvas = this.renderer.domElement;
    canvas.addEventListener('pointerdown', (e) => this._onPointerDown(e));
    window.addEventListener('pointermove', (e) => this._onPointerMove(e));
    window.addEventListener('pointerup', (e) => this._onPointerUp(e));
    canvas.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        this._onPointerDown(e.touches[0]);
      }
    }, { passive: true });
  }

  _onPointerDown(e) {
    if (this.ballGroup.isAssembling || this.isBusy) return;
    if (this._panel.style.display === 'none') return;
    if (this._panel.contains(e.target)) return;

    const rect = this.renderer.domElement.getBoundingClientRect();
    const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const ny = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    this._raycaster.setFromCamera(new THREE.Vector2(nx, ny), this.camera);
    const hits = this._raycaster.intersectObjects(this.ballGroup.ballMeshes);

    if (hits.length > 0) {
      this.isDragging = true;
      this._draggedIndex = this.ballGroup.ballMeshes.indexOf(hits[0].object);
      document.body.classList.add('gp-cursor-drag');
    }
  }

  _onPointerMove(e) {
    if (!this.isDragging) return;

    const rect = this.renderer.domElement.getBoundingClientRect();
    const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const ny = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    this._raycaster.setFromCamera(new THREE.Vector2(nx, ny), this.camera);
    if (!this._raycaster.ray.intersectPlane(this._plane, this._point)) return;

    const pivot = this.cradleFrame.pivots[this._draggedIndex];
    const dx = this._point.x - pivot.x;
    const dy = this._point.y - pivot.y;
    if (Math.sqrt(dx * dx + dy * dy) < 0.01) return;

    let angle = Math.atan2(dx, -dy);
    angle = Math.max(-_MAX_DRAG_ANGLE, Math.min(_MAX_DRAG_ANGLE, angle));
    this._dragAngle = angle;

    this.physics.setAngle(this._draggedIndex, angle);
    this.physics.setAngularVelocity(this._draggedIndex, 0);
  }

  _onPointerUp() {
    if (!this.isDragging) return;
    this.isDragging = false;
    this._draggedIndex = -1;
    document.body.classList.remove('gp-cursor-drag');
  }

  _carryNeighbors() {
    const L = this.physics.stringLength;
    const dia = this.physics.ballDiameter;
    const pivots = this.cradleFrame.pivots;
    const idx = this._draggedIndex;

    this.physics.setAngle(idx, this._dragAngle);
    this.physics.setAngularVelocity(idx, 0);

    for (let i = idx; i < this.physics.ballCount - 1; i++) {
      const xi = pivots[i].x + L * Math.sin(this.physics.angles[i]);
      const xj = pivots[i + 1].x + L * Math.sin(this.physics.angles[i + 1]);
      if (xj - xi >= dia) break;
      const desiredXj = xi + dia;
      const raw = (desiredXj - pivots[i + 1].x) / L;
      const clampedRaw = Math.max(-1, Math.min(1, raw));
      const newAngle = Math.asin(clampedRaw);
      const clampedAngle = Math.max(-_MAX_DRAG_ANGLE, Math.min(_MAX_DRAG_ANGLE, newAngle));
      this.physics.setAngle(i + 1, clampedAngle);
      this.physics.setAngularVelocity(i + 1, 0);
    }

    for (let i = idx; i > 0; i--) {
      const xi = pivots[i].x + L * Math.sin(this.physics.angles[i]);
      const xim1 = pivots[i - 1].x + L * Math.sin(this.physics.angles[i - 1]);
      if (xi - xim1 >= dia) break;
      const desiredXim1 = xi - dia;
      const raw = (desiredXim1 - pivots[i - 1].x) / L;
      const clampedRaw = Math.max(-1, Math.min(1, raw));
      const newAngle = Math.asin(clampedRaw);
      const clampedAngle = Math.max(-_MAX_DRAG_ANGLE, Math.min(_MAX_DRAG_ANGLE, newAngle));
      this.physics.setAngle(i - 1, clampedAngle);
      this.physics.setAngularVelocity(i - 1, 0);
    }
  }

  _setupKeyboard() {
    window.addEventListener('keydown', (e) => {
      if (this.ballGroup.isAssembling || this.isBusy) return;
      if (this._panel.style.display === 'none') return;

      const key = e.key;
      if (key === '1') { this._autoLaunch(1); }
      else if (key === '2') { this._autoLaunch(2); }
      else if (key === '3') { this._autoLaunch(3); }
      else if (key.toLowerCase() === 'l') {
        this._changeStringLength(e.shiftKey ? -_STR_LENGTH_STEP : _STR_LENGTH_STEP);
      }
      else if (key === '+' || key === '=') { this._adjustVolume(0.2); }
      else if (key === '-') { this._adjustVolume(-0.2); }
      else if (key === ' ' || key === 'p') { e.preventDefault(); this._togglePause(); }
      else if (key === 'r' || key === 'R') { this._triggerReset(); }
    });
  }

  _autoLaunch(count) {
    const a = -_LAUNCH_ANGLE;
    const n = Math.min(count, this.physics.ballCount);
    for (let i = 0; i < n; i++) {
      this.physics.setAngle(i, a);
      this.physics.setAngularVelocity(i, 0);
    }
  }
}
