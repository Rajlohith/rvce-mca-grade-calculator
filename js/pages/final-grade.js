(function(){
  const { qs, withParams, mount } = window.MCA.site;
  const { YEAR_SEMS, populateSelect, findEntry } = window.MCA.courses;
  const { computeFinalGrade } = window.MCA.engine;
  const { fmt } = window.MCA.grading;
  const DATA = window.MCA.DATA;

  const scheme = qs('scheme'), year = qs('year'), semester = qs('semester');
  const validSem = semester && DATA.semesters[semester] && YEAR_SEMS[year] && YEAR_SEMS[year].includes(semester);
  if(scheme !== '2024' || !validSem){ window.location.replace('scheme.html'); return; }

  mount({
    active: 'start',
    trail: [
      { label:'Home', href:'index.html' },
      { label:'Scheme', href:'scheme.html' },
      { label:'2024 Scheme', href: withParams('year.html', { scheme }) },
      { label:`Year ${year}`, href: withParams('semester.html', { scheme, year }) },
      { label:`Semester ${semester}`, href: withParams('tools.html', { scheme, year, semester }) },
      { label:'Final Grade' }
    ]
  });
  document.getElementById('toolEyebrow').textContent = `Semester ${semester} \u00b7 2024 Scheme`;

  const $ = id => document.getElementById(id);
  const coursePick = $('coursePick');
  populateSelect(coursePick, semester);

  const NON_STANDARD_NAMES = { project:'Project', internship:'Internship', nptel:'NPTEL / online course' };
  const MAX_BY_TYPE = {
    theory:      { cieMax:100, seeMax:100 },
    'theory-lab':{ cieMax:150, seeMax:150 },
    lab:         { cieMax:50,  seeMax:50 }
  };
  let currentType = 'theory';

  function setTypeDisplay(type){
    document.querySelectorAll('#typeSel .type-chip').forEach(chip=>{
      chip.classList.toggle('sel', chip.dataset.type === type);
    });
  }

  function setStandardUI(type){
    currentType = type;
    const { cieMax, seeMax } = MAX_BY_TYPE[type];
    $('cie').max = cieMax; $('see').max = seeMax;
    $('cieHint').textContent = `/${cieMax}`;
    $('seeHint').textContent = `/${seeMax}`;
    setTypeDisplay(type);
  }

  function showNonStandard(type){
    $('nonStdNote').innerHTML = `<div class="callout locked"><b>${NON_STANDARD_NAMES[type] || 'This course'}</b> does not follow the standard CIE/SEE quiz-test-EL split, so it isn't modeled by this calculator. Check the syllabus PDF or your course coordinator for how it's actually evaluated.</div>`;
    $('gradeResult').innerHTML = '';
    document.querySelectorAll('#typeSel .type-chip').forEach(c=>c.classList.remove('sel'));
  }

  function recompute(){
    const entry = findEntry(semester, coursePick.value);
    if(!entry) return;
    const isNonStandard = ['project','internship','nptel'].includes(entry.type);
    $('nonStdNote').innerHTML = '';

    if(isNonStandard){
      showNonStandard(entry.type);
      return;
    }
    setStandardUI(entry.type);

    const r = computeFinalGrade(currentType, { cie: $('cie').value, see: $('see').value });
    $('gradeResult').innerHTML = `
      <div class="stamp ${r.isPass?'pass':'fail'}"><span class="g">${r.letter}</span><span class="t">${r.isPass?'PASS':'FAIL'}</span></div>
      <div class="result-detail">
        <div class="big">${fmt(r.total)} / ${r.max} &middot; ${fmt(r.pct)}% &middot; Grade point ${r.gp}</div>
        <div class="note">${r.isPass ? `Meets every passing condition &mdash; grade ${r.letter} stands.` : `A passing condition from Table 4.4 isn't met, so this is recorded as F regardless of the raw percentage.`}</div>
        <div class="badge-list">
          ${r.badges.map(b=>`<span class="badge ${b[1]?'ok':'no'}">${b[1]?'\u2713':'\u2715'} ${b[0]}</span>`).join('')}
        </div>
      </div>`;
  }

  coursePick.addEventListener('change', recompute);
  ['cie','see'].forEach(id => $(id).addEventListener('input', recompute));

  recompute();
})();
