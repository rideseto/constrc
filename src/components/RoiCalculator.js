export class RoiCalculator {
  constructor() {
    this.state = {
      buildingType: 'commercial', // commercial, mixed, logistics, residential
      floorArea: 650000,          // sq ft
      stories: 36,
      method: 'modular',          // modular, traditional
      sustainability: 'leed'      // leed, standard
    };

    this.baseCostPerSqFt = {
      commercial: 340,
      mixed: 310,
      logistics: 190,
      residential: 280
    };

    this.initDOM();
    this.calculate();
  }

  initDOM() {
    // Sliders
    this.areaSlider = document.getElementById('calc-area-slider');
    this.areaDisplay = document.getElementById('calc-area-display');

    this.storiesSlider = document.getElementById('calc-stories-slider');
    this.storiesDisplay = document.getElementById('calc-stories-display');

    // Type buttons
    this.typeButtons = document.querySelectorAll('[data-calc-type]');
    this.methodButtons = document.querySelectorAll('[data-calc-method]');
    this.sustButtons = document.querySelectorAll('[data-calc-sust]');

    // Output DOM
    this.statCapex = document.getElementById('stat-capex');
    this.statMonthsSaved = document.getElementById('stat-months-saved');
    this.statIrr = document.getElementById('stat-irr');
    this.statCarbon = document.getElementById('stat-carbon');
    this.statSavingsNote = document.getElementById('stat-savings-note');

    // Bind Area Slider
    if (this.areaSlider) {
      this.areaSlider.addEventListener('input', (e) => {
        this.state.floorArea = parseInt(e.target.value, 10);
        if (this.areaDisplay) {
          this.areaDisplay.textContent = `${(this.state.floorArea / 1000).toFixed(0)}k sq ft`;
        }
        this.calculate();
      });
    }

    // Bind Stories Slider
    if (this.storiesSlider) {
      this.storiesSlider.addEventListener('input', (e) => {
        this.state.stories = parseInt(e.target.value, 10);
        if (this.storiesDisplay) {
          this.storiesDisplay.textContent = `${this.state.stories} Floors`;
        }
        this.calculate();
      });
    }

    // Bind Building Type
    this.typeButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        this.typeButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.state.buildingType = btn.dataset.calcType;
        this.calculate();
      });
    });

    // Bind Delivery Method
    this.methodButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        this.methodButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.state.method = btn.dataset.calcMethod;
        this.calculate();
      });
    });

    // Bind Sustainability
    this.sustButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        this.sustButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.state.sustainability = btn.dataset.calcSust;
        this.calculate();
      });
    });
  }

  calculate() {
    const baseRate = this.baseCostPerSqFt[this.state.buildingType] || 320;
    const isModular = this.state.method === 'modular';
    const isLeed = this.state.sustainability === 'leed';

    // Baseline traditional cost
    const traditionalCapex = (this.state.floorArea * baseRate) / 1000000; // in $M

    // Modular off-site efficiency gives 12% direct CapEx savings and 40% time savings
    const methodMultiplier = isModular ? 0.88 : 1.0;
    const sustMultiplier = isLeed ? 1.06 : 1.0; // 6% green premium, offset by 30% lower OpEx

    const finalCapex = traditionalCapex * methodMultiplier * sustMultiplier;

    // Timeline calculation
    const baseMonths = Math.round(18 + (this.state.stories * 0.45));
    const finalMonths = isModular ? Math.round(baseMonths * 0.60) : baseMonths;
    const monthsSaved = baseMonths - finalMonths;

    // Financial IRR / ROI boost
    // Earlier occupancy yields rent income 8 to 16 months faster!
    const baseIrr = 13.5;
    const irrBoost = isModular ? (monthsSaved * 0.42) : 0;
    const finalIrr = (baseIrr + irrBoost).toFixed(1);

    // Embodied Carbon Abatement (tonnes CO2e avoided)
    const carbonBasePerSqFt = 0.045; // tonnes/sqft
    const carbonAvoided = isModular
      ? Math.round(this.state.floorArea * carbonBasePerSqFt * (isLeed ? 0.48 : 0.32))
      : (isLeed ? Math.round(this.state.floorArea * carbonBasePerSqFt * 0.18) : 0);

    // Direct cost difference
    const totalSavingsM = (traditionalCapex - finalCapex).toFixed(1);

    // Update DOM
    if (this.statCapex) {
      this.statCapex.textContent = `$${finalCapex.toFixed(1)}M`;
    }
    if (this.statMonthsSaved) {
      this.statMonthsSaved.textContent = isModular ? `-${monthsSaved} Mo` : 'Standard';
    }
    if (this.statIrr) {
      this.statIrr.textContent = `${finalIrr}%`;
    }
    if (this.statCarbon) {
      this.statCarbon.textContent = `${carbonAvoided.toLocaleString()} t`;
    }
    if (this.statSavingsNote) {
      if (isModular) {
        this.statSavingsNote.innerHTML = `
          <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" fill="none" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
          Saves est. $${totalSavingsM}M in overhead & financing interest
        `;
      } else {
        this.statSavingsNote.innerHTML = `Conventional cast-in-place benchmark`;
      }
    }
  }
}
