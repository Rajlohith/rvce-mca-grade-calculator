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

  /* ---------- Beat Yourself + MCA Journey ---------- */
  const BJ_TARGET_III = 9.10;
  const BJ_SEM_LABELS = ['Semester I', 'Semester II', 'Semester III', 'Semester IV'];
  const BJ_CHECK_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';

  function bjTwo(n){ return n.toFixed(2); }
  function bjSigned(n){
    // round to 2dp first so e.g. -0.004 doesn't print as "-0.00"
    const v = Math.round(n * 100) / 100;
    const sign = v < 0 ? '-' : '+';
    return sign + Math.abs(v).toFixed(2);
  }

  function updateBeatJourney(){
    const rows = [...body.querySelectorAll('tr')];
    const doneFlags = rows.map(tr => tr.querySelector('.c-done').checked);
    const sgpas = rows.map(tr => parseFloat(tr.querySelector('.c-sgpa').value));

    const sem1 = (doneFlags[0] && !isNaN(sgpas[0])) ? sgpas[0] : null;
    const sem2 = (doneFlags[1] && !isNaN(sgpas[1])) ? sgpas[1] : null;

    const youNeed = sem2 !== null ? (BJ_TARGET_III - sem2) : null;
    const lastChange = (sem1 !== null && sem2 !== null) ? (sem2 - sem1) : null;

    const lastChangeClass = lastChange === null ? 'na' : (lastChange > 0 ? 'up' : (lastChange < 0 ? 'down' : 'flat'));
    const youNeedClass = youNeed === null ? 'na' : (youNeed <= 0 ? 'up' : 'accent');

    // Journey: first not-done semester is "current", earlier ones are "done", later ones are "upcoming".
    const firstIncomplete = doneFlags.indexOf(false);
    const allComplete = firstIncomplete === -1;

    let trackHtml = '';
    doneFlags.forEach((done, i) => {
      if(i > 0){
        trackHtml += `<div class="bj-connector${doneFlags[i-1] ? ' done' : ''}"></div>`;
      }
      let stateClass, statusText, dotInner;
      if(done){ stateClass = 'done'; statusText = 'Done'; dotInner = BJ_CHECK_ICON; }
      else if(i === firstIncomplete){ stateClass = 'current'; statusText = 'Current'; dotInner = String(i + 1); }
      else { stateClass = 'upcoming'; statusText = 'Upcoming'; dotInner = String(i + 1); }
      trackHtml += `
        <div class="bj-node ${stateClass}">
          <div class="bj-node-dot">${dotInner}</div>
          <div class="bj-node-text">
            <span class="bj-node-label">${BJ_SEM_LABELS[i]}</span>
            <span class="bj-node-status">${statusText}</span>
          </div>
        </div>`;
    });

    document.getElementById('beatJourney').innerHTML = `
      <div class="bj-section">
        <span class="bj-label">Progress</span>
        <div class="bj-stats">
          <div class="bj-stat${sem1 === null ? ' bj-empty' : ''}">
            <span class="bj-stat-label">Semester I</span>
            <span class="bj-stat-value">${sem1 === null ? '--' : bjTwo(sem1)}</span>
          </div>
          <div class="bj-stat${sem2 === null ? ' bj-empty' : ''}">
            <span class="bj-stat-label">Semester II</span>
            <span class="bj-stat-value">${sem2 === null ? '--' : bjTwo(sem2)}</span>
          </div>
          <div class="bj-stat bj-target">
            <span class="bj-stat-label">Semester III Target</span>
            <span class="bj-stat-value">${bjTwo(BJ_TARGET_III)}</span>
          </div>
        </div>
        <div class="bj-deltas">
          <div class="bj-delta">
            <span class="bj-delta-label">Last semester</span>
            <span class="bj-delta-value ${lastChangeClass}">${lastChange === null ? '--' : bjSigned(lastChange)}</span>
          </div>
          <div class="bj-delta">
            <span class="bj-delta-label">You need</span>
            <span class="bj-delta-value ${youNeedClass}">${youNeed === null ? '--' : (bjSigned(youNeed) + ' SGPA')}</span>
          </div>
        </div>
        <div class="bj-challenge"><b>Challenge:</b> Recover your SGPA this semester.</div>
      </div>
      <div class="bj-section">
        <span class="bj-label">MCA Journey</span>
        <div class="bj-track">${trackHtml}</div>
        ${allComplete ? '<div class="bj-track-note">MCA journey complete &mdash; all four semesters recorded.</div>' : ''}
      </div>`;
  }

  Object.keys(DATA.semesters).forEach(s=>{
    const credits = DATA.semesters[s].totalCredits;
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="check-col"><input type="checkbox" class="c-done"></td>
      <td>Semester ${s}</td>
      <td class="credit-col locked-credit">${credits}</td>
      <td class="sgpa-col"><input type="number" class="c-sgpa" min="0" max="10" step="0.01" value="0" disabled></td>`;
    tr.dataset.credits = credits;
    const done = tr.querySelector('.c-done');
    const sgpaInput = tr.querySelector('.c-sgpa');
    done.addEventListener('change', ()=>{
      sgpaInput.disabled = !done.checked;
      if(!done.checked) sgpaInput.value = 0;
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
      sgpaInput.value = 0;
      sgpaInput.disabled = true;
    });
    recompute();
  });

  recompute();
})();
