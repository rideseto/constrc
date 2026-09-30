import * as THREE from 'three';
import { TextureGenerator } from './TextureGenerator.js';

export class ConstructionEquipment {
  constructor(scene, buildingModel) {
    this.scene = scene;
    this.buildingModel = buildingModel;
    this.group = new THREE.Group();
    this.scene.add(this.group);

    this.initMaterials();
    this.buildLatticeTowerCrane();
    this.buildConcreteMixer();
    this.buildSiteStagingProps();

    // Animation states
    this.craneRotation = 0.4;
    this.trolleyPos = 14;
    this.trolleyDirection = 1;
    this.hoistY = 28;
    this.hoistDir = 1;
    this.drumRotation = 0;
  }

  initMaterials() {
    const steelTex = TextureGenerator.createSteelTextures();
    const concreteTex = TextureGenerator.createConcreteTextures();

    this.materials = {
      craneYellow: new THREE.MeshStandardMaterial({
        color: 0xf59e0b,
        roughness: 0.35,
        metalness: 0.65
      }),
      craneRed: new THREE.MeshStandardMaterial({
        color: 0xdc2626,
        roughness: 0.4,
        metalness: 0.6
      }),
      steelCable: new THREE.MeshStandardMaterial({
        color: 0x94a3b8,
        roughness: 0.3,
        metalness: 0.9
      }),
      counterweight: new THREE.MeshStandardMaterial({
        map: concreteTex.map,
        roughnessMap: concreteTex.roughnessMap,
        bumpMap: concreteTex.bumpMap,
        roughness: 0.9,
        metalness: 0.05
      }),
      beaconRed: new THREE.MeshBasicMaterial({
        color: 0xff0033
      }),
      truckCab: new THREE.MeshStandardMaterial({
        color: 0x1e3a8a,
        roughness: 0.25,
        metalness: 0.8
      }),
      mixerDrum: new THREE.MeshStandardMaterial({
        color: 0xe2e8f0,
        roughness: 0.45,
        metalness: 0.5
      }),
      tire: new THREE.MeshStandardMaterial({
        color: 0x111827,
        roughness: 0.95,
        metalness: 0.02
      }),
      timberDunnage: new THREE.MeshStandardMaterial({
        color: 0x78350f,
        roughness: 0.85,
        metalness: 0.02
      }),
      glass: new THREE.MeshPhysicalMaterial({
        color: 0x64748b,
        metalness: 0.1,
        roughness: 0.1,
        transmission: 0.7,
        transparent: true
      })
    };
  }

  /**
   * Builds an authentic open-web 4-chord lattice tower section
   */
  createLatticeTowerSection(height, width = 1.8) {
    const sectionGroup = new THREE.Group();
    const halfW = width / 2;
    const chordRadius = 0.055;
    const lacingRadius = 0.028;

    const chordGeo = new THREE.CylinderGeometry(chordRadius, chordRadius, height, 8);
    const chordPositions = [
      [-halfW, -halfW], [halfW, -halfW],
      [halfW, halfW],   [-halfW, halfW]
    ];

    // 4 Main corner vertical chords
    chordPositions.forEach(([cx, cz]) => {
      const chord = new THREE.Mesh(chordGeo, this.materials.craneYellow);
      chord.position.set(cx, height / 2, cz);
      chord.castShadow = true;
      sectionGroup.add(chord);
    });

    // Horizontal & diagonal tubular lacing struts
    const panels = Math.round(height / 2.0);
    const panelH = height / panels;
    const diagLen = Math.sqrt(Math.pow(width, 2) + Math.pow(panelH, 2));
    const diagGeo = new THREE.CylinderGeometry(lacingRadius, lacingRadius, diagLen, 6);
    const horizGeo = new THREE.CylinderGeometry(lacingRadius, lacingRadius, width, 6);

    for (let p = 0; p < panels; p++) {
      const y1 = p * panelH;
      const y2 = (p + 1) * panelH;
      const midY = (y1 + y2) / 2;

      // Front & Back diagonal lacing
      const d1 = new THREE.Mesh(diagGeo, this.materials.craneYellow);
      d1.position.set(0, midY, halfW);
      d1.rotation.z = Math.atan2(width, panelH) * (p % 2 === 0 ? 1 : -1);
      sectionGroup.add(d1);

      const d2 = new THREE.Mesh(diagGeo, this.materials.craneYellow);
      d2.position.set(0, midY, -halfW);
      d2.rotation.z = Math.atan2(width, panelH) * (p % 2 === 0 ? -1 : 1);
      sectionGroup.add(d2);

      // Left & Right diagonal lacing
      const d3 = new THREE.Mesh(diagGeo, this.materials.craneYellow);
      d3.position.set(-halfW, midY, 0);
      d3.rotation.x = Math.atan2(width, panelH) * (p % 2 === 0 ? 1 : -1);
      sectionGroup.add(d3);

      const d4 = new THREE.Mesh(diagGeo, this.materials.craneYellow);
      d4.position.set(halfW, midY, 0);
      d4.rotation.x = Math.atan2(width, panelH) * (p % 2 === 0 ? -1 : 1);
      sectionGroup.add(d4);

      // Horizontal frame collar ring
      const hFront = new THREE.Mesh(horizGeo, this.materials.craneYellow);
      hFront.rotation.z = Math.PI / 2;
      hFront.position.set(0, y2, halfW);
      sectionGroup.add(hFront);

      const hBack = new THREE.Mesh(horizGeo, this.materials.craneYellow);
      hBack.rotation.z = Math.PI / 2;
      hBack.position.set(0, y2, -halfW);
      sectionGroup.add(hBack);
    }

    return sectionGroup;
  }

  buildLatticeTowerCrane() {
    this.craneGroup = new THREE.Group();
    this.craneGroup.position.set(11, 0, 11);

    const mastHeight = 60;
    const mastSection = this.createLatticeTowerSection(mastHeight, 2.0);
    this.craneGroup.add(mastSection);

    // Slewing ring unit (turntable)
    this.slewingGroup = new THREE.Group();
    this.slewingGroup.position.set(0, mastHeight, 0);
    this.craneGroup.add(this.slewingGroup);

    // Slewing ring gear collar
    const gearGeo = new THREE.CylinderGeometry(1.4, 1.4, 0.6, 24);
    const gear = new THREE.Mesh(gearGeo, this.materials.steelCable);
    gear.position.y = 0.3;
    this.slewingGroup.add(gear);

    // Operator Cab with glass windows
    const cabGeo = new THREE.BoxGeometry(1.6, 2.0, 1.6);
    const cab = new THREE.Mesh(cabGeo, this.materials.craneRed);
    cab.position.set(1.4, 1.2, 0);
    cab.castShadow = true;
    this.slewingGroup.add(cab);

    const cabWindowGeo = new THREE.BoxGeometry(0.05, 1.1, 1.2);
    const cabWindow = new THREE.Mesh(cabWindowGeo, this.materials.glass);
    cabWindow.position.set(2.21, 1.4, 0);
    this.slewingGroup.add(cabWindow);

    // A-frame Tower Peak (Cathead apex)
    const apexHeight = 8.5;
    const apexGeo = new THREE.ConeGeometry(1.3, apexHeight, 4);
    const apex = new THREE.Mesh(apexGeo, this.materials.craneYellow);
    apex.position.set(0, apexHeight / 2 + 0.6, 0);
    this.slewingGroup.add(apex);

    // Aircraft Warning Light & Flashing Beacon
    const beaconGeo = new THREE.SphereGeometry(0.22, 12, 12);
    this.beacon = new THREE.Mesh(beaconGeo, this.materials.beaconRed);
    this.beacon.position.set(0, apexHeight + 0.8, 0);
    this.slewingGroup.add(this.beacon);

    this.beaconLight = new THREE.PointLight(0xff0033, 2.0, 30);
    this.beaconLight.position.set(0, apexHeight + 0.9, 0);
    this.slewingGroup.add(this.beaconLight);

    // Working Jib (Lattice arm) extending 30 units
    const jibLen = 30;
    this.jibGroup = new THREE.Group();
    this.jibGroup.position.set(0, 1.2, 0);

    const jibTruss = this.createLatticeTowerSection(jibLen, 1.2);
    jibTruss.rotation.z = Math.PI / 2;
    jibTruss.position.set(-jibLen, 0, 0);
    this.jibGroup.add(jibTruss);

    // Tension pendant tie-rods from A-frame peak to mid and tip of Jib
    const tieGeo1 = new THREE.CylinderGeometry(0.025, 0.025, 22, 6);
    const tie1 = new THREE.Mesh(tieGeo1, this.materials.steelCable);
    tie1.position.set(-10, 5.0, 0);
    tie1.rotation.z = 0.55;
    this.slewingGroup.add(tie1);

    // Counter-Jib extending 11 units opposite
    const counterJibLen = 11;
    const counterTruss = this.createLatticeTowerSection(counterJibLen, 1.2);
    counterTruss.rotation.z = -Math.PI / 2;
    counterTruss.position.set(0, 0, 0);
    this.jibGroup.add(counterTruss);

    // Counterweight slabs (textured concrete with bevels)
    const cwGeo = new THREE.BoxGeometry(2.8, 1.8, 1.4);
    const cw = new THREE.Mesh(cwGeo, this.materials.counterweight);
    cw.position.set(counterJibLen - 1.8, 1.0, 0);
    cw.castShadow = true;
    this.jibGroup.add(cw);

    // Winch Hoist Drum with wound cable
    const drumGeo = new THREE.CylinderGeometry(0.5, 0.5, 1.0, 16);
    const drum = new THREE.Mesh(drumGeo, this.materials.steelCable);
    drum.rotation.z = Math.PI / 2;
    drum.position.set(3.5, 0.8, 0);
    this.jibGroup.add(drum);

    this.slewingGroup.add(this.jibGroup);

    // Trolley traversing along the jib
    this.trolley = new THREE.Group();
    this.trolley.position.set(-14, 0, 0);
    this.jibGroup.add(this.trolley);

    const trolleyBodyGeo = new THREE.BoxGeometry(1.4, 0.45, 0.9);
    const trolleyBody = new THREE.Mesh(trolleyBodyGeo, this.materials.craneRed);
    this.trolley.add(trolleyBody);

    // Hoist Cable
    const cableGeo = new THREE.CylinderGeometry(0.03, 0.03, 1, 6);
    this.cable = new THREE.Mesh(cableGeo, this.materials.steelCable);
    this.trolley.add(this.cable);

    // Hook Block & Structural Load
    this.cargoGroup = new THREE.Group();
    this.trolley.add(this.cargoGroup);

    const hookGeo = new THREE.BoxGeometry(0.65, 0.6, 0.65);
    const hook = new THREE.Mesh(hookGeo, this.materials.steelCable);
    this.cargoGroup.add(hook);

    // Suspended structural steel I-Beam load
    const loadGeo = this.buildingModel.createIBeamGeometry(6.0, 0.5, 0.4, 0.06, 0.04);
    loadGeo.center();
    const loadMesh = new THREE.Mesh(loadGeo, this.materials.craneYellow);
    loadMesh.position.y = -0.7;
    loadMesh.castShadow = true;
    this.cargoGroup.add(loadMesh);

    this.group.add(this.craneGroup);
  }

  buildConcreteMixer() {
    this.mixerTruck = new THREE.Group();
    this.mixerTruck.position.set(-18, 0, 9);
    this.mixerTruck.rotation.y = Math.PI / 3.2;

    // Heavy 3-axle truck chassis
    const chassisGeo = new THREE.BoxGeometry(8.2, 0.6, 2.6);
    const chassis = new THREE.Mesh(chassisGeo, this.materials.counterweight);
    chassis.position.y = 0.7;
    this.mixerTruck.add(chassis);

    // Modern aerodynamic cab
    const cabGeo = new THREE.BoxGeometry(2.4, 2.4, 2.5);
    const cab = new THREE.Mesh(cabGeo, this.materials.truckCab);
    cab.position.set(2.7, 2.0, 0);
    cab.castShadow = true;
    this.mixerTruck.add(cab);

    // Windshield & side glass
    const wsGeo = new THREE.BoxGeometry(0.1, 1.1, 2.3);
    const ws = new THREE.Mesh(wsGeo, this.materials.glass);
    ws.position.set(3.91, 2.2, 0);
    this.mixerTruck.add(ws);

    // Tilted rotating mixing drum
    this.drumGroup = new THREE.Group();
    this.drumGroup.position.set(-1.1, 2.2, 0);
    this.drumGroup.rotation.z = -0.24;
    this.mixerTruck.add(this.drumGroup);

    const drumGeo = new THREE.CylinderGeometry(1.4, 1.8, 4.2, 24);
    this.drum = new THREE.Mesh(drumGeo, this.materials.mixerDrum);
    this.drum.rotation.z = Math.PI / 2;
    this.drum.castShadow = true;
    this.drumGroup.add(this.drum);

    // Wheels (6 wheels)
    const wheelGeo = new THREE.CylinderGeometry(0.6, 0.6, 0.45, 16);
    const wheelPositions = [
      [2.5, 0.6, 1.35],  [2.5, 0.6, -1.35],
      [-1.4, 0.6, 1.35], [-1.4, 0.6, -1.35],
      [-2.9, 0.6, 1.35], [-2.9, 0.6, -1.35]
    ];

    wheelPositions.forEach(([wx, wy, wz]) => {
      const wheel = new THREE.Mesh(wheelGeo, this.materials.tire);
      wheel.rotation.x = Math.PI / 2;
      wheel.position.set(wx, wy, wz);
      wheel.castShadow = true;
      this.mixerTruck.add(wheel);
    });

    this.group.add(this.mixerTruck);
  }

  buildSiteStagingProps() {
    this.propsGroup = new THREE.Group();

    // 1. Stack of Structural Steel I-Beams on timber dunnage blocks
    const dunnage1 = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.3, 3.5), this.materials.timberDunnage);
    dunnage1.position.set(-10, 0.15, -12);
    this.propsGroup.add(dunnage1);

    const dunnage2 = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.3, 3.5), this.materials.timberDunnage);
    dunnage2.position.set(-6, 0.15, -12);
    this.propsGroup.add(dunnage2);

    for (let i = 0; i < 3; i++) {
      const beamGeo = this.buildingModel.createIBeamGeometry(5.5, 0.45, 0.35, 0.05, 0.035);
      beamGeo.center();
      const beam = new THREE.Mesh(beamGeo, this.materials.craneYellow);
      beam.rotation.y = Math.PI / 2;
      beam.position.set(-8, 0.55 + i * 0.45, -12);
      beam.castShadow = true;
      this.propsGroup.add(beam);
    }

    // 2. Concrete Pour Hopper Bucket (Yellow cylindrical bucket with discharge cone)
    const bucketGeo = new THREE.CylinderGeometry(1.0, 0.5, 1.6, 16);
    const bucket = new THREE.Mesh(bucketGeo, this.materials.craneYellow);
    bucket.position.set(-4, 0.8, 12);
    bucket.castShadow = true;
    this.propsGroup.add(bucket);

    this.group.add(this.propsGroup);
  }

  update(delta) {
    // Crane continuous smooth slewing tracking
    this.craneRotation += delta * 0.16;
    if (this.slewingGroup) {
      this.slewingGroup.rotation.y = this.craneRotation;
    }

    // Trolley smooth traversal along the jib
    this.trolleyPos += this.trolleyDirection * delta * 2.2;
    if (this.trolleyPos > 26) {
      this.trolleyPos = 26;
      this.trolleyDirection = -1;
    } else if (this.trolleyPos < 6) {
      this.trolleyPos = 6;
      this.trolleyDirection = 1;
    }

    if (this.trolley) {
      this.trolley.position.x = -this.trolleyPos;

      // Cable hoist length
      this.hoistY += this.hoistDir * delta * 2.8;
      if (this.hoistY > 42) {
        this.hoistY = 42;
        this.hoistDir = -1;
      } else if (this.hoistY < 14) {
        this.hoistY = 14;
        this.hoistDir = 1;
      }

      if (this.cable && this.cargoGroup) {
        this.cable.scale.set(1, this.hoistY, 1);
        this.cable.position.y = -this.hoistY / 2;
        this.cargoGroup.position.y = -this.hoistY;
      }
    }

    // Mixer drum rotation
    if (this.drum) {
      this.drumRotation += delta * 1.6;
      this.drum.rotation.x = this.drumRotation;
    }

    // Flashing red aircraft warning beacon
    const time = Date.now() * 0.003;
    const flash = Math.sin(time * 3.5) > 0;
    if (this.beaconLight) {
      this.beaconLight.intensity = flash ? 2.5 : 0.0;
    }
  }
}
