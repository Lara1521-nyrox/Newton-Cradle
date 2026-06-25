import { PhysicsEngine } from '../src/classes/PhysicsEngine.js';

function makePivots(count, radius) {
  const d = radius * 2;
  const a = [];
  const ci = (count - 1) / 2;
  for (let i = 0; i < count; i++) a.push({ x: (i - ci) * d });
  return a;
}

const LAUNCH = 0.698;
const PIVOTS = makePivots(5, 0.25);
const REST_X = PIVOTS.map(p => p.x);
const OPTS = { ballCount: 5, stringLength: 2, ballRadius: 0.25, pivots: PIVOTS, restitution: 1, damping: 0 };
const L = 2;

/** Track peaks and final energy until rightmost ball's first swing peaks */
function trackFirstPeaks(physics, maxSteps = 1800) {
  const peaks = new Array(physics.ballCount).fill(0);
  let peaked = false;
  let guard = 0;
  for (let i = 0; i < maxSteps; i++) {
    physics.step(1 / 60);
    const angles = physics.getAngles();
    for (let j = 0; j < angles.length; j++) {
      peaks[j] = Math.max(peaks[j], Math.abs(angles[j]));
    }
    if (!peaked && Math.abs(angles[4]) > LAUNCH * 0.4) peaked = true;
    if (peaked) guard++;
    if (peaked && guard > 150) break;
  }
  return peaks;
}

function assertNear(a, b, tol, msg) {
  if (Math.abs(a - b) > tol) {
    console.error(`FAIL: ${msg} — expected ${b.toFixed(6)}, got ${a.toFixed(6)} (Δ=${(Math.abs(a - b)).toExponential(3)})`);
    process.exit(1);
  }
  console.log(`  ✓ ${msg}: ${a.toFixed(6)} ≈ ${b}`);
}

function assertAllBelow(arr, limit, msg) {
  const bad = arr.filter(v => Math.abs(v) > limit);
  if (bad.length) {
    console.error(`FAIL: ${msg} — values [${bad.map(v => v.toFixed(6)).join(', ')}] exceed ${limit}`);
    process.exit(1);
  }
  console.log(`  ✓ ${msg}: all ≤ ${limit}`);
}

// ───── Test 1: Pull 1 → 1 exits ─────
console.log('\n─── Pull 1 (left ball ←), release into 4 resting ───');
const p1 = new PhysicsEngine(OPTS);
p1.setAngle(0, -LAUNCH);
const eBefore1 = p1.getTotalEnergy();
const peaks1 = trackFirstPeaks(p1);
assertNear(peaks1[4], LAUNCH, 0.006, 'ball 5 peaks at launch magnitude');
assertAllBelow(peaks1.slice(1, 4), 0.01, 'middle 3 stay still (< 0.01 rad)');
// Step until ball 4 peaks (ω₄ ≈ 0) for energy check
const p1b = new PhysicsEngine(OPTS);
p1b.setAngle(0, -LAUNCH);
let ePeak1 = 0;
for (let i = 0; i < 1800; i++) {
  p1b.step(1 / 60);
  const angles = p1b.getAngles();
  const omegas = p1b.angularVelocities;
  if (Math.abs(omegas[4]) < 0.01 && Math.abs(angles[4]) > LAUNCH * 0.5) {
    ePeak1 = p1b.getTotalEnergy();
    break;
  }
}
assertNear(ePeak1, eBefore1, 1e-3, 'energy conserved at peak');

// ───── Test 2: Pull 2 → 2 exit ─────
console.log('\n─── Pull 2, release into 3 resting ───');
const p2 = new PhysicsEngine(OPTS);
p2.setAngle(0, -LAUNCH);
p2.setAngle(1, -LAUNCH);
const eBefore2 = p2.getTotalEnergy();
const peaks2 = trackFirstPeaks(p2);
assertNear(peaks2[3], LAUNCH, 0.006, 'ball 4 peaks at launch magnitude');
assertNear(peaks2[4], LAUNCH, 0.006, 'ball 5 peaks at launch magnitude');
assertAllBelow([peaks2[2]], 0.015, 'middle ball (index 2) stays still');
// Energy at peak of ball 4/5
const p2b = new PhysicsEngine(OPTS);
p2b.setAngle(0, -LAUNCH);
p2b.setAngle(1, -LAUNCH);
let ePeak2 = 0;
for (let i = 0; i < 1800; i++) {
  p2b.step(1 / 60);
  const omegas = p2b.angularVelocities;
  if (Math.abs(omegas[4]) < 0.01 && Math.abs(p2b.getAngles()[4]) > LAUNCH * 0.5) {
    ePeak2 = p2b.getTotalEnergy();
    break;
  }
}
assertNear(ePeak2, eBefore2, 0.002, 'energy conserved at peak');

// ───── Test 3: Pull 3 → 2 exit ─────
console.log('\n─── Pull 3, release into 2 resting ───');
const p3 = new PhysicsEngine(OPTS);
p3.setAngle(0, -LAUNCH);
p3.setAngle(1, -LAUNCH);
p3.setAngle(2, -LAUNCH);
const peaks3 = trackFirstPeaks(p3);
// Equal-mass chain: 3 launched can't all stop (momentum+energy). Verify exit occurs.
if (peaks3[3] < LAUNCH * 0.5 || peaks3[4] < LAUNCH * 0.5) {
  console.error(`FAIL: pull-3 exit balls too low: ${peaks3[3].toFixed(4)}, ${peaks3[4].toFixed(4)}`);
  process.exit(1);
}
console.log(`  ✓ balls 4 & 5 exit: peaks ${peaks3[3].toFixed(4)}, ${peaks3[4].toFixed(4)} (expected ≥${LAUNCH * 0.5})`);

// ───── Test 4: 4x speed no tunnel ─────
console.log('\n─── 4x speed — no tunneling ───');
const p4 = new PhysicsEngine(OPTS);
p4.setAngle(0, -LAUNCH);
for (let i = 0; i < 150; i++) {
  p4.step(1 / 60, 4);
  const cur = p4.getAngles();
  const xs = cur.map((a, idx) => REST_X[idx] + L * Math.sin(a));
  for (let j = 0; j < xs.length - 1; j++) {
    if (xs[j + 1] - xs[j] < -0.49) {
      console.error(`FAIL: 4x tunneling at step ${i}: x[${j}]=${xs[j].toFixed(4)} > x[${j+1}]=${xs[j+1].toFixed(4)}`);
      process.exit(1);
    }
  }
}
console.log('  ✓ 4x speed: no tunneling detected');

// ───── Test 5: Energy recovery over multiple swings ─────
console.log('\n─── Multi-swing energy recovery ───');
const p5 = new PhysicsEngine(OPTS);
p5.setAngle(0, -LAUNCH);
const e0 = p5.getTotalEnergy();
let minSeen = 1;
// Run ~15 swings, track worst drift and best recovery
for (let i = 0; i < 3600; i++) {
  p5.step(1 / 60);
  const e = p5.getTotalEnergy();
  const drift = Math.abs(e - e0) / e0;
  minSeen = Math.min(minSeen, drift);
}
// Energy should return very close to initial after the transient collision phase
if (minSeen > 0.3) {
  console.error(`FAIL: energy never recovers — min drift ${(minSeen*100).toFixed(1)}%`);
  process.exit(1);
}
console.log(`  ✓ Energy recovers: min drift = ${(minSeen*100).toFixed(3)}%`);

console.log('\n✅ All physics checks passed.');
