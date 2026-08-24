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
  const REPO_URL   = 'https://github.com/Rajlohith/rvce-mca-grade-calculator';
  // Obfuscated so plain-text scrapers/bots that scan page source for
  // "mailto:" or "@" patterns don't harvest the address directly; anyone
  // reading it in a rendered browser still sees and can click a normal
  // mailto link. Not a security boundary — just cuts down on spam bots.
  const EMAIL_USER = 'brlohithraj.mca25';
  const EMAIL_HOST = 'rvce.edu.in';
  const EMAIL = `${EMAIL_USER}@${EMAIL_HOST}`;
  const SYLLABUS_URL = 'https://rvce.edu.in/academics_and_examinations/rvce_scheme_syllabus/';
  const HANDBOOK_URL = 'https://rvce.edu.in/handbook/';
  const THEME_KEY = 'mca-theme';
  const { escapeHTML } = window.MCA.util;

  const IN_PAGES = /\/pages\//.test(window.location.pathname);
  const ROOT  = IN_PAGES ? '../' : '';       // prefix to reach the project root
  const PAGES = IN_PAGES ? '' : 'pages/';    // prefix to reach anything inside pages/

  function navLinks(){
    return [
      { id:'home',  label:'Home',      href: ROOT + 'index.html' },
      { id:'start', label:'Calculate', href: PAGES + 'scheme.html' },
      { id:'cgpa',  label:'CGPA',      href: PAGES + 'cgpa.html' },
      { id:'faq',   label:'FAQ',       href: PAGES + 'faq.html' }
    ];
  }

  // Every nav/breadcrumb label used on this site today is a hardcoded
  // string literal, so this isn't reachable by anything a visitor can
  // control. It's still escaped before going into innerHTML as
  // defense-in-depth, so a future label built from dynamic data (e.g. a
  // course name or query param) can't become a markup-injection point
  // just because nobody remembered to escape it there too.
  function escapeLabel(label){ return escapeHTML(label); }

  function qs(name, fallback){
    const v = new URLSearchParams(window.location.search).get(name);
    return v === null ? fallback : v;
  }

  function withParams(page, params){
    const usp = new URLSearchParams();
    Object.keys(params || {}).forEach(k=>{
      if(params[k] !== undefined && params[k] !== null && params[k] !== '') usp.set(k, params[k]);
    });
    const q = usp.toString();
    return q ? `${page}?${q}` : page;
  }

  /* ---------- Theme (light / soft-dark) ---------- */
  function currentTheme(){
    return document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
  }
  function applyTheme(theme){
    document.documentElement.setAttribute('data-theme', theme === 'dark' ? 'dark' : 'light');
    try{ localStorage.setItem(THEME_KEY, theme); }catch(e){ /* private mode etc. */ }
  }
  function wireThemeToggle(){
    const btn = document.getElementById('themeToggle');
    if(!btn) return;
    const sync = () => btn.setAttribute('aria-pressed', currentTheme()==='dark' ? 'true' : 'false');
    sync();
    btn.addEventListener('click', ()=>{
      applyTheme(currentTheme()==='dark' ? 'light' : 'dark');
      sync();
    });
  }

  /* ---------- Syllabus PDF scheme choice (reused in the footer and on
     the home page) ---------- */
  function renderPdfChoice(){
    return `
      <div class="pdf-choice" role="group" aria-label="Syllabus PDF scheme">
        <a class="pdf-chip" href="${ROOT}docs/MCA-2024-Scheme-Syllabus.pdf" target="_blank" rel="noopener noreferrer">2024 Scheme</a>
        <span class="pdf-chip disabled" aria-disabled="true">2026 Scheme <span class="soon-badge">Coming soon</span></span>
      </div>`;
  }

  function renderHandbookChoice(){
    return `
      <div class="pdf-choice" role="group" aria-label="Handbook PDF scheme">
        <!-- Make sure the filename matches your actual handbook PDF in the docs folder -->
        <a class="pdf-chip" href="${ROOT}docs/PG-2024-Scheme-Handbook.pdf" target="_blank" rel="noopener noreferrer">2024 Handbook</a>
        <span class="pdf-chip disabled" aria-disabled="true">2026 Handbook <span class="soon-badge">Coming soon</span></span>
      </div>`;
  }

  function renderHeader(activeId){
    const nav = navLinks().map(l=>{
      const cls = l.id === activeId ? 'current' : '';
      return `<a href="${escapeHTML(l.href)}" class="${cls}">${escapeLabel(l.label)}</a>`;
    }).join('');
    return `
      <div class="site-header-inner">
        <a class="brand" href="${ROOT}index.html">
          <div class="brand-mark">M</div>
          <div class="brand-text">
            <span class="brand-name">RVCE MCA Grade Calculator</span>
            <span class="brand-tag">2024 &amp; 2026 Scheme</span>
          </div>
        </a>
        <div class="site-nav">
          ${nav}
          <a class="ext" href="${REPO_URL}" target="_blank" rel="noopener noreferrer">GitHub</a>
          <button type="button" id="themeToggle" class="theme-toggle" aria-pressed="false" aria-label="Toggle dark mode">
            <span class="toggle-track"><span class="toggle-thumb"></span></span>
          </button>
        </div>
      </div>`;
  }

  function renderBreadcrumb(trail){
    if(!trail || !trail.length) return '';
    const parts = trail.map((c,i)=>{
      const isLast = i === trail.length - 1;
      if(isLast || !c.href) return `<span class="current">${escapeLabel(c.label)}</span>`;
      return `<a href="${escapeHTML(c.href)}">${escapeLabel(c.label)}</a>`;
    });
    return `<nav class="breadcrumb" aria-label="Breadcrumb">` +
      parts.join(`<span class="sep">&rsaquo;</span>`) +
      `</nav>`;
  }

  /* A single, quiet footer: one short line about the project, one row of
     links, the syllabus PDF choice, and the legal line — no repeated
     column headings or dense grids. */
  function renderFooter(){
    const year = new Date().getFullYear();
    return `
      <div class="footer-top">
        <div class="footer-brand">
          <p class="footer-about">
            <strong>RVCE MCA Grade Calculator</strong> is an independent, unofficial grades and GPA calculator for RVCE MCA students, built using the published PG Academic Handbook and the syllabus scheme.
          </p>
          <p class="footer-about">
             Not affiliated with or endorsed by R V College of Engineering.
          </p>
        </div>
        <div class="footer-meta">
          <div class="footer-pdf">
            <span class="footer-pdf-label">Syllabus PDF</span>
            ${renderPdfChoice()}
          </div>
          <div class="footer-pdf">
            <span class="footer-pdf-label">Handbook PDF</span>
            ${renderHandbookChoice()}
          </div>
        </div>
      </div>
      <div class="footer-links">
        <a href="${REPO_URL}" target="_blank" rel="noopener noreferrer">GitHub</a>
        <a href="mailto:${EMAIL}">Contact</a>
        <a href="${SYLLABUS_URL}" target="_blank" rel="noopener noreferrer">Official Syllabus</a>
        <a href="${HANDBOOK_URL}" target="_blank" rel="noopener noreferrer">Official Handbook</a>
        <a href="${PAGES}faq.html">How Calculations Work</a>
      </div>
      <div class="legal">
        &copy; ${year} B R Lohith Raj<br>
        Unofficial student project &middot; not affiliated with RVCE &middot; always confirm results against your official grade card and the Controller of Examinations.
      </div>`;
  }

  function mount(opts){
    opts = opts || {};
    const headerEl = document.getElementById('site-header');
    const crumbEl  = document.getElementById('breadcrumb');
    const footerEl = document.getElementById('site-footer');
    if(headerEl) headerEl.innerHTML = renderHeader(opts.active);
    if(crumbEl)  crumbEl.innerHTML  = renderBreadcrumb(opts.trail);
    if(footerEl) footerEl.innerHTML = renderFooter();
    wireThemeToggle();
  }

  window.MCA.site = {
    mount, qs, withParams, applyTheme, currentTheme, renderPdfChoice,
    REPO_URL, EMAIL, SYLLABUS_URL, HANDBOOK_URL, ROOT, PAGES
  };
})();