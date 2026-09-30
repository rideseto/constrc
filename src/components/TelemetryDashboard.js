export class TelemetryDashboard {
  constructor() {
    this.craneLoadEl = document.getElementById('telemetry-crane-load');
    this.craneWindEl = document.getElementById('telemetry-crane-wind');
    this.concreteStrengthEl = document.getElementById('telemetry-concrete-psi');
    this.concreteTempEl = document.getElementById('telemetry-concrete-temp');
    this.complianceEl = document.getElementById('telemetry-safety-score');

    this.startSimulation();
  }

  startSimulation() {
    // Subtle realistic variations every 3 seconds
    setInterval(() => {
      if (this.craneLoadEl) {
        const load = (8.4 + Math.sin(Date.now() * 0.001) * 2.2).toFixed(1);
        this.craneLoadEl.textContent = `${load} Tons`;
      }
      if (this.craneWindEl) {
        const wind = (14 + Math.cos(Date.now() * 0.0008) * 3).toFixed(0);
        this.craneWindEl.textContent = `${wind} km/h (Safe)`;
      }
      if (this.concreteStrengthEl) {
        const basePsi = 4250;
        const jitter = Math.floor(Math.random() * 20);
        this.concreteStrengthEl.textContent = `${(basePsi + jitter).toLocaleString()} PSI`;
      }
      if (this.concreteTempEl) {
        const temp = (31.8 + Math.random() * 0.4).toFixed(1);
        this.concreteTempEl.textContent = `${temp} °C`;
      }
    }, 2500);
  }
}
