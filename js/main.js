/* === MALATI RAO — main.js === */

/* Curtain HTML is the first element in <body> on every page.
   Curtain CSS lives in style.css — both load before any content renders,
   so the curtain covers the screen from the very first browser paint.    */

/* ── Disable BFCache: force fresh load on back/forward navigation ────────
   Adding ANY unload listener tells the browser not to store this page in
   the Back/Forward Cache. Without BFCache, back navigation always does a
   real page load, so the curtain reveal animation runs correctly.         */
window.addEventListener('unload', () => {});


document.addEventListener('DOMContentLoaded', () => {

  const curtain = document.getElementById('page-curtain');

  /* ── Mobile nav toggle ─────────────────────────────────────────────── */
  const toggle   = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.site-nav__links');

  if (toggle && navLinks) {
    toggle.addEventListener('click', () => {
      const open = navLinks.classList.toggle('open');
      toggle.classList.toggle('open', open);
      toggle.setAttribute('aria-expanded', open);
    });

    document.addEventListener('click', (e) => {
      if (!toggle.contains(e.target) && !navLinks.contains(e.target)) {
        navLinks.classList.remove('open');
        toggle.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });

    navLinks.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        navLinks.classList.remove('open');
        toggle.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ── Active nav link ────────────────────────────────────────────────── */
  const path = window.location.pathname;
  document.querySelectorAll('.site-nav__links a').forEach(a => {
    const href    = a.getAttribute('href') || '';
    const page    = href.split('/').pop().replace('.html', '');
    const current = path.split('/').pop().replace('.html', '');
    if (page && current && page === current) a.classList.add('active');
  });

  /* ── GSAP guard ─────────────────────────────────────────────────────── */
  if (typeof gsap === 'undefined') {
    if (curtain) curtain.style.display = 'none';
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  /* ── Reduced motion: instant reveal, no animations ─────────────────── */
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    gsap.set(curtain, { autoAlpha: 0 });
    return;
  }

  /* ═══════════════════════════════════════════════════════════════════
     ANIMATIONS
  ═══════════════════════════════════════════════════════════════════ */

  /* 1 ── Page curtain reveal ─────────────────────────────────────────
     Curtain wipes upward off the screen, revealing the page beneath.
     Delay 0.05s gives the browser a frame to paint before animating. */
  gsap.to(curtain, {
    yPercent: -100,
    duration: 0.75,
    ease: 'expo.inOut',
    delay: 0.05,
    onComplete: () => {
      curtain.style.pointerEvents = 'none';
    },
  });

  /* Internal link clicks: navigate directly.
     No exit curtain animation — any element covering the screen at
     navigation time gets frozen in BFCache, causing a black screen
     on back navigation. Direct navigation is the reliable fix.       */
  document.querySelectorAll('a[href]').forEach(link => {
    const href = link.getAttribute('href');
    if (!href ||
        href.startsWith('#') ||
        href.startsWith('http') ||
        href.startsWith('mailto') ||
        href.startsWith('tel') ||
        link.getAttribute('target') === '_blank') return;

    link.addEventListener('click', e => {
      e.preventDefault();
      window.location.href = href;
    });
  });

  /* 2 ── Homepage hero sequence ───────────────────────────────────────
     Eyebrow → name reveal (clip-path) → role → CTA → film still cards.
     Text and cards build simultaneously from 0.3s onward.             */
  if (document.querySelector('.home-hero-new')) {

    // Set initial hidden state: blurred, scaled, and offset
    gsap.set('.home-hero-new__name .name-top',    { y: -100, opacity: 0, filter: 'blur(20px)', scale: 1.2 });
    gsap.set('.home-hero-new__name .name-bottom', { y: 100,  opacity: 0, filter: 'blur(20px)', scale: 1.2 });
    
    const hero = gsap.timeline({ delay: 0.7 });
    hero
      .from('.home-hero-new__eyebrow', {
        opacity: 0, x: -30, duration: 1, ease: 'power4.out',
      })
      .to('.home-hero-new__name .name-top', {
        y: 0, opacity: 1, filter: 'blur(0px)', scale: 1, duration: 1.4, ease: 'expo.inOut'
      }, '-=0.6')
      .to('.home-hero-new__name .name-bottom', {
        y: 0, opacity: 1, filter: 'blur(0px)', scale: 1, duration: 1.4, ease: 'expo.inOut'
      }, '-=1.2') // Dramatic overlap
      .from('.home-hero-new__role', {
        opacity: 0, x: -20, duration: 0.8, ease: 'power2.out',
      }, '-=0.4')
      .from('.home-hero-new__cta', {
        opacity: 0, y: 30, duration: 0.8, ease: 'back.out(2)',
      }, '-=0.6')
      .from('.film-still-card', {
        opacity: 0, x: 100, rotationY: -20, duration: 1.2, ease: 'expo.out', stagger: 0.2,
      }, 0.5);

    /* Film still card hover */
    document.querySelectorAll('.film-still-card').forEach(card => {
      const img   = card.querySelector('.film-still-card__img, .film-still-card__placeholder');
      const label = card.querySelector('.film-still-card__label');

      if (img) {
        const scaleTo = gsap.quickTo(img, 'scale', { duration: 0.4, ease: 'power2.out' });
        card.addEventListener('mouseenter', () => scaleTo(1.04));
        card.addEventListener('mouseleave', () => scaleTo(1.0));
      }
      if (label) {
        card.addEventListener('mouseenter', () =>
          gsap.to(label, { y: -3, duration: 0.3, ease: 'power2.out', overwrite: 'auto' })
        );
        card.addEventListener('mouseleave', () =>
          gsap.to(label, { y: 0,  duration: 0.3, ease: 'power2.out', overwrite: 'auto' })
        );
      }
    });

    /* Statement + featured grid: scroll-triggered */
    gsap.from('.home-statement__text', {
      scrollTrigger: { 
        trigger: '.home-statement', 
        start: 'top 78%',
        toggleActions: 'play none none none'
      },
      opacity: 0, y: 20, duration: 0.8, ease: 'power2.out',
    });

    gsap.from('.featured-card', {
      scrollTrigger: { 
        trigger: '.featured-grid', 
        start: 'top 80%',
        toggleActions: 'play none none none'
      },
      opacity: 0, y: 30, duration: 0.65, ease: 'power2.out', stagger: 0.1,
    });
  }

  /* 3 ── Page header reveal ───────────────────────────────────────────
     Eyebrow fades up, then the large title clips upward into view.
     Applied on all inner pages (bio, films, teaching, press, etc.).   */
  if (document.querySelector('.page-header')) {
    gsap.set('.page-header__title', { clipPath: 'inset(0 0 100% 0)', y: 20 });

    const ph = gsap.timeline({ delay: 0.55 });
    ph
      .from('.page-header__eyebrow', {
        opacity: 0, y: 10, duration: 0.5, ease: 'power2.out',
      })
      .to('.page-header__title', {
        clipPath: 'inset(0 0 0% 0)', y: 0, duration: 0.9, ease: 'expo.out',
      }, '-=0.15');
  }

  /* 4 ── Films list ───────────────────────────────────────────────────
     Section labels and rows stagger in on load.
     Rows shift right + number turns gold on hover.                    */
  if (document.querySelector('.films-wrap')) {
    gsap.from('.section-label', {
      opacity: 0, x: -20, duration: 0.8, ease: 'power2.out', stagger: 0.1, delay: 0.8,
    });
    
    // Accordion Flow + Triple Slide + Ink Reveal
    document.querySelectorAll('.film-row').forEach((row, i) => {
      const num        = row.querySelector('.film-row__num');
      const title      = row.querySelector('.film-row__title');
      const meta       = row.querySelector('.film-row__meta');
      const revealLine = row.querySelector('.film-row__reveal-line');

      // Set initial state for accordion effect
      gsap.set(row, { height: 0, opacity: 0, overflow: 'hidden' });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: row,
          start: 'top 90%',
          toggleActions: 'play none none none'
        },
        delay: i * 0.08
      });

      tl.to(row, { height: 'auto', opacity: 1, duration: 1, ease: 'expo.inOut' })
        .to(revealLine, { width: '100%', duration: 1.2, ease: 'expo.inOut' }, 0)
        .from(num,   { y: -40, opacity: 0, duration: 0.8, ease: 'power4.out' }, '-=0.6')
        .from(title, { x: -80, opacity: 0, duration: 1, ease: 'expo.out' }, '-=0.6')
        .from(meta,  { x: 50,  opacity: 0, duration: 0.8, ease: 'power4.out' }, '-=0.6');
    });

    document.querySelectorAll('a.film-row').forEach(row => {
      const num   = row.querySelector('.film-row__num');
      const title = row.querySelector('.film-row__title');

      row.addEventListener('mouseenter', () => {
        gsap.to(num,   { color: '#C5A059', x: 5, duration: 0.2, ease: 'power2.out', overwrite: 'auto' });
        gsap.to(title, { x: 7, duration: 0.2, ease: 'power2.out', overwrite: 'auto' });
      });
      row.addEventListener('mouseleave', () => {
        gsap.to(num, {
          x: 0, duration: 0.22, ease: 'power2.out', overwrite: 'auto',
          onComplete: () => gsap.set(num, { clearProps: 'color' }),
        });
        gsap.to(title, { x: 0, duration: 0.22, ease: 'power2.out', overwrite: 'auto' });
      });
    });
  }

  /* 5 ── Film detail page ─────────────────────────────────────────────
     Meta → title clip reveal → tagline → embed → synopsis → sidebar.  */
  if (document.querySelector('.film-detail')) {
    gsap.set('.film-detail__title', { clipPath: 'inset(0 0 100% 0)', y: 20 });

    const fd = gsap.timeline({ delay: 0.55 });
    fd
      .from('.film-detail__meta-top span', {
        opacity: 0, y: 8,  duration: 0.4, ease: 'power2.out', stagger: 0.08,
      })
      .to('.film-detail__title', {
        clipPath: 'inset(0 0 0% 0)', y: 0, duration: 0.9, ease: 'expo.out',
      }, '-=0.1')
      .from('.film-detail__tagline', {
        opacity: 0, y: 10, duration: 0.5, ease: 'power2.out',
      }, '-=0.2')
      .from('.film-embed-wrap', {
        opacity: 0, scale: 0.98, duration: 0.6, ease: 'power2.out',
      }, '+=0.05')
      .from('.film-synopsis p', {
        opacity: 0, y: 12, duration: 0.5, ease: 'power2.out', stagger: 0.07,
      }, '-=0.35')
      .from('.film-info-block', {
        opacity: 0, x: 14, duration: 0.4, ease: 'power2.out', stagger: 0.06,
      }, '-=0.45');
  }

  /* 6 ── ScrollTrigger reveals ────────────────────────────────────────
     Each content section animates as it enters the viewport.          */

  /* Bio */
  if (document.querySelector('.bio-wrap')) {
    
    /* 1. Hero: Word-by-word dissolve + Photo darkroom develop */
    const pullquote = document.querySelector('.bio-pullquote');
    if (pullquote) {
      const text = pullquote.innerText;
      pullquote.innerHTML = text.split(' ').map(word => `<span class="word" style="display:inline-block; opacity:0; filter:blur(10px); transform:translateY(10px); margin-right: 0.25em;">${word}</span>`).join('');
      
      gsap.to('.bio-pullquote .word', {
        scrollTrigger: { 
          trigger: '.bio-pullquote', 
          start: 'top 85%',
          toggleActions: 'play none none none'
        },
        opacity: 1, filter: 'blur(0px)', y: 0, 
        duration: 0.8, ease: 'power2.out', stagger: 0.05
      });
    }

    gsap.to('.bio-photo', {
      scrollTrigger: { 
        trigger: '.bio-photo', 
        start: 'top 80%',
        toggleActions: 'play none none none'
      },
      opacity: 1, filter: 'brightness(1) contrast(1) saturate(1) blur(0px)',
      duration: 2.5, ease: 'power2.inOut'
    });

    /* 2. Stats: Number count-up */
    document.querySelectorAll('.bio-stat__num').forEach(num => {
      const targetValue = parseInt(num.innerText.replace('+', ''));
      const isPlus = num.innerText.includes('+');
      
      num.innerText = '0';
      gsap.to(num, {
        scrollTrigger: { 
          trigger: num, 
          start: 'top 90%',
          toggleActions: 'play none none none'
        },
        innerText: targetValue,
        duration: 2,
        snap: { innerText: 1 },
        onUpdate: function() {
          num.innerText = Math.floor(this.targets()[0].innerText) + (isPlus ? '+' : '');
        }
      });
    });

    /* 3. Practice: Rubber stamp tag + Entry slide from right */
    document.querySelectorAll('.bio-timeline__entry').forEach(entry => {
      const tag = entry.querySelector('.bio-timeline__tag');
      const body = entry.querySelector('.bio-timeline__body');
      
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: entry,
          start: 'top 85%',
          toggleActions: 'play none none none'
        }
      });

      tl.from(tag, { 
          opacity: 0, scale: 1.5, filter: 'blur(5px)', duration: 0.6, ease: 'back.out(2)' 
        })
        .from(body, { 
          opacity: 0, x: 50, duration: 0.8, ease: 'power2.out' 
        }, '-=0.4');
    });

    /* 4. Education & Fellowships: Split reveal */
    document.querySelectorAll('.cv-timeline-entry').forEach(entry => {
      const date = entry.querySelector('.cv-timeline-date');
      const content = entry.querySelector('.cv-timeline-content');
      
      gsap.from(date, {
        scrollTrigger: { trigger: entry, start: 'top 85%', toggleActions: 'play none none none' },
        opacity: 0, x: -40, duration: 0.8, ease: 'power2.out'
      });
      gsap.from(content, {
        scrollTrigger: { trigger: entry, start: 'top 85%', toggleActions: 'play none none none' },
        opacity: 0, x: 40, duration: 0.8, ease: 'power2.out'
      });
    });

    /* 5. International Labs: Border draw */
    document.querySelectorAll('.bio-lab-card').forEach(card => {
      const border = card.querySelector('.bio-lab-card__inner-border');
      const lines = border.querySelectorAll('span');
      
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: card,
          start: 'top 85%',
          toggleActions: 'play none none none'
        }
      });

      tl.to(lines[0], { width: '100%', duration: 0.3, ease: 'none' }) // Top
        .to(lines[1], { height: '100%', duration: 0.3, ease: 'none' }) // Right
        .to(lines[2], { width: '100%', duration: 0.3, ease: 'none' }) // Bottom
        .to(lines[3], { height: '100%', duration: 0.3, ease: 'none' }) // Left
        .from([card.querySelector('.bio-lab-card__year'), card.querySelector('.bio-lab-card__name'), card.querySelector('.bio-lab-card__place')], {
          opacity: 0, y: 10, stagger: 0.1, duration: 0.5
        }, '-=0.4');
    });

    // Timeline Draw Animation (existing) removed
  }


  /* Press */
  if (document.querySelector('.press-wrap')) {
    gsap.from('.press-item', {
      scrollTrigger: { 
        trigger: '.press-wrap', 
        start: 'top 82%',
        toggleActions: 'play none none none'
      },
      opacity: 0, y: 12, duration: 0.5, ease: 'power2.out', stagger: 0.08,
    });
  }

  /* Interviews */
  if (document.querySelector('.interviews-wrap')) {
    gsap.from('.interview-item, .interview-link-item', {
      scrollTrigger: { 
        trigger: '.interviews-wrap', 
        start: 'top 82%',
        toggleActions: 'play none none none'
      },
      opacity: 0, scale: 0.98, y: 14, duration: 0.6, ease: 'power2.out', stagger: 0.1,
    });
  }

  /* Contact */
  if (document.querySelector('.contact-wrap')) {
    gsap.from('.contact-block', {
      scrollTrigger: { 
        trigger: '.contact-grid', 
        start: 'top 82%',
        toggleActions: 'play none none none'
      },
      opacity: 0, y: 14, duration: 0.5, ease: 'power2.out', stagger: 0.08, delay: 0.15,
    });
  }

  /* Final pass: Refresh ScrollTrigger to ensure all positions are correct after layout shifts */
  ScrollTrigger.refresh();

  /* Safety Fallback: After 2.5s, force everything to visible if JS animations got stuck */
  setTimeout(() => {
    gsap.set('.bio-wrap, .bio-wrap *', { opacity: 1, x: 0, y: 0, clipPath: 'none', overwrite: 'auto' });
  }, 2500);

});
