/* =========================================================
   RIBERMS — App Logic
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
      if (!role.includes(user.role)) {
        window.location.href = this.dashboardFor(user.role);
        return null;
      }
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

/* ---------- Login ---------- */
function handleLogin(event) {
  event.preventDefault();
  const form = event.target;
  const loginId = form.loginId.value.trim();
  const password = form.password.value;
  const role = document.querySelector('.role-option.active')?.dataset.role || 'STUDENT';

  const errorEl = document.getElementById('login-error');
  errorEl.style.display = 'none';

  const user = DATA.users.find(u =>
    u.loginId.toLowerCase() === loginId.toLowerCase() && u.role === role
  );

  if (!user) {
    showLoginError(`No ${role.toLowerCase()} found with ID "${loginId}". See demo IDs below.`);
    return;
  }

  if (!password) {
    showLoginError('Please enter your password.');
    return;
  }

  // Demo: accept any non-empty password for demo accounts
  // (or match stored password for stricter mode)
  if (user.password && user.password !== password && password !== 'demo') {
    // Accept either the stored demo password OR the literal word 'demo'
    // This matches the hint "password: demo"
    showLoginError('Incorrect password. Try "demo" for any demo account.');
    return;
  }

  Session.set(user);
  window.location.href = Session.dashboardFor(user.role);
}

function showLoginError(msg) {
  const el = document.getElementById('login-error');
  el.querySelector('.alert-body').textContent = msg;
  el.style.display = 'flex';
}

function setupRolePicker() {
  const picker = document.querySelector('.role-picker');
  if (!picker) return;

  picker.addEventListener('click', (e) => {
    const opt = e.target.closest('.role-option');
    if (!opt) return;
    picker.querySelectorAll('.role-option').forEach(o => o.classList.remove('active'));
    opt.classList.add('active');

    const hint = document.getElementById('demo-id-sample');
    if (hint) {
      const role = opt.dataset.role;
      hint.textContent = role === 'STUDENT' ? '180007' :
                         role === 'TEACHER' ? 'T-1042' :
                                              'ADMIN-01';
    }
    document.getElementById('loginId').placeholder =
      opt.dataset.role === 'STUDENT' ? 'e.g. 180007' :
      opt.dataset.role === 'TEACHER' ? 'e.g. T-1042' :
                                       'e.g. ADMIN-01';
  });
}

/* ---------- Logout ---------- */
function logout() {
  if (confirm('Sign out of RIBERMS?')) {
    Session.clear();
    window.location.href = 'login.html';
  }
}

/* ---------- Sidebar navigation ---------- */
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
function openModal(id) {
  const m = document.getElementById(id);
  if (m) m.classList.add('open');
}
function closeModal(id) {
  const m = document.getElementById(id);
  if (m) m.classList.remove('open');
}
function setupModalBackdrop() {
  document.querySelectorAll('.modal-backdrop').forEach(mb => {
    mb.addEventListener('click', (e) => {
      if (e.target === mb) mb.classList.remove('open');
    });
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal-backdrop.open').forEach(m => m.classList.remove('open'));
    }
  });
}

/* ---------- Student routine rendering ---------- */
function renderStudentRoutine(studentId, filters = {}) {
  let exams = helpers.getStudentExams(studentId);

  if (filters.shift) exams = exams.filter(e => e.shift === filters.shift);
  if (filters.type)  exams = exams.filter(e => e.type === filters.type);
  if (filters.search) {
    const q = filters.search.toLowerCase();
    exams = exams.filter(e =>
      e.course.code.toLowerCase().includes(q) ||
      e.course.title.toLowerCase().includes(q)
    );
  }

  exams.sort((a, b) => a.date.localeCompare(b.date));

  const tbody = document.querySelector('#student-routine-body');
  if (!tbody) return;

  if (exams.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" class="table-empty">No exams match your filters.</td></tr>`;
    return;
  }

  tbody.innerHTML = exams.map(e => `
    <tr>
      <td>
        <span class="course-code">${e.course.code}</span>
        <div class="text-sm" style="margin-top:4px;">${e.course.title}</div>
      </td>
      <td>${helpers.formatDate(e.date)}</td>
      <td><span class="badge badge-${e.shift.toLowerCase()}">${e.shift}</span></td>
      <td class="mono text-sm">${helpers.formatTime(e.startTime)} – ${helpers.formatTime(e.endTime)}</td>
      <td><span class="badge badge-${e.type.toLowerCase()}">${e.type}</span></td>
      <td class="text-sm text-muted">Sem ${e.course.semesterId}</td>
    </tr>
  `).join('');
}

/* ---------- Teacher/Admin exams list ---------- */
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
    const count = DATA.enrollments.filter(en => en.examId === e.id).length;
    return `
      <tr>
        <td>
          <span class="course-code">${course.code}</span>
          <div class="text-sm" style="margin-top:4px;">${course.title}</div>
        </td>
        <td>${helpers.formatDate(e.date)}</td>
        <td><span class="badge badge-${e.shift.toLowerCase()}">${e.shift}</span></td>
        <td class="mono text-sm">${helpers.formatTime(e.startTime)} – ${helpers.formatTime(e.endTime)}</td>
        <td><span class="badge badge-${e.type.toLowerCase()}">${e.type}</span></td>
        <td class="text-sm">${count} student${count === 1 ? '' : 's'}</td>
        <td>
          <button class="btn btn-outline btn-sm" onclick="openEnrollModal(${e.id})">Enroll</button>
          <button class="btn btn-danger btn-sm" onclick="deleteExam(${e.id})">Delete</button>
        </td>
      </tr>
    `;
  }).join('');
}

function deleteExam(examId) {
  if (!confirm('Delete this exam? All enrollments for it will also be removed.')) return;
  DATA.exams = DATA.exams.filter(e => e.id !== examId);
  DATA.enrollments = DATA.enrollments.filter(en => en.examId !== examId);
  // Refresh whichever page we're on
  if (typeof refreshCurrentView === 'function') refreshCurrentView();
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
      return `<option value="${s.id}">${s.name} · ${s.loginId} · ${dept.code} Sem ${s.currentSemesterId}</option>`;
    }).join('');

  document.getElementById('enroll-result').innerHTML = '';
  openModal('enroll-modal');
}

function attemptEnroll() {
  const studentId = parseInt(document.getElementById('enroll-student-select').value);
  const resultEl = document.getElementById('enroll-result');

  if (!studentId) {
    resultEl.innerHTML = `<div class="alert alert-warning"><div><p class="alert-body">Please select a student first.</p></div></div>`;
    return;
  }

  const exam = DATA.exams.find(e => e.id === currentEnrollExamId);

  // Semester rule
  const semCheck = helpers.checkSemesterRule(studentId, currentEnrollExamId);
  if (!semCheck.allowed) {
    resultEl.innerHTML = `<div class="alert alert-error"><div><p class="alert-title">Semester eligibility violated</p><p class="alert-body">${semCheck.reason}</p></div></div>`;
    return;
  }

  // Clash check
  const clash = helpers.checkClash(studentId, exam.date);
  if (clash.hasConflict) {
    resultEl.innerHTML = `
      <div class="alert alert-error">
        <div>
          <p class="alert-title">Same-day conflict detected</p>
          <p class="alert-body">Student is already enrolled in <strong>${clash.course.code} — ${clash.course.title}</strong> on ${helpers.formatDateLong(exam.date)} (${clash.exam.shift} shift at ${helpers.formatTime(clash.exam.startTime)}). Students cannot take two exams on the same day.</p>
        </div>
      </div>`;
    return;
  }

  // Duplicate
  if (DATA.enrollments.find(en => en.studentId === studentId && en.examId === currentEnrollExamId)) {
    resultEl.innerHTML = `<div class="alert alert-warning"><div><p class="alert-body">This student is already enrolled in this exam.</p></div></div>`;
    return;
  }

  // Success
  DATA.enrollments.push({
    id: helpers.nextId(DATA.enrollments),
    studentId,
    examId: currentEnrollExamId,
  });

  const student = helpers.getUser(studentId);
  resultEl.innerHTML = `<div class="alert alert-success"><div><p class="alert-title">Enrolled successfully</p><p class="alert-body"><strong>${student.name}</strong> has been added to this exam.</p></div></div>`;

  if (typeof refreshCurrentView === 'function') refreshCurrentView();
}

/* ---------- Add Exam form ---------- */
function setupAddExamForm(user) {
  const form = document.getElementById('add-exam-form');
  if (!form) return;

  // Populate course dropdown
  const courseSelect = document.getElementById('exam-course-select');
  courseSelect.innerHTML = '<option value="">— Select course —</option>' +
    DATA.courses.map(c => {
      const dept = helpers.getDepartment(c.departmentId);
      const sem = helpers.getSemester(c.semesterId);
      return `<option value="${c.id}">${c.code} — ${c.title} (${dept.code}, Sem ${sem.number})</option>`;
    }).join('');

  form.onsubmit = (event) => {
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

    const newExam = {
      id: helpers.nextId(DATA.exams),
      courseId, date, shift, startTime, endTime, type,
      createdBy: user.id,
    };
    DATA.exams.push(newExam);

    resultEl.innerHTML = `<div class="alert alert-success"><div><p class="alert-title">Exam created</p><p class="alert-body">Added to the routine successfully.</p></div></div>`;
    form.reset();

    if (typeof refreshCurrentView === 'function') refreshCurrentView();

    setTimeout(() => closeModal('add-exam-modal'), 900);
  };
}

function openAddExamModal() {
  const form = document.getElementById('add-exam-form');
  if (form) form.reset();
  document.getElementById('add-exam-result').innerHTML = '';
  openModal('add-exam-modal');
}

/* ---------- Add Student form ---------- */
function setupAddStudentForm() {
  const form = document.getElementById('add-student-form');
  if (!form) return;

  const deptSelect = form.querySelector('[name="departmentId"]');
  deptSelect.innerHTML = '<option value="">— Department —</option>' +
    DATA.departments.map(d => `<option value="${d.id}">${d.code} — ${d.name}</option>`).join('');

  const semSelect = form.querySelector('[name="semesterId"]');
  semSelect.innerHTML = '<option value="">— Current semester —</option>' +
    DATA.semesters.map(s => `<option value="${s.id}">${s.label}</option>`).join('');

  form.onsubmit = (event) => {
    event.preventDefault();
    const resultEl = document.getElementById('add-student-result');

    const loginId = form.loginId.value.trim();
    const name = form.name.value.trim();
    const email = form.email.value.trim();
    const departmentId = parseInt(form.departmentId.value);
    const semesterId = parseInt(form.semesterId.value);
    const password = form.password.value || 'demo';

    if (DATA.users.find(u => u.loginId.toLowerCase() === loginId.toLowerCase())) {
      resultEl.innerHTML = `<div class="alert alert-error"><div><p class="alert-body">A user with ID "${loginId}" already exists.</p></div></div>`;
      return;
    }

    DATA.users.push({
      id: helpers.nextId(DATA.users),
      role: 'STUDENT',
      loginId, password, name, email,
      departmentId, currentSemesterId: semesterId,
    });

    resultEl.innerHTML = `<div class="alert alert-success"><div><p class="alert-title">Student added</p><p class="alert-body">${name} (${loginId}) has been registered.</p></div></div>`;
    form.reset();
    if (typeof refreshCurrentView === 'function') refreshCurrentView();

    setTimeout(() => closeModal('add-student-modal'), 900);
  };
}

function openAddStudentModal() {
  const form = document.getElementById('add-student-form');
  if (form) form.reset();
  document.getElementById('add-student-result').innerHTML = '';
  openModal('add-student-modal');
}

/* ---------- Add Teacher (admin only) ---------- */
function setupAddTeacherForm() {
  const form = document.getElementById('add-teacher-form');
  if (!form) return;

  const deptSelect = form.querySelector('[name="departmentId"]');
  deptSelect.innerHTML = '<option value="">— Department —</option>' +
    DATA.departments.map(d => `<option value="${d.id}">${d.code} — ${d.name}</option>`).join('');

  form.onsubmit = (event) => {
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

    DATA.users.push({
      id: helpers.nextId(DATA.users),
      role: 'TEACHER',
      loginId, password: 'demo', name, email, departmentId,
    });

    resultEl.innerHTML = `<div class="alert alert-success"><div><p class="alert-title">Teacher added</p><p class="alert-body">${name} (${loginId}) has been registered.</p></div></div>`;
    form.reset();
    if (typeof refreshCurrentView === 'function') refreshCurrentView();

    setTimeout(() => closeModal('add-teacher-modal'), 900);
  };
}

function openAddTeacherModal() {
  const form = document.getElementById('add-teacher-form');
  if (form) form.reset();
  document.getElementById('add-teacher-result').innerHTML = '';
  openModal('add-teacher-modal');
}

/* ---------- Add Subject/Course form ---------- */
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
    if (hint) {
      if (suggestion) {
        hint.textContent = `Suggested next code: ${suggestion} (format: DEPT + YEAR + SEM + SERIAL)`;
      } else {
        hint.textContent = 'Format: DEPT + YEAR + SEM + SERIAL — e.g. CSE2101';
      }
    }
  };

  deptSelect.addEventListener('change', updateSuggested);
  semSelect.addEventListener('change', updateSuggested);
  const codeInput = form.querySelector('[name="code"]');
  codeInput.addEventListener('input', () => { codeInput.dataset.userEdited = '1'; });

  form.onsubmit = (event) => {
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

    DATA.courses.push({
      id: helpers.nextId(DATA.courses),
      code, title, credit, semesterId, departmentId,
    });

    resultEl.innerHTML = `<div class="alert alert-success"><div><p class="alert-title">Subject added</p><p class="alert-body"><span class="course-code">${code}</span> — ${title}</p></div></div>`;
    form.reset();
    delete codeInput.dataset.userEdited;
    if (typeof refreshCurrentView === 'function') refreshCurrentView();

    setTimeout(() => closeModal('add-course-modal'), 900);
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

/* ---------- Add Department form ---------- */
function setupAddDeptForm() {
  const form = document.getElementById('add-dept-form');
  if (!form) return;

  form.onsubmit = (event) => {
    event.preventDefault();
    const resultEl = document.getElementById('add-dept-result');

    const code = form.code.value.trim().toUpperCase();
    const name = form.name.value.trim();

    if (DATA.departments.find(d => d.code === code)) {
      resultEl.innerHTML = `<div class="alert alert-error"><div><p class="alert-body">Department code "${code}" already exists.</p></div></div>`;
      return;
    }

    DATA.departments.push({
      id: helpers.nextId(DATA.departments),
      code, name,
    });

    resultEl.innerHTML = `<div class="alert alert-success"><div><p class="alert-title">Department added</p><p class="alert-body">${code} — ${name}</p></div></div>`;
    form.reset();
    if (typeof refreshCurrentView === 'function') refreshCurrentView();

    setTimeout(() => closeModal('add-dept-modal'), 900);
  };
}

function openAddDeptModal() {
  const form = document.getElementById('add-dept-form');
  if (form) form.reset();
  document.getElementById('add-dept-result').innerHTML = '';
  openModal('add-dept-modal');
}

/* ---------- Delete helpers ---------- */
function deleteStudent(id) {
  if (!confirm('Remove this student and all their enrollments?')) return;
  DATA.users = DATA.users.filter(u => u.id !== id);
  DATA.enrollments = DATA.enrollments.filter(en => en.studentId !== id);
  if (typeof refreshCurrentView === 'function') refreshCurrentView();
}

function deleteTeacher(id) {
  const examsByTeacher = DATA.exams.filter(e => e.createdBy === id).length;
  if (examsByTeacher > 0) {
    alert(`This teacher has ${examsByTeacher} exam(s) scheduled. Please delete those exams first.`);
    return;
  }
  if (!confirm('Remove this teacher?')) return;
  DATA.users = DATA.users.filter(u => u.id !== id);
  if (typeof refreshCurrentView === 'function') refreshCurrentView();
}

function deleteCourse(id) {
  const examCount = DATA.exams.filter(e => e.courseId === id).length;
  if (examCount > 0) {
    alert(`This subject has ${examCount} exam(s) scheduled. Please delete those exams first.`);
    return;
  }
  if (!confirm('Remove this subject?')) return;
  DATA.courses = DATA.courses.filter(c => c.id !== id);
  if (typeof refreshCurrentView === 'function') refreshCurrentView();
}

function deleteDepartment(id) {
  const courseCount = DATA.courses.filter(c => c.departmentId === id).length;
  const userCount = DATA.users.filter(u => u.departmentId === id).length;
  if (courseCount > 0 || userCount > 0) {
    alert(`This department has ${courseCount} subject(s) and ${userCount} user(s). Please remove those first.`);
    return;
  }
  if (!confirm('Remove this department?')) return;
  DATA.departments = DATA.departments.filter(d => d.id !== id);
  if (typeof refreshCurrentView === 'function') refreshCurrentView();
}

/* ---------- Init ---------- */
document.addEventListener('DOMContentLoaded', () => {
  setupRolePicker();
  setupSidebarNav();
  setupModalBackdrop();
});
