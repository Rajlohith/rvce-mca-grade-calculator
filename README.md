# RVCE MCA Grade Calculator

An unofficial CIE, SEE, final-grade and GPA calculator for **RVCE MCA (Master of
Computer Applications)** students, built directly from the college's own rules:

- *Academic Planning, Assessment & Evaluation Handbook — Guidelines and
  Information of Postgraduate Programs* (w.e.f. 2024-25)
- *MCA 2024 Scheme and Syllabus, Semester I-IV*

**Disclaimer: this is not an official RVCE tool, and no responsibility is
taken for discrepancies.** It is an independent student project, not
affiliated with or endorsed by R V College of Engineering. Always check your
official grade card and the Controller of Examinations for anything that
actually matters.

## What it does

The site walks a student through **Scheme → Year → Semester → Tool**, then
opens the requested calculator pre-loaded with that semester's real MCA
courses:

- **CIE Finalization & SEE Marks Required** — enter Quiz I/II/III and Test
  I/II/III as they're actually run; only the best two of each three are
  counted (Quiz best-2 out of 20, Test best-2 scaled to 40), plus an
  Experiential Learning mark out of 40 (or PBL in Semesters II & III — see
  below). That gets finalized into a CIE out of 100/150/50 depending on the
  course, and the tool then works out what SEE score is needed to hit a
  target grade, respecting the 40%/50% SEE floors rather than just the raw
  aggregate.
- **Final Grade Calculator** — enter just the two numbers that actually end
  up on a grade card: finalized CIE total and SEE total. Checked against the
  Table 4.4 *total-row* passing conditions (CIE ≥50%, SEE ≥40% for a
  theory-only course or ≥50% for a course with a lab component, aggregate
  ≥50%) — no quiz/test/lab sub-breakdown required at this stage.
- **Final GPA Calculator** — SGPA for a single semester, using that
  semester's real courses and credits.
- **CGPA Calculator** — weighted across all four semesters, with a live
  progress bar toward the MCA program's 80-credit total and a projected
  degree class (First Class with Distinction / First Class / Second Class).
- **FAQ** — a plain-language explanation of every formula the app uses.

Only the 2024 scheme is implemented. A 2026 scheme option is visible on the
scheme-selection page but disabled ("Coming soon") until that syllabus is
published and added.

### Course data is fixed, not freehand

Every course list in this app — in the CIE/SEE tool, the Final Grade tool and
the Final GPA table — is read directly from `data/courses.json` for the
semester selected, and that is the only source a calculator will ever use.
There is no "manual" or "custom course" entry point anywhere in the
interface: course names, credit values and CIE/SEE structure cannot be typed
in or edited by hand. This is deliberate — it keeps every result traceable
back to an actual line in the syllabus, and it means the numbers cannot
silently drift from what the scheme says. Professional elective groups are
still selectable by their actual elective title; the underlying CIE/SEE/
credit structure for the group is fixed regardless of which elective within
it is chosen.

Every numeric field also has a hard min/max: type a value above a field's
maximum and it's clamped back down immediately, with an inline warning
telling you the actual limit. This runs globally through one delegated
listener (`js/input-guard.js`) rather than being wired up field by field, so
it automatically covers new fields too.

If a course is missing or a value looks wrong, please open an issue on the
GitHub repository rather than editing it locally — see [Data accuracy](#data-accuracy).

## Navigation

The site is a set of separate, statically linked HTML pages rather than a
single-page app, so every step has its own URL and the browser's back/forward
buttons work as expected:

```
index.html               Home (project root)
  -> pages/scheme.html      Step 1: choose the scheme (only 2024 is active)
  -> pages/year.html        Step 2: choose Year 1 or Year 2
  -> pages/semester.html    Step 3: choose the semester within that year
  -> pages/tools.html       Step 4: choose a calculator for that semester
      -> pages/cie-see.html
      -> pages/final-grade.html
      -> pages/final-gpa.html
pages/cgpa.html           Reachable directly from the header at any time
pages/faq.html            Reachable directly from the header at any time
```

State (scheme / year / semester) is carried between pages as query-string
parameters, e.g. `tools.html?scheme=2024&year=1&semester=I`. Every page
validates its own query string on load and redirects back to `scheme.html`
if it is missing or invalid, so a bookmarked or shared link either resolves
correctly or fails safely.

The scheme is chosen first, ahead of year and semester, because it is what
actually determines everything downstream: the course list, credit
structure and CIE/SEE weightage for all four semesters are fixed once per
scheme, not per year.

## Design

The visual language (white cards on a soft gray gradient, rounded-2xl/3xl
corners, a single near-black primary action color, blue reserved for focus
states, green/red for pass/fail) is a deliberate, from-scratch CSS
implementation of the look and feel of the author's other, Tailwind-based
RVCE grade calculator project — rebuilt here in plain CSS since this project
intentionally has no build step. No code was copied between the two; only
the design language was carried over.

A light/dark toggle sits in the header on every page. Dark mode is a soft
charcoal surface, not pure black, so it stays comfortable during long
sessions. The choice is remembered (`localStorage`) and applied before the
page paints, so there's no flash of the wrong theme on reload.

The footer is intentionally minimal: one short paragraph, one row of links,
the syllabus PDF choice, and a legal line — no repeated column headings or
dense multi-column grid.

### A note on the CIE breakdown for theory + lab courses

The Quiz/Test split described above is the same in every semester, but what
sits alongside it for a course with an integrated lab is not:

- **Semester I** follows Table 4.2.2 as published: Experiential Learning
  (/40) on the theory side, plus Lab (record + test, /40) + Lab
  Experiential Learning (/10) = 50 lab marks, for CIE out of 150.
- **Semesters II & III** use this college's own current practice instead:
  **PBL (Project Based Learning)** stands in for the theory-side
  Experiential Learning mark — same 40 marks, same role in the floor
  checks, just relabeled — alongside a single 50-mark Lab / Practical CIE
  (no separate lab EL here). Quiz+Test(60) + PBL(40) + Lab(50) = CIE out of
  **150**, the same total as Semester I. The PBL label itself isn't in the
  published handbook table, but `js/engine.js` applies the same floor
  conditions to it as it would to EL, and says so explicitly wherever it
  applies.

## Tech stack

Deliberately boring: **plain HTML, CSS and JavaScript, no framework, no
build step.** No React, no bundler, no `npm install` required to run it —
open `index.html` and it works. `js/data.js` mirrors `data/courses.json` as
a plain JS object so the browser never needs to `fetch()` anything, which
keeps the app working even when opened directly from disk rather than served
over HTTP.

```
rvce-mca-grade-calculator/
├── index.html                    Home (must stay at the project root)
├── pages/
│   ├── scheme.html                 Step 1 — scheme selection
│   ├── year.html                   Step 2 — year selection
│   ├── semester.html               Step 3 — semester selection
│   ├── tools.html                  Step 4 — calculator picker for a semester
│   ├── cie-see.html                CIE Finalization & SEE Marks Required
│   ├── final-grade.html            Final Grade Calculator
│   ├── final-gpa.html              Final GPA (SGPA) Calculator
│   ├── cgpa.html                   CGPA Calculator (all semesters)
│   └── faq.html                    FAQ
├── css/
│   ├── variables.css               design tokens (colors, type, radii)
│   ├── base.css                    resets & base typography
│   ├── layout.css                  site header, page hero, breadcrumb, footer
│   └── components.css              cards, forms, tables, buttons, FAQ, footer
├── js/
│   ├── data.js                     MCA course data + grading constants (mirrors data/courses.json)
│   ├── grading.js                  shared grading-table helpers (letter <-> grade point, etc.)
│   ├── engine.js                   pure calculation functions — CIE, SEE, final grade, SGPA, CGPA
│   ├── course-picker.js            restricts every course dropdown to data.js — no manual entry
│   ├── input-guard.js              clamps every numeric field to its min/max, shows a warning
│   ├── faqContent.js               FAQ question/answer content
│   ├── site.js                     shared header, footer, breadcrumb, path & query-string helpers
│   └── pages/                      one small script per HTML page, wiring that page only
│       ├── year.js, semester.js, tools.js
│       ├── cie-see.js, final-grade.js, final-gpa.js
│       └── cgpa.js, faq.js
├── data/
│   └── courses.json                canonical course data (semester -> courses[], credits, CIE/SEE max, syllabus page)
└── docs/
    └── MCA-2024-Scheme-Syllabus.pdf   the source syllabus, linked from the app
```

`index.html` has to stay at the project root for the site to open correctly
at its root URL (e.g. on GitHub Pages); every other page lives one level
down in `pages/`. `js/site.js` works out which of the two contexts it's
running in and adjusts every link it generates accordingly — nothing else
needs to know or care where a given page physically lives.

## Running it

No build step. Either:

```bash
# just open it
open index.html          # macOS
# or double-click index.html in your file browser

# or serve it locally (identical result, avoids any browser file:// quirks)
npm run dev                # runs `npx serve .` on http://localhost:5173
```

## Data accuracy

Course codes, titles, credits and CIE/SEE marks for all four semesters were
transcribed from the RVCE 2024 Scheme syllabus PDF (`docs/`). The grading
table, passing standards, CIE scheme and credit-distribution rules come from
the PG Academic Handbook. If RVCE revises either document, `data/courses.json`
(mirrored in `js/data.js`) and `js/grading.js` are the two places to update —
every page reads from them, so nothing else needs to change.

## Contributing

Issues and pull requests are welcome at the GitHub repository linked below.
Please keep contributions consistent with the "no manual course entry"
design described above — corrections belong in `data/courses.json`, not in
the calculator forms.

## Contact

- GitHub repository: <https://github.com/Rajlohith/rvce-mca-grade-calculator>
- Email: <brlohithraj.mca25@rvce.edu.in>
- Official RVCE scheme & syllabus: <https://rvce.edu.in/academics_and_examinations/rvce_scheme_syllabus/>

## License

Licensed under the [Apache License, Version 2.0](LICENSE). See `NOTICE` for
the required attribution notice. In short: you may use, modify and
redistribute this project, including for commercial purposes, provided you
retain the copyright and license notices and clearly mark any changes you
make — just do not present a modified copy as an official RVCE tool.


## Credits

Major insipration drawn for creating this project from existing live project facilitating UG programs at RVCE

Repo: https://github.com/Vidisha231106/rvce-grade-calculator
Site: https://rvce-grade-calculator.vercel.app/