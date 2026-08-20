(function(){
  const { qs, withParams, mount } = window.MCA.site;
  const { YEAR_SEMS, coursesFor } = window.MCA.courses;
  const { computeSGPA } = window.MCA.engine;
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
      { label:'Final GPA' }
    ]
  });
  document.getElementById('toolEyebrow').textContent = `Semester ${semester} \u00b7 2024 Scheme`;

  const GRADE_OPTS = ['O','A+','A','B+','B','C','F','W','I','X','DX','AB'];
  const gradeOptsHTML = () => GRADE_OPTS.map(g=>`<option value="${g}">${g}</option>`).join('');

  const body = document.querySelector('#gpaTable tbody');
  const courses = coursesFor(semester);

  courses.forEach(c=>{
    const tr = document.createElement('tr');
    if(c.creditBearing === false) tr.classList.add('non-credit');

    let courseCell;
    if(c.electives && c.electives.length){
      const opts = c.electives.map(e=>`<option value="${e.code}">${e.code} &mdash; ${e.title}</option>`).join('');
      courseCell = `
        <span class="course-code">${c.code}</span>
        <select class="elective-pick" style="margin-top:4px;">${opts}</select>`;
    } else {
      courseCell = `
        <span class="course-code">${c.code}</span>
        <span class="course-name">${c.title}</span>
        ${c.note ? `<span class="course-note">${c.note}</span>` : ''}`;
    }

    tr.innerHTML = `
      <td>${courseCell}</td>
      <td class="credit-col locked-credit">${c.credits}</td>
      <td class="grade-col"><select class="r-grade">${gradeOptsHTML()}</select></td>`;

    tr.dataset.credits = c.credits;
    tr.querySelector('.r-grade').addEventListener('change', recompute);
    body.appendChild(tr);
  });

  function recompute(){
    const rows = [...body.querySelectorAll('tr')].map(tr=>({
      credit: tr.dataset.credits,
      grade: tr.querySelector('.r-grade').value
    }));
    const r = computeSGPA(rows);
    document.getElementById('gpaResult').innerHTML = `
      <div style="flex:1">
        <div class="breakdown">
          <div class="row"><span>Credits registered</span><span>${fmt(r.regCredits)}</span></div>
          <div class="row"><span>Credits counted toward SGPA</span><span>${fmt(r.countedCredits)}</span></div>
          <div class="row"><span>Credits earned</span><span>${fmt(r.earnedCredits)}</span></div>
          <div class="row total"><span>SGPA</span><span>${fmt(r.sgpa)}</span></div>
        </div>
      </div>`;
  }

  recompute();
})();
