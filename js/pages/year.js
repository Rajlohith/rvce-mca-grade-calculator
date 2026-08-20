(function(){
  const { qs, withParams, mount } = window.MCA.site;
  const scheme = qs('scheme');

  if(scheme !== '2024'){
    window.location.replace('scheme.html');
    return;
  }

  mount({
    active: 'start',
    trail: [
      { label:'Home', href:'index.html' },
      { label:'Scheme', href:'scheme.html' },
      { label:'2024 Scheme', href: withParams('year.html', { scheme }) },
      { label:'Year' }
    ]
  });

  const years = [
    { year:'1', title:'Year 1', sub:'Semesters I &amp; II' },
    { year:'2', title:'Year 2', sub:'Semesters III &amp; IV' }
  ];

  document.getElementById('yearGrid').innerHTML = years.map(y=>`
    <a class="choice-card" href="${withParams('semester.html', { scheme, year:y.year })}">
      <div class="choice-title">${y.title}</div>
      <div class="choice-sub">${y.sub}</div>
    </a>`).join('');
})();
