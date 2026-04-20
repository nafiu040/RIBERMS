# RIBERMS

**Referred · Improvement · Backlog Exam Routine Management System**

A complete frontend demo for a university exam routine system. Pure HTML, CSS, and JavaScript — no backend, no build step, no installation.

---


## Pages

| Page | Purpose |
|---|---|
| `index.html` | Landing page — hero, features, workflow |
| `login.html` | Sign in with ID + password, role-based |
| `student-dashboard.html` | Student's personal exam routine |
| `teacher-dashboard.html` | Teacher creates exams, enrolls students, manages subjects/students/departments |
| `admin-dashboard.html` | Admin oversight — everything above + teacher management |

---

## How to run

### Option 1 — Just double-click `index.html`

Works for the landing page and login. Browsers may block some features when using `file://` protocol, so for full functionality use Option 2.

### Option 2 — VS Code "Live Server" extension (recommended)

1. Open VS Code → **File → Open Folder** → pick the `riberms` folder
2. Install the extension **Live Server** (by Ritwick Dey) from the Extensions tab
3. Right-click on `index.html` in the file explorer
4. Click **"Open with Live Server"**
5. Your browser opens at `http://127.0.0.1:5500/` with the site running ✅

### Option 3 — Python's built-in server

```
python -m http.server 8000
```
Then open `http://localhost:8000/`

---

## Demo credentials

**Password for all accounts:** `demo`

| Role | ID | Name |
|---|---|---|
| Student | `180007` | Rahim Uddin (CSE, Sem 7) |
| Student | `190032` | Karim Ahmed (CSE, Sem 5) |
| Student | `180014` | Fatima Khatun (EEE, Sem 6) |
| Student | `200045` | Nusrat Jahan (CSE, Sem 3) |
| Teacher | `T-1042` | Dr. Hasan Mahmud (CSE) |
| Teacher | `T-1058` | Dr. Ruma Akter (EEE) |
| Teacher | `T-1073` | Prof. Nabil Chowdhury (CSE) |
| Admin | `ADMIN-01` | System Administrator |

---

## Course code format

Codes follow a meaningful pattern — **`DEPT + YEAR + SEM + SERIAL`**

**Example:** `CSE2101` (Data Structures & Algorithms)
- `CSE` = Computer Science & Engineering department
- `2` = 2nd year
- `1` = 1st semester of that year
- `01` = 1st subject in that semester

When you add a new subject, RIBERMS **auto-suggests the next available code** based on the department and semester you pick.

---

## What to try in the demo

### As a student
- View personal exam routine with filters
- Click "Next Exam" to see upcoming details
- Check profile, print routine

### As a teacher (can add exams, students, subjects, departments)
- **Add Exam:** pick subject, date, shift, custom start/end time, type
- **Enroll student:** picks trigger automatic clash + semester eligibility checks
  - Try enrolling Rahim Uddin in a CSE3201 exam → **blocked** (he has a clash)
  - Try enrolling Nusrat Jahan (Sem 3) in a Sem 5 subject → **blocked** (semester rule)
- **Add Subject:** enter a new course — code auto-suggests based on dept+semester
- **Add Student / Department:** full CRUD

### As an admin
- Overview with stats, department breakdown, recent exams
- All the teacher capabilities **plus** managing teachers
- Remove anyone, any exam, any subject

---

## Rules enforced

1. **Same-day clash detection** — a student cannot have two exams on the same date
2. **Semester eligibility** — a student in Semester N can only take exams from Semesters 1 to N-1
3. **Time validation** — end time must be after start time
4. **Unique IDs** — no duplicate login IDs
5. **Unique course codes** — no duplicate subject codes
6. **Cascade protection** — can't delete departments/subjects with dependencies

---

## Project structure

```
riberms/
├── index.html                  Landing page
├── login.html                  Sign-in page
├── student-dashboard.html      Student portal
├── teacher-dashboard.html      Teacher portal
├── admin-dashboard.html        Admin portal
├── css/
│   └── style.css               Complete design system
├── js/
│   ├── data.js                 Sample data + helpers
│   └── app.js                  All app logic (login, CRUD, validation)
├── assets/                     (empty, for future images/logos)
└── README.md                   This file
```

---

## Important notes

- **Data is in-memory.** Refresh = data resets to defaults. Perfect for demos.
- **Session persists.** Your login is remembered across page reloads via `localStorage`.
- **No real auth.** Passwords are checked against stored values (all set to `demo`), no hashing, no tokens. Add that when wiring a real backend.

---

## When you're ready to add a backend

The structure is already set up for an easy swap:
1. Replace the `DATA` object in `js/data.js` with `fetch()` calls to your Django/DRF API
2. Replace `handleLogin()` in `js/app.js` to POST to `/api/auth/login/` and store a JWT
3. Add `Authorization: Bearer <token>` headers to every request
4. Keep the validation functions (`checkClash`, `checkSemesterRule`) server-side — they should run in the Django service layer too

The UI doesn't need changes.

---

Good luck with the demo! 🎓
