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

  window.MCA.grading = {
    bands: G.bands,
    transitional: G.transitionalGrades,
    standards: G.passingStandards,
    gradeFromPct, gpFromLetter, isTransitional, clampNum, fmt, degreeClass
  };
})();
