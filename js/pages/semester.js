(function(){
  const { qs, withParams, mount } = window.MCA.site;
  const { YEAR_SEMS, semesterList, coursesFor } = window.MCA.courses;
  const DATA = window.MCA.DATA;

  const scheme = qs('scheme');

  if(scheme !== '2024'){
    window.location.replace('scheme.html');
    return;
  }

  mount({
    active: 'start',
    trail: [
      { label:'Home', href:'../index.html' },
      { label:'Scheme', href:'scheme.html' },
      { label:'2024 Scheme', href: withParams('semester.html', { scheme }) },
      { label:'Semester' }
    ]
  });

  const cap = window.MCA.icons.graduationCap;
  const colors = ['blue','green','purple','orange'];
  const yearLabels = { '1':'Year 1', '2':'Year 2' };

  // All four semesters at once, grouped by year as a section heading —
  // one click from scheme straight to a semester, no separate year step.
  const groupsHtml = Object.keys(YEAR_SEMS).map(y=>{
    const cardsHtml = YEAR_SEMS[y].map(s=>{
      const d = DATA.semesters[s];
      const courseCount = coursesFor(s).length;
      const colorIdx = semesterList().indexOf(s);
      return `<a class="choice-card iconed" href="${withParams('tools.html', { scheme, semester:s })}">
        <div class="icon-badge soft ${colors[colorIdx % colors.length]}">${cap}</div>
        <div class="choice-title">Semester ${s}</div>
        <div class="choice-sub">${d.totalCredits} credits &middot; ${courseCount} courses</div>
      </a>`;
    }).join('');
    return `
      <div class="semester-group">
        <div class="semester-group-label">${yearLabels[y] || `Year ${y}`}</div>
        <div class="choice-grid">${cardsHtml}</div>
      </div>`;
  }).join('');

  document.getElementById('semGroups').innerHTML = groupsHtml;
})();

