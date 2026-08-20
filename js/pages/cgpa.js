(function(){
  const { mount } = window.MCA.site;
  const { computeCGPA } = window.MCA.engine;
  const { fmt } = window.MCA.grading;
  const DATA = window.MCA.DATA;

  mount({
    active: 'cgpa',
    trail: [
      { label:'Home', href:'index.html' },
      { label:'CGPA' }
    ]
  });

  const body = document.querySelector('#cgTable tbody');
  const totalProgramCredits = DATA.meta.totalProgramCredits;

  Object.keys(DATA.semesters).forEach(s=>{
    const credits = DATA.semesters[s].totalCredits;
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="check-col"><input type="checkbox" class="c-done"></td>
      <td>Semester ${s}</td>
      <td class="credit-col locked-credit">${credits}</td>
      <td class="credit-col"><input type="number" class="c-sgpa" min="0" max="10" step="0.01" value="0" disabled></td>`;
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
    const pct = Math.min(100, r.totalCredits / totalProgramCredits * 100);
    document.getElementById('cgProgFill').style.width = pct + '%';
    document.getElementById('cgProgLabel').textContent = `${fmt(r.totalCredits)} / ${totalProgramCredits}`;
  }

  recompute();
})();
