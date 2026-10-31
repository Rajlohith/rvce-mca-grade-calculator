/* Auto-generated from data/courses-2026.json - do not hand-edit both, edit the JSON and regenerate.
   Source: RVCE MCA 2026 Scheme and Syllabus (I-IV semester), PG handbook w.e.f. 2026-27.

   Scheme selection: js/data.js defines the 2024 scheme as window.MCA.DATA. This file registers the
   2026 scheme next to it and then points window.MCA.DATA at whichever scheme the current page is
   for, so grading.js, engine.js and course-picker.js (which read window.MCA.DATA when they load)
   pick up the right course list without any change. A page chooses its scheme with either a
   data-scheme="2026" attribute on <html> or a ?scheme=2026 query string; anything else is 2024. */
window.MCA = window.MCA || {};
(function(){
  var SCHEMES = window.MCA.SCHEMES = window.MCA.SCHEMES || {};
  if(!SCHEMES['2024']) SCHEMES['2024'] = window.MCA.DATA;
  SCHEMES['2026'] = {
    "meta": {
      "program": "Master of Computer Applications (MCA)",
      "scheme": "2026 Scheme",
      "institution": "R V College of Engineering, Bengaluru (Autonomous, affiliated to VTU Belagavi)",
      "totalProgramCredits": 80,
      "source": "2026 Scheme and Syllabus - Master of Computer Applications, RVCE (I to IV semester)",
      "handbookSource": "Academic Planning, Assessment & Evaluation Handbook - Guidelines and Information of Postgraduate Programs (w.e.f. 2026-27)"
    },
    "grading": {
      "bands": [
        {
          "grade": "O",
          "gp": 10,
          "min": 90
        },
        {
          "grade": "A+",
          "gp": 9,
          "min": 80
        },
        {
          "grade": "A",
          "gp": 8,
          "min": 70
        },
        {
          "grade": "B+",
          "gp": 7,
          "min": 60
        },
        {
          "grade": "B",
          "gp": 6,
          "min": 55
        },
        {
          "grade": "C",
          "gp": 5,
          "min": 50
        },
        {
          "grade": "F",
          "gp": 0,
          "min": 0
        }
      ],
      "transitionalGrades": [
        "W",
        "I",
        "X",
        "DX",
        "AB"
      ],
      "passingStandards": {
        "theory": {
          "quizTestFloorPct": 50,
          "cieFloorPct": 50,
          "seeFloorPct": 40,
          "aggregateFloorPct": 50
        },
        "theory-lab": {
          "theoryQuizTestFloorPct": 40,
          "theoryCieFloorPct": 40,
          "labCieFloorPct": 50,
          "totalCieFloorPct": 50,
          "theorySeeFloorPct": 40,
          "labSeeFloorPct": 50,
          "totalSeeFloorPct": 50,
          "aggregateFloorPct": 50
        },
        "lab": {
          "cieFloorPct": 50,
          "seeFloorPct": 50,
          "aggregateFloorPct": 50
        }
      },
      "degreeClass": [
        {
          "class": "First Class with Distinction (FCD)",
          "minCgpa": 7.0
        },
        {
          "class": "First Class (FC)",
          "minCgpa": 6.0
        },
        {
          "class": "Second Class (SC)",
          "minCgpa": 5.0
        }
      ]
    },
    "semesters": {
      "I": {
        "totalCredits": 19,
        "courses": [
          {
            "code": "MMA211TD",
            "title": "Discrete Mathematics and Probability Theory",
            "ltp": "3-1-0",
            "credits": 4,
            "type": "theory",
            "model": "theory",
            "cie": 100,
            "see": 100,
            "page": 1,
            "core": true
          },
          {
            "code": "MCA112IA",
            "title": "Web Application Development",
            "ltp": "3-0-1",
            "credits": 4,
            "type": "theory-lab",
            "model": "theory-lab",
            "cie": 150,
            "see": 150,
            "page": 3,
            "core": true
          },
          {
            "code": "MCA117IA",
            "title": "Data Structures using Python",
            "ltp": "3-0-1",
            "credits": 4,
            "type": "theory-lab",
            "model": "theory-lab",
            "cie": 150,
            "see": 150,
            "page": 9,
            "core": true
          },
          {
            "code": "MCA114AX",
            "title": "Professional Elective Course (Group-A)",
            "ltp": "3-0-1",
            "credits": 4,
            "type": "theory-lab",
            "model": "theory-lab",
            "cie": 150,
            "see": 150,
            "page": 12,
            "core": false,
            "electives": [
              {
                "code": "MCA114A1",
                "title": "Data Science",
                "page": 12
              },
              {
                "code": "MCA114A2",
                "title": "Computer Networks Concepts",
                "page": 16
              }
            ]
          },
          {
            "code": "MCA115TB",
            "title": "AI Fundamentals",
            "ltp": "2-0-0",
            "credits": 2,
            "type": "theory",
            "model": "theory-50",
            "cie": 50,
            "see": 50,
            "page": 7,
            "core": true,
            "note": "2-credit theory course: CIE and SEE are each out of 50."
          },
          {
            "code": "HSS116EL",
            "title": "Technical English",
            "ltp": "0-0-1",
            "credits": 1,
            "type": "lab",
            "model": "online-lab",
            "cie": 50,
            "see": 50,
            "page": 19,
            "core": true,
            "note": "Online"
          }
        ]
      },
      "II": {
        "totalCredits": 21,
        "courses": [
          {
            "code": "MCA221IA",
            "title": "Mobile Application Development",
            "ltp": "3-0-1",
            "credits": 4,
            "type": "theory-lab",
            "model": "theory-lab",
            "cie": 150,
            "see": 150,
            "page": 26,
            "core": true
          },
          {
            "code": "MCA222IA",
            "title": "Design and Analysis of Algorithms",
            "ltp": "3-0-1",
            "credits": 4,
            "type": "theory-lab",
            "model": "theory-lab",
            "cie": 150,
            "see": 150,
            "page": 29,
            "core": true
          },
          {
            "code": "MCA223TB",
            "title": "Agile Software Development",
            "ltp": "3-0-0",
            "credits": 3,
            "type": "theory",
            "model": "theory",
            "cie": 100,
            "see": 100,
            "page": 32,
            "core": true
          },
          {
            "code": "MCA224IA",
            "title": "Object Oriented Programming using Java with Spring Boot",
            "ltp": "3-0-1",
            "credits": 4,
            "type": "theory-lab",
            "model": "theory-lab",
            "cie": 150,
            "see": 150,
            "page": 23,
            "core": true
          },
          {
            "code": "MCA225CX",
            "title": "Professional Elective Course (Group-C)",
            "ltp": "3-0-0",
            "credits": 3,
            "type": "theory",
            "model": "theory",
            "cie": 100,
            "see": 100,
            "page": 35,
            "core": false,
            "electives": [
              {
                "code": "MCA225C1",
                "title": "Cyber Security",
                "page": 35
              },
              {
                "code": "MCA225C2",
                "title": "Gen-AI",
                "page": 37
              },
              {
                "code": "MCA225C3",
                "title": "Extended Reality",
                "page": 39
              },
              {
                "code": "MCA225C4",
                "title": "Software Testing",
                "page": 42
              }
            ]
          },
          {
            "code": "MIM426RT",
            "title": "Research Methodology (NPTEL)",
            "ltp": "2-0-0",
            "credits": 2,
            "type": "nptel",
            "cie": 0,
            "see": 100,
            "page": 45,
            "core": true,
            "note": "Online NPTEL course; SEE only, no CIE component."
          },
          {
            "code": "MCA427DI",
            "title": "Innovative Design Thinking Lab",
            "ltp": "0-0-1",
            "credits": 1,
            "type": "lab",
            "model": "dtl",
            "cie": 50,
            "see": 50,
            "page": 46,
            "core": true
          }
        ]
      },
      "III": {
        "totalCredits": 21,
        "courses": [
          {
            "code": "MCA261IA",
            "title": "Full Stack Application Development",
            "ltp": "3-0-1",
            "credits": 4,
            "type": "theory-lab",
            "model": "theory-lab",
            "cie": 150,
            "see": 150,
            "page": 48,
            "core": true
          },
          {
            "code": "MCA262IA",
            "title": "DevOps Automation",
            "ltp": "3-0-1",
            "credits": 4,
            "type": "theory-lab",
            "model": "theory-lab",
            "cie": 150,
            "see": 150,
            "page": 51,
            "core": true
          },
          {
            "code": "MCA233TB",
            "title": "AI Product & Project Management",
            "ltp": "3-0-0",
            "credits": 3,
            "type": "theory",
            "model": "theory",
            "cie": 100,
            "see": 100,
            "page": 54,
            "core": true
          },
          {
            "code": "MCA234EX",
            "title": "Professional Elective Course (Group-E)",
            "ltp": "3-0-1",
            "credits": 4,
            "type": "theory-lab",
            "model": "theory-lab",
            "cie": 150,
            "see": 150,
            "page": 57,
            "core": false,
            "electives": [
              {
                "code": "MCA234EA",
                "title": "Business Intelligence & Visualization Practices",
                "page": 57
              },
              {
                "code": "MCA234EB",
                "title": "Internet of Things",
                "page": 61
              },
              {
                "code": "MCA234EC",
                "title": "Cloud Computing Applications",
                "page": 65
              },
              {
                "code": "MCA234ED",
                "title": "Agentic AI (Industry Elective)",
                "page": 68
              }
            ]
          },
          {
            "code": "MCA263DX",
            "title": "Professional Elective Course (Group-D)",
            "ltp": "3-0-0",
            "credits": 3,
            "type": "theory",
            "model": "theory",
            "cie": 100,
            "see": 100,
            "page": 71,
            "core": false,
            "electives": [
              {
                "code": "MCA263D2",
                "title": "Deep Learning",
                "page": 71
              },
              {
                "code": "MCA263D3",
                "title": "Advanced Computer Networks",
                "page": 74
              },
              {
                "code": "MCA263D4",
                "title": "Principles of UI/UX Design",
                "page": 76
              },
              {
                "code": "MCA263D5",
                "title": "E-Marketing",
                "page": 79
              }
            ]
          },
          {
            "code": "MCA461P",
            "title": "Minor Project",
            "ltp": "0-0-3",
            "credits": 3,
            "type": "project",
            "cie": 100,
            "see": 100,
            "page": 82,
            "core": true,
            "note": "Course page lists CIE 100 / SEE 100; the Semester III credit table lists 50 / 50. Graded directly, not calculated here."
          }
        ]
      },
      "IV": {
        "totalCredits": 19,
        "courses": [
          {
            "code": "MCA241FX",
            "title": "Professional Elective Course (MOOC)",
            "ltp": "3-0-0",
            "credits": 3,
            "type": "nptel",
            "cie": 100,
            "see": 100,
            "page": null,
            "core": false,
            "note": "Online NPTEL/MOOC elective; evaluated by NPTEL, grade is picked directly."
          },
          {
            "code": "MCA442P",
            "title": "Major Project",
            "ltp": "0-0-10",
            "credits": 10,
            "type": "project",
            "cie": 100,
            "see": 100,
            "page": 84,
            "core": true
          },
          {
            "code": "MCA443N",
            "title": "Project Internship",
            "ltp": "0-0-6",
            "credits": 6,
            "type": "internship",
            "cie": 100,
            "see": 100,
            "page": 86,
            "core": true,
            "note": "6 weeks full-time, after the II semester SEE and before the III semester starts; credits are counted in Semester IV."
          }
        ]
      }
    }
  };

  function pick(){
    var attr = document.documentElement.getAttribute('data-scheme');
    if(attr && SCHEMES[attr]) return attr;
    var q = null;
    try { q = new URLSearchParams(window.location.search).get('scheme'); } catch(e) {}
    return (q && SCHEMES[q]) ? q : '2024';
  }
  window.MCA.scheme = pick();
  window.MCA.DATA = SCHEMES[window.MCA.scheme];
})();
