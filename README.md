# RVCE MCA Grade Calculator

![Static Site](https://img.shields.io/badge/Type-Static%20Site-orange)
![No Build Step](https://img.shields.io/badge/Build%20Step-None-success)
![JavaScript](https://img.shields.io/badge/JavaScript-Vanilla-F7DF1E?logo=javascript&logoColor=black)
![HTML5](https://img.shields.io/badge/HTML-5-E34F26?logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS-3-1572B6?logo=css3&logoColor=white)
![License](https://img.shields.io/badge/License-Apache%202.0-D22128)

> An unofficial CIE, SEE, final-grade and GPA calculator for RVCE MCA (Master of Computer Applications) students, built directly from the college's own published rules rather than guesswork.

This project walks a student through their scheme, year and semester, then opens a calculator that is already pre-loaded with that semester's real courses, credit values and CIE/SEE structure. Every course sits on its own card so multiple subjects can be worked through side by side, and nothing is calculated, finalized or shown as a passing grade until every field that matters for that subject has actually been filled in.

The two documents this app is built from:

- *Academic Planning, Assessment & Evaluation Handbook, Guidelines and Information of Postgraduate Programs* (w.e.f. 2024-25)
- *MCA 2024 Scheme and Syllabus, Semester I-IV*

**Disclaimer: this is not an official RVCE tool, and no responsibility is taken for discrepancies.** It is an independent student project, not affiliated with or endorsed by R V College of Engineering. Always check your official grade card and the Controller of Examinations for anything that actually matters.

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Technology Stack](#technology-stack)
- [System Architecture](#system-architecture)
  - [Navigation Flow](#navigation-flow)
  - [Course Data Flow](#course-data-flow)
- [The Five Calculators](#the-five-calculators)
- [CIE Breakdown by Semester](#cie-breakdown-by-semester)
- [Input Validation](#input-validation)
- [Course Data Is Fixed, Not Freehand](#course-data-is-fixed-not-freehand)
- [Design](#design)
- [Repository Structure](#repository-structure)
- [Running It](#running-it)
- [Data Accuracy](#data-accuracy)
- [Contributing](#contributing)
- [Contact](#contact)
- [License](#license)
- [Credits](#credits)

## Overview

RVCE revises the MCA scheme roughly every two academic years, and every revision changes course codes, credit weights, and sometimes the CIE breakdown itself. Rather than a single generic "enter your marks" form, this project encodes the actual current scheme as structured data, and every calculator reads from that data instead of asking the student to remember or retype it.

The site is a plain set of statically linked HTML pages: `index.html` at the project root, and everything else one level down in `pages/`. There is no single-page app router and no client-side framework. Query-string parameters (`?scheme=2024&year=1&semester=I`) carry the student's place in the wizard from page to page, so a bookmarked or shared link resolves correctly on its own, and the browser's back and forward buttons behave exactly as expected.

## Key Features

**Guided Navigation**
- A four-step wizard (Scheme, Year, Semester, Tool) that narrows down to the exact calculator needed, with a breadcrumb trail on every page for jumping back.
- Every step's query string is validated on load; an invalid or missing parameter redirects back to scheme selection instead of rendering a broken page.

**Course-Card Layout**
- Every course in the chosen semester appears as its own card, side by side, on both the CIE Finalization page and the Final Grade Calculator. Nothing is tucked behind a single dropdown.
- Calculating one course's marks has no effect on any other card on the page.

**CIE Finalization & SEE Marks Required**
- Quiz I, II and III and Test I, II and III are entered as they are actually run; only the best two of each three are counted.
- Once a course's CIE is calculated, its SEE Marks Required button unlocks and opens a popup listing the SEE score needed for every passing grade at once, from O down to C, instead of one target at a time.
- For a course with a lab component, an optional field lets a student fix the Lab SEE and see the exact Theory SEE needed around it.

**Final Grade Calculator**
- Takes just the two numbers that actually end up on a grade card: finalized CIE total and SEE total.
- Checked against the Table 4.4 total-row passing conditions (CIE at least 50%, SEE at least 40% for a theory-only course or 50% for a course with a lab component, aggregate at least 50%), with no quiz, test or lab sub-breakdown required at this stage.

**Final SGPA Calculator**
- SGPA for a single semester, shown as one row per real course with its own grade dropdown, plus a CGPA blend directly underneath: enter a CGPA and credit total through the previous semester and it merges automatically with the SGPA just computed.
- The full, detailed semester-by-semester CGPA Calculator is still available separately for anyone who wants that instead.

**CGPA Calculator**
- Weighted across all four semesters, with a live progress bar toward the MCA program's 80-credit total and a projected degree class (First Class with Distinction, First Class, or Second Class).

**FAQ**
- A plain-language explanation of every formula the app uses, sourced from the same two documents as the calculators themselves.

Only the 2024 scheme is implemented today. A 2026 scheme option is visible on the scheme-selection page but disabled and marked "Coming soon" until that syllabus is published and added.

## Technology Stack

| Layer | Technology |
| ----- | ----- |
| Markup | Plain HTML, one file per page |
| Styling | Plain CSS, no preprocessor, split into `variables.css`, `base.css`, `layout.css`, `components.css` |
| Logic | Vanilla JavaScript, ES5-style function scoping, no framework |
| Data | A single `data/courses.json` file, mirrored as a plain JS object in `js/data.js` |
| Fonts | Google Fonts (Inter and JetBrains Mono), loaded via a standard `<link>` tag |
| Build tooling | None. There is no bundler, transpiler or install step of any kind |

`js/data.js` mirrors `data/courses.json` as a plain JS object, so the browser never needs to `fetch()` anything at runtime. That keeps the app fully working even when `index.html` is opened directly from disk, with no server involved at all.

## System Architecture

### Navigation Flow

```mermaid
flowchart TD
    A["index.html<br/>Home"] --> B["pages/scheme.html<br/>Step 1: Scheme"]
    B --> C["pages/year.html<br/>Step 2: Year"]
    C --> D["pages/semester.html<br/>Step 3: Semester"]
    D --> E["pages/tools.html<br/>Step 4: Tool picker"]
    E --> F["pages/cie-see.html<br/>CIE Finalization & SEE Marks Required"]
    E --> G["pages/final-grade.html<br/>Final Grade Calculator"]
    E --> H["pages/final-gpa.html<br/>Final SGPA Calculator"]
    I["pages/cgpa.html<br/>CGPA Calculator"]
    J["pages/faq.html<br/>FAQ"]
    A -.reachable anytime.-> I
    A -.reachable anytime.-> J
```

Scheme is chosen before year and semester because it is what actually determines everything downstream. The course list, credit structure and CIE/SEE weightage for all four semesters are fixed once per scheme, not once per year, so locking that choice in first keeps the rest of the wizard consistent.

### Course Data Flow

```mermaid
flowchart LR
    A["data/courses.json<br/>canonical source"] --> B["js/data.js<br/>mirrored JS object"]
    B --> C["js/course-picker.js<br/>selectable entries, no manual entry"]
    C --> D["CIE & SEE cards"]
    C --> E["Final Grade cards"]
    C --> F["Final SGPA rows"]
    B --> G["js/grading.js<br/>bands, floors, degree classes"]
    G --> H["js/engine.js<br/>pure calculation functions"]
    H --> D
    H --> E
    H --> F
    H --> I["pages/cgpa.html"]
```

`js/engine.js` contains no DOM code at all; it is a set of pure functions that take plain values in and return plain result objects out. Every page-level script in `js/pages/` calls into the same engine and renders the result itself, so the CIE math, the SEE math and the grading math can never drift out of sync between pages.

## The Five Calculators

| Tool | File | What it needs | What it returns |
| ----- | ----- | ----- | ----- |
| CIE Finalization & SEE Marks Required | `pages/cie-see.html` | Quiz I-III, Test I-III, EL/PBL, Lab marks | Finalized CIE, plus SEE needed for every grade band |
| Final Grade Calculator | `pages/final-grade.html` | Finalized CIE total, SEE total | Letter grade, grade point, pass/fail against Table 4.4 |
| Final SGPA Calculator | `pages/final-gpa.html` | A grade for every course in the semester | SGPA, plus an optional CGPA blend with a prior CGPA |
| CGPA Calculator | `pages/cgpa.html` | SGPA for each completed semester | CGPA, credit progress bar, projected degree class |
| FAQ | `pages/faq.html` | Nothing, reference only | Plain-language explanation of every formula above |

## CIE Breakdown by Semester

The Quiz and Test split is identical in every semester: three quizzes out of 10 each (best two count, out of 20), and three tests out of 50 each (best two count, scaled down to 40). What sits alongside that, for a course with an integrated lab, changes by semester:

- **Semester I** follows Table 4.2.2 as published: Experiential Learning (out of 40) on the theory side, plus a single combined Lab (record + test) mark out of 50, for a CIE out of 150 in total.
- **Semesters II and III** use the college's own current practice instead: **PBL (Project Based Learning)** stands in for the theory-side Experiential Learning mark, at the same 40-mark weight and the same role in the floor checks, alongside a single 50-mark Lab / Practical CIE. Quiz+Test (60) + PBL (40) + Lab (50) totals the same 150 as Semester I. The PBL label itself is not in the published handbook table, but `js/engine.js` applies the same floor conditions to it as it would to EL, and says so explicitly in the note shown under each result.

## Input Validation

Every numeric field has a hard minimum and maximum. Typing a value above a field's maximum clamps it back down immediately, with an inline warning naming the actual limit. This runs through a single delegated listener (`js/input-guard.js`) rather than being wired up field by field, so it automatically covers new fields added later too.

On top of that, both the CIE Finalization page and the Final Grade Calculator require every relevant field for a given course to be filled in before that course's result is shown at all. Pressing Calculate on a card with any field still empty highlights the empty fields, shows a message naming how many are missing, and leaves the result and the SEE Marks Required button locked, so a partially filled course never displays a mark, a percentage or a grade that looks final when it is not. This check applies per course card: finishing one subject's marks does not unlock or affect any other subject on the same page.

## Course Data Is Fixed, Not Freehand

Every course list in this app, in the CIE/SEE tool, the Final Grade tool and the Final SGPA table, is read directly from `data/courses.json` for the semester selected, and that is the only source a calculator will ever use. There is no manual or custom course entry point anywhere in the interface: course names, credit values and CIE/SEE structure cannot be typed in or edited by hand. This is deliberate. It keeps every result traceable back to an actual line in the syllabus, and it means the numbers cannot silently drift from what the scheme says. Professional elective groups are still selectable by their actual elective title; the underlying CIE/SEE/credit structure for the group is fixed regardless of which elective within it is chosen.

If a course is missing or a value looks wrong, please open an issue on the GitHub repository rather than editing it locally. See [Data Accuracy](#data-accuracy).

## Design

The visual language (white cards on a soft gray gradient, rounded corners, a single near-black primary action color, blue reserved for focus states, green and red for pass and fail) is a from-scratch CSS implementation with no build tooling behind it.

Course-picker, tool-picker and semester-picker cards use small colored icon badges built from inline SVG, not emoji, so the wizard reads as a set of distinct destinations rather than a wall of identical white boxes. `js/icons.js` holds the shared icon set.

A light and dark toggle sits in the header on every page. Dark mode is a soft charcoal surface rather than pure black, so it stays comfortable during long study sessions. The choice is remembered through `localStorage` and applied before the page paints, so there is no flash of the wrong theme on reload.

The footer is intentionally minimal: one short paragraph, one row of links, the syllabus PDF choice, and a legal line, rather than a dense multi-column grid of repeated headings.

## Repository Structure

```
rvce-mca-grade-calculator/
│
├── index.html                    Home (must stay at the project root)
├── pages/
│   ├── scheme.html                 Step 1: scheme selection
│   ├── year.html                   Step 2: year selection
│   ├── semester.html               Step 3: semester selection
│   ├── tools.html                  Step 4: calculator picker for a semester
│   ├── cie-see.html                CIE Finalization & SEE Marks Required
│   ├── final-grade.html            Final Grade Calculator
│   ├── final-gpa.html              Final SGPA Calculator (+ CGPA blend)
│   ├── cgpa.html                   CGPA Calculator (all semesters)
│   └── faq.html                    FAQ
├── css/
│   ├── variables.css               design tokens: colors, type, radii
│   ├── base.css                    resets and base typography
│   ├── layout.css                  site header, page hero, breadcrumb, footer
│   └── components.css              cards, forms, tables, buttons, FAQ, footer
├── js/
│   ├── data.js                     MCA course data and grading constants (mirrors data/courses.json)
│   ├── grading.js                  shared grading-table helpers (letter to grade point, etc.)
│   ├── engine.js                   pure calculation functions: CIE, SEE, final grade, SGPA, CGPA
│   ├── course-picker.js            restricts every course dropdown to data.js, no manual entry
│   ├── input-guard.js              clamps every numeric field to its min/max, shows a warning
│   ├── icons.js                    shared inline-SVG icon set for the colored badges
│   ├── faqContent.js               FAQ question and answer content
│   ├── site.js                     shared header, footer, breadcrumb, path and query-string helpers
│   └── pages/                      one small script per HTML page, wiring that page only
│       ├── year.js, semester.js, tools.js
│       ├── cie-see.js, final-grade.js, final-gpa.js
│       └── cgpa.js, faq.js
├── data/
│   └── courses.json                canonical course data: semester to courses, credits, CIE/SEE max, syllabus page
└── docs/
    ├── MCA-2024-Scheme-Syllabus.pdf   the source syllabus, linked from the app
    └── PG-2024-Scheme-Handbook.pdf    the source academic handbook, linked from the app
```

`index.html` has to stay at the project root for the site to open correctly at its root URL (for example, on GitHub Pages); every other page lives one level down in `pages/`. `js/site.js` works out which of the two contexts it is running in and adjusts every link it generates accordingly, so nothing else needs to know or care where a given page physically lives.

## Running It

There is no build step of any kind. Any of the following works:

```bash
# just open it directly
open index.html          # macOS
# or double-click index.html in your file browser

# or serve it locally with any static file server you already have,
# for example Python's built-in one, from the project root:
python3 -m http.server 5173
```

Because `js/data.js` mirrors `data/courses.json` as a plain JS object, the app works identically whether it is opened straight from disk or served over HTTP; nothing needs to be fetched at runtime.

## Data Accuracy

Course codes, titles, credits and CIE/SEE marks for all four semesters were transcribed from the RVCE 2024 Scheme syllabus PDF (`docs/`). The grading table, passing standards, CIE scheme and credit-distribution rules come from the PG Academic Handbook. If RVCE revises either document, `data/courses.json` (mirrored in `js/data.js`) and `js/grading.js` are the two places to update; every page reads from them, so nothing else needs to change.

## Contributing

Contributions are welcome!

1. Fork the repository.
2. Create a new branch: `git checkout -b feature-new-feature`
3. Make your changes and commit them: `git commit -m 'Add new feature'`
4. Push to the branch: `git push origin feature-new-feature`
5. Open a pull request.

Please follow consistent coding styles and include clear commit messages. Please also keep contributions consistent with the "no manual course entry" design described above: corrections belong in `data/courses.json`, not in the calculator forms.

## Contact

- GitHub repository: <https://github.com/Rajlohith/rvce-mca-grade-calculator>
- Email: <brlohithraj.mca25@rvce.edu.in>
- Official RVCE scheme and syllabus: <https://rvce.edu.in/academics_and_examinations/rvce_scheme_syllabus/>

## License

Licensed under the [Apache License, Version 2.0](LICENSE). See `NOTICE` for the required attribution notice. In short: you may use, modify and redistribute this project, including for commercial purposes, provided you retain the copyright and license notices and clearly mark any changes you make. Just do not present a modified copy as an official RVCE tool.

## Credits

Major inspiration drawn for creating this project from an existing live project facilitating UG programs at RVCE.

Repo: https://github.com/Vidisha231106/rvce-grade-calculator

Site: https://rvce-grade-calculator.vercel.app/
