import { ConstructionScene } from './scene/ConstructionScene.js';
import { RoiCalculator } from './components/RoiCalculator.js';
import { ProposalModal } from './components/ProposalModal.js';

document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('webgl-canvas-container');
  if (!container) return;

  // Initialize 3D WebGL Scene
  const scene = new ConstructionScene(container, (progress, chapterIndex) => {
    // Optional chapter hooks
  });

  // Initialize Business ROI Calculator
  const calculator = new RoiCalculator();

  // Initialize Proposal Tender Modal
  const modal = new ProposalModal();

  // ==========================================================================
  // SCROLL-DRIVEN ENTRANCE ANIMATIONS (IntersectionObserver)
  // ==========================================================================
  const revealElements = document.querySelectorAll('.reveal-on-scroll');
  const observerOptions = {
    root: null,
    rootMargin: '0px 0px -60px 0px',
    threshold: 0.12
  };

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-revealed');
        
        // Trigger counter animation if inside
        const counters = entry.target.querySelectorAll('.counter-value');
        counters.forEach(counter => animateCounter(counter));

        // Unobserve once revealed
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  revealElements.forEach(el => revealObserver.observe(el));

  // Counter Number Count-Up Function
  function animateCounter(el) {
    if (el.dataset.animated) return;
    el.dataset.animated = 'true';

    const target = parseFloat(el.dataset.target) || 0;
    const isDecimal = el.dataset.decimal === '1';
    const duration = 1800;
    const startTime = performance.now();

    const updateCount = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const ease = 1 - Math.pow(1 - progress, 3);
      const current = target * ease;

      if (isDecimal) {
        el.textContent = current.toFixed(1);
      } else {
        el.textContent = Math.floor(current).toLocaleString();
      }

      if (progress < 1) {
        requestAnimationFrame(updateCount);
      } else {
        if (isDecimal) {
          el.textContent = target.toFixed(1);
        } else {
          el.textContent = target.toLocaleString();
        }
      }
    };

    requestAnimationFrame(updateCount);
  }

  // ==========================================================================
  // CUSTOM CURSOR FOLLOWER
  // ==========================================================================
  const cursor = document.getElementById('custom-cursor');
  const follower = document.getElementById('custom-cursor-follower');

  if (cursor && follower && window.matchMedia('(pointer: fine)').matches) {
    window.addEventListener('mousemove', (e) => {
      cursor.style.left = `${e.clientX}px`;
      cursor.style.top = `${e.clientY}px`;
      follower.style.left = `${e.clientX}px`;
      follower.style.top = `${e.clientY}px`;
    });

    document.querySelectorAll('a, button, .service-one_title, .acc-btn, .pill-option-btn').forEach(btn => {
      btn.addEventListener('mouseenter', () => {
        follower.style.width = '54px';
        follower.style.height = '54px';
        follower.style.borderColor = '#fbb900';
        follower.style.backgroundColor = 'rgba(251, 185, 0, 0.15)';
      });
      btn.addEventListener('mouseleave', () => {
        follower.style.width = '32px';
        follower.style.height = '32px';
        follower.style.borderColor = '#fbb900';
        follower.style.backgroundColor = 'transparent';
      });
    });
  }

  // ==========================================================================
  // SIDEBAR DRAWER TOGGLE
  // ==========================================================================
  const sidebar = document.getElementById('about-sidebar');
  const openSidebarBtn = document.getElementById('btn-toggle-sidebar');
  const closeSidebarBtn = document.getElementById('btn-close-sidebar');

  if (openSidebarBtn && sidebar) {
    openSidebarBtn.addEventListener('click', () => {
      sidebar.classList.add('open');
    });
  }

  if (closeSidebarBtn && sidebar) {
    closeSidebarBtn.addEventListener('click', () => {
      sidebar.classList.remove('open');
    });
  }

  // ==========================================================================
  // SEARCH POPUP MODAL
  // ==========================================================================
  const searchPopup = document.getElementById('search-popup');
  const openSearchBtn = document.getElementById('btn-open-search');
  const closeSearchBtn = document.getElementById('btn-close-search');

  if (openSearchBtn && searchPopup) {
    openSearchBtn.addEventListener('click', () => {
      searchPopup.classList.add('open');
    });
  }

  if (closeSearchBtn && searchPopup) {
    closeSearchBtn.addEventListener('click', () => {
      searchPopup.classList.remove('open');
    });
  }

  // ==========================================================================
  // INTERACTIVE SERVICES SWITCHER
  // ==========================================================================
  const serviceTitles = document.querySelectorAll('.service-one_title');
  const serviceImg = document.getElementById('service-preview-img');
  const serviceHeading = document.getElementById('service-preview-title');
  const serviceDesc = document.getElementById('service-preview-text');

    const servicesData = [
    {
      title: 'Building Construction',
      img: 'assets/images/service-1.jpg',
      text: 'Our solutions are designed to meet the needs of modern enterprises, ensuring they thrive in today’s competitive online landscape.'
    },
    {
      title: 'Residential Construction',
      img: 'assets/images/service-2.jpg',
      text: 'Specialized residential multi-family and master-planned urban communities engineered for comfort and sustainability.'
    },
    {
      title: 'commercial Construction',
      img: 'assets/images/service-3.jpg',
      text: 'High-density commercial skyscraper headquarters and mixed-use commercial districts delivered under fixed-fee EPC.'
    },
    {
      title: 'Architecture Design',
      img: 'assets/images/service-4.jpg',
      text: 'Computational architecture, parametric facade engineering, and 4D BIM digital twin structural integration.'
    },
    {
      title: 'Renovation Planning',
      img: 'assets/images/service-5.jpg',
      text: 'Structural strengthening, adaptive reuse, seismic dampening retrofitting, and core mechanical upgrades.'
    },
    {
      title: 'Structural Engineering',
      img: 'assets/images/service-6.jpg',
      text: 'Flanged wide-flange steel columns, continuous-flight auger piling, and laser-toleranced robotic precast.'
    }
  ];

  serviceTitles.forEach((item, idx) => {
    item.addEventListener('click', () => {
      serviceTitles.forEach(t => t.classList.remove('active'));
      item.classList.add('active');

      const data = servicesData[idx] || servicesData[0];
      if (serviceHeading) serviceHeading.textContent = data.title;
      if (serviceDesc) serviceDesc.textContent = data.text;
      if (serviceImg) {
        serviceImg.style.opacity = '0';
        setTimeout(() => {
          serviceImg.src = data.img;
          serviceImg.style.opacity = '1';
        }, 150);
      }
    });
  });

  // ==========================================================================
  // FAQ ACCORDION EXPAND/COLLAPSE
  // ==========================================================================
  const accordions = document.querySelectorAll('.accordion.block');
  accordions.forEach(block => {
    const btn = block.querySelector('.acc-btn');
    if (btn) {
      btn.addEventListener('click', () => {
        const isActive = block.classList.contains('active-block');
        accordions.forEach(b => {
          b.classList.remove('active-block');
          const content = b.querySelector('.acc-content');
          if (content) content.classList.remove('current');
        });

        if (!isActive) {
          block.classList.add('active-block');
          const content = block.querySelector('.acc-content');
          if (content) content.classList.add('current');
        }
      });
    }
  });

  // ==========================================================================
  // 3D HUD CONTROLS: FREE ORBIT, LIGHTING & EXPLODED VIEW
  // ==========================================================================
  const orbitBtn = document.getElementById('btn-toggle-orbit');
  const orbitBtnText = document.getElementById('orbit-btn-text');
  let isOrbitActive = false;

  if (orbitBtn) {
    orbitBtn.addEventListener('click', () => {
      isOrbitActive = !isOrbitActive;
      scene.setFreeOrbit(isOrbitActive);
      document.body.classList.toggle('free-orbit-active', isOrbitActive);
      orbitBtn.classList.toggle('active', isOrbitActive);

      if (orbitBtnText) {
        orbitBtnText.textContent = isOrbitActive ? 'Orbit Active (Unlocked)' : 'Free 360° Orbit';
      }
    });
  }

  // Lighting Mode Toggles
  const modeButtons = document.querySelectorAll('[data-lighting-mode]');
  modeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      modeButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const mode = btn.dataset.lightingMode;
      scene.setLightingMode(mode);
    });
  });

  // Exploded View Toggle
  const explodedBtn = document.getElementById('btn-exploded-view');
  let isExploded = false;
  if (explodedBtn) {
    explodedBtn.addEventListener('click', () => {
      isExploded = !isExploded;
      explodedBtn.classList.toggle('active', isExploded);
      scene.setExploded(isExploded);
    });
  }

  // 4D BIM Phase Scrubber in Hero
  const phaseStepCards = document.querySelectorAll('.phase-step-card');
  const currentPhasePill = document.getElementById('current-phase-pill');
  const phaseNames = [
    'Phase 1: Foundation Piling',
    'Phase 2: Core & Lower Steel',
    'Phase 3: Full Diagrid Frame',
    'Phase 4: Modular Pods & MEP',
    'Phase 5: Facade & Commissioning'
  ];

  phaseStepCards.forEach(card => {
    card.addEventListener('click', () => {
      const phaseIdx = parseInt(card.dataset.phase, 10);
      phaseStepCards.forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      scene.setPhase(phaseIdx);

      if (currentPhasePill) {
        currentPhasePill.textContent = phaseNames[phaseIdx] || `Phase ${phaseIdx + 1}`;
      }
    });
  });

  // Contact Form Submission Feedback
  const contactForm = document.getElementById('main-contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      alert('Thank you! Your message has been sent to our pre-construction advisory team.');
      contactForm.reset();
    });
  }

  // Newsletter Form Submission Feedback
  const newsletterForm = document.getElementById('newsletter-form');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      alert('Thank you for subscribing to Constrc updates!');
      newsletterForm.reset();
    });
  }
});
