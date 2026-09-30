import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { BuildingModel } from './BuildingModel.js';
import { ConstructionEquipment } from './ConstructionEquipment.js';
import { CameraController } from './CameraController.js';
import { Hotspots } from './Hotspots.js';
import { TextureGenerator } from './TextureGenerator.js';
import { ScrollController } from './ScrollController.js';

export class ConstructionScene {
  constructor(containerElement, onChapterChangeCallback) {
    this.container = containerElement;
    this.onChapterChangeCallback = onChapterChangeCallback;
    this.clock = new THREE.Clock();

    this.initRenderer();
    this.initScene();
    this.initCameraAndControls();
    this.initLighting();
    this.initGround();

    // Scene entities
    this.building = new BuildingModel(this.scene);
    this.equipment = new ConstructionEquipment(this.scene, this.building);
    this.cameraController = new CameraController(this.camera, this.controls);
    this.hotspots = new Hotspots(this.scene, this.camera, this.container);

    // 3D Scroll-driven trajectory controller
    this.scrollController = new ScrollController(
      this.scene,
      this.camera,
      this.controls,
      (progress, chapter) => {
        if (this.onChapterChangeCallback) {
          this.onChapterChangeCallback(progress, chapter);
        }
      }
    );

    // Default lighting mode
    this.setLightingMode('day');

    this.bindEvents();
    this.animate();
  }

  initRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;

    this.container.appendChild(this.renderer.domElement);
  }

  initScene() {
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x9fc3e8, 0.005);
  }

  initCameraAndControls() {
    const aspect = this.container.clientWidth / this.container.clientHeight;
    this.camera = new THREE.PerspectiveCamera(42, aspect, 0.5, 600);
    this.camera.position.set(48, 42, 54);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.maxPolarAngle = Math.PI / 2 + 0.02;
    this.controls.minDistance = 15;
    this.controls.maxDistance = 200;
    this.controls.target.set(0, 24, 0);
    // Initially disabled for scroll-driven mode
    this.controls.enabled = false;
    this.controls.update();
  }

  initLighting() {
    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    this.scene.add(this.ambientLight);

    this.hemiLight = new THREE.HemisphereLight(0xdbeafe, 0x1e293b, 0.6);
    this.hemiLight.position.set(0, 100, 0);
    this.scene.add(this.hemiLight);

    this.sunLight = new THREE.DirectionalLight(0xfffaed, 2.8);
    this.sunLight.position.set(65, 80, 50);
    this.sunLight.castShadow = true;
    this.sunLight.shadow.mapSize.width = 2048;
    this.sunLight.shadow.mapSize.height = 2048;
    this.sunLight.shadow.camera.near = 10;
    this.sunLight.shadow.camera.far = 260;
    this.sunLight.shadow.camera.left = -55;
    this.sunLight.shadow.camera.right = 55;
    this.sunLight.shadow.camera.top = 75;
    this.sunLight.shadow.camera.bottom = -35;
    this.sunLight.shadow.bias = -0.0001;
    this.sunLight.shadow.radius = 2.0;
    this.scene.add(this.sunLight);

    this.floodLight1 = new THREE.SpotLight(0xffecd1, 0.0, 140, Math.PI / 3.5, 0.5);
    this.floodLight1.position.set(-28, 35, -28);
    this.floodLight1.target.position.set(0, 18, 0);
    this.scene.add(this.floodLight1);
    this.scene.add(this.floodLight1.target);

    this.floodLight2 = new THREE.SpotLight(0xffecd1, 0.0, 140, Math.PI / 3.5, 0.5);
    this.floodLight2.position.set(28, 35, -28);
    this.floodLight2.target.position.set(0, 18, 0);
    this.scene.add(this.floodLight2);
    this.scene.add(this.floodLight2.target);
  }

  initGround() {
    this.groundGroup = new THREE.Group();

    const groundTex = TextureGenerator.createGroundTexture(1024, 1024);
    const groundGeo = new THREE.PlaneGeometry(180, 180);
    const groundMat = new THREE.MeshStandardMaterial({
      map: groundTex,
      roughness: 0.9,
      metalness: 0.08
    });

    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.02;
    ground.receiveShadow = true;
    this.groundGroup.add(ground);

    const grid = new THREE.GridHelper(130, 52, 0xd97706, 0x1e293b);
    grid.position.y = 0.01;
    this.groundGroup.add(grid);

    this.scene.add(this.groundGroup);
  }

  setFreeOrbit(enabled) {
    if (this.scrollController) {
      this.scrollController.setFreeOrbit(enabled);
    }
  }

  setLightingMode(mode) {
    this.currentMode = mode;
    const skyEnv = TextureGenerator.createSkyEnvironment(mode);
    this.scene.environment = skyEnv;
    this.scene.background = skyEnv;

    if (mode === 'day') {
      this.scene.fog.color.setHex(0x9fc3e8);
      this.scene.fog.density = 0.0035;
      this.ambientLight.intensity = 0.45;
      this.ambientLight.color.setHex(0xffffff);
      this.hemiLight.intensity = 0.65;
      this.sunLight.intensity = 2.8;
      this.sunLight.color.setHex(0xfffaed);
      this.sunLight.position.set(65, 80, 50);
      this.floodLight1.intensity = 0.0;
      this.floodLight2.intensity = 0.0;
      this.building.setBlueprintMode(false);
    } else if (mode === 'sunset') {
      this.scene.fog.color.setHex(0x783545);
      this.scene.fog.density = 0.005;
      this.ambientLight.intensity = 0.35;
      this.ambientLight.color.setHex(0xffaa77);
      this.hemiLight.intensity = 0.5;
      this.sunLight.intensity = 3.6;
      this.sunLight.color.setHex(0xff6e26);
      this.sunLight.position.set(85, 20, 55);
      this.floodLight1.intensity = 1.2;
      this.floodLight2.intensity = 1.2;
      this.building.setBlueprintMode(false);
    } else if (mode === 'night') {
      this.scene.fog.color.setHex(0x060a14);
      this.scene.fog.density = 0.008;
      this.ambientLight.intensity = 0.15;
      this.ambientLight.color.setHex(0x38bdf8);
      this.hemiLight.intensity = 0.2;
      this.sunLight.intensity = 0.15;
      this.sunLight.color.setHex(0x60a5fa);
      this.floodLight1.intensity = 4.5;
      this.floodLight2.intensity = 4.5;
      this.building.setBlueprintMode(false);
    } else if (mode === 'blueprint') {
      this.scene.fog.color.setHex(0x040d1a);
      this.scene.fog.density = 0.006;
      this.ambientLight.intensity = 0.3;
      this.hemiLight.intensity = 0.2;
      this.sunLight.intensity = 0.4;
      this.floodLight1.intensity = 0.0;
      this.floodLight2.intensity = 0.0;
      this.building.setBlueprintMode(true);
    }
  }

  setPhase(phaseIndex) {
    this.building.setPhase(phaseIndex);
  }

  setExploded(isExploded) {
    this.building.setExploded(isExploded);
  }

  setViewpoint(name) {
    if (this.scrollController && !this.scrollController.freeOrbit) {
      this.setFreeOrbit(true);
    }
    this.cameraController.transitionTo(name);
  }

  bindEvents() {
    window.addEventListener('resize', () => this.onResize());
  }

  onResize() {
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    if (width === 0 || height === 0) return;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    const delta = Math.min(this.clock.getDelta(), 0.1);

    if (this.equipment) {
      this.equipment.update(delta);
    }

    // Scroll-driven camera or free orbit
    if (this.scrollController) {
      this.scrollController.update(delta);
    } else {
      this.controls.update();
    }

    if (this.cameraController && this.cameraController.isTransitioning) {
      this.cameraController.update(delta);
    }

    this.renderer.render(this.scene, this.camera);

    if (this.hotspots) {
      this.hotspots.update();
    }
  }
}
