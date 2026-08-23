/* ==========================================================================
   faqContent.js — plain-language explanations of every formula used,
   sourced from the RVCE PG Academic Handbook (2024-25) and the MCA
   2024 & 2026 Scheme syllabus.
   ========================================================================== */
window.MCA = window.MCA || {};

window.MCA.FAQ = [
  {
    q: "How is CIE (Continuous Internal Evaluation) calculated?",
    a: `For a theory course, CIE is out of 100 and has three parts:
    <ul>
      <li><b>Quizzes</b> - You have three quizzes (Quiz I, II, III) worth 10 marks each, but only your <b>best two</b> count (out of 20).</li>
      <li><b>Tests</b> - You take three tests (Test I, II, III) for 50 marks each. The <b>best two</b> are added together (out of 100) and then <b>scaled down to 40</b>: <code>(best two of Test I/II/III) / 100 × 40</code>.</li>
      <li><b>Experiential Learning (EL)</b> - Just one combined score out of 40.</li>
    </ul>
    Quiz(best 2) + Test(best 2, scaled) + EL = CIE out of 100. That part is exactly the same every semester. But if you have an integrated lab, the extra marks depend on the semester:
    <ul>
      <li><b>Semester I</b> - Lab (record + test, out of 40) + Lab Experiential Learning (out of 10) = 50 lab marks. Add that to your 100 theory marks, and your CIE is out of <b>150</b>.</li>
      <li><b>Semester II &amp; III</b> - PBL (Project Based Learning) replaces the theory EL mark. It's still 40 marks and has the same minimum requirements, just a different name. The Lab/Practical CIE is still a single 50-mark field. Quiz+Test(60) + PBL(40) = 100 "theory" total + 50 lab = CIE out of <b>150</b> (same as Sem I, just with PBL instead of EL). You won't see the PBL label in the handbook table, but the standard EL rules still apply.</li>
    </ul>
    For lab-only courses (no theory, any semester), it follows the smaller Table 4.2.3 scheme: Lab (record+test, out of 40) + EL (out of 10) = 50.`
  },
  {
    q: "How is SEE (Semester End Examination) structured?",
    a: `A theory SEE paper is 100 marks covering 5 units. Each unit gives you two 20-mark questions, and you have to answer one from each pair (5 questions total). If it's an integrated course, there's also a separate 50-mark lab exam (viva + prototype/demo), which pushes the SEE up to 150. This setup stays exactly the same every semester, even if the CIE breakdown changes (check the CIE question above). For lab-only courses, the SEE is just 50 marks: design & development (20), presentation/demo (20), and viva-voce (10).`
  },
  {
    q: "Do CIE and SEE carry equal weight?",
    a: `Yep! <b>Every course is graded 50% CIE and 50% SEE</b> across all semesters. A standard theory course is 100 CIE + 100 SEE = 200 total. A theory course with an integrated lab is 150 CIE + 150 SEE = 300 total. This applies to Semester I <i>and</i> Semesters II &amp; III because PBL just swaps in for Experiential Learning at the same 40-mark weight without changing the total. A lab-only course is 50 CIE + 50 SEE = 100 total. Your final percentage is always calculated as <code>(CIE + SEE) / (max CIE + max SEE) × 100</code>.`
  },
  {
    q: "What's the minimum I need to pass? Is 50% overall enough?",
    a: `No, just getting a 50% aggregate isn't enough. You have to meet specific floor conditions for each course. The site checks these at two different levels depending on the tool you use:
    <ul>
      <li>The <b>CIE Finalization tool</b> checks the detailed Table 4.4 rules while you're still building your CIE score. For example, in a theory course, your Quiz+Test must be &ge;50% of 60 <i>and</i> your overall CIE must be &ge;50% of 100. In Semesters II &amp; III, the same logic applies with PBL instead of EL: Quiz+Test &ge;24/60 and Quiz+Test+PBL &ge;40/100, Lab CIE &ge;25/50, and combined &ge;75/150.</li>
      <li>The <b>Final Grade tool</b> only looks at your finalized CIE and SEE totals. It runs the Table 4.4 <i>total-row</i> checks: For theory only, you need CIE &ge;50%, SEE &ge;40%, and an aggregate &ge;50%. For theory+lab or lab-only courses, it's CIE &ge;50%, SEE &ge;50%, and aggregate &ge;50%.</li>
    </ul>
    If you miss even one of these cutoffs, the course is marked as an <b>F</b>, even if your raw percentage looks like a passing grade.`
  },
  {
    q: "What's the difference between EL and PBL?",
    a: `They're both Experiential Learning marks, just set up differently depending on the semester and course:
    <ul>
      <li><b>EL (Experiential Learning)</b> - This is the standard 40-mark theory component every course has. In Semester I only, there's also a separate 10-mark Lab EL right next to the 40-mark Lab CIE.</li>
      <li><b>PBL (Project Based Learning)</b> - This is only used for theory+lab courses in Semesters II &amp; III. It basically replaces the theory-side EL with the exact same 40 marks, sitting next to a 50-mark Lab/Practical CIE (there's no separate lab EL in these semesters).</li>
    </ul>
    The CIE Finalization tool will automatically show you the right one based on the course and semester you select.`
  },
  {
    q: "How do marks turn into a letter grade?",
    a: `RVCE grades on an absolute 10-point scale (Table 4.3):
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
    a: `Think of these as temporary placeholders, not your actual final grades. They eventually turn into standard grades (O to F) once the course is fully cleared:
    <ul>
      <li><b>DX</b> - You didn't hit the minimum CIE cutoff, so you're not allowed to write the SEE for that course yet.</li>
      <li><b>I</b> - You met the CIE requirements but missed the SEE for a valid, documented reason (like being sick, a family emergency, or representing the college). You clear this by taking a makeup exam.</li>
      <li><b>W</b> - You officially dropped the course before the deadline with approval from your counselor or HoD.</li>
      <li><b>X</b> - You had &ge;85% attendance and &ge;90% in CIE, but still failed the SEE. You're allowed to take a makeup exam.</li>
      <li><b>AB</b> - You had the required CIE and attendance, but you just didn't show up for the SEE and didn't get prior approval.</li>
    </ul>
    None of these will affect your SGPA or CGPA until they get updated to a real letter grade.`
  },
  {
    q: "How is SGPA calculated?",
    a: `SGPA is basically the credit-weighted average of your grade points for a specific semester:
    <br><code>SGPA = Σ(course credits × grade points) / Σ(course credits)</code>
    <br>Only courses with a final letter grade (O to F) are included. Temporary grades like W, I, X, DX, and AB are totally ignored in the math until they get resolved. But watch out: an <b>F</b> grade still counts your credits! It gives you 0 grade points, which drags down your SGPA. It's not ignored like the temporary grades.`
  },
  {
    q: "How is CGPA calculated?",
    a: `CGPA works the exact same way, just spread across all the semesters you've finished:
    <br><code>CGPA = Σ(semester credits × semester SGPA) / Σ(semester credits)</code>
    <br>For MCA, you need 80 credits over 4 semesters to graduate (19 + 23 + 20 + 18 under the 2024 scheme; the 2026 scheme isn't out yet).
    <br><br>This site gives you two ways to calculate it. The <b>Final SGPA Calculator</b> lets you do a quick mix: just plug in your current CGPA and total credits up to your last semester, and it merges that with your new SGPA so you don't have to type everything in again. If you want to see all the math laid out, the <b>detailed CGPA Calculator</b> runs the formula the long way, semester by semester.`
  },
  {
    q: "What CGPA do I need for First Class / Distinction?",
    a: `This only kicks in once you've cleared every semester without any pending F grades (based on Section 4.12d):
    <ul>
      <li><b>First Class with Distinction</b> - CGPA &ge; 7.0</li>
      <li><b>First Class</b> - CGPA &ge; 6.0 and &lt; 7.0</li>
      <li><b>Second Class</b> - CGPA &ge; 5.0 and &lt; 6.0</li>
    </ul>`
  },
  {
    q: "Does this calculator work for Internship, Project, or NPTEL courses?",
    a: `Not for the CIE/SEE/Grade tools. Those three are built specifically for the standard theory and lab structures. Internships, Major/Minor Projects, and NPTEL courses (like Research Methodology) follow their own rules. For example, projects are graded by a guide, an external panel, and a viva-voce, while NPTEL happens completely online without standard CIE marks. Once you actually get your final letter grade for those, you can just drop it directly into the SGPA/CGPA calculators.`
  },
  {
    q: "Why can't I add a custom or manual course?",
    a: `That's actually by design! Every course list you see here (in the CIE/SEE tool, Final Grade tool, and Final SGPA table) is pulled straight from the official 2024 scheme syllabus. You can only pick the exact courses offered. If we let people type in random course names, credit values, or CIE/SEE splits, it would be way too easy to get results that don't match how RVCE actually grades. If you notice a course is missing or a credit value seems off, just open an issue on the GitHub repo (link at the bottom) instead of trying to force it locally.`
  },
  {
    q: "How does the Scheme &rarr; Year &rarr; Semester navigation work?",
    a: `You select the Scheme first because it literally controls everything else. Your course list, credit structure, and how CIE/SEE are weighted are permanently set for your entire four-semester run based on the scheme you joined under. Right now, only the <b>2024 Scheme</b> is active. You'll see a 2026 Scheme option, but it's locked until that syllabus actually gets published. Once you pick the scheme, you select your year (Year 1 is Semesters I &amp; II, Year 2 is Semesters III &amp; IV) and then the specific semester. That automatically loads up the CIE/SEE, Final Grade, and Final SGPA tools with the correct courses for that term.`
  },
  {
    q: "Is this an official RVCE tool?",
    a: `Nope! This is just an independent, unofficial tool made by a student for everyone to use. It's built entirely by reading through the PG Academic Handbook and the MCA 2024 Scheme syllabus (we'll add 2026 once the college publishes it). While it's pretty accurate, always double-check your official grade card and with the Controller of Examinations for anything important.`
  }
];