/* ==========================================================================
   achievements.js — centralized Achievements & Badges engine.

   Nothing in this file is page-specific. Pages and tools only ever call
   window.MCA.achievements.track(eventName, detail) at the moment something
   meaningful actually happened (a calculation succeeded, a save completed,
   a page was opened) — every achievement DEFINITION and every unlock RULE
   lives right here, in one data-driven table (ACHIEVEMENTS below). Adding,
   removing or re-tuning an achievement never touches a page script.

   Event taxonomy this engine understands (dispatched via .track()):
     login                     — a sign-in resolved (mirrors the 'signed-in'
                                  DOM event firebase-auth.js already fires)
     theme_toggled             { theme: 'light'|'dark' }
     progress_saved            { pageKey }
     guide_viewed              {}
     faq_opened                {}
     faq_searched              {}
     syllabus_viewed           { which: 'syllabus'|'handbook' }
     pwa_launch                {} (checked once, at init, not dispatched)
     tool_page_viewed          { tool: 'cie-see'|'final-grade'|'final-gpa', semester }
     semester_tools_viewed     { semester }
     cie_calculated            { semester, code, finalPct, dx, completed, total }
     see_requirements_viewed   { semester, code }
     see_requirements_copied   { semester }
     final_grade_calculated    { semester, code, isPass, pct, completed, total }
     sgpa_calculated           { semester, sgpa }
     cgpa_blended              { semester, cgpa }
     cgpa_calculated           { cgpa, count, total }
     beat_target_met           { targetSem }
     elective_selected         { semester, page }
     reset_used                { page }

   Every achievement is either:
     - "instant"  — a single event satisfies it outright (one_time,
                    performance_based conditions live in `check`)
     - "set"      — repeated events accumulate distinct values into a
                    named set (activity_based / streak / threshold),
                    compared against `target`

   State (per signed-in student) is stored in the SAME Firestore document
   every other calculator already writes to — userMarks/{uid} — under a
   single `achievements` field, using the project's existing Firestore
   instance (window.MCA.firestore) and security rules (a student can only
   ever read/write their own document). No new collection, no new rules.
   Signed-out visitors never call Firestore at all — see track() below.
   ========================================================================== */
window.MCA = window.MCA || {};

(function(){

  /* ---------- Badge icon set (line-art SVG, matches js/icons.js style) ---------- */
  const A = 'viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"';
  const ICONS = {
    calculator: `<svg ${A}><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="8" y1="6" x2="16" y2="6"/><line x1="8" y1="14" x2="8" y2="14.01"/><line x1="12" y1="14" x2="12" y2="14.01"/><line x1="16" y1="14" x2="16" y2="14.01"/><line x1="8" y1="18" x2="8" y2="18.01"/><line x1="12" y1="18" x2="12" y2="18.01"/></svg>`,
    star: `<svg ${A}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
    checklist: `<svg ${A}><path d="M3 6h4"/><path d="M3 12h4"/><path d="M3 18h4"/><path d="M9 6h12"/><path d="M9 12h12"/><path d="M9 18h9"/></svg>`,
    compass: `<svg ${A}><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>`,
    clipboard: `<svg ${A}><rect x="6" y="4" width="12" height="18" rx="2"/><path d="M9 4V3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1"/><path d="m9 13 2 2 4-4"/></svg>`,
    award: `<svg ${A}><circle cx="12" cy="8" r="6"/><path d="M8.5 13.5 6 22l6-3 6 3-2.5-8.5"/></svg>`,
    trendingUp: `<svg ${A}><polyline points="3 17 9 11 13 15 21 7"/><polyline points="14 7 21 7 21 14"/></svg>`,
    layers: `<svg ${A}><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>`,
    bookOpen: `<svg ${A}><path d="M2 4h6a4 4 0 0 1 4 4v12a3 3 0 0 0-3-3H2z"/><path d="M22 4h-6a4 4 0 0 0-4 4v12a3 3 0 0 1 3-3h7z"/></svg>`,
    target: `<svg ${A}><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/></svg>`,
    graduationCap: `<svg ${A}><path d="M22 10 12 5 2 10l10 5 10-5Z"/><path d="M6 12v5c0 1.5 2.5 3 6 3s6-1.5 6-3v-5"/></svg>`,
    cloud: `<svg ${A}><path d="M17.5 19a4.5 4.5 0 0 0 0-9 6.5 6.5 0 0 0-12.6 2.1A4 4 0 0 0 6 19h11.5Z"/><path d="m9 16 3-3 3 3"/><path d="M12 13v7"/></svg>`,
    moon: `<svg ${A}><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z"/></svg>`,
    bookMarked: `<svg ${A}><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/><polyline points="10 2 10 9 12.5 7 15 9 15 2"/></svg>`,
    helpCircle: `<svg ${A}><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 2-3 4"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
    search: `<svg ${A}><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`,
    fileText: `<svg ${A}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="16" y2="17"/></svg>`,
    rocket: `<svg ${A}><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 19 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/></svg>`,
    calendarCheck: `<svg ${A}><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><path d="m9 16 2 2 4-4"/></svg>`,
    flame: `<svg ${A}><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>`,
    puzzle: `<svg ${A}><path d="M19.439 7.85c-.049.322.059.648.289.878l1.568 1.568c.47.47.706 1.087.706 1.704s-.235 1.233-.706 1.704l-1.611 1.611a.98.98 0 0 1-.837.276c-.47-.07-.802-.48-.968-.925a2.501 2.501 0 1 0-3.214 3.214c.446.166.855.497.925.968a.979.979 0 0 1-.276.837l-1.611 1.611a2.404 2.404 0 0 1-1.704.706 2.402 2.402 0 0 1-1.704-.706l-1.568-1.568a1.026 1.026 0 0 0-.877-.29c-.493.074-.84.504-1.02.968a2.5 2.5 0 1 1-3.237-3.237c.464-.18.894-.527.967-1.02a1.026 1.026 0 0 0-.289-.877l-1.568-1.568A2.402 2.402 0 0 1 1.998 12c0-.617.236-1.234.706-1.704L4.315 8.685a.98.98 0 0 1 .837-.276c.47.07.802.48.968.925a2.501 2.501 0 1 0 3.214-3.214c-.446-.166-.855-.497-.925-.968a.979.979 0 0 1 .276-.837L10.296 2.7a2.402 2.402 0 0 1 1.704-.706c.617 0 1.234.235 1.704.706l1.568 1.568c.23.23.556.338.877.29"/></svg>`,
    map: `<svg ${A}><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/><line x1="9" y1="3" x2="9" y2="18"/><line x1="15" y1="6" x2="15" y2="21"/></svg>`,
    shuffle: `<svg ${A}><polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/><polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/><line x1="4" y1="4" x2="9" y2="9"/></svg>`,
    moonStars: `<svg ${A}><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/><path d="M19 3v4"/><path d="M21 5h-4"/></svg>`,
    sunrise: `<svg ${A}><path d="M12 2v7"/><path d="m4.22 10.22 1.42 1.42"/><path d="M1 18h2"/><path d="M21 18h2"/><path d="m18.36 11.64 1.42-1.42"/><path d="M23 22H1"/><path d="m16 6-4 4-4-4"/><path d="M8 22a4 4 0 0 1 8 0"/></svg>`,
    lifeBuoy: `<svg ${A}><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/><line x1="4.93" y1="4.93" x2="9.17" y2="9.17"/><line x1="14.83" y1="14.83" x2="19.07" y2="19.07"/><line x1="14.83" y1="9.17" x2="19.07" y2="4.93"/><line x1="14.83" y1="9.17" x2="18.36" y2="5.64"/><line x1="4.93" y1="19.07" x2="9.17" y2="14.83"/></svg>`,
    refresh: `<svg ${A}><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>`,
    sparkles: `<svg ${A}><path d="m12 3-1.5 4.5L6 9l4.5 1.5L12 15l1.5-4.5L18 9l-4.5-1.5L12 3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/></svg>`,
    crown: `<svg ${A}><path d="m2 20 2-10 5 4 3-7 3 7 5-4 2 10Z"/><line x1="4" y1="22" x2="20" y2="22"/></svg>`,
    lock: `<svg ${A}><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>`,
    mystery: `<svg ${A}><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 2-3 4"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`
  };

  /* ---------- Achievement catalog ----------
     Data-driven on purpose: adding an achievement is adding a row here,
     nothing else. `kind: 'instant'` achievements are satisfied by a
     single matching event (see `check`); `kind: 'set'` achievements
     accumulate distinct values from matching events into a named set
     and unlock once that set reaches `target`. */
  /* Hidden-achievement copy (name/description) is stored base64-encoded
     and decoded here at runtime — not for security (this is a static
     site; nothing client-side can be truly secret), just so the source
     isn't a spoiler list for anyone skimming the public GitHub repo. The
     Achievements page still does the real masking (js/pages/achievements.js
     never puts these strings in the DOM until the achievement unlocks). */
  function _b64d(s){ try{ return decodeURIComponent(escape(atob(s))); }catch(e){ return ''; } }

  const ACHIEVEMENTS = [

    /* ---------- academic ---------- */
    { id:'cie-first-calc', name:'CIE Rookie', icon:'calculator', category:'academic',
      unlockType:'one_time', hidden:false, kind:'instant',
      description:'Calculate the finalized CIE for a course for the first time.',
      events:['cie_calculated'], check:()=>true },

    { id:'cie-perfect', name:'Full Marks Club', icon:'star', category:'academic',
      unlockType:'performance_based', hidden:false, kind:'instant',
      description:'Land a perfect finalized CIE on any course.',
      events:['cie_calculated'], check:(d)=> typeof d.finalPct==='number' && d.finalPct>=100 },

    { id:'cie-semester-sweep', name:'Semester Swept', icon:'checklist', category:'academic',
      unlockType:'threshold', hidden:false, kind:'instant',
      description:'Calculate the CIE for every standard course in a semester.',
      events:['cie_calculated'], check:(d)=> d.total>0 && d.completed>=d.total },

    { id:'see-scout', name:'SEE Scout', icon:'compass', category:'academic',
      unlockType:'one_time', hidden:false, kind:'instant',
      description:'Open the SEE Marks Required tool for a course.',
      events:['see_requirements_viewed'], check:()=>true },

    { id:'see-all-copied', name:'Grade Strategist', icon:'clipboard', category:'academic',
      unlockType:'one_time', hidden:false, kind:'instant',
      description:'Copy the full SEE requirements list to plan a target grade.',
      events:['see_requirements_copied'], check:()=>true },

    { id:'final-grade-first', name:'Grade Card', icon:'award', category:'academic',
      unlockType:'one_time', hidden:false, kind:'instant',
      description:'Calculate your first Final Grade result.',
      events:['final_grade_calculated'], check:()=>true },

    { id:'final-grade-sweep', name:'Report Card Ready', icon:'checklist', category:'academic',
      unlockType:'threshold', hidden:false, kind:'instant',
      description:'Calculate the Final Grade for every standard course in a semester.',
      events:['final_grade_calculated'], check:(d)=> d.total>0 && d.completed>=d.total },

    { id:'sgpa-first', name:'SGPA Unlocked', icon:'trendingUp', category:'academic',
      unlockType:'one_time', hidden:false, kind:'instant',
      description:'Compute your Final SGPA for a semester.',
      events:['sgpa_calculated'], check:()=>true },

    { id:'cgpa-blend', name:'The Big Picture', icon:'layers', category:'academic',
      unlockType:'one_time', hidden:false, kind:'instant',
      description:'Blend a prior CGPA with a freshly computed SGPA.',
      events:['cgpa_blended'], check:()=>true },

    { id:'cgpa-ledger', name:'Ledger Keeper', icon:'bookOpen', category:'academic',
      unlockType:'one_time', hidden:false, kind:'instant',
      description:'Compute a CGPA on the CGPA Calculator page.',
      events:['cgpa_calculated'], check:(d)=> d.count>0 },

    { id:'cgpa-all-four', name:'Full Ledger', icon:'layers', category:'academic',
      unlockType:'threshold', hidden:false, kind:'instant',
      description:'Mark all four semesters done on the CGPA Calculator.',
      events:['cgpa_calculated'], check:(d)=> d.total>0 && d.count>=d.total },

    { id:'beat-target', name:'Target Met', icon:'target', category:'academic',
      unlockType:'one_time', hidden:false, kind:'instant',
      description:'Hit your own CGPA target in Beat Yourself.',
      events:['beat_target_met'], check:()=>true },

    /* ---------- usage ---------- */
    { id:'welcome-aboard', name:'Welcome Aboard', icon:'graduationCap', category:'usage',
      unlockType:'one_time', hidden:false, kind:'instant',
      description:'Sign in with your RVCE Google account.',
      events:['login'], check:()=>true },

    { id:'progress-saver', name:'Better Safe Than Sorry', icon:'cloud', category:'usage',
      unlockType:'one_time', hidden:false, kind:'instant',
      description:'Save your progress to your account for the first time.',
      events:['progress_saved'], check:()=>true },

    { id:'dark-side', name:'To the Dark Side', icon:'moon', category:'usage',
      unlockType:'one_time', hidden:false, kind:'instant',
      description:'Switch the site into dark mode.',
      events:['theme_toggled'], check:(d)=> d.theme==='dark' },

    { id:'guide-reader', name:'Read the Manual', icon:'bookMarked', category:'usage',
      unlockType:'one_time', hidden:false, kind:'instant',
      description:'Open the Guide page.',
      events:['guide_viewed'], check:()=>true },

    { id:'faq-curious', name:'Curious Mind', icon:'helpCircle', category:'usage',
      unlockType:'one_time', hidden:false, kind:'instant',
      description:'Expand an answer on the FAQ page.',
      events:['faq_opened'], check:()=>true },

    { id:'faq-search', name:'Search Party', icon:'search', category:'usage',
      unlockType:'one_time', hidden:false, kind:'instant',
      description:'Use the FAQ search box to look something up.',
      events:['faq_searched'], check:()=>true },

    { id:'syllabus-scholar', name:'Straight From the Source', icon:'fileText', category:'usage',
      unlockType:'one_time', hidden:false, kind:'instant',
      description:'Open the official syllabus or handbook PDF.',
      events:['syllabus_viewed'], check:()=>true },

    { id:'home-screen-hero', name:'Home Screen Hero', icon:'rocket', category:'usage',
      unlockType:'one_time', hidden:false, kind:'instant',
      description:'Install the calculator to your home screen and open it from there.',
      events:['pwa_launch'], check:()=>true },

    /* ---------- streak ---------- */
    { id:'streak-two', name:'Back Again', icon:'calendarCheck', category:'streak',
      unlockType:'streak', hidden:false, kind:'set',
      description:'Use the calculator on two different days.',
      events:['cie_calculated','final_grade_calculated','sgpa_calculated','cgpa_calculated'],
      setKey:'activityDays', target:2,
      valueFor:()=> new Date().toISOString().slice(0,10) },

    { id:'streak-five', name:'Study Streak', icon:'flame', category:'streak',
      unlockType:'streak', hidden:false, kind:'set',
      description:'Use the calculator on five different days.',
      events:['cie_calculated','final_grade_calculated','sgpa_calculated','cgpa_calculated'],
      setKey:'activityDays', target:5,
      valueFor:()=> new Date().toISOString().slice(0,10) },

    /* ---------- exploration ---------- */
    { id:'toolbox-complete', name:'Toolbox Complete', icon:'puzzle', category:'exploration',
      unlockType:'activity_based', hidden:false, kind:'set',
      description:'Use all three calculators: CIE, Final Grade and SGPA, at least once.',
      events:['tool_page_viewed'], setKey:'toolsSeen', target:3,
      valueFor:(d)=> d.tool },

    { id:'grand-tour', name:'Grand Tour', icon:'map', category:'exploration',
      unlockType:'activity_based', hidden:false, kind:'set',
      description:'Open the tool picker for all four semesters.',
      events:['semester_tools_viewed'], setKey:'semestersSeen',
      target:(ctx)=> (ctx.DATA && ctx.DATA.semesters) ? Object.keys(ctx.DATA.semesters).length : 4,
      valueFor:(d)=> d.semester },

    { id:'road-less-traveled', name:'Road Less Traveled', icon:'shuffle', category:'exploration',
      unlockType:'one_time', hidden:false, kind:'instant',
      description:'Pick a professional elective from a dropdown.',
      events:['elective_selected'], check:()=>true },

    /* ---------- hidden ---------- */
    { id:'night-owl', name:_b64d('TmlnaHQgT3ds'), icon:'moonStars', category:'hidden',
      unlockType:'performance_based', hidden:true, kind:'instant',
      description:_b64d('UmFuIGEgY2FsY3VsYXRpb24gYmV0d2VlbiBtaWRuaWdodCBhbmQgNCBBTSwgbG9jYWwgdGltZS4='),
      events:['cie_calculated','final_grade_calculated','sgpa_calculated','cgpa_calculated','see_requirements_viewed'],
      check:()=>{ const h = new Date().getHours(); return h>=0 && h<4; } },

    { id:'early-bird', name:_b64d('RWFybHkgQmlyZA=='), icon:'sunrise', category:'hidden',
      unlockType:'performance_based', hidden:true, kind:'instant',
      description:_b64d('UmFuIGEgY2FsY3VsYXRpb24gYmVmb3JlIDYgQU0sIGxvY2FsIHRpbWUu'),
      events:['cie_calculated','final_grade_calculated','sgpa_calculated','cgpa_calculated','see_requirements_viewed'],
      check:()=>{ const h = new Date().getHours(); return h>=4 && h<6; } },

    { id:'silver-lining', name:_b64d('U2lsdmVyIExpbmluZw=='), icon:'lifeBuoy', category:'hidden',
      unlockType:'one_time', hidden:true, kind:'instant',
      description:_b64d('Rm91bmQgb3V0IGEgY291cnNlIGRpZG4ndCBjbGVhciB0aGUgQ0lFIGZsb29yIOKAlCBub3cgeW91IGtub3cgZXhhY3RseSB3aGVyZSB5b3Ugc3RhbmQu'),
      events:['cie_calculated'], check:(d)=> !!d.isDx },

    { id:'clean-slate', name:_b64d('Q2xlYW4gU2xhdGU='), icon:'refresh', category:'hidden',
      unlockType:'one_time', hidden:true, kind:'instant',
      description:_b64d('VXNlZCBSZXNldCBBbGwgdG8gc3RhcnQgYSBjYWxjdWxhdG9yIG92ZXIgZnJvbSBzY3JhdGNoLg=='),
      events:['reset_used'], check:()=>true },

    { id:'secret-handshake', name:_b64d('U2VjcmV0IEhhbmRzaGFrZQ=='), icon:'sparkles', category:'hidden',
      unlockType:'activity_based', hidden:true, kind:'instant',
      description:_b64d('RmxpY2tlZCB0aGUgdGhlbWUgc3dpdGNoIGJhY2sgYW5kIGZvcnRoIGxpa2UgeW91IG1lYW50IGl0Lg=='),
      events:['theme_toggled'], check:(d,ctx)=> ctx.rapidToggleCount>=8 },

    { id:'distinction-territory', name:_b64d('RGlzdGluY3Rpb24gVGVycml0b3J5'), icon:'crown', category:'hidden',
      unlockType:'performance_based', hidden:true, kind:'instant',
      description:_b64d('UmVhY2hlZCBGaXJzdCBDbGFzcyB3aXRoIERpc3RpbmN0aW9uIENHUEEgdGVycml0b3J5IG9uIHRoZSBDR1BBIENhbGN1bGF0b3Iu'),
      events:['cgpa_calculated'], check:(d,ctx)=>{
        let min = 7.0;
        try{
          const cls = ctx.DATA.grading.degreeClass.find(c=>/Distinction/.test(c.class));
          if(cls) min = cls.minCgpa;
        }catch(e){ /* fall back to 7.0 */ }
        return typeof d.cgpa==='number' && d.cgpa>=min;
      } }
  ];

  const byId = {};
  ACHIEVEMENTS.forEach(a=>{ byId[a.id] = a; });

  /* ---------- Local state ---------- */
  let state = { unlocked:{}, sets:{} };
  let stateLoaded = false;      // has this session pulled the student's saved state yet?
  let authResolved = false;     // has Firebase told us signed-in vs signed-out at least once?
  let pendingSave = false;      // did something change locally before we could persist it?
  const pendingEvents = [];     // events that arrived before stateLoaded
  const themeToggleTimes = [];  // for the rapid-toggle secret achievement

  /* ---------- Firestore persistence (same doc/collection every other
     calculator already uses — userMarks/{uid} — just written directly so
     a background achievement save never pops the marks-save error toast
     that window.MCA.saveMarks shows on failure). ---------- */
  function firestoreDoc(){
    if(!window.MCA.currentUser || !window.MCA.firestore) return null;
    return window.MCA.firestore.collection('userMarks').doc(window.MCA.currentUser.uid);
  }

  function persist(){
    const doc = firestoreDoc();
    if(!doc){ pendingSave = true; return; }
    pendingSave = false;
    doc.set({ achievements: state }, { merge:true }).then(()=>{
      // Keep the shared read cache (js/firebase-auth.js) from serving a
      // now-stale copy of this document to any later read this page load.
      if(window.MCA.invalidateUserDoc) window.MCA.invalidateUserDoc();
    }).catch(err=>{
      console.error('Achievements save failed:', err);
      pendingSave = true; // try again on the next event
    });
  }

  /* Reads through window.MCA.loadUserDoc() — the same per-page-load,
     per-document read cache that saveMarks()/getMarks() use — rather than
     issuing this achievement state its own separate .get() of the exact
     same userMarks/{uid} document that a calculator page may already be
     reading (e.g. via Save Progress) on the very same page load. */
  function loadFromCloud(){
    if(!window.MCA.currentUser || !window.MCA.firestore || !window.MCA.loadUserDoc){
      return Promise.resolve();
    }
    return window.MCA.loadUserDoc().then(data=>{
      const saved = (data && data.achievements) ? data.achievements : null;
      if(saved){
        state.unlocked = Object.assign({}, saved.unlocked, state.unlocked);
        const mergedSets = Object.assign({}, saved.sets);
        Object.keys(state.sets).forEach(k=>{
          const a = new Set([...(mergedSets[k]||[]), ...state.sets[k]]);
          mergedSets[k] = [...a];
        });
        state.sets = mergedSets;
      }
      stateLoaded = true;
      if(pendingSave) persist();
    }).catch(err=>{
      console.error('Achievements load failed:', err);
      stateLoaded = true; // don't block forever — degrade to session-only
    });
  }

  /* ---------- Unlock toast — more prominent than the standard mca-toast,
     per the spec: its own container, bigger, icon + name + description,
     stays up long enough to actually read. ---------- */
  function showUnlockToast(ach){
    let host = document.getElementById('mca-achv-toast');
    if(!host){
      host = document.createElement('div');
      host.id = 'mca-achv-toast';
      host.setAttribute('role', 'status');
      host.setAttribute('aria-live', 'polite');
      document.body.appendChild(host);
    }
    const { escapeHTML } = window.MCA.util;
    host.innerHTML = `
      <div class="achv-toast-icon">${ICONS[ach.icon] || ICONS.star}</div>
      <div class="achv-toast-body">
        <div class="achv-toast-kicker">Achievement Unlocked!</div>
        <div class="achv-toast-name">${escapeHTML(ach.name)}</div>
        <div class="achv-toast-desc">${escapeHTML(ach.description)}</div>
      </div>`;
    host.classList.remove('show');
    // Force reflow so re-triggering the animation for a second achievement
    // (queued right after this one) actually restarts it.
    void host.offsetWidth;
    host.classList.add('show');
    clearTimeout(host._hideTimer);
    host._hideTimer = setTimeout(()=>{ host.classList.remove('show'); }, 4200);
  }

  /* ---------- Unlock + evaluate ---------- */
  const unlockQueue = [];
  let flushingQueue = false;

  function flushQueue(){
    if(flushingQueue) return;
    flushingQueue = true;
    (function step(){
      const next = unlockQueue.shift();
      if(!next){ flushingQueue = false; return; }
      showUnlockToast(next);
      setTimeout(step, 4400);
    })();
  }

  function unlock(ach){
    if(state.unlocked[ach.id]) return; // idempotent — never re-unlocks
    state.unlocked[ach.id] = new Date().toISOString();
    persist();
    unlockQueue.push(ach);
    flushQueue();
    document.dispatchEvent(new CustomEvent('achievement-unlocked', { detail: ach }));
  }

  function ctxFor(){
    return {
      DATA: window.MCA.DATA,
      rapidToggleCount: themeToggleTimes.length
    };
  }

  function evaluate(eventName, detail){
    detail = detail || {};

    if(eventName === 'theme_toggled'){
      const now = Date.now();
      themeToggleTimes.push(now);
      while(themeToggleTimes.length && now - themeToggleTimes[0] > 4000) themeToggleTimes.shift();
    }

    const ctx = ctxFor();

    ACHIEVEMENTS.forEach(ach=>{
      if(state.unlocked[ach.id]) return;
      if(ach.events.indexOf(eventName) === -1) return;

      if(ach.kind === 'instant'){
        if(ach.check(detail, ctx)) unlock(ach);
        return;
      }

      // kind === 'set'
      if(!state.sets[ach.setKey]) state.sets[ach.setKey] = [];
      const val = ach.valueFor ? ach.valueFor(detail) : null;
      if(val !== null && val !== undefined && state.sets[ach.setKey].indexOf(val) === -1){
        state.sets[ach.setKey].push(val);
      }
      const target = typeof ach.target === 'function' ? ach.target(ctx) : ach.target;
      if(state.sets[ach.setKey].length >= target) unlock(ach);
    });
  }

  /* ---------- Public: track() ----------
     Per the spec, achievements are never tracked or stored for a signed-
     out visitor. But "signed out" here means confirmed signed out, not
     "we don't know yet" — Firebase auth resolution is async (up to a
     couple seconds), and events like guide_viewed / faq_opened can fire
     within milliseconds of page load, well before that resolves. Events
     that arrive before we know either way are queued and only decided
     once authResolved is true, so a genuinely signed-in visitor never
     silently loses an early event to the race. */
  function track(eventName, detail){
    if(!authResolved){ pendingEvents.push([eventName, detail]); return; }
    if(!window.MCA.isSignedIn() && eventName !== 'login') return;
    if(!stateLoaded){ pendingEvents.push([eventName, detail]); return; }
    evaluate(eventName, detail);
  }

  function flushPending(){
    while(pendingEvents.length){
      const [name, detail] = pendingEvents.shift();
      evaluate(name, detail);
    }
  }

  /* ---------- Wiring ---------- */
  document.addEventListener('signed-in', ()=>{
    stateLoaded = false;
    state = { unlocked:{}, sets:{} };
    loadFromCloud().then(()=>{
      authResolved = true;
      flushPending();
      evaluate('login', {});
    });
  });

  document.addEventListener('signed-out', ()=>{
    authResolved = true;
    stateLoaded = false;
    pendingEvents.length = 0;
    state = { unlocked:{}, sets:{} };
  });

  // A visitor already signed in from a previous session: firebase-auth.js
  // resolves that asynchronously and fires 'signed-in' itself, so the
  // listener above covers it — nothing extra needed here.

  // Home-Screen Hero: checked once at load, no dedicated DOM event exists
  // for "launched as an installed app" beyond what splash.js already
  // detects for the splash screen itself.
  function checkPwaLaunch(){
    try{
      const standalone = window.matchMedia('(display-mode: standalone)').matches ||
        window.navigator.standalone === true;
      if(standalone) track('pwa_launch', {});
    }catch(e){ /* matchMedia unsupported — not worth failing over */ }
  }
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', checkPwaLaunch);
  } else {
    checkPwaLaunch();
  }

  /* ---------- Public API ---------- */
  window.MCA.achievements = {
    track,
    icons: ICONS,
    /* Full catalog for the Achievements page to render. Hidden entries
       keep their real id/category but the page is responsible for
       masking name/description/icon until state says they're unlocked. */
    list(){ return ACHIEVEMENTS.map(a=>({
      id:a.id, name:a.name, description:a.description, icon:a.icon,
      hidden:a.hidden, category:a.category, unlockType:a.unlockType
    })); },
    isUnlocked(id){ return !!state.unlocked[id]; },
    unlockedAt(id){ return state.unlocked[id] || null; },
    unlockedCount(){ return Object.keys(state.unlocked).length; },
    total(){ return ACHIEVEMENTS.length; },
    /* Resolves once Firebase has told us signed-in vs signed-out at least
       once, AND (if signed in) this session's saved state has been
       pulled from Firestore — so a page can render without a flash of
       "0/N" or the wrong login banner while auth is still resolving. */
    ready(){
      return new Promise(resolve=>{
        const start = Date.now();
        const check = ()=>{
          if(authResolved && (!window.MCA.isSignedIn() || stateLoaded)) return resolve();
          // Safety net: never leave a page waiting forever if Firebase
          // somehow never resolves (offline first load, blocked SDK, etc.).
          if(Date.now() - start > 6000) return resolve();
          setTimeout(check, 80);
        };
        check();
      });
    }
  };
})();
