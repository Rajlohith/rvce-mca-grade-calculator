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
      { label:'Home', href:'../index.html' },
      { label:'Scheme', href:'scheme.html' },
      { label:'2024 Scheme', href: withParams('year.html', { scheme }) },
      { label:'Year' }
    ]
  });

  const years = [
    { year:'1', title:'Year 1', sub:'Semesters I &amp; II', color:'blue' },
    { year:'2', title:'Year 2', sub:'Semesters III &amp; IV', color:'purple' }
  ];
  const cap = window.MCA.icons.graduationCap;

  document.getElementById('yearGrid').innerHTML = years.map(y=>`
    <a class="choice-card iconed" href="${withParams('semester.html', { scheme, year:y.year })}">
      <div class="icon-badge soft ${y.color}">${cap}</div>
      <div class="choice-title">${y.title}</div>
      <div class="choice-sub">${y.sub}</div>
    </a>`).join('');
})();
