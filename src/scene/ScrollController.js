import * as THREE from 'three';

export class ScrollController {
  constructor(scene, camera, controls, onProgressCallback) {
    this.scene = scene;
    this.camera = camera;
    this.controls = controls;
    this.onProgressCallback = onProgressCallback;

    this.freeOrbit = false;
    this.targetScrollProgress = 0;
    this.currentScrollProgress = 0;

    // Define 3D Camera Keyframes along the continuous construction site trajectory
    this.keyframes = [
      {
        p: 0.00,
        pos: new THREE.Vector3(48, 42, 54),
        target: new THREE.Vector3(0, 24, 0),
        phase: 4,
        chapter: 0
      },
      {
        p: 0.18,
        pos: new THREE.Vector3(22, 6, 22),
        target: new THREE.Vector3(0, -1.2, 3.5),
        phase: 0,
        chapter: 1
      },
      {
        p: 0.36,
        pos: new THREE.Vector3(18, 20, 18),
        target: new THREE.Vector3(2, 16, 2),
        phase: 2,
        chapter: 2
      },
      {
        p: 0.54,
        pos: new THREE.Vector3(-16, 22, 16),
        target: new THREE.Vector3(-4, 18, 3),
        phase: 3,
        chapter: 3
      },
      {
        p: 0.72,
        pos: new THREE.Vector3(16, 56, 24),
        target: new THREE.Vector3(11, 56, 11),
        phase: 4,
        chapter: 4
      },
      {
        p: 0.88,
        pos: new THREE.Vector3(-15, 48, 16),
        target: new THREE.Vector3(0, 48, 0),
        phase: 4,
        chapter: 5
      },
      {
        p: 1.00,
        pos: new THREE.Vector3(45, 38, 48),
        target: new THREE.Vector3(0, 24, 0),
        phase: 4,
        chapter: 6
      }
    ];

    this.tempPos = new THREE.Vector3();
    this.tempTarget = new THREE.Vector3();
    this.lastActiveChapter = 0;

    this.initScrollListener();
  }

  initScrollListener() {
    const updateScroll = () => {
      const scrollY = window.scrollY;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (maxScroll <= 0) {
        this.targetScrollProgress = 0;
      } else {
        this.targetScrollProgress = Math.min(1.0, Math.max(0.0, scrollY / maxScroll));
      }
    };

    window.addEventListener('scroll', updateScroll, { passive: true });
    updateScroll();
  }

  setFreeOrbit(enabled) {
    this.freeOrbit = enabled;
    this.controls.enabled = enabled;
  }

  update(delta) {
    if (this.freeOrbit) {
      this.controls.update();
      return;
    }

    // Smooth inertia damping on scroll progress
    const lerpFactor = Math.min(1.0, delta * 5.0);
    this.currentScrollProgress += (this.targetScrollProgress - this.currentScrollProgress) * lerpFactor;

    // Calculate interpolated 3D camera position and look-at target
    const p = this.currentScrollProgress;
    let kf1 = this.keyframes[0];
    let kf2 = this.keyframes[this.keyframes.length - 1];

    for (let i = 0; i < this.keyframes.length - 1; i++) {
      if (p >= this.keyframes[i].p && p <= this.keyframes[i + 1].p) {
        kf1 = this.keyframes[i];
        kf2 = this.keyframes[i + 1];
        break;
      }
    }

    const range = kf2.p - kf1.p;
    const localT = range > 0.0001 ? (p - kf1.p) / range : 0;
    // Cubic smoothstep easing
    const smoothT = localT * localT * (3 - 2 * localT);

    this.tempPos.lerpVectors(kf1.pos, kf2.pos, smoothT);
    this.tempTarget.lerpVectors(kf1.target, kf2.target, smoothT);

    this.camera.position.copy(this.tempPos);
    this.controls.target.copy(this.tempTarget);
    this.controls.update();

    // Determine current active chapter
    let currentChapter = kf1.chapter;
    if (smoothT > 0.5) currentChapter = kf2.chapter;

    if (currentChapter !== this.lastActiveChapter) {
      this.lastActiveChapter = currentChapter;
      if (this.onProgressCallback) {
        this.onProgressCallback(p, currentChapter);
      }
    }
  }
}
