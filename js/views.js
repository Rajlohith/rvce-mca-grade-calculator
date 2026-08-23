/* ==========================================================================
   views.js — render() + wire() pairs for every screen.
   render(state) returns an HTML string; wire(state, nav) attaches
   listeners after that HTML has been injected into #app.
   ========================================================================== */
window.MCA = window.MCA || {};

(function(){
  const DATA = window.MCA.DATA;
  const { fmt } = window.MCA.grading;
  const { computeCIE, estimateSEE, computeFinalGrade, computeSGPA, computeCGPA } = window.MCA.engine;

  const YEAR_SEMS = { 1: ['I','II'], 2: ['III','IV'] };

  function courseOptionsHTML(semesterKey){
    const courses = DATA.semesters[semesterKey].courses.filter(c => c.creditBearing !== false);
    let html = `<option value="__manual">- manual / custom course -</option>`;
    courses.forEach(c=>{
      html += `<option value="${c.code}" data-type="${c.type}">${c.code} - ${c.title}</option>`;
    });
    return html;
  }

  function nonStandardNote(type){
    const names = { project:'Project', internship:'Internship', nptel:'NPTEL / online course' };
      return `<div class="callout"><b>${names[type] || 'This course'}</b> doesn't follow the standard CIE/SEE split, see the FAQ for how it's actually evaluated. Switch the type below to Theory / Theory+Lab / Lab if you want to model it anyway.</div>`;
  }

  /* ============================== HOME ============================== */
  const home = {
    render(){
      return `
        <div class="card" style="text-align:center;padding:40px 24px;">
          <div class="hero-kicker">RVCE · Master of Computer Applications</div>
          <h2 style="font-size:28px;margin-bottom:8px;">Pick your semester, get your numbers.</h2>
            <p class="sub" style="max-width:52ch;margin:0 auto 22px;">CIE finalization, SEE requirements, final grades, and GPA, worked out exactly the way the PG Academic Handbook defines them, for every MCA course in the 2024 scheme.</p>
          <button class="btn amber" id="startBtn" style="padding:13px 26px;font-size:14.5px;">Choose your semester →</button>
        </div>

        <div class="disclaimer-banner">
          ⚠️&nbsp; <b>Disclaimer:</b> Not official. No responsibility for discrepancies.
        </div>

        <div class="quick-links">
          <div class="quick-link" data-nav="faq">
            <div class="ql-title">FAQ</div>
            <div class="ql-sub">How every formula works</div>
          </div>
          <div class="quick-link" data-nav="cgpa">
            <div class="ql-title">CGPA Calculator</div>
            <div class="ql-sub">Across all four semesters</div>
          </div>
          <a class="quick-link" href="docs/MCA-2024-Scheme-Syllabus.pdf" target="_blank" rel="noopener">
            <div class="ql-title">Syllabus PDF</div>
            <div class="ql-sub">2024 scheme, I–IV semester</div>
          </a>
        </div>`;
    },
    wire(state, nav){
      document.getElementById('startBtn').addEventListener('click', ()=>nav('year'));
      document.querySelectorAll('.quick-link[data-nav]').forEach(el=>{
        el.addEventListener('click', ()=>nav(el.dataset.nav));
      });
    }
  };

  /* ============================== YEAR ============================== */
  const year = {
    render(){
      return `
        <div class="card">
          <h2>Which year are you in?</h2>
          <p class="sub">MCA is a 2-year, 4-semester program under the 2024 scheme.</p>
          <div class="choice-grid">
            <div class="choice-card" data-year="1">
              <div class="choice-title">Year 1</div>
              <div class="choice-sub">Semesters I &amp; II</div>
            </div>
            <div class="choice-card" data-year="2">
              <div class="choice-title">Year 2</div>
              <div class="choice-sub">Semesters III &amp; IV</div>
            </div>
          </div>
        </div>`;
    },
    wire(state, nav){
      document.querySelectorAll('.choice-card[data-year]').forEach(el=>{
        el.addEventListener('click', ()=>nav('scheme', { year: el.dataset.year }));
      });
    }
  };

  /* ============================== SCHEME ============================== */
  const scheme = {
    render(state){
      return `
        <div class="card">
          <h2>Which scheme?</h2>
          <p class="sub">Year ${state.year} · RVCE revises the MCA scheme roughly every two academic years.</p>
          <div class="choice-grid">
            <div class="choice-card" data-scheme="2024">
              <div class="choice-title">2024 Scheme</div>
              <div class="choice-sub">2024–25 &amp; 2025–26 intake</div>
            </div>
            <div class="choice-card disabled">
              <div class="choice-title">2026 Scheme</div>
              <div class="choice-sub"><span class="soon-badge">Coming soon</span></div>
            </div>
          </div>
        </div>`;
    },
    wire(state, nav){
      document.querySelectorAll('.choice-card[data-scheme]').forEach(el=>{
        el.addEventListener('click', ()=>nav('semester', { scheme: el.dataset.scheme }));
      });
    }
  };

  /* ============================== SEMESTER ============================== */
  const semester = {
    render(state){
      const sems = YEAR_SEMS[state.year];
      const cards = sems.map(s=>{
        const d = DATA.semesters[s];
        return `<div class="choice-card" data-sem="${s}">
          <div class="choice-title">Semester ${s}</div>
          <div class="choice-sub">${d.totalCredits} credits · ${d.courses.length} courses</div>
        </div>`;
      }).join('');
      return `
        <div class="card">
          <h2>Which semester?</h2>
          <p class="sub">${state.scheme} Scheme · Year ${state.year}</p>
          <div class="choice-grid">${cards}</div>
        </div>`;
    },
    wire(state, nav){
      document.querySelectorAll('.choice-card[data-sem]').forEach(el=>{
        el.addEventListener('click', ()=>nav('tool', { semesterKey: el.dataset.sem }));
      });
    }
  };

  /* ============================== TOOL PICKER ============================== */
  const tool = {
    render(state){
      const d = DATA.semesters[state.semesterKey];
      return `
        <div class="card">
          <h2>Semester ${state.semesterKey}</h2>
          <p class="sub">${d.totalCredits} credits across ${d.courses.length} courses · what do you need?</p>
          <div class="choice-grid three">
            <div class="choice-card" data-tool="cieSee">
              <div class="choice-title">CIE Finalization<br>&amp; SEE Marks Required</div>
              <div class="choice-sub">Tally your CIE, then see what SEE score hits your target grade</div>
            </div>
            <div class="choice-card" data-tool="finalGrade">
              <div class="choice-title">Final Grade Calculator</div>
              <div class="choice-sub">Plug in what you actually scored, get the letter grade</div>
            </div>
            <div class="choice-card" data-tool="finalGpa">
              <div class="choice-title">Final GPA Calculator</div>
              <div class="choice-sub">SGPA for this semester, pre-loaded with its real courses</div>
            </div>
          </div>
        </div>`;
    },
    wire(state, nav){
      document.querySelectorAll('.choice-card[data-tool]').forEach(el=>{
        el.addEventListener('click', ()=>nav(el.dataset.tool));
      });
    }
  };

  /* ============================== CIE + SEE ============================== */
  const cieSee = {
    render(state){
      return `
        <div class="card">
          <h2>CIE Finalization &amp; SEE Marks Required</h2>
          <p class="sub">Semester ${state.semesterKey} · fill in your CIE, then pick a target grade below.</p>

          <div class="field-row">
            <div class="field" style="grid-column:1/-1;">
              <label>Course</label>
              <select id="coursePick">${courseOptionsHTML(state.semesterKey)}</select>
            </div>
          </div>
          <div id="nonStdNote"></div>

          <div class="type-select" id="typeSel">
            <div class="type-opt sel" data-type="theory">Theory only</div>
            <div class="type-opt" data-type="theory-lab">Theory + Lab</div>
            <div class="type-opt" data-type="lab">Lab only</div>
          </div>

          <div id="theoryFields">
            <div class="field-row">
              <div class="field"><label>Quiz I <span class="hint">/10</span></label><input type="number" id="q1" min="0" max="10" value="0"></div>
              <div class="field"><label>Quiz II <span class="hint">/10</span></label><input type="number" id="q2" min="0" max="10" value="0"></div>
              <div class="field"><label>Test I <span class="hint">/50</span></label><input type="number" id="t1" min="0" max="50" value="0"></div>
              <div class="field"><label>Test II <span class="hint">/50</span></label><input type="number" id="t2" min="0" max="50" value="0"></div>
            </div>
            <div class="field-row">
              <div class="field"><label>EL - Case study <span class="hint">/10</span></label><input type="number" id="el1" min="0" max="10" value="0"></div>
              <div class="field"><label>EL - Program specific <span class="hint">/20</span></label><input type="number" id="el2" min="0" max="20" value="0"></div>
              <div class="field"><label>EL - Video seminar <span class="hint">/10</span></label><input type="number" id="el3" min="0" max="10" value="0"></div>
            </div>
          </div>
          <div id="labFields" style="display:none;">
            <div class="field-row">
              <div class="field"><label>Lab / Practical CIE <span class="hint" id="labMaxHint">/50</span></label><input type="number" id="lab" min="0" value="0"></div>
              <div class="field"><label>EL <span class="hint">(lab-only) /10</span></label><input type="number" id="elLab" min="0" max="10" value="0"></div>
            </div>
          </div>

          <div class="result" id="cieResult"></div>
          <div class="callout" id="cieNote"></div>

          <hr class="rule">
          <h3 style="font-size:16px;margin-bottom:10px;">SEE marks required</h3>
          <div class="field-row">
            <div class="field">
              <label>Target grade</label>
              <select id="target">
                <option value="50">C - Pass (≥50%)</option>
                <option value="55">B (≥55%)</option>
                <option value="60">B+ (≥60%)</option>
                <option value="70">A (≥70%)</option>
                <option value="80">A+ (≥80%)</option>
                <option value="90">O (≥90%)</option>
              </select>
            </div>
          </div>
          <div class="result" id="seeResult"></div>
          <div class="callout">SEE has its own floor too, <b>≥40%</b> for a theory paper, <b>≥50%</b> for a lab/practice component, applied automatically here even if the aggregate needs less.</div>
        </div>`;
    },
    wire(state, nav){
      let type = 'theory';
      const $ = id => document.getElementById(id);

      function syncTypeUI(t){
        $('theoryFields').style.display = (t==='theory'||t==='theory-lab') ? '' : 'none';
        $('labFields').style.display = (t==='theory-lab'||t==='lab') ? '' : 'none';
        $('labMaxHint').textContent = t==='lab' ? '' : '/50';
        document.querySelectorAll('#typeSel .type-opt').forEach(o=>o.classList.toggle('sel', o.dataset.type===t));
      }

      document.querySelectorAll('#typeSel .type-opt').forEach(opt=>{
        opt.addEventListener('click', ()=>{ type = opt.dataset.type; syncTypeUI(type); recompute(); });
      });

      $('coursePick').addEventListener('change', (e)=>{
        const opt = e.target.selectedOptions[0];
        const t = opt.dataset.type;
        $('nonStdNote').innerHTML = '';
        if(t && ['project','internship','nptel'].includes(t)){
          $('nonStdNote').innerHTML = nonStandardNote(t);
        } else if(t){
          type = t; syncTypeUI(type);
        }
        recompute();
      });

      const cieInputs = ['q1','q2','t1','t2','el1','el2','el3','lab','elLab'];
      cieInputs.forEach(id => $(id).addEventListener('input', recompute));
      $('target').addEventListener('change', recompute);

      function recompute(){
        const vals = {};
        cieInputs.forEach(id => vals[id] = $(id).value);
        const r = computeCIE(type, vals);
        $('cieResult').innerHTML = `
          <div style="flex:1;">
            <div class="breakdown">
              ${r.rows.map(row=>`<div class="row"><span>${row[0]}</span><span>${row[1]}</span></div>`).join('')}
              <div class="row total"><span>Finalized CIE</span><span>${fmt(r.total)} / ${r.max}  ·  ${fmt(r.pct)}%</span></div>
            </div>
          </div>`;
        $('cieNote').innerHTML = r.note;

        const target = parseFloat($('target').value);
        let seeVals;
        if(type==='theory') seeVals = { cie: r.total };
        else if(type==='theory-lab'){
          // split finalized CIE back into theory/lab portions for the estimator
          const labPart = Math.min(r.total, 50);
          seeVals = { cieT: Math.max(r.total - labPart, 0), cieL: labPart };
          // more accurate: recompute directly from raw fields
          const lab = window.MCA.grading.clampNum($('lab').value,0,50);
          seeVals = { cieT: r.total - lab, cieL: lab };
        } else seeVals = { cieO: r.total };

        const s = estimateSEE(type, seeVals, target);
        const stampClass = s.achievable ? 'pass':'fail';
        $('seeResult').innerHTML = `
          <div class="stamp ${stampClass}"><span class="g">${s.achievable? Math.ceil(Math.max(s.neededSEE,0)) : '×'}</span><span class="t">${s.achievable?'SEE NEEDED':'NOT REACHABLE'}</span></div>
          <div class="result-detail">
            <div class="big">${s.cieLabel}: ${fmt(s.cie)} / ${s.cieMax}</div>
            <div class="note">${s.achievable ? s.message : `Even a full ${s.seeMax}/${s.seeMax} in SEE won't reach this target. Aim lower, or raise CIE first.`}</div>
          </div>`;
      }

      syncTypeUI(type);
      recompute();
    }
  };

  /* ============================== FINAL GRADE ============================== */
  const finalGrade = {
    render(state){
      return `
        <div class="card">
          <h2>Final Grade Calculator</h2>
          <p class="sub">Semester ${state.semesterKey} · enter what you actually scored.</p>

          <div class="field-row">
            <div class="field" style="grid-column:1/-1;">
              <label>Course</label>
              <select id="coursePick">${courseOptionsHTML(state.semesterKey)}</select>
            </div>
          </div>
          <div id="nonStdNote"></div>

          <div class="type-select" id="typeSel">
            <div class="type-opt sel" data-type="theory">Theory only</div>
            <div class="type-opt" data-type="theory-lab">Theory + Lab</div>
            <div class="type-opt" data-type="lab">Lab only</div>
          </div>

          <div id="theoryFields">
            <div class="field-row">
              <div class="field"><label>CIE - Quiz+Test subtotal <span class="hint">/60</span></label><input type="number" id="qt" min="0" max="60" value="0"></div>
              <div class="field"><label>CIE total <span class="hint">/100</span></label><input type="number" id="cie" min="0" max="100" value="0"></div>
              <div class="field"><label>SEE <span class="hint">/100</span></label><input type="number" id="see" min="0" max="100" value="0"></div>
            </div>
          </div>
          <div id="labMixFields" style="display:none;">
            <div class="field-row">
              <div class="field"><label>Theory CIE - Quiz+Test <span class="hint">/60</span></label><input type="number" id="qtL" min="0" max="60" value="0"></div>
              <div class="field"><label>Theory CIE total <span class="hint">/100</span></label><input type="number" id="cieT" min="0" max="100" value="0"></div>
              <div class="field"><label>Lab CIE <span class="hint">/50</span></label><input type="number" id="cieL" min="0" max="50" value="0"></div>
            </div>
            <div class="field-row">
              <div class="field"><label>Theory SEE <span class="hint">/100</span></label><input type="number" id="seeT" min="0" max="100" value="0"></div>
              <div class="field"><label>Lab SEE <span class="hint">/50</span></label><input type="number" id="seeL" min="0" max="50" value="0"></div>
            </div>
          </div>
          <div id="labOnlyFields" style="display:none;">
            <div class="field-row">
              <div class="field"><label>CIE <span class="hint">/50</span></label><input type="number" id="cieO" min="0" max="50" value="0"></div>
              <div class="field"><label>SEE <span class="hint">/50</span></label><input type="number" id="seeO" min="0" max="50" value="0"></div>
            </div>
          </div>

          <div class="result" id="gradeResult"></div>
        </div>`;
    },
    wire(state, nav){
      let type = 'theory';
      const $ = id => document.getElementById(id);

      function syncTypeUI(t){
        $('theoryFields').style.display = t==='theory' ? '' : 'none';
        $('labMixFields').style.display = t==='theory-lab' ? '' : 'none';
        $('labOnlyFields').style.display = t==='lab' ? '' : 'none';
        document.querySelectorAll('#typeSel .type-opt').forEach(o=>o.classList.toggle('sel', o.dataset.type===t));
      }
      document.querySelectorAll('#typeSel .type-opt').forEach(opt=>{
        opt.addEventListener('click', ()=>{ type=opt.dataset.type; syncTypeUI(type); recompute(); });
      });
      $('coursePick').addEventListener('change', (e)=>{
        const t = e.target.selectedOptions[0].dataset.type;
        $('nonStdNote').innerHTML = '';
        if(t && ['project','internship','nptel'].includes(t)) $('nonStdNote').innerHTML = nonStandardNote(t);
        else if(t){ type=t; syncTypeUI(type); }
        recompute();
      });

      const allInputs = ['qt','cie','see','qtL','cieT','cieL','seeT','seeL','cieO','seeO'];
      allInputs.forEach(id => $(id).addEventListener('input', recompute));

      function recompute(){
        const v = {};
        allInputs.forEach(id => v[id] = $(id).value);
        const r = computeFinalGrade(type, v);
        $('gradeResult').innerHTML = `
          <div class="stamp ${r.isPass?'pass':'fail'}"><span class="g">${r.letter}</span><span class="t">${r.isPass?'PASS':'FAIL'}</span></div>
          <div class="result-detail">
            <div class="big">${fmt(r.total)} / ${r.max}  ·  ${fmt(r.pct)}%  ·  Grade point ${r.gp}</div>
            <div class="note">${r.isPass ? `Meets every passing condition &mdash; grade ${r.letter} stands.` : `A passing condition from Table 4.4 isn't met, so this is recorded as F regardless of the raw percentage.`}</div>
            <div class="badge-list">
              ${r.badges.map(b=>`<span class="badge ${b[1]?'ok':'no'}">${b[1]?'✓':'✕'} ${b[0]}</span>`).join('')}
            </div>
          </div>`;
      }
      syncTypeUI(type);
      recompute();
    }
  };

  /* ============================== FINAL GPA (SGPA, semester) ============================== */
  const finalGpa = {
    render(state){
      return `
        <div class="card">
          <h2>Final GPA Calculator</h2>
          <p class="sub">Semester ${state.semesterKey} · pre-loaded with its real courses, edit freely.</p>
          <table class="ledger" id="gpaTable">
            <thead><tr><th>Course</th><th>Credits</th><th>Grade</th><th></th></tr></thead>
            <tbody></tbody>
          </table>

          <div class="toolbar">
            <button class="btn ghost" id="addRow">+ Add course</button>
            <button class="btn ghost" id="clearRows">Clear all</button>
          </div>

          <hr class="rule">
          <div class="result" id="gpaResult"></div>
          <div class="callout">SGPA excludes transitional grades (<b>W, I, X, DX, AB</b>). An <b>F</b> still counts its credits, weighted at 0 grade points.</div>
        </div>`;
    },
    wire(state, nav){
      const body = document.querySelector('#gpaTable tbody');
      const gradeOpts = sel => ['O','A+','A','B+','B','C','F','W','I','X','DX','AB']
        .map(o=>`<option value="${o}" ${o===sel?'selected':''}>${o}</option>`).join('');

      function addRow(name, credits, grade){
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td><input type="text" class="r-name" value="${name}" placeholder="Course name"></td>
          <td class="credit-col"><input type="number" class="r-credit" min="0" max="14" value="${credits}"></td>
          <td class="grade-col"><select class="r-grade">${gradeOpts(grade)}</select></td>
          <td class="action-col"><button class="icon-btn">✕</button></td>`;
        tr.querySelector('.icon-btn').addEventListener('click', ()=>{ tr.remove(); recompute(); });
        tr.querySelector('.r-credit').addEventListener('input', recompute);
        tr.querySelector('.r-grade').addEventListener('change', recompute);
        body.appendChild(tr);
      }

      function recompute(){
        const rows = [...body.querySelectorAll('tr')].map(tr=>({
          credit: tr.querySelector('.r-credit').value,
          grade: tr.querySelector('.r-grade').value
        }));
        const r = computeSGPA(rows);
        document.getElementById('gpaResult').innerHTML = `
          <div style="flex:1">
            <div class="breakdown">
              <div class="row"><span>Credits registered</span><span>${fmt(r.regCredits)}</span></div>
              <div class="row"><span>Credits counted toward SGPA</span><span>${fmt(r.countedCredits)}</span></div>
              <div class="row"><span>Credits earned</span><span>${fmt(r.earnedCredits)}</span></div>
              <div class="row total"><span>SGPA</span><span>${fmt(r.sgpa)}</span></div>
            </div>
          </div>`;
      }

      document.getElementById('addRow').addEventListener('click', ()=>{ addRow('',3,'O'); recompute(); });
      document.getElementById('clearRows').addEventListener('click', ()=>{ body.innerHTML=''; recompute(); });

      DATA.semesters[state.semesterKey].courses.forEach(c=>{
        if(c.creditBearing===false) return;
        const label = c.electives ? `${c.title} (choose elective)` : c.title;
        addRow(`${c.code} · ${label}`, c.credits, 'O');
      });
      recompute();
    }
  };

  /* ============================== CGPA (global) ============================== */
  const cgpa = {
    render(){
      return `
        <div class="card">
          <h2>CGPA Calculator</h2>
          <p class="sub">Enter SGPA and credits for each completed semester. MCA needs 80 credits across 4 semesters.</p>

          <table class="ledger" id="cgTable">
            <thead><tr><th>Semester</th><th>SGPA</th><th>Credits</th><th></th></tr></thead>
            <tbody></tbody>
          </table>

          <div class="toolbar">
            <button class="btn ghost" id="cgAddRow">+ Add semester</button>
          </div>

          <hr class="rule">
          <div class="result" id="cgResult"></div>
          <div style="margin-top:10px;">
            <div class="breakdown"><div class="row"><span>Credits accumulated</span><span id="cgProgLabel">0 / 80</span></div></div>
            <div class="progress-track"><div class="progress-fill" id="cgProgFill" style="width:0%"></div></div>
          </div>
          <div class="callout">Degree class applies only once every semester clears with no F grade outstanding (Section 4.12d).</div>
        </div>`;
    },
    wire(){
      const body = document.querySelector('#cgTable tbody');
      function addRow(label, sgpa, credits){
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td><input type="text" class="c-label" value="${label}"></td>
          <td class="credit-col"><input type="number" class="c-sgpa" min="0" max="10" step="0.01" value="${sgpa}"></td>
          <td class="credit-col"><input type="number" class="c-credit" min="0" max="40" value="${credits}"></td>
          <td class="action-col"><button class="icon-btn">✕</button></td>`;
        tr.querySelector('.icon-btn').addEventListener('click', ()=>{ tr.remove(); recompute(); });
        tr.querySelectorAll('input').forEach(i=>i.addEventListener('input', recompute));
        body.appendChild(tr);
      }
      function recompute(){
        const rows = [...body.querySelectorAll('tr')].map(tr=>({
          sgpa: tr.querySelector('.c-sgpa').value,
          credits: tr.querySelector('.c-credit').value
        }));
        const r = computeCGPA(rows);
        document.getElementById('cgResult').innerHTML = `
          <div style="flex:1">
            <div class="breakdown">
              <div class="row"><span>Total credits entered</span><span>${fmt(r.totalCredits)}</span></div>
              <div class="row total"><span>CGPA</span><span>${fmt(r.cgpa)}</span></div>
              <div class="row"><span>Projected class</span><span>${r.cls}</span></div>
            </div>
          </div>`;
        const pct = Math.min(100, r.totalCredits/80*100);
        document.getElementById('cgProgFill').style.width = pct+'%';
        document.getElementById('cgProgLabel').textContent = fmt(r.totalCredits)+' / 80';
      }
      document.getElementById('cgAddRow').addEventListener('click', ()=>{ addRow('Semester', 0, 0); recompute(); });

      Object.keys(DATA.semesters).forEach(s=>{
        addRow(`Semester ${s}`, 0, DATA.semesters[s].totalCredits);
      });
      recompute();
    }
  };

  /* ============================== FAQ (global) ============================== */
  const faq = {
    render(){
      const items = window.MCA.FAQ.map((item, i)=>`
        <div class="faq-item" data-idx="${i}">
          <button class="faq-q"><span>${item.q}</span><span class="plus">+</span></button>
          <div class="faq-a"><div class="faq-a-inner">${item.a}</div></div>
        </div>`).join('');
      return `
        <div class="card">
          <h2>FAQ - how the grading works</h2>
          <p class="sub">Every formula this tool uses, explained in one place.</p>
          <div class="faq-search">
            <input type="text" id="faqSearch" placeholder="Search the FAQ…">
          </div>
          <div id="faqList">${items}</div>
        </div>`;
    },
    wire(){
      document.querySelectorAll('.faq-item').forEach(item=>{
        item.querySelector('.faq-q').addEventListener('click', ()=>item.classList.toggle('open'));
      });
      document.getElementById('faqSearch').addEventListener('input', (e)=>{
        const q = e.target.value.toLowerCase();
        document.querySelectorAll('.faq-item').forEach(item=>{
          const text = item.textContent.toLowerCase();
          item.style.display = text.includes(q) ? '' : 'none';
        });
      });
    }
  };

  window.MCA.views = { home, year, scheme, semester, tool, cieSee, finalGrade, finalGpa, cgpa, faq };
})();