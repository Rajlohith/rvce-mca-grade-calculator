/* ==========================================================================
   grading.js — shared constants & math, sourced from window.MCA.DATA.grading
   (Table 4.3 Grading System, Table 4.4 Passing Standards)
   ========================================================================== */
window.MCA = window.MCA || {};

(function(){
  const G = window.MCA.DATA.grading;

  function gradeFromPct(pct){
    for(const b of G.bands) if(pct >= b.min - 1e-9) return b;
    return G.bands[G.bands.length-1];
  }
  function gpFromLetter(letter){
    const b = G.bands.find(x=>x.grade===letter);
    return b ? b.gp : null;
  }
  function isTransitional(grade){
    return G.transitionalGrades.includes(grade);
  }
  function clampNum(v, lo, hi){
    v = parseFloat(v); if(isNaN(v)) v = 0;
    if(lo!==undefined) v = Math.max(lo, v);
    if(hi!==undefined) v = Math.min(hi, v);
    return v;
  }
  function fmt(n){ return (Math.round(n*100)/100).toString(); }
  function degreeClass(cgpa){
    for(const c of G.degreeClass) if(cgpa >= c.minCgpa) return c.class;
    return 'Not yet eligible';
  }

  /* Reusable "Grade Scale Reference" strip — CIE and Final Grade pages both
     show this, built from the real grading table rather than duplicated
     markup, so it can never drift out of sync with the actual bands. */
  function renderGradeScale(){
    const cells = G.bands.map(b=>`
      <div class="gs-cell">
        <div class="gs-point">${b.gp}</div>
        <div class="gs-letter">${b.grade}</div>
      </div>`).join('');
    return `
      <div class="card">
        <h2 style="font-size:15px;">Grade Scale Reference</h2>
        <div class="grade-scale">${cells}</div>
      </div>`;
  }

  window.MCA.grading = {
    bands: G.bands,
    transitional: G.transitionalGrades,
    standards: G.passingStandards,
    gradeFromPct, gpFromLetter, isTransitional, clampNum, fmt, degreeClass, renderGradeScale
  };
})();
