/* ============================================
   SIARGAO'S BOUNTY SEAFOODS — MAIN JS
   ============================================ */

// ---------- Mobile Menu Toggle ----------
document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.querySelector('.menu-toggle');
  const navLinks = document.querySelector('.nav-links');

  if (toggle && navLinks) {
    toggle.addEventListener('click', () => {
      navLinks.classList.toggle('open');
    });

    // Close menu when a link is clicked — BUT NOT the dropdown toggle on mobile
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        const isDropdownToggle = link.classList.contains('nav-dropdown-toggle');
        const isMobile = window.innerWidth <= 900;
        if (isDropdownToggle && isMobile) return; // let dropdown handle it
        navLinks.classList.remove('open');
      });
    });
  }

  // ---------- Auto Year in Footer ----------
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // ---------- Lightbox for Gallery Photos ----------
  const lightbox = document.createElement('div');
  lightbox.className = 'lightbox';
  lightbox.innerHTML = `
    <button class="close" aria-label="Close">&times;</button>
    <img src="" alt="" />
  `;
  document.body.appendChild(lightbox);

  const lbImg = lightbox.querySelector('img');
  const closeBtn = lightbox.querySelector('.close');

  document.querySelectorAll('.gallery-item img, .featured-gallery img').forEach(img => {
    img.addEventListener('click', (e) => {
      e.stopPropagation();
      lbImg.src = img.src;
      lbImg.alt = img.alt;
      lightbox.classList.add('open');
    });
  });

  const closeLb = () => lightbox.classList.remove('open');
  lightbox.addEventListener('click', closeLb);
  closeBtn.addEventListener('click', closeLb);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeLb();
  });

  // ---------- Contact Form (placeholder) ----------
  const form = document.querySelector('form[data-contact]');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      alert('Thank you! Your message has been sent. We will get back to you soon.');
      form.reset();
    });
  }

  // ---------- Simple Scroll Reveal ----------
  const revealEls = document.querySelectorAll('.reveal');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  revealEls.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.7s ease, transform 0.7s ease';
    observer.observe(el);
  });
});

// ============================================
// CARES PAGE — Photo Carousel
// ============================================
(function initCarousel() {
  const track = document.getElementById('carouselTrack');
  if (!track) return;

  const slides = track.querySelectorAll('.carousel-slide');
  const prevBtn = document.querySelector('.carousel-prev');
  const nextBtn = document.querySelector('.carousel-next');
  const dotsWrap = document.getElementById('carouselDots');

  let current = 0;
  const total = slides.length;

  // Build dots
  slides.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.setAttribute('aria-label', `Go to photo ${i + 1}`);
    dot.addEventListener('click', () => goTo(i));
    dotsWrap.appendChild(dot);
  });
  const dots = dotsWrap.querySelectorAll('button');

  function goTo(index) {
    current = (index + total) % total;
    track.style.transform = `translateX(-${current * 100}%)`;
    dots.forEach((d, i) => d.classList.toggle('active', i === current));
  }

  prevBtn.addEventListener('click', () => goTo(current - 1));
  nextBtn.addEventListener('click', () => goTo(current + 1));

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') goTo(current - 1);
    if (e.key === 'ArrowRight') goTo(current + 1);
  });

  // Swipe support (mobile)
  let touchStartX = 0;
  let touchEndX = 0;
  track.addEventListener('touchstart', (e) => { touchStartX = e.changedTouches[0].screenX; });
  track.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    const diff = touchStartX - touchEndX;
    if (Math.abs(diff) > 50) {
      diff > 0 ? goTo(current + 1) : goTo(current - 1);
    }
  });

  // Init
  goTo(0);
})();
(function initMiniSlideshows() {
  const slideshows = document.querySelectorAll('.mini-slideshow');

  slideshows.forEach(show => {
    const imgs = show.querySelectorAll('img');
    const dotsWrap = show.querySelector('.mini-slideshow-dots');
    const interval = parseInt(show.dataset.interval, 10) || 4000;

    // No slideshow needed for single image
    if (imgs.length <= 1) {
      if (dotsWrap) dotsWrap.style.display = 'none';
      return;
    }

    let current = 0;

    // Build dots
    imgs.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.setAttribute('aria-label', `Photo ${i + 1}`);
      if (i === 0) dot.classList.add('active');
      dot.addEventListener('click', (e) => {
        e.stopPropagation();
        goTo(i);
        resetTimer();
      });
      dotsWrap.appendChild(dot);
    });

    const dots = dotsWrap.querySelectorAll('button');

    function goTo(index) {
      imgs[current].classList.remove('active');
      dots[current].classList.remove('active');

      current = (index + imgs.length) % imgs.length;

      imgs[current].classList.add('active');
      dots[current].classList.add('active');
    }

    let timer = setInterval(() => goTo(current + 1), interval);

    function resetTimer() {
      clearInterval(timer);
      timer = setInterval(() => goTo(current + 1), interval);
    }

    // Pause on hover
    show.addEventListener('mouseenter', () => clearInterval(timer));
    show.addEventListener('mouseleave', resetTimer);

    // Click to open lightbox
    imgs.forEach(img => {
      img.style.cursor = 'zoom-in';
      img.addEventListener('click', (e) => {
        e.stopPropagation();
        const lb = document.querySelector('.lightbox');
        if (lb) {
          lb.querySelector('img').src = img.src;
          lb.classList.add('open');
        }
      });
    });

    goTo(0);
  });
})();

(function initNavDropdown() {
  const dropdown = document.querySelector('.nav-dropdown');
  if (!dropdown) return;

  const toggle = dropdown.querySelector('.nav-dropdown-toggle');

  // Only enable click-to-open on mobile (hover works on desktop)
toggle.addEventListener('click', (e) => {
  if (window.innerWidth <= 900) {
    e.preventDefault();
    e.stopPropagation();
    dropdown.classList.toggle('open');
  }
});

  // Close when clicking outside
  document.addEventListener('click', (e) => {
    if (!dropdown.contains(e.target)) {
      dropdown.classList.remove('open');
    }
  });
})();
(function initTestimonials() {
  const track = document.getElementById('testimonialTrack');
  if (!track) return;

  const slides = track.querySelectorAll('.testimonial-slide');
  const prevBtn = document.querySelector('.testimonial-prev');
  const nextBtn = document.querySelector('.testimonial-next');
  const dotsWrap = document.getElementById('testimonialDots');

  let current = 0;
  const total = slides.length;
  const INTERVAL = 4000; // 4 seconds

  // Build dots
  slides.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.setAttribute('aria-label', `Go to testimonial ${i + 1}`);
    if (i === 0) dot.classList.add('active');
    dot.addEventListener('click', () => {
      goTo(i);
      resetTimer();
    });
    dotsWrap.appendChild(dot);
  });
  const dots = dotsWrap.querySelectorAll('button');

  function goTo(index) {
    current = (index + total) % total;
    track.style.transform = `translateX(-${current * 100}%)`;
    dots.forEach((d, i) => d.classList.toggle('active', i === current));
  }

  prevBtn.addEventListener('click', () => {
    goTo(current - 1);
    resetTimer();
  });

  nextBtn.addEventListener('click', () => {
    goTo(current + 1);
    resetTimer();
  });

  // Auto-slide
  let timer = setInterval(() => goTo(current + 1), INTERVAL);

  function resetTimer() {
    clearInterval(timer);
    timer = setInterval(() => goTo(current + 1), INTERVAL);
  }

  // Pause on hover (nice UX — user can read without it jumping)
  const carousel = document.querySelector('.testimonial-carousel');
  if (carousel) {
    carousel.addEventListener('mouseenter', () => clearInterval(timer));
    carousel.addEventListener('mouseleave', resetTimer);
  }

  // Keyboard arrows
  document.addEventListener('keydown', (e) => {
    const rect = track.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      if (e.key === 'ArrowLeft') {
        goTo(current - 1);
        resetTimer();
      }
      if (e.key === 'ArrowRight') {
        goTo(current + 1);
        resetTimer();
      }
    }
  });

  // Swipe mobile
  let startX = 0;
  track.addEventListener('touchstart', (e) => { startX = e.changedTouches[0].screenX; });
  track.addEventListener('touchend', (e) => {
    const diff = startX - e.changedTouches[0].screenX;
    if (Math.abs(diff) > 50) {
      diff > 0 ? goTo(current + 1) : goTo(current - 1);
      resetTimer();
    }
  });

  goTo(0);
})();
// ============================================
// PRODUCTS PAGE — Filter Tabs
// ============================================
(function initProductFilters() {
  const filters = document.querySelectorAll('.filter-btn');
  const views = document.querySelectorAll('.product-view');
  if (!filters.length || !views.length) return;

  filters.forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.dataset.filter;

      // Update active button
      filters.forEach(f => f.classList.toggle('active', f === btn));

      // Show matching view, hide others
      views.forEach(view => {
        view.classList.toggle('hidden', view.dataset.view !== filter);
      });
    });
  });
})();
// ============================================
// PRODUCTS PAGE — Spec Modal (Popup)
// ============================================
(function initSpecModals() {
  // Create the modal element once
  const modal = document.createElement('div');
  modal.className = 'spec-modal';
  modal.innerHTML = `
    <div class="spec-modal-content">
      <div class="spec-modal-header">
        <h3 class="spec-modal-title"></h3>
        <div class="spec-modal-sub"></div>
        <button class="spec-modal-close" aria-label="Close">&times;</button>
      </div>
      <div class="spec-modal-body"></div>
    </div>
  `;
  document.body.appendChild(modal);

  const titleEl = modal.querySelector('.spec-modal-title');
  const subEl = modal.querySelector('.spec-modal-sub');
  const bodyEl = modal.querySelector('.spec-modal-body');
  const closeBtn = modal.querySelector('.spec-modal-close');

  function openModal(button) {
    const card = button.closest('.product-card');
    const productTitle = card.querySelector('h3')?.textContent || '';
    const productTag = card.querySelector('.product-tag')?.textContent || '';

    // Find the spec content inside this card
    const specContent = card.querySelector('.spec-content');
    if (!specContent) return;

    titleEl.textContent = productTitle;
    subEl.textContent = productTag;
    bodyEl.innerHTML = specContent.innerHTML;

    modal.classList.add('open');
    document.body.classList.add('modal-open');

    // Init tabs inside modal (for Octopus Random Cuts)
    initModalTabs();
  }

  function closeModal() {
    modal.classList.remove('open');
    document.body.classList.remove('modal-open');
  }

  // Bind all "View Details" buttons
  document.querySelectorAll('.spec-toggle').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      openModal(btn);
    });
  });

  // Close handlers
  closeBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });

  // ---------- Sub-tabs inside modal ----------
  function initModalTabs() {
    const tabs = modal.querySelectorAll('.spec-modal-tab');
    if (!tabs.length) return;

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const target = tab.dataset.specTab;
        tabs.forEach(t => t.classList.toggle('active', t === tab));
        modal.querySelectorAll('.spec-tab-panel').forEach(p => {
          p.classList.toggle('active', p.dataset.specPanel === target);
        });
      });
    });
  }
})();