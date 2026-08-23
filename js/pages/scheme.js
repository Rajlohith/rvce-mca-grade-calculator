(function(){
  window.MCA.site.mount({
    active: 'start',
    trail: [
      { label:'Home', href:'../index.html' },
      { label:'Scheme' }
    ]
  });
  document.getElementById('schemeIcon2024').innerHTML = window.MCA.icons.layers;
  document.getElementById('schemeIcon2026').innerHTML = window.MCA.icons.layers;
})();
