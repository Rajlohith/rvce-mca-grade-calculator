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
})();
