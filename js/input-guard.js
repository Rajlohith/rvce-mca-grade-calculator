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

  /* Belt-and-braces decimal guard: util.js already blocks a "." keystroke
     on integer-only fields, but that's a keydown-level check, and mobile
     virtual keyboards / autofill / IME composition don't reliably fire
     keydown for every character. Since this listener runs on 'input' (the
     value has already changed, however it changed), it catches anything
     that slips past the keystroke-level guard and truncates at the point
     instead of rounding, so a half-typed "12." doesn't jump to "12" while
     they're still about to type more digits. */
  function stripDecimalIfNotAllowed(el){
    if(window.MCA.util.allowsDecimal(el)) return;
    const dot = el.value.indexOf('.');
    if(dot !== -1) el.value = el.value.slice(0, dot);
  }

  // Capture phase so this runs — and clamps the value — before any other
  // 'input' listener on the same field (e.g. a page's own recompute()) sees
  // the event, so downstream calculations always see the clamped value.
  document.addEventListener('input', function(e){
    const el = e.target;
    if(!(el.tagName === 'INPUT' && el.type === 'number')) return;
    stripDecimalIfNotAllowed(el);
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
    const isPrev = e.key === 'ArrowUp';
    const isNext = e.key === 'ArrowDown' || e.key === 'Enter';
    if(!isPrev && !isNext) return;
    const el = e.target;
    if(!(el.tagName === 'INPUT' && el.type === 'number')) return;
    if(e.ctrlKey || e.metaKey || e.altKey || e.shiftKey) return;

    e.preventDefault();
    const list = navigableInputs(navGroup(el));
    const idx = list.indexOf(el);
    if(idx === -1) return;
    const target = list[isPrev ? idx - 1 : idx + 1];
    if(target){
      target.focus();
      target.select();
    } else if(e.key === 'Enter'){
      // Enter on the last field of the group: nothing to jump to, so
      // dismiss the on-screen keyboard instead of doing nothing.
      el.blur();
    }
  }, true);

  /* ---------- Mobile numeric keypad + "next field" keyboard hint ----------
     Two attributes drive the on-screen keyboard on phones:
       - inputmode: "decimal" shows a numeric pad WITH a "." key, for
         fields that allow a fractional value (SGPA/CGPA); "numeric" shows
         digits only, with no "." key at all, for every mark/credit field
         that's integer-only. type="number" alone doesn't reliably control
         this across browsers, so we set inputmode explicitly.
       - enterkeyhint: swaps the keyboard's action key for "Next"/"Go" (and
         wires it, via the Enter handler above, to actually move to the
         next field in the same group) or "Done" on the last field of a
         group, which just closes the keyboard.
     Every number input on this site is injected by page JS after this
     script has already run (course cards, SGPA rows, etc.), so a
     MutationObserver — rather than a one-off scan — is what actually
     catches them. */
  function applyKeypadHints(el){
    if(!(el.tagName === 'INPUT' && el.type === 'number')) return;
    el.setAttribute('inputmode', window.MCA.util.allowsDecimal(el) ? 'decimal' : 'numeric');
  }

  function refineEnterKeyHint(el){
    const list = navigableInputs(navGroup(el));
    const idx = list.indexOf(el);
    const isLast = idx === -1 || idx === list.length - 1;
    el.setAttribute('enterkeyhint', isLast ? 'done' : 'next');
  }

  function scanForNumberInputs(node){
    if(!node || node.nodeType !== 1) return;
    if(node.matches && node.matches('input[type="number"]')) applyKeypadHints(node);
    if(node.querySelectorAll){
      node.querySelectorAll('input[type="number"]').forEach(applyKeypadHints);
    }
  }

  scanForNumberInputs(document.body);
  new MutationObserver(function(mutations){
    mutations.forEach(function(m){ m.addedNodes.forEach(scanForNumberInputs); });
  }).observe(document.body, { childList: true, subtree: true });

  // enterkeyhint depends on the field's position within its group, which
  // can shift as cards/rows are added or removed — so it's (re)computed
  // right as a field is focused rather than baked in once up front.
  document.addEventListener('focusin', function(e){
    const el = e.target;
    if(el.tagName === 'INPUT' && el.type === 'number') refineEnterKeyHint(el);
  }, true);
})();
