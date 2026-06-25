import * as THREE from 'three';

const _STRING_RADIUS = 0.015;
const _STRING_SEGMENTS = 6;
const _BALL_SEGMENTS = 32;
const _PIVOT_Z_OFFSET = 0.015;
const _BALL_Z_OFFSET = 0.08;
const _DROP_DURATION = 0.7;
const _STAGGER = 0.35;
const _SETTLE_DURATION = 0.35;
const _POST_SETTLE_DELAY = 0.35;

export class BallGroup {
  constructor(frame, { ballRadius } = {}) {
    this.frame = frame;
    this.ballRadius = ballRadius || frame.ballRadius;
    this.isAssembling = false;
    this.onBallLand = null;

    this.group = new THREE.Group();
    this.ballMeshes = [];
    this.stringPairs = [];

    this._vec3a = new THREE.Vector3();
    this._vec3b = new THREE.Vector3();
    this._quat = new THREE.Quaternion();

    this._buildMeshes();
    this._hideAll();
  }

  get ballCount() {
    return this.frame.ballCount;
  }

  addTo(scene) {
    scene.add(this.group);
  }

  setAngle(index, angle) {
    const pivot = this.frame.pivots[index];
    const sl = this.frame.stringLength;
    const sinA = Math.sin(angle);
    const cosA = Math.cos(angle);
    const ball = this.ballMeshes[index];

    ball.position.set(
      pivot.x + sl * sinA,
      pivot.y - sl * cosA,
      pivot.z
    );
    this._updateStringMeshes(index);
  }

  update(angles) {
    if (this.isAssembling) return;
    for (let i = 0; i < this.ballCount; i++) {
      this.setAngle(i, angles[i]);
    }
  }

  playAssembly(onComplete) {
    this.isAssembling = true;
    this._assemblyComplete = onComplete;

    for (let i = 0; i < this.ballCount; i++) {
      this._resetBall(i);
    }

    const animState = [];
    for (let i = 0; i < this.ballCount; i++) {
      animState.push({ phase: 'waiting', delay: i * _STAGGER, startTime: 0 });
    }

    const restY = this.frame.barY - this.frame.stringLength;
    const startY = this.frame.barY + 4;
    const startTime = performance.now() / 1000;

    const tick = () => {
      const elapsed = performance.now() / 1000 - startTime;
      let allDone = true;

      for (let i = 0; i < this.ballCount; i++) {
        const s = animState[i];
        if (s.phase === 'done') continue;
        allDone = false;

        const localT = elapsed - s.delay;
        if (localT < 0) continue;

        if (s.phase === 'waiting') {
          s.phase = 'dropping';
          s.startTime = elapsed;
        }

        if (s.phase === 'dropping') {
          const progress = Math.min((elapsed - s.startTime) / _DROP_DURATION, 1);
          const eased = progress * progress * progress;
          const ballY = startY + (restY - startY) * eased;
          const pivot = this.frame.pivots[i];
          const ball = this.ballMeshes[i];

          ball.position.set(pivot.x, ballY, pivot.z);

          const belowPivot = this.frame.barY - ballY;
          if (belowPivot > 0) {
            const frac = Math.min(belowPivot / this.frame.stringLength, 1);
            this._setStringLength(i, frac * this.frame.stringLength);
          } else {
            this._setStringLength(i, 0);
          }

          this._updateStringMeshes(i);

          if (progress >= 1) {
            s.phase = 'settling';
            s.startTime = elapsed;
            ball.position.y = restY;
            this._setStringLength(i, this.frame.stringLength);
            this._updateStringMeshes(i);
            if (this.onBallLand) this.onBallLand(i);
          }
        }

        if (s.phase === 'settling') {
          const progress = Math.min((elapsed - s.startTime) / _SETTLE_DURATION, 1);
          const damp = 1 - progress;
          const bounce = Math.sin(progress * Math.PI * 3) * 0.015 * damp;
          const ball = this.ballMeshes[i];
          ball.position.y = restY + bounce;

          const ss = 1 + Math.sin(progress * Math.PI * 3) * 0.02 * damp;
          ball.scale.set(1 / Math.sqrt(ss), ss, 1 / Math.sqrt(ss));

          if (progress >= 1) {
            s.phase = 'done';
            ball.position.y = restY;
            ball.scale.set(1, 1, 1);
          }
        }
      }

      if (!allDone) {
        requestAnimationFrame(tick);
      } else {
        setTimeout(() => {
          this.isAssembling = false;
          if (this._assemblyComplete) this._assemblyComplete();
        }, _POST_SETTLE_DELAY * 1000);
      }
    };

    requestAnimationFrame(tick);
  }

  _buildMeshes() {
    const ballMat = new THREE.MeshPhysicalMaterial({
      color: 0xccccdd,
      metalness: 0.95,
      roughness: 0.1,
      envMapIntensity: 1.5,
    });

    const stringMat = new THREE.MeshStandardMaterial({
      color: 0x444455,
      roughness: 0.6,
      metalness: 0.3,
    });

    const ballGeo = new THREE.SphereGeometry(this.ballRadius, _BALL_SEGMENTS, _BALL_SEGMENTS);
    const stringGeo = new THREE.CylinderGeometry(_STRING_RADIUS, _STRING_RADIUS, 1, _STRING_SEGMENTS);

    for (let i = 0; i < this.ballCount; i++) {
      const ball = new THREE.Mesh(ballGeo, ballMat);
      ball.castShadow = true;
      ball.receiveShadow = true;
      this.group.add(ball);
      this.ballMeshes.push(ball);

      const front = new THREE.Mesh(stringGeo, stringMat);
      const back = new THREE.Mesh(stringGeo, stringMat);
      front.castShadow = true;
      back.castShadow = true;
      this.group.add(front);
      this.group.add(back);
      this.stringPairs.push({ front, back });
    }
  }

  _hideAll() {
    for (let i = 0; i < this.ballCount; i++) {
      this._resetBall(i);
    }
  }

  _resetBall(index) {
    const pivot = this.frame.pivots[index];
    this.ballMeshes[index].position.set(pivot.x, this.frame.barY + 4, pivot.z);
    this.ballMeshes[index].scale.set(1, 1, 1);
    this._setStringLength(index, 0);
  }

  _setStringLength(index, length) {
    const pair = this.stringPairs[index];
    const s = Math.max(length, 0.001);
    pair.front.scale.y = s;
    pair.back.scale.y = s;
  }

  setStringLength(length) {
    for (let i = 0; i < this.ballCount; i++) {
      this._setStringLength(i, length);
    }
  }

  _updateStringMeshes(index) {
    const ball = this.ballMeshes[index];
    const pivot = this.frame.pivots[index];
    const pair = this.stringPairs[index];

    this._placeString(pair.front,
      pivot.x, pivot.y, _PIVOT_Z_OFFSET,
      ball.position.x, ball.position.y, _BALL_Z_OFFSET
    );
    this._placeString(pair.back,
      pivot.x, pivot.y, -_PIVOT_Z_OFFSET,
      ball.position.x, ball.position.y, -_BALL_Z_OFFSET
    );
  }

  _placeString(mesh, ax, ay, az, bx, by, bz) {
    const dx = bx - ax;
    const dy = by - ay;
    const dz = bz - az;
    const len = Math.sqrt(dx * dx + dy * dy + dz * dz);

    if (len < 0.001) {
      mesh.scale.y = 0.001;
      return;
    }

    const lengthY = mesh.scale.y;
    const clampedLen = Math.min(len, lengthY);

    const nx = dx / len;
    const ny = dy / len;
    const nz = dz / len;

    const endX = ax + nx * clampedLen;
    const endY = ay + ny * clampedLen;
    const endZ = az + nz * clampedLen;

    mesh.position.set((ax + endX) * 0.5, (ay + endY) * 0.5, (az + endZ) * 0.5);

    this._quat.setFromUnitVectors(
      this._vec3a.set(0, 1, 0),
      this._vec3b.set(nx, ny, nz)
    );
    mesh.quaternion.copy(this._quat);

    mesh.scale.y = clampedLen;
  }
}
