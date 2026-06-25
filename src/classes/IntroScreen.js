import * as THREE from 'three';

const STYLE_ID = 'is-premium-styles';

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Press+Start+2P&display=swap');

@keyframes is-fade-in { to { opacity: 1; } }
@keyframes is-fade-in-up { 0% { opacity: 0; transform: translateY(30px); } 100% { opacity: 1; transform: translateY(0); } }
@keyframes is-fade-in-down { 0% { opacity: 0; transform: translateY(-20px); } 100% { opacity: 1; transform: translateY(0); } }
@keyframes is-pulse-glow {
  0%, 100% { box-shadow: 0 0 15px rgba(0, 255, 255, 0.15), 0 0 40px rgba(0, 255, 255, 0.05), inset 0 0 15px rgba(0, 255, 255, 0.05); }
  50% { box-shadow: 0 0 25px rgba(0, 255, 255, 0.3), 0 0 60px rgba(0, 255, 255, 0.1), inset 0 0 25px rgba(0, 255, 255, 0.1); }
}
@keyframes is-pulse-start {
  0%, 100% { box-shadow: 0 0 20px rgba(168, 85, 247, 0.3), 0 0 50px rgba(168, 85, 247, 0.1), inset 0 0 20px rgba(168, 85, 247, 0.05); }
  50% { box-shadow: 0 0 35px rgba(168, 85, 247, 0.6), 0 0 80px rgba(168, 85, 247, 0.2), inset 0 0 35px rgba(168, 85, 247, 0.15); }
}
@keyframes is-float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}
@keyframes is-twinkle {
  0%, 100% { opacity: 0.15; transform: scale(0.6); }
  50% { opacity: 1; transform: scale(1.2); }
}
@keyframes is-spin-slow {
  from { transform: translateX(-100%) rotate(0deg); }
  to { transform: translateX(100%) rotate(0deg); }
}
@keyframes is-bounce-in {
  0% { opacity: 0; transform: scale(0.8); }
  50% { transform: scale(1.05); }
  100% { opacity: 1; transform: scale(1); }
}
@keyframes is-cursor-blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}
@keyframes is-glitch {
  0% { clip-path: inset(0 0 80% 0); transform: translate(-2px, 0); }
  10% { clip-path: inset(20% 0 60% 0); transform: translate(2px, 0); }
  20% { clip-path: inset(40% 0 20% 0); transform: translate(-1px, 0); }
  30% { clip-path: inset(70% 0 10% 0); transform: translate(1px, 0); }
  40% { clip-path: inset(10% 0 85% 0); transform: translate(-2px, 0); }
  50% { clip-path: inset(50% 0 30% 0); transform: translate(0, 0); }
  60% { clip-path: inset(30% 0 50% 0); transform: translate(1px, 0); }
  70% { clip-path: inset(0 0 90% 0); transform: translate(-1px, 0); }
  80% { clip-path: inset(60% 0 20% 0); transform: translate(2px, 0); }
  90% { clip-path: inset(20% 0 70% 0); transform: translate(-2px, 0); }
  100% { clip-path: inset(0 0 80% 0); transform: translate(0, 0); }
}
@keyframes is-scanline {
  from { transform: translateY(0); }
  to { transform: translateY(4px); }
}
@keyframes is-vhs-shake {
  0%, 100% { transform: translate(0, 0) skewX(0deg); }
  10% { transform: translate(-1px, 0.5px) skewX(0.3deg); }
  20% { transform: translate(1px, -0.5px) skewX(-0.2deg); }
  30% { transform: translate(-0.5px, 0) skewX(0.1deg); }
  40% { transform: translate(0.5px, 0.3px) skewX(-0.1deg); }
  50% { transform: translate(-1px, -0.3px) skewX(0.2deg); }
  60% { transform: translate(0, 0.5px) skewX(-0.3deg); }
  70% { transform: translate(0.5px, 0) skewX(0deg); }
  80% { transform: translate(-0.5px, -0.2px) skewX(-0.1deg); }
  90% { transform: translate(1px, 0.2px) skewX(0.1deg); }
}
@keyframes is-shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
@keyframes is-card-glow {
  0%, 100% { border-color: rgba(0, 255, 255, 0.25); box-shadow: 0 0 8px rgba(0, 255, 255, 0.05); }
  50% { border-color: rgba(0, 255, 255, 0.6); box-shadow: 0 0 20px rgba(0, 255, 255, 0.2); }
}
@keyframes is-card-hover {
  0% { transform: scale(1) translateY(0); }
  100% { transform: scale(1.08) translateY(-6px); }
}
@keyframes is-particle-burst {
  0% { transform: translate(0, 0) scale(1); opacity: 1; }
  100% { transform: translate(var(--tx), var(--ty)) scale(0); opacity: 0; }
}

.is-premium-overlay {
  position: fixed; inset: 0; z-index: 99998;
  background: rgba(5, 5, 20, 0.88);
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  overflow: hidden;
  transition: opacity 1.2s cubic-bezier(0.4, 0, 0.2, 1);
  font-family: 'Press Start 2P', 'Courier New', monospace;
}
.is-premium-overlay.is--hiding {
  opacity: 0;
  pointer-events: none;
}

.is-3d-canvas {
  position: absolute; inset: 0; z-index: 0;
  display: block;
}

.is-scanlines {
  position: absolute; inset: 0; z-index: 1;
  pointer-events: none;
  background: repeating-linear-gradient(
    0deg,
    transparent 0px,
    transparent 2px,
    rgba(0, 0, 0, 0.08) 2px,
    rgba(0, 0, 0, 0.08) 4px
  );
  animation: is-scanline 0.15s linear infinite;
}

.is-vhs-overlay {
  position: absolute; inset: 0; z-index: 2;
  pointer-events: none;
  animation: is-vhs-shake 8s ease-in-out infinite;
  opacity: 0.3;
}

.is-vhs-overlay::before,
.is-vhs-overlay::after {
  content: '';
  position: absolute; inset: 0;
  pointer-events: none;
}

.is-vhs-overlay::before {
  background: repeating-linear-gradient(
    90deg,
    transparent 0px,
    transparent 3px,
    rgba(0, 255, 255, 0.015) 3px,
    rgba(0, 255, 255, 0.015) 4px
  );
}

.is-vhs-overlay::after {
  background: repeating-linear-gradient(
    0deg,
    transparent 0px,
    transparent 5px,
    rgba(168, 85, 247, 0.01) 5px,
    rgba(168, 85, 247, 0.01) 6px
  );
  animation: is-scanline 0.2s linear infinite;
}

.is-content-wrapper {
  position: relative; z-index: 3;
  display: flex; flex-direction: column; align-items: center;
  width: 100%; max-width: 780px;
  padding: 20px;
  pointer-events: none;
}

.is-content-wrapper > * {
  pointer-events: auto;
}

.is-title-container {
  position: relative;
  margin-bottom: 8px;
  opacity: 1;
}

.is-title-text {
  font-family: 'Orbitron', 'Courier New', monospace;
  font-size: 52px;
  font-weight: 900;
  letter-spacing: 8px;
  text-transform: uppercase;
  color: #fff;
  text-shadow:
    0 0 10px rgba(0, 255, 255, 0.8),
    0 0 20px rgba(0, 255, 255, 0.6),
    0 0 40px rgba(0, 255, 255, 0.4),
    0 0 80px rgba(0, 255, 255, 0.2),
    0 0 120px rgba(0, 255, 255, 0.1);
  user-select: none;
  min-height: 1.2em;
  position: relative;
}

.is-title-glitch {
  position: absolute;
  top: 0; left: 0;
  font-family: 'Orbitron', 'Courier New', monospace;
  font-size: 52px;
  font-weight: 900;
  letter-spacing: 8px;
  text-transform: uppercase;
  color: #0ff;
  opacity: 0;
  pointer-events: none;
  animation: is-glitch 0.3s ease 4.5s 3, is-glitch 0.3s ease 8s 2, is-glitch 0.3s ease 12s 1;
  text-shadow:
    2px 0 rgba(255, 0, 255, 0.8),
    -2px 0 rgba(0, 255, 255, 0.8);
}

.is-title-glitch2 {
  position: absolute;
  top: 0; left: 0;
  font-family: 'Orbitron', 'Courier New', monospace;
  font-size: 52px;
  font-weight: 900;
  letter-spacing: 8px;
  text-transform: uppercase;
  color: #f0f;
  opacity: 0;
  pointer-events: none;
  animation: is-glitch 0.25s ease 5s 2, is-glitch 0.3s ease 10s 1;
  text-shadow:
    2px 0 rgba(0, 255, 255, 0.8),
    -2px 0 rgba(255, 0, 255, 0.8);
}

.is-title-cursor {
  display: inline-block;
  width: 4px;
  height: 48px;
  background: #0ff;
  margin-left: 4px;
  vertical-align: middle;
  animation: is-cursor-blink 0.7s step-end infinite;
  box-shadow: 0 0 10px rgba(0, 255, 255, 0.8);
}

.is-subtitle {
  font-family: 'Orbitron', 'Courier New', monospace;
  font-size: 13px;
  font-weight: 400;
  letter-spacing: 6px;
  text-transform: uppercase;
  color: rgba(0, 255, 255, 0.7);
  text-shadow: 0 0 20px rgba(0, 255, 255, 0.3);
  margin-top: 4px;
  margin-bottom: 20px;
  user-select: none;
}

.is-cards-container {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
  width: 100%;
  max-width: 640px;
  margin: 4px 0 10px;
}

.is-card {
  position: relative;
  background: rgba(0, 255, 255, 0.03);
  border: 1.5px solid rgba(0, 255, 255, 0.25);
  border-radius: 2px;
  padding: 10px 8px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  animation: is-card-glow 3s ease-in-out infinite;
  user-select: none;
  overflow: hidden;
}

.is-card::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, transparent 60%, rgba(0, 255, 255, 0.05) 100%);
  pointer-events: none;
}

.is-card:hover {
  transform: scale(1.08) translateY(-6px);
  border-color: rgba(0, 255, 255, 0.7);
  background: rgba(0, 255, 255, 0.08);
  animation: none;
  box-shadow:
    0 0 20px rgba(0, 255, 255, 0.2),
    0 8px 25px rgba(0, 0, 0, 0.4);
}

.is-card-key {
  font-family: 'Press Start 2P', 'Courier New', monospace;
  font-size: 11px;
  font-weight: 700;
  color: #0ff;
  text-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
  display: block;
  margin-bottom: 4px;
}

.is-card-label {
  font-family: 'Press Start 2P', 'Courier New', monospace;
  font-size: 7px;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.5);
  line-height: 1.4;
  display: block;
  white-space: pre-line;
}

.is-card-particle {
  position: absolute;
  width: 3px;
  height: 3px;
  background: #0ff;
  border-radius: 0;
  pointer-events: none;
  box-shadow: 0 0 4px rgba(0, 255, 255, 0.6);
}

.is-card-particle.is--burst {
  animation: is-particle-burst 0.5s ease-out forwards;
}

.is-quote {
  font-family: 'Press Start 2P', 'Courier New', monospace;
  font-size: 9px;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.4);
  text-align: center;
  line-height: 1.8;
  margin: 6px 0 14px;
  padding: 10px 20px;
  max-width: 520px;
}

.is-quote strong {
  color: rgba(0, 255, 255, 0.6);
  font-weight: 400;
}

.is-start-btn {
  position: relative;
  font-family: 'Orbitron', 'Courier New', monospace;
  font-size: 16px;
  font-weight: 700;
  letter-spacing: 4px;
  color: #fff;
  background: rgba(168, 85, 247, 0.1);
  border: 2px solid rgba(168, 85, 247, 0.4);
  padding: 16px 48px;
  cursor: pointer;
  text-transform: uppercase;
  transition: all 0.3s ease;
  animation: is-pulse-start 3s ease-in-out infinite;
  user-select: none;
  overflow: hidden;
  border-radius: 2px;
}

.is-start-btn::before {
  content: '';
  position: absolute;
  top: 0; left: 0;
  width: 100%; height: 100%;
  background: linear-gradient(
    120deg,
    transparent 0%,
    transparent 30%,
    rgba(168, 85, 247, 0.15) 45%,
    rgba(0, 255, 255, 0.1) 55%,
    transparent 70%,
    transparent 100%
  );
  background-size: 200% 100%;
  animation: is-shimmer 3s ease-in-out infinite;
  pointer-events: none;
}

.is-start-btn::after {
  content: '';
  position: absolute;
  inset: -2px;
  border: 2px solid transparent;
  border-radius: 2px;
  background: linear-gradient(135deg, rgba(168, 85, 247, 0.3), rgba(0, 255, 255, 0.3)) border-box;
  -webkit-mask: linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.is-start-btn:hover {
  background: rgba(168, 85, 247, 0.2);
  border-color: rgba(168, 85, 247, 0.7);
  transform: scale(1.05);
  animation: none;
  box-shadow:
    0 0 30px rgba(168, 85, 247, 0.3),
    0 0 60px rgba(168, 85, 247, 0.1),
    0 8px 30px rgba(0, 0, 0, 0.5);
}

.is-start-btn:hover::after {
  opacity: 1;
}

.is-start-btn:active {
  transform: scale(0.97);
}

.is-particles-canvas {
  position: absolute; inset: 0; z-index: 4;
  pointer-events: none;
}

@media (max-width: 700px) {
  .is-title-text, .is-title-glitch, .is-title-glitch2 { font-size: 28px; letter-spacing: 4px; }
  .is-title-cursor { height: 28px; }
  .is-subtitle { font-size: 10px; letter-spacing: 4px; }
  .is-cards-container { grid-template-columns: repeat(2, 1fr); max-width: 360px; gap: 8px; }
  .is-card-key { font-size: 10px; }
  .is-card-label { font-size: 6px; }
  .is-quote { font-size: 7px; }
  .is-start-btn { font-size: 13px; padding: 14px 32px; letter-spacing: 2px; }
}
`;

export class IntroScreen {
  constructor(onStart) {
    this.onStart = onStart || (() => {});
    this.isVisible = false;
    this.isDestroyed = false;
    this.isHiding = false;
    this.overlay = null;
    this.styleEl = null;
    this.renderer = null;
    this.scene = null;
    this.camera = null;
    this.cradleGroup = null;
    this.balls = [];
    this.animId = null;
    this.particles = [];
    this.stars = [];
    this.particleCanvas = null;
    this.particleCtx = null;
    this.audioCtx = null;
    this.typewriterInterval = null;
    this.timeouts = [];
    this.clock = new THREE.Clock();
    this.cameraAngle = 0;
    this.titleText = '';
    this.titleComplete = false;
    this.subtitleEl = null;
    this.cardsEl = null;
    this.quoteEl = null;
    this.startBtn = null;
    this.titleContainer = null;
    this.cardParticles = [];
  }

  show() {
    if (this.isVisible) return;
    this.isVisible = true;
    this._injectStyles();
    this._buildScene();
    this._buildOverlay();
    this._startParticles();
    this._startTypewriter();
    window.addEventListener('resize', this._onResize = () => this._resize());
    this._animate();
  }

  hide() {
    if (this.isHiding || this.isDestroyed) return;
    this.isHiding = true;
    this.overlay.classList.add('is--hiding');
    this._delay(() => {
      if (this.isDestroyed) return;
      this.destroy();
      this.onStart();
    }, 1300);
  }

  destroy() {
    this.isDestroyed = true;
    this.isVisible = false;
    this._clearTimeouts();
    if (this.typewriterInterval) {
      clearInterval(this.typewriterInterval);
      this.typewriterInterval = null;
    }
    if (this.animId) {
      cancelAnimationFrame(this.animId);
      this.animId = null;
    }
    window.removeEventListener('resize', this._onResize);
    if (this.renderer) {
      this.renderer.dispose();
      this.renderer.domElement.remove();
      this.renderer = null;
    }
    if (this.overlay && this.overlay.parentNode) {
      this.overlay.parentNode.removeChild(this.overlay);
    }
    if (this.styleEl && this.styleEl.parentNode) {
      this.styleEl.parentNode.removeChild(this.styleEl);
    }
    if (this.audioCtx) {
      this.audioCtx.close().catch(() => {});
      this.audioCtx = null;
    }
  }

  _injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    this.styleEl = document.createElement('style');
    this.styleEl.id = STYLE_ID;
    this.styleEl.textContent = CSS;
    document.head.appendChild(this.styleEl);
  }

  _buildScene() {
    this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.2;

    this.scene = new THREE.Scene();
    this.scene.background = null;

    this.camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 50);
    this.camera.position.set(6, 3.5, 6);
    this.camera.lookAt(0, 1.8, 0);

    const ambient = new THREE.AmbientLight(0x223366, 0.4);
    this.scene.add(ambient);

    const cyanLight = new THREE.PointLight(0x00ffff, 1.2, 15);
    cyanLight.position.set(-3, 4, 3);
    this.scene.add(cyanLight);

    const purpleLight = new THREE.PointLight(0xa855f7, 1.0, 15);
    purpleLight.position.set(3, 2, -3);
    this.scene.add(purpleLight);

    const rimLight = new THREE.DirectionalLight(0x4466aa, 0.6);
    rimLight.position.set(-2, 5, -4);
    this.scene.add(rimLight);

    this._buildCradle();
  }

  _buildCradle() {
    this.cradleGroup = new THREE.Group();

    const woodMat = new THREE.MeshStandardMaterial({
      color: 0x2a1f1a,
      roughness: 0.85,
      metalness: 0.05,
    });
    const metalMat = new THREE.MeshStandardMaterial({
      color: 0x888899,
      roughness: 0.15,
      metalness: 0.85,
      envMapIntensity: 0.6,
    });
    const poleMat = new THREE.MeshStandardMaterial({
      color: 0x3a3028,
      roughness: 0.7,
      metalness: 0.2,
    });

    const w = 4.0, h = 0.12, d = 0.12;
    const topBar = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), woodMat);
    topBar.position.y = 3.4;
    this.cradleGroup.add(topBar);

    const postGeo = new THREE.BoxGeometry(0.15, 3.2, 0.15);
    const leftPost = new THREE.Mesh(postGeo, poleMat);
    leftPost.position.set(-w / 2 + 0.1, 1.8, 0);
    this.cradleGroup.add(leftPost);

    const rightPost = new THREE.Mesh(postGeo, poleMat);
    rightPost.position.set(w / 2 - 0.1, 1.8, 0);
    this.cradleGroup.add(rightPost);

    const base = new THREE.Mesh(new THREE.BoxGeometry(w + 0.2, 0.2, 0.5), woodMat);
    base.position.y = 0.1;
    this.cradleGroup.add(base);

    const ballCount = 5;
    const spacing = w / (ballCount + 1);
    const stringLen = 2.2;
    const ballRadius = 0.25;

    const stringMat = new THREE.MeshStandardMaterial({
      color: 0x555566,
      roughness: 0.5,
      metalness: 0.3,
    });

    for (let i = 0; i < ballCount; i++) {
      const x = -w / 2 + spacing * (i + 1);

      const string = new THREE.Mesh(
        new THREE.CylinderGeometry(0.02, 0.02, stringLen, 4),
        stringMat
      );
      string.position.set(x, 3.4 - stringLen / 2, 0);
      this.cradleGroup.add(string);

      const ball = new THREE.Mesh(
        new THREE.SphereGeometry(ballRadius, 24, 24),
        metalMat
      );
      ball.position.set(x, 3.4 - stringLen - ballRadius, 0);
      ball.userData = {
        restX: x,
        angle: 0,
        velocity: 0,
        index: i,
        phase: i * 0.3,
      };
      this.cradleGroup.add(ball);
      this.balls.push(ball);
    }

    this.scene.add(this.cradleGroup);
  }

  _buildOverlay() {
    this.overlay = document.createElement('div');
    this.overlay.className = 'is-premium-overlay';

    const threeCanvas = this.renderer.domElement;
    threeCanvas.className = 'is-3d-canvas';
    this.overlay.appendChild(threeCanvas);

    const scanlines = document.createElement('div');
    scanlines.className = 'is-scanlines';
    this.overlay.appendChild(scanlines);

    const vhs = document.createElement('div');
    vhs.className = 'is-vhs-overlay';
    this.overlay.appendChild(vhs);

    const content = document.createElement('div');
    content.className = 'is-content-wrapper';

    const titleContainer = document.createElement('div');
    titleContainer.className = 'is-title-container';
    this.titleContainer = titleContainer;

    const titleText = document.createElement('div');
    titleText.className = 'is-title-text';
    titleText.textContent = '';
    this.titleTextEl = titleText;
    titleContainer.appendChild(titleText);

    const glitch1 = document.createElement('div');
    glitch1.className = 'is-title-glitch';
    glitch1.textContent = "NEWTON'S CRADLE";
    titleContainer.appendChild(glitch1);

    const glitch2 = document.createElement('div');
    glitch2.className = 'is-title-glitch2';
    glitch2.textContent = "NEWTON'S CRADLE";
    titleContainer.appendChild(glitch2);

    const cursor = document.createElement('span');
    cursor.className = 'is-title-cursor';
    cursor.style.display = 'none';
    this.cursorEl = cursor;
    titleContainer.appendChild(cursor);

    content.appendChild(titleContainer);

    const subtitle = document.createElement('div');
    subtitle.className = 'is-subtitle';
    subtitle.textContent = 'Where Physics Comes to Life';
    this.subtitleEl = subtitle;
    content.appendChild(subtitle);

    const cardsContainer = document.createElement('div');
    cardsContainer.className = 'is-cards-container';
    this.cardsEl = cardsContainer;

    const cardData = [
      { key: '1', label: 'Pull one ball' },
      { key: '2', label: 'Pull two balls' },
      { key: '3', label: 'Pull three balls' },
      { key: 'L', label: 'Change string\nlength' },
      { key: '+', label: 'Increase\nvolume' },
      { key: '-', label: 'Decrease\nvolume' },
      { key: 'II', label: 'Pause\nsimulation' },
      { key: '\u21BA', label: 'Reset\nsimulation' },
      { key: '\u2190\u2192\u2191\u2193', label: 'Move\ncamera' },
    ];

    for (const data of cardData) {
      const card = document.createElement('div');
      card.className = 'is-card';
      card.dataset.key = data.key;

      const keyEl = document.createElement('span');
      keyEl.className = 'is-card-key';
      keyEl.textContent = data.key;
      card.appendChild(keyEl);

      const labelEl = document.createElement('span');
      labelEl.className = 'is-card-label';
      labelEl.textContent = data.label;
      card.appendChild(labelEl);

      card.addEventListener('mouseenter', () => {
        this._playHoverSound();
        this._burstCardParticles(card);
      });

      cardsContainer.appendChild(card);
    }

    content.appendChild(cardsContainer);

    const quote = document.createElement('div');
    quote.className = 'is-quote';
    quote.innerHTML = 'Scientists call this physics.<br><strong>We call it oddly satisfying.</strong>';
    this.quoteEl = quote;
    content.appendChild(quote);

    const startBtn = document.createElement('button');
    startBtn.className = 'is-start-btn';
    startBtn.textContent = 'START SIMULATION';
    this.startBtn = startBtn;

    startBtn.addEventListener('mouseenter', () => {
      this._playArcadeSound();
    });

    startBtn.addEventListener('click', () => {
      this._playConfirmSound();
      this.hide();
    });

    content.appendChild(startBtn);

    this.overlay.appendChild(content);

    this.particleCanvas = document.createElement('canvas');
    this.particleCanvas.className = 'is-particles-canvas';
    this.overlay.appendChild(this.particleCanvas);
    this.particleCtx = this.particleCanvas.getContext('2d');

    document.body.appendChild(this.overlay);

    this._resize();
  }

  _startTypewriter() {
    const fullTitle = "NEWTON'S CRADLE";
    let index = 0;
    this.titleTextEl.textContent = '';

    this.typewriterInterval = setInterval(() => {
      if (index < fullTitle.length) {
        this.titleTextEl.textContent += fullTitle[index];
        index++;
        if (index === fullTitle.length) {
          this.cursorEl.style.display = 'inline-block';
          this._onTitleComplete();
        }
      }
    }, 100);
  }

  _onTitleComplete() {
    this.titleComplete = true;

    this._delay(() => {
      this.cursorEl.style.display = 'none';
    }, 1800);

    this._delay(() => {
      this.subtitleEl.style.transition = 'all 0.8s ease';
      this.subtitleEl.style.opacity = '1';
    }, 500);

    this._delay(() => {
      this.cardsEl.style.transition = 'all 0.8s ease';
      this.cardsEl.style.opacity = '1';
    }, 1400);

    this._delay(() => {
      this.quoteEl.style.transition = 'all 0.8s ease';
      this.quoteEl.style.opacity = '1';
    }, 2200);

    this._delay(() => {
      this.startBtn.style.transition = 'all 0.6s ease';
      this.startBtn.style.opacity = '1';
      this.startBtn.style.transform = 'scale(1)';
    }, 3000);
  }

  _startParticles() {
    const count = Math.min(100, Math.floor(window.innerWidth * 0.05));
    this.particles = [];
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        r: 0.5 + Math.random() * 1.5,
        vy: 0.1 + Math.random() * 0.35,
        vx: (Math.random() - 0.5) * 0.2,
        alpha: 0.1 + Math.random() * 0.4,
        phase: Math.random() * Math.PI * 2,
        twinkleSpeed: 0.5 + Math.random() * 1.5,
      });
    }

    const starCount = Math.min(40, Math.floor(window.innerWidth * 0.02));
    this.stars = [];
    for (let i = 0; i < starCount; i++) {
      this.stars.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        r: 0.5 + Math.random() * 1,
        alpha: 0.1 + Math.random() * 0.5,
        phase: Math.random() * Math.PI * 2,
        twinkleSpeed: 0.8 + Math.random() * 2,
      });
    }
  }

  _burstCardParticles(card) {
    const rect = card.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const count = 5 + Math.floor(Math.random() * 4);

    for (let i = 0; i < count; i++) {
      const p = document.createElement('div');
      p.className = 'is-card-particle';
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
      const dist = 20 + Math.random() * 30;
      p.style.setProperty('--tx', Math.cos(angle) * dist + 'px');
      p.style.setProperty('--ty', Math.sin(angle) * dist + 'px');
      p.style.left = cx + 'px';
      p.style.top = cy + 'px';
      const hue = Math.random() > 0.5 ? 180 : 280;
      p.style.background = `hsl(${hue}, 100%, 60%)`;
      p.style.boxShadow = `0 0 4px hsl(${hue}, 100%, 60%)`;
      document.body.appendChild(p);
      requestAnimationFrame(() => {
        p.classList.add('is--burst');
      });
      this._delay(() => {
        if (p.parentNode) p.parentNode.removeChild(p);
      }, 600);
    }
  }

  _playHoverSound() {
    try {
      if (!this.audioCtx) this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const ctx = this.audioCtx;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'square';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.06);
      gain.gain.setValueAtTime(0.03, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.08);
    } catch { }
  }

  _playArcadeSound() {
    try {
      if (!this.audioCtx) this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const ctx = this.audioCtx;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc.type = 'square';
      osc.frequency.setValueAtTime(660, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(880, ctx.currentTime);
      osc2.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.06);
      gain2.gain.setValueAtTime(0.02, ctx.currentTime);
      gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
      osc.start(ctx.currentTime);
      osc2.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.12);
      osc2.stop(ctx.currentTime + 0.1);
    } catch { }
  }

  _playConfirmSound() {
    try {
      if (!this.audioCtx) this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const ctx = this.audioCtx;
      const now = ctx.currentTime;

      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(523.25, now);
      osc1.frequency.setValueAtTime(659.25, now + 0.08);
      osc1.frequency.setValueAtTime(783.99, now + 0.16);
      gain1.gain.setValueAtTime(0.1, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc1.start(now);
      osc1.stop(now + 0.35);

      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(1046.5, now + 0.16);
      gain2.gain.setValueAtTime(0.06, now + 0.16);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
      osc2.start(now + 0.16);
      osc2.stop(now + 0.5);
    } catch { }
  }

  _animate() {
    if (this.isDestroyed) return;
    this.animId = requestAnimationFrame(this._animate);

    const delta = this.clock.getDelta();
    const elapsed = this.clock.elapsedTime;

    this._updateCamera(delta, elapsed);
    this._updateCradle(delta, elapsed);
    this._updateParticles();

    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
  }

  _updateCamera(delta, elapsed) {
    this.cameraAngle += delta * 0.08;
    const radius = 7.5;
    const x = Math.sin(this.cameraAngle) * radius;
    const z = Math.cos(this.cameraAngle) * radius;
    const y = 3.0 + Math.sin(this.cameraAngle * 0.5) * 0.4;
    this.camera.position.lerp(new THREE.Vector3(x, y, z), 0.02);

    const lookTarget = new THREE.Vector3(0, 1.6, 0);
    lookTarget.y += Math.sin(elapsed * 0.3) * 0.05;
    this.camera.lookAt(lookTarget);
  }

  _updateCradle(delta, elapsed) {
    if (!this.cradleGroup) return;

    this.cradleGroup.position.y = Math.sin(elapsed * 0.5) * 0.02;

    for (const ball of this.balls) {
      const data = ball.userData;
      const targetAngle = Math.sin(elapsed * 1.2 + data.phase) * 0.02;
      data.angle += (targetAngle - data.angle) * 0.05;
      const offsetX = Math.sin(data.angle) * 2.2;
      ball.position.x = data.restX + offsetX;
      ball.position.z = Math.sin(data.angle) * 0.1;
    }
  }

  _updateParticles() {
    const ctx = this.particleCtx;
    if (!ctx || !this.particleCanvas) return;
    const w = this.particleCanvas.width;
    const h = this.particleCanvas.height;
    ctx.clearRect(0, 0, w, h);

    const t = performance.now() * 0.001;

    for (const p of this.particles) {
      const twinkle = 0.5 + 0.5 * Math.sin(t * p.twinkleSpeed + p.phase);
      ctx.fillStyle = `rgba(0, 255, 255, ${p.alpha * twinkle})`;
      ctx.fillRect(Math.floor(p.x), Math.floor(p.y), Math.max(1, Math.floor(p.r)), Math.max(1, Math.floor(p.r)));
      p.y -= p.vy;
      p.x += p.vx;
      if (p.y < -10) { p.y = h + 10; p.x = Math.random() * w; }
      if (p.x < -10) p.x = w + 10;
      if (p.x > w + 10) p.x = -10;
    }

    for (const s of this.stars) {
      const twinkle = 0.3 + 0.7 * Math.sin(t * s.twinkleSpeed + s.phase);
      const alpha = s.alpha * Math.max(0, twinkle);
      ctx.fillStyle = `rgba(200, 220, 255, ${alpha})`;
      const size = s.r * (0.8 + 0.4 * Math.sin(t * s.twinkleSpeed * 1.3 + s.phase));
      ctx.fillRect(Math.floor(s.x), Math.floor(s.y), Math.max(1, Math.floor(size)), Math.max(1, Math.floor(size)));
    }
  }

  _resize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    if (this.renderer) {
      this.renderer.setSize(w, h);
    }
    if (this.camera) {
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
    }
    if (this.particleCanvas) {
      this.particleCanvas.width = w;
      this.particleCanvas.height = h;
    }
  }

  _delay(fn, ms) {
    const id = setTimeout(fn, ms);
    this.timeouts.push(id);
    return id;
  }

  _clearTimeouts() {
    for (const id of this.timeouts) clearTimeout(id);
    this.timeouts = [];
  }
}
