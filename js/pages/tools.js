(function(){
  const { qs, withParams, mount } = window.MCA.site;
  const { YEAR_SEMS, coursesFor } = window.MCA.courses;
  const DATA = window.MCA.DATA;

  const scheme = qs('scheme');
  const year = qs('year');
  const semester = qs('semester');
  const validSem = semester && DATA.semesters[semester] && YEAR_SEMS[year] && YEAR_SEMS[year].includes(semester);

  if(scheme !== '2024' || !validSem){
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
      { label:`Semester ${semester}`, href: withParams('tools.html', { scheme, year, semester }) },
      { label:'Tools' }
    ]
  });

  const d = DATA.semesters[semester];
  const courseCount = coursesFor(semester).length;
  document.getElementById('toolTitle').textContent = `Semester ${semester}`;
  document.getElementById('toolSub').textContent = `${d.totalCredits} credits across ${courseCount} courses \u00b7 what do you need?`;

  const params = { scheme, year, semester };
  const { calculator, bookOpen, award, arrowRight } = window.MCA.icons;
  const tools = [
    {
      page:'cie-see.html',
      title:'CIE Finalization &amp; SEE Marks Required',
      sub:'Tally your CIE, then see what SEE score hits your target grade',
      icon: calculator, color:'blue'
    },
    {
      page:'final-grade.html',
      title:'Final Grade Calculator',
      sub:'Plug in what you actually scored, get the letter grade',
      icon: bookOpen, color:'purple'
    },
    {
      page:'final-gpa.html',
      title:'Final SGPA Calculator',
      sub:'SGPA for this semester, plus your running CGPA',
      icon: award, color:'green'
    }
  ];

  document.getElementById('toolGrid').innerHTML = tools.map(t=>`
    <a class="list-card" href="${withParams(t.page, params)}">
      <div class="icon-badge solid ${t.color}">${t.icon}</div>
      <div class="list-card-body">
        <div class="list-card-title">${t.title}</div>
        <div class="list-card-sub">${t.sub}</div>
      </div>
      <div class="list-card-arrow">${arrowRight}</div>
    </a>`).join('');
})();
