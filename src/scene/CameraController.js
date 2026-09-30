import * as THREE from 'three';

export class CameraController {
  constructor(camera, controls) {
    this.camera = camera;
    this.controls = controls;

    // Viewpoint configurations: { pos: Vector3, target: Vector3 }
    this.viewpoints = {
      overview: {
        pos: new THREE.Vector3(45, 38, 48),
        target: new THREE.Vector3(0, 22, 0)
      },
      structure: {
        pos: new THREE.Vector3(18, 16, 18),
        target: new THREE.Vector3(2, 14, 2)
      },
      crane: {
        pos: new THREE.Vector3(20, 52, 28),
        target: new THREE.Vector3(10, 56, 10)
      },
      facade: {
        pos: new THREE.Vector3(-18, 22, 18),
        target: new THREE.Vector3(-6, 20, 6)
      },
      rooftop: {
        pos: new THREE.Vector3(5, 68, 30),
        target: new THREE.Vector3(0, 48, 0)
      }
    };

    this.isTransitioning = false;
    this.transitionProgress = 1;
    this.transitionDuration = 1.2; // seconds

    this.startPos = new THREE.Vector3();
    this.endPos = new THREE.Vector3();
    this.startTarget = new THREE.Vector3();
    this.endTarget = new THREE.Vector3();
  }

  transitionTo(viewpointName) {
    const vp = this.viewpoints[viewpointName];
    if (!vp) return;

    this.startPos.copy(this.camera.position);
    this.endPos.copy(vp.pos);

    this.startTarget.copy(this.controls.target);
    this.endTarget.copy(vp.target);

    this.transitionProgress = 0;
    this.isTransitioning = true;
  }

  update(delta) {
    if (!this.isTransitioning) return;

    this.transitionProgress += delta / this.transitionDuration;
    if (this.transitionProgress >= 1) {
      this.transitionProgress = 1;
      this.isTransitioning = false;
      this.camera.position.copy(this.endPos);
      this.controls.target.copy(this.endTarget);
    } else {
      // Smooth cubic ease out
      const t = this.transitionProgress;
      const ease = 1 - Math.pow(1 - t, 3);

      this.camera.position.lerpVectors(this.startPos, this.endPos, ease);
      this.controls.target.lerpVectors(this.startTarget, this.endTarget, ease);
    }

    this.controls.update();
  }
}
