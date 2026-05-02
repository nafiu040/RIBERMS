# 📋 TODO & Roadmap

A live tracker of what's done, what's known, and what's coming next.

---

## ✅ Completed Milestones

### Phase 1 — Foundation
- [x] Universal login (no role tabs — system auto-routes based on user record)
- [x] Three role dashboards: student, teacher, admin
- [x] Custom design system (warm cream + ink palette, Fraunces + Inter typography)
- [x] Supabase integration via REST API
- [x] Session persistence via localStorage

### Phase 2 — Core Operations
- [x] CRUD for exams (create, edit, delete)
- [x] CRUD for users (students, teachers, admin)
- [x] CRUD for subjects/courses
- [x] CRUD for departments
- [x] Enrollment management (enroll, un-enroll students)
- [x] Smart course code auto-suggestion (`DEPT + YEAR + SEM + SERIAL`)

### Phase 3 — Business Rules
- [x] Same-day clash detection on enrollment
- [x] Semester eligibility enforcement (Sem-N students can only take Sem 1..N-1 exams)
- [x] Time validation (end must be after start)
- [x] Shift integrity (Morning/Afternoon only)

### Phase 4 — Audit & Trust
- [x] `audit_logs` table with full schema
- [x] Audit logging on every CRUD operation
- [x] Distinguished `FORCE_DELETE` vs `DELETE` actions
- [x] Distinguished `FORCE_UPDATE` vs `UPDATE` actions
- [x] Actor snapshot (name + role) preserved even after user deletion
- [x] Admin audit log dashboard with the most recent 200 entries

### Phase 5 — Safety Rails
- [x] Delete confirmation modal (replaces browser `confirm()`)
- [x] Force delete with cascade preview
- [x] Force edit warning when teacher edits another teacher's exam
- [x] Permission tiers (admin-only for teacher/department force-delete)
- [x] Logout confirmation modal

### Phase 6 — Security
- [x] Password confirmation required for all password changes
- [x] Actor must verify own password to change anyone's password
- [x] Forgot-password notes on login page and edit forms
- [x] Self-edit profile for all roles (student, teacher, admin)

### Phase 7 — User Experience
- [x] Print / Save as PDF for routines (A4-formatted)
- [x] Student prints their personal routine
- [x] Teachers/admin print full institution-wide schedule
- [x] Color-coded type badges (Referred / Improvement / Backlog)

### Phase 8 — Responsive Design
- [x] Three breakpoints: 900px (drawer), 768px (mobile), 480px (small mobile)
- [x] Mobile slide-in drawer sidebar with proper z-index handling
- [x] iOS Safari `100vh` bug fix using `100dvh`
- [x] Notch / Dynamic Island support via `safe-area-inset`
- [x] Touch-friendly tap targets (44px minimum)
- [x] iOS form-zoom prevention (16px input font-size)
- [x] Sidebar overlay covers only non-sidebar area (no click interception)
- [x] Body scroll lock when drawer is open
- [x] Auto-close drawer on viewport resize to desktop

### Phase 9 — Code Quality
- [x] Removed 23 unused CSS classes (~60 lines)
- [x] Removed 2 unused helper functions
- [x] No `TODO`, `FIXME`, or debug `console.log` calls
- [x] All HTML and JS files validated as syntax-clean

### Phase 10 — Polish
- [x] Added Admin management (add/remove other admins, with last-admin safety guard)
- [x] Past Exams view for students (chronological history of completed exams)
- [x] Auto-redirect logged-in users from landing page to their dashboard
- [x] Dark mode toggle (persists across sessions)
- [x] Removed redundant Edit Profile entry on student sidebar
- [x] Toast notifications + styled alert modal replace all browser popups

### Phase 11 — Feature Completeness
- [x] Bulk operations on students (multi-select, bulk enroll, bulk delete)
- [x] Per-record activity tab for teachers (audit log filtered to their exams)
- [x] Live search on every user/subject/department table
- [x] TODAY highlight on routine rows that match today's date
- [x] Friendlier empty state for new students with no enrollments
- [x] Live course code uniqueness check (✓ available / ✗ taken as you type)

---

## 🚧 Known Limitations

These are intentional trade-offs given the project's scope as a graded class assignment:

| # | Limitation | Why | Impact |
|---|-----------|-----|--------|
| 1 | Passwords stored as **plaintext** in DB | Simplified auth for demo | Replace with bcrypt for production |
| 2 | Open Row Level Security policies | Anyone with anon key can read | Replace with role-based RLS for production |
| 3 | No email verification on signup | No SMTP infrastructure | Use Supabase Auth's built-in email |
| 4 | Audit log capped at **200 entries** in UI | Avoid loading thousands of rows | Add pagination / search later |
| 5 | No undo on deletes | Audit log is the safety net | Acceptable for current use case |
| 6 | Student count in admin overview is **not paginated** | Assumes < 1000 students | Add server-side pagination if scaling |
| 7 | Force-edit teacher path is **unreachable from teacher dashboard** | No teacher management page for teachers | Code is in place but inactive |
| 8 | No rate-limiting on login attempts | Frontend-only auth | Add server-side rate limit for production |

---

## 🔮 Future Enhancements

Ideas worth implementing if the project gets a v2:

### Authentication
- [ ] Switch to Supabase Auth (proper email + password)
- [ ] "Forgot password" self-service flow via email magic link
- [ ] Two-factor authentication for admins
- [ ] Session timeout after N minutes of inactivity

### Features
- [ ] Bulk import students from CSV
- [ ] Email notifications when an exam is added/changed for an enrolled student
- [ ] Calendar `.ics` export of personal routine
- [ ] Student attendance tracking on exam day
- [ ] Result entry by teachers post-exam
- [ ] GPA / grade-point computation per semester

### Admin Tools
- [ ] Audit log filtering (by user, action type, date range)
- [ ] Audit log export to CSV
- [ ] Bulk delete with single confirmation
- [ ] Database backup/restore from UI

### UX Improvements
- [ ] Keyboard shortcuts (e.g., `N` to add new exam, `/` to focus search)
- [ ] Drag-to-reorder for exam schedule
- [ ] Multi-language support (English / Bangla)
- [ ] Offline-first PWA support

### Reporting
- [ ] Department-wise exam statistics
- [ ] Pass/fail analysis dashboard
- [ ] Print: department-wise routine instead of just full
- [ ] Print: range-based routine (e.g., next 7 days only)

---

## 🐛 Bug Reports

No open bugs as of the latest release. If you find one, please:

1. Check this list first
2. Note the browser, device, and exact steps to reproduce
3. Open a GitHub issue with the label `bug`

---

## 🤝 Contributing

This is a class project, but suggestions are welcome:

1. Fork the repo
2. Create a branch (`git checkout -b feature/your-feature`)
3. Commit your changes
4. Open a pull request

---

## 📅 Version History

| Version | Date | Highlights |
|---------|------|-----------|
| `v1.0` | Initial | Pure-frontend HTML/CSS/JS demo with hardcoded data |
| `v2.0` | Supabase wave | Added Supabase backend, REST API integration |
| `v3.0` | Audit & edits | Audit log, edit modals, universal login |
| `v4.0` | Safety guards | Force delete with cascade preview |
| `v5.0` | Polish | All passwords → `merciful`, unified delete UX |
| `v6.0` | Layout fixes | Fixed hero overflow at common laptop widths |
| `v7.0` | Visibility | Teachers see all exams, not just their own |
| `v8.0` | Force edit | Force-edit warning for cross-teacher edits |
| `v9.0` | Print | A4-formatted Print/Save as PDF feature |
| `v10.0` | Responsive | Comprehensive 3-breakpoint responsive overhaul |
| `v11.0` | Drawer fix | Solid sidebar background, no overlay bleed |
| `v12.0` | Click fix | Sidebar nav items reliably clickable on mobile |
| `v13.0` | Self-edit | Logout confirmation, student profile editing |
| `v14.0` | Password verify | Confirm-with-password requirement on all changes |
| `v15.0` | Polish | Professional README, TODO file, folder rename |
| `v16.0` | Confirmation polish | Un-enroll uses styled confirmation modal |
| `v17.0` | Browser popups gone | Toast + styled alert system replaces all `confirm()`/`alert()` |
| `v18.0` | Polish | Admin management, Past Exams, dashboard redirect, dark mode |
| `v19.0` | **Current** | Feature gaps closed: bulk ops, teacher activity, table search, TODAY highlight, empty states, live code check |

---

<div align="center">

🌟 **Got an idea?** Open an issue or send a PR.

</div>
