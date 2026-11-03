/* ==========================================================================
   faqContent.js — plain-language explanations of every formula used,
   sourced from the RVCE PG Academic Handbook (2024-25 and 2026-27) and the MCA
   2024 & 2026 Scheme syllabus.
   ========================================================================== */

window.MCA = window.MCA || {};

window.MCA.FAQ = [
  {
    q: "What changed in the 2026 scheme compared to 2024?",
    a: `
      <p><b>The 2026 scheme changes the CIE marking, the credits and part of the course list. The two schemes are calculated separately, so nothing about 2024 is affected.</b></p>

      <p><b>Marking:</b></p>
      <ul>
        <li><b>One quiz instead of two:</b> a single 10-mark quiz replaces the two quizzes (20 marks).</li>
        <li><b>Tests:</b> still two regular tests plus one optional improvement test, best two reduced to 40.</li>
        <li><b>EL is 50 marks</b> (Phase I 25 + Phase II 25), up from 40.</li>
        <li><b>PBL</b> is now a 10-mark progress review inside the 50-mark Lab, not a stand-in for EL.</li>
        <li>This is identical in every semester (no Semester I vs Semesters II &amp; III difference).</li>
      </ul>

      <p><b>Courses and credits:</b></p>
      <ul>
        <li><b>AI Fundamentals</b> is a new 2-credit theory course with a 50 + 50 marks structure.</li>
        <li><b>Credits per semester:</b> 19, 21, 21 and 19 (80 in total), versus 19, 23, 20 and 18 in 2024.</li>
        <li><b>Semester I:</b> AI Fundamentals and Data Structures using Python are new. Object Oriented Programming using Java and the Skill Lab are no longer in this semester.</li>
        <li><b>Semester II:</b> Object Oriented Programming using Java with Spring Boot moves here, Design and Analysis of Algorithms gains a lab, the Group-B elective is gone, Group-C becomes a 3-credit theory elective and the Design Thinking Lab drops from 2 credits to 1.</li>
        <li><b>Semester III:</b> AI Product &amp; Project Management is new and the Group-E elective moves here as a 4-credit theory + lab course.</li>
        <li><b>Semester IV:</b> Professional Elective (MOOC) 3 credits, Major Project 10 credits and Project Internship 6 credits. The internship is done after Semester II but its credits are counted here, and there is no Technical Seminar.</li>
        <li>The non-credit Bridge Course Mathematics is not part of any calculator.</li>
      </ul>

      <p><b>Passing:</b> the grading table, grade points and degree classes are unchanged. The 2026 floors are listed under the passing-marks question above, and the Final Grade page works with one combined SEE total per course, as in 2024.</p>
    `
  },

  {
    q: "Why are there two CGPA calculators?",
    a: `
      <p>The credits in each semester differ between the 2024 scheme (19, 23, 20, 18) and the 2026 scheme (19, 21, 21, 19). CGPA weights each semester's SGPA by its credits, so one shared page would give wrong answers for one of them.</p>

      <p>The CGPA link in the header first asks which scheme you are on, then opens the matching page. Each page has its own Save Progress entry, and progress you saved on the CGPA page before the split still loads on the 2024 page.</p>
    `
  },

  {
    q: "How is CIE (Continuous Internal Evaluation) calculated?",
    a: `
      <p><b>CIE is built differently in the 2024 and 2026 schemes.</b> Check which scheme applies to you; the calculator uses the right structure automatically once you pick it.</p>

      <p><b>2024 scheme: theory course (CIE out of 100):</b></p>
      <ul>
        <li><b>Quizzes (20 marks):</b> Three quizzes worth 10 marks each; the best two are counted.</li>
        <li><b>Tests (40 marks):</b> Three tests worth 50 marks each; the best two are added and scaled down to 40.</li>
        <li><b>Experiential Learning (EL), 40 marks:</b> One combined EL score.</li>
      </ul>

      <p><b>2024 scheme: theory course with an integrated lab:</b></p>
      <ul>
        <li><b>Semester I:</b> Add 50 lab marks: Lab Record + Test (40) and Lab EL (10).</li>
        <li><b>Semesters II &amp; III:</b> Add a 50-mark Lab/Practical component.</li>
        <li><b>Semesters II &amp; III:</b> PBL replaces the 40-mark theory EL component.</li>
        <li><b>Total CIE:</b> 150 marks.</li>
      </ul>

      <p><b>2024 scheme: lab-only course:</b></p>
      <ul>
        <li>CIE consists only of the 50-mark lab component.</li>
      </ul>

      <p><b>2026 scheme: theory course (CIE out of 100):</b></p>
      <ul>
        <li><b>Quiz (10 marks):</b> <b>One</b> quiz only, counted as scored. The two-quiz, best-of-three system of the 2024 scheme is gone.</li>
        <li><b>Tests (40 marks):</b> Two regular tests plus one optional improvement test, each out of 50. The best two are added (out of 100) and reduced to 40.</li>
        <li><b>Experiential Learning (EL), 50 marks:</b> Phase I (25) + Phase II (25). EL is now 50 marks, up from 40.</li>
      </ul>

      <p><b>2026 scheme: theory course with an integrated lab (CIE out of 150):</b></p>
      <ul>
        <li>The same 100 marks as above (Quiz 10 + Tests 40 + EL 50), plus a <b>50-mark Lab</b>.</li>
        <li>The Lab is lab work, report, observation and analysis (30) + <b>PBL progress review (10)</b> + lab test (10).</li>
        <li>This applies in every semester. There is no separate Semester I / Semesters II &amp; III split any more.</li>
      </ul>

      <p><b>2026 scheme: AI Fundamentals (2-credit theory, CIE out of 50):</b></p>
      <ul>
        <li><b>Quiz:</b> Conducted for 10 marks and scaled down to <b>5</b>.</li>
        <li><b>Tests:</b> Tests of 25 marks each; the best two (50 in total) are reduced to <b>20</b>.</li>
        <li><b>EL (25 marks):</b> Phase I (10) + Phase II (15).</li>
      </ul>

      <p><b>2026 scheme: lab-only courses (CIE out of 50):</b></p>
      <ul>
        <li><b>Technical English (online):</b> Modules assessment (30) + two tests of 10 marks each (20).</li>
        <li><b>Innovative Design Thinking Lab:</b> Review I (10) + Review II (20) + Review III (15) + Final Report (5).</li>
      </ul>
    `
  },

  {
    q: "How is SEE (Semester End Examination) structured?",
    a: `
      <p><b>Theory SEE (both schemes):</b></p>
      <ul>
        <li>Total: <b>100 marks</b>.</li>
        <li>The paper covers <b>5 units</b>.</li>
        <li>Each unit has <b>two 20-mark questions</b>.</li>
        <li>One question is answered from each pair.</li>
      </ul>

      <p><b>Theory course with an integrated lab (both schemes):</b></p>
      <ul>
        <li>Theory SEE: <b>100 marks</b>.</li>
        <li>Separate lab examination: <b>50 marks</b>.</li>
        <li><b>Total SEE: 150 marks.</b></li>
        <li><b>2024:</b> the lab exam includes <b>viva + prototype/demo</b>.</li>
        <li><b>2026:</b> the lab exam is evaluated through problem-/project-based learning activities mapped to the course outcomes, with the rubric shared along with the problem statements.</li>
      </ul>

      <p><b>Lab-only course:</b></p>
      <ul>
        <li><b>Design &amp; Development:</b> 20 marks.</li>
        <li><b>Presentation/Demo:</b> 20 marks.</li>
        <li><b>Viva-Voce:</b> 10 marks.</li>
        <li><b>Total SEE: 50 marks.</b></li>
      </ul>

      <p><b>2026 scheme: courses with their own SEE:</b></p>
      <ul>
        <li><b>AI Fundamentals:</b> 50 marks, covering 3 units (16 + 17 + 17).</li>
        <li><b>Technical English:</b> 50 marks, conducted online.</li>
        <li><b>Innovative Design Thinking Lab:</b> 50 marks: poster presentation (15), prototype demonstration (25) and viva-voce (10).</li>
        <li><b>NPTEL / MOOC courses:</b> the exam is conducted by NPTEL.</li>
      </ul>

      <p><b>Important:</b> The theory SEE structure stays the same across semesters and schemes even though the CIE breakdown changes.</p>
    `
  },

  {
    q: "Do CIE and SEE carry equal weight?",
    a: `
      <p><b>Yes. CIE and SEE each carry 50% of the final course result.</b></p>

      <ul>
        <li><b>Standard theory course:</b> 100 CIE + 100 SEE = 200 marks.</li>
        <li><b>Theory + integrated lab:</b> 150 CIE + 150 SEE = 300 marks.</li>
        <li><b>Lab-only course:</b> 50 CIE + 50 SEE = 100 marks.</li>
        <li><b>2026 only, AI Fundamentals (2 credits):</b> 50 CIE + 50 SEE = 100 marks.</li>
        <li><b>2024:</b> Semester I integrated lab courses include Lab EL; in Semesters II &amp; III PBL replaces theory EL at the same weight.</li>
        <li><b>2026:</b> EL is 50 marks in every theory and integrated-lab course, and PBL sits inside the 50-mark lab component.</li>
      </ul>

      <p><b>Final percentage:</b></p>
      <p><code>(CIE + SEE) / (Maximum CIE + Maximum SEE) × 100</code></p>
    `
  },

  {
    q: "What's the minimum I need to pass? Is 50% overall enough?",
    a: `
      <p><b>No. Scoring 50% overall by itself is not sufficient.</b></p>

      <p><b>Additional minimum requirements apply:</b></p>
      <ul>
        <li>The requirements are based on <b>Table 4.4</b> of the academic handbook.</li>
        <li>The exact checks depend on whether you are finalizing CIE or calculating the final grade.</li>
      </ul>

      <p><b>2024 scheme, CIE Finalization tool:</b></p>
      <ul>
        <li>Checks the detailed CIE requirements while you are building your CIE.</li>
        <li>For theory courses: <b>Quiz + Test ≥ 50% of 60</b>.</li>
        <li>Overall CIE must be <b>≥ 50% of 100</b>.</li>
      </ul>

      <p><b>2024 scheme, Final Grade tool:</b></p>
      <ul>
        <li><b>CIE ≥ 50%</b>.</li>
        <li><b>SEE ≥ 40%</b> for theory courses.</li>
        <li><b>SEE ≥ 50%</b> for lab/theory-lab courses.</li>
        <li><b>Overall aggregate ≥ 50%</b>.</li>
      </ul>

      <p><b>2026 scheme, minimum marks by course type:</b></p>
      <ul>
        <li><b>Theory (CIE 100, SEE 100):</b> Quiz + Test ≥ 25/50, CIE ≥ 50/100, SEE ≥ 40/100, aggregate ≥ 100/200.</li>
        <li><b>AI Fundamentals (CIE 50, SEE 50):</b> Quiz + Test ≥ 12.5/25, CIE ≥ 25/50, SEE ≥ 20/50, aggregate ≥ 50/100.</li>
        <li><b>Theory + Lab, CIE:</b> theory Quiz + Test ≥ 20/50, theory CIE (Quiz + Test + EL) ≥ 40/100, Lab ≥ 25/50, total CIE ≥ 75/150.</li>
        <li><b>Theory + Lab, SEE:</b> theory SEE ≥ 40/100, lab SEE ≥ 25/50, total SEE ≥ 75/150, aggregate ≥ 150/300.</li>
        <li><b>Lab-only (CIE 50, SEE 50):</b> CIE ≥ 25/50, SEE ≥ 25/50, aggregate ≥ 50/100.</li>
      </ul>

      <p><b>2026 scheme, projects and internship (graded directly in this tool):</b> handbook Table 4.4 has no separate row for them, but their course category is Lab / Practice, so the practice standard applies: <b>CIE &ge; 50%, SEE &ge; 50%, aggregate &ge; 50%</b>. That means 50/100, 50/100 and 100/200 for the Major Project and the Project Internship, and 50% of the marks for the Minor Project (25/50 per the credit table, 50/100 per the course page). The Major Project syllabus also states that 50% CIE is a prerequisite to appear for SEE. NPTEL / MOOC courses have no numeric pass mark in the handbook; an F means re-registering and clearing the course online.</p>

      <p><b>A note on the 2026 theory + lab floor:</b> handbook Table 4.4 sets 40% for the theory part of a theory + practice course, while each course's syllabus rubric repeats the line &ldquo;minimum 50% in Test &amp; Quiz to clear CIE&rdquo;. The calculator follows the handbook table and shows a heads-up when your Quiz + Test falls between the two. If you are in that range, confirm with your course faculty.</p>

      <p><b>Important:</b> Missing even one required condition results in an <b>F</b>, regardless of the raw overall percentage. On the 2026 Final Grade page you enter one combined CIE and one combined SEE per course, as in 2024; for theory + lab courses the SEE total must be at least 75/150.</p>
    `
  },

  {
    q: "What's the difference between EL and PBL?",
    a: `
      <p><b>Both are experiential-learning components, but their marking differs between schemes.</b></p>

      <p><b>2024 scheme:</b></p>
      <ul>
        <li><b>EL (Experiential Learning):</b> a <b>40-mark</b> theory component in the regular theory CIE. Semester I also has a separate <b>10-mark Lab EL</b> for integrated lab courses.</li>
        <li><b>PBL (Project Based Learning):</b> used instead of theory EL for theory + lab courses in <b>Semesters II &amp; III</b>. Worth <b>40 marks</b>, alongside a separate <b>50-mark Lab/Practical CIE component</b>.</li>
      </ul>

      <p><b>2026 scheme:</b></p>
      <ul>
        <li><b>EL is 50 marks</b> in every theory and theory + lab course: Phase I (25) + Phase II (25). In AI Fundamentals it is 25 marks: Phase I (10) + Phase II (15).</li>
        <li><b>PBL is no longer a replacement for EL.</b> It now appears as the <b>10-mark PBL progress review</b> inside the 50-mark Lab (lab work 30 + PBL review 10 + lab test 10).</li>
        <li>This is the same in every semester, so there is no Semester I vs Semesters II &amp; III difference.</li>
      </ul>

      <p><b>The CIE Finalization tool automatically shows the applicable components based on the scheme, course and semester.</b></p>
    `
  },

  {
    q: "How do marks turn into a letter grade?",
    a: `
      <p><b>RVCE uses an absolute 10-point grading scale.</b></p>

      <table style="width:100%;border-collapse:collapse;margin-top:8px;font-family:var(--font-mono);font-size:12.5px;">
        <tr style="border-bottom:1.5px solid var(--ink);">
          <th style="text-align:left;padding:4px 6px;">Grade</th>
          <th style="text-align:left;padding:4px 6px;">Points</th>
          <th style="text-align:left;padding:4px 6px;">% Range</th>
        </tr>
        <tr style="border-bottom:1px solid var(--line);">
          <td style="padding:4px 6px;">O</td>
          <td style="padding:4px 6px;">10</td>
          <td style="padding:4px 6px;">90–100</td>
        </tr>
        <tr style="border-bottom:1px solid var(--line);">
          <td style="padding:4px 6px;">A+</td>
          <td style="padding:4px 6px;">9</td>
          <td style="padding:4px 6px;">80–89</td>
        </tr>
        <tr style="border-bottom:1px solid var(--line);">
          <td style="padding:4px 6px;">A</td>
          <td style="padding:4px 6px;">8</td>
          <td style="padding:4px 6px;">70–79</td>
        </tr>
        <tr style="border-bottom:1px solid var(--line);">
          <td style="padding:4px 6px;">B+</td>
          <td style="padding:4px 6px;">7</td>
          <td style="padding:4px 6px;">60–69</td>
        </tr>
        <tr style="border-bottom:1px solid var(--line);">
          <td style="padding:4px 6px;">B</td>
          <td style="padding:4px 6px;">6</td>
          <td style="padding:4px 6px;">55–59</td>
        </tr>
        <tr style="border-bottom:1px solid var(--line);">
          <td style="padding:4px 6px;">C</td>
          <td style="padding:4px 6px;">5</td>
          <td style="padding:4px 6px;">50–54</td>
        </tr>
        <tr>
          <td style="padding:4px 6px;">F</td>
          <td style="padding:4px 6px;">0</td>
          <td style="padding:4px 6px;">0–49</td>
        </tr>
      </table>

      <p><b>In short:</b> Your final percentage determines the letter grade, which then determines the grade points used for SGPA and CGPA.</p>
    `
  },

  {
    q: "What are W, I, X, DX and AB grades?",
    a: `
      <p><b>These are temporary or special status grades rather than regular final grades.</b></p>

      <ul>
        <li>
          <b>DX (Not eligible for SEE):</b>
          <ul>
            <li>Did not meet the minimum CIE requirement.</li>
            <li>Not allowed to write the SEE for that course at that stage.</li>
          </ul>
        </li>

        <li>
          <b>I (Incomplete):</b>
          <ul>
            <li>Met the CIE requirements.</li>
            <li>Could not attend the SEE for a valid, documented reason.</li>
            <li>Can be cleared through a makeup examination.</li>
          </ul>
        </li>

        <li>
          <b>W (Withdrawal):</b>
          <ul>
            <li>Course was officially dropped before the deadline.</li>
            <li>Requires the appropriate approval.</li>
          </ul>
        </li>

        <li>
          <b>X (SEE failure with eligibility):</b>
          <ul>
            <li>Attendance is <b>≥ 85%</b>.</li>
            <li>CIE is <b>≥ 90%</b>.</li>
            <li>Still failed the SEE.</li>
            <li>Eligible for a makeup examination.</li>
          </ul>
        </li>

        <li>
          <b>AB (Absent):</b>
          <ul>
            <li>Required CIE and attendance conditions were met.</li>
            <li>SEE was missed without prior approval.</li>
          </ul>
        </li>
      </ul>

      <p><b>SGPA/CGPA impact:</b> These temporary grades are excluded until they are resolved into a final letter grade.</p>
    `
  },

  {
    q: "How is SGPA calculated?",
    a: `
      <p><b>SGPA is the credit-weighted average of grade points for one semester.</b></p>

      <p><code>SGPA = Σ(Course Credits × Grade Points) / Σ(Course Credits)</code></p>

      <p><b>Included:</b></p>
      <ul>
        <li>Courses with a final letter grade from <b>O to F</b>.</li>
        <li>F grades are included with <b>0 grade points</b>.</li>
        <li>F still contributes its course credits.</li>
      </ul>

      <p><b>Excluded until resolved:</b></p>
      <ul>
        <li><b>W</b></li>
        <li><b>I</b></li>
        <li><b>X</b></li>
        <li><b>DX</b></li>
        <li><b>AB</b></li>
      </ul>

      <p><b>Important:</b> An F lowers your SGPA because it contributes credits but zero grade points.</p>
    `
  },

  {
    q: "How is CGPA calculated?",
    a: `
      <p><b>CGPA uses the same credit-weighted approach across all completed semesters.</b></p>

      <p><code>CGPA = Σ(Semester Credits × Semester SGPA) / Σ(Semester Credits)</code></p>

      <p><b>For the MCA 2024 Scheme:</b></p>
      <ul>
        <li><b>Semester I:</b> 19 credits.</li>
        <li><b>Semester II:</b> 23 credits.</li>
        <li><b>Semester III:</b> 20 credits.</li>
        <li><b>Semester IV:</b> 18 credits.</li>
        <li><b>Total:</b> 80 credits.</li>
      </ul>

      <p><b>For the MCA 2026 Scheme:</b></p>
      <ul>
        <li><b>Semester I:</b> 19 credits.</li>
        <li><b>Semester II:</b> 21 credits.</li>
        <li><b>Semester III:</b> 21 credits.</li>
        <li><b>Semester IV:</b> 19 credits.</li>
        <li><b>Total:</b> 80 credits.</li>
      </ul>

      <p><b>Two kinds of calculator are available:</b></p>
      <ul>
        <li><b>Final SGPA Calculator:</b> Quickly blends your current CGPA and completed credits with a new SGPA.</li>
        <li><b>CGPA Calculator:</b> Calculates the complete semester-by-semester CGPA. Because the credits per semester differ, there is one page for the 2024 scheme and one for the 2026 scheme.</li>
      </ul>
    `
  },

  {
    q: "What CGPA do I need for First Class / Distinction?",
    a: `
      <p><b>These classifications apply only after all semesters are cleared with no pending F grades.</b></p>

      <ul>
        <li><b>First Class with Distinction:</b> CGPA ≥ 7.0.</li>
        <li><b>First Class:</b> CGPA ≥ 6.0 and &lt; 7.0.</li>
        <li><b>Second Class:</b> CGPA ≥ 5.0 and &lt; 6.0.</li>
      </ul>

      <p><b>Important:</b> The classification is subject to the applicable academic requirements in Section 4.12(d).</p>
    `
  },

  {
    q: "Does this calculator work for Internship, Project, or NPTEL courses?",
    a: `
      <p><b>Not for CIE/SEE calculation, and you won't find cards for them on the CIE &amp; SEE or Final Grade pages.</b></p>

      <ul>
        <li>The CIE/SEE tools are designed specifically for standard <b>theory and lab course structures</b>.</li>
        <li><b>Internships</b> follow their own evaluation rules.</li>
        <li><b>Major/Minor Projects</b> use separate evaluation processes involving components such as:
          <ul>
            <li>Guide evaluation.</li>
            <li>External panel evaluation.</li>
            <li>Viva-voce.</li>
          </ul>
        </li>
        <li><b>NPTEL courses</b> are conducted and evaluated through their online system.</li>
      </ul>

      <p><b>In the 2026 scheme</b> this covers Research Methodology (NPTEL), the Professional Elective (MOOC), Minor Project, Major Project and the Project Internship. The Technical Seminar belongs to the 2024 scheme only; it does not exist in 2026.</p>

      <p>Since none of these follow the CIE quiz/test/EL/lab structure, a card for them on the CIE &amp; SEE or Final Grade Calculator would never actually do anything, so they're left out of those two pages' course lists entirely, to keep the grid focused on courses you can actually calculate there.</p>

      <p><b>However:</b> Once you receive the final letter grade for one of these courses, you can enter it directly into the SGPA/CGPA calculators, they're still counted normally there.</p>
    `
  },

  {
    q: "Why are the courses on the CIE & SEE and Final Grade pages split into Theory + Lab, Theory Only, and Lab Only groups?",
    a: `
      <p>Each course type needs a different set of input fields: a Theory + Lab course has quizzes, tests, EL, <i>and</i> a lab component, while a Lab Only course has just the lab fields. Mixed together in one grid, cards of very different heights left uneven, gappy rows.</p>

      <p>Grouping courses by type keeps cards of similar height and shape next to each other, so the grid lines up cleanly. The grouping is purely visual; it doesn't change how any course is calculated. In the 2026 scheme, AI Fundamentals sits under Theory Only with its own 50-mark layout, and Technical English and the Design Thinking Lab sit under Lab Only with their own fields.</p>
    `
  },

  {
    q: "Why can't I add a custom or manual course?",
    a: `
      <p><b>This is intentional.</b></p>

      <ul>
        <li>Course lists are based on the <b>official 2024 and 2026 scheme syllabi</b>.</li>
        <li>Only courses actually offered in the selected scheme and semester can be selected.</li>
        <li>Credit values are tied to the official course structure.</li>
        <li>This prevents users from accidentally entering incorrect courses or credits.</li>
        <li>It also keeps the calculator's results consistent with the RVCE grading structure.</li>
        <li>The non-credit Bridge Course Mathematics is deliberately not included: it carries no credits and does not count towards SGPA or CGPA.</li>
      </ul>

      <p><b>If something is incorrect:</b></p>
      <ul>
        <li>Check the official syllabus first.</li>
        <li>If the course or credit value is genuinely missing or incorrect, open an issue on the GitHub repository.</li>
        <li>A manual course should not be added simply to force a calculation.</li>
      </ul>
    `
  },

  {
    q: "How does the Scheme → Semester navigation work?",
    a: `
      <p><b>The navigation follows the structure of the MCA program.</b></p>

      <ol>
        <li>
          <b>Select a Scheme</b>
          <ul>
            <li>The scheme determines the applicable course list.</li>
            <li>It also determines the credit structure, CIE marking and passing rules.</li>
            <li>The scheme remains applicable throughout your four-semester program.</li>
          </ul>
        </li>

        <li>
          <b>Select a Semester</b>
          <ul>
            <li><b>Year 1:</b> Semesters I &amp; II.</li>
            <li><b>Year 2:</b> Semesters III &amp; IV.</li>
            <li>"Year 1" and "Year 2" are only navigation labels.</li>
            <li>They are not additional academic steps.</li>
          </ul>
        </li>

        <li>
          <b>Use the available tools</b>
          <ul>
            <li>CIE Calculator.</li>
            <li>SEE / Final Grade Calculator.</li>
            <li>Final SGPA Calculator.</li>
          </ul>
        </li>
      </ol>

      <p><b>The CGPA Calculator</b> is reached from the CGPA link in the header. It asks for your scheme first, then opens the 2024 or 2026 CGPA page.</p>

      <p><b>Current scheme availability:</b></p>
      <ul>
        <li><b>2024 Scheme:</b> Active.</li>
        <li><b>2026 Scheme:</b> Active.</li>
      </ul>
    `
  },

  {
    q: "Is this an official RVCE tool?",
    a: `
      <p><b>No.</b></p>

      <ul>
        <li>This is an <b>independent, unofficial tool</b>.</li>
        <li>It was created by a student for students.</li>
        <li>The calculations are based on information from:
          <ul>
            <li>RVCE PG Academic Handbook (2024–25 and 2026–27).</li>
            <li>MCA 2024 Scheme syllabus.</li>
            <li>MCA 2026 Scheme syllabus.</li>
            <li>Applicable academic rules and grading tables.</li>
          </ul>
        </li>
      </ul>

      <p><b>For important academic decisions:</b></p>
      <ul>
        <li>Always verify your final result against your <b>official grade card</b>.</li>
        <li>For clarification or disputes, contact the <b>RVCE Controller of Examinations</b>.</li>
        <li>This calculator should be treated as a convenience tool, not an official academic record.</li>
      </ul>
    `
  }
];