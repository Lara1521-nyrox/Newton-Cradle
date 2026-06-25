import * as THREE from 'three';

export class CradleFrame {
  constructor({ ballCount = 5, ballRadius = 0.25 } = {}) {
    this.ballCount = ballCount;
    this.ballRadius = ballRadius;
    this.ballDiameter = ballRadius * 2;
    this.spacing = this.ballDiameter;
    this.stringLength = 2.0;
    this.barY = 3.4;
    this.baseY = 0.2;
    this.group = new THREE.Group();

    this._buildPivots();
    this._buildFrame();
  }

  getPivotPosition(index) {
    return this.pivots[index] || null;
  }

  addTo(scene) {
    scene.add(this.group);
  }

  _buildPivots() {
    this.pivots = [];
    const centerIndex = (this.ballCount - 1) / 2;
    for (let i = 0; i < this.ballCount; i++) {
      const x = (i - centerIndex) * this.spacing;
      this.pivots.push(new THREE.Vector3(x, this.barY, 0));
    }
  }

  _buildFrame() {
    const pivotSpan = (this.ballCount - 1) * this.spacing;
    const barWidth = pivotSpan + this.ballDiameter * 2;
    const barHeight = 0.15;
    const barDepth = 0.12;
    const postSize = 0.15;
    const postHeight = this.barY - this.baseY;

    const woodMat = new THREE.MeshPhysicalMaterial({
      color: 0x2a1f1a,
      roughness: 0.7,
      metalness: 0.05,
      clearcoat: 0.1,
    });

    const steelMat = new THREE.MeshStandardMaterial({
      color: 0x888899,
      roughness: 0.15,
      metalness: 0.85,
    });

    const barGeo = new THREE.BoxGeometry(barWidth, barHeight, barDepth);
    const bar = new THREE.Mesh(barGeo, woodMat);
    bar.position.set(0, this.barY + barHeight / 2, 0);
    bar.castShadow = true;
    bar.receiveShadow = true;
    this.group.add(bar);

    const postGeo = new THREE.BoxGeometry(postSize, postHeight, postSize);

    const leftPost = new THREE.Mesh(postGeo, steelMat);
    leftPost.position.set(-barWidth / 2 + postSize / 2, this.baseY + postHeight / 2, 0);
    leftPost.castShadow = true;
    leftPost.receiveShadow = true;
    this.group.add(leftPost);

    const rightPost = new THREE.Mesh(postGeo, steelMat);
    rightPost.position.set(barWidth / 2 - postSize / 2, this.baseY + postHeight / 2, 0);
    rightPost.castShadow = true;
    rightPost.receiveShadow = true;
    this.group.add(rightPost);

    const baseWidth = barWidth + 0.4;
    const baseDepth = 0.5;
    const baseHeight = 0.2;
    const baseGeo = new THREE.BoxGeometry(baseWidth, baseHeight, baseDepth);
    const base = new THREE.Mesh(baseGeo, woodMat);
    base.position.set(0, this.baseY / 2, 0);
    base.castShadow = true;
    base.receiveShadow = true;
    this.group.add(base);
  }
}
