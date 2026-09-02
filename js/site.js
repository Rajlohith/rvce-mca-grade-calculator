/* ==========================================================================
   site.js — shared header, footer and breadcrumb, injected into every page.
   Keeps the header/footer markup in one place instead of copy-pasted across
   every HTML file, while each page still remains a real, separately loadable
   file with its own URL and query-string state.

   Path awareness: index.html lives at the project root; every other page
   lives one level down in pages/. Whichever page is currently loaded, this
   file works out the right relative prefixes so the header/footer links
   always resolve correctly either way.
   ========================================================================== */

window.MCA = window.MCA || {};

(function(){
  const REPO_URL = 'https://github.com/Rajlohith/rvce-mca-grade-calculator';

  // Obfuscated so plain-text scrapers/bots that scan page source for
  // "mailto:" or "@" patterns don't harvest the address directly.
  const EMAIL_USER = 'brlohithraj.mca25';
  const EMAIL_HOST = 'rvce.edu.in';
  const EMAIL = `${EMAIL_USER}@${EMAIL_HOST}`;

  const SYLLABUS_URL =
    'https://rvce.edu.in/academics_and_examinations/rvce_scheme_syllabus/';

  const HANDBOOK_URL = 'https://rvce.edu.in/handbook/';

  const THEME_KEY = 'mca-theme';
  const { escapeHTML } = window.MCA.util;

  const IN_PAGES = /\/pages\//.test(window.location.pathname);
  const ROOT = IN_PAGES ? '../' : '';
  const PAGES = IN_PAGES ? '' : 'pages/';

  /* ---------- Navigation links ---------- */

  function navLinks(){
    return [
      {
        id: 'home',
        label: 'Home',
        href: ROOT + 'index.html'
      },
      {
        id: 'start',
        label: 'Calculate',
        href: PAGES + 'scheme.html'
      },
      {
        id: 'cgpa',
        label: 'CGPA',
        href: PAGES + 'cgpa.html'
      },
      {
        id: 'guide',
        label: 'Guide',
        href: PAGES + 'guide.html'
      },
      {
        id: 'achievements',
        label: 'Achievements',
        href: PAGES + 'achievements.html'
      },
      {
        id: 'faq',
        label: 'FAQ',
        href: PAGES + 'faq.html'
      }
    ];
  }

  function escapeLabel(label){
    return escapeHTML(label);
  }

  /* ---------- Query-string helpers ---------- */

  function qs(name, fallback){
    const v = new URLSearchParams(window.location.search).get(name);
    return v === null ? fallback : v;
  }

  function withParams(page, params){
    const usp = new URLSearchParams();

    Object.keys(params || {}).forEach(k => {
      if(
        params[k] !== undefined &&
        params[k] !== null &&
        params[k] !== ''
      ){
        usp.set(k, params[k]);
      }
    });

    const q = usp.toString();

    return q ? `${page}?${q}` : page;
  }

  /* ---------- Theme (light / soft-dark) ---------- */

  function currentTheme(){
    return document.documentElement.getAttribute('data-theme') === 'dark'
      ? 'dark'
      : 'light';
  }

  function applyTheme(theme){
    document.documentElement.setAttribute(
      'data-theme',
      theme === 'dark' ? 'dark' : 'light'
    );

    try{
      localStorage.setItem(THEME_KEY, theme);
    }catch(e){
      /* Private mode etc. */
    }
  }

  function wireThemeToggle(){
    const btn = document.getElementById('themeToggle');

    if(!btn) return;

    const sync = () => {
      btn.setAttribute(
        'aria-pressed',
        currentTheme() === 'dark' ? 'true' : 'false'
      );
    };

    sync();

    btn.addEventListener('click', () => {
      const next = currentTheme() === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      sync();

      if(window.MCA.achievements){
        window.MCA.achievements.track('theme_toggled', { theme: next });
      }
    });
  }

  /* ---------- Hamburger navigation ---------- */

  function wireNavToggle(){
    const btn = document.getElementById('navToggle');
    const panel = document.getElementById('navPanel');

    if(!btn || !panel) return;

    const close = () => {
      btn.setAttribute('aria-expanded', 'false');
      panel.classList.remove('open');
    };

    const open = () => {
      btn.setAttribute('aria-expanded', 'true');
      panel.classList.add('open');
    };

    btn.addEventListener('click', e => {
      e.stopPropagation();

      panel.classList.contains('open')
        ? close()
        : open();
    });

    panel.addEventListener('click', e => {
      if(e.target.tagName === 'A'){
        close();
      }
    });

    document.addEventListener('click', e => {
      if(
        panel.classList.contains('open') &&
        !panel.contains(e.target) &&
        e.target !== btn
      ){
        close();
      }
    });

    document.addEventListener('keydown', e => {
      if(
        e.key === 'Escape' &&
        panel.classList.contains('open')
      ){
        close();
      }
    });
  }

  /* ---------- Shared header ---------- */

  function renderHeader(activeId){
    const nav = navLinks()
      .map(l => {
        const cls = l.id === activeId ? 'current' : '';

        return `
          <a href="${escapeHTML(l.href)}" class="${cls}">
            ${escapeLabel(l.label)}
          </a>
        `;
      })
      .join('');

    return `
      <div class="site-header-inner">

        <a class="brand" href="${ROOT}index.html">
          <img
            class="brand-mark"
            src="${ROOT}icons/brand-mark.png"
            alt="RVCE MCA Grade Calculator logo"
            width="36"
            height="36"
          >
          <span class="brand-name">
            RVCE MCA Grade Calculator
          </span>
        </a>

        <button
          type="button"
          id="navToggle"
          class="nav-toggle"
          aria-expanded="false"
          aria-controls="navPanel"
          aria-label="Open menu"
        >
          <span class="nav-toggle-bars">
            <span></span>
            <span></span>
            <span></span>
          </span>
        </button>

        <div class="site-nav" id="navPanel">

          <div class="site-nav-links">
            ${nav}
          </div>

          <div class="site-nav-controls">

            <div class="auth-container"></div>

            <button
              type="button"
              id="themeToggle"
              class="theme-toggle"
              aria-pressed="false"
              aria-label="Toggle dark mode"
            >
              <span class="toggle-track">
                <span class="toggle-thumb"></span>
              </span>
            </button>

          </div>

        </div>

      </div>
    `;
  }

  /* ---------- Breadcrumb ---------- */

  function renderBreadcrumb(trail){
    if(!trail || !trail.length) return '';

    const parts = trail.map((c, i) => {
      const isLast = i === trail.length - 1;

      if(isLast || !c.href){
        return `
          <span class="current">
            ${escapeLabel(c.label)}
          </span>
        `;
      }

      return `
        <a href="${escapeHTML(c.href)}">
          ${escapeLabel(c.label)}
        </a>
      `;
    });

    return `
      <nav class="breadcrumb" aria-label="Breadcrumb">
        ${parts.join('<span class="sep">&rsaquo;</span>')}
      </nav>
    `;
  }

  /* ---------- Simplified footer ---------- */

  function renderFooter(){
    const year = new Date().getFullYear();

    return `
      <div class="footer-links">
        <a
          href="${REPO_URL}"
          target="_blank"
          rel="noopener noreferrer"
        >
          GitHub
        </a>

        <a href="mailto:${EMAIL}">
          Contact
        </a>

        <a
          href="${SYLLABUS_URL}"
          target="_blank"
          rel="noopener noreferrer"
        >
          Official Syllabus
        </a>

        <a
          href="${HANDBOOK_URL}"
          target="_blank"
          rel="noopener noreferrer"
        >
          Official Handbook
        </a>

        <a href="${PAGES}guide.html">
          Guide
        </a>
      </div>

      <div class="legal">
        &copy; ${year} B R Lohith Raj<br>
        Unofficial student project &middot;
        Not affiliated with or endorsed by R V College of Engineering.
        Please verify all results against your official grade card and
        with the Controller of Examinations.
      </div>
    `;
  }

  /* ---------- Syllabus / handbook link tracking ----------
     Delegated at document level (registered once per page load) rather
     than wired per-link, since the same two URLs appear in the footer
     on every page AND in the home page's own quick-links markup. */
  document.addEventListener('click', e => {
    if(!window.MCA.achievements) return;
    const a = e.target.closest('a[href]');
    if(!a) return;
    const href = a.getAttribute('href') || '';
    if(a.href === SYLLABUS_URL || href.indexOf('docs/') !== -1 && href.indexOf('Syllabus') !== -1){
      window.MCA.achievements.track('syllabus_viewed', { which: 'syllabus' });
    } else if(a.href === HANDBOOK_URL || href.indexOf('docs/') !== -1 && href.indexOf('Handbook') !== -1){
      window.MCA.achievements.track('syllabus_viewed', { which: 'handbook' });
    }
  });

  /* ---------- Mount shared components ---------- */

  function mount(opts){
    opts = opts || {};

    const headerEl = document.getElementById('site-header');
    const crumbEl = document.getElementById('breadcrumb');
    const footerEl = document.getElementById('site-footer');

    if(headerEl){
      headerEl.innerHTML = renderHeader(opts.active);
    }

    if(crumbEl){
      crumbEl.innerHTML = renderBreadcrumb(opts.trail);
    }

    if(footerEl){
      footerEl.innerHTML = renderFooter();
    }

    wireThemeToggle();
    wireNavToggle();
  }

  /* ---------- Public API ---------- */

  window.MCA.site = {
    mount,
    qs,
    withParams,
    applyTheme,
    currentTheme,
    REPO_URL,
    EMAIL,
    SYLLABUS_URL,
    HANDBOOK_URL,
    ROOT,
    PAGES
  };

})();