export class ConstructionPhases {
  constructor(scene) {
    this.scene = scene;
    this.currentPhase = 4;
    this.isPlaying = false;
    this.playInterval = null;

    this.phasesData = [
      {
        index: 0,
        name: 'Phase 1: Deep Piling & Substructure',
        timeframe: 'Months 0 – 5',
        desc: 'Continuous-flight auger piling, geotechnical ground stabilization, deep utility vaults, and reinforced concrete foundation mat.'
      },
      {
        index: 1,
        name: 'Phase 2: Concrete Core & Lower Steel',
        timeframe: 'Months 5 – 10',
        desc: 'Slipform concrete elevator shear core climb, primary structural steel ground columns, and basement MEP infrastructure.'
      },
      {
        index: 2,
        name: 'Phase 3: Structural Steel Diagrid',
        timeframe: 'Months 10 – 15',
        desc: 'Full-height perimeter steel diagrid framework, composite metal decking, and wind-bracing trusses.'
      },
      {
        index: 3,
        name: 'Phase 4: Modular Pods & MEP Cassettes',
        timeframe: 'Months 15 – 20',
        desc: 'Craning industrialized modular bathroom units, factory-assembled MEP ceiling cassettes, and internal core services.'
      },
      {
        index: 4,
        name: 'Phase 5: Smart Facade & Commissioning',
        timeframe: 'Months 20 – 24',
        desc: 'Triple-glazed dynamic curtain wall, rooftop solar PV array, helipad, and 3D Digital Twin BMS handover.'
      }
    ];

    this.initDOM();
  }

  initDOM() {
    this.phaseStepCards = document.querySelectorAll('.phase-step-card');
    this.currentPhasePill = document.getElementById('current-phase-pill');
    this.playBtn = document.getElementById('btn-play-timeline');
    this.prevBtn = document.getElementById('btn-prev-phase');
    this.nextBtn = document.getElementById('btn-next-phase');

    // Click step card
    this.phaseStepCards.forEach((card, idx) => {
      card.addEventListener('click', () => {
        this.pause();
        this.setPhase(idx);
      });
    });

    if (this.playBtn) {
      this.playBtn.addEventListener('click', () => {
        if (this.isPlaying) {
          this.pause();
        } else {
          this.play();
        }
      });
    }

    if (this.prevBtn) {
      this.prevBtn.addEventListener('click', () => {
        this.pause();
        const prev = (this.currentPhase - 1 + this.phasesData.length) % this.phasesData.length;
        this.setPhase(prev);
      });
    }

    if (this.nextBtn) {
      this.nextBtn.addEventListener('click', () => {
        this.pause();
        const next = (this.currentPhase + 1) % this.phasesData.length;
        this.setPhase(next);
      });
    }
  }

  setPhase(index) {
    this.currentPhase = index;
    const data = this.phasesData[index];

    // Update 3D scene
    this.scene.setPhase(index);

    // Update DOM indicators
    this.phaseStepCards.forEach((card, idx) => {
      if (idx === index) {
        card.classList.add('active');
      } else {
        card.classList.remove('active');
      }
    });

    if (this.currentPhasePill) {
      this.currentPhasePill.textContent = `${data.name} (${data.timeframe})`;
    }
  }

  play() {
    this.isPlaying = true;
    if (this.playBtn) {
      this.playBtn.innerHTML = `
        <svg viewBox="0 0 24 24"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>
      `;
    }

    this.playInterval = setInterval(() => {
      const next = (this.currentPhase + 1) % this.phasesData.length;
      this.setPhase(next);
    }, 2800);
  }

  pause() {
    this.isPlaying = false;
    if (this.playInterval) {
      clearInterval(this.playInterval);
      this.playInterval = null;
    }
    if (this.playBtn) {
      this.playBtn.innerHTML = `
        <svg viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
      `;
    }
  }
}
