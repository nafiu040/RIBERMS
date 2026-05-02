<div align="center">

# 🎓 RIBERMS

### Referred · Improvement · Backlog Exam Routine Management System

A full-stack exam scheduling system for managing **Referred**, **Improvement**, and **Backlog** exams across departments, semesters, and shifts — built with Supabase as the backend database.

[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org)

[![License](https://img.shields.io/badge/license-Educational-blue?style=flat-square)](LICENSE)
[![Status](https://img.shields.io/badge/status-stable-success?style=flat-square)]()
[![Responsive](https://img.shields.io/badge/responsive-✓-green?style=flat-square)]()

</div>

---

## 📋 Table of Contents

- [About](#about)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Quick Start](#quick-start)
- [Login Credentials](#login-credentials)
- [Project Structure](#project-structure)
- [Business Rules](#business-rules)
- [Roles & Permissions](#roles--permissions)
- [Browser Support](#browser-support)
- [Security Notes](#security-notes)
- [Roadmap](#roadmap)
- [License](#license)

---

## 🎯 About

RIBERMS is a routine management system built specifically for the three exam types that always end in scheduling chaos: **Referred**, **Improvement**, and **Backlog** exams. Two exams on one day? Blocked. A student trying to take an exam from a future semester? Blocked. Everything else? Handled in a click.

The system features a **universal login** (one ID + password gets you to the right dashboard), **fully audited operations** (every action recorded), and a **clean printable routine** that can be exported as PDF or sent straight to a printer.

> Built as a graded university project — production-ready architecture, classroom-friendly setup.

---

## ✨ Features

### Core
- 🎯 **Universal login** — one form, three roles (student / teacher / admin) auto-routed
- 📅 **Three exam types** — Referred, Improvement, Backlog
- 🌅 **Two shifts per day** — Morning, Afternoon
- 🔢 **Smart course codes** — `DEPT + YEAR + SEM + SERIAL` (e.g., `CSE2101` = Data Structures)
- ⏰ **Custom exam times** — start/end times per exam, validated end > start

### Safety Rails
- ✅ **Same-day clash blocking** — student can't sit two exams on the same day
- ✅ **Semester eligibility** — a Sem-N student can only take Sem 1..N-1 exams
- ✅ **Delete safety guards** — cannot accidentally orphan data
- ✅ **Force delete** — explicit confirmation modal when dependencies exist
- ✅ **Force edit** — teachers warned when editing another teacher's exam

### Audit & Trust
- 📝 **Full audit log** — every CREATE, UPDATE, DELETE, ENROLL, UNENROLL recorded
- 👤 **Actor snapshot** — who did what, when (preserved even if user is later deleted)
- 🔍 **Distinguished actions** — `FORCE_DELETE` vs `DELETE`, `FORCE_UPDATE` vs `UPDATE`

### Security
- 🔐 **Password confirmation** — actor must verify their own password to change any password
- 🔒 **Session-based auth** — persistent login via localStorage
- 🛡️ **Permission tiers** — admin-only operations enforced on the client

### User Experience
- 📱 **Fully responsive** — works on mobile, tablet, laptop, 4K (320px to 3840px)
- 🍔 **Mobile drawer sidebar** — slides in cleanly with no overlay bleed
- 🖨️ **Print / Save as PDF** — one-click export of routines, A4-ready
- 🎨 **Distinctive design** — warm cream + ink palette, Fraunces + Inter typography
- ⚡ **No build step** — pure HTML/CSS/JS, opens in any modern browser

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Vanilla JavaScript (ES2022), CSS3 (Grid + Flexbox), HTML5 |
| **Backend** | [Supabase](https://supabase.com) (PostgreSQL + auto-generated REST API) |
| **Database** | PostgreSQL 15+ (managed by Supabase) |
| **Auth** | Custom ID/password lookup against `users` table |
| **Hosting** | Static — works on any host (Netlify, Vercel, GitHub Pages, etc.) |
| **Build** | None required — open `index.html` directly |

### Why no framework?

This project deliberately avoids React / Vue / Svelte to demonstrate that a polished, fully-featured app can be built with the platform alone. The result is a **9 KB JavaScript bundle** instead of a 200 KB framework runtime — fast on every device, easy to read and modify.

---

## 🚀 Quick Start

### Prerequisites
- A free [Supabase](https://supabase.com) account
- Any modern browser (Chrome, Firefox, Safari, Edge)
- Optional: VS Code with [Live Server extension](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer)

### Setup in 4 steps

#### 1️⃣ Create a Supabase project

1. Sign up at [supabase.com](https://supabase.com)
2. Click **New project** → name it `riberms` (or anything you prefer)
3. Pick a database password and a nearby region
4. Wait ~2 minutes for provisioning

#### 2️⃣ Run the SQL setup

```sql
-- In your Supabase dashboard:
-- SQL Editor → + New query → paste contents of sql/supabase-setup.sql → Run
```

This creates 7 tables, sets up Row Level Security policies, and seeds sample data.

#### 3️⃣ Configure your credentials

Open `config.js` and replace the placeholders:

```javascript
const SUPABASE_CONFIG = {
  url: 'https://YOUR_PROJECT.supabase.co',
  anonKey: 'YOUR_ANON_PUBLIC_KEY',
};
```

> 📍 **Where to find these:** Supabase dashboard → Project Settings → Data API

#### 4️⃣ Open the app

```bash
# Option A: Just open index.html in your browser
open index.html

# Option B: Run a local server (recommended)
python -m http.server 8000
# then visit http://localhost:8000
```

That's it. ✨

---

## 🔑 Login Credentials

All accounts use the password **`merciful`**. You can change them after logging in via *Edit My Profile*.

### 👩‍🎓 Students

| ID | Name | Department | Semester |
|----|------|-----------|----------|
| `18001` | Ayesha Rahman | CSE | Sem 7 |
| `19002` | Tasnim Akter | CSE | Sem 5 |
| `18003` | Sumaiya Khatun | EEE | Sem 6 |
| `20004` | Nusrat Jahan | CSE | Sem 3 |
| `21005` | Mehnaz Karim | BBA | Sem 4 |

### 👩‍🏫 Teachers

| ID | Name | Department |
|----|------|-----------|
| `20101` | Dr. Farzana Hossain | CSE |
| `20102` | Dr. Ruma Akter | EEE |
| `20103` | Prof. Salma Begum | CSE |

### 👩‍💼 Administrator

| ID | Name |
|----|------|
| `90001` | Dr. Shirin Akter |

---

## 📂 Project Structure

```
riberms/
├── 📄 index.html                  ← Landing page
├── 📄 login.html                  ← Universal login
├── 📄 student-dashboard.html      ← Student view
├── 📄 teacher-dashboard.html      ← Teacher view
├── 📄 admin-dashboard.html        ← Admin view (with audit log)
├── 📄 config.js                   ← Your Supabase credentials
├── 📄 README.md                   ← You are here
├── 📄 TODO.md                     ← Roadmap & known issues
│
├── 📁 css/
│   └── 🎨 style.css               ← All styling (~1,600 lines)
│
├── 📁 js/
│   ├── ⚙️ data.js                 ← In-memory store + business logic
│   ├── 🔌 supabase.js             ← Database layer (REST API)
│   └── 🧠 app.js                  ← App logic, modals, validation
│
└── 📁 sql/
    └── 🗄️ supabase-setup.sql      ← Run once in Supabase SQL Editor
```

---

## 📐 Business Rules

These rules are enforced **client-side** with clear error messages:

| Rule | Description |
|------|-------------|
| 🚫 **Same-day clash** | Student cannot be enrolled in two exams on the same date |
| 🎓 **Semester eligibility** | Sem-N student can only sit exams from semesters 1..N-1 |
| ⏱️ **Time validation** | End time must be strictly later than start time |
| ☀️ **Shift integrity** | Only `MORNING` or `AFTERNOON` accepted (no evening) |
| 🔒 **Delete safety** | Records with dependencies require explicit force-delete |
| 🔑 **Password verification** | Actor must confirm their own password to change any password |

### Course Code Format

Course codes follow `DEPT + YEAR + SEM + SERIAL`:

```
CSE2101  →  CSE department · Year 2 · Semester 1 · Serial 01
              └─→ Data Structures & Algorithms

BBA1101  →  BBA department · Year 1 · Semester 1 · Serial 01
              └─→ Principles of Management
```

The "Add Subject" form **auto-suggests** the next code based on selected department and semester.

---

## 👥 Roles & Permissions

| Action | Student | Teacher | Admin |
|--------|:-------:|:-------:|:-----:|
| View own routine | ✅ | — | — |
| View all exams | — | ✅ | ✅ |
| Create exams | — | ✅ | ✅ |
| Edit own exams | — | ✅ | ✅ |
| Edit others' exams | — | ⚠️ Force | ✅ |
| Delete exams | — | ✅ | ✅ |
| Enroll students | — | ✅ | ✅ |
| Un-enroll students | — | ✅ | ✅ |
| Add students | — | ✅ | ✅ |
| Add teachers | — | — | ✅ |
| Edit own profile | ✅ | ✅ | ✅ |
| View audit log | — | — | ✅ |
| Print routine | own | full | full |

> ⚠️ **Force** = action is allowed but flagged in the audit log

---

## 🌐 Browser Support

Tested and working on:

| Browser | Min Version |
|---------|-------------|
| Chrome / Edge | 90+ |
| Firefox | 88+ |
| Safari (macOS) | 14+ |
| Safari (iOS) | 14+ |
| Samsung Internet | 14+ |

Uses modern features like CSS Grid, `clamp()`, `aspect-ratio`, dynamic viewport units (`dvh`), and `safe-area-inset`. Works on devices from 320px wide (iPhone SE) up to 4K monitors.

---

## 🔐 Security Notes

This project uses Supabase's **anon key** with open Row Level Security policies for ease of demonstration. For a real production deployment, you would want to:

- ✅ Use [Supabase Auth](https://supabase.com/docs/guides/auth) (email/password or magic link)
- ✅ Replace open RLS policies with role-based ones
- ✅ Hash passwords with `bcrypt` or `argon2` instead of storing plaintext
- ✅ Enable HTTPS-only cookies for sessions
- ✅ Rate-limit login attempts to prevent brute force

For a **graded class project**, the current setup is intentional — it keeps the focus on UX, business rules, and audit logging rather than authentication infrastructure.

---

## 🗺️ Roadmap

See [TODO.md](TODO.md) for the full list of completed milestones, current limitations, and planned features.

---

## 📜 License

This project is provided **for educational purposes**. Free to use, modify, and learn from.

---

<div align="center">

**Built with care for time-pressed students managing chaotic exam schedules.**

If this project helps you, consider giving it a ⭐ on GitHub.

</div>
