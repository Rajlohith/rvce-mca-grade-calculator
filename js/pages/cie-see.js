(function(){
  const { qs, withParams, mount } = window.MCA.site;
  const { coursesFor } = window.MCA.courses;
  const { computeCIE, allGradeRequirements, computeCIE26, allGradeRequirements26 } = window.MCA.engine;
  const { fmt, renderGradeScale } = window.MCA.grading;
  const DATA = window.MCA.DATA;

  const scheme = qs('scheme'), semester = qs('semester');
  const validSem = semester && DATA.semesters[semester];
  if((scheme !== '2024' && scheme !== '2026') || !validSem){ window.location.replace('scheme.html'); return; }
  // 2026 uses its own marking structure (1 quiz, EL out of 50, PBL inside the lab marks),
  // so it has its own field layout and engine functions. 2024 code paths are unchanged.
  const is2026 = scheme === '2026';
  // Same scheme-year badge as the CGPA pages (.accent-word is the existing accent colour style).
  (function(){
    const h = document.querySelector('.page-hero h1');
    if(h && !h.querySelector('.accent-word')) h.insertAdjacentHTML('beforeend', ' <span class="accent-word">' + scheme + '</span>');
  })();
  const progressKey = is2026 ? `cie-see:2026:${semester}` : `cie-see:${semester}`;
  const marksKey = code => (is2026 ? `2026:${code}:cie` : `${code}:cie`);

  mount({
    active: 'start',
    trail: [
      { label:'Home', href:'../index.html' },
      { label:'Scheme', href:'scheme.html' },
      { label:`${scheme} Scheme`, href: withParams('semester.html', { scheme }) },
      { label:`Semester ${semester}`, href: withParams('tools.html', { scheme, semester }) },
      { label:'CIE & SEE' }
    ]
  });
  document.getElementById('gradeScaleStrip').innerHTML = renderGradeScale();

  if(window.MCA.achievements) window.MCA.achievements.track('tool_page_viewed', { tool:'cie-see', semester });

  // Semester I keeps the original Lab(/40)+Lab EL(/10) split. Semester II
  // and III use the PBL-merged breakdown instead.
  const labScheme = (semester === 'II' || semester === 'III') ? 'sem23' : 'sem1';
  // Project, Internship and NPTEL/online courses aren't evaluated through
  // CIE+SEE at all (see FAQ: "Why don't I see every course on the CIE and
  // Final Grade pages?") — they're graded a different way entirely, so a
  // card here would never do anything. Left out of both this page and the
  // Final Grade Calculator; still counted normally on the SGPA/CGPA tools.
  const courses = coursesFor(semester).filter(c => !['project','internship','nptel'].includes(c.type));
  const standardCourseCount = courses.length;
  const cardState = new Map(); // course code -> { total, max, type }

  const GROUP_LABELS = {
    'theory-lab': 'Theory + Lab',
    'theory': 'Theory Only',
    'lab': 'Lab Only',
    'seminar': 'Seminar'
  };
  const GROUP_ORDER = ['theory-lab', 'theory', 'lab', 'seminar'];

  const COPY_SVG = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>`;

  function quizTestBlock(){
    return `
      <div class="field-row-2">
        <div class="field"><label>Quiz 1 <span class="hint">/10</span></label><input type="number" class="f-q1 quiz-field" min="0" max="10" value=""></div>
        <div class="field"><label>Quiz 2 <span class="hint">/10</span></label><input type="number" class="f-q2 quiz-field" min="0" max="10" value=""></div>
      </div>
      <div class="field-row-2">
        <div class="field"><label>Quiz 3 <span class="hint">/10</span></label><input type="number" class="f-q3 quiz-field" min="0" max="10" value=""></div>
      </div>
      <div class="hint qt-note">Enter any 2 of the 3 quiz marks. The best 2 counts anyway.</div>
      <div class="field-row-2">
        <div class="field"><label>Test 1 <span class="hint">/50</span></label><input type="number" class="f-t1 test-field" min="0" max="50" value=""></div>
        <div class="field"><label>Test 2 <span class="hint">/50</span></label><input type="number" class="f-t2 test-field" min="0" max="50" value=""></div>
      </div>
      <div class="field-row-2">
        <div class="field"><label>Test 3 <span class="hint">/50</span></label><input type="number" class="f-t3 test-field" min="0" max="50" value=""></div>
      </div>
      <div class="hint qt-note">Enter any 2 of the 3 test marks. The best 2 counts anyway.</div>`;
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
    if(type==='seminar'){
      return `
        <div class="field-row-2">
          <div class="field"><label>Project Phase 1 <span class="hint">/50</span></label><input type="number" class="f-phase1 req" min="0" max="50" value=""></div>
          <div class="field"><label>Project Phase 2 <span class="hint">/50</span></label><input type="number" class="f-phase2 req" min="0" max="50" value=""></div>
        </div>`;
    }
    return '';
  }

  /* ---------- 2026 scheme fields ---------- */
  const inp = (cls, label, max, extra) =>
    `<div class="field"><label>${label} <span class="hint">/${max}</span></label><input type="number" class="${cls}" min="0" max="${max}" value=""></div>`;

  function testsBlock26(max = 50){
    return `
      <div class="field-row-2">
        ${inp('f-t1 test-field','Test 1',max)}
        ${inp('f-t2 test-field','Test 2',max)}
      </div>
      <div class="field-row-2">
        ${inp('f-t3 test-field','Test 3',max)}
      </div>
      <div class="hint qt-note">Two regular tests plus one optional improvement test. Enter any 2 of the 3; the best 2 count.</div>`;
  }

  function fieldsHTML26(course){
    switch(course.model){
      case 'theory':
        return `
          <div class="field-row"><div class="field"><label>Quiz <span class="hint">/10 </span></label><input type="number" class="f-q req" min="0" max="10" value=""></div></div>
          ${testsBlock26()}
          <div class="field-row">${inp('f-el req','Experiential Learning',50)}</div>`;
      case 'theory-lab':
        return `
          <div class="field-row"><div class="field"><label>Quiz <span class="hint">/10 </span></label><input type="number" class="f-q req" min="0" max="10" value=""></div></div>
          ${testsBlock26()}
          <div class="field-row">${inp('f-el req','Experiential Learning',50)}</div>
          <div class="field-row">${inp('f-lab req','Lab',50)}</div>`;
      case 'theory-50':
        return `
          <div class="field-row"><div class="field"><label>Quiz <span class="hint">/10 &middot; Scaled down to 5</span></label><input type="number" class="f-q req" min="0" max="10" value=""></div></div>
          ${testsBlock26(25)}
          <div class="field-row">${inp('f-el req','Experiential Learning',25)}</div>`;
      case 'online-lab':
        return `
          <div class="field-row">${inp('f-modules req','Modules assessment',30)}</div>
          <div class="field-row-2">
            ${inp('f-lt1 req','Test I',10)}
            ${inp('f-lt2 req','Test II',10)}
          </div>`;
      case 'dtl':
        return `
          <div class="field-row-2">
            ${inp('f-r1 req','Review I',10)}
            ${inp('f-r2 req','Review II',20)}
          </div>
          <div class="field-row-2">
            ${inp('f-r3 req','Review III',15)}
            ${inp('f-rep req','Final report',5)}
          </div>`;
      default:
        return '';
    }
  }

  function cardTitleHTML(course){
    if(course.electives && course.electives.length){
      const opts = course.electives.map(e=>`<option value="${e.code}">${e.code} - ${e.title}</option>`).join('');
      return `<h3>${course.title}</h3><select class="course-elective-pick">${opts}</select>`;
    }
    return `<h3>${course.title}</h3><span class="hint">${course.code}</span>`;
  }

  function cardHTML(course){
    const head = `
      <div class="course-card-head">
        <div>${cardTitleHTML(course)}</div>
        <span class="credit-badge">${course.credits} Credit</span>
      </div>`;

    // Seminar courses (MCA492L) are evaluated entirely through internal phases —
    // there is no university-conducted SEE, so the SEE requirements button is omitted.
    const seeBtnHTML = course.type !== 'seminar'
      ? `<button type="button" class="locked-btn see-btn" disabled>SEE Marks Required</button>`
      : '';
    return `<div class="course-card" data-code="${course.code}" data-type="${course.type}">
      ${head}
      ${is2026 ? fieldsHTML26(course) : fieldsHTML(course.type)}
      <div class="toolbar">
        <button type="button" class="btn amber full calc-btn">Calculate CIE</button>
      </div>
      <div class="course-result"></div>
      ${seeBtnHTML}
    </div>`;
  }

  const grid = document.getElementById('courseGrid');
  // Grouped by evaluation type (Theory + Lab / Theory Only / Lab Only)
  // rather than one flat grid — courses with very different field counts
  // sitting side by side made for an uneven, gappy-looking grid.
  grid.innerHTML = GROUP_ORDER.map(type => {
    const groupCourses = courses.filter(c => c.type === type);
    if(!groupCourses.length) return '';
    return `
      <div class="semester-group">
        <div class="semester-group-label">${GROUP_LABELS[type]}</div>
        <div class="course-grid">${groupCourses.map(cardHTML).join('')}</div>
      </div>`;
  }).join('');

  // Cards are left at their natural height — a card that grows once its
  // result renders no longer stretches its still-empty siblings to match.

  // Restore any previously saved progress for this semester's CIE page.
  // Firebase's auth state resolves asynchronously (it loads its SDK from
  // a CDN and restores the session after that), so this can't just run
  // once at page load — it also needs to re-run the moment sign-in
  // actually completes, in case that happens after this script runs.
  function restoreProgress(){
    window.MCA.progress.loadProgress(progressKey, grid);
  }
  restoreProgress();
  document.addEventListener('signed-in', restoreProgress);

  document.getElementById('saveProgressBtn').addEventListener('click', ()=>{
    window.MCA.progress.saveProgress(progressKey, grid);
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

  function isFilled(inp){ return inp.value !== '' && inp.value !== null; }

  // Quiz and Test each have 3 attempts, but only the best 2 of 3 are ever
  // used (see engine.js bestTwoOfThree), so the group only needs any 2 of
  // its 3 inputs filled — not all 3. The other "req" fields (EL, Lab, PBL)
  // are still individually required as before.
  function validateCard(card){
    const reqInputs = [...card.querySelectorAll('input.req')];
    const missing = reqInputs.filter(inp => !isFilled(inp));
    reqInputs.forEach(inp => inp.classList.toggle('error', missing.includes(inp)));

    // Lab-only cards (type 'lab', e.g. Skill Lab, Technical English,
    // Design Thinking Lab, Technical Seminar) have no Quiz/Test fields at
    // all — fieldsHTML() never renders them for that type. So these
    // arrays are legitimately empty there, and "fewer than 2 filled"
    // must not be treated as "still missing marks" or the card could
    // never be calculated. Only enforce the 2-of-3 rule when the group
    // actually exists on this card.
    const quizInputs = [...card.querySelectorAll('input.quiz-field')];
    const testInputs = [...card.querySelectorAll('input.test-field')];
    const quizShort = quizInputs.length > 0 && quizInputs.filter(isFilled).length < 2;
    const testShort = testInputs.length > 0 && testInputs.filter(isFilled).length < 2;
    // Only mark the still-empty ones in a short group as errors.
    quizInputs.forEach(inp => inp.classList.toggle('error', quizShort && !isFilled(inp)));
    testInputs.forEach(inp => inp.classList.toggle('error', testShort && !isFilled(inp)));

    return { missing, quizShort, testShort, quizInputs, testInputs };
  }

  function calculateCard(card){
    const { missing, quizShort, testShort, quizInputs, testInputs } = validateCard(card);
    if(missing.length || quizShort || testShort){
      const parts = [];
      if(quizShort) parts.push('any 2 of the 3 Quiz marks');
      if(testShort) parts.push('any 2 of the 3 Test marks');
      if(missing.length) parts.push(`${missing.length} other field${missing.length===1?'':'s'}`);
      card.querySelector('.course-result').innerHTML = `<div class="callout error">Still need: ${parts.join(', ')}.</div>`;
      const seeBtn = card.querySelector('.see-btn');
      if(seeBtn){ seeBtn.disabled = true; seeBtn.classList.remove('ready'); }
      const firstBad = (quizShort && quizInputs.find(i=>!isFilled(i)))
        || (testShort && testInputs.find(i=>!isFilled(i)))
        || missing[0];
      if(firstBad) firstBad.focus();
      return;
    }
    const code = card.dataset.code;
    const type = card.dataset.type;
    const course = courses.find(c => c.code === code);
    const vals = is2026 ? {
      q: readVal(card,'f-q'),
      t1: readVal(card,'f-t1'), t2: readVal(card,'f-t2'), t3: readVal(card,'f-t3'),
      el: readVal(card,'f-el'), lab: readVal(card,'f-lab'),
      modules: readVal(card,'f-modules'), lt1: readVal(card,'f-lt1'), lt2: readVal(card,'f-lt2'),
      r1: readVal(card,'f-r1'), r2: readVal(card,'f-r2'), r3: readVal(card,'f-r3'), rep: readVal(card,'f-rep')
    } : {
      q1: readVal(card,'f-q1'), q2: readVal(card,'f-q2'), q3: readVal(card,'f-q3'),
      t1: readVal(card,'f-t1'), t2: readVal(card,'f-t2'), t3: readVal(card,'f-t3'),
      el: readVal(card,'f-el'),
      elLab: readVal(card,'f-ellab'),
      lab: (type==='theory-lab' && labScheme==='sem23') ? readVal(card,'f-labsem23') : readVal(card,'f-lab'),
      pbl: readVal(card,'f-pbl'),
      phase1: readVal(card,'f-phase1'),
      phase2: readVal(card,'f-phase2')
    };
    const cieLabScheme = type==='theory-lab' ? labScheme : undefined;
    const r = is2026 ? computeCIE26(course, vals) : computeCIE(type, vals, cieLabScheme);
    // The SEE-requirement tools below key off the department's finalized
    // (ceiling-rounded) CIE, not the raw decimal — see the note on
    // computeCIE's finalTotal in engine.js.
    cardState.set(code, { total: r.finalTotal, rawTotal: r.total, max: r.max, type, dx: r.dx, seeMax: r.seeMax });

    if(window.MCA.achievements){
      window.MCA.achievements.track('cie_calculated', {
        semester, code, finalPct: r.finalPct, dx: r.dx,
        completed: cardState.size, total: standardCourseCount
      });
    }

    // Save CIE to Firestore if user is signed in
    if(window.MCA.isSignedIn()){
      window.MCA.saveMarks(marksKey(code), {
        raw: r.total,
        final: r.finalTotal,
        max: r.max,
        pct: r.pct,
        finalPct: r.finalPct,
        timestamp: new Date().toISOString()
      }).then(() => {
        // Silent save — no toast notification
      }).catch(err => {
        console.error('Failed to save CIE:', err);
        window.MCA.util.toast('Could not save CIE to your account', 'error');
      });
    }

    const finalNote = `<div class="callout" style="margin-top:10px;">MCA department rounds this up to <b>${r.finalTotal}</b> using ciel function for SEE.</div>`;

    card.querySelector('.course-result').innerHTML = `
      <div class="breakdown">
        ${r.rows.map(row=>`<div class="row"><span>${row[0]}</span><span>${row[1]}</span></div>`).join('')}
        <div class="row total"><span>Finalized CIE</span><span>${fmt(r.total)} / ${r.max}</span></div>
        <div class="row total final-cie"><span>Final CIE (used for SEE):</span><span>${r.finalTotal} / ${r.max} (${r.finalPct.toFixed(2)}%)</span></div>
      </div>
      ${r.dx ? `<div class="callout error"><b>Grade: DX (NSSR)</b> &ndash; Not Satisfied Sessional Requirement.<br>${(r.failures||[]).map(f=>`&bull; ${f}`).join('<br>')}<br>You cannot appear for the SEE in this course; it has to be re-registered.</div>` : ''}
      ${finalNote}`;

    const seeBtn = card.querySelector('.see-btn');
    // Seminar cards have no see-btn (omitted in cardHTML), so null-guard here.
    if(seeBtn){
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
  }

  grid.addEventListener('click', (e)=>{
    const calcBtn = e.target.closest('.calc-btn');
    if(calcBtn){ calculateCard(calcBtn.closest('.course-card')); return; }
    const seeBtn = e.target.closest('.see-btn');
    if(seeBtn && !seeBtn.disabled) openSeeModal(seeBtn.closest('.course-card'));
  });

  grid.addEventListener('input', (e)=>{
    if(e.target.matches('input[type=number]')) validateCard(e.target.closest('.course-card'));
  });

  document.getElementById('resetAllBtn').addEventListener('click', ()=>{
    grid.querySelectorAll('input[type=number]').forEach(inp => { inp.value = ''; inp.classList.remove('error'); });
    grid.querySelectorAll('.course-result').forEach(r => r.innerHTML = '');
    grid.querySelectorAll('.see-btn').forEach(b => { b.disabled = true; b.classList.remove('ready'); b.textContent = 'SEE Marks Required'; });
    cardState.clear();
    if(window.MCA.achievements) window.MCA.achievements.track('reset_used', { page:'cie-see' });
  });

  grid.addEventListener('change', (e)=>{
    if(e.target.matches('.course-elective-pick') && window.MCA.achievements){
      window.MCA.achievements.track('elective_selected', { semester, page:'cie-see' });
    }
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

    if(window.MCA.achievements) window.MCA.achievements.track('see_requirements_viewed', { semester, code });

    const course = courses.find(c => c.code === code);
    modalSubject.textContent = courseDisplayTitle(card, course);
    modalCie.textContent = `${fmt(state.total)} / ${state.max}`;

    const seeMax = state.seeMax || (state.type==='theory' ? 100 : state.type==='theory-lab' ? 150 : 50);
    modalSeeOf.textContent = `SEE marks out of ${seeMax}`;

    if(state.type==='theory-lab'){
      modalLabBox.innerHTML = `
        <div class="lab-see-box">
          <label for="labSeeFixedInput">Set Lab SEE Marks (Optional)</label>
          <input type="number" id="labSeeFixedInput" min="0" max="50" placeholder="0">
          <span class="hint">Max 50 marks${is2026 ? ' (lab SEE must be at least 25 to pass)' : ''}. Enter to see the adjusted theory SEE requirement.</span>
          <div class="lab-see-error" id="labSeeError" role="alert" hidden></div>
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
    // Red explanation under the input when the entered Lab SEE can never pass: the lab part
    // of the SEE needs at least 25/50 (50%) on its own, whatever the theory SEE turns out to be.
    const labErr = document.getElementById('labSeeError');
    if(labErr){
      let msg = '';
      if(labSeeFixed !== null && !isNaN(labSeeFixed)){
        if(labSeeFixed < 0) msg = 'Marks cannot be negative.';
        else if(labSeeFixed > 50) msg = 'Lab SEE cannot be more than 50/50.';
        else if(labSeeFixed < 25) msg = `Lab SEE must be at least 25/50 (50%) to clear this course. With ${fmt(labSeeFixed)}/50 you cannot pass, however well you do in the theory SEE.`;
      }
      labErr.textContent = msg;
      labErr.hidden = !msg;
    }
    // Pass the course object so allGradeRequirements can honour any course-specific
    // seeFloor (none set at the moment; every practice course uses 25/50).
    const courseForModal = courses.find(c => c.code === currentModalCode);
    const reqs = is2026
      ? allGradeRequirements26(courseForModal, state.total, state.max, labSeeFixed)
      : allGradeRequirements(state.type, state.total, state.max, labSeeFixed, courseForModal);
    modalRows.innerHTML = reqs.map(r => `
      <div class="grade-req-row ${r.achievable ? '' : 'unreachable'}">
        <div class="gp-circle">${r.gp}</div>
        <div class="gr-body">
          <div class="gr-name">Grade ${r.grade}</div>
          <div class="gr-marks">${r.label}${r.achievable ? '' : ' - not reachable'}</div>
        </div>
        <button type="button" class="gr-copy" title="Copy" data-copy="Grade ${r.grade}: ${r.label}">${COPY_SVG}</button>
      </div>`).join('');
  }

  modalRows.addEventListener('click', (e)=>{
    const btn = e.target.closest('.gr-copy');
    if(!btn) return;
    window.MCA.util.copyWithFeedback(btn.dataset.copy, 'Requirement copied', 'Could not copy - copy it manually');
  });

  document.getElementById('copyAllBtn').addEventListener('click', (e)=>{
    const state = cardState.get(currentModalCode);
    if(!state) return;
    const labInput = document.getElementById('labSeeFixedInput');
    const labSeeFixed = (labInput && labInput.value !== '') ? parseFloat(labInput.value) : null;
    const courseForCopy = courses.find(c => c.code === currentModalCode);
    const reqs = is2026
      ? allGradeRequirements26(courseForCopy, state.total, state.max, labSeeFixed)
      : allGradeRequirements(state.type, state.total, state.max, labSeeFixed, courseForCopy);
    const text = `${modalSubject.textContent} - CIE ${modalCie.textContent}\n` +
      reqs.map(r => `Grade ${r.grade} (${r.gp}): ${r.label}${r.achievable ? '' : ' - not reachable'}`).join('\n');
    const btn = e.currentTarget;
    window.MCA.util.copyWithFeedback(text, 'All requirements copied', 'Could not copy - copy them manually').then(ok=>{
      if(!ok) return;
      if(window.MCA.achievements) window.MCA.achievements.track('see_requirements_copied', { semester });
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
