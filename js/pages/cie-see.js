(function(){
  const { qs, withParams, mount } = window.MCA.site;
  const { coursesFor } = window.MCA.courses;
  const { computeCIE, allGradeRequirements } = window.MCA.engine;
  const { fmt, renderGradeScale } = window.MCA.grading;
  const DATA = window.MCA.DATA;

  const scheme = qs('scheme'), semester = qs('semester');
  const validSem = semester && DATA.semesters[semester];
  if(scheme !== '2024' || !validSem){ window.location.replace('scheme.html'); return; }

  mount({
    active: 'start',
    trail: [
      { label:'Home', href:'../index.html' },
      { label:'Scheme', href:'scheme.html' },
      { label:'2024 Scheme', href: withParams('semester.html', { scheme }) },
      { label:`Semester ${semester}`, href: withParams('tools.html', { scheme, semester }) },
      { label:'CIE & SEE' }
    ]
  });
  document.getElementById('toolEyebrow').textContent = `Semester ${semester} \u00b7 2024 Scheme`;
  document.getElementById('gradeScaleStrip').innerHTML = renderGradeScale();

  // Semester I keeps the original Lab(/40)+Lab EL(/10) split. Semester II
  // and III use the PBL-merged breakdown instead.
  const labScheme = (semester === 'II' || semester === 'III') ? 'sem23' : 'sem1';
  const NON_STANDARD_NAMES = { project:'Project', internship:'Internship', nptel:'NPTEL / online course' };
  const courses = coursesFor(semester);
  const cardState = new Map(); // course code -> { total, max, type }

  const COPY_SVG = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>`;

  function quizTestBlock(){
    return `
      <div class="field-row-2">
        <div class="field"><label>Quiz 1 <span class="hint">/10</span></label><input type="number" class="f-q1 req" min="0" max="10" value=""></div>
        <div class="field"><label>Quiz 2 <span class="hint">/10</span></label><input type="number" class="f-q2 req" min="0" max="10" value=""></div>
      </div>
      <div class="field-row-2">
        <div class="field"><label>Quiz 3 <span class="hint">/10</span></label><input type="number" class="f-q3 req" min="0" max="10" value=""></div>
      </div>
      <div class="field-row-2">
        <div class="field"><label>Test 1 <span class="hint">/50</span></label><input type="number" class="f-t1 req" min="0" max="50" value=""></div>
        <div class="field"><label>Test 2 <span class="hint">/50</span></label><input type="number" class="f-t2 req" min="0" max="50" value=""></div>
      </div>
      <div class="field-row-2">
        <div class="field"><label>Test 3 <span class="hint">/50</span></label><input type="number" class="f-t3 req" min="0" max="50" value=""></div>
      </div>`;
  }

  function fieldsHTML(type){
    if(type==='theory'){
      return quizTestBlock() + `
        <div class="field-row">
          <div class="field"><label>Experiential Learning <span class="hint">/40</span></label><input type="number" class="f-el req" min="0" max="40" value=""></div>
        </div>`;
    }
    if(type==='theory-lab' && labScheme==='sem1'){
      return quizTestBlock() + `
        <div class="field-row">
          <div class="field"><label>Experiential Learning <span class="hint">/40</span></label><input type="number" class="f-el req" min="0" max="40" value=""></div>
        </div>
        <div class="field-row">
          <div class="field"><label>Lab (record + test) <span class="hint">/50</span></label><input type="number" class="f-lab req" min="0" max="50" value=""></div>
        </div>`;
    }
    if(type==='theory-lab' && labScheme==='sem23'){
      return quizTestBlock() + `
        <div class="field-row">
          <div class="field"><label>PBL <span class="hint">/40</span></label><input type="number" class="f-pbl req" min="0" max="40" value=""></div>
          <div class="field"><label>Lab / Practical CIE <span class="hint">/50</span></label><input type="number" class="f-labsem23 req" min="0" max="50" value=""></div>
        </div>`;
    }
    if(type==='lab'){
      return `
        <div class="field-row">
          <div class="field"><label>Lab (record + test) <span class="hint">/40</span></label><input type="number" class="f-lab req" min="0" max="40" value=""></div>
          <div class="field"><label>Experiential Learning <span class="hint">/10</span></label><input type="number" class="f-ellab req" min="0" max="10" value=""></div>
        </div>`;
    }
    return '';
  }

  function cardTitleHTML(course){
    if(course.electives && course.electives.length){
      const opts = course.electives.map(e=>`<option value="${e.code}">${e.code} \u2014 ${e.title}</option>`).join('');
      return `<h3>${course.title}</h3><select class="course-elective-pick">${opts}</select>`;
    }
    return `<h3>${course.title}</h3><span class="hint">${course.code}</span>`;
  }

  function cardHTML(course){
    const isNonStandard = ['project','internship','nptel'].includes(course.type);
    const head = `
      <div class="course-card-head">
        <div>${cardTitleHTML(course)}</div>
        <span class="credit-badge">${course.credits} Credit</span>
      </div>`;

    if(isNonStandard){
      return `<div class="course-card" data-code="${course.code}" data-type="${course.type}">
        ${head}
        <div class="callout locked">${NON_STANDARD_NAMES[course.type] || 'This course'} doesn't follow the standard CIE/SEE split, so it isn't modeled here. Check the syllabus or your course coordinator for how it's evaluated.</div>
      </div>`;
    }

    return `<div class="course-card" data-code="${course.code}" data-type="${course.type}">
      ${head}
      ${fieldsHTML(course.type)}
      <div class="toolbar">
        <button type="button" class="btn amber full calc-btn">Calculate CIE</button>
      </div>
      <div class="course-result"></div>
      <button type="button" class="locked-btn see-btn" disabled>SEE Marks Required</button>
    </div>`;
  }

  const grid = document.getElementById('courseGrid');
  grid.innerHTML = courses.map(cardHTML).join('');

  // Restore any previously saved progress for this semester's CIE page.
  // Firebase's auth state resolves asynchronously (it loads its SDK from
  // a CDN and restores the session after that), so this can't just run
  // once at page load — it also needs to re-run the moment sign-in
  // actually completes, in case that happens after this script runs.
  function restoreProgress(){
    window.MCA.progress.loadProgress(`cie-see:${semester}`, grid);
  }
  restoreProgress();
  document.addEventListener('signed-in', restoreProgress);

  document.getElementById('saveProgressBtn').addEventListener('click', ()=>{
    window.MCA.progress.saveProgress(`cie-see:${semester}`, grid);
  });

  function readVal(card, cls){
    const el = card.querySelector('.'+cls);
    return el ? el.value : 0;
  }

  function courseDisplayTitle(card, course){
    const pick = card.querySelector('.course-elective-pick');
    if(pick) return pick.options[pick.selectedIndex].textContent;
    return course.title;
  }

  function validateCard(card){
    const reqInputs = [...card.querySelectorAll('input.req')];
    const missing = reqInputs.filter(inp => inp.value === '' || inp.value === null);
    reqInputs.forEach(inp => inp.classList.toggle('error', missing.includes(inp)));
    return missing;
  }

  function calculateCard(card){
    const missing = validateCard(card);
    if(missing.length){
      card.querySelector('.course-result').innerHTML = `<div class="callout error">Fill in every mark for this course before calculating. ${missing.length} field${missing.length===1?'':'s'} still empty.</div>`;
      const seeBtn = card.querySelector('.see-btn');
      seeBtn.disabled = true;
      seeBtn.classList.remove('ready');
      missing[0].focus();
      return;
    }
    const code = card.dataset.code;
    const type = card.dataset.type;
    const vals = {
      q1: readVal(card,'f-q1'), q2: readVal(card,'f-q2'), q3: readVal(card,'f-q3'),
      t1: readVal(card,'f-t1'), t2: readVal(card,'f-t2'), t3: readVal(card,'f-t3'),
      el: readVal(card,'f-el'),
      elLab: readVal(card,'f-ellab'),
      lab: (type==='theory-lab' && labScheme==='sem23') ? readVal(card,'f-labsem23') : readVal(card,'f-lab'),
      pbl: readVal(card,'f-pbl')
    };
    const cieLabScheme = type==='theory-lab' ? labScheme : undefined;
    const r = computeCIE(type, vals, cieLabScheme);
    // The SEE-requirement tools below key off the department's finalized
    // (ceiling-rounded) CIE, not the raw decimal — see the note on
    // computeCIE's finalTotal in engine.js.
    cardState.set(code, { total: r.finalTotal, rawTotal: r.total, max: r.max, type, dx: r.dx });

    // Save CIE to Firestore if user is signed in
    if(window.MCA.isSignedIn()){
      window.MCA.saveMarks(`${code}:cie`, {
        raw: r.total,
        final: r.finalTotal,
        max: r.max,
        pct: r.pct,
        finalPct: r.finalPct,
        timestamp: new Date().toISOString()
      }).then(() => {
        window.MCA.util.toast('CIE saved', 'ok');
      }).catch(err => {
        console.error('Failed to save CIE:', err);
        window.MCA.util.toast('Could not save CIE to your account', 'error');
      });
    }

    const roundingNote = `<div class="rounding-note">Marks are rounded to 2 decimal places using standard rounding (nearest hundredth) &mdash; never rounded up beyond that.</div>`;
    const finalNote = `<div class="callout" style="margin-top:10px;">Your department finalizes CIE by rounding <b>up</b> to the next whole mark (ceiling) &mdash; so ${fmt(r.total)} becomes <b>${r.finalTotal}</b>, the same as any value between ${Math.floor(r.total)} and ${r.finalTotal} would. This finalized number, not the raw decimal above, is what's used for the SEE requirements below.</div>`;

    card.querySelector('.course-result').innerHTML = `
      <div class="breakdown">
        ${r.rows.map(row=>`<div class="row"><span>${row[0]}</span><span>${row[1]}</span></div>`).join('')}
        <div class="row total"><span>Finalized CIE</span><span>${fmt(r.total)} / ${r.max} (${fmt(r.pct)}%)</span></div>
        <div class="row total"><span>Final CIE (used for SEE)</span><span>${r.finalTotal} / ${r.max} (${r.finalPct}%)</span></div>
      </div>
      <div class="callout${r.dx ? ' dx' : ''}" style="margin-top:10px;">${r.note}</div>
      ${finalNote}
      ${roundingNote}`;

    const seeBtn = card.querySelector('.see-btn');
    if(r.dx){
      // Section 4.2: falling short of the CIE floor means the course is
      // marked 'DX' — the student isn't eligible to sit the SEE for it at
      // all, so the SEE Marks Required tool would be showing a meaningless
      // "what SEE do I need" projection. Keep the button disabled and say
      // why, instead of letting them proceed. See Bug #3.
      seeBtn.disabled = true;
      seeBtn.classList.remove('ready');
      seeBtn.textContent = 'Not Eligible for SEE (DX)';
    } else {
      seeBtn.disabled = false;
      seeBtn.classList.add('ready');
      seeBtn.textContent = 'SEE Marks Required';
    }
  }

  grid.addEventListener('click', (e)=>{
    const calcBtn = e.target.closest('.calc-btn');
    if(calcBtn){ calculateCard(calcBtn.closest('.course-card')); return; }
    const seeBtn = e.target.closest('.see-btn');
    if(seeBtn && !seeBtn.disabled) openSeeModal(seeBtn.closest('.course-card'));
  });

  grid.addEventListener('input', (e)=>{
    if(e.target.matches('input.req') && e.target.value !== '') e.target.classList.remove('error');
  });

  document.getElementById('resetAllBtn').addEventListener('click', ()=>{
    grid.querySelectorAll('input[type=number]').forEach(inp => { inp.value = ''; inp.classList.remove('error'); });
    grid.querySelectorAll('.course-result').forEach(r => r.innerHTML = '');
    grid.querySelectorAll('.see-btn').forEach(b => { b.disabled = true; b.classList.remove('ready'); b.textContent = 'SEE Marks Required'; });
    cardState.clear();
  });

  /* ---------- SEE Requirements modal ---------- */
  let currentModalCode = null;

  const overlay = document.getElementById('seeModalOverlay');
  const modalSubject = document.getElementById('seeModalSubject');
  const modalCie = document.getElementById('seeModalCie');
  const modalSeeOf = document.getElementById('seeModalSeeOf');
  const modalLabBox = document.getElementById('seeModalLabBox');
  const modalRows = document.getElementById('seeModalRows');

  function openSeeModal(card){
    const code = card.dataset.code;
    const state = cardState.get(code);
    if(!state) return;
    currentModalCode = code;

    const course = courses.find(c => c.code === code);
    modalSubject.textContent = courseDisplayTitle(card, course);
    modalCie.textContent = `${fmt(state.total)} / ${state.max}`;

    const seeMax = state.type==='theory' ? 100 : state.type==='theory-lab' ? 150 : 50;
    modalSeeOf.textContent = `SEE marks out of ${seeMax}`;

    if(state.type==='theory-lab'){
      modalLabBox.innerHTML = `
        <div class="lab-see-box">
          <label for="labSeeFixedInput">Set Lab SEE Marks (Optional)</label>
          <input type="number" id="labSeeFixedInput" min="0" max="50" placeholder="0">
          <span class="hint">Max 50 marks. Enter to see the adjusted theory SEE requirement.</span>
        </div>`;
      document.getElementById('labSeeFixedInput').addEventListener('input', renderModalRows);
    } else {
      modalLabBox.innerHTML = '';
    }

    renderModalRows();
    overlay.classList.remove('hidden');
  }

  function renderModalRows(){
    const state = cardState.get(currentModalCode);
    if(!state) return;
    const labInput = document.getElementById('labSeeFixedInput');
    const labSeeFixed = (labInput && labInput.value !== '') ? parseFloat(labInput.value) : null;
    const reqs = allGradeRequirements(state.type, state.total, state.max, labSeeFixed);
    modalRows.innerHTML = reqs.map(r => `
      <div class="grade-req-row ${r.achievable ? '' : 'unreachable'}">
        <div class="gp-circle">${r.gp}</div>
        <div class="gr-body">
          <div class="gr-name">Grade ${r.grade}</div>
          <div class="gr-marks">${r.label}${r.achievable ? '' : ' &mdash; not reachable'}</div>
        </div>
        <button type="button" class="gr-copy" title="Copy" data-copy="Grade ${r.grade}: ${r.label}">${COPY_SVG}</button>
      </div>`).join('') +
      `<div class="rounding-note">SEE figures are rounded to 2 decimal places using standard rounding (nearest hundredth) &mdash; never rounded up beyond that.</div>`;
  }

  modalRows.addEventListener('click', (e)=>{
    const btn = e.target.closest('.gr-copy');
    if(!btn) return;
    window.MCA.util.copyWithFeedback(btn.dataset.copy, 'Requirement copied', 'Could not copy — copy it manually');
  });

  document.getElementById('copyAllBtn').addEventListener('click', (e)=>{
    const state = cardState.get(currentModalCode);
    if(!state) return;
    const labInput = document.getElementById('labSeeFixedInput');
    const labSeeFixed = (labInput && labInput.value !== '') ? parseFloat(labInput.value) : null;
    const reqs = allGradeRequirements(state.type, state.total, state.max, labSeeFixed);
    const text = `${modalSubject.textContent} \u2014 CIE ${modalCie.textContent}\n` +
      reqs.map(r => `Grade ${r.grade} (${r.gp}): ${r.label}${r.achievable ? '' : ' - not reachable'}`).join('\n');
    const btn = e.currentTarget;
    window.MCA.util.copyWithFeedback(text, 'All requirements copied', 'Could not copy — copy them manually').then(ok=>{
      if(!ok) return;
      const original = btn.textContent;
      btn.textContent = 'Copied';
      setTimeout(()=>{ btn.textContent = original; }, 1500);
    });
  });

  function closeModal(){ overlay.classList.add('hidden'); currentModalCode = null; }
  document.getElementById('seeModalClose').addEventListener('click', closeModal);
  overlay.addEventListener('click', (e)=>{ if(e.target === overlay) closeModal(); });
  // Escape key closes the modal from anywhere on the page, matching
  // standard modal behaviour (previously only the × button and backdrop
  // click worked).
  document.addEventListener('keydown', (e)=>{
    if(e.key === 'Escape' && !overlay.classList.contains('hidden')) closeModal();
  });
})();
