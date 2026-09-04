(function(){
  const { qs, withParams, mount } = window.MCA.site;
  const { coursesFor } = window.MCA.courses;
  const { computeSGPA, blendCGPA } = window.MCA.engine;
  const { fmt, bands, transitional } = window.MCA.grading;
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
      { label:'Final SGPA' }
    ]
  });

  const courses = coursesFor(semester);
  const totalCredits = DATA.semesters[semester].totalCredits;
  document.getElementById('sgpaCardTitle').textContent = `Semester ${semester} SGPA`;
  document.getElementById('sgpaCreditBadge').textContent = `${totalCredits} Credits`;

  if(window.MCA.achievements) window.MCA.achievements.track('tool_page_viewed', { tool:'final-gpa', semester });

  // Standard grades combine letter + point ("A+ (9)"); transitional grades
  // (W, I, X, DX, AB) don't carry a grade point, so they're shown plain.
  const gradeOptsHTML = () => {
    const placeholder = `<option value="" disabled selected>Select Grade</option>`;
    const standard = bands.map(b => `<option value="${b.grade}">${b.grade} (${b.gp})</option>`).join('');
    const trans = transitional.map(g => `<option value="${g}">${g}</option>`).join('');
    return placeholder + standard + trans;
  };

  const rowsEl = document.getElementById('sgpaRows');
  rowsEl.innerHTML = courses.map(c=>{
    const info = c.electives && c.electives.length
      ? `<div class="sgpa-title">${c.title}</div>
         <select class="sgpa-elective-pick">${c.electives.map(e=>`<option value="${e.code}">${e.code} - ${e.title}</option>`).join('')}</select>`
      : `<div class="sgpa-title">${c.title}</div><div class="sgpa-code">${c.code}</div>`;
    return `
      <div class="sgpa-row" data-credits="${c.credits}">
        <div class="sgpa-info">${info}</div>
        <span class="credit-badge">${c.credits} Credit</span>
        <select class="sgpa-grade-pick">${gradeOptsHTML()}</select>
      </div>`;
  }).join('');

  rowsEl.addEventListener('change', (e)=>{
    if(e.target.classList.contains('sgpa-grade-pick')) e.target.classList.remove('error');
    if(e.target.matches('.sgpa-elective-pick') && window.MCA.achievements){
      window.MCA.achievements.track('elective_selected', { semester, page:'final-gpa' });
    }
  });

  let lastSgpa = null, lastCredits = null;

  function computeSgpa(){
    const rowEls = [...rowsEl.querySelectorAll('.sgpa-row')];
    const missing = rowEls.filter(row => !row.querySelector('.sgpa-grade-pick').value);
    missing.forEach(row => row.querySelector('.sgpa-grade-pick').classList.add('error'));
    if(missing.length){
      missing[0].querySelector('.sgpa-grade-pick').focus();
      if(typeof missing[0].scrollIntoView === 'function'){
        missing[0].scrollIntoView({ block:'center', behavior:'smooth' });
      }
      return false;
    }
    rowEls.forEach(row => row.querySelector('.sgpa-grade-pick').classList.remove('error'));

    const rows = rowEls.map(row => ({
      credit: row.dataset.credits,
      grade: row.querySelector('.sgpa-grade-pick').value
    }));
    const r = computeSGPA(rows);
    /* Round the SGPA to 2 decimals BEFORE using it anywhere else (display,
       or the CGPA blend below). Official transcripts publish SGPA already
       rounded to 2 decimals, and CGPA is computed from those published
       per-semester figures — not from the raw, unrounded fraction. Feeding
       the full-precision value into the CGPA blend instead (e.g. 9.5217...
       instead of the published 9.52) silently drifts the blended CGPA
       upward past what the official calculation gives (seen as 9.72 here
       vs. the correct 9.71 the official portal reports for the same
       inputs) — not a rounding-direction bug, but a double-rounding one:
       rounding needs to happen once, right here, not after the blend. */
    const roundedSgpa = window.MCA.util.round2(r.sgpa);
    lastSgpa = roundedSgpa; lastCredits = r.countedCredits;

    if(window.MCA.achievements){
      window.MCA.achievements.track('sgpa_calculated', { semester, sgpa: roundedSgpa });
    }

    const resultEl = document.getElementById('gpaResult');
    resultEl.style.display = '';
    resultEl.innerHTML = `
      <div style="flex:1">
        <div class="breakdown">
          <div class="row"><span>Credits registered</span><span>${fmt(r.regCredits)}</span></div>
          <div class="row"><span>Credits earned</span><span>${fmt(r.earnedCredits)}</span></div>
          <div class="row total"><span>SGPA</span><span>${fmt(roundedSgpa)}</span></div>
        </div>
      </div>`;
    updateCgpaCurrentDisplay();
    return true;
  }
  document.getElementById('computeSgpaBtn').addEventListener('click', computeSgpa);

  const progressRoot = document.getElementById('app');
  function restoreProgress(){
    window.MCA.progress.loadProgress(`final-gpa:${semester}`, progressRoot).then(restored=>{
      if(restored) computeSgpa();
    });
  }
  restoreProgress();
  document.addEventListener('signed-in', restoreProgress);

  document.getElementById('saveProgressBtn').addEventListener('click', ()=>{
    window.MCA.progress.saveProgress(`final-gpa:${semester}`, progressRoot);
  });


  /* ---------- CGPA blend: prior CGPA + this semester's SGPA, without
     re-entering every earlier semester individually. The full, detailed
     semester-by-semester CGPA Calculator is still linked below for anyone
     who wants that instead. ---------- */
  const SEM_ORDER = ['I','II','III','IV'];
  const priorCredits = SEM_ORDER
    .slice(0, SEM_ORDER.indexOf(semester))
    .reduce((sum, s) => sum + DATA.semesters[s].totalCredits, 0);

  const cgpaTitle = document.getElementById('cgpaCardTitle');
  const cgpaBadge = document.getElementById('cgpaCreditBadge');
  const cgpaBody = document.getElementById('cgpaBlendBody');
  const computeCgpaBtn = document.getElementById('computeCgpaBtn');

  if(semester === 'I'){
    cgpaTitle.textContent = 'Your CGPA';
    cgpaBadge.textContent = `${totalCredits} Credits`;
    cgpaBody.innerHTML = `<div class="callout">No prior CGPA to blend - your CGPA is just this semester's SGPA once computed above.</div>`;
    computeCgpaBtn.style.display = 'none';
  } else {
    cgpaTitle.textContent = `CGPA Through Semester ${semester}`;
    cgpaBadge.textContent = `${priorCredits + totalCredits} Credits`;
    cgpaBody.innerHTML = `
      <div class="field-row">
        <div class="field">
          <label for="priorCgpaInput">Your CGPA up to Semester ${SEM_ORDER[SEM_ORDER.indexOf(semester)-1]}</label>
          <input type="number" id="priorCgpaInput" min="0" max="10" step="0.01" placeholder="e.g. 8.42">
        </div>
        <div class="field">
          <label for="priorCreditsInput">Credits completed so far</label>
          <input type="number" id="priorCreditsInput" min="0" max="200" value="${priorCredits}">
        </div>
      </div>
      <div class="callout" id="cgpaCurrentSemNote">Compute this semester's SGPA above first.</div>`;
  }

  function updateCgpaCurrentDisplay(){
    const note = document.getElementById('cgpaCurrentSemNote');
    if(!note || lastSgpa === null) return;
    note.innerHTML = `This semester: SGPA <b>${fmt(lastSgpa)}</b> over <b>${fmt(lastCredits)}</b> credits.`;
  }

  computeCgpaBtn.addEventListener('click', ()=>{
    if(lastSgpa === null){
      const ok = computeSgpa();
      if(!ok) return;
    }
    const priorCgpaInput = document.getElementById('priorCgpaInput');
    const priorCreditsInput = document.getElementById('priorCreditsInput');
    const priorCgpaVal = parseFloat(priorCgpaInput.value);
    if(isNaN(priorCgpaVal)){
      priorCgpaInput.focus();
      return;
    }
    const r = blendCGPA(priorCgpaVal, priorCreditsInput.value, lastSgpa, lastCredits);
    const resultEl = document.getElementById('cgpaResult');
    resultEl.style.display = '';
    resultEl.innerHTML = `
      <div style="flex:1">
        <div class="breakdown">
          <div class="row"><span>Total credits</span><span>${fmt(r.totalCredits)}</span></div>
          <div class="row total"><span>CGPA</span><span>${fmt(r.cgpa)}</span></div>
          <div class="row"><span>Projected class</span><span>${r.degreeClass}</span></div>
        </div>
      </div>`;

    if(window.MCA.achievements){
      window.MCA.achievements.track('cgpa_blended', { semester, cgpa: r.cgpa });
    }
  });

  document.getElementById('resetAllBtn').addEventListener('click', ()=>{
    rowsEl.querySelectorAll('.sgpa-grade-pick').forEach(sel => { sel.selectedIndex = 0; sel.classList.remove('error'); });
    document.getElementById('gpaResult').style.display = 'none';
    document.getElementById('gpaResult').innerHTML = '';
    document.getElementById('cgpaResult').style.display = 'none';
    document.getElementById('cgpaResult').innerHTML = '';
    lastSgpa = null; lastCredits = null;
    const note = document.getElementById('cgpaCurrentSemNote');
    if(note) note.innerHTML = `Compute this semester's SGPA above first.`;
    const priorCgpaInput = document.getElementById('priorCgpaInput');
    if(priorCgpaInput) priorCgpaInput.value = '';
    const priorCreditsInput = document.getElementById('priorCreditsInput');
    if(priorCreditsInput) priorCreditsInput.value = priorCredits;
    if(window.MCA.achievements) window.MCA.achievements.track('reset_used', { page:'final-gpa' });
  });
})();
