(function(){
  // The three quick-link cards below (CGPA / Guide / Syllabus PDF) are now
  // rendered statically in index.html instead of being injected here after
  // load. Injecting them at runtime left the #quickLinks container empty at
  // first paint with no reserved height, so the cards popping in shifted the
  // disclaimer banner and footer down the page — the single largest
  // Cumulative Layout Shift contributor Lighthouse was flagging on this
  // page. Only the shared header/footer mount (which reserves its own
  // height in CSS, see .site-header min-height in layout.css) still needs
  // to happen from JS.
  window.MCA.site.mount({ active: 'home' });
})();
