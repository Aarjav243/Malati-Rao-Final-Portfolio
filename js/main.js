/* === MALATI RAO — main.js === */

document.addEventListener('DOMContentLoaded', () => {

  /* Mobile nav toggle */
  const toggle = document.querySelector('.nav-toggle');
  const links  = document.querySelector('.site-nav__links');

  if (toggle && links) {
    toggle.addEventListener('click', () => {
      const open = links.classList.toggle('open');
      toggle.classList.toggle('open', open);
      toggle.setAttribute('aria-expanded', open);
    });

    /* Close on outside click */
    document.addEventListener('click', (e) => {
      if (!toggle.contains(e.target) && !links.contains(e.target)) {
        links.classList.remove('open');
        toggle.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });

    /* Close on nav link click */
    links.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        links.classList.remove('open');
        toggle.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* Mark active nav link based on current path */
  const path = window.location.pathname;
  document.querySelectorAll('.site-nav__links a').forEach(a => {
    const href = a.getAttribute('href') || '';
    const page = href.split('/').pop().replace('.html', '');
    const current = path.split('/').pop().replace('.html', '');
    if (page && current && page === current) {
      a.classList.add('active');
    }
    /* Home page: mark bio? No — leave all inactive on home */
  });

});
