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
  
  /* Rounds to 2 decimal places for display. Delegates to util.round2, which
     nudges the value by a tiny epsilon before rounding so a value that is
     "really" 135.2 but arrived as 135.19999999999998 (ordinary floating
     point noise from summing Quiz+Test+EL+Lab) still reads as 135.2 rather
     than 135.19 — this is standard round-half-up to 2 decimals, applied
     consistently everywhere marks are shown; it never rounds a value up
     past its true value (no ceiling behaviour anywhere in this codebase). */
  function fmt(n){ return window.MCA.util.round2(n).toString(); }
  function degreeClass(cgpa){
    for(const c of G.degreeClass) if(cgpa >= c.minCgpa) return c.class;
    return 'Not yet eligible';
  }

  /* Reusable "Grade Scale Reference" strip — CIE and Final Grade pages both
     show this, built from the real grading table rather than duplicated
     markup, so it can never drift out of sync with the actual bands. */
  function renderGradeScale() {
  const bands = G.bands;

  const percentageRanges = bands.map((b, i) => {
    if (b.grade === 'O') return '90-100';

    const nextHigher = bands[i - 1];
    return `${b.min}-${nextHigher.min - 1}`;
  });

  return `
    <div class="card grade-scale-card">
      <h2>Grade Scale Reference</h2>

      <div class="grade-scale-table-wrap">
        <table class="grade-scale-table">
          <thead>
            <tr>
              <th>Letter Grade</th>
              ${bands.map(b => `
                <th>${b.grade}</th>
              `).join('')}
            </tr>
          </thead>

          <tbody>
            <tr>
              <th>Grade Point</th>
              ${bands.map(b => `
                <td>${b.gp}</td>
              `).join('')}
            </tr>

            <tr>
              <th>% of Marks<br>secured</th>
              ${percentageRanges.map(range => `
                <td>${range}</td>
              `).join('')}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `;
  }

  window.MCA.grading = {
    bands: G.bands,
    transitional: G.transitionalGrades,
    standards: G.passingStandards,
    gradeFromPct, gpFromLetter, isTransitional, clampNum, fmt, degreeClass, renderGradeScale
  };
})();
