(function(){
  const { mount } = window.MCA.site;
  const { escapeHTML } = window.MCA.util;

  mount({
    active: 'achievements',
    trail: [
      { label:'Home', href:'../index.html' },
      { label:'Achievements' }
    ]
  });

  const CATEGORY_LABELS = {
    academic: 'Academic',
    usage: 'Usage',
    streak: 'Streak',
    exploration: 'Exploration',
    hidden: 'Secret'
  };

  function dateLabel(iso){
    if(!iso) return '';
    try{
      return new Date(iso).toLocaleDateString(undefined, { year:'numeric', month:'short', day:'numeric' });
    }catch(e){ return ''; }
  }

  function cardHTML(a, unlocked, isHiddenLocked){
    const engine = window.MCA.achievements;
    const iconKey = isHiddenLocked ? 'mystery' : a.icon;
    const icon = engine.icons[iconKey] || engine.icons.star;
    const name = isHiddenLocked ? 'Hidden Achievement' : a.name;
    const desc = isHiddenLocked ? 'This achievement contains a hidden unlock condition.' : a.description;
    const stateClass = unlocked ? 'unlocked' : (isHiddenLocked ? 'hidden-locked' : 'locked');
    const catClass = 'cat-' + a.category;

    return `
      <div class="achv-card ${stateClass} ${unlocked ? catClass : ''}">
        <div class="achv-badge">${icon}</div>
        <div class="achv-body">
          <div class="achv-name">${escapeHTML(name)}</div>
          <div class="achv-desc">${escapeHTML(desc)}</div>
          ${unlocked ? `<div class="achv-date">Unlocked ${escapeHTML(dateLabel(engine.unlockedAt(a.id)))}</div>` : ''}
          ${!isHiddenLocked ? `<span class="achv-category-chip ${unlocked ? '' : catClass}">${escapeHTML(CATEGORY_LABELS[a.category] || a.category)}</span>` : ''}
        </div>
      </div>`;
  }

  function renderLoginBanner(signedIn){
    const host = document.getElementById('achvLoginBanner');
    if(signedIn){ host.innerHTML = ''; return; }
    host.innerHTML = `<div class="disclaimer-banner achv-login-banner">Log in to unlock and collect achievements.</div>`;
  }

  function render(){
    const engine = window.MCA.achievements;
    const signedIn = window.MCA.isSignedIn();
    renderLoginBanner(signedIn);

    const all = engine.list().map(a=>{
      const unlocked = signedIn && engine.isUnlocked(a.id);
      const isHiddenLocked = a.hidden && !unlocked;
      return { a, unlocked, isHiddenLocked, at: unlocked ? engine.unlockedAt(a.id) : null };
    });

    // Unlocked first (most recent first), then everything still locked
    // (hidden or not) in catalog order — one collection, greyscale by
    // default, colour the instant it's earned.
    all.sort((x, y)=>{
      if(x.unlocked !== y.unlocked) return x.unlocked ? -1 : 1;
      if(x.unlocked) return new Date(y.at) - new Date(x.at);
      return 0;
    });

    const unlockedCount = signedIn ? engine.unlockedCount() : 0;
    const total = engine.total();

    document.getElementById('achvSummary').innerHTML = `
      <div class="achv-summary">
        <div>
          <div class="achv-summary-count">${unlockedCount} <span>/ ${total} Unlocked</span></div>
          <div class="achv-summary-label">Complete activities to unlock badges and build your collection.</div>
        </div>
      </div>`;
    document.getElementById('achvProgressFill').style.width = (total ? (unlockedCount / total * 100) : 0) + '%';

    const grid = document.getElementById('achvGrid');
    if(!all.length){
      grid.className = '';
      grid.innerHTML = '';
      return;
    }
    grid.className = 'achv-grid';
    grid.innerHTML = all.map(x => cardHTML(x.a, x.unlocked, x.isHiddenLocked)).join('');
  }

  window.MCA.achievements.ready().then(render);

  // React immediately when something unlocks while the page is open,
  // and re-render on sign-in/out so the login banner and counts stay
  // in sync without a manual refresh.
  document.addEventListener('achievement-unlocked', render);
  document.addEventListener('signed-in', ()=>{ window.MCA.achievements.ready().then(render); });
  document.addEventListener('signed-out', render);
})();
