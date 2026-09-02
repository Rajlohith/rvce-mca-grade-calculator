(function(){
  window.MCA.site.mount({
    active: 'guide',
    trail: [
      { label:'Home', href:'../index.html' },
      { label:'Guide' }
    ]
  });

  if(window.MCA.achievements) window.MCA.achievements.track('guide_viewed', {});
})();
