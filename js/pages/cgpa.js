(function(){
  const { mount } = window.MCA.site;
  const { computeCGPA } = window.MCA.engine;
  const { fmt } = window.MCA.grading;
  const DATA = window.MCA.DATA;

  mount({
    active: 'cgpa',
    trail: [
      { label:'Home', href:'../index.html' },
      { label:'CGPA' }
    ]
  });
  document.getElementById('cgpaIconBadge').innerHTML = window.MCA.icons.trendingUp;
  document.getElementById('bjIconBadge').innerHTML = window.MCA.icons.layers;

  const body = document.querySelector('#cgTable tbody');
  const SEM_KEYS = Object.keys(DATA.semesters); // e.g. ['I','II','III','IV']
  const ROMAN = SEM_KEYS; // index 0 -> 'I', index 1 -> 'II', ...

  /* ---------- Beat Yourself + MCA Journey ---------- */
  const targetSemSelect = document.getElementById('bjTargetSem');
  const targetValInput = document.getElementById('bjTargetVal');
  const BJ_CHECK_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';

  // Target semester: which semester you want a CGPA goal for. All
  // semesters up to and including it factor into the projection.
  targetSemSelect.innerHTML = SEM_KEYS.map((label, idx) =>
    `<option value="${idx + 1}">Semester ${label}</option>`
  ).join('');
  targetSemSelect.value = Math.min(3, SEM_KEYS.length); // default: 3rd semester (or the last one, if fewer)

  function bjTwo(n){ return n.toFixed(2); }
  function bjClamp(v){
    v = parseFloat(v);
    if(isNaN(v)) return 0;
    return Math.max(0, Math.min(10, v));
  }

  function updateBeatJourney(){
    const rows = [...body.querySelectorAll('tr')];
    const doneFlags = rows.map(tr => tr.querySelector('.c-done').checked);
    const sgpas = rows.map(tr => parseFloat(tr.querySelector('.c-sgpa').value));
    const credits = rows.map(tr => parseFloat(tr.dataset.credits));
    const values = rows.map((tr, i) => (doneFlags[i] && !isNaN(sgpas[i])) ? sgpas[i] : null);

    // Target semester (1-based, e.g. 3 = Semester III) and the semesters
    // that factor into it: every semester up to and including the target.
    const targetSem = Math.max(1, Math.min(SEM_KEYS.length, parseInt(targetSemSelect.value, 10) || 3));
    const targetSet = targetValInput.value.trim() !== '';
    const targetVal = bjClamp(targetValInput.value);
    const requiredCount = targetSem;

    // Real, credit-weighted CGPA math (same computeCGPA() the ledger above
    // uses) rather than a flat semester-to-semester approximation: the
    // required semesters that are done tell us where things stand, and
    // what's still needed from the ones that aren't.
    const doneRows = [];
    let pendingCredits = 0;
    for(let i = 0; i < requiredCount; i++){
      if(values[i] !== null) doneRows.push({ sgpa: values[i], credits: credits[i] });
      else pendingCredits += credits[i];
    }
    const totalCreditsToTarget = credits.slice(0, requiredCount).reduce((a, b) => a + b, 0);
    const current = computeCGPA(doneRows); // { totalCredits, cgpa }
    const pendingCount = requiredCount - doneRows.length;

    let summaryHtml = '';
    if(requiredCount > 0 && targetSet){
      const romanUpTo = i => `Semester ${ROMAN[i]}`;
      if(pendingCount === 0){
        // Every required semester is in: compare the real CGPA to the goal.
        const diff = current.cgpa - targetVal;
        const met = diff >= -0.0049; // guard against float noise right at the line
        summaryHtml = `<div class="bj-summary ${met ? 'ok' : 'warn'}">Your CGPA through ${romanUpTo(requiredCount - 1)} is <b>${bjTwo(current.cgpa)}</b> - ${met
          ? `you've met your <b>${bjTwo(targetVal)}</b> target for Semester ${ROMAN[targetSem - 1]}.`
          : `that's <b>${bjTwo(Math.abs(diff))}</b> short of your <b>${bjTwo(targetVal)}</b> target for Semester ${ROMAN[targetSem - 1]}.`}</div>`;
        if(met && window.MCA.achievements){
          window.MCA.achievements.track('beat_target_met', { targetSem });
        }
      } else {
        const avgNeeded = (targetVal * totalCreditsToTarget - current.totalCredits * current.cgpa) / pendingCredits;
        const pendingLabels = [];
        let lastDoneIdx = -1;
        for(let i = 0; i < requiredCount; i++){
          if(values[i] === null) pendingLabels.push(ROMAN[i]);
          else lastDoneIdx = i;
        }
        const nameList = pendingLabels.length === 1
          ? `Semester ${pendingLabels[0]}`
          : `Semesters ${pendingLabels.slice(0, -1).join(', ')} and ${pendingLabels[pendingLabels.length - 1]}`;
        const soFar = lastDoneIdx >= 0
          ? `Your CGPA through ${romanUpTo(lastDoneIdx)} is <b>${bjTwo(current.cgpa)}</b>. `
          : '';
        summaryHtml = `<div class="bj-summary">${soFar}You'll need to average <b>${bjTwo(avgNeeded)}</b> SGPA across ${nameList} to reach a CGPA of <b>${bjTwo(targetVal)}</b> by Semester ${ROMAN[targetSem - 1]}.</div>`;
      }
    }

    // Journey: first not-done semester is "current", earlier ones are "done", later ones are "upcoming".
    const firstIncomplete = doneFlags.indexOf(false);
    const allComplete = firstIncomplete === -1;

    // Only celebrate a finished journey if it actually clears the minimum
    // CGPA (5.00, Second Class) — computed across all four semesters.
    let overallPass = false;
    if(allComplete){
      const allRows = rows.map((tr, i) => ({ sgpa: values[i], credits: credits[i] }));
      overallPass = computeCGPA(allRows).cgpa >= 5;
    }

    let trackHtml = '';
    const lastIdx = doneFlags.length - 1;
    doneFlags.forEach((done, i) => {
      let stateClass, statusText, dotInner;
      if(done){ stateClass = 'done'; statusText = 'Done'; dotInner = BJ_CHECK_ICON; }
      else if(i === firstIncomplete){ stateClass = 'current'; statusText = 'Current'; dotInner = String(i + 1); }
      else { stateClass = 'upcoming'; statusText = 'Upcoming'; dotInner = String(i + 1); }
      // Alternates left/right (mobile) and above/below (desktop) starting
      // with Semester I on the "a" side — a zigzag roadmap instead of one
      // long straight list. The box itself reuses the same "Progress"
      // stat-card look (label + big SGPA value) from higher up the page.
      const side = i % 2 === 0 ? 'alt-a' : 'alt-b';
      // The spine line is drawn per-node (see .bj-node::before in
      // components.css), split at the node's own dot into an incoming
      // half (from the previous dot) and an outgoing half (to the next
      // dot). Each half is colored teal only if the semester it comes
      // FROM is done; the very first/last half is clipped away entirely
      // by the CSS, so its color here is irrelevant.
      const lineLeft = i > 0 ? (doneFlags[i - 1] ? 'var(--teal)' : 'var(--line-strong)') : 'transparent';
      const lineRight = i < lastIdx ? (done ? 'var(--teal)' : 'var(--line-strong)') : 'transparent';
      trackHtml += `
        <div class="bj-node ${stateClass} ${side}" style="--bj-line-left:${lineLeft};--bj-line-right:${lineRight}">
          <div class="bj-node-dot">${dotInner}</div>
          <div class="bj-node-box bj-stat${values[i] === null ? ' bj-empty' : ''}">
            <span class="bj-stat-label">Semester ${ROMAN[i]}</span>
            <span class="bj-stat-value">${values[i] === null ? '--' : bjTwo(values[i])}</span>
            <span class="bj-node-status">${statusText}</span>
          </div>
        </div>`;
    });

    document.getElementById('bjSummary').innerHTML = summaryHtml;
    document.getElementById('beatJourney').innerHTML = `
      <div class="bj-section">
        <span class="bj-label">MCA Journey</span>
        <div class="bj-track">${trackHtml}</div>
        ${allComplete && overallPass ? '<div class="bj-track-note">MCA journey complete - all four semesters recorded.</div>' : ''}
      </div>`;
  }

  targetSemSelect.addEventListener('change', updateBeatJourney);
  targetValInput.addEventListener('input', updateBeatJourney);

  Object.keys(DATA.semesters).forEach(s=>{
    const credits = DATA.semesters[s].totalCredits;
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="check-col"><input type="checkbox" class="c-done"></td>
      <td>Semester ${s}</td>
      <td class="credit-col locked-credit">${credits}</td>
      <td class="sgpa-col"><input type="number" class="c-sgpa" min="0" max="10" step="0.01" placeholder="0.00" disabled></td>`;
    tr.dataset.credits = credits;
    const done = tr.querySelector('.c-done');
    const sgpaInput = tr.querySelector('.c-sgpa');
    done.addEventListener('change', ()=>{
      sgpaInput.disabled = !done.checked;
      if(!done.checked) sgpaInput.value = '';
      recompute();
    });
    sgpaInput.addEventListener('input', recompute);
    body.appendChild(tr);
  });

  function recompute(){
    const rows = [...body.querySelectorAll('tr')]
      .filter(tr => tr.querySelector('.c-done').checked)
      .map(tr => ({ sgpa: tr.querySelector('.c-sgpa').value, credits: tr.dataset.credits }));

    const r = computeCGPA(rows);
    document.getElementById('cgResult').innerHTML = `
      <div style="flex:1">
        <div class="breakdown">
          <div class="row"><span>Completed semesters counted</span><span>${rows.length} / ${Object.keys(DATA.semesters).length}</span></div>
          <div class="row total"><span>CGPA</span><span>${fmt(r.cgpa)}</span></div>
          <div class="row"><span>Projected class</span><span>${r.cls}</span></div>
        </div>
      </div>`;
    if(window.MCA.achievements){
      window.MCA.achievements.track('cgpa_calculated', {
        cgpa: r.cgpa, count: rows.length, total: Object.keys(DATA.semesters).length
      });
    }
    updateBeatJourney();
  }

  const progressRoot = document.getElementById('app');
  function restoreProgress(){
    window.MCA.progress.loadProgress('cgpa', progressRoot).then(restored=>{
      if(restored) recompute();
    });
  }
  restoreProgress();
  document.addEventListener('signed-in', restoreProgress);

  document.getElementById('saveProgressBtn').addEventListener('click', ()=>{
    window.MCA.progress.saveProgress('cgpa', progressRoot);
  });

  document.getElementById('resetAllBtn').addEventListener('click', ()=>{
    body.querySelectorAll('tr').forEach(tr=>{
      const done = tr.querySelector('.c-done');
      const sgpaInput = tr.querySelector('.c-sgpa');
      done.checked = false;
      sgpaInput.value = '';
      sgpaInput.disabled = true;
    });
    recompute();
    if(window.MCA.achievements) window.MCA.achievements.track('reset_used', { page:'cgpa' });
  });

  recompute();
})();
