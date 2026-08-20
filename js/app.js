/* ==========================================================================
   app.js — tiny hand-rolled router. Keeps state in one object, re-renders
   #app on every navigation, rebuilds the breadcrumb from that state.
   ========================================================================== */
(function(){
  const TOOL_LABELS = {
    cieSee: 'CIE & SEE',
    finalGrade: 'Final Grade',
    finalGpa: 'Final GPA'
  };

  let state = { screen: 'home', year: null, scheme: null, semesterKey: null };

  function nav(screen, patch = {}){
    state = { ...state, ...patch, screen };
    if(screen === 'year'){ state.scheme = null; state.semesterKey = null; }
    if(screen === 'scheme'){ state.semesterKey = null; }
    render();
    document.getElementById('appTop').scrollIntoView({ behavior:'smooth', block:'start' });
  }

  function buildCrumbs(){
    const crumbs = [{ label:'Home', screen:'home' }];
    const inFlow = ['year','scheme','semester','tool','cieSee','finalGrade','finalGpa'].includes(state.screen);

    if(inFlow){
      crumbs.push({ label: state.year ? `Year ${state.year}` : 'Year', screen:'year' });
    }
    if(inFlow && (state.scheme || state.screen!=='year')){
      if(state.year) crumbs.push({ label: state.scheme ? `${state.scheme} Scheme` : 'Scheme', screen:'scheme' });
    }
    if(state.scheme && ['semester','tool','cieSee','finalGrade','finalGpa'].includes(state.screen)){
      crumbs.push({ label: state.semesterKey ? `Semester ${state.semesterKey}` : 'Semester', screen:'semester' });
    }
    if(state.semesterKey && ['tool','cieSee','finalGrade','finalGpa'].includes(state.screen)){
      crumbs.push({ label:'Tools', screen:'tool' });
    }
    if(TOOL_LABELS[state.screen]){
      crumbs.push({ label: TOOL_LABELS[state.screen], screen: state.screen });
    }
    if(state.screen==='faq') crumbs.push({ label:'FAQ', screen:'faq' });
    if(state.screen==='cgpa') crumbs.push({ label:'CGPA', screen:'cgpa' });
    return crumbs;
  }

  function renderBreadcrumb(){
    const el = document.getElementById('breadcrumb');
    if(state.screen === 'home'){ el.innerHTML = ''; el.style.display='none'; return; }
    el.style.display = '';
    const crumbs = buildCrumbs();
    el.innerHTML = crumbs.map((c,i)=>{
      const isLast = i===crumbs.length-1;
      return `<span class="crumb ${isLast?'current':''}" data-screen="${c.screen}">${c.label}</span>` +
             (isLast ? '' : `<span class="crumb-sep">›</span>`);
    }).join('');
    el.querySelectorAll('.crumb:not(.current)').forEach(c=>{
      c.addEventListener('click', ()=>nav(c.dataset.screen));
    });
  }

  function render(){
    const view = window.MCA.views[state.screen];
    const app = document.getElementById('app');
    app.innerHTML = view.render(state);
    if(view.wire) view.wire(state, nav);
    renderBreadcrumb();
  }

  function initGlobalNav(){
    document.querySelectorAll('[data-gnav]').forEach(el=>{
      el.addEventListener('click', ()=>nav(el.dataset.gnav));
    });
  }

  document.addEventListener('DOMContentLoaded', ()=>{
    initGlobalNav();
    render();
  });
})();