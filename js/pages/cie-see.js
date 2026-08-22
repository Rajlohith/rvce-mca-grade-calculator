(function(){
  const { qs, withParams, mount } = window.MCA.site;
  const { YEAR_SEMS, populateSelect, findEntry } = window.MCA.courses;
  const { computeCIE, estimateSEE } = window.MCA.engine;
  const { fmt } = window.MCA.grading;
  const DATA = window.MCA.DATA;

  const scheme = qs('scheme'), year = qs('year'), semester = qs('semester');
  const validSem = semester && DATA.semesters[semester] && YEAR_SEMS[year] && YEAR_SEMS[year].includes(semester);
  if(scheme !== '2024' || !validSem){ window.location.replace('scheme.html'); return; }

  mount({
    active: 'start',
    trail: [
      { label:'Home', href:'../index.html' },
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

  // Semester I keeps the original Lab(/40)+Lab EL(/10) split. Semester II
  // and III use this college's PBL-merged breakdown instead. Semester IV
  // has no theory+lab courses, so it never reaches the 'sem23' branch for
  // real data, but is included for completeness if that ever changes.
  const labScheme = (semester === 'II' || semester === 'III') ? 'sem23' : 'sem1';

  const NON_STANDARD_NAMES = { project:'Project', internship:'Internship', nptel:'NPTEL / online course' };
  const theoryInputs = ['q1','q2','q3','t1','t2','t3','el'];
  const labSem1Inputs = ['lab','elLab'];
  const labSem23Inputs = ['pbl','labSem23'];
  let currentType = 'theory';

  function setTypeDisplay(type){
    document.querySelectorAll('#typeSel .type-chip').forEach(chip=>{
      chip.classList.toggle('sel', chip.dataset.type === type);
    });
  }

  function setStandardUI(type){
    currentType = type;
    $('theoryFields').style.display = (type==='theory'||type==='theory-lab') ? '' : 'none';
    // Semester II/III theory+lab courses fold theory EL into PBL, so the
    // standalone EL field would just sit there doing nothing — hide it.
    const isSem23TheoryLab = type==='theory-lab' && labScheme==='sem23';
    $('theoryElRow').style.display = isSem23TheoryLab ? 'none' : '';
    const showSem1Lab = type==='lab' || (type==='theory-lab' && labScheme==='sem1');
    const showSem23Lab = isSem23TheoryLab;
    $('labFieldsSem1').style.display = showSem1Lab ? '' : 'none';
    $('labFieldsSem23').style.display = showSem23Lab ? '' : 'none';
    setTypeDisplay(type);
  }

  function showNonStandard(type){
    $('nonStdNote').innerHTML = `<div class="callout locked"><b>${NON_STANDARD_NAMES[type] || 'This course'}</b> does not follow the standard CIE/SEE quiz-test-EL split, so it isn't modeled by this calculator. Check the syllabus PDF or your course coordinator for how it's actually evaluated.</div>`;
    $('theoryFields').style.display = 'none';
    $('labFieldsSem1').style.display = 'none';
    $('labFieldsSem23').style.display = 'none';
    $('cieResult').innerHTML = '';
    $('cieNote').innerHTML = '';
    $('seeResult').innerHTML = '';
    document.querySelectorAll('#typeSel .type-chip').forEach(c=>c.classList.remove('sel'));
  }

  function activeInputs(){
    if(currentType==='theory') return theoryInputs;
    if(currentType==='lab') return labSem1Inputs;
    if(currentType==='theory-lab') return theoryInputs.concat(labScheme==='sem23' ? labSem23Inputs : labSem1Inputs);
    return [];
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
    theoryInputs.forEach(id => vals[id] = $(id).value);
    if(currentType==='lab' || (currentType==='theory-lab' && labScheme==='sem1')){
      vals.lab = $('lab').value;
      vals.elLab = $('elLab').value;
    } else if(currentType==='theory-lab' && labScheme==='sem23'){
      vals.pbl = $('pbl').value;
      vals.lab = $('labSem23').value; // engine expects the lab-CIE value under `lab` regardless of scheme
    }

    const cieLabScheme = currentType==='theory-lab' ? labScheme : undefined;
    const r = computeCIE(currentType, vals, cieLabScheme);
    $('cieResult').innerHTML = `
      <div style="flex:1;">
        <div class="breakdown">
          ${r.rows.map(row=>`<div class="row"><span>${row[0]}</span><span>${row[1]}</span></div>`).join('')}
          <div class="row total"><span>Finalized CIE</span><span>${fmt(r.total)} / ${r.max} &middot; ${fmt(r.pct)}%</span></div>
        </div>
      </div>`;
    $('cieNote').innerHTML = r.note;

    const target = parseFloat($('target').value);
    const s = estimateSEE(currentType, r.total, r.max, target);
    const stampClass = s.achievable ? 'pass' : 'fail';
    // Always show the actual computed number, even when it's beyond what's
    // achievable — a bare "not reachable" symbol with no figure looked like
    // the tool had simply stopped working for every target except a Pass.
    const neededDisplay = Math.ceil(Math.max(s.neededSEE,0));
    $('seeResult').innerHTML = `
      <div class="stamp ${stampClass}"><span class="g">${neededDisplay}</span><span class="t">${s.achievable ? 'SEE NEEDED' : 'NOT REACHABLE'}</span></div>
      <div class="result-detail">
        <div class="big">${s.cieLabel}: ${fmt(s.cie)} / ${s.cieMax}</div>
        <div class="note">${s.achievable ? s.message : `That needs ${neededDisplay} / ${s.seeMax} in SEE, which is above the maximum &mdash; even a full ${s.seeMax}/${s.seeMax} won't reach this target. Aim lower, or raise CIE first.`}</div>
      </div>`;
  }

  coursePick.addEventListener('change', recompute);
  ['q1','q2','q3','t1','t2','t3','el','lab','elLab','pbl','labSem23'].forEach(id => {
    const el = $(id);
    if(el) el.addEventListener('input', recompute);
  });
  $('target').addEventListener('change', recompute);

  recompute();
})();
