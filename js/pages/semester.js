(function(){
  const { qs, withParams, mount } = window.MCA.site;
  const { YEAR_SEMS, coursesFor } = window.MCA.courses;
  const DATA = window.MCA.DATA;

  const scheme = qs('scheme');
  const year = qs('year');

  if(scheme !== '2024' || !YEAR_SEMS[year]){
    window.location.replace('scheme.html');
    return;
  }

  mount({
    active: 'start',
    trail: [
      { label:'Home', href:'../index.html' },
      { label:'Scheme', href:'scheme.html' },
      { label:'2024 Scheme', href: withParams('year.html', { scheme }) },
      { label:`Year ${year}`, href: withParams('semester.html', { scheme, year }) },
      { label:'Semester' }
    ]
  });

  document.getElementById('semSub').textContent = `2024 Scheme \u00b7 Year ${year}`;

  const sems = YEAR_SEMS[year];
  document.getElementById('semGrid').innerHTML = sems.map(s=>{
    const d = DATA.semesters[s];
    const courseCount = coursesFor(s).length;
    return `<a class="choice-card" href="${withParams('tools.html', { scheme, year, semester:s })}">
      <div class="choice-title">Semester ${s}</div>
      <div class="choice-sub">${d.totalCredits} credits &middot; ${courseCount} courses</div>
    </a>`;
  }).join('');
})();
