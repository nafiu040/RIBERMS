# RIBERMS — Referred, Improvement & Backlog Exam Routine Management System

A full-stack exam scheduling system for managing **Referred**, **Improvement**, and **Backlog** exams across departments, semesters, and shifts — built with Supabase as the backend database.

---

## ✨ What's new in this version

- **Audit log** — every create / update / delete / force-delete / enroll / unenroll is recorded with who, what, and when. Visible from the admin dashboard.
- **Edit existing records** — students, teachers, exams, and the admin's own profile can all be updated from the UI.
- **Universal login** — one login form for everyone. Just enter your ID and password — the system detects your role and routes you to the right dashboard.
- **Un-enroll students** — teachers and admins can remove a student from any exam they shouldn't be in. Logged in the audit trail.
- **Edit your own profile** — every signed-in user can click their name in the sidebar to update their name, email, or password.
- **Force delete** — when a normal delete is blocked by dependencies (e.g., a teacher with scheduled exams), a confirmation modal shows what will be cascaded. Force delete removes the record and all its attached data in one shot. Restricted by role: teachers + departments are admin-only.
- **Unified delete experience** — every delete (with or without dependencies) goes through the same styled modal. No more browser popup boxes. The button label adapts: "Delete" when safe, "Force Delete" when there's cascade.
- **Fully responsive** — works on mobile, tablet, and desktop. Sidebar becomes a slide-in drawer on mobile, tables scroll horizontally instead of squishing, modals dock to the bottom of the screen on small devices.

---

## 🚀 Setup (4 steps)

### 1. Create a free Supabase project

1. Go to <https://supabase.com> and sign up (free tier is plenty)
2. Click **New project**
3. Name it `riberms` (or anything you like) — pick a database password and a nearby region
4. Wait ~2 minutes for it to provision

### 2. Run the SQL setup script

1. In your Supabase dashboard, click **SQL Editor** in the left sidebar
2. Click **+ New query**
3. Open `sql/supabase-setup.sql` from this project, copy **the whole file**, paste it into the SQL Editor
4. Click **Run** (bottom-right). You should see a success result row.

This creates all tables, sets up Row Level Security, and inserts sample data.

### 3. Connect your project to Supabase

1. In Supabase, go to **Project Settings → Data API**
2. Copy your **Project URL**
3. Copy your **anon public** key (the long one labeled `anon` `public`)
4. Open `config.js` in this folder and paste them in:

```js
const SUPABASE_CONFIG = {
  url: 'https://yourprojectid.supabase.co',
  anonKey: 'eyJhbGciOi....',
};
```

### 4. Open the app

Just double-click `index.html` to open it in your browser. That's it.

If you want a proper local server (recommended), use VS Code's **Live Server** extension or run from the project folder:

```bash
python -m http.server 8000
```

Then open <http://localhost:8000>.

---

## 🔑 Login credentials

All passwords are `merciful`. You can change them later via the edit profile feature.

### Students
| ID | Name | Department | Semester |
|---|---|---|---|
| `18001` | Ayesha Rahman | CSE | Sem 7 |
| `19002` | Tasnim Akter | CSE | Sem 5 |
| `18003` | Sumaiya Khatun | EEE | Sem 6 |
| `20004` | Nusrat Jahan | CSE | Sem 3 |
| `21005` | Mehnaz Karim | BBA | Sem 4 |

### Teachers
| ID | Name | Department |
|---|---|---|
| `20101` | Dr. Farzana Hossain | CSE |
| `20102` | Dr. Ruma Akter | EEE |
| `20103` | Prof. Salma Begum | CSE |

### Admin
| ID | Name |
|---|---|
| `90001` | Dr. Shirin Akter |

---

## 📋 Features

### Universal login
Type any of the IDs above — student, teacher, or admin — and the system will route you to the correct dashboard automatically. No role tabs to pick from.

### Student
- View personal exam routine, sortable and filterable by shift / type / subject
- Filter and search by course code or title
- Read-only access to their own enrolled exams

### Teacher
- See exams they've created, with student counts
- Add new exams (with conflict and semester-rule auto-checks)
- **Edit** any of their exams (date, time, type, subject)
- Enroll students into exams; **un-enroll** students from exams (with full audit trail)
- Add students, subjects, departments
- Edit own profile
- Calendar view of upcoming exams

### Admin (full power)
- Everything teachers can do, plus:
- Manage all exams across the system, regardless of who created them
- Add and **edit** any teacher
- View the complete **audit log** — every action by every user
- Edit own profile

### Built-in business rules (server-validated by your data)
- ✅ **Same-day clash blocking** — student can't be enrolled in two exams on the same day
- ✅ **Semester eligibility** — a Sem-N student can only sit Sem 1..N-1 exams
- ✅ **Time validation** — end time must be after start time
- ✅ **Shift integrity** — only Morning or Afternoon (no evening exams)
- ✅ **Delete safety guards** — can't accidentally delete a teacher who has exams, a course with exams, or a department with users; force delete is available when you really need it

### Force delete

When you try to remove a record that has dependencies, a warning modal appears showing exactly what will be cascaded. You can then confirm a **Force Delete** that removes the record and all attached data in a single transaction. Force deletes are recorded in the audit log as `FORCE_DELETE` so they're easy to spot.

| Force-delete target | Teacher | Admin |
|---|---|---|
| Student | ✓ | ✓ |
| Exam | ✓ | ✓ |
| Subject (Course) | ✓ | ✓ |
| Teacher | ✗ | ✓ |
| Department | ✗ | ✓ |

### Course code format
Course codes follow `DEPT + YEAR + SEM + SERIAL`:
- `CSE2101` = CSE department, Year 2, Semester 1, Serial 01 → **Data Structures & Algorithms**
- `BBA1101` = BBA, Year 1, Semester 1, Serial 01 → **Principles of Management**

The "Add Subject" form auto-suggests the next code based on department and semester.

### Audit log
All actions are saved with:
- **When** — exact timestamp
- **Who** — name and role (snapshotted, so it survives user deletion)
- **Action** — CREATE / UPDATE / DELETE / ENROLL / UNENROLL
- **Entity** — what was affected (exam, student, teacher, subject, etc.)
- **Summary** — a human-readable description

Visible in the admin dashboard's **Audit Log** tab.

---

## 📁 Project structure

```
riberms/
├── index.html                  ← Landing page
├── login.html                  ← Universal login
├── student-dashboard.html      ← Student view
├── teacher-dashboard.html      ← Teacher view
├── admin-dashboard.html        ← Admin view (with audit log)
├── config.js                   ← YOUR Supabase URL + anon key go here
├── css/
│   └── style.css               ← All styling
├── js/
│   ├── data.js                 ← In-memory data store + helpers
│   ├── supabase.js             ← Database layer (Supabase REST)
│   └── app.js                  ← App logic, modals, validation, audit
└── sql/
    └── supabase-setup.sql      ← Run this in Supabase SQL Editor
```

---

## 🔧 Tech stack

- **Frontend** — Plain HTML, CSS, vanilla JavaScript (no build step)
- **Backend** — Supabase (PostgreSQL + auto-generated REST API)
- **Auth** — ID + password lookup against the `users` table
- **Hosting** — Just open `index.html`. Or drop the folder onto Netlify, Vercel, GitHub Pages, etc.

---

## 🛡️ Security note

This setup uses Supabase's anon key with open Row Level Security policies for ease of demonstration. For a real production deployment, you'd want to:

- Use Supabase Auth (email/password or magic link)
- Replace open RLS policies with role-based ones
- Hash passwords (bcrypt / scrypt) instead of storing plaintext
- Enable HTTPS-only cookies for sessions

For a graded class project, this setup is perfectly fine.

---

## 💡 Tips

- After making changes in Supabase via SQL, refresh your browser to reload data
- The "Saved to database ✓" indicator confirms your write reached Supabase
- The audit log refresh button on the admin dashboard reloads the latest entries
- If you see "Can't reach database" — double-check `config.js` has your real URL and key

---

## 📜 License

Free to use for educational purposes.
