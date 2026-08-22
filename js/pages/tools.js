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
  const tools = [
    {
      page:'cie-see.html',
      title:'CIE Finalization &amp; SEE Marks Required',
      sub:'Tally your CIE, then see what SEE score hits your target grade'
    },
    {
      page:'final-grade.html',
      title:'Final Grade Calculator',
      sub:'Plug in what you actually scored, get the letter grade'
    },
    {
      page:'final-gpa.html',
      title:'Final GPA Calculator',
      sub:'SGPA for this semester, using its real courses only'
    }
  ];

  document.getElementById('toolGrid').innerHTML = tools.map(t=>`
    <a class="choice-card" href="${withParams(t.page, params)}">
      <div class="choice-title">${t.title}</div>
      <div class="choice-sub">${t.sub}</div>
    </a>`).join('');
})();
