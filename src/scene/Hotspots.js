import * as THREE from 'three';

export class Hotspots {
  constructor(scene, camera, containerElement) {
    this.scene = scene;
    this.camera = camera;
    this.container = containerElement;

    this.points = [
      {
        id: 'foundation',
        pos: new THREE.Vector3(0, 0.2, 8.5),
        title: 'Geotechnical & Substructure',
        badge: 'Turnkey EPC Pillar',
        desc: 'Deep drilled continuous-flight auger piles with embedded fibre-optic strain sensors. Guarantees zero foundation settlement and reduces excavation risks by 35%.',
        statLabel: 'Risk Mitigation',
        statVal: '100% Fixed-Price'
      },
      {
        id: 'structure',
        pos: new THREE.Vector3(7.2, 14, 7.2),
        title: 'Diagrid Steel & Shear Core',
        badge: 'Structural Engineering',
        desc: 'Optimized high-strength structural steel diagrid frame paired with slipform concrete core. Provides 20% higher seismic resilience with 15% less structural steel tonnage.',
        statLabel: 'Material Savings',
        statVal: '1,200 Tons CO2e'
      },
      {
        id: 'crane',
        pos: new THREE.Vector3(10, 58, 10),
        title: 'ConTech Autonomous Crane Ops',
        badge: 'Construction Tech SaaS',
        desc: 'Automated anti-collision algorithms, real-time load telemetry, and AI hook path planning. Eliminates crane bottlenecks and maintains a flawless 0.00 Lost Time Injury rate.',
        statLabel: 'Safety Metric',
        statVal: '0.00 LTIFR'
      },
      {
        id: 'modular',
        pos: new THREE.Vector3(-4.2, 16, 2.5),
        title: 'Industrialized Modular Pods',
        badge: 'Prefab Manufacturing',
        desc: 'Pre-assembled bathroom pods, MEP cassettes, and wall assemblies fabricated in automated off-site factories and craned directly into position.',
        statLabel: 'Schedule Compression',
        statVal: '-40% Total Time'
      },
      {
        id: 'facade',
        pos: new THREE.Vector3(-7.2, 22, 0),
        title: 'High-Performance Curtain Wall',
        badge: 'Sustainable Envelopes',
        desc: 'Triple-glazed dynamic electrochromic glass with automated tinting. Exceeds LEED Platinum envelope thermal resistance standards.',
        statLabel: 'Energy Efficiency',
        statVal: '32% HVAC Reduction'
      },
      {
        id: 'rooftop',
        pos: new THREE.Vector3(0, 50, 0),
        title: 'Digital Twin & Smart Energy',
        badge: 'BOOT & PropTech SaaS',
        desc: 'Integrated rooftop solar PV arrays tied directly into a 3D IoT Digital Twin. Generates ongoing high-margin facilities management and software subscription revenue.',
        statLabel: 'Recurring Revenue',
        statVal: '$1.4M / yr SaaS'
      }
    ];

    this.markerElements = [];
    this.activePopover = null;

    this.createMarkers();
  }

  createMarkers() {
    this.points.forEach((pt, idx) => {
      // Hotspot DOM marker button
      const marker = document.createElement('button');
      marker.className = 'hotspot-marker';
      marker.innerHTML = `
        <span>${idx + 1}</span>
        <div class="hotspot-pulse-ring"></div>
      `;
      marker.setAttribute('aria-label', pt.title);

      // Popover element
      const popover = document.createElement('div');
      popover.className = 'hotspot-popover';
      popover.innerHTML = `
        <div class="popover-badge">${pt.badge}</div>
        <h4>${pt.title}</h4>
        <p>${pt.desc}</p>
        <div class="popover-stat">
          <span>${pt.statLabel}</span>
          <span>${pt.statVal}</span>
        </div>
      `;

      marker.addEventListener('click', (e) => {
        e.stopPropagation();
        this.togglePopover(popover, marker);
      });

      this.container.appendChild(marker);
      this.container.appendChild(popover);

      this.markerElements.push({
        data: pt,
        markerEl: marker,
        popoverEl: popover
      });
    });

    // Close popover when clicking anywhere else
    window.addEventListener('click', () => {
      this.closeActivePopover();
    });
  }

  togglePopover(popover, marker) {
    if (this.activePopover === popover) {
      this.closeActivePopover();
      return;
    }
    this.closeActivePopover();
    popover.classList.add('visible');
    this.activePopover = popover;
  }

  closeActivePopover() {
    if (this.activePopover) {
      this.activePopover.classList.remove('visible');
      this.activePopover = null;
    }
  }

  update() {
    const widthHalf = this.container.clientWidth / 2;
    const heightHalf = this.container.clientHeight / 2;
    const tempVec = new THREE.Vector3();

    this.markerElements.forEach(item => {
      tempVec.copy(item.data.pos);
      tempVec.project(this.camera);

      // Check if point is in front of camera
      if (tempVec.z > 1) {
        item.markerEl.style.display = 'none';
        item.popoverEl.style.display = 'none';
        return;
      }

      item.markerEl.style.display = 'flex';

      const screenX = (tempVec.x * widthHalf) + widthHalf;
      const screenY = -(tempVec.y * heightHalf) + heightHalf;

      item.markerEl.style.left = `${screenX}px`;
      item.markerEl.style.top = `${screenY}px`;

      // Position popover offset from marker
      if (item.popoverEl.classList.contains('visible')) {
        item.popoverEl.style.display = 'block';
        item.popoverEl.style.left = `${Math.min(screenX + 20, this.container.clientWidth - 300)}px`;
        item.popoverEl.style.top = `${Math.max(screenY - 80, 20)}px`;
      }
    });
  }
}
