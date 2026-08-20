/* ==========================================================================
   engine.js — pure calculation functions, no DOM.
   Every view calls these and renders the result itself, so the same
   engine works whether the tool is opened fresh, re-opened, or
   pre-seeded from a chosen course.
   ========================================================================== */
window.MCA = window.MCA || {};

(function(){
  const { clampNum, fmt, gradeFromPct } = window.MCA.grading;

  /* ---------- CIE Finalizer (Table 4.2.1 – 4.2.3) ---------- */
  function computeCIE(type, v){
    const q1=clampNum(v.q1,0,10), q2=clampNum(v.q2,0,10);
    const t1=clampNum(v.t1,0,50), t2=clampNum(v.t2,0,50);
    const el1=clampNum(v.el1,0,10), el2=clampNum(v.el2,0,20), el3=clampNum(v.el3,0,10);
    const lab=clampNum(v.lab,0, type==='lab'?40:50);
    const elLab=clampNum(v.elLab,0,10);

    const quiz = q1+q2;
    const testScaled = (t1+t2)/100*40;
    const elTotal = el1+el2+el3;
    const theoryCIE = quiz+testScaled+elTotal;
    const quizTest = quiz+testScaled;

    let rows=[], total=0, max=0, note='';
    if(type==='theory'){
      total = theoryCIE; max = 100;
      rows = [
        ['Quiz (I+II)', fmt(quiz)+' / 20'],
        ['Test (scaled)', fmt(testScaled)+' / 40'],
        ['Experiential Learning', fmt(elTotal)+' / 40'],
      ];
      const ok = quizTest>=30 && total>=50;
      note = `Passing floor: Quiz+Test &ge;30/60 <b>and</b> overall CIE &ge;50/100. Currently Quiz+Test ${fmt(quizTest)}/60, CIE ${fmt(total)}/100 &mdash; <b style="color:${ok?'#0e6e55':'#b33a3a'}">${ok?'meets the CIE floor':'below the CIE floor'}</b>.`;
    } else if(type==='theory-lab'){
      total = theoryCIE + lab; max = 150;
      rows = [
        ['Quiz (I+II)', fmt(quiz)+' / 20'],
        ['Test (scaled)', fmt(testScaled)+' / 40'],
        ['Experiential Learning', fmt(elTotal)+' / 40'],
        ['Theory CIE subtotal', fmt(theoryCIE)+' / 100'],
        ['Lab / Practical CIE', fmt(lab)+' / 50'],
      ];
      const thOk = quizTest>=24 && theoryCIE>=40;
      const labOk = lab>=25;
      const totOk = total>=75;
      note = `Theory Quiz+Test &ge;24/60 &amp; Theory CIE &ge;40/100 (${thOk?'met':'not met'}); Lab CIE &ge;25/50 (${labOk?'met':'not met'}); combined CIE &ge;75/150 (${totOk?'met':'not met'}).`;
    } else {
      total = lab + elLab; max = 50;
      rows = [
        ['Lab (record + test)', fmt(lab)+' / 40'],
        ['Experiential Learning', fmt(elLab)+' / 10'],
      ];
      const ok = total>=25;
      note = `Passing floor: CIE &ge;25/50 &mdash; currently <b style="color:${ok?'#0e6e55':'#b33a3a'}">${fmt(total)}/50 ${ok?'(met)':'(not met)'}</b>.`;
    }
    const pct = max ? total/max*100 : 0;
    return { rows, total, max, pct, note };
  }

  /* ---------- SEE Requirement Estimator ---------- */
  function estimateSEE(type, v, targetPct){
    if(type==='theory'){
      const cie = clampNum(v.cie,0,100);
      const maxTotal = 200;
      const neededAgg = targetPct/100*maxTotal;
      const neededSEE = Math.max(neededAgg - cie, 40);
      return { cie, cieMax:100, cieLabel:'CIE', seeMax:100, neededSEE, achievable: neededSEE<=100,
        message:`Need ${fmt(Math.max(neededSEE,0))} / 100 in the theory SEE.` };
    } else if(type==='theory-lab'){
      const cieT = clampNum(v.cieT,0,100), cieL = clampNum(v.cieL,0,50);
      const cie = cieT+cieL;
      const maxTotal = 300;
      const neededAgg = targetPct/100*maxTotal;
      const floor = 40+25;
      const neededSEE = Math.max(neededAgg - cie, floor);
      return { cie, cieMax:150, cieLabel:'CIE (Theory+Lab)', seeMax:150, neededSEE, achievable: neededSEE<=150,
        message:`Need at least ${fmt(Math.max(neededSEE,0))} / 150 combined SEE &mdash; minimum 40/100 theory and 25/50 lab, split as you like.` };
    } else {
      const cie = clampNum(v.cieO,0,50);
      const maxTotal = 100;
      const neededAgg = targetPct/100*maxTotal;
      const neededSEE = Math.max(neededAgg - cie, 25);
      return { cie, cieMax:50, cieLabel:'CIE', seeMax:50, neededSEE, achievable: neededSEE<=50,
        message:`Need ${fmt(Math.max(neededSEE,0))} / 50 in the lab SEE.` };
    }
  }

  /* ---------- Final Grade Calculator (Table 4.3 + 4.4) ---------- */
  function computeFinalGrade(type, v){
    let total, max, badges=[], allOk=true;
    if(type==='theory'){
      const qt = clampNum(v.qt,0,60), cie = clampNum(v.cie,0,100), see = clampNum(v.see,0,100);
      total = cie+see; max=200;
      const b1 = qt>=30 && cie>=50; badges.push(['CIE floor (Quiz+Test ≥30 & CIE ≥50)', b1]);
      const b2 = see>=40; badges.push(['SEE ≥40/100', b2]);
      const b3 = (total/max*100)>=50; badges.push(['Aggregate ≥50%', b3]);
      allOk = b1&&b2&&b3;
    } else if(type==='theory-lab'){
      const qt=clampNum(v.qt,0,60), cieT=clampNum(v.cieT,0,100), cieL=clampNum(v.cieL,0,50);
      const seeT=clampNum(v.seeT,0,100), seeL=clampNum(v.seeL,0,50);
      total = cieT+cieL+seeT+seeL; max=300;
      const b1 = qt>=24 && cieT>=40; badges.push(['Theory CIE floor', b1]);
      const b2 = cieL>=25; badges.push(['Lab CIE ≥25/50', b2]);
      const b3 = (cieT+cieL)>=75; badges.push(['Combined CIE ≥75/150', b3]);
      const b4 = seeT>=40; badges.push(['Theory SEE ≥40/100', b4]);
      const b5 = seeL>=25; badges.push(['Lab SEE ≥25/50', b5]);
      const b6 = (seeT+seeL)>=75; badges.push(['Combined SEE ≥75/150', b6]);
      const b7 = (total/max*100)>=50; badges.push(['Aggregate ≥50%', b7]);
      allOk = b1&&b2&&b3&&b4&&b5&&b6&&b7;
    } else {
      const cie=clampNum(v.cie,0,50), see=clampNum(v.see,0,50);
      total = cie+see; max=100;
      const b1 = cie>=25; badges.push(['CIE ≥25/50', b1]);
      const b2 = see>=25; badges.push(['SEE ≥25/50', b2]);
      const b3 = (total/max*100)>=50; badges.push(['Aggregate ≥50%', b3]);
      allOk = b1&&b2&&b3;
    }
    const pct = total/max*100;
    const band = gradeFromPct(pct);
    const isPass = allOk && band.grade!=='F';
    return { total, max, pct, badges, isPass, letter: allOk?band.grade:'F', gp: allOk?band.gp:0 };
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

  window.MCA.engine = { computeCIE, estimateSEE, computeFinalGrade, computeSGPA, computeCGPA };
})();