/* ==========================================================================
   course-picker.js — every calculator on this site reads its course list
   from window.MCA.DATA only. There is no "manual / custom course" entry
   point anywhere: a student can only calculate against a course that
   actually appears in the 2024 scheme syllabus for the semester chosen.
   ========================================================================== */
window.MCA = window.MCA || {};

(function(){
  const DATA = window.MCA.DATA;
  const YEAR_SEMS = { '1': ['I','II'], '2': ['III','IV'] };

  function yearForSemester(semesterKey){
    for(const y of Object.keys(YEAR_SEMS)) if(YEAR_SEMS[y].includes(semesterKey)) return y;
    return null;
  }

  function semesterList(){
    return Object.keys(DATA.semesters);
  }

  function coursesFor(semesterKey){
    return (DATA.semesters[semesterKey] || {}).courses || [];
  }

  /* Flattened, selectable entries for the CIE/SEE and Final Grade pickers.
     Elective-group courses expand into one entry per elective, all sharing
     the parent group's CIE/SEE/credit structure (that structure is fixed
     by the scheme regardless of which elective within the group is taken). */
  function selectableEntries(semesterKey){
    const entries = [];
    coursesFor(semesterKey).forEach(c=>{
      if(c.electives && c.electives.length){
        c.electives.forEach(e=>{
          entries.push({
            value: e.code,
            code: e.code,
            title: e.title,
            groupTitle: c.title,
            type: c.type,
            credits: c.credits,
            cie: c.cie,
            see: c.see,
            core: false,
            page: e.page
          });
        });
      } else {
        entries.push({
          value: c.code,
          code: c.code,
          title: c.title,
          groupTitle: null,
          type: c.type,
          credits: c.credits,
          cie: c.cie,
          see: c.see,
          core: c.core,
          creditBearing: c.creditBearing,
          note: c.note,
          page: c.page
        });
      }
    });
    return entries;
  }

  function findEntry(semesterKey, code){
    return selectableEntries(semesterKey).find(e=>e.code === code) || null;
  }

  /* Populates a <select> with real course codes only — no manual/freehand
     option. Non-standard types (project / internship / nptel) are still
     listed, but flagged via data-nonstandard so the calling page can show
     the appropriate note and lock the numeric fields. */
  function populateSelect(selectEl, semesterKey){
    const entries = selectableEntries(semesterKey);
    selectEl.innerHTML = entries.map(e=>{
      const label = e.groupTitle
        ? `${e.code} \u2014 ${e.title} (${e.groupTitle})`
        : `${e.code} \u2014 ${e.title}`;
      const nonStandard = ['project','internship','nptel'].includes(e.type);
      return `<option value="${e.code}" data-type="${e.type}" data-nonstandard="${nonStandard}">${label}</option>`;
    }).join('');
  }

  window.MCA.courses = {
    YEAR_SEMS,
    yearForSemester,
    semesterList,
    coursesFor,
    selectableEntries,
    findEntry,
    populateSelect
  };
})();
