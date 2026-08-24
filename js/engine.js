/* ==========================================================================
   engine.js — pure calculation functions, no DOM.
   Every view calls these and renders the result itself, so the same
   engine works whether the tool is opened fresh, re-opened, or
   pre-seeded from a chosen course.
   ========================================================================== */
window.MCA = window.MCA || {};

(function(){
  const { clampNum, fmt, gradeFromPct } = window.MCA.grading;

  /* ---------- CIE Finalizer (Table 4.2.1 – 4.2.3) ----------
     Quiz and Test each have three attempts (I, II, III); only the best two
     of the three count, matching how these are actually run. Experiential
     Learning is a single combined mark out of 40 rather than the three
     sub-components broken out — the syllabus doesn't require tracking the
     case-study / program-specific / seminar split separately to arrive at
     a finalized CIE. */
  function bestTwoOfThree(a,b,c){
    return [a,b,c].sort((x,y)=>y-x).slice(0,2).reduce((s,n)=>s+n,0);
  }

  function computeCIE(type, v, labScheme){
    const q1=clampNum(v.q1,0,10), q2=clampNum(v.q2,0,10), q3=clampNum(v.q3,0,10);
    const t1=clampNum(v.t1,0,50), t2=clampNum(v.t2,0,50), t3=clampNum(v.t3,0,50);
    const el=clampNum(v.el,0,40);

    const quiz = bestTwoOfThree(q1,q2,q3);           // best 2 of 3, each /10 → /20
    const testRaw = bestTwoOfThree(t1,t2,t3);         // best 2 of 3, each /50 → /100
    const testScaled = testRaw/100*40;                 // scaled down to /40
    const quizTest = quiz+testScaled;

    let rows=[], total=0, max=0, note='', passesFloor=false;
    if(type==='theory'){
      const theoryCIE = quizTest+el;
      total = theoryCIE; max = 100;
      rows = [
        ['Quiz (best 2 of 3)', fmt(quiz)+' / 20'],
        ['Test (best 2 of 3, scaled)', fmt(testScaled)+' / 40'],
        ['Experiential Learning', fmt(el)+' / 40'],
      ];
      const ok = quizTest>=30 && total>=50;
      passesFloor = ok;
      note = `Passing floor: Quiz+Test &ge;30/60 <b>and</b> overall CIE &ge;50/100. Currently Quiz+Test ${fmt(quizTest)}/60, CIE ${fmt(total)}/100 &mdash; <b style="color:${ok?'#16a34a':'#dc2626'}">${ok?'meets the CIE floor':'below the CIE floor'}</b>.`;
    } else if(type==='theory-lab' && labScheme==='sem23'){
      /* Semester II & III: PBL (Project Based Learning) stands in for the
         theory-side Experiential Learning mark — same 40-mark size, same
         role in the floor checks, just relabeled. Lab / Practical CIE
         stays a single 50-mark field (no separate lab EL here, since
         that's folded into PBL too). Quiz+Test+PBL = 100 "theory"
         subtotal + 50 lab = 150 total, mirroring Semester I's structure
         exactly. PBL itself isn't named in the published handbook table —
         it's how these two semesters are actually run — but the same
         floors apply as they would for EL. */
      const pbl = clampNum(v.pbl,0,40);
      const labCIE = clampNum(v.lab,0,50);
      const theoryEquiv = quizTest+pbl;
      total = theoryEquiv + labCIE; max = 150;
      rows = [
        ['Quiz (best 2 of 3)', fmt(quiz)+' / 20'],
        ['Test (best 2 of 3, scaled)', fmt(testScaled)+' / 40'],
        ['PBL (Project Based Learning)', fmt(pbl)+' / 40'],
        ['Theory-equivalent subtotal', fmt(theoryEquiv)+' / 100'],
        ['Lab / Practical CIE', fmt(labCIE)+' / 50'],
      ];
      const thOk = quizTest>=24 && theoryEquiv>=40;
      const labOk = labCIE>=25;
      const totOk = total>=75;
      passesFloor = thOk && labOk && totOk;
      note = `Semester II &amp; III use PBL in place of Experiential Learning, not a labeling in the published handbook table, but the same floors apply: Quiz+Test &ge;24/60 &amp; Quiz+Test+PBL &ge;40/100 (${thOk?'met':'not met'}); Lab CIE &ge;25/50 (${labOk?'met':'not met'}); combined CIE &ge;75/150 (${totOk?'met':'not met'}).`;
    } else if(type==='theory-lab'){
      /* Semester I: Lab / Practical CIE is a single combined 50-mark field
         (record + test, plus Lab Experiential Learning), matching Table
         4.2.2's "Practicals 50" line as one number rather than tracking
         the 40+10 split separately. */
      const theoryCIE = quizTest+el;
      const lab = clampNum(v.lab,0,50);
      total = theoryCIE + lab; max = 150;
      rows = [
        ['Quiz (best 2 of 3)', fmt(quiz)+' / 20'],
        ['Test (best 2 of 3, scaled)', fmt(testScaled)+' / 40'],
        ['Experiential Learning', fmt(el)+' / 40'],
        ['Theory CIE subtotal', fmt(theoryCIE)+' / 100'],
        ['Lab (record + test)', fmt(lab)+' / 50'],
      ];
      const thOk = quizTest>=24 && theoryCIE>=40;
      const labOk = lab>=25;
      const totOk = total>=75;
      passesFloor = thOk && labOk && totOk;
      note = `Theory Quiz+Test &ge;24/60 &amp; Theory CIE &ge;40/100 (${thOk?'met':'not met'}); Lab (CIE+EL) &ge;25/50 (${labOk?'met':'not met'}); combined CIE &ge;75/150 (${totOk?'met':'not met'}).`;
    } else {
      const lab=clampNum(v.lab,0,40);
      const elLab=clampNum(v.elLab,0,10);
      total = lab + elLab; max = 50;
      rows = [
        ['Lab (record + test)', fmt(lab)+' / 40'],
        ['Experiential Learning', fmt(elLab)+' / 10'],
      ];
      const ok = total>=25;
      passesFloor = ok;
      note = `Passing floor: CIE &ge;25/50 &mdash; currently <b style="color:${ok?'#16a34a':'#dc2626'}">${fmt(total)}/50 ${ok?'(met)':'(not met)'}</b>.`;
    }
    const pct = max ? total/max*100 : 0;
    /* If the CIE floor isn't met, Section 4.2 marks the course 'DX' — the
       student isn't eligible to sit the SEE for it at all until they
       re-register and clear the CIE requirement in a later semester. */

    /* ---------- Department rounding: ceiling to the next whole mark ----------
       RVCE's MCA department finalizes a course's CIE by rounding UP to the
       next whole number, not to the nearest one — so a raw total of 135.1
       or 135.4 both finalize as 136, the same as 135.9 would. This is a
       ceiling, not standard rounding: 135.0 stays 135, but anything above
       that up to 136.0 becomes 136. `total` is first rounded to 2 decimals
       to strip ordinary floating-point noise (e.g. 135.40000000000003)
       before the ceiling is applied, so a value that's genuinely exactly
       135.4 doesn't accidentally read as "135.40000001" and still ceils
       correctly either way.
       This finalTotal — not the raw decimal above — is what actually gets
       used as the CIE input for every SEE-requirement calculation below,
       because that's the number your department will use once the
       semester is finalized. */
    const finalTotal = Math.ceil(fmt(total));
    const finalPct = max ? Math.ceil(fmt(finalTotal/max*100)) : 0;
    return { rows, total, max, pct, note, passesFloor, dx: !passesFloor, finalTotal, finalPct };
  }

  /* ---------- SEE Requirement Estimator ----------
     Takes the CIE total and max straight from computeCIE() above — SEE
     itself is unaffected by which CIE breakdown applied and stays
     Theory 100 + Lab 50 either way. */
  function estimateSEE(type, cie, cieMax, targetPct){
    const seeMax = type==='theory' ? 100 : type==='theory-lab' ? 150 : 50;
    const floor = type==='theory' ? 40 : type==='theory-lab' ? 65 : 25;
    const cieLabel = type==='theory' ? 'CIE' : type==='theory-lab' ? 'CIE (Theory+Lab)' : 'CIE';
    const maxTotal = cieMax+seeMax;
    const neededAgg = targetPct/100*maxTotal;
    const neededSEE = Math.max(neededAgg - cie, floor);
    const achievable = neededSEE<=seeMax;
    const message = type==='theory-lab'
      ? `Need at least ${fmt(Math.max(neededSEE,0))} / 150 combined SEE &mdash; minimum 40/100 theory and 25/50 lab, split as you like.`
      : type==='theory'
        ? `Need ${fmt(Math.max(neededSEE,0))} / 100 in the theory SEE.`
        : `Need ${fmt(Math.max(neededSEE,0))} / 50 in the lab SEE.`;
    return { cie, cieMax, cieLabel, seeMax, neededSEE, achievable, message };
  }

  /* ---------- All-grade SEE requirements (for the SEE Requirements popup) ----------
     Given a finalized CIE and, for a theory+lab course, an optional fixed
     Lab SEE contribution, returns what's needed in SEE for every passing
     grade band at once, instead of checking one target at a time. */
  function allGradeRequirements(type, cie, cieMax, labSeeFixed){
    const bands = window.MCA.DATA.grading.bands.filter(b => b.grade !== 'F');
    const seeMax = type==='theory' ? 100 : type==='theory-lab' ? 150 : 50;
    const combinedFloor = type==='theory' ? 40 : type==='theory-lab' ? 65 : 25;
    const maxTotal = cieMax+seeMax;
    const hasLabSplit = type==='theory-lab' && labSeeFixed !== null && labSeeFixed !== undefined && !isNaN(labSeeFixed);
    // Table 4.4: Practice component of SEE must independently be >=50% of
    // its own 50 marks (>=25/50), regardless of how the theory side lands.
    // A fixed Lab SEE entry below this floor makes the course unpassable
    // no matter what the theory SEE is, so it must never be reported as
    // achievable (this was previously missed — see Bug #4).
    const labSeeMeetsFloor = !hasLabSplit || (labSeeFixed >= 25 && labSeeFixed <= 50);

    return bands.map(b=>{
      const neededAgg = b.min/100*maxTotal;
      const neededSEETotal = Math.max(neededAgg - cie, combinedFloor);
      if(hasLabSplit){
        const theorySEE = Math.max(neededSEETotal - labSeeFixed, 40);
        const labLabel = `Lab fixed at ${fmt(labSeeFixed)}/50`;
        if(!labSeeMeetsFloor){
          return {
            grade: b.grade, gp: b.gp,
            neededSEE: theorySEE, seeMax: 100,
            achievable: false,
            label: labSeeFixed > 50
              ? `Lab SEE can't exceed 50/50`
              : `Lab SEE must be &ge;25/50 to pass at all (${labLabel} is below the floor)`
          };
        }
        return {
          grade: b.grade, gp: b.gp,
          neededSEE: theorySEE, seeMax: 100,
          achievable: theorySEE<=100 && labSeeMeetsFloor,
          label: `Theory SEE ${fmt(Math.max(theorySEE,0))}/100 (${labLabel})`
        };
      }
      return {
        grade: b.grade, gp: b.gp,
        neededSEE: neededSEETotal, seeMax,
        achievable: neededSEETotal<=seeMax,
        label: `SEE ${fmt(Math.max(neededSEETotal,0))}/${seeMax}`
      };
    });
  }

  /* ---------- Final Grade Calculator (Table 4.3 + 4.4) ----------
     Theory-only and Practice-only courses have a single CIE and a single
     SEE floor:
       Theory only    CIE ≥50%, SEE ≥40%, Aggregate ≥50%
       Practice only  CIE ≥50%, SEE ≥50%, Aggregate ≥50%

     Theory+Practice courses use one combined CIE total and one combined
     SEE total (Table 4.4's TOTAL row: CIE ≥50%, SEE ≥50%, Aggregate ≥50%)
     by design choice — this is simpler to fill in than four separate
     component fields, at the cost of one known gap: Table 4.4 also sets
     floors on the Theory and Practice *components* of SEE separately
     (Theory SEE ≥40% of 100, Lab SEE ≥50% of 50), and a single combined
     number can't show whether one of those two sub-floors was individually
     missed even though the combined total clears 50%. If that matters for
     a specific course, check the Theory and Lab SEE components add up to
     at least 40 and 25 respectively before trusting a PASS here. */
  function finalGradeMax(type){
    if(type==='theory') return { cieMax:100, seeMax:100 };
    if(type==='theory-lab') return { cieMax:150, seeMax:150 };
    return { cieMax:50, seeMax:50 };
  }

  function computeFinalGrade(type, v){
    const { cieMax, seeMax } = finalGradeMax(type);
    const cie = clampNum(v.cie,0,cieMax);
    const see = clampNum(v.see,0,seeMax);
    const total = cie+see, max = cieMax+seeMax;
    const seeFloorPct = type==='theory' ? 40 : 50;

    const badges = [];
    const b1 = (cie/cieMax*100) >= 50; badges.push([`CIE ≥50% (${cieMax*0.5}/${cieMax})`, b1]);
    const b2 = (see/seeMax*100) >= seeFloorPct; badges.push([`SEE ≥${seeFloorPct}% (${Math.round(seeMax*seeFloorPct/100)}/${seeMax})`, b2]);
    const b3 = (total/max*100) >= 50; badges.push(['Aggregate ≥50%', b3]);
    const allOk = b1&&b2&&b3;

    const pct = total/max*100;
    const band = gradeFromPct(pct);
    const isPass = allOk && band.grade!=='F';
    /* Same department ceiling convention as the CIE Finalizer (see
       computeCIE above) applied to the finalized aggregate here too. */
    const finalTotal = Math.ceil(fmt(total));
    const finalPct = max ? Math.ceil(fmt(finalTotal/max*100)) : 0;
    return {
      total, max, pct, cie, cieMax, see, seeMax, badges, isPass,
      letter: allOk?band.grade:'F', gp: allOk?band.gp:0,
      finalTotal, finalPct,
      componentCaveat: type==='theory-lab'
    };
  }

  /* ---------- SGPA ---------- */
  function computeSGPA(rows){
    const { isTransitional, gpFromLetter } = window.MCA.grading;
    let regCredits=0, countedCredits=0, weighted=0, earnedCredits=0;
    rows.forEach(r=>{
      const credit = clampNum(r.credit,0,20);
      regCredits += credit;
      if(!isTransitional(r.grade)){
        const gp = gpFromLetter(r.grade) ?? 0;
        countedCredits += credit;
        weighted += credit*gp;
        if(r.grade!=='F') earnedCredits += credit;
      }
    });
    const sgpa = countedCredits ? weighted/countedCredits : 0;
    return { regCredits, countedCredits, earnedCredits, sgpa };
  }

  /* ---------- CGPA ---------- */
  function computeCGPA(rows){
    const { degreeClass } = window.MCA.grading;
    let totalCredits=0, weighted=0;
    rows.forEach(r=>{
      const sgpa = clampNum(r.sgpa,0,10);
      const credits = clampNum(r.credits,0,60);
      totalCredits += credits;
      weighted += sgpa*credits;
    });
    const cgpa = totalCredits ? weighted/totalCredits : 0;
    return { totalCredits, cgpa, cls: degreeClass(cgpa) };
  }

  /* ---------- CGPA blend (prior CGPA + current semester, without
     re-entering every past semester individually) ---------- */
  function blendCGPA(priorCgpa, priorCredits, currentSgpa, currentCredits){
    priorCgpa = clampNum(priorCgpa,0,10);
    priorCredits = clampNum(priorCredits,0,200);
    currentSgpa = clampNum(currentSgpa,0,10);
    currentCredits = clampNum(currentCredits,0,60);
    const totalCredits = priorCredits+currentCredits;
    const cgpa = totalCredits ? (priorCgpa*priorCredits + currentSgpa*currentCredits)/totalCredits : 0;
    return { cgpa, totalCredits, degreeClass: window.MCA.grading.degreeClass(cgpa) };
  }

  window.MCA.engine = { computeCIE, estimateSEE, allGradeRequirements, computeFinalGrade, computeSGPA, computeCGPA, blendCGPA };
})();
