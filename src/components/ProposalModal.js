export class ProposalModal {
  constructor() {
    this.modalBackdrop = document.getElementById('proposal-modal');
    this.openButtons = document.querySelectorAll('.btn-open-proposal');
    this.closeBtn = document.getElementById('btn-close-modal');
    this.form = document.getElementById('proposal-form');
    this.successAlert = document.getElementById('proposal-success');

    this.initEvents();
  }

  initEvents() {
    this.openButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        this.open();
      });
    });

    if (this.closeBtn) {
      this.closeBtn.addEventListener('click', () => this.close());
    }

    if (this.modalBackdrop) {
      this.modalBackdrop.addEventListener('click', (e) => {
        if (e.target === this.modalBackdrop) {
          this.close();
        }
      });
    }

    if (this.form) {
      this.form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleSubmit();
      });
    }
  }

  open() {
    if (this.modalBackdrop) {
      this.modalBackdrop.classList.add('open');
      if (this.successAlert) this.successAlert.style.display = 'none';
      if (this.form) this.form.style.display = 'block';
    }
  }

  close() {
    if (this.modalBackdrop) {
      this.modalBackdrop.classList.remove('open');
    }
  }

  handleSubmit() {
    if (this.form && this.successAlert) {
      this.form.style.display = 'none';
      this.successAlert.style.display = 'block';

      setTimeout(() => {
        this.close();
      }, 3500);
    }
  }
}
