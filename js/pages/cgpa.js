(function(){
  const { mount } = window.MCA.site;
  const { computeCGPA } = window.MCA.engine;
  const { fmt } = window.MCA.grading;
  const DATA = window.MCA.DATA;

  mount({
    active: 'cgpa',
    trail: [
      { label:'Home', href:'../index.html' },
      { label:'CGPA' }
    ]
  });
  document.getElementById('cgpaIconBadge').innerHTML = window.MCA.icons.trendingUp;

  const body = document.querySelector('#cgTable tbody');

  Object.keys(DATA.semesters).forEach(s=>{
    const credits = DATA.semesters[s].totalCredits;
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="check-col"><input type="checkbox" class="c-done"></td>
      <td>Semester ${s}</td>
      <td class="credit-col locked-credit">${credits}</td>
      <td class="sgpa-col"><input type="number" class="c-sgpa" min="0" max="10" step="0.01" value="0" disabled></td>`;
    tr.dataset.credits = credits;
    const done = tr.querySelector('.c-done');
    const sgpaInput = tr.querySelector('.c-sgpa');
    done.addEventListener('change', ()=>{
      sgpaInput.disabled = !done.checked;
      if(!done.checked) sgpaInput.value = 0;
      recompute();
    });
    sgpaInput.addEventListener('input', recompute);
    body.appendChild(tr);
  });

  function recompute(){
    const rows = [...body.querySelectorAll('tr')]
      .filter(tr => tr.querySelector('.c-done').checked)
      .map(tr => ({ sgpa: tr.querySelector('.c-sgpa').value, credits: tr.dataset.credits }));

    const r = computeCGPA(rows);
    document.getElementById('cgResult').innerHTML = `
      <div style="flex:1">
        <div class="breakdown">
          <div class="row"><span>Completed semesters counted</span><span>${rows.length} / ${Object.keys(DATA.semesters).length}</span></div>
          <div class="row total"><span>CGPA</span><span>${fmt(r.cgpa)}</span></div>
          <div class="row"><span>Projected class</span><span>${r.cls}</span></div>
        </div>
      </div>`;
  }

  const progressRoot = document.getElementById('app');
  function restoreProgress(){
    window.MCA.progress.loadProgress('cgpa', progressRoot).then(restored=>{
      if(restored) recompute();
    });
  }
  restoreProgress();
  document.addEventListener('signed-in', restoreProgress);

  document.getElementById('saveProgressBtn').addEventListener('click', ()=>{
    window.MCA.progress.saveProgress('cgpa', progressRoot);
  });

  document.getElementById('resetAllBtn').addEventListener('click', ()=>{
    body.querySelectorAll('tr').forEach(tr=>{
      const done = tr.querySelector('.c-done');
      const sgpaInput = tr.querySelector('.c-sgpa');
      done.checked = false;
      sgpaInput.value = 0;
      sgpaInput.disabled = true;
    });
    recompute();
  });

  recompute();
})();
