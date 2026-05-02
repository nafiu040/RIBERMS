/* =========================================================
   RIBERMS — Data Cache & Helpers
   ---------------------------------------------------------
   DATA holds an in-memory mirror of Supabase. It starts empty;
   supabase.js#DB.loadAll() fills it on page load.
   Helpers query DATA synchronously for snappy UI.
   ========================================================= */

const DATA = {
  departments: [],
  semesters:   [],
  courses:     [],
  users:       [],
  exams:       [],
  enrollments: [],
};

const helpers = {
  getDepartment: (id) => DATA.departments.find(d => d.id === id),
  getCourse:     (id) => DATA.courses.find(c => c.id === id),
  getSemester:   (id) => DATA.semesters.find(s => s.id === id),
  getUser:       (id) => DATA.users.find(u => u.id === id),
  getStudents:   ()   => DATA.users.filter(u => u.role === 'STUDENT'),
  getTeachers:   ()   => DATA.users.filter(u => u.role === 'TEACHER'),

  hydrateExam: (examId) => {
    const exam = DATA.exams.find(e => e.id === examId);
    if (!exam) return null;
    const course = helpers.getCourse(exam.courseId);
    const semester = course ? helpers.getSemester(course.semesterId) : null;
    const department = course ? helpers.getDepartment(course.departmentId) : null;
    return { ...exam, course, semester, department };
  },

  getStudentExams: (studentId) => {
    const ens = DATA.enrollments.filter(e => e.studentId === studentId);
    return ens.map(e => helpers.hydrateExam(e.examId)).filter(Boolean);
  },

  checkClash: (studentId, date, excludeExamId = null) => {
    const ens = DATA.enrollments.filter(e => e.studentId === studentId);
    for (const en of ens) {
      if (en.examId === excludeExamId) continue;
      const exam = DATA.exams.find(x => x.id === en.examId);
      if (exam && exam.date === date) {
        const course = helpers.getCourse(exam.courseId);
        return { hasConflict: true, exam, course };
      }
    }
    return { hasConflict: false };
  },

  checkSemesterRule: (studentId, examId) => {
    const student = helpers.getUser(studentId);
    const exam = DATA.exams.find(x => x.id === examId);
    if (!student || !exam) return { allowed: false, reason: 'Invalid data.' };
    const course = helpers.getCourse(exam.courseId);
    if (!course) return { allowed: false, reason: 'Course not found.' };
    const studentSem = helpers.getSemester(student.currentSemesterId);
    const examSem = helpers.getSemester(course.semesterId);
    if (!studentSem || !examSem) return { allowed: false, reason: 'Semester not found.' };
    if (examSem.number >= studentSem.number) {
      return {
        allowed: false,
        reason: `${student.name} is in Semester ${studentSem.number}. Special-category exams must be from Semesters 1–${studentSem.number - 1}. This exam (${course.code}) is for Semester ${examSem.number}.`
      };
    }
    return { allowed: true };
  },

  formatDate: (dateStr) => {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  },
  formatDateLong: (dateStr) => {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  },
  formatTime: (timeStr) => {
    const [h, m] = timeStr.split(':');
    const hour = parseInt(h);
    const period = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${m} ${period}`;
  },
  formatDateParts: (dateStr) => {
    const d = new Date(dateStr + 'T00:00:00');
    return { day: d.getDate(), month: d.toLocaleDateString('en-US', { month: 'short' }), year: d.getFullYear() };
  },
  getInitials: (name) => {
    return name.split(' ').filter(n => n).map(n => n[0]).slice(0, 2).join('').toUpperCase();
  },

  suggestNextCourseCode: (departmentId, semesterId) => {
    const dept = helpers.getDepartment(departmentId);
    const sem = helpers.getSemester(semesterId);
    if (!dept || !sem) return '';
    const prefix = `${dept.code}${sem.year}${sem.semOfYear}`;
    const existing = DATA.courses
      .filter(c => c.code.startsWith(prefix))
      .map(c => parseInt(c.code.slice(-2)))
      .filter(n => !isNaN(n));
    const next = existing.length ? Math.max(...existing) + 1 : 1;
    return `${prefix}${String(next).padStart(2, '0')}`;
  },
};
