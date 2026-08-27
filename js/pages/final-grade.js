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

  const NON_STANDARD_NAMES = { project:'Project', internship:'Internship', nptel:'NPTEL / online course' };
  const MAX_BY_TYPE = {
    theory:      { cieMax:100, seeMax:100 },
    'theory-lab':{ cieMax:150, seeMax:150 },
    lab:         { cieMax:50,  seeMax:50 }
  };
  const courses = coursesFor(semester);

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
        <div class="callout locked">${NON_STANDARD_NAMES[course.type] || 'This course'} isn't modeled here &mdash; check your syllabus or course coordinator for how it's evaluated.</div>
      </div>`;
    }

    const { cieMax, seeMax } = MAX_BY_TYPE[course.type];
    return `<div class="course-card" data-code="${course.code}" data-type="${course.type}">
      ${head}
      <div class="field-row">
        <div class="field"><label>CIE total <span class="hint">/${cieMax}</span></label><input type="number" class="f-cie req" min="0" max="${cieMax}" value=""></div>
        <div class="field"><label>SEE total <span class="hint">/${seeMax}</span></label><input type="number" class="f-see req" min="0" max="${seeMax}" value=""></div>
      </div>
      <div class="toolbar"><button type="button" class="btn amber full calc-btn">Calculate Grade</button></div>
      <div class="course-result"></div>
    </div>`;
  }

  const grid = document.getElementById('courseGrid');
  grid.innerHTML = courses.map(cardHTML).join('');

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
    const cie = card.querySelector('.f-cie').value;
    const see = card.querySelector('.f-see').value;
    const r = computeFinalGrade(type, { cie, see });

    card.querySelector('.course-result').innerHTML = `
      <div class="result" style="margin-top:0;">
        <div class="stamp ${r.isPass?'pass':'fail'}"><span class="g">${r.letter}</span><span class="t">${r.isPass?'PASS':'FAIL'}</span></div>
        <div class="result-detail">
          <div class="big">${Math.round(r.total)} / ${r.max} (${Math.round(r.pct)}%) &middot; Grade point ${r.gp}</div>
          <div class="note">${r.isPass ? `Meets every passing condition &mdash; grade ${r.letter} stands.` : `A passing condition isn't met, so this is recorded as F.`}</div>
          <div class="badge-list">
            ${r.badges.map(b=>`<span class="badge ${b[1]?'ok':'no'}">${b[1]?'\u2713':'\u2715'} ${b[0]}</span>`).join('')}
          </div>
          <div class="callout" style="margin-top:10px;">Department rounds up to the next whole mark &mdash; ${Math.round(r.total)} becomes <b>${r.finalTotal}</b>/${r.max} (${r.finalPct}%). ${r.componentCaveat ? `Theory/Lab SEE sub-floors (&ge;40/100, &ge;25/50) aren't checked separately &mdash; verify them if borderline.` : ''}</div>
          <div class="rounding-note">Marks and percentages above are rounded for display.</div>
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
  });
})();
