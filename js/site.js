/* ==========================================================================
   site.js — shared header, footer and breadcrumb, injected into every page.
   Keeps the header/footer markup in one place instead of copy-pasted across
   every HTML file, while each page still remains a real, separately loadable
   file with its own URL and query-string state.
   ========================================================================== */
window.MCA = window.MCA || {};

(function(){
  const REPO_URL   = 'https://github.com/Rajlohith/rvce-mca-grade-calculator';
  const EMAIL      = 'brlohithraj.mca25@rvce.edu.in';
  const SYLLABUS_URL = 'https://rvce.edu.in/academics_and_examinations/rvce_scheme_syllabus/';

  const NAV_LINKS = [
    { id:'home',   label:'Home',   href:'index.html' },
    { id:'start',  label:'Start',  href:'scheme.html' },
    { id:'cgpa',   label:'CGPA',   href:'cgpa.html' },
    { id:'faq',    label:'FAQ',    href:'faq.html' }
  ];

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

  function renderHeader(activeId){
    const nav = NAV_LINKS.map(l=>{
      const cls = l.id === activeId ? 'current' : '';
      return `<a href="${l.href}" class="${cls}">${l.label}</a>`;
    }).join('');
    return `
      <div class="site-header-inner">
        <a class="brand" href="index.html">
          <div class="brand-mark">M</div>
          <div class="brand-text">
            <span class="brand-name">MCA Grade Ledger</span>
            <span class="brand-tag">RVCE &middot; 2024 Scheme</span>
          </div>
        </a>
        <div class="site-nav">
          ${nav}
          <a class="ext" href="${REPO_URL}" target="_blank" rel="noopener">GitHub</a>
        </div>
      </div>`;
  }

  function renderBreadcrumb(trail){
    if(!trail || !trail.length) return '';
    const parts = trail.map((c,i)=>{
      const isLast = i === trail.length - 1;
      if(isLast || !c.href) return `<span class="current">${c.label}</span>`;
      return `<a href="${c.href}">${c.label}</a>`;
    });
    return `<nav class="breadcrumb" aria-label="Breadcrumb">` +
      parts.join(`<span class="sep">&rsaquo;</span>`) +
      `</nav>`;
  }

  function renderFooter(){
    const year = new Date().getFullYear();
    return `
      <div class="footer-grid">
        <div class="footer-col">
          <h4>About</h4>
          <p>An independent, unofficial CIE, SEE, grade and GPA calculator for RVCE MCA students, built from the published PG Academic Handbook and the 2024 scheme syllabus. Not affiliated with or endorsed by R V College of Engineering.</p>
        </div>
        <div class="footer-col">
          <h4>Contact</h4>
          <a href="${REPO_URL}" target="_blank" rel="noopener">GitHub repository</a>
          <a href="mailto:${EMAIL}">${EMAIL}</a>
        </div>
        <div class="footer-col">
          <h4>Reference</h4>
          <a href="${SYLLABUS_URL}" target="_blank" rel="noopener">RVCE scheme &amp; syllabus (official)</a>
          <a href="docs/MCA-2024-Scheme-Syllabus.pdf" target="_blank" rel="noopener">Syllabus PDF (this app)</a>
          <a href="faq.html">How the calculations work</a>
        </div>
      </div>
      <div class="legal">
        &copy; ${year} B R Lohith Raj. Licensed under Apache License 2.0.<br>
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
  }

  window.MCA.site = { mount, qs, withParams, REPO_URL, EMAIL, SYLLABUS_URL, NAV_LINKS };
})();
