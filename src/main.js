import { IntroScreen } from './classes/IntroScreen.js';
import { SceneManager } from './classes/SceneManager.js';
import { CradleFrame } from './classes/CradleFrame.js';
import { BallGroup } from './classes/BallGroup.js';
import { PhysicsEngine } from './classes/PhysicsEngine.js';
import { GuiPanel } from './classes/GuiPanel.js';
import { SoundManager } from './classes/SoundManager.js';

const _QUOTE_STYLE_ID = 'mq-premium-quote';

const _QUOTE_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Press+Start+2P&display=swap');
.mq-quote-overlay {
  position: fixed; inset: 0; z-index: 99996;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  pointer-events: none;
  transition: opacity 0.6s ease;
  opacity: 0;
}
.mq-quote-overlay.mq--visible {
  opacity: 1;
}
.mq-quote-line {
  font-family: 'Press Start 2P', 'Courier New', monospace;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.85);
  text-shadow: 0 0 20px rgba(0, 255, 255, 0.4), 0 0 40px rgba(0, 255, 255, 0.15);
  text-align: center;
  line-height: 2.4;
  opacity: 0;
  transform: translateY(16px);
  transition: all 0.6s ease;
}
.mq-quote-line.mq--visible {
  opacity: 1;
  transform: translateY(0);
}
.mq-quote-line strong {
  color: rgba(0, 255, 255, 0.85);
  text-shadow: 0 0 30px rgba(0, 255, 255, 0.5);
}
@media (max-width: 700px) {
  .mq-quote-line { font-size: 8px; line-height: 2; }
}
`;

const intro = new IntroScreen(() => {
  startExperience();
});
intro.show();

function startExperience() {
  const scene = new SceneManager();
  const frame = new CradleFrame({ ballCount: 5, ballRadius: 0.25 });
  frame.addTo(scene);

  const balls = new BallGroup(frame);
  balls.addTo(scene);

  const physics = new PhysicsEngine({
    ballCount: frame.ballCount,
    stringLength: frame.stringLength,
    ballRadius: frame.ballRadius,
    pivots: frame.pivots,
    restitution: 0.99,
    damping: 0.004,
  });

  const sound = new SoundManager();

  const gui = new GuiPanel({
    renderer: scene.renderer,
    camera: scene.camera,
    ballGroup: balls,
    cradleFrame: frame,
    physicsEngine: physics,
    hidden: true,
  });
  gui.onVolumeChange = (v) => sound.setVolume(v);

  balls.onBallLand = () => sound.playLand();

  let lastTime = performance.now() / 1000;

  function injectQuoteStyles() {
    if (document.getElementById(_QUOTE_STYLE_ID)) return;
    const el = document.createElement('style');
    el.id = _QUOTE_STYLE_ID;
    el.textContent = _QUOTE_CSS;
    document.head.appendChild(el);
  }

  function showQuote(done) {
    injectQuoteStyles();

    const overlay = document.createElement('div');
    overlay.className = 'mq-quote-overlay';

    const line1 = document.createElement('div');
    line1.className = 'mq-quote-line';
    line1.textContent = 'Scientists call this physics.';

    const line2 = document.createElement('div');
    line2.className = 'mq-quote-line';
    line2.innerHTML = 'We call it <strong>oddly satisfying.</strong>';

    overlay.appendChild(line1);
    overlay.appendChild(line2);
    document.body.appendChild(overlay);

    requestAnimationFrame(() => {
      overlay.classList.add('mq--visible');
      requestAnimationFrame(() => {
        line1.classList.add('mq--visible');
        setTimeout(() => {
          line2.classList.add('mq--visible');
        }, 200);
      });
    });

    setTimeout(() => {
      overlay.style.opacity = '0';
      gui.show();
    }, 3100);

    setTimeout(() => {
      if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
      if (done) done();
    }, 3700);
  }

  balls.playAssembly(() => {
    showQuote();
  });

  function animate() {
    requestAnimationFrame(animate);
    const now = performance.now() / 1000;
    const delta = Math.min(now - lastTime, 0.05);
    lastTime = now;

    if (gui.isBusy) {
      physics.collisionEvents.length = 0;
      gui.update(delta);
    } else if (!gui.isPaused) {
      physics.step(delta, gui.speedMultiplier);
      gui.applyDrag();
    } else {
      physics.collisionEvents.length = 0;
    }

    for (const ev of physics.collisionEvents) {
      sound.playClick(ev.intensity, ev.index);
    }

    balls.update(physics.getAngles());
    scene.update(delta);
    scene.render();
  }
  animate();
}
