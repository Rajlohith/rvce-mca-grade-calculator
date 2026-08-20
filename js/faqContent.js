/* ==========================================================================
   faqContent.js — plain-language explanations of every formula used,
   sourced from the RVCE PG Academic Handbook (2024-25) and the MCA
   2024 Scheme syllabus.
   ========================================================================== */
window.MCA = window.MCA || {};

window.MCA.FAQ = [
  {
    q: "How is CIE (Continuous Internal Evaluation) calculated?",
    a: `For a theory course, CIE is out of 100 and made of three parts:
    <ul>
      <li><b>Quizzes</b> — two quizzes, 10 marks each, added directly (out of 20).</li>
      <li><b>Tests</b> — two tests of 50 marks each (100 combined), then <b>scaled down to 40</b>: <code>(Test I + Test II) / 100 × 40</code>.</li>
      <li><b>Experiential Learning (EL)</b> — case-study teaching (10) + program-specific requirement (20) + a short video seminar (10) = 40.</li>
    </ul>
    Quiz + Test(scaled) + EL = CIE out of 100. For a course with an integrated lab, the lab CIE (out of 50, record + test) is added on top, making CIE out of 150. Lab-only courses use a smaller scheme: Lab (record+test, out of 40) + EL (out of 10) = 50.`
  },
  {
    q: "How is SEE (Semester End Examination) structured?",
    a: `A theory SEE paper is 100 marks across 5 units — each unit has two questions worth 20 marks, and you answer one from each pair (5 questions total). An integrated course also has a separate 50-mark lab exam (viva + prototype/demo), making SEE 150 for that course. A lab-only course's SEE is 50 marks: design & development (20), presentation/demo (20), and viva-voce (10).`
  },
  {
    q: "Do CIE and SEE carry equal weight?",
    a: `Yes — <b>every course is graded 50% CIE and 50% SEE</b>. A theory course is 100 CIE + 100 SEE = 200 total. A theory course with an integrated lab is 150 CIE + 150 SEE = 300 total. A lab-only course is 50 CIE + 50 SEE = 100 total. The final percentage is always <code>(CIE + SEE) / (max CIE + max SEE) × 100</code>.`
  },
  {
    q: "What's the minimum I need to pass — is 50% overall enough?",
    a: `No — a 50% aggregate isn't enough on its own. Each course has its own floor conditions that must <i>all</i> be met:
    <ul>
      <li><b>Theory only:</b> Quiz+Test ≥50% of 60, overall CIE ≥50% of 100, SEE ≥40% of 100, aggregate ≥50%.</li>
      <li><b>Theory + Lab:</b> Theory Quiz+Test ≥40% of 60 and Theory CIE ≥40% of 100; Lab CIE ≥50% of 50; combined CIE ≥50% of 150; Theory SEE ≥40% of 100; Lab SEE ≥50% of 50; combined SEE ≥50% of 150; aggregate ≥50%.</li>
      <li><b>Lab only:</b> CIE ≥50% of 50, SEE ≥50% of 50, aggregate ≥50%.</li>
    </ul>
    Miss any one of these and the course is recorded as <b>F</b>, even if the raw combined percentage looks like a pass.`
  },
  {
    q: "How do marks turn into a letter grade?",
    a: `RVCE uses an absolute 10-point scale (Table 4.3):
    <table style="width:100%;border-collapse:collapse;margin-top:8px;font-family:var(--font-mono);font-size:12.5px;">
      <tr style="border-bottom:1.5px solid var(--ink);"><th style="text-align:left;padding:4px 6px;">Grade</th><th style="text-align:left;padding:4px 6px;">Points</th><th style="text-align:left;padding:4px 6px;">% Range</th></tr>
      <tr style="border-bottom:1px solid var(--line);"><td style="padding:4px 6px;">O</td><td style="padding:4px 6px;">10</td><td style="padding:4px 6px;">90–100</td></tr>
      <tr style="border-bottom:1px solid var(--line);"><td style="padding:4px 6px;">A+</td><td style="padding:4px 6px;">9</td><td style="padding:4px 6px;">80–89</td></tr>
      <tr style="border-bottom:1px solid var(--line);"><td style="padding:4px 6px;">A</td><td style="padding:4px 6px;">8</td><td style="padding:4px 6px;">70–79</td></tr>
      <tr style="border-bottom:1px solid var(--line);"><td style="padding:4px 6px;">B+</td><td style="padding:4px 6px;">7</td><td style="padding:4px 6px;">60–69</td></tr>
      <tr style="border-bottom:1px solid var(--line);"><td style="padding:4px 6px;">B</td><td style="padding:4px 6px;">6</td><td style="padding:4px 6px;">55–59</td></tr>
      <tr style="border-bottom:1px solid var(--line);"><td style="padding:4px 6px;">C</td><td style="padding:4px 6px;">5</td><td style="padding:4px 6px;">50–54</td></tr>
      <tr><td style="padding:4px 6px;">F</td><td style="padding:4px 6px;">0</td><td style="padding:4px 6px;">0–49</td></tr>
    </table>`
  },
  {
    q: "What are W, I, X, DX and AB grades?",
    a: `These are <i>transitional</i> markers, not final grades — they get resolved into O–F once you clear the course:
    <ul>
      <li><b>DX</b> — you didn't meet the minimum CIE floor, so you're not allowed to sit the SEE for that course yet.</li>
      <li><b>I</b> — you met CIE, but missed the SEE for a valid, documented reason (illness, calamity, representing the college). Cleared via a makeup exam.</li>
      <li><b>W</b> — you formally withdrew from the course before the cutoff date, with counselor/HoD approval.</li>
      <li><b>X</b> — you had ≥85% attendance and ≥90% CIE, but still scored an F in SEE. Eligible for a makeup exam.</li>
      <li><b>AB</b> — you met CIE and attendance, but were simply absent for SEE without a pre-approved reason.</li>
    </ul>
    None of these count toward SGPA/CGPA until they resolve into a real letter grade.`
  },
  {
    q: "How is SGPA calculated?",
    a: `SGPA is a credit-weighted average of the grade points you earned that semester:
    <br><code>SGPA = Σ(course credits × grade points) / Σ(course credits)</code>
    <br>Only courses with a final letter grade (O–F) count — W, I, X, DX and AB are excluded from both the top and bottom of the fraction until they resolve. An <b>F</b> still counts its credits (dragging SGPA down with 0 grade points) — it isn't excluded like the transitional grades.`
  },
  {
    q: "How is CGPA calculated?",
    a: `CGPA is the same idea across every semester you've completed:
    <br><code>CGPA = Σ(semester credits × semester SGPA) / Σ(semester credits)</code>
    <br>MCA needs <b>80 credits across 4 semesters</b> to complete the program (19 + 23 + 20 + 18, per the 2024 scheme).`
  },
  {
    q: "What CGPA do I need for First Class / Distinction?",
    a: `Applied only once every semester is cleared with no F grade outstanding (Section 4.12d):
    <ul>
      <li><b>First Class with Distinction</b> — CGPA ≥ 7.0</li>
      <li><b>First Class</b> — CGPA ≥ 6.0 and &lt; 7.0</li>
      <li><b>Second Class</b> — CGPA ≥ 5.0 and &lt; 6.0</li>
    </ul>`
  },
  {
    q: "Does this calculator work for Internship, Project, or NPTEL courses?",
    a: `Not the CIE/SEE/Grade calculators — those three follow the standard theory/lab scheme only. Internship, Minor/Major Project, and NPTEL courses (like Research Methodology) are evaluated differently — projects go through guide + external panel evaluation and a viva-voce, and NPTEL is graded entirely online with no local CIE component. You can still enter their final letter grade directly into the SGPA/CGPA calculators once it's out.`
  },
  {
    q: "Is this an official RVCE tool?",
    a: `No. This is an independent, unofficial calculator built by a student for personal and peer use, based on a careful reading of the published PG Academic Handbook and the MCA 2024 Scheme syllabus. Always cross-check against your official grade card and the Controller of Examinations for anything that matters.`
  }
];