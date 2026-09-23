/**
 * IMov - Official Website JavaScript
 * Handles Canvas ambient stars, Interactive Download Modal with Countdown,
 * Scroll Spy, Mobile Navigation, Installation Tabs, Catalog Filters, and Toast Alerts.
 */

document.addEventListener('DOMContentLoaded', () => {
  // Sync dynamic admin configuration across DOM
  if (typeof applyConfigToDOM === 'function') {
    applyConfigToDOM();
  }

  initAmbientCanvas();
  initScrollEffects();
  initMobileNav();
  initDownloadFlow();
  initInstallationTabs();
  initCatalogTabs();
  initFaqAccordion();
  initRecentDownloadToasts();
  initBackToTop();
  initCopyLink();
});

/* ==========================================================================
   1. Canvas Ambient Cinema Starfield & Glow Particles
   ========================================================================== */
function initAmbientCanvas() {
  const canvas = document.getElementById('ambient-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  const particles = [];
  const particleCount = Math.min(Math.floor(window.innerWidth / 20), 65);
  const colors = [
    'rgba(168, 85, 247, 0.4)',  // Purple
    'rgba(236, 72, 153, 0.35)', // Pink
    'rgba(99, 102, 241, 0.35)', // Indigo
    'rgba(56, 189, 248, 0.3)'   // Cyan
  ];

  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 2 + 0.6,
      color: colors[Math.floor(Math.random() * colors.length)],
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      alpha: Math.random() * 0.7 + 0.3,
      alphaSpeed: (Math.random() - 0.5) * 0.015
    });
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);

    for (let p of particles) {
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0) p.x = width;
      if (p.x > width) p.x = 0;
      if (p.y < 0) p.y = height;
      if (p.y > height) p.y = 0;

      p.alpha += p.alphaSpeed;
      if (p.alpha <= 0.1 || p.alpha >= 0.8) {
        p.alphaSpeed = -p.alphaSpeed;
      }

      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.fill();
      ctx.restore();
    }

    requestAnimationFrame(animate);
  }

  animate();
}

/* ==========================================================================
   2. Scroll Effects & Reveal Animations
   ========================================================================== */
function initScrollEffects() {
  const header = document.querySelector('.site-header');
  const stickyBar = document.getElementById('sticky-download-bar');
  const backToTopBtn = document.getElementById('back-to-top');

  window.addEventListener('scroll', () => {
    const scrollPos = window.scrollY;

    // Header background blur intensification
    if (header) {
      if (scrollPos > 40) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    }

    // Sticky Download Bar on mobile/desktop after hero
    if (stickyBar) {
      if (scrollPos > 520) {
        stickyBar.classList.add('visible');
      } else {
        stickyBar.classList.remove('visible');
      }
    }

    // Back to top button visibility
    if (backToTopBtn) {
      if (scrollPos > 600) {
        backToTopBtn.style.opacity = '1';
        backToTopBtn.style.pointerEvents = 'all';
      } else {
        backToTopBtn.style.opacity = '0';
        backToTopBtn.style.pointerEvents = 'none';
      }
    }
  });

  // Intersection Observer for smooth reveal-on-scroll
  const revealElements = document.querySelectorAll('.reveal-fade-up, .reveal-fade-left, .reveal-fade-right');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('reveal-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    revealElements.forEach((el) => observer.observe(el));
  } else {
    revealElements.forEach((el) => el.classList.add('reveal-visible'));
  }
}

/* ==========================================================================
   3. Mobile Navigation Drawer
   ========================================================================== */
function initMobileNav() {
  const toggleBtn = document.getElementById('mobile-menu-toggle');
  const navLinks = document.getElementById('navbar-links');

  if (!toggleBtn || !navLinks) return;

  toggleBtn.addEventListener('click', () => {
    const isOpen = navLinks.classList.contains('mobile-open');
    if (isOpen) {
      navLinks.classList.remove('mobile-open');
      toggleBtn.setAttribute('aria-expanded', 'false');
    } else {
      navLinks.classList.add('mobile-open');
      toggleBtn.setAttribute('aria-expanded', 'true');
    }
  });

  // Close menu on link click
  navLinks.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('mobile-open');
      toggleBtn.setAttribute('aria-expanded', 'false');
    });
  });
}

/* ==========================================================================
   4. High-Conversion Download Flow (Countdown & Security Scan Modal)
   ========================================================================== */
function initDownloadFlow() {
  const modal = document.getElementById('download-modal');
  const countdownNumber = document.getElementById('countdown-number');
  const progressBar = document.getElementById('download-progress-bar');
  const scanStatus = document.getElementById('scan-status-text');
  const closeBtn = document.getElementById('modal-close-btn');
  const directLinkBtn = document.getElementById('direct-download-action');

  const downloadTriggers = document.querySelectorAll('.trigger-download');
  let countdownTimer = null;
  let progressInterval = null;

  function openDownloadModal() {
    if (!modal) return;
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';

    // Reset modal state
    let count = 5;
    countdownNumber.textContent = count;
    progressBar.style.width = '0%';
    scanStatus.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
      Scanning for malware &amp; verifying safety certificate...
    `;

    // Progress bar animation
    let progress = 0;
    progressInterval = setInterval(() => {
      progress += 2;
      if (progress <= 100) {
        progressBar.style.width = `${progress}%`;
      }
    }, 100);

    // Countdown timer
    countdownTimer = setInterval(() => {
      count--;
      if (count > 0) {
        countdownNumber.textContent = count;
      } else {
        clearInterval(countdownTimer);
        clearInterval(progressInterval);
        progressBar.style.width = '100%';
        countdownNumber.textContent = '✓';
        scanStatus.innerHTML = `
          <span style="color: #34d399; font-weight: 700; display: inline-flex; align-items: center; gap: 0.4rem;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            100% Clean! Starting your download now...
          </span>
        `;

        // Trigger real APK download
        triggerActualDownload();
      }
    }, 1000);
  }

  function triggerActualDownload() {
    const config = typeof getSiteConfig === 'function' ? getSiteConfig() : null;
    const apkUrl = typeof getActiveApkDownloadUrl === 'function' 
      ? getActiveApkDownloadUrl(config) 
      : 'downloads/imov-v12.4-official.apk';
    const fileName = (config && config.apkFileName) ? config.apkFileName : 'IMov-v12.4-Official.apk';

    const tempAnchor = document.createElement('a');
    tempAnchor.href = apkUrl;
    tempAnchor.setAttribute('download', fileName);
    document.body.appendChild(tempAnchor);
    tempAnchor.click();
    document.body.removeChild(tempAnchor);

    if (directLinkBtn) {
      directLinkBtn.href = apkUrl;
      directLinkBtn.setAttribute('download', fileName);
      directLinkBtn.style.display = 'inline-flex';
    }
  }

  function closeDownloadModal() {
    if (!modal) return;
    modal.classList.remove('active');
    document.body.style.overflow = '';
    if (countdownTimer) clearInterval(countdownTimer);
    if (progressInterval) clearInterval(progressInterval);
  }

  downloadTriggers.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openDownloadModal();
    });
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', closeDownloadModal);
  }

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeDownloadModal();
    });
  }

  // QR Code Modal handling
  const qrModal = document.getElementById('qr-modal');
  const qrTriggers = document.querySelectorAll('.trigger-qr-modal');
  const qrCloseBtn = document.getElementById('qr-modal-close-btn');

  qrTriggers.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      if (qrModal) {
        qrModal.classList.add('active');
        document.body.style.overflow = 'hidden';
      }
    });
  });

  if (qrCloseBtn && qrModal) {
    qrCloseBtn.addEventListener('click', () => {
      qrModal.classList.remove('active');
      document.body.style.overflow = '';
    });
    qrModal.addEventListener('click', (e) => {
      if (e.target === qrModal) {
        qrModal.classList.remove('active');
        document.body.style.overflow = '';
      }
    });
  }
}

/* ==========================================================================
   5. Installation Guides Tab Switcher
   ========================================================================== */
function initInstallationTabs() {
  const tabs = document.querySelectorAll('.device-tab-btn');
  const panes = document.querySelectorAll('.install-tab-pane');

  if (!tabs.length || !panes.length) return;

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      tabs.forEach((t) => t.classList.remove('active'));
      panes.forEach((p) => p.classList.remove('active'));

      tab.classList.add('active');
      const targetId = tab.getAttribute('data-target');
      const activePane = document.getElementById(targetId);
      if (activePane) {
        activePane.classList.add('active');
      }
    });
  });
}

/* ==========================================================================
   6. Content Catalog Showcase Tabs & Filters
   ========================================================================== */
function initCatalogTabs() {
  const filterBtns = document.querySelectorAll('.catalog-tab-btn');
  const catalogItems = document.querySelectorAll('.movie-poster-card');

  if (!filterBtns.length) return;

  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      filterBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter');

      catalogItems.forEach((card) => {
        const category = card.getAttribute('data-category');
        if (filter === 'all' || category === filter) {
          card.style.display = 'block';
          card.style.animation = 'fadeIn 0.4s ease';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
}

/* ==========================================================================
   7. FAQ Accordion Toggle
   ========================================================================== */
function initFaqAccordion() {
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach((item) => {
    const questionBtn = item.querySelector('.faq-question');
    if (!questionBtn) return;

    questionBtn.addEventListener('click', () => {
      const isActive = item.classList.contains('active');

      // Close other accordion items
      faqItems.forEach((other) => {
        if (other !== item) other.classList.remove('active');
      });

      if (isActive) {
        item.classList.remove('active');
      } else {
        item.classList.add('active');
      }
    });
  });
}

/* ==========================================================================
   8. Dynamic Recent Download Toast Notifications
   ========================================================================== */
function initRecentDownloadToasts() {
  const toast = document.getElementById('recent-download-toast');
  const toastUser = document.getElementById('toast-user-text');
  const toastTime = document.getElementById('toast-time-text');

  if (!toast || !toastUser) return;

  const config = typeof getSiteConfig === 'function' ? getSiteConfig() : null;
  const appVersion = (config && config.version) ? config.version : 'v12.4';
  const appName = (config && config.appName) ? config.appName : 'IMov';

  const downloadEvents = [
    { location: 'Mumbai, India', version: `${appName} APK ${appVersion}`, time: '1 min ago' },
    { location: 'Ahmedabad, Gujarat', version: `${appName} APK ${appVersion}`, time: '2 mins ago' },
    { location: 'London, UK', version: `${appName} for Android TV`, time: '4 mins ago' },
    { location: 'Delhi, India', version: `${appName} Cinema 4K APK`, time: 'Just now' },
    { location: 'Toronto, Canada', version: `${appName} APK ${appVersion}`, time: '3 mins ago' },
    { location: 'Surat, Gujarat', version: `${appName} Lite (14MB)`, time: '5 mins ago' },
    { location: 'Dubai, UAE', version: `${appName} APK ${appVersion}`, time: '2 mins ago' },
    { location: 'Bengaluru, India', version: `${appName} APK ${appVersion}`, time: 'Just now' }
  ];

  let eventIndex = 0;

  function showNextToast() {
    const event = downloadEvents[eventIndex];
    toastUser.innerHTML = `Someone from <strong>${event.location}</strong> downloaded ${event.version}`;
    if (toastTime) toastTime.textContent = event.time;

    toast.classList.add('show');

    setTimeout(() => {
      toast.classList.remove('show');
    }, 4500);

    eventIndex = (eventIndex + 1) % downloadEvents.length;
  }

  // Initial trigger after 3.5 seconds, then repeat every 14 seconds
  setTimeout(() => {
    showNextToast();
    setInterval(showNextToast, 14000);
  }, 3500);
}

/* ==========================================================================
   9. Back to Top Button
   ========================================================================== */
function initBackToTop() {
  const backBtn = document.getElementById('back-to-top');
  if (!backBtn) return;

  backBtn.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
}

/* ==========================================================================
   10. Copy Shareable Download Link
   ========================================================================== */
function initCopyLink() {
  const copyBtn = document.getElementById('copy-download-link-btn');
  if (!copyBtn) return;

  copyBtn.addEventListener('click', () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      const originalText = copyBtn.innerHTML;
      copyBtn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
        Link Copied!
      `;
      setTimeout(() => {
        copyBtn.innerHTML = originalText;
      }, 2500);
    });
  });
}
