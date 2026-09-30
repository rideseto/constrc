import * as THREE from 'three';

export class TextureGenerator {
  /**
   * Generates authentic architectural board-formed concrete textures
   * Returns { map, roughnessMap, bumpMap }
   */
  static createConcreteTextures(width = 1024, height = 1024) {
    // 1. Diffuse / Color Map
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    // Base tone - architectural warm grey
    ctx.fillStyle = '#9aa1ab';
    ctx.fillRect(0, 0, width, height);

    // Subtle perlin-like noise & aggregate grain
    const imgData = ctx.getImageData(0, 0, width, height);
    const data = imgData.data;
    for (let i = 0; i < data.length; i += 4) {
      const noise = (Math.random() - 0.5) * 28;
      const grain = (Math.random() - 0.5) * 14;
      data[i] = Math.min(255, Math.max(0, data[i] + noise + grain));
      data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise + grain));
      data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise + grain));
    }
    ctx.putImageData(imgData, 0, 0);

    // Formwork horizontal board seams
    const numBoards = 8;
    const boardHeight = height / numBoards;
    ctx.lineWidth = 2;
    for (let b = 1; b < numBoards; b++) {
      const y = b * boardHeight;
      // Dark seam shadow
      ctx.strokeStyle = 'rgba(40, 45, 55, 0.45)';
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();

      // Light formwork edge highlight
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.beginPath();
      ctx.moveTo(0, y + 2);
      ctx.lineTo(width, y + 2);
      ctx.stroke();
    }

    // Tie-rod holes (form tie indents with central hole & patch ring)
    const tieCols = 6;
    const tieSpacingX = width / tieCols;
    for (let b = 0; b < numBoards; b++) {
      const cy = b * boardHeight + boardHeight / 2;
      for (let c = 0; c < tieCols; c++) {
        const cx = c * tieSpacingX + tieSpacingX / 2;

        // Outer indent shadow
        ctx.fillStyle = 'rgba(50, 55, 65, 0.35)';
        ctx.beginPath();
        ctx.arc(cx, cy, 7, 0, Math.PI * 2);
        ctx.fill();

        // Inner plug hole
        ctx.fillStyle = 'rgba(20, 24, 30, 0.75)';
        ctx.beginPath();
        ctx.arc(cx, cy, 3.5, 0, Math.PI * 2);
        ctx.fill();

        // Subtle highlight rim
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(cx, cy, 7.5, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    const diffuseMap = new THREE.CanvasTexture(canvas);
    diffuseMap.wrapS = THREE.RepeatWrapping;
    diffuseMap.wrapT = THREE.RepeatWrapping;

    // 2. Roughness Map
    const roughCanvas = document.createElement('canvas');
    roughCanvas.width = 512;
    roughCanvas.height = 512;
    const rCtx = roughCanvas.getContext('2d');
    rCtx.fillStyle = '#b0b0b0'; // Medium-high roughness (~0.7)
    rCtx.fillRect(0, 0, 512, 512);

    const rData = rCtx.getImageData(0, 0, 512, 512);
    for (let i = 0; i < rData.data.length; i += 4) {
      const v = (Math.random() - 0.5) * 50;
      rData.data[i] = Math.min(255, Math.max(0, 180 + v));
      rData.data[i + 1] = rData.data[i];
      rData.data[i + 2] = rData.data[i];
    }
    rCtx.putImageData(rData, 0, 0);

    const roughnessMap = new THREE.CanvasTexture(roughCanvas);
    roughnessMap.wrapS = THREE.RepeatWrapping;
    roughnessMap.wrapT = THREE.RepeatWrapping;

    // 3. Bump / Micro-texture Map
    const bumpCanvas = document.createElement('canvas');
    bumpCanvas.width = 512;
    bumpCanvas.height = 512;
    const bCtx = bumpCanvas.getContext('2d');
    bCtx.fillStyle = '#808080';
    bCtx.fillRect(0, 0, 512, 512);

    const bData = bCtx.getImageData(0, 0, 512, 512);
    for (let i = 0; i < bData.data.length; i += 4) {
      const noise = (Math.random() - 0.5) * 35;
      bData.data[i] = 128 + noise;
      bData.data[i + 1] = 128 + noise;
      bData.data[i + 2] = 128 + noise;
    }
    bCtx.putImageData(bData, 0, 0);

    const bumpMap = new THREE.CanvasTexture(bumpCanvas);
    bumpMap.wrapS = THREE.RepeatWrapping;
    bumpMap.wrapT = THREE.RepeatWrapping;

    return { map: diffuseMap, roughnessMap, bumpMap };
  }

  /**
   * Generates industrial coated & mill-finished steel textures
   */
  static createSteelTextures() {
    // 1. Safety Orange Structural Coating
    const orangeCanvas = document.createElement('canvas');
    orangeCanvas.width = 512;
    orangeCanvas.height = 512;
    const oCtx = orangeCanvas.getContext('2d');
    oCtx.fillStyle = '#d64817'; // Authentic industrial primer orange
    oCtx.fillRect(0, 0, 512, 512);

    const oData = oCtx.getImageData(0, 0, 512, 512);
    for (let i = 0; i < oData.data.length; i += 4) {
      const grain = (Math.random() - 0.5) * 16;
      oData.data[i] = Math.min(255, Math.max(0, oData.data[i] + grain));
      oData.data[i + 1] = Math.min(255, Math.max(0, oData.data[i + 1] + grain * 0.7));
      oData.data[i + 2] = Math.min(255, Math.max(0, oData.data[i + 2] + grain * 0.5));
    }
    oCtx.putImageData(oData, 0, 0);

    const orangeSteelMap = new THREE.CanvasTexture(orangeCanvas);
    orangeSteelMap.wrapS = THREE.RepeatWrapping;
    orangeSteelMap.wrapT = THREE.RepeatWrapping;

    // 2. Weathered Dark Structural Carbon Steel
    const carbonCanvas = document.createElement('canvas');
    carbonCanvas.width = 512;
    carbonCanvas.height = 512;
    const cCtx = carbonCanvas.getContext('2d');
    cCtx.fillStyle = '#2d333e';
    cCtx.fillRect(0, 0, 512, 512);

    const cData = cCtx.getImageData(0, 0, 512, 512);
    for (let i = 0; i < cData.data.length; i += 4) {
      const grain = (Math.random() - 0.5) * 20;
      cData.data[i] = Math.min(255, Math.max(0, cData.data[i] + grain));
      cData.data[i + 1] = Math.min(255, Math.max(0, cData.data[i + 1] + grain));
      cData.data[i + 2] = Math.min(255, Math.max(0, cData.data[i + 2] + grain + 2));
    }
    cCtx.putImageData(cData, 0, 0);

    const carbonSteelMap = new THREE.CanvasTexture(carbonCanvas);
    carbonSteelMap.wrapS = THREE.RepeatWrapping;
    carbonSteelMap.wrapT = THREE.RepeatWrapping;

    return { orangeSteelMap, carbonSteelMap };
  }

  /**
   * Generates realistic construction job-site ground texture (crushed stone, asphalt & safety road markings)
   */
  static createGroundTexture(width = 1024, height = 1024) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    // Base compacted aggregate base
    ctx.fillStyle = '#1c222c';
    ctx.fillRect(0, 0, width, height);

    // Fine mineral aggregate / asphalt grain
    const imgData = ctx.getImageData(0, 0, width, height);
    const data = imgData.data;
    for (let i = 0; i < data.length; i += 4) {
      const n = (Math.random() - 0.5) * 36;
      data[i] = Math.min(255, Math.max(0, data[i] + n));
      data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + n));
      data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + n));
    }
    ctx.putImageData(imgData, 0, 0);

    // Concrete slab joint grid
    const gridSize = 128;
    ctx.strokeStyle = 'rgba(10, 14, 20, 0.6)';
    ctx.lineWidth = 3;
    for (let x = 0; x < width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Safety yellow diagonal zebra hazard zones
    ctx.save();
    ctx.strokeStyle = 'rgba(235, 160, 20, 0.4)';
    ctx.lineWidth = 14;
    for (let i = -width; i < width * 2; i += 40) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i + height, height);
      ctx.stroke();
    }
    ctx.restore();

    const groundTexture = new THREE.CanvasTexture(canvas);
    groundTexture.wrapS = THREE.RepeatWrapping;
    groundTexture.wrapT = THREE.RepeatWrapping;
    groundTexture.repeat.set(6, 6);

    return groundTexture;
  }

  /**
   * Generates a 360-degree Equirectangular Atmospheric Sky Environment Map
   * Provides physically based image reflections (IBL) for all PBR materials
   */
  static createSkyEnvironment(mode = 'day') {
    const width = 2048;
    const height = 1024;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    const grad = ctx.createLinearGradient(0, 0, 0, height);

    if (mode === 'day') {
      // Atmospheric Rayleigh sky gradient
      grad.addColorStop(0.0, '#104e8b'); // Deep zenith blue
      grad.addColorStop(0.3, '#3a75c4'); // Mid sky
      grad.addColorStop(0.48, '#9fc3e8'); // Horizon atmospheric haze
      grad.addColorStop(0.50, '#dbe7f2'); // Bright horizon glow
      grad.addColorStop(0.52, '#3a424e'); // Ground horizon transition
      grad.addColorStop(1.0, '#161b24'); // Ground nadir
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Realistic Sun disk & glare
      const sunX = width * 0.65;
      const sunY = height * 0.32;
      const sunGrad = ctx.createRadialGradient(sunX, sunY, 5, sunX, sunY, 320);
      sunGrad.addColorStop(0.0, 'rgba(255, 255, 245, 1.0)');
      sunGrad.addColorStop(0.08, 'rgba(255, 240, 200, 0.85)');
      sunGrad.addColorStop(0.3, 'rgba(255, 230, 180, 0.35)');
      sunGrad.addColorStop(1.0, 'rgba(255, 255, 255, 0.0)');
      ctx.fillStyle = sunGrad;
      ctx.fillRect(0, 0, width, height);

    } else if (mode === 'sunset') {
      grad.addColorStop(0.0, '#2c1e4a'); // Zenith dusk purple
      grad.addColorStop(0.3, '#783545'); // Mid dusk
      grad.addColorStop(0.48, '#e05322'); // Horizon amber fire
      grad.addColorStop(0.50, '#ff953f'); // Bright horizon sunset line
      grad.addColorStop(0.52, '#2b1b22'); // Ground silhouette
      grad.addColorStop(1.0, '#0c080d'); // Dark earth
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      const sunX = width * 0.72;
      const sunY = height * 0.47;
      const sunGrad = ctx.createRadialGradient(sunX, sunY, 4, sunX, sunY, 400);
      sunGrad.addColorStop(0.0, 'rgba(255, 220, 160, 1.0)');
      sunGrad.addColorStop(0.12, 'rgba(255, 110, 40, 0.9)');
      sunGrad.addColorStop(0.45, 'rgba(220, 60, 20, 0.3)');
      sunGrad.addColorStop(1.0, 'rgba(0, 0, 0, 0.0)');
      ctx.fillStyle = sunGrad;
      ctx.fillRect(0, 0, width, height);

    } else if (mode === 'night') {
      grad.addColorStop(0.0, '#030712'); // Pure midnight
      grad.addColorStop(0.48, '#0b1329'); // Deep twilight horizon
      grad.addColorStop(0.50, '#111827');
      grad.addColorStop(0.52, '#060a12');
      grad.addColorStop(1.0, '#020408');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Distant city glow on the horizon
      ctx.fillStyle = 'rgba(255, 180, 80, 0.12)';
      ctx.fillRect(0, height * 0.49, width, height * 0.03);

    } else if (mode === 'blueprint') {
      grad.addColorStop(0.0, '#040d1a');
      grad.addColorStop(0.5, '#081c38');
      grad.addColorStop(1.0, '#020710');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);
    }

    const envMap = new THREE.CanvasTexture(canvas);
    envMap.mapping = THREE.EquirectangularReflectionMapping;
    envMap.colorSpace = THREE.SRGBColorSpace;
    return envMap;
  }
}
