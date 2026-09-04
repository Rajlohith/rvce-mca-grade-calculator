/* ==========================================================================
   faqContent.js — plain-language explanations of every formula used,
   sourced from the RVCE PG Academic Handbook (2024-25) and the MCA
   2024 & 2026 Scheme syllabus.
   ========================================================================== */

window.MCA = window.MCA || {};

window.MCA.FAQ = [
  {
    q: "How is CIE (Continuous Internal Evaluation) calculated?",
    a: `
      <p><b>For a theory course, CIE is out of 100 marks:</b></p>
      <ul>
        <li><b>Quizzes (20 marks):</b> Three quizzes worth 10 marks each; the best two are counted.</li>
        <li><b>Tests (40 marks):</b> Three tests worth 50 marks each; the best two are added and scaled down to 40.</li>
        <li><b>Experiential Learning (EL), 40 marks:</b> One combined EL score.</li>
      </ul>

      <p><b>For a theory course with an integrated lab:</b></p>
      <ul>
        <li><b>Semester I:</b> Add 50 lab marks: Lab Record + Test (40) and Lab EL (10).</li>
        <li><b>Semesters II &amp; III:</b> Add a 50-mark Lab/Practical component.</li>
        <li><b>Semesters II &amp; III:</b> PBL replaces the 40-mark theory EL component.</li>
        <li><b>Total CIE:</b> 150 marks.</li>
      </ul>

      <p><b>For a lab-only course:</b></p>
      <ul>
        <li>CIE consists only of the 50-mark lab component.</li>
      </ul>
    `
  },

  {
    q: "How is SEE (Semester End Examination) structured?",
    a: `
      <p><b>Theory SEE:</b></p>
      <ul>
        <li>Total: <b>100 marks</b>.</li>
        <li>The paper covers <b>5 units</b>.</li>
        <li>Each unit has <b>two 20-mark questions</b>.</li>
        <li>One question is answered from each pair.</li>
      </ul>

      <p><b>Theory course with an integrated lab:</b></p>
      <ul>
        <li>Theory SEE: <b>100 marks</b>.</li>
        <li>Separate lab examination: <b>50 marks</b>.</li>
        <li>Lab exam includes <b>viva + prototype/demo</b>.</li>
        <li><b>Total SEE: 150 marks.</b></li>
      </ul>

      <p><b>Lab-only course:</b></p>
      <ul>
        <li><b>Design &amp; Development:</b> 20 marks.</li>
        <li><b>Presentation/Demo:</b> 20 marks.</li>
        <li><b>Viva-Voce:</b> 10 marks.</li>
        <li><b>Total SEE: 50 marks.</b></li>
      </ul>

      <p><b>Important:</b> The theory SEE structure remains the same across semesters even though the CIE breakdown changes.</p>
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
        <li><b>Semester I:</b> Integrated lab courses include Lab EL.</li>
        <li><b>Semesters II &amp; III:</b> PBL replaces theory EL at the same weight.</li>
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

      <p><b>CIE Finalization tool:</b></p>
      <ul>
        <li>Checks the detailed CIE requirements while you are building your CIE.</li>
        <li>For theory courses: <b>Quiz + Test ≥ 50% of 60</b>.</li>
        <li>Overall CIE must be <b>≥ 50% of 100</b>.</li>
      </ul>

      <p><b>Final Grade tool:</b></p>
      <ul>
        <li><b>CIE ≥ 50%</b>.</li>
        <li><b>SEE ≥ 40%</b> for theory courses.</li>
        <li><b>SEE ≥ 50%</b> for lab/theory-lab courses.</li>
        <li><b>Overall aggregate ≥ 50%</b>.</li>
      </ul>

      <p><b>Important:</b> Missing even one required condition results in an <b>F</b>, regardless of the raw overall percentage.</p>
    `
  },

  {
    q: "What's the difference between EL and PBL?",
    a: `
      <p><b>Both are experiential-learning components, but they are used differently.</b></p>

      <p><b>EL (Experiential Learning):</b></p>
      <ul>
        <li>Standard <b>40-mark</b> theory component.</li>
        <li>Used in the regular theory CIE structure.</li>
        <li>Semester I also has a separate <b>10-mark Lab EL</b> for integrated lab courses.</li>
      </ul>

      <p><b>PBL (Project Based Learning):</b></p>
      <ul>
        <li>Used instead of theory EL for theory + lab courses in <b>Semesters II &amp; III</b>.</li>
        <li>Worth <b>40 marks</b>.</li>
        <li>Works alongside a separate <b>50-mark Lab/Practical CIE component</b>.</li>
      </ul>

      <p><b>The CIE Finalization tool automatically shows the applicable component based on the course and semester.</b></p>
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

      <p><b>Two calculators are available:</b></p>
      <ul>
        <li><b>Final SGPA Calculator:</b> Quickly blends your current CGPA and completed credits with a new SGPA.</li>
        <li><b>CGPA Calculator:</b> Calculates the complete semester-by-semester CGPA.</li>
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

      <p>Since none of these follow the CIE quiz/test/EL/lab structure, a card for them on the CIE &amp; SEE or Final Grade Calculator would never actually do anything, so they're left out of those two pages' course lists entirely, to keep the grid focused on courses you can actually calculate there.</p>

      <p><b>However:</b> Once you receive the final letter grade for one of these courses, you can enter it directly into the SGPA/CGPA calculators, they're still counted normally there.</p>
    `
  },

  {
    q: "Why are the courses on the CIE & SEE and Final Grade pages split into Theory + Lab, Theory Only, and Lab Only groups?",
    a: `
      <p>Each course type needs a different set of input fields: a Theory + Lab course has quizzes, tests, EL, <i>and</i> a lab component, while a Lab Only course has just the lab fields. Mixed together in one grid, cards of very different heights left uneven, gappy rows.</p>

      <p>Grouping courses by type keeps cards of similar height and shape next to each other, so the grid lines up cleanly. The grouping is purely visual; it doesn't change how any course is calculated.</p>
    `
  },

  {
    q: "Why can't I add a custom or manual course?",
    a: `
      <p><b>This is intentional.</b></p>

      <ul>
        <li>Course lists are based on the <b>official 2024 scheme syllabus</b>.</li>
        <li>Only courses actually offered in the selected semester can be selected.</li>
        <li>Credit values are tied to the official course structure.</li>
        <li>This prevents users from accidentally entering incorrect courses or credits.</li>
        <li>It also keeps the calculator's results consistent with the RVCE grading structure.</li>
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
            <li>It also determines the credit structure and grading rules.</li>
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

      <p><b>Current scheme availability:</b></p>
      <ul>
        <li><b>2024 Scheme:</b> Active.</li>
        <li><b>2026 Scheme:</b> Visible but locked until the corresponding syllabus is published.</li>
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
            <li>RVCE PG Academic Handbook (2024–25).</li>
            <li>MCA 2024 Scheme syllabus.</li>
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