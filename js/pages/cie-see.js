(function(){
  const { qs, withParams, mount } = window.MCA.site;
  const { YEAR_SEMS, populateSelect, findEntry } = window.MCA.courses;
  const { computeCIE, estimateSEE } = window.MCA.engine;
  const { fmt, clampNum } = window.MCA.grading;
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
      { label:'CIE & SEE' }
    ]
  });
  document.getElementById('toolEyebrow').textContent = `Semester ${semester} \u00b7 2024 Scheme`;

  const $ = id => document.getElementById(id);
  const coursePick = $('coursePick');
  populateSelect(coursePick, semester);

  const NON_STANDARD_NAMES = { project:'Project', internship:'Internship', nptel:'NPTEL / online course' };
  const cieInputs = ['q1','q2','q3','t1','t2','t3','el','lab','elLab'];
  let currentType = 'theory';

  function setTypeDisplay(type){
    document.querySelectorAll('#typeSel .type-chip').forEach(chip=>{
      chip.classList.toggle('sel', chip.dataset.type === type);
    });
  }

  function setStandardUI(type){
    currentType = type;
    $('theoryFields').style.display = (type==='theory'||type==='theory-lab') ? '' : 'none';
    $('labFields').style.display = (type==='theory-lab'||type==='lab') ? '' : 'none';
    $('labMaxHint').textContent = type==='lab' ? '' : '/50';
    setTypeDisplay(type);
  }

  function showNonStandard(type){
    $('nonStdNote').innerHTML = `<div class="callout locked"><b>${NON_STANDARD_NAMES[type] || 'This course'}</b> does not follow the standard CIE/SEE quiz-test-EL split, so it isn't modeled by this calculator. Check the syllabus PDF or your course coordinator for how it's actually evaluated.</div>`;
    $('theoryFields').style.display = 'none';
    $('labFields').style.display = 'none';
    $('cieResult').innerHTML = '';
    $('cieNote').innerHTML = '';
    $('seeResult').innerHTML = '';
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

    const vals = {};
    cieInputs.forEach(id => vals[id] = $(id).value);
    const r = computeCIE(currentType, vals);
    $('cieResult').innerHTML = `
      <div style="flex:1;">
        <div class="breakdown">
          ${r.rows.map(row=>`<div class="row"><span>${row[0]}</span><span>${row[1]}</span></div>`).join('')}
          <div class="row total"><span>Finalized CIE</span><span>${fmt(r.total)} / ${r.max} &middot; ${fmt(r.pct)}%</span></div>
        </div>
      </div>`;
    $('cieNote').innerHTML = r.note;

    const target = parseFloat($('target').value);
    let seeVals;
    if(currentType==='theory') seeVals = { cie: r.total };
    else if(currentType==='theory-lab'){
      const lab = clampNum($('lab').value,0,50);
      seeVals = { cieT: r.total - lab, cieL: lab };
    } else seeVals = { cieO: r.total };

    const s = estimateSEE(currentType, seeVals, target);
    const stampClass = s.achievable ? 'pass' : 'fail';
    $('seeResult').innerHTML = `
      <div class="stamp ${stampClass}"><span class="g">${s.achievable ? Math.ceil(Math.max(s.neededSEE,0)) : '\u00d7'}</span><span class="t">${s.achievable ? 'SEE NEEDED' : 'NOT REACHABLE'}</span></div>
      <div class="result-detail">
        <div class="big">${s.cieLabel}: ${fmt(s.cie)} / ${s.cieMax}</div>
        <div class="note">${s.achievable ? s.message : `Even a full ${s.seeMax}/${s.seeMax} in SEE won't reach this target. Aim lower, or raise CIE first.`}</div>
      </div>`;
  }

  coursePick.addEventListener('change', recompute);
  cieInputs.forEach(id => $(id).addEventListener('input', recompute));
  $('target').addEventListener('change', recompute);

  recompute();
})();
