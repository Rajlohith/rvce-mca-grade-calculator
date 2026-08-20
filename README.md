# MCA Grade Ledger — RVCE

An unofficial CIE, SEE, final-grade and GPA calculator for **RVCE MCA (Master of
Computer Applications)** students, built directly from the college's own rules:

## Credits
- *Academic Planning, Assessment & Evaluation Handbook — Guidelines and
  Information of Postgraduate Programs* (w.e.f. 2024–25)
- *MCA 2024 Scheme and Syllabus, Semester I–IV*

Major insipration drawn for creating this project from existing live project facilitating UG programs at RVCE
> ⚠️ **Disclaimer: Not official. No responsibility for discrepancies.**
> This is an independent student project, not affiliated with or endorsed by
> RVCE. Always check your official grade card and the Controller of
> Examinations for anything that actually matters.

Repo: https://github.com/Rajlohith/rvce-mca-grade-calculator.git
Site: https://rvce-grade-calculator.vercel.app/
---

## What it does

The app walks you through **Year → Scheme → Semester → Tool**, then opens the
right calculator, pre-aware of that semester's real MCA courses:

- **CIE Finalization & SEE Marks Required** — tally Quiz + Test + Experiential
  Learning into your finalized CIE, then immediately see what SEE score you'd
  need to hit a target grade (respecting the 40%/50% SEE floors, not just the
  raw aggregate).
- **Final Grade Calculator** — enter what you actually scored and get the
  letter grade, checked against *every* passing condition in the handbook
  (not just "50% overall").
- **Final GPA Calculator** — SGPA for that semester, pre-loaded with its real
  courses and credits, fully editable.
- **CGPA Calculator** — weighted across all four semesters, with a live
  progress bar toward MCA's 80-credit total and a projected degree class
  (First Class with Distinction / First Class / Second Class).
- **FAQ** — a plain-language explanation of every formula the app uses.

The 2024 scheme is the only one implemented right now; a 2026 scheme option
is visible but greyed out ("Coming soon") until that syllabus is published
and added.

## Why this project exists

The original idea (and the credit-structure/CIE-scheme rules) trace back to
[rvce-grade-calculator](https://github.com/Vidisha231106/rvce-grade-calculator),
which covers the UG engineering cycle. This is a **from-scratch rebuild**
for the MCA postgraduate program specifically — different rules (PG CIE/SEE
weightage, MCA credit structure, MCA course list), different codebase,
different design.

## Tech stack

Deliberately boring: **plain HTML, CSS and JavaScript, no framework, no
build step.** No React, no bundler, no npm install required to run it —
open `index.html` and it works. The `data.js` file *is* `data/courses.json`,
just pre-loaded as a JS object so the browser doesn't need to `fetch()`
anything (which keeps it working even opened directly from disk, not just
over a local server).

```
mca-grade-ledger/
├── index.html            entry point — open this directly, or serve the folder
├── css/
│   ├── variables.css      design tokens (colors, type, radii)
│   ├── base.css           resets & base typography
│   ├── layout.css         masthead, tabs/breadcrumb, page structure
│   └── components.css     cards, forms, tables, buttons, choice cards, FAQ
├── js/
│   ├── data.js            MCA course data + grading constants (generated from data/courses.json)
│   ├── grading.js         shared grading-table helpers (letter ↔ grade point, etc.)
│   ├── engine.js           pure calculation functions — CIE, SEE, final grade, SGPA, CGPA
│   ├── faqContent.js        FAQ question/answer content
│   ├── views.js             render()/wire() pairs for every screen
│   └── app.js                tiny hand-rolled router + breadcrumb builder
├── data/
│   └── courses.json         canonical course data (semester → courses[], credits, CIE/SEE max, syllabus page)
└── docs/
    └── MCA-2024-Scheme-Syllabus.pdf   the source syllabus, linked from the app
```

## Running it

No build step. Either:

```bash
# just open it
open index.html          # macOS
# or double-click index.html in your file browser

# or serve it locally (identical result, avoids any browser file:// quirks)
npm run dev               # runs `npx serve .` on http://localhost:5173
```

## Data accuracy

Course codes, titles, credits and CIE/SEE marks for all four semesters were
transcribed from the uploaded 2024 Scheme syllabus PDF (`docs/`). The grading
table, passing standards, CIE scheme, and credit-distribution rules come from
the PG Academic Handbook. If RVCE revises either document, `data/courses.json`
and `js/grading.js` are the two places to update — everything else reads
from them.

## Contributing / contact

- Issues & PRs: <https://github.com/Rajlohith/rvce-mca-grade-calculator>
- Email: <brlohithraj.mca25@rvce.edu.in>

## License

MIT — do whatever you want with it, just don't present it as an official
RVCE tool.
## Credits

Major insipration drawn for creating this project from existing live project facilitating UG programs at RVCE

Repo: https://github.com/Vidisha231106/rvce-grade-calculator
Site: https://rvce-grade-calculator.vercel.app/