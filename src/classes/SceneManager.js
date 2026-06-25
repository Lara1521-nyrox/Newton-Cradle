import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

const _PARTICLE_COUNT = 400;
const _CAM_SPEED = 1.2;
const _MIN_ELEVATION = 0.087;
const _MAX_ELEVATION = 1.396;
const _TARGET = new THREE.Vector3(0, 1.6, 0);

export class SceneManager {
  constructor(container = null) {
    this.container = container;
    this._ownContainer = false;

    if (!this.container) {
      this.container = document.createElement('div');
      this.container.style.position = 'fixed';
      this.container.style.inset = '0';
      document.body.appendChild(this.container);
      this._ownContainer = true;
    }

    this.renderer = null;
    this.camera = null;
    this.scene = null;
    this._particles = null;
    this._camAzimuth = 0;
    this._camElevation = Math.asin((2.2 - 1.6) / 6.527);
    this._camDistance = 6.527;
    this._keysPressed = new Set();

    this._initRenderer();
    this._initCamera();
    this._initScene();
    this._initCameraControl();
    this._initLights();
    this._initEnvironment();
    this._initStage();
    this._initParticles();
    this._applyCameraPose();

    this._onKeyDown = (e) => this._handleKeyDown(e);
    this._onKeyUp = (e) => this._handleKeyUp(e);
    window.addEventListener('keydown', this._onKeyDown);
    window.addEventListener('keyup', this._onKeyUp);

    this._onResize = () => this._resize();
    window.addEventListener('resize', this._onResize);
    this._resize();
  }

  _handleKeyDown(e) {
    if (e.key.startsWith('Arrow')) {
      e.preventDefault();
      this._keysPressed.add(e.key);
    }
  }

  _handleKeyUp(e) {
    if (e.key.startsWith('Arrow')) {
      e.preventDefault();
      this._keysPressed.delete(e.key);
    }
  }

  _initRenderer() {
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.1;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.container.appendChild(this.renderer.domElement);
  }

  _initCamera() {
    this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 50);
  }

  _initScene() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0a0a14);
    this.scene.fog = new THREE.FogExp2(0x0a0a14, 0.018);
  }

  _initCameraControl() {
    this.camera.position.set(0, 2.2, 6.5);
  }

  _initLights() {
    const keyLight = new THREE.DirectionalLight(0xffeedd, 2.5);
    keyLight.position.set(3, 8, 4);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 15;
    keyLight.shadow.camera.left = -4;
    keyLight.shadow.camera.right = 4;
    keyLight.shadow.camera.top = 4;
    keyLight.shadow.camera.bottom = -4;
    keyLight.shadow.bias = -0.001;
    this.scene.add(keyLight);

    const accentWarm = new THREE.PointLight(0xffcc88, 1.5, 10);
    accentWarm.position.set(2, 2.5, 3);
    this.scene.add(accentWarm);

    const accentCool = new THREE.PointLight(0x88ccff, 1.0, 10);
    accentCool.position.set(-2, 2, 2.5);
    this.scene.add(accentCool);

    const rimLight = new THREE.DirectionalLight(0x446688, 0.8);
    rimLight.position.set(0, -1, -5);
    this.scene.add(rimLight);
  }

  _initEnvironment() {
    const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
    const envScene = new RoomEnvironment();
    const envTexture = pmremGenerator.fromScene(envScene).texture;
    this.scene.environment = envTexture;
    pmremGenerator.dispose();
  }

  _initStage() {
    const floorGeo = new THREE.PlaneGeometry(20, 20);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x0a0a14,
      roughness: 0.3,
      metalness: 0.1,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.05;
    floor.receiveShadow = true;
    this.scene.add(floor);
  }

  _initParticles() {
    const count = _PARTICLE_COUNT;
    const positions = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 14;
      positions[i * 3 + 1] = Math.random() * 5;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 14 - 1;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const mat = new THREE.PointsMaterial({
      color: 0x8899bb,
      size: 0.015,
      transparent: true,
      opacity: 0.25,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true,
    });

    this._particles = new THREE.Points(geo, mat);
    this.scene.add(this._particles);
  }

  _applyCameraPose() {
    const el = this._camElevation;
    const az = this._camAzimuth;
    const d = this._camDistance;
    this.camera.position.set(
      _TARGET.x + d * Math.cos(el) * Math.sin(az),
      _TARGET.y + d * Math.sin(el),
      _TARGET.z + d * Math.cos(el) * Math.cos(az),
    );
    this.camera.lookAt(_TARGET);
  }

  add(object) {
    this.scene.add(object);
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }

  update(delta) {
    if (this._keysPressed.has('ArrowLeft')) this._camAzimuth -= _CAM_SPEED * delta;
    if (this._keysPressed.has('ArrowRight')) this._camAzimuth += _CAM_SPEED * delta;
    if (this._keysPressed.has('ArrowUp')) this._camElevation += _CAM_SPEED * delta;
    if (this._keysPressed.has('ArrowDown')) this._camElevation -= _CAM_SPEED * delta;

    this._camElevation = Math.max(_MIN_ELEVATION, Math.min(_MAX_ELEVATION, this._camElevation));
    this._applyCameraPose();

    if (this._particles) {
      const pos = this._particles.geometry.attributes.position.array;
      const count = pos.length / 3;
      for (let i = 0; i < count; i++) {
        const idx = i * 3;
        pos[idx + 1] += delta * 0.015;
        pos[idx] += delta * 0.003;
        if (pos[idx + 1] > 5) {
          pos[idx + 1] = 0;
          pos[idx] = (Math.random() - 0.5) * 14;
          pos[idx + 2] = (Math.random() - 0.5) * 14 - 1;
        }
      }
      this._particles.geometry.attributes.position.needsUpdate = true;
    }
  }

  dispose() {
    window.removeEventListener('keydown', this._onKeyDown);
    window.removeEventListener('keyup', this._onKeyUp);
    window.removeEventListener('resize', this._onResize);
    this.renderer.dispose();
    if (this._ownContainer && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }
  }

  _resize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  }
}
