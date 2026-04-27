/* =========================================================
   RIBERMS — Application Logic (with audit log + edit + universal login)
   ========================================================= */

/* ---------- Session ---------- */
const Session = {
  set(user) { localStorage.setItem('riberms_user', JSON.stringify(user)); },
  get() {
    const data = localStorage.getItem('riberms_user');
    return data ? JSON.parse(data) : null;
  },
  clear() { localStorage.removeItem('riberms_user'); },

  requireRole(role) {
    const user = this.get();
    if (!user) { window.location.href = 'login.html'; return null; }
    if (Array.isArray(role)) {
      if (!role.includes(user.role)) { window.location.href = this.dashboardFor(user.role); return null; }
    } else if (user.role !== role) {
      window.location.href = this.dashboardFor(user.role);
      return null;
    }
    return user;
  },

  dashboardFor(role) {
    return role === 'ADMIN'   ? 'admin-dashboard.html' :
           role === 'TEACHER' ? 'teacher-dashboard.html' :
                                'student-dashboard.html';
  },
};

/* ---------- Loading overlay ---------- */
function showLoading(msg = 'Loading from database…') {
  let el = document.getElementById('riberms-loading');
  if (!el) {
    el = document.createElement('div');
    el.id = 'riberms-loading';
    el.innerHTML = `
      <div style="position:fixed;inset:0;background:rgba(247,243,235,0.96);display:flex;align-items:center;justify-content:center;z-index:999;flex-direction:column;gap:16px;backdrop-filter:blur(4px);">
        <div style="width:42px;height:42px;border:3px solid var(--line);border-top-color:var(--terracotta);border-radius:50%;animation:spin 0.8s linear infinite;"></div>
        <p style="font-family:var(--font-mono);font-size:12px;letter-spacing:0.1em;text-transform:uppercase;color:var(--ink-muted);" id="loading-text">${msg}</p>
      </div>
      <style>@keyframes spin { to { transform: rotate(360deg); } }</style>
    `;
    document.body.appendChild(el);
  } else {
    const t = el.querySelector('#loading-text');
    if (t) t.textContent = msg;
    el.style.display = '';
  }
}
function hideLoading() {
  const el = document.getElementById('riberms-loading');
  if (el) el.remove();
}
function showFatalError(err) {
  hideLoading();
  const msg = err && err.message ? err.message : String(err);
  document.body.innerHTML = `
    <div style="max-width:560px;margin:80px auto;padding:32px;font-family:system-ui,sans-serif;">
      <h1 style="font-family:Fraunces,Georgia,serif;font-weight:400;margin:0 0 16px;">Can't reach database</h1>
      <p style="color:#5A6B60;line-height:1.6;">${msg}</p>
      <div style="margin-top:24px;padding:16px;background:#F7F3EB;border:1px dashed #B8AC91;border-radius:8px;font-size:14px;">
        <strong>Common fixes:</strong>
        <ul style="margin:8px 0 0 20px;line-height:1.8;">
          <li>Make sure <code>config.js</code> has your real Supabase URL and anon key</li>
          <li>Run the SQL in <code>sql/supabase-setup.sql</code> on your Supabase project</li>
          <li>Check your internet connection</li>
        </ul>
      </div>
      <p style="margin-top:24px;"><a href="login.html" style="color:#B5563A;">← Back to login</a></p>
    </div>`;
}

async function bootstrap(init) {
  showLoading();
  try {
    await DB.loadAll();
    hideLoading();
    await init();
  } catch (err) {
    console.error(err);
    showFatalError(err);
  }
}

/* ---------- Universal login (no role tabs) ---------- */
async function handleLogin(event) {
  event.preventDefault();
  const form = event.target;
  const loginId = form.loginId.value.trim();
  const password = form.password.value;
  const errorEl = document.getElementById('login-error');
  errorEl.style.display = 'none';
  const submitBtn = form.querySelector('button[type="submit"]');
  const originalBtn = submitBtn.innerHTML;
  submitBtn.disabled = true;
  submitBtn.innerHTML = 'Checking…';

  try {
    const user = await DB.findUserByLoginId(loginId);
    if (!user) {
      showLoginError(`No account found with ID "${loginId}".`);
      return;
    }
    if (!password) {
      showLoginError('Please enter your password.');
      return;
    }
    if (user.password !== password) {
      showLoginError('Incorrect password.');
      return;
    }

    Session.set(user);
    window.location.href = Session.dashboardFor(user.role);
  } catch (err) {
    showLoginError(`Connection error: ${err.message}`);
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerHTML = originalBtn;
  }
}

function showLoginError(msg) {
  const el = document.getElementById('login-error');
  el.querySelector('.alert-body').textContent = msg;
  el.style.display = 'flex';
}

/* ---------- Logout ---------- */
function logout() {
  if (confirm('Sign out of RIBERMS?')) {
    Session.clear();
    window.location.href = 'login.html';
  }
}

/* ---------- Sidebar nav ---------- */
function setupSidebarNav() {
  const items = document.querySelectorAll('.sidebar-nav-item[data-target]');
  items.forEach(item => {
    item.addEventListener('click', () => {
      const target = item.dataset.target;
      items.forEach(i => i.classList.remove('active'));
      item.classList.add('active');
      document.querySelectorAll('[data-view]').forEach(v => v.classList.remove('active'));
      const view = document.querySelector(`[data-view="${target}"]`);
      if (view) {
        view.classList.add('active');
        view.classList.add('fade-in-up');
        setTimeout(() => view.classList.remove('fade-in-up'), 400);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  });
}

/* ---------- Modal ---------- */
function openModal(id)  { const m = document.getElementById(id); if (m) m.classList.add('open'); }
function closeModal(id) { const m = document.getElementById(id); if (m) m.classList.remove('open'); }
function setupModalBackdrop() {
  document.querySelectorAll('.modal-backdrop').forEach(mb => {
    mb.addEventListener('click', (e) => { if (e.target === mb) mb.classList.remove('open'); });
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal-backdrop.open').forEach(m => m.classList.remove('open'));
    }
  });
}

/* ---------- Student routine render ---------- */
function renderStudentRoutine(studentId, filters = {}) {
  let exams = helpers.getStudentExams(studentId);
  if (filters.shift) exams = exams.filter(e => e.shift === filters.shift);
  if (filters.type)  exams = exams.filter(e => e.type === filters.type);
  if (filters.search) {
    const q = filters.search.toLowerCase();
    exams = exams.filter(e => e.course.code.toLowerCase().includes(q) || e.course.title.toLowerCase().includes(q));
  }
  exams.sort((a, b) => a.date.localeCompare(b.date));
  const tbody = document.querySelector('#student-routine-body');
  if (!tbody) return;
  if (exams.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" class="table-empty">No exams match your filters.</td></tr>`;
    return;
  }
  tbody.innerHTML = exams.map(e => {
    const sem = helpers.getSemester(e.course.semesterId);
    return `
    <tr>
      <td><span class="course-code">${e.course.code}</span><div class="text-sm" style="margin-top:4px;">${e.course.title}</div></td>
      <td>${helpers.formatDate(e.date)}</td>
      <td><span class="badge badge-${e.shift.toLowerCase()}">${e.shift}</span></td>
      <td class="mono text-sm">${helpers.formatTime(e.startTime)} – ${helpers.formatTime(e.endTime)}</td>
      <td><span class="badge badge-${e.type.toLowerCase()}">${e.type}</span></td>
      <td class="text-sm text-muted">Sem ${sem ? sem.number : '—'}</td>
    </tr>`;
  }).join('');
}

/* ---------- Teacher/Admin exam list ---------- */
function renderExamsList(bodyId, filters = {}, teacherId = null) {
  const tbody = document.querySelector(bodyId);
  if (!tbody) return;
  let exams = DATA.exams.slice();
  if (teacherId !== null) exams = exams.filter(e => e.createdBy === teacherId);
  if (filters.shift) exams = exams.filter(e => e.shift === filters.shift);
  if (filters.type)  exams = exams.filter(e => e.type === filters.type);
  exams.sort((a, b) => a.date.localeCompare(b.date));
  if (exams.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" class="table-empty">No exams scheduled. Click "Add Exam" to create one.</td></tr>`;
    return;
  }
  tbody.innerHTML = exams.map(e => {
    const course = helpers.getCourse(e.courseId);
    if (!course) return '';
    const count = DATA.enrollments.filter(en => en.examId === e.id).length;
    return `
      <tr>
        <td><span class="course-code">${course.code}</span><div class="text-sm" style="margin-top:4px;">${course.title}</div></td>
        <td>${helpers.formatDate(e.date)}</td>
        <td><span class="badge badge-${e.shift.toLowerCase()}">${e.shift}</span></td>
        <td class="mono text-sm">${helpers.formatTime(e.startTime)} – ${helpers.formatTime(e.endTime)}</td>
        <td><span class="badge badge-${e.type.toLowerCase()}">${e.type}</span></td>
        <td class="text-sm">
          <a href="#" onclick="openExamEnrollmentsModal(${e.id});return false;" style="color:var(--terracotta);text-decoration:underline;">${count} student${count === 1 ? '' : 's'}</a>
        </td>
        <td>
          <button class="btn btn-outline btn-sm" onclick="openEnrollModal(${e.id})">Enroll</button>
          <button class="btn btn-outline btn-sm" onclick="openEditExamModal(${e.id})">Edit</button>
          <button class="btn btn-danger btn-sm" onclick="deleteExam(${e.id})">Delete</button>
        </td>
      </tr>`;
  }).join('');
}

/* ---------- Deletes ---------- */
async function deleteExam(examId) {
  const exam = DATA.exams.find(e => e.id === examId);
  if (!exam) return;
  const course = helpers.getCourse(exam.courseId);
  const enrollments = DATA.enrollments.filter(en => en.examId === examId);
  const hasDeps = enrollments.length > 0;

  openDeleteModal({
    entity: 'exam',
    entityId: examId,
    blocked: hasDeps,
    adminOnly: false,
    title: hasDeps
      ? `Cannot remove exam (${course ? course.code : '?'})`
      : `Remove exam: ${course ? course.code : '?'}`,
    reason: hasDeps
      ? `This exam has <strong>${enrollments.length} student enrollment(s)</strong> attached.`
      : `This exam has no attached records — safe to delete.`,
    cascade: hasDeps
      ? enrollments.map(en => {
          const s = helpers.getUser(en.studentId);
          return `Enrollment: ${s ? s.name : '?'} (${s ? s.loginId : '?'})`;
        })
      : [],
    onDelete: async () => {
      await DB.deleteExam(examId);
      DATA.exams = DATA.exams.filter(e => e.id !== examId);
      DATA.enrollments = DATA.enrollments.filter(en => en.examId !== examId);
      const action = hasDeps ? 'FORCE_DELETE' : 'DELETE';
      const summary = hasDeps
        ? `Force-deleted exam: ${course ? course.code : '?'} on ${exam.date} — also removed ${enrollments.length} enrollment(s)`
        : `Deleted exam: ${course ? course.code : '?'} on ${exam.date}`;
      await logAudit(action, 'exam', examId, summary,
        { examId, courseCode: course ? course.code : null, date: exam.date, cascadedEnrollments: enrollments.length });
    },
  });
}

async function deleteStudent(id) {
  const u = helpers.getUser(id);
  if (!u) return;
  const enrollments = DATA.enrollments.filter(en => en.studentId === id);
  const hasDeps = enrollments.length > 0;

  openDeleteModal({
    entity: 'student',
    entityId: id,
    blocked: hasDeps,
    adminOnly: false,
    title: hasDeps ? `Cannot remove ${u.name}` : `Remove student: ${u.name}`,
    reason: hasDeps
      ? `This student has <strong>${enrollments.length} exam enrollment(s)</strong> attached.`
      : `This student has no attached records — safe to delete.`,
    cascade: hasDeps
      ? enrollments.map(en => {
          const exam = DATA.exams.find(e => e.id === en.examId);
          const c = exam ? helpers.getCourse(exam.courseId) : null;
          return `Enrolled in: ${c ? c.code : '?'} on ${exam ? helpers.formatDate(exam.date) : '?'}`;
        })
      : [],
    onDelete: async () => {
      await DB.deleteUser(id);
      DATA.users = DATA.users.filter(x => x.id !== id);
      DATA.enrollments = DATA.enrollments.filter(en => en.studentId !== id);
      const action = hasDeps ? 'FORCE_DELETE' : 'DELETE';
      const summary = hasDeps
        ? `Force-deleted student: ${u.name} (${u.loginId}) — also removed ${enrollments.length} enrollment(s)`
        : `Deleted student: ${u.name} (${u.loginId})`;
      await logAudit(action, 'student', id, summary,
        { name: u.name, loginId: u.loginId, cascadedEnrollments: enrollments.length });
    },
  });
}

async function deleteTeacher(id) {
  const u = helpers.getUser(id);
  if (!u) return;
  const examsByTeacher = DATA.exams.filter(e => e.createdBy === id);
  const enrollmentCount = DATA.enrollments.filter(en =>
    examsByTeacher.some(e => e.id === en.examId)
  ).length;
  const hasDeps = examsByTeacher.length > 0;

  openDeleteModal({
    entity: 'teacher',
    entityId: id,
    blocked: hasDeps,
    adminOnly: true,
    title: hasDeps ? `Cannot remove ${u.name}` : `Remove teacher: ${u.name}`,
    reason: hasDeps
      ? `This teacher has <strong>${examsByTeacher.length} exam(s)</strong> scheduled, with <strong>${enrollmentCount} student enrollment(s)</strong> attached.`
      : `This teacher has no attached records — safe to delete.`,
    cascade: hasDeps
      ? examsByTeacher.map(e => {
          const c = helpers.getCourse(e.courseId);
          return `Exam: ${c ? c.code : '?'} on ${helpers.formatDate(e.date)}`;
        })
      : [],
    onDelete: async () => {
      for (const e of examsByTeacher) await DB.deleteExam(e.id);
      await DB.deleteUser(id);
      DATA.exams = DATA.exams.filter(e => e.createdBy !== id);
      DATA.enrollments = DATA.enrollments.filter(en =>
        !examsByTeacher.some(e => e.id === en.examId)
      );
      DATA.users = DATA.users.filter(x => x.id !== id);
      const action = hasDeps ? 'FORCE_DELETE' : 'DELETE';
      const summary = hasDeps
        ? `Force-deleted teacher: ${u.name} (${u.loginId}) — also removed ${examsByTeacher.length} exam(s) and ${enrollmentCount} enrollment(s)`
        : `Deleted teacher: ${u.name} (${u.loginId})`;
      await logAudit(action, 'teacher', id, summary,
        { name: u.name, loginId: u.loginId, cascadedExams: examsByTeacher.length, cascadedEnrollments: enrollmentCount });
    },
  });
}

async function deleteCourse(id) {
  const c = helpers.getCourse(id);
  if (!c) return;
  const examsForCourse = DATA.exams.filter(e => e.courseId === id);
  const enrollmentCount = DATA.enrollments.filter(en =>
    examsForCourse.some(e => e.id === en.examId)
  ).length;
  const hasDeps = examsForCourse.length > 0;

  openDeleteModal({
    entity: 'course',
    entityId: id,
    blocked: hasDeps,
    adminOnly: false,
    title: hasDeps ? `Cannot remove ${c.code} — ${c.title}` : `Remove subject: ${c.code} — ${c.title}`,
    reason: hasDeps
      ? `This subject has <strong>${examsForCourse.length} exam(s)</strong> scheduled, with <strong>${enrollmentCount} student enrollment(s)</strong> attached.`
      : `This subject has no attached records — safe to delete.`,
    cascade: hasDeps
      ? examsForCourse.map(e => `Exam: ${c.code} on ${helpers.formatDate(e.date)} (${e.shift})`)
      : [],
    onDelete: async () => {
      for (const e of examsForCourse) await DB.deleteExam(e.id);
      await DB.deleteCourse(id);
      DATA.exams = DATA.exams.filter(e => e.courseId !== id);
      DATA.enrollments = DATA.enrollments.filter(en =>
        !examsForCourse.some(e => e.id === en.examId)
      );
      DATA.courses = DATA.courses.filter(x => x.id !== id);
      const action = hasDeps ? 'FORCE_DELETE' : 'DELETE';
      const summary = hasDeps
        ? `Force-deleted subject: ${c.code} ${c.title} — also removed ${examsForCourse.length} exam(s) and ${enrollmentCount} enrollment(s)`
        : `Deleted subject: ${c.code} ${c.title}`;
      await logAudit(action, 'course', id, summary,
        { code: c.code, title: c.title, cascadedExams: examsForCourse.length, cascadedEnrollments: enrollmentCount });
    },
  });
}

async function deleteDepartment(id) {
  const d = helpers.getDepartment(id);
  if (!d) return;
  const coursesInDept = DATA.courses.filter(c => c.departmentId === id);
  const usersInDept = DATA.users.filter(u => u.departmentId === id);
  const examsInDept = DATA.exams.filter(e =>
    coursesInDept.some(c => c.id === e.courseId)
  );
  const enrollmentCount = DATA.enrollments.filter(en =>
    examsInDept.some(e => e.id === en.examId) ||
    usersInDept.some(u => u.id === en.studentId)
  ).length;
  const hasDeps = coursesInDept.length > 0 || usersInDept.length > 0;

  const cascade = [];
  if (coursesInDept.length) cascade.push(`${coursesInDept.length} subject(s)`);
  if (examsInDept.length) cascade.push(`${examsInDept.length} exam(s)`);
  if (usersInDept.length) cascade.push(`${usersInDept.length} user(s)`);
  if (enrollmentCount) cascade.push(`${enrollmentCount} enrollment(s)`);

  openDeleteModal({
    entity: 'department',
    entityId: id,
    blocked: hasDeps,
    adminOnly: true,
    title: hasDeps ? `Cannot remove ${d.code} — ${d.name}` : `Remove department: ${d.code} — ${d.name}`,
    reason: hasDeps
      ? `This department has <strong>${coursesInDept.length} subject(s)</strong> and <strong>${usersInDept.length} user(s)</strong> attached.`
      : `This department has no attached records — safe to delete.`,
    cascade: hasDeps && cascade.length ? ['Will be removed: ' + cascade.join(', ')] : [],
    onDelete: async () => {
      for (const u of usersInDept) await DB.deleteUser(u.id);
      for (const e of examsInDept) await DB.deleteExam(e.id);
      for (const c of coursesInDept) await DB.deleteCourse(c.id);
      await DB.deleteDepartment(id);
      DATA.users = DATA.users.filter(u => u.departmentId !== id);
      DATA.exams = DATA.exams.filter(e => !examsInDept.some(x => x.id === e.id));
      DATA.enrollments = DATA.enrollments.filter(en =>
        !examsInDept.some(e => e.id === en.examId) &&
        !usersInDept.some(u => u.id === en.studentId)
      );
      DATA.courses = DATA.courses.filter(c => c.departmentId !== id);
      DATA.departments = DATA.departments.filter(x => x.id !== id);
      const action = hasDeps ? 'FORCE_DELETE' : 'DELETE';
      const summary = hasDeps
        ? `Force-deleted department: ${d.code} ${d.name} — cascaded ${cascade.join(', ')}`
        : `Deleted department: ${d.code} ${d.name}`;
      await logAudit(action, 'department', id, summary,
        { code: d.code, name: d.name, cascadedCourses: coursesInDept.length, cascadedUsers: usersInDept.length, cascadedExams: examsInDept.length, cascadedEnrollments: enrollmentCount });
    },
  });
}

/* ---------- Unified Delete Modal ---------- */
let _pendingDelete = null;

function openDeleteModal(opts) {
  // Permission check: adminOnly entities require admin role
  const me = Session.get();
  if (opts.adminOnly && me && me.role !== 'ADMIN') {
    alert(`Only admins can delete ${opts.entity}s. Please ask an administrator.`);
    return;
  }
  _pendingDelete = opts;

  // Header style: red/warning when blocked, neutral when safe
  const header = document.getElementById('force-delete-header');
  const eyebrow = document.getElementById('force-delete-eyebrow');
  if (opts.blocked) {
    header.style.background = '#FBEBE7';
    header.style.borderBottom = '1px solid #F2C5BC';
    eyebrow.textContent = '⚠ Has dependencies';
    eyebrow.style.color = 'var(--terracotta)';
  } else {
    header.style.background = 'var(--cream-warm)';
    header.style.borderBottom = '1px solid var(--line)';
    eyebrow.textContent = '○ Confirm delete';
    eyebrow.style.color = 'var(--ink-muted)';
  }

  document.getElementById('force-delete-title').textContent = opts.title;
  document.getElementById('force-delete-reason').innerHTML = opts.reason;

  const cascadeEl = document.getElementById('force-delete-cascade');
  if (opts.cascade && opts.cascade.length) {
    cascadeEl.innerHTML = `
      <p class="text-xs" style="text-transform:uppercase;letter-spacing:0.1em;color:var(--ink-muted);margin:16px 0 8px;font-weight:600;">Will be cascaded:</p>
      <ul style="margin:0;padding-left:20px;font-size:13px;color:var(--ink-soft);line-height:1.7;">
        ${opts.cascade.map(item => `<li>${item}</li>`).join('')}
      </ul>`;
  } else {
    cascadeEl.innerHTML = '';
  }

  // Warning box only shows when blocked
  const warnBox = document.getElementById('force-delete-warning');
  if (warnBox) warnBox.style.display = opts.blocked ? '' : 'none';

  document.getElementById('force-delete-result').innerHTML = '';
  const btn = document.getElementById('force-delete-confirm');
  btn.disabled = false;
  btn.textContent = opts.blocked ? 'Force Delete' : 'Delete';
  openModal('force-delete-modal');
}

async function executeForceDelete() {
  if (!_pendingDelete) return;
  const opts = _pendingDelete;
  const btn = document.getElementById('force-delete-confirm');
  const resultEl = document.getElementById('force-delete-result');
  const originalLabel = btn.textContent;
  btn.disabled = true;
  btn.textContent = 'Deleting…';
  resultEl.innerHTML = `<div class="alert alert-info"><div><p class="alert-body">Removing from database…</p></div></div>`;
  try {
    await opts.onDelete();
    resultEl.innerHTML = `<div class="alert alert-success"><div><p class="alert-title">${opts.blocked ? 'Force delete complete' : 'Delete complete'}</p><p class="alert-body">${opts.blocked ? 'All cascaded records removed' : 'Record removed'} from database ✓</p></div></div>`;
    if (typeof refreshCurrentView === 'function') refreshCurrentView();
    setTimeout(() => {
      closeModal('force-delete-modal');
      _pendingDelete = null;
    }, 1000);
  } catch (err) {
    resultEl.innerHTML = `<div class="alert alert-error"><div><p class="alert-title">Database error</p><p class="alert-body">${err.message}</p></div></div>`;
    btn.disabled = false;
    btn.textContent = originalLabel;
  }
}

/* ---------- Force Edit Modal ---------- */
let _pendingForceEdit = null;

function openForceEditModal(opts) {
  _pendingForceEdit = opts;
  document.getElementById('force-edit-title').textContent = opts.title;
  document.getElementById('force-edit-reason').innerHTML = opts.reason;
  openModal('force-edit-modal');
}

function executeForceEdit() {
  if (!_pendingForceEdit) return;
  const opts = _pendingForceEdit;
  closeModal('force-edit-modal');
  _pendingForceEdit = null;
  // Open the actual edit modal in force mode after a brief tick
  setTimeout(() => opts.onForceEdit(), 180);
}

/* ---------- Un-enroll a student from an exam ---------- */
async function unenrollStudent(enrollmentId) {
  const en = DATA.enrollments.find(x => x.id === enrollmentId);
  if (!en) return;
  const student = helpers.getUser(en.studentId);
  const exam = DATA.exams.find(e => e.id === en.examId);
  const course = exam ? helpers.getCourse(exam.courseId) : null;
  if (!confirm(`Remove ${student ? student.name : 'this student'} from ${course ? course.code : 'this exam'}?`)) return;
  try {
    await DB.deleteEnrollment(enrollmentId);
    DATA.enrollments = DATA.enrollments.filter(x => x.id !== enrollmentId);
    await logAudit('UNENROLL', 'enrollment', enrollmentId,
      `Unenrolled ${student ? student.name : '?'} from ${course ? course.code : '?'}`,
      { studentId: en.studentId, examId: en.examId, courseCode: course && course.code });
    if (typeof refreshCurrentView === 'function') refreshCurrentView();
    // Also refresh the modal if it's open
    const examModal = document.getElementById('exam-enrollments-modal');
    if (examModal && examModal.classList.contains('open')) {
      openExamEnrollmentsModal(en.examId);
    }
  } catch (err) { alert(`Error: ${err.message}`); }
}

/* ---------- Show all students enrolled in a specific exam ---------- */
function openExamEnrollmentsModal(examId) {
  const info = helpers.hydrateExam(examId);
  if (!info) return;
  const enrollments = DATA.enrollments.filter(en => en.examId === examId);

  document.getElementById('exam-enrollments-info').innerHTML = `
    <span class="course-code">${info.course.code}</span> — <strong>${info.course.title}</strong><br>
    <span class="text-sm text-muted mono">${helpers.formatDateLong(info.date)} · ${info.shift} · ${helpers.formatTime(info.startTime)}–${helpers.formatTime(info.endTime)}</span>
  `;

  const tbody = document.getElementById('exam-enrollments-body');
  if (enrollments.length === 0) {
    tbody.innerHTML = `<tr><td colspan="4" class="table-empty">No students enrolled.</td></tr>`;
  } else {
    tbody.innerHTML = enrollments.map(en => {
      const s = helpers.getUser(en.studentId);
      if (!s) return '';
      const dept = helpers.getDepartment(s.departmentId);
      const sem = helpers.getSemester(s.currentSemesterId);
      return `
        <tr>
          <td>
            <div class="flex gap-sm" style="align-items:center;">
              <div class="avatar" style="width:30px;height:30px;font-size:11px;">${helpers.getInitials(s.name)}</div>
              <strong>${s.name}</strong>
            </div>
          </td>
          <td class="mono text-sm">${s.loginId}</td>
          <td class="text-sm">${dept ? dept.code : '—'} · Sem ${sem ? sem.number : '—'}</td>
          <td><button class="btn btn-danger btn-sm" onclick="unenrollStudent(${en.id})">Remove</button></td>
        </tr>`;
    }).join('');
  }
  openModal('exam-enrollments-modal');
}

/* ---------- Enroll modal ---------- */
let currentEnrollExamId = null;

function openEnrollModal(examId) {
  currentEnrollExamId = examId;
  const info = helpers.hydrateExam(examId);
  document.getElementById('enroll-exam-info').innerHTML = `
    <span class="course-code">${info.course.code}</span> — <strong>${info.course.title}</strong><br>
    <span class="text-sm text-muted mono">${helpers.formatDateLong(info.date)} · ${info.shift} · ${helpers.formatTime(info.startTime)}–${helpers.formatTime(info.endTime)}</span>
  `;
  const select = document.getElementById('enroll-student-select');
  select.innerHTML = '<option value="">— Choose a student —</option>' +
    helpers.getStudents().map(s => {
      const dept = helpers.getDepartment(s.departmentId);
      const sem = helpers.getSemester(s.currentSemesterId);
      return `<option value="${s.id}">${s.name} · ${s.loginId} · ${dept ? dept.code : '—'} Sem ${sem ? sem.number : '—'}</option>`;
    }).join('');
  document.getElementById('enroll-result').innerHTML = '';
  openModal('enroll-modal');
}

async function attemptEnroll() {
  const studentId = parseInt(document.getElementById('enroll-student-select').value);
  const resultEl = document.getElementById('enroll-result');
  if (!studentId) {
    resultEl.innerHTML = `<div class="alert alert-warning"><div><p class="alert-body">Please select a student.</p></div></div>`;
    return;
  }
  const exam = DATA.exams.find(e => e.id === currentEnrollExamId);

  const semCheck = helpers.checkSemesterRule(studentId, currentEnrollExamId);
  if (!semCheck.allowed) {
    resultEl.innerHTML = `<div class="alert alert-error"><div><p class="alert-title">Semester eligibility violated</p><p class="alert-body">${semCheck.reason}</p></div></div>`;
    return;
  }
  const clash = helpers.checkClash(studentId, exam.date);
  if (clash.hasConflict) {
    resultEl.innerHTML = `<div class="alert alert-error"><div><p class="alert-title">Same-day conflict detected</p><p class="alert-body">Student is already enrolled in <strong>${clash.course.code} — ${clash.course.title}</strong> on ${helpers.formatDateLong(exam.date)}. Two exams on the same day is not allowed.</p></div></div>`;
    return;
  }
  if (DATA.enrollments.find(en => en.studentId === studentId && en.examId === currentEnrollExamId)) {
    resultEl.innerHTML = `<div class="alert alert-warning"><div><p class="alert-body">This student is already enrolled in this exam.</p></div></div>`;
    return;
  }

  resultEl.innerHTML = `<div class="alert alert-info"><div><p class="alert-body">Enrolling…</p></div></div>`;
  try {
    const newEnrollment = await DB.createEnrollment(studentId, currentEnrollExamId);
    DATA.enrollments.push(newEnrollment);
    const student = helpers.getUser(studentId);
    const course = helpers.getCourse(exam.courseId);
    await logAudit('ENROLL', 'enrollment', newEnrollment.id,
      `Enrolled ${student.name} in ${course.code}`,
      { studentId, examId: currentEnrollExamId, courseCode: course.code });
    resultEl.innerHTML = `<div class="alert alert-success"><div><p class="alert-title">Enrolled successfully</p><p class="alert-body"><strong>${student.name}</strong> has been added to this exam and saved to database.</p></div></div>`;
    if (typeof refreshCurrentView === 'function') refreshCurrentView();
  } catch (err) {
    resultEl.innerHTML = `<div class="alert alert-error"><div><p class="alert-title">Database error</p><p class="alert-body">${err.message}</p></div></div>`;
  }
}

/* ---------- Add Exam ---------- */
function setupAddExamForm(user) {
  const form = document.getElementById('add-exam-form');
  if (!form) return;
  const courseSelect = document.getElementById('exam-course-select');
  courseSelect.innerHTML = '<option value="">— Select course —</option>' +
    DATA.courses.map(c => {
      const dept = helpers.getDepartment(c.departmentId);
      const sem = helpers.getSemester(c.semesterId);
      return `<option value="${c.id}">${c.code} — ${c.title} (${dept ? dept.code : '—'}, Sem ${sem ? sem.number : '—'})</option>`;
    }).join('');

  form.onsubmit = async (event) => {
    event.preventDefault();
    const resultEl = document.getElementById('add-exam-result');
    const courseId = parseInt(form.course.value);
    const date = form.date.value;
    const shift = form.shift.value;
    const startTime = form.startTime.value;
    const endTime = form.endTime.value;
    const type = form.type.value;

    if (startTime >= endTime) {
      resultEl.innerHTML = `<div class="alert alert-error"><div><p class="alert-title">Invalid time</p><p class="alert-body">End time must be later than start time.</p></div></div>`;
      return;
    }

    resultEl.innerHTML = `<div class="alert alert-info"><div><p class="alert-body">Saving to database…</p></div></div>`;
    try {
      const newExam = await DB.createExam({ courseId, date, shift, startTime, endTime, type, createdBy: user.id });
      DATA.exams.push(newExam);
      const course = helpers.getCourse(courseId);
      await logAudit('CREATE', 'exam', newExam.id,
        `Created exam: ${course.code} on ${date} (${shift})`,
        { courseCode: course.code, date, shift, type });
      resultEl.innerHTML = `<div class="alert alert-success"><div><p class="alert-title">Exam created</p><p class="alert-body">Saved to database ✓</p></div></div>`;
      form.reset();
      if (typeof refreshCurrentView === 'function') refreshCurrentView();
      setTimeout(() => closeModal('add-exam-modal'), 900);
    } catch (err) {
      resultEl.innerHTML = `<div class="alert alert-error"><div><p class="alert-title">Database error</p><p class="alert-body">${err.message}</p></div></div>`;
    }
  };
}

function openAddExamModal() {
  const form = document.getElementById('add-exam-form');
  if (form) form.reset();
  document.getElementById('add-exam-result').innerHTML = '';
  openModal('add-exam-modal');
}

/* ---------- Edit Exam ---------- */
function openEditExamModal(examId) {
  const exam = DATA.exams.find(e => e.id === examId);
  if (!exam) return;

  // Permission check: teacher trying to edit another teacher's exam
  const me = Session.get();
  if (me && me.role === 'TEACHER' && exam.createdBy !== me.id) {
    const creator = helpers.getUser(exam.createdBy);
    const course = helpers.getCourse(exam.courseId);
    openForceEditModal({
      title: 'Not your exam',
      reason: `This exam — <strong>${course ? course.code : '?'}</strong> on ${helpers.formatDate(exam.date)} — was created by <strong>${creator ? creator.name : 'another user'}</strong>. You can still edit it, but the change will be flagged in the audit log.`,
      onForceEdit: () => _doOpenEditExamModal(examId, true),
    });
    return;
  }

  _doOpenEditExamModal(examId, false);
}

function _doOpenEditExamModal(examId, isForce) {
  const exam = DATA.exams.find(e => e.id === examId);
  if (!exam) return;
  const form = document.getElementById('edit-exam-form');
  form.dataset.examId = examId;
  form.dataset.force = isForce ? '1' : '0';

  // Populate course dropdown
  const courseSelect = form.querySelector('[name="course"]');
  courseSelect.innerHTML = DATA.courses.map(c => {
    const dept = helpers.getDepartment(c.departmentId);
    const sem = helpers.getSemester(c.semesterId);
    return `<option value="${c.id}" ${c.id === exam.courseId ? 'selected' : ''}>${c.code} — ${c.title} (${dept ? dept.code : '—'}, Sem ${sem ? sem.number : '—'})</option>`;
  }).join('');

  form.querySelector('[name="date"]').value = exam.date;
  form.querySelector('[name="shift"]').value = exam.shift;
  form.querySelector('[name="startTime"]').value = exam.startTime;
  form.querySelector('[name="endTime"]').value = exam.endTime;
  form.querySelector('[name="type"]').value = exam.type;

  document.getElementById('edit-exam-result').innerHTML = '';
  // Show force-edit notice inside the form if it's a force edit
  const noticeEl = document.getElementById('edit-exam-force-notice');
  if (noticeEl) noticeEl.style.display = isForce ? '' : 'none';
  openModal('edit-exam-modal');
}

async function handleEditExamSubmit(event) {
  event.preventDefault();
  const form = event.target;
  const examId = parseInt(form.dataset.examId);
  const isForce = form.dataset.force === '1';
  const resultEl = document.getElementById('edit-exam-result');
  const old = DATA.exams.find(e => e.id === examId);

  const updates = {
    courseId: parseInt(form.course.value),
    date: form.date.value,
    shift: form.shift.value,
    startTime: form.startTime.value,
    endTime: form.endTime.value,
    type: form.type.value,
  };
  if (updates.startTime >= updates.endTime) {
    resultEl.innerHTML = `<div class="alert alert-error"><div><p class="alert-title">Invalid time</p><p class="alert-body">End time must be later than start time.</p></div></div>`;
    return;
  }

  resultEl.innerHTML = `<div class="alert alert-info"><div><p class="alert-body">Saving to database…</p></div></div>`;
  try {
    const updated = await DB.updateExam(examId, updates);
    const idx = DATA.exams.findIndex(e => e.id === examId);
    DATA.exams[idx] = updated;
    const course = helpers.getCourse(updated.courseId);
    const action = isForce ? 'FORCE_UPDATE' : 'UPDATE';
    const summary = isForce
      ? `Force-edited exam (not creator): ${course.code} on ${updated.date}`
      : `Edited exam: ${course.code} on ${updated.date}`;
    await logAudit(action, 'exam', examId, summary, { before: old, after: updated, forceEdit: isForce });
    resultEl.innerHTML = `<div class="alert alert-success"><div><p class="alert-title">Exam updated</p><p class="alert-body">Saved to database ✓</p></div></div>`;
    if (typeof refreshCurrentView === 'function') refreshCurrentView();
    setTimeout(() => closeModal('edit-exam-modal'), 900);
  } catch (err) {
    resultEl.innerHTML = `<div class="alert alert-error"><div><p class="alert-title">Database error</p><p class="alert-body">${err.message}</p></div></div>`;
  }
}

/* ---------- Add Student ---------- */
function setupAddStudentForm() {
  const form = document.getElementById('add-student-form');
  if (!form) return;
  form.querySelector('[name="departmentId"]').innerHTML =
    '<option value="">— Department —</option>' +
    DATA.departments.map(d => `<option value="${d.id}">${d.code} — ${d.name}</option>`).join('');
  form.querySelector('[name="semesterId"]').innerHTML =
    '<option value="">— Current semester —</option>' +
    DATA.semesters.map(s => `<option value="${s.id}">${s.label}</option>`).join('');

  form.onsubmit = async (event) => {
    event.preventDefault();
    const resultEl = document.getElementById('add-student-result');
    const loginId = form.loginId.value.trim();
    const name = form.name.value.trim();
    const email = form.email.value.trim();
    const departmentId = parseInt(form.departmentId.value);
    const semesterId = parseInt(form.semesterId.value);
    const password = form.password.value || 'merciful';

    if (DATA.users.find(u => u.loginId.toLowerCase() === loginId.toLowerCase())) {
      resultEl.innerHTML = `<div class="alert alert-error"><div><p class="alert-body">A user with ID "${loginId}" already exists.</p></div></div>`;
      return;
    }

    resultEl.innerHTML = `<div class="alert alert-info"><div><p class="alert-body">Saving to database…</p></div></div>`;
    try {
      const newUser = await DB.createUser({
        role: 'STUDENT', loginId, password, name, email,
        departmentId, currentSemesterId: semesterId,
      });
      DATA.users.push(newUser);
      await logAudit('CREATE', 'student', newUser.id,
        `Added student: ${name} (${loginId})`, { name, loginId });
      resultEl.innerHTML = `<div class="alert alert-success"><div><p class="alert-title">Student added</p><p class="alert-body">${name} (${loginId}) saved to database ✓</p></div></div>`;
      form.reset();
      if (typeof refreshCurrentView === 'function') refreshCurrentView();
      setTimeout(() => closeModal('add-student-modal'), 900);
    } catch (err) {
      resultEl.innerHTML = `<div class="alert alert-error"><div><p class="alert-title">Database error</p><p class="alert-body">${err.message}</p></div></div>`;
    }
  };
}

function openAddStudentModal() {
  const form = document.getElementById('add-student-form');
  if (form) form.reset();
  document.getElementById('add-student-result').innerHTML = '';
  openModal('add-student-modal');
}

/* ---------- Edit Student ---------- */
function openEditStudentModal(studentId) {
  const u = helpers.getUser(studentId);
  if (!u) return;
  const form = document.getElementById('edit-student-form');
  form.dataset.userId = studentId;

  form.querySelector('[name="departmentId"]').innerHTML =
    DATA.departments.map(d => `<option value="${d.id}" ${d.id === u.departmentId ? 'selected' : ''}>${d.code} — ${d.name}</option>`).join('');
  form.querySelector('[name="semesterId"]').innerHTML =
    DATA.semesters.map(s => `<option value="${s.id}" ${s.id === u.currentSemesterId ? 'selected' : ''}>${s.label}</option>`).join('');

  form.querySelector('[name="loginId"]').value = u.loginId;
  form.querySelector('[name="name"]').value = u.name;
  form.querySelector('[name="email"]').value = u.email || '';
  form.querySelector('[name="password"]').value = '';

  document.getElementById('edit-student-result').innerHTML = '';
  openModal('edit-student-modal');
}

async function handleEditStudentSubmit(event) {
  event.preventDefault();
  const form = event.target;
  const userId = parseInt(form.dataset.userId);
  const resultEl = document.getElementById('edit-student-result');
  const old = helpers.getUser(userId);

  const updates = {
    loginId: form.loginId.value.trim(),
    name: form.name.value.trim(),
    email: form.email.value.trim(),
    departmentId: parseInt(form.departmentId.value),
    currentSemesterId: parseInt(form.semesterId.value),
  };
  if (form.password.value.trim()) updates.password = form.password.value.trim();

  if (DATA.users.find(u => u.id !== userId && u.loginId.toLowerCase() === updates.loginId.toLowerCase())) {
    resultEl.innerHTML = `<div class="alert alert-error"><div><p class="alert-body">A user with ID "${updates.loginId}" already exists.</p></div></div>`;
    return;
  }

  resultEl.innerHTML = `<div class="alert alert-info"><div><p class="alert-body">Saving to database…</p></div></div>`;
  try {
    const updated = await DB.updateUser(userId, updates);
    const idx = DATA.users.findIndex(u => u.id === userId);
    DATA.users[idx] = updated;
    await logAudit('UPDATE', 'student', userId,
      `Edited student: ${updated.name} (${updated.loginId})`,
      { before: { name: old.name, loginId: old.loginId, email: old.email },
        after: { name: updated.name, loginId: updated.loginId, email: updated.email } });
    resultEl.innerHTML = `<div class="alert alert-success"><div><p class="alert-title">Student updated</p><p class="alert-body">Saved to database ✓</p></div></div>`;
    if (typeof refreshCurrentView === 'function') refreshCurrentView();
    setTimeout(() => closeModal('edit-student-modal'), 900);
  } catch (err) {
    resultEl.innerHTML = `<div class="alert alert-error"><div><p class="alert-title">Database error</p><p class="alert-body">${err.message}</p></div></div>`;
  }
}

/* ---------- Add Teacher ---------- */
function setupAddTeacherForm() {
  const form = document.getElementById('add-teacher-form');
  if (!form) return;
  form.querySelector('[name="departmentId"]').innerHTML =
    '<option value="">— Department —</option>' +
    DATA.departments.map(d => `<option value="${d.id}">${d.code} — ${d.name}</option>`).join('');

  form.onsubmit = async (event) => {
    event.preventDefault();
    const resultEl = document.getElementById('add-teacher-result');
    const loginId = form.loginId.value.trim();
    const name = form.name.value.trim();
    const email = form.email.value.trim();
    const departmentId = parseInt(form.departmentId.value);

    if (DATA.users.find(u => u.loginId.toLowerCase() === loginId.toLowerCase())) {
      resultEl.innerHTML = `<div class="alert alert-error"><div><p class="alert-body">A user with ID "${loginId}" already exists.</p></div></div>`;
      return;
    }
    resultEl.innerHTML = `<div class="alert alert-info"><div><p class="alert-body">Saving to database…</p></div></div>`;
    try {
      const newUser = await DB.createUser({
        role: 'TEACHER', loginId, password: 'merciful', name, email, departmentId,
        currentSemesterId: null,
      });
      DATA.users.push(newUser);
      await logAudit('CREATE', 'teacher', newUser.id,
        `Added teacher: ${name} (${loginId})`, { name, loginId });
      resultEl.innerHTML = `<div class="alert alert-success"><div><p class="alert-title">Teacher added</p><p class="alert-body">${name} (${loginId}) saved to database ✓</p></div></div>`;
      form.reset();
      if (typeof refreshCurrentView === 'function') refreshCurrentView();
      setTimeout(() => closeModal('add-teacher-modal'), 900);
    } catch (err) {
      resultEl.innerHTML = `<div class="alert alert-error"><div><p class="alert-title">Database error</p><p class="alert-body">${err.message}</p></div></div>`;
    }
  };
}

function openAddTeacherModal() {
  const form = document.getElementById('add-teacher-form');
  if (form) form.reset();
  document.getElementById('add-teacher-result').innerHTML = '';
  openModal('add-teacher-modal');
}

/* ---------- Edit Teacher ---------- */
function openEditTeacherModal(teacherId) {
  const u = helpers.getUser(teacherId);
  if (!u) return;

  // Permission check: teacher trying to edit a different teacher
  const me = Session.get();
  if (me && me.role === 'TEACHER' && teacherId !== me.id) {
    openForceEditModal({
      title: 'Not your profile',
      reason: `You're about to edit <strong>${u.name}</strong> (${u.loginId}), which isn't your own account. The change will be flagged in the audit log.`,
      onForceEdit: () => _doOpenEditTeacherModal(teacherId, true),
    });
    return;
  }

  _doOpenEditTeacherModal(teacherId, false);
}

function _doOpenEditTeacherModal(teacherId, isForce) {
  const u = helpers.getUser(teacherId);
  if (!u) return;
  const form = document.getElementById('edit-teacher-form');
  form.dataset.userId = teacherId;
  form.dataset.force = isForce ? '1' : '0';

  form.querySelector('[name="departmentId"]').innerHTML =
    DATA.departments.map(d => `<option value="${d.id}" ${d.id === u.departmentId ? 'selected' : ''}>${d.code} — ${d.name}</option>`).join('');

  form.querySelector('[name="loginId"]').value = u.loginId;
  form.querySelector('[name="name"]').value = u.name;
  form.querySelector('[name="email"]').value = u.email || '';
  form.querySelector('[name="password"]').value = '';

  document.getElementById('edit-teacher-result').innerHTML = '';
  const noticeEl = document.getElementById('edit-teacher-force-notice');
  if (noticeEl) noticeEl.style.display = isForce ? '' : 'none';
  openModal('edit-teacher-modal');
}

async function handleEditTeacherSubmit(event) {
  event.preventDefault();
  const form = event.target;
  const userId = parseInt(form.dataset.userId);
  const isForce = form.dataset.force === '1';
  const resultEl = document.getElementById('edit-teacher-result');
  const old = helpers.getUser(userId);

  const updates = {
    loginId: form.loginId.value.trim(),
    name: form.name.value.trim(),
    email: form.email.value.trim(),
    departmentId: parseInt(form.departmentId.value),
  };
  if (form.password.value.trim()) updates.password = form.password.value.trim();

  if (DATA.users.find(u => u.id !== userId && u.loginId.toLowerCase() === updates.loginId.toLowerCase())) {
    resultEl.innerHTML = `<div class="alert alert-error"><div><p class="alert-body">A user with ID "${updates.loginId}" already exists.</p></div></div>`;
    return;
  }
  resultEl.innerHTML = `<div class="alert alert-info"><div><p class="alert-body">Saving to database…</p></div></div>`;
  try {
    const updated = await DB.updateUser(userId, updates);
    const idx = DATA.users.findIndex(u => u.id === userId);
    DATA.users[idx] = updated;
    await logAudit(isForce ? 'FORCE_UPDATE' : 'UPDATE', 'teacher', userId,
      isForce
        ? `Force-edited teacher (not self): ${updated.name} (${updated.loginId})`
        : `Edited teacher: ${updated.name} (${updated.loginId})`,
      { before: { name: old.name, loginId: old.loginId }, after: { name: updated.name, loginId: updated.loginId }, forceEdit: isForce });
    resultEl.innerHTML = `<div class="alert alert-success"><div><p class="alert-title">Teacher updated</p><p class="alert-body">Saved to database ✓</p></div></div>`;
    if (typeof refreshCurrentView === 'function') refreshCurrentView();
    setTimeout(() => closeModal('edit-teacher-modal'), 900);
  } catch (err) {
    resultEl.innerHTML = `<div class="alert alert-error"><div><p class="alert-title">Database error</p><p class="alert-body">${err.message}</p></div></div>`;
  }
}

/* ---------- Edit Admin (self) ---------- */
function openEditAdminModal() {
  const me = Session.get();
  const u = helpers.getUser(me.id);
  if (!u) return;
  const form = document.getElementById('edit-admin-form');

  form.querySelector('[name="loginId"]').value = u.loginId;
  form.querySelector('[name="name"]').value = u.name;
  form.querySelector('[name="email"]').value = u.email || '';
  form.querySelector('[name="password"]').value = '';

  document.getElementById('edit-admin-result').innerHTML = '';
  openModal('edit-admin-modal');
}

async function handleEditAdminSubmit(event) {
  event.preventDefault();
  const form = event.target;
  const me = Session.get();
  const userId = me.id;
  const resultEl = document.getElementById('edit-admin-result');
  const old = helpers.getUser(userId);

  const updates = {
    loginId: form.loginId.value.trim(),
    name: form.name.value.trim(),
    email: form.email.value.trim(),
  };
  if (form.password.value.trim()) updates.password = form.password.value.trim();

  if (DATA.users.find(u => u.id !== userId && u.loginId.toLowerCase() === updates.loginId.toLowerCase())) {
    resultEl.innerHTML = `<div class="alert alert-error"><div><p class="alert-body">A user with ID "${updates.loginId}" already exists.</p></div></div>`;
    return;
  }
  resultEl.innerHTML = `<div class="alert alert-info"><div><p class="alert-body">Saving to database…</p></div></div>`;
  try {
    const updated = await DB.updateUser(userId, updates);
    const idx = DATA.users.findIndex(u => u.id === userId);
    DATA.users[idx] = updated;
    Session.set(updated); // refresh stored session
    await logAudit('UPDATE', 'admin', userId,
      `Admin edited own profile: ${updated.name}`,
      { before: { name: old.name, loginId: old.loginId }, after: { name: updated.name, loginId: updated.loginId } });
    resultEl.innerHTML = `<div class="alert alert-success"><div><p class="alert-title">Profile updated</p><p class="alert-body">Saved to database ✓</p></div></div>`;
    if (typeof refreshCurrentView === 'function') refreshCurrentView();
    setTimeout(() => closeModal('edit-admin-modal'), 900);
  } catch (err) {
    resultEl.innerHTML = `<div class="alert alert-error"><div><p class="alert-title">Database error</p><p class="alert-body">${err.message}</p></div></div>`;
  }
}

/* ---------- Add Subject/Course ---------- */
function setupAddCourseForm() {
  const form = document.getElementById('add-course-form');
  if (!form) return;
  const deptSelect = form.querySelector('[name="departmentId"]');
  deptSelect.innerHTML = '<option value="">— Department —</option>' +
    DATA.departments.map(d => `<option value="${d.id}">${d.code} — ${d.name}</option>`).join('');
  const semSelect = form.querySelector('[name="semesterId"]');
  semSelect.innerHTML = '<option value="">— Semester —</option>' +
    DATA.semesters.map(s => `<option value="${s.id}">${s.label}</option>`).join('');

  const updateSuggested = () => {
    const deptId = parseInt(deptSelect.value);
    const semId = parseInt(semSelect.value);
    const suggestion = helpers.suggestNextCourseCode(deptId, semId);
    const codeInput = form.querySelector('[name="code"]');
    if (suggestion && !codeInput.dataset.userEdited) {
      codeInput.value = suggestion;
      codeInput.placeholder = suggestion;
    }
    const hint = document.getElementById('course-code-hint');
    if (hint) hint.textContent = suggestion
      ? `Suggested next code: ${suggestion} (format: DEPT + YEAR + SEM + SERIAL)`
      : 'Format: DEPT + YEAR + SEM + SERIAL — e.g. CSE2101';
  };
  deptSelect.addEventListener('change', updateSuggested);
  semSelect.addEventListener('change', updateSuggested);
  const codeInput = form.querySelector('[name="code"]');
  codeInput.addEventListener('input', () => { codeInput.dataset.userEdited = '1'; });

  form.onsubmit = async (event) => {
    event.preventDefault();
    const resultEl = document.getElementById('add-course-result');
    const code = form.code.value.trim().toUpperCase();
    const title = form.title.value.trim();
    const credit = parseFloat(form.credit.value);
    const departmentId = parseInt(form.departmentId.value);
    const semesterId = parseInt(form.semesterId.value);

    if (DATA.courses.find(c => c.code === code)) {
      resultEl.innerHTML = `<div class="alert alert-error"><div><p class="alert-body">A subject with code "${code}" already exists.</p></div></div>`;
      return;
    }
    resultEl.innerHTML = `<div class="alert alert-info"><div><p class="alert-body">Saving to database…</p></div></div>`;
    try {
      const newCourse = await DB.createCourse({ code, title, credit, semesterId, departmentId });
      DATA.courses.push(newCourse);
      await logAudit('CREATE', 'course', newCourse.id, `Added subject: ${code} ${title}`, { code, title });
      resultEl.innerHTML = `<div class="alert alert-success"><div><p class="alert-title">Subject added</p><p class="alert-body"><span class="course-code">${code}</span> — ${title} saved to database ✓</p></div></div>`;
      form.reset();
      delete codeInput.dataset.userEdited;
      if (typeof refreshCurrentView === 'function') refreshCurrentView();
      setTimeout(() => closeModal('add-course-modal'), 900);
    } catch (err) {
      resultEl.innerHTML = `<div class="alert alert-error"><div><p class="alert-title">Database error</p><p class="alert-body">${err.message}</p></div></div>`;
    }
  };
}

function openAddCourseModal() {
  const form = document.getElementById('add-course-form');
  if (form) {
    form.reset();
    const codeInput = form.querySelector('[name="code"]');
    if (codeInput) delete codeInput.dataset.userEdited;
  }
  document.getElementById('add-course-result').innerHTML = '';
  openModal('add-course-modal');
}

/* ---------- Add Department ---------- */
function setupAddDeptForm() {
  const form = document.getElementById('add-dept-form');
  if (!form) return;
  form.onsubmit = async (event) => {
    event.preventDefault();
    const resultEl = document.getElementById('add-dept-result');
    const code = form.code.value.trim().toUpperCase();
    const name = form.name.value.trim();
    if (DATA.departments.find(d => d.code === code)) {
      resultEl.innerHTML = `<div class="alert alert-error"><div><p class="alert-body">Department code "${code}" already exists.</p></div></div>`;
      return;
    }
    resultEl.innerHTML = `<div class="alert alert-info"><div><p class="alert-body">Saving to database…</p></div></div>`;
    try {
      const newDept = await DB.createDepartment({ code, name });
      DATA.departments.push(newDept);
      await logAudit('CREATE', 'department', newDept.id, `Added department: ${code} ${name}`, { code, name });
      resultEl.innerHTML = `<div class="alert alert-success"><div><p class="alert-title">Department added</p><p class="alert-body">${code} — ${name} saved to database ✓</p></div></div>`;
      form.reset();
      if (typeof refreshCurrentView === 'function') refreshCurrentView();
      setTimeout(() => closeModal('add-dept-modal'), 900);
    } catch (err) {
      resultEl.innerHTML = `<div class="alert alert-error"><div><p class="alert-title">Database error</p><p class="alert-body">${err.message}</p></div></div>`;
    }
  };
}

function openAddDeptModal() {
  const form = document.getElementById('add-dept-form');
  if (form) form.reset();
  document.getElementById('add-dept-result').innerHTML = '';
  openModal('add-dept-modal');
}

/* ---------- Audit Log render ---------- */
async function loadAuditLogs() {
  const tbody = document.getElementById('audit-log-body');
  if (!tbody) return;
  tbody.innerHTML = `<tr><td colspan="5" class="table-empty">Loading audit log…</td></tr>`;
  try {
    const logs = await DB.getAuditLogs(200);
    if (logs.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" class="table-empty">No activity yet.</td></tr>`;
      return;
    }
    tbody.innerHTML = logs.map(log => {
      const date = new Date(log.createdAt);
      const dateStr = date.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
      const actionColor = log.action === 'DELETE' ? 'badge-referred' :
                          log.action === 'CREATE' || log.action === 'ENROLL' ? 'badge-improvement' :
                          log.action === 'UPDATE' ? 'badge-pending' : 'badge-afternoon';
      return `
        <tr>
          <td class="text-sm mono">${dateStr}</td>
          <td>
            <strong>${log.actorName || 'System'}</strong>
            <div class="text-xs text-muted">${log.actorRole || ''}</div>
          </td>
          <td><span class="badge ${actionColor}">${log.action}</span></td>
          <td class="text-sm">${log.entity}</td>
          <td>${log.summary || '—'}</td>
        </tr>`;
    }).join('');
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="5" class="table-empty">Error loading: ${err.message}</td></tr>`;
  }
}

/* ---------- Init on every page ---------- */
document.addEventListener('DOMContentLoaded', () => {
  setupSidebarNav();
  setupModalBackdrop();
  setupMobileMenu();
});

/* ---------- Mobile menu toggle ---------- */
function setupMobileMenu() {
  const sidebar = document.querySelector('.sidebar');
  const navbar = document.querySelector('.navbar-inner');
  if (!sidebar || !navbar) return;

  // Inject hamburger button if not present
  if (!document.querySelector('.mobile-menu-btn')) {
    const btn = document.createElement('button');
    btn.className = 'mobile-menu-btn';
    btn.setAttribute('aria-label', 'Open menu');
    btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M3 12h18M3 18h18"/></svg>';
    btn.addEventListener('click', toggleSidebar);
    navbar.insertBefore(btn, navbar.firstChild);
  }

  // Inject backdrop overlay
  if (!document.querySelector('.sidebar-overlay')) {
    const overlay = document.createElement('div');
    overlay.className = 'sidebar-overlay';
    overlay.addEventListener('click', closeSidebar);
    document.body.appendChild(overlay);
  }

  // Auto-close sidebar when a nav item is tapped on mobile
  document.querySelectorAll('.sidebar-nav-item[data-target]').forEach(item => {
    item.addEventListener('click', () => {
      if (window.innerWidth <= 768) closeSidebar();
    });
  });
}

function toggleSidebar() {
  document.querySelector('.sidebar')?.classList.toggle('open');
  document.querySelector('.sidebar-overlay')?.classList.toggle('active');
}
function closeSidebar() {
  document.querySelector('.sidebar')?.classList.remove('open');
  document.querySelector('.sidebar-overlay')?.classList.remove('active');
}
