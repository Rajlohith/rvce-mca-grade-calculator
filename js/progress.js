/* ==========================================================================
   progress.js — generic "Save Progress" / restore for calculator pages.
   Works across different page layouts (course-card grids, table rows,
   plain row lists) by deriving a stable key per field instead of requiring
   every page to hand-roll its own serialization.
   ========================================================================== */
window.MCA = window.MCA || {};

(function(){
  /* Every value-carrying field we care about: number inputs, selects,
     and checkboxes. Text inputs are deliberately excluded (there aren't
     any marks/grade fields that use them). */
  const FIELD_SELECTOR = 'input[type="number"], input[type="checkbox"], select';

  function stableKey(field, index){
    const scope = field.closest('[data-code]');
    const cls = [...field.classList].find(c => c.startsWith('f-') || c.startsWith('sgpa-') || c.startsWith('c-'))
      || field.name || field.id || field.type;
    if(scope) return `${scope.dataset.code}::${cls}`;
    const row = field.closest('tr, .sgpa-row');
    if(row){
      // Rows render in a fixed order per semester (course list / semester
      // list is static), so the row's position is a stable key even
      // without a data-code attribute.
      const rowIndex = [...row.parentElement.children].indexOf(row);
      return `row${rowIndex}::${cls}`;
    }
    return `field${index}::${cls}`;
  }

  function fieldValue(field){
    if(field.type === 'checkbox') return field.checked;
    return field.value;
  }

  function applyFieldValue(field, value){
    if(field.type === 'checkbox'){
      field.checked = !!value;
      field.dispatchEvent(new Event('change', { bubbles:true }));
    } else {
      field.value = value;
      field.dispatchEvent(new Event(field.tagName === 'SELECT' ? 'change' : 'input', { bubbles:true }));
    }
  }

  /* Collects every relevant field under `root` into a flat { key: value } object. */
  function collect(root){
    const data = {};
    [...root.querySelectorAll(FIELD_SELECTOR)].forEach((field, i)=>{
      data[stableKey(field, i)] = fieldValue(field);
    });
    return data;
  }

  /* Re-applies a previously collected object onto the same page shape.
     Silently skips any key that no longer matches a field (e.g. the
     course list changed) rather than throwing. */
  function apply(root, data){
    if(!data) return;
    [...root.querySelectorAll(FIELD_SELECTOR)].forEach((field, i)=>{
      const key = stableKey(field, i);
      if(Object.prototype.hasOwnProperty.call(data, key)){
        applyFieldValue(field, data[key]);
      }
    });
  }

  function saveProgress(pageKey, root){
    if(!window.MCA.isSignedIn()){
      window.MCA.util.toast('Sign in with your RVCE Google account to save progress', 'error');
      return Promise.resolve(false);
    }
    const data = collect(root);
    return window.MCA.saveMarks(`progress:${pageKey}`, {
      fields: data,
      savedAt: new Date().toISOString()
    }).then(()=>{
      window.MCA.util.toast('Progress saved to your account', 'ok');
      if(window.MCA.achievements) window.MCA.achievements.track('progress_saved', { pageKey });
      return true;
    }).catch(()=>false);
  }

  function loadProgress(pageKey, root){
    if(!window.MCA.isSignedIn()) return Promise.resolve(false);
    return window.MCA.getMarks(`progress:${pageKey}`).then(saved=>{
      if(saved && saved.fields){
        apply(root, saved.fields);
        return true;
      }
      return false;
    });
  }

  window.MCA.progress = { collect, apply, saveProgress, loadProgress };
})();
