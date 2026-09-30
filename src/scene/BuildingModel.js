import * as THREE from 'three';
import { TextureGenerator } from './TextureGenerator.js';

export class BuildingModel {
  constructor(scene) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.scene.add(this.group);

    // Sub-groups for 4D Phase control and exploded view
    this.foundationGroup = new THREE.Group();
    this.coreGroup = new THREE.Group();
    this.steelGroup = new THREE.Group();
    this.mepGroup = new THREE.Group();
    this.modularGroup = new THREE.Group();
    this.facadeGroup = new THREE.Group();
    this.rooftopGroup = new THREE.Group();
    this.safetyGroup = new THREE.Group();

    this.group.add(this.foundationGroup);
    this.group.add(this.coreGroup);
    this.group.add(this.steelGroup);
    this.group.add(this.mepGroup);
    this.group.add(this.modularGroup);
    this.group.add(this.facadeGroup);
    this.group.add(this.rooftopGroup);
    this.group.add(this.safetyGroup);

    this.numFloors = 20;
    this.floorHeight = 2.5;
    this.buildingWidth = 15;
    this.buildingDepth = 15;
    this.coreWidth = 5.2;
    this.coreDepth = 5.2;

    this.isExploded = false;
    this.floorGroups = [];

    this.initMaterials();
    this.buildFoundation();
    this.buildCore();
    this.buildFloorsAndStructure();
    this.buildModularPods();
    this.buildFacade();
    this.buildRooftop();
    this.buildActiveConstructionDetails();

    // Default to active full phase
    this.setPhase(4);
  }

  initMaterials() {
    // Generate realistic procedural PBR textures
    const concreteTex = TextureGenerator.createConcreteTextures();
    const steelTex = TextureGenerator.createSteelTextures();

    concreteTex.map.repeat.set(1.5, 4);
    concreteTex.roughnessMap.repeat.set(1.5, 4);
    concreteTex.bumpMap.repeat.set(1.5, 4);

    this.materials = {
      // Board-formed architectural concrete
      concrete: new THREE.MeshStandardMaterial({
        map: concreteTex.map,
        roughnessMap: concreteTex.roughnessMap,
        bumpMap: concreteTex.bumpMap,
        bumpScale: 0.04,
        roughness: 0.82,
        metalness: 0.08
      }),

      // Unfinished concrete core with formwork texture
      coreConcrete: new THREE.MeshStandardMaterial({
        map: concreteTex.map,
        roughnessMap: concreteTex.roughnessMap,
        bumpMap: concreteTex.bumpMap,
        bumpScale: 0.06,
        roughness: 0.88,
        metalness: 0.05
      }),

      // Industrial primed structural steel (Safety Orange)
      steelOrange: new THREE.MeshStandardMaterial({
        map: steelTex.orangeSteelMap,
        roughness: 0.38,
        metalness: 0.72
      }),

      // Weathered mill-scale structural steel (Dark Charcoal)
      steelCharcoal: new THREE.MeshStandardMaterial({
        map: steelTex.carbonSteelMap,
        roughness: 0.45,
        metalness: 0.82
      }),

      // Floor concrete topping slab
      floorSlab: new THREE.MeshStandardMaterial({
        map: concreteTex.map,
        roughness: 0.75,
        metalness: 0.1
      }),

      // Architectural high-performance curtain glass (realistic double-glazed reflective)
      glass: new THREE.MeshPhysicalMaterial({
        color: 0x88c2b5,
        metalness: 0.15,
        roughness: 0.06,
        transmission: 0.82,
        thickness: 0.8,
        ior: 1.52,
        transparent: true,
        opacity: 0.78,
        reflectivity: 0.85
      }),

      // Dark spandrel glass panel (between floor slabs)
      glassSpandrel: new THREE.MeshStandardMaterial({
        color: 0x172230,
        roughness: 0.1,
        metalness: 0.9
      }),

      // Aluminum mullion cap profiles
      mullion: new THREE.MeshStandardMaterial({
        color: 0x1e2634,
        roughness: 0.25,
        metalness: 0.88
      }),

      // Steel rebar starter bars (ribbed carbon steel)
      rebar: new THREE.MeshStandardMaterial({
        color: 0x4a433b,
        roughness: 0.6,
        metalness: 0.7
      }),

      // Perimeter safety edge protection screens (safety yellow steel mesh)
      safetyScreen: new THREE.MeshStandardMaterial({
        color: 0xfacc15,
        roughness: 0.4,
        metalness: 0.3,
        transparent: true,
        opacity: 0.85
      }),

      // Plywood formwork panels
      plywood: new THREE.MeshStandardMaterial({
        color: 0x85532c,
        roughness: 0.7,
        metalness: 0.05
      }),

      // MEP utilities
      mepDuct: new THREE.MeshStandardMaterial({
        color: 0xc8ced6,
        roughness: 0.3,
        metalness: 0.75
      }),
      mepPipe: new THREE.MeshStandardMaterial({
        color: 0x0284c7,
        roughness: 0.35,
        metalness: 0.65
      }),

      // Prefab modular pod units
      modularShell: new THREE.MeshStandardMaterial({
        color: 0xedf2f7,
        roughness: 0.5,
        metalness: 0.2
      }),
      modularAccent: new THREE.MeshStandardMaterial({
        color: 0x1d4ed8,
        roughness: 0.35,
        metalness: 0.4
      }),

      // Solar Photovoltaic panel glass & cells
      solarCell: new THREE.MeshStandardMaterial({
        color: 0x07152b,
        roughness: 0.15,
        metalness: 0.95
      }),

      // Wireframe blueprint shader
      wireframeBlueprint: new THREE.MeshBasicMaterial({
        color: 0x00f0ff,
        wireframe: true
      })
    };
  }

  /**
   * Generates authentic flanged wide-flange I-beam geometry (W-shape)
   */
  createIBeamGeometry(length, depth = 0.45, flangeWidth = 0.35, flangeThick = 0.05, webThick = 0.04) {
    const shape = new THREE.Shape();
    const halfW = flangeWidth / 2;
    const halfD = depth / 2;
    const halfTw = webThick / 2;

    shape.moveTo(-halfW, halfD);
    shape.lineTo(halfW, halfD);
    shape.lineTo(halfW, halfD - flangeThick);
    shape.lineTo(halfTw, halfD - flangeThick);
    shape.lineTo(halfTw, -halfD + flangeThick);
    shape.lineTo(halfW, -halfD + flangeThick);
    shape.lineTo(halfW, -halfD);
    shape.lineTo(-halfW, -halfD);
    shape.lineTo(-halfW, -halfD + flangeThick);
    shape.lineTo(-halfTw, -halfD + flangeThick);
    shape.lineTo(-halfTw, halfD - flangeThick);
    shape.lineTo(-halfW, halfD - flangeThick);
    shape.closePath();

    const extrudeSettings = {
      depth: length,
      bevelEnabled: false
    };

    return new THREE.ExtrudeGeometry(shape, extrudeSettings);
  }

  buildFoundation() {
    // Heavy reinforced concrete foundation base slab
    const slabGeo = new THREE.BoxGeometry(this.buildingWidth + 4, 2.2, this.buildingDepth + 4);
    const slab = new THREE.Mesh(slabGeo, this.materials.concrete);
    slab.position.y = -1.1;
    slab.receiveShadow = true;
    slab.castShadow = true;
    this.foundationGroup.add(slab);

    // Deep subterranean drilled foundation piles
    const pileGeo = new THREE.CylinderGeometry(0.45, 0.45, 9.0, 16);
    const pileSpacing = 3.6;
    for (let x = -6.5; x <= 6.5; x += pileSpacing) {
      for (let z = -6.5; z <= 6.5; z += pileSpacing) {
        const pile = new THREE.Mesh(pileGeo, this.materials.concrete);
        pile.position.set(x, -6.6, z);
        pile.receiveShadow = true;
        this.foundationGroup.add(pile);
      }
    }
  }

  buildCore() {
    // Central concrete shear wall core
    const totalHeight = this.numFloors * this.floorHeight;
    const coreGeo = new THREE.BoxGeometry(this.coreWidth, totalHeight, this.coreDepth);
    const core = new THREE.Mesh(coreGeo, this.materials.coreConcrete);
    core.position.y = totalHeight / 2;
    core.castShadow = true;
    core.receiveShadow = true;
    this.coreGroup.add(core);

    // Concrete core elevator door cut-outs & lintels
    const lintelGeo = new THREE.BoxGeometry(1.6, 0.2, 0.15);
    for (let i = 0; i < this.numFloors; i++) {
      const lintel = new THREE.Mesh(lintelGeo, this.materials.steelCharcoal);
      lintel.position.set(0, i * this.floorHeight + 2.1, this.coreDepth / 2 + 0.08);
      this.coreGroup.add(lintel);
    }
  }

  buildFloorsAndStructure() {
    const halfW = this.buildingWidth / 2 - 0.4;
    const halfD = this.buildingDepth / 2 - 0.4;

    // Column positions around perimeter
    const colCoords = [
      [-halfW, -halfD], [0, -halfD], [halfW, -halfD],
      [-halfW, 0],                   [halfW, 0],
      [-halfW, halfD],  [0, halfD],  [halfW, halfD]
    ];

    // Floor slab geometry
    const slabGeo = new THREE.BoxGeometry(this.buildingWidth, 0.28, this.buildingDepth);

    for (let floor = 0; floor < this.numFloors; floor++) {
      const floorGrp = new THREE.Group();
      const floorY = floor * this.floorHeight;
      floorGrp.position.y = floorY;
      floorGrp.userData = { originalY: floorY, floorIndex: floor };

      // Cast-in-place concrete floor slab
      const slab = new THREE.Mesh(slabGeo, this.materials.floorSlab);
      slab.position.y = 0.14;
      slab.receiveShadow = true;
      slab.castShadow = true;
      floorGrp.add(slab);

      // Flanged Wide-Flange Structural I-Beam Columns
      colCoords.forEach(([cx, cz]) => {
        const colGeo = this.createIBeamGeometry(this.floorHeight, 0.5, 0.4, 0.06, 0.04);
        colGeo.center();
        const colMat = (floor % 2 === 0) ? this.materials.steelOrange : this.materials.steelCharcoal;
        const col = new THREE.Mesh(colGeo, colMat);
        col.rotation.x = Math.PI / 2; // Orient vertically
        col.position.set(cx, this.floorHeight / 2, cz);
        col.castShadow = true;
        col.receiveShadow = true;
        floorGrp.add(col);

        // Bolted structural connection base plate
        const plateGeo = new THREE.BoxGeometry(0.65, 0.08, 0.65);
        const plate = new THREE.Mesh(plateGeo, this.materials.steelCharcoal);
        plate.position.set(cx, 0.28, cz);
        floorGrp.add(plate);
      });

      // Horizontal Girder I-Beams linking columns
      const spanX = this.buildingWidth - 0.8;
      const girderXGeo = this.createIBeamGeometry(spanX, 0.42, 0.3, 0.05, 0.035);
      girderXGeo.center();

      const girderSouth = new THREE.Mesh(girderXGeo, this.materials.steelCharcoal);
      girderSouth.rotation.y = Math.PI / 2;
      girderSouth.position.set(0, this.floorHeight - 0.2, halfD);
      girderSouth.castShadow = true;
      floorGrp.add(girderSouth);

      const girderNorth = new THREE.Mesh(girderXGeo, this.materials.steelCharcoal);
      girderNorth.rotation.y = Math.PI / 2;
      girderNorth.position.set(0, this.floorHeight - 0.2, -halfD);
      girderNorth.castShadow = true;
      floorGrp.add(girderNorth);

      // Structural Diagrid cross bracing on lower 8 levels
      if (floor < 8 && floor % 2 === 0) {
        this.addDiagridBrace(floorGrp, halfW, halfD);
      }

      // Ceiling MEP installations
      if (floor < 14) {
        this.addFloorMEP(floorGrp);
      }

      this.floorGroups.push(floorGrp);
      this.steelGroup.add(floorGrp);
    }
  }

  addDiagridBrace(parentGroup, hw, hd) {
    const braceLen = Math.sqrt(Math.pow(hw, 2) + Math.pow(this.floorHeight * 2, 2));
    const braceGeo = new THREE.CylinderGeometry(0.12, 0.12, braceLen, 12);
    const angle = Math.atan2(hw, this.floorHeight * 2);

    const b1 = new THREE.Mesh(braceGeo, this.materials.steelOrange);
    b1.position.set(hw / 2, this.floorHeight, hd);
    b1.rotation.z = angle;
    b1.castShadow = true;
    parentGroup.add(b1);

    const b2 = new THREE.Mesh(braceGeo, this.materials.steelOrange);
    b2.position.set(-hw / 2, this.floorHeight, hd);
    b2.rotation.z = -angle;
    b2.castShadow = true;
    parentGroup.add(b2);
  }

  addFloorMEP(parentGroup) {
    // Galvanized HVAC trunk duct
    const ductGeo = new THREE.BoxGeometry(this.buildingWidth * 0.72, 0.32, 0.55);
    const duct = new THREE.Mesh(ductGeo, this.materials.mepDuct);
    duct.position.set(0, this.floorHeight - 0.42, -2.2);
    parentGroup.add(duct);

    // Fire protection sprinkler piping
    const pipeGeo = new THREE.CylinderGeometry(0.045, 0.045, this.buildingWidth * 0.78, 8);
    const pipe = new THREE.Mesh(pipeGeo, this.materials.mepPipe);
    pipe.rotation.z = Math.PI / 2;
    pipe.position.set(0, this.floorHeight - 0.55, 2.2);
    parentGroup.add(pipe);
  }

  buildModularPods() {
    // Industrialized off-site manufactured bathroom and MEP cassettes on floors 3 - 10
    const podGeo = new THREE.BoxGeometry(3.2, 2.1, 2.4);

    for (let f = 3; f <= 10; f++) {
      const y = f * this.floorHeight + 1.2;

      const podWest = new THREE.Mesh(podGeo, this.materials.modularShell);
      podWest.position.set(-4.4, y, 2.8);
      podWest.castShadow = true;
      podWest.receiveShadow = true;
      this.modularGroup.add(podWest);

      const podEast = new THREE.Mesh(podGeo, this.materials.modularAccent);
      podEast.position.set(4.4, y, -2.8);
      podEast.castShadow = true;
      podEast.receiveShadow = true;
      this.modularGroup.add(podEast);

      // Steel lifting chassis frame atop pods
      const frameGeo = new THREE.BoxGeometry(3.3, 0.08, 2.5);
      const frame = new THREE.Mesh(frameGeo, this.materials.steelCharcoal);
      frame.position.set(-4.4, y + 1.1, 2.8);
      this.modularGroup.add(frame);
    }
  }

  buildFacade() {
    // Architectural double-glazed curtain wall with aluminum mullions and dark spandrel bands
    const glazedFloors = 13;
    const panelWidth = 2.5;
    const panelHeight = this.floorHeight - 0.08;
    const visionHeight = panelHeight * 0.75;
    const spandrelHeight = panelHeight * 0.25;

    const visionGeo = new THREE.BoxGeometry(panelWidth - 0.06, visionHeight, 0.08);
    const spandrelGeo = new THREE.BoxGeometry(panelWidth - 0.06, spandrelHeight, 0.12);
    const mullionVGeo = new THREE.BoxGeometry(0.08, panelHeight, 0.14);

    const halfW = this.buildingWidth / 2;
    const halfD = this.buildingDepth / 2;

    for (let f = 0; f < glazedFloors; f++) {
      const floorY = f * this.floorHeight;
      const visionY = floorY + visionHeight / 2 + spandrelHeight;
      const spandrelY = floorY + spandrelHeight / 2;

      // South and North Facades
      for (let x = -halfW + panelWidth / 2; x < halfW; x += panelWidth) {
        // South Vision Glass
        const pSouth = new THREE.Mesh(visionGeo, this.materials.glass);
        pSouth.position.set(x, visionY, halfD + 0.06);
        pSouth.castShadow = true;
        this.facadeGroup.add(pSouth);

        // South Spandrel Glass (covers floor slab edge)
        const sSouth = new THREE.Mesh(spandrelGeo, this.materials.glassSpandrel);
        sSouth.position.set(x, spandrelY, halfD + 0.06);
        this.facadeGroup.add(sSouth);

        // Vertical Mullion
        const mulSouth = new THREE.Mesh(mullionVGeo, this.materials.mullion);
        mulSouth.position.set(x + panelWidth / 2, floorY + panelHeight / 2, halfD + 0.08);
        this.facadeGroup.add(mulSouth);

        // North Vision Glass
        const pNorth = new THREE.Mesh(visionGeo, this.materials.glass);
        pNorth.position.set(x, visionY, -halfD - 0.06);
        pNorth.castShadow = true;
        this.facadeGroup.add(pNorth);

        const sNorth = new THREE.Mesh(spandrelGeo, this.materials.glassSpandrel);
        sNorth.position.set(x, spandrelY, -halfD - 0.06);
        this.facadeGroup.add(sNorth);
      }

      // East and West Facades
      for (let z = -halfD + panelWidth / 2; z < halfD; z += panelWidth) {
        const pWest = new THREE.Mesh(visionGeo, this.materials.glass);
        pWest.rotation.y = Math.PI / 2;
        pWest.position.set(-halfW - 0.06, visionY, z);
        this.facadeGroup.add(pWest);

        const sWest = new THREE.Mesh(spandrelGeo, this.materials.glassSpandrel);
        sWest.rotation.y = Math.PI / 2;
        sWest.position.set(-halfW - 0.06, spandrelY, z);
        this.facadeGroup.add(sWest);

        const pEast = new THREE.Mesh(visionGeo, this.materials.glass);
        pEast.rotation.y = Math.PI / 2;
        pEast.position.set(halfW + 0.06, visionY, z);
        this.facadeGroup.add(pEast);

        const sEast = new THREE.Mesh(spandrelGeo, this.materials.glassSpandrel);
        sEast.rotation.y = Math.PI / 2;
        sEast.position.set(halfW + 0.06, spandrelY, z);
        this.facadeGroup.add(sEast);
      }
    }
  }

  buildRooftop() {
    const topY = this.numFloors * this.floorHeight;

    // Architectural crown framework
    const crownGeo = new THREE.BoxGeometry(this.buildingWidth + 0.4, 1.8, this.buildingDepth + 0.4);
    const crown = new THREE.Mesh(crownGeo, this.materials.steelCharcoal);
    crown.position.y = topY + 0.9;
    this.rooftopGroup.add(crown);

    // Solar PV array
    const solarGeo = new THREE.BoxGeometry(2.4, 0.06, 1.5);
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        const solar = new THREE.Mesh(solarGeo, this.materials.solarCell);
        solar.position.set(-4.2 + c * 2.8, topY + 2.2, -4.2 + r * 2.8);
        solar.rotation.x = 0.22; // Sun orientation tilt
        solar.castShadow = true;
        this.rooftopGroup.add(solar);
      }
    }

    // Concrete Helipad Deck
    const padGeo = new THREE.CylinderGeometry(3.8, 3.8, 0.2, 32);
    const pad = new THREE.Mesh(padGeo, this.materials.concrete);
    pad.position.set(0, topY + 1.8, 0);
    pad.receiveShadow = true;
    this.rooftopGroup.add(pad);

    // Yellow Helipad 'H' Marking
    const hMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
    const hLeg1 = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.02, 0.4), hMat);
    hLeg1.rotation.y = Math.PI / 2;
    hLeg1.position.set(-0.75, topY + 1.92, 0);
    this.rooftopGroup.add(hLeg1);

    const hLeg2 = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.02, 0.4), hMat);
    hLeg2.rotation.y = Math.PI / 2;
    hLeg2.position.set(0.75, topY + 1.92, 0);
    this.rooftopGroup.add(hLeg2);

    const hBar = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.02, 0.4), hMat);
    hBar.position.set(0, topY + 1.92, 0);
    this.rooftopGroup.add(hBar);
  }

  buildActiveConstructionDetails() {
    const topFloorY = (this.numFloors - 1) * this.floorHeight;

    // 1. Exposed Rebar Starter Dowels protruding from top floor columns
    const halfW = this.buildingWidth / 2 - 0.4;
    const halfD = this.buildingDepth / 2 - 0.4;
    const colCoords = [
      [-halfW, -halfD], [0, -halfD], [halfW, -halfD],
      [-halfW, 0],                   [halfW, 0],
      [-halfW, halfD],  [0, halfD],  [halfW, halfD]
    ];

    const rebarGeo = new THREE.CylinderGeometry(0.018, 0.018, 1.4, 6);
    colCoords.forEach(([cx, cz]) => {
      for (let r = 0; r < 6; r++) {
        const ang = (r / 6) * Math.PI * 2;
        const rx = cx + Math.cos(ang) * 0.16;
        const rz = cz + Math.sin(ang) * 0.16;
        const rebar = new THREE.Mesh(rebarGeo, this.materials.rebar);
        rebar.position.set(rx, topFloorY + this.floorHeight + 0.7, rz);
        this.safetyGroup.add(rebar);
      }
    });

    // 2. Yellow Edge Protection Safety Screens around mid active levels (floors 13 - 18)
    const screenGeo = new THREE.BoxGeometry(this.buildingWidth, 1.1, 0.05);
    for (let f = 13; f < 19; f++) {
      const y = f * this.floorHeight + 0.65;

      const screenS = new THREE.Mesh(screenGeo, this.materials.safetyScreen);
      screenS.position.set(0, y, halfD + 0.1);
      this.safetyGroup.add(screenS);

      const screenN = new THREE.Mesh(screenGeo, this.materials.safetyScreen);
      screenN.position.set(0, y, -halfD - 0.1);
      this.safetyGroup.add(screenN);
    }
  }

  setPhase(phaseIndex) {
    this.currentPhase = phaseIndex;
    this.foundationGroup.visible = true;

    if (phaseIndex === 0) {
      this.coreGroup.visible = false;
      this.steelGroup.visible = false;
      this.mepGroup.visible = false;
      this.modularGroup.visible = false;
      this.facadeGroup.visible = false;
      this.rooftopGroup.visible = false;
      this.safetyGroup.visible = false;
    } else if (phaseIndex === 1) {
      this.coreGroup.visible = true;
      this.steelGroup.visible = true;
      this.mepGroup.visible = false;
      this.modularGroup.visible = false;
      this.facadeGroup.visible = false;
      this.rooftopGroup.visible = false;
      this.safetyGroup.visible = true;
      this.floorGroups.forEach((fg, idx) => { fg.visible = idx < 8; });
    } else if (phaseIndex === 2) {
      this.coreGroup.visible = true;
      this.steelGroup.visible = true;
      this.mepGroup.visible = false;
      this.modularGroup.visible = false;
      this.facadeGroup.visible = false;
      this.rooftopGroup.visible = false;
      this.safetyGroup.visible = true;
      this.floorGroups.forEach(fg => { fg.visible = true; });
    } else if (phaseIndex === 3) {
      this.coreGroup.visible = true;
      this.steelGroup.visible = true;
      this.mepGroup.visible = true;
      this.modularGroup.visible = true;
      this.facadeGroup.visible = false;
      this.rooftopGroup.visible = false;
      this.safetyGroup.visible = true;
      this.floorGroups.forEach(fg => { fg.visible = true; });
    } else if (phaseIndex >= 4) {
      this.coreGroup.visible = true;
      this.steelGroup.visible = true;
      this.mepGroup.visible = true;
      this.modularGroup.visible = true;
      this.facadeGroup.visible = true;
      this.rooftopGroup.visible = true;
      this.safetyGroup.visible = true;
      this.floorGroups.forEach(fg => { fg.visible = true; });
    }
  }

  setExploded(exploded) {
    this.isExploded = exploded;
    const separationFactor = exploded ? 1.8 : 0.0;

    this.floorGroups.forEach((fg, idx) => {
      const origY = fg.userData.originalY;
      fg.position.y = origY + idx * separationFactor;
    });

    if (this.rooftopGroup) {
      const origTopY = this.numFloors * this.floorHeight;
      this.rooftopGroup.position.y = exploded ? origTopY + this.numFloors * separationFactor : 0;
    }
  }

  setBlueprintMode(isBlueprint) {
    const traverse = (group) => {
      group.traverse(child => {
        if (child.isMesh) {
          if (isBlueprint) {
            if (!child.userData.origMat) child.userData.origMat = child.material;
            child.material = this.materials.wireframeBlueprint;
          } else if (child.userData.origMat) {
            child.material = child.userData.origMat;
          }
        }
      });
    };
    traverse(this.group);
  }
}
