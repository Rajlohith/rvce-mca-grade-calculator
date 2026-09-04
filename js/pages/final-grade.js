(function(){
  const { qs, withParams, mount } = window.MCA.site;
  const { coursesFor } = window.MCA.courses;
  const { computeFinalGrade } = window.MCA.engine;
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
      { label:'Final Grade' }
    ]
  });
  document.getElementById('gradeScaleStrip').innerHTML = renderGradeScale();

  if(window.MCA.achievements) window.MCA.achievements.track('tool_page_viewed', { tool:'final-grade', semester });

  // Project, Internship and NPTEL/online courses aren't evaluated through
  // CIE+SEE at all (see FAQ: "Why don't I see every course on the CIE and
  // Final Grade pages?") — they're graded a different way entirely, so a
  // card here would never do anything. Left out of both this page and the
  // CIE & SEE Calculator; still counted normally on the SGPA/CGPA tools.
  const MAX_BY_TYPE = {
    theory:      { cieMax:100, seeMax:100 },
    'theory-lab':{ cieMax:150, seeMax:150 },
    lab:         { cieMax:50,  seeMax:50 }
  };
  const courses = coursesFor(semester).filter(c => !['project','internship','nptel'].includes(c.type));
  const standardCourseCount = courses.length;
  const calculatedCodes = new Set();

  const GROUP_LABELS = {
    'theory-lab': 'Theory + Lab',
    'theory': 'Theory Only',
    'lab': 'Lab Only'
  };
  const GROUP_ORDER = ['theory-lab', 'theory', 'lab'];

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

    const { cieMax, seeMax } = MAX_BY_TYPE[course.type];
    return `<div class="course-card" data-code="${course.code}" data-type="${course.type}">
      ${head}
      <div class="field-row stacked">
        <div class="field"><label>CIE total <span class="hint">/${cieMax}</span></label><input type="number" class="f-cie req" min="0" max="${cieMax}" value=""></div>
        <div class="field"><label>SEE total <span class="hint">/${seeMax}</span></label><input type="number" class="f-see req" min="0" max="${seeMax}" value=""></div>
      </div>
      <div class="toolbar"><button type="button" class="btn amber full calc-btn">Calculate Grade</button></div>
      <div class="course-result"></div>
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

  function restoreProgress(){
    window.MCA.progress.loadProgress(`final-grade:${semester}`, grid);
  }
  restoreProgress();
  document.addEventListener('signed-in', restoreProgress);

  document.getElementById('saveProgressBtn').addEventListener('click', ()=>{
    window.MCA.progress.saveProgress(`final-grade:${semester}`, grid);
  });

  function validateCard(card){
    const reqInputs = [...card.querySelectorAll('input.req')];
    const missing = reqInputs.filter(inp => inp.value === '' || inp.value === null);
    reqInputs.forEach(inp => inp.classList.toggle('error', missing.includes(inp)));
    return missing;
  }

  function calculateCard(card){
    const missing = validateCard(card);
    if(missing.length){
      card.querySelector('.course-result').innerHTML = `<div class="callout error">Fill in both CIE total and SEE total for this course before calculating.</div>`;
      missing[0].focus();
      return;
    }
    const type = card.dataset.type;
    const code = card.dataset.code;
    const cie = card.querySelector('.f-cie').value;
    const see = card.querySelector('.f-see').value;
    const r = computeFinalGrade(type, { cie, see });

    calculatedCodes.add(code);
    if(window.MCA.achievements){
      window.MCA.achievements.track('final_grade_calculated', {
        semester, code, isPass: r.isPass, pct: r.finalPct,
        completed: calculatedCodes.size, total: standardCourseCount
      });
    }

    card.querySelector('.course-result').innerHTML = `
      <div class="result" style="margin-top:0;">
        <div class="stamp ${r.isPass?'pass':'fail'}"><span class="g">${r.letter}</span><span class="t">${r.isPass?'PASS':'FAIL'}</span></div>
        <div class="result-detail">
          <div class="big">Marks: ${Math.round(r.total)} / ${r.max} (${r.pct.toFixed(2)}%)</div>
          <div class="big">Grade point: ${r.gp}</div>
          ${r.isPass ? '' : `<div class="note">A passing condition isn't met, so this is recorded as F.</div>`}
          <div class="badge-list">
            ${r.badges.map(b=>`<span class="badge ${b[1]?'ok':'no'}">${b[1]?'\u2713':'\u2715'} ${b[0]}</span>`).join('')}
          </div>
        </div>
      </div>`;
  }

  grid.addEventListener('click', (e)=>{
    const btn = e.target.closest('.calc-btn');
    if(btn) calculateCard(btn.closest('.course-card'));
  });

  grid.addEventListener('input', (e)=>{
    if(e.target.matches('input.req') && e.target.value !== '') e.target.classList.remove('error');
  });

  document.getElementById('resetAllBtn').addEventListener('click', ()=>{
    grid.querySelectorAll('input[type=number]').forEach(inp => { inp.value = ''; inp.classList.remove('error'); });
    grid.querySelectorAll('.course-result').forEach(r => r.innerHTML = '');
    calculatedCodes.clear();
    if(window.MCA.achievements) window.MCA.achievements.track('reset_used', { page:'final-grade' });
  });

  grid.addEventListener('change', (e)=>{
    if(e.target.matches('.course-elective-pick') && window.MCA.achievements){
      window.MCA.achievements.track('elective_selected', { semester, page:'final-grade' });
    }
  });
})();
