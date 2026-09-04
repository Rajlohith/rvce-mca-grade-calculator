/* ==========================================================================
   util.js — shared, dependency-free helpers used across the site.
   Loaded before every other MCA script (except data.js) on every page.
   ========================================================================== */
window.MCA = window.MCA || {};

(function(){
  /* ---------- HTML escaping ----------
     Used any time text that isn't a hardcoded string literal in our own
     source gets dropped into innerHTML. Nothing on this site currently
     accepts free-text user input that reaches innerHTML (course names,
     grades, etc. all come from data.js or fixed <select> options), but
     this exists as defense-in-depth for breadcrumbs / dynamic labels and
     for any future field that does take free text (e.g. course search). */
  function escapeHTML(str){
    if(str === null || str === undefined) return '';
    return String(str).replace(/[&<>"']/g, function(ch){
      switch(ch){
        case '&': return '&amp;';
        case '<': return '&lt;';
        case '>': return '&gt;';
        case '"': return '&quot;';
        case "'": return '&#39;';
      }
    });
  }

  /* Wrapper that escapes a value before assigning it as the sole content
     of an element — a slightly safer default than calling .innerHTML with
     a hand-built string when the value itself isn't already trusted markup. */
  function safeInnerHTML(el, text){
    if(!el) return;
    el.innerHTML = escapeHTML(text);
  }

  /* ---------- Epsilon-safe rounding ----------
     Plain `Math.round(n*100)/100` can occasionally read the wrong way when
     a chain of floating point additions/divisions lands a fraction of a
     cent below or above the "true" value (e.g. 135.2 arriving internally as
     135.19999999999998 or 135.20000000000002 after Quiz+Test+EL+Lab are
     summed). Adding a tiny epsilon before rounding corrects for that
     without ever rounding a value UP past where it actually is — this is
     ordinary round-half-up to 2 decimal places, never a ceiling. */
  const EPS = 1e-9;
  function round2(n){
    n = Number(n);
    if(!isFinite(n)) return 0;
    return Math.round((n + (n >= 0 ? EPS : -EPS)) * 100) / 100;
  }

  /* ---------- Toast ---------- */
  let toastTimer = null;
  function toast(message, tone){
    let el = document.getElementById('mca-toast');
    if(!el){
      el = document.createElement('div');
      el.id = 'mca-toast';
      el.setAttribute('role', 'status');
      el.setAttribute('aria-live', 'polite');
      document.body.appendChild(el);
    }
    el.textContent = message;
    el.className = 'mca-toast show' + (tone ? ' ' + tone : '');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(()=>{ el.className = 'mca-toast'; }, 2200);
  }

  /* ---------- Clipboard with feedback ----------
     Wraps navigator.clipboard.writeText and always surfaces a toast, so a
     silent failure (e.g. clipboard permission denied, insecure context)
     is never mistaken for a successful copy. */
  function copyWithFeedback(text, successMsg, failMsg){
    successMsg = successMsg || 'Copied to clipboard';
    failMsg = failMsg || 'Could not copy - copy it manually instead';
    if(!navigator.clipboard || !navigator.clipboard.writeText){
      toast(failMsg, 'error');
      return Promise.resolve(false);
    }
    return navigator.clipboard.writeText(text).then(()=>{
      toast(successMsg, 'ok');
      return true;
    }).catch(()=>{
      toast(failMsg, 'error');
      return false;
    });
  }

  /* ---------- Numeric-only input hardening ----------
     Every marks/credit/SGPA/CGPA field on the site is <input type="number">
     with min/max, and input-guard.js already clamps out-of-range values.
     This adds a second layer at the keystroke/paste level so letters,
     scientific notation ("e"), and extra signs/decimals never make it into
     the field in the first place, rather than being entered and then
     silently clamped.  Digits, one decimal point, and normal editing keys
     (backspace, delete, arrows, tab, home/end, ctrl/cmd shortcuts) are
     allowed; "-" is allowed only for fields whose min is negative. */
  const ALLOWED_KEYS = new Set([
    'Backspace','Delete','Tab','ArrowLeft','ArrowRight','ArrowUp','ArrowDown',
    'Home','End','Enter','Escape'
  ]);

  function isNumericField(el){
    return el && el.tagName === 'INPUT' && el.type === 'number';
  }

  /* Whether a numeric field should accept a decimal point at all. Every
     integer-only field on the site (marks, credits, etc.) is left at the
     HTML default step of 1; only the fields that are genuinely fractional
     (SGPA/CGPA, step="0.01") opt in with an explicit non-integer step, or
     step="any". This is also what decides the on-screen numeric keypad:
     see applyKeypadHints() in input-guard.js. */
  function allowsDecimal(el){
    const step = el.getAttribute('step');
    if(!step) return false;
    if(step === 'any') return true;
    const n = parseFloat(step);
    return !isNaN(n) && n % 1 !== 0;
  }

  function onKeydown(e){
    const el = e.target;
    if(!isNumericField(el)) return;
    if(e.ctrlKey || e.metaKey || e.altKey) return; // allow copy/paste/select-all etc.
    if(ALLOWED_KEYS.has(e.key)) return;

    const allowMinus = parseFloat(el.getAttribute('min')) < 0;
    const isDigit = /^[0-9]$/.test(e.key);
    const isDot = e.key === '.' && allowsDecimal(el) && el.value.indexOf('.') === -1;
    const isMinus = e.key === '-' && allowMinus && el.selectionStart === 0 && el.value.indexOf('-') === -1;

    if(!(isDigit || isDot || isMinus)) e.preventDefault();
  }

  function onPaste(e){
    const el = e.target;
    if(!isNumericField(el)) return;
    const text = (e.clipboardData || window.clipboardData).getData('text');
    const allowMinus = parseFloat(el.getAttribute('min')) < 0;
    const decimalPart = allowsDecimal(el) ? '\\.?\\d*' : '';
    const pattern = new RegExp('^' + (allowMinus ? '-?' : '') + '\\d*' + decimalPart + '$');
    if(!pattern.test(text)) e.preventDefault();
  }

  document.addEventListener('keydown', onKeydown, true);
  document.addEventListener('paste', onPaste, true);

  /* ---------- Equal-height course cards ----------
     The CIE&SEE and Final Grade pages group course cards by evaluation
     type (Theory+Lab / Theory Only / Lab Only), each in its own
     `.course-grid` under a shared label. Those groups have very
     different field counts (Theory+Lab has Quiz/Test/EL/Lab, Lab Only
     just has a couple of fields), so matching every card on the whole
     page to the single tallest one bloated the short groups with empty
     space. Instead, this equalizes heights independently within each
     `.course-grid` — cards stay uniform next to their own group's
     siblings (desktop/tablet only; mobile stacks full-width and needs
     no equalizing), while a short group like Lab Only stays compact.

     `container` can be the page-level wrapper holding several
     `.semester-group > .course-grid` blocks, or a single `.course-grid`
     directly — either way every group inside is measured on its own.

     Called once after initial render, and again whenever a card's own
     content changes size (result appears, error text, elective picker
     swap) or the viewport is resized, via the returned re-run function. */
  function equalizeCardHeights(container){
    if(!container) return function(){};
    const MOBILE_QUERY = '(max-width: 860px)';

    function run(){
      const groups = container.matches('.course-grid')
        ? [container]
        : Array.from(container.querySelectorAll('.course-grid'));
      if(!groups.length) return;
      const isMobile = window.matchMedia(MOBILE_QUERY).matches;
      groups.forEach(function(group){
        const cards = Array.from(group.querySelectorAll('.course-card'));
        if(!cards.length) return;
        cards.forEach(function(c){ c.style.minHeight = ''; });
        if(isMobile) return; // single-column: natural height is fine
        let max = 0;
        cards.forEach(function(c){ max = Math.max(max, c.offsetHeight); });
        cards.forEach(function(c){ c.style.minHeight = max + 'px'; });
      });
    }

    let raf = null;
    function schedule(){
      if(raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(run);
    }

    schedule();
    window.addEventListener('resize', schedule);
    const observer = new MutationObserver(schedule);
    observer.observe(container, { childList:true, subtree:true, characterData:true });

    return schedule;
  }

  window.MCA.util = { escapeHTML, safeInnerHTML, round2, toast, copyWithFeedback, allowsDecimal, equalizeCardHeights };
})();
