/* ==========================================================================
   input-guard.js — stops any numeric field on the site from accepting a
   value outside its min/max, and shows an inline warning when it happens.
   Uses a single delegated, capture-phase listener on document, so it
   automatically covers every number input on every page — including ones
   created dynamically later (e.g. the CGPA table's SGPA fields) — without
   needing to be wired up per page or per field.
   ========================================================================== */
(function(){
  function warningFor(input){
    let bubble = input.nextElementSibling;
    if(!bubble || !bubble.classList || !bubble.classList.contains('input-warning')){
      bubble = document.createElement('div');
      bubble.className = 'input-warning';
      input.insertAdjacentElement('afterend', bubble);
    }
    return bubble;
  }

  function showWarning(input, message){
    const bubble = warningFor(input);
    bubble.textContent = message;
    bubble.classList.add('show');
    clearTimeout(input._inputGuardTimer);
    input._inputGuardTimer = setTimeout(()=> bubble.classList.remove('show'), 3500);
  }

  function hideWarning(input){
    const bubble = input.nextElementSibling;
    if(bubble && bubble.classList && bubble.classList.contains('input-warning')){
      bubble.classList.remove('show');
    }
  }

  // Capture phase so this runs — and clamps the value — before any other
  // 'input' listener on the same field (e.g. a page's own recompute()) sees
  // the event, so downstream calculations always see the clamped value.
  document.addEventListener('input', function(e){
    const el = e.target;
    if(!(el.tagName === 'INPUT' && el.type === 'number')) return;
    if(el.value === '' || el.value === '-'){ hideWarning(el); return; }

    const num = parseFloat(el.value);
    if(isNaN(num)) return;

    const max = el.getAttribute('max');
    const min = el.getAttribute('min');

    if(max !== null && num > parseFloat(max)){
      el.value = max;
      showWarning(el, `Maximum value allowed is ${max}`);
      return;
    }
    if(min !== null && num < parseFloat(min)){
      el.value = min;
      showWarning(el, `Minimum value allowed is ${min}`);
      return;
    }
    hideWarning(el);
  }, true);

  document.addEventListener('blur', function(e){
    const el = e.target;
    if(el.tagName === 'INPUT' && el.type === 'number') hideWarning(el);
  }, true);

  /* ---------- Scroll wheel: never changes a number field's value ----------
     Chrome/Edge/Firefox all bump a focused number input's value when the
     mouse wheel turns over it — surprising and easy to trigger by accident
     while scrolling the page. Blurring the field the instant a wheel event
     reaches it (while it's still the focused element) removes focus before
     the browser applies its native increment/decrement, so the value never
     changes; the page then scrolls normally since nothing is capturing the
     wheel event. */
  document.addEventListener('wheel', function(e){
    const el = e.target;
    if(el && el.tagName === 'INPUT' && el.type === 'number' && el === document.activeElement){
      el.blur();
    }
  }, { passive: true });

  /* ---------- Arrow Up/Down: move between fields instead of the value ----------
     By default Up/Down also bump a number input's value like the wheel
     does. Instead, treat them like Tab/Shift+Tab across the "current group"
     of number fields: on the CIE finalizer page each course is its own
     '.course-card', so navigation stays inside that subject's fields and
     never jumps into the next course; every other page has no such
     container, so navigation simply moves through all of that page's
     number fields in order. */
  function navGroup(el){
    return el.closest('.course-card') || el.closest('.modal') || document;
  }

  function navigableInputs(scope){
    return Array.prototype.slice.call(scope.querySelectorAll('input[type="number"]'))
      .filter(function(el){ return !el.disabled && el.offsetParent !== null; });
  }

  document.addEventListener('keydown', function(e){
    if(e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return;
    const el = e.target;
    if(!(el.tagName === 'INPUT' && el.type === 'number')) return;
    if(e.ctrlKey || e.metaKey || e.altKey || e.shiftKey) return;

    e.preventDefault();
    const list = navigableInputs(navGroup(el));
    const idx = list.indexOf(el);
    if(idx === -1) return;
    const target = list[e.key === 'ArrowUp' ? idx - 1 : idx + 1];
    if(target){ target.focus(); target.select(); }
  }, true);
})();
