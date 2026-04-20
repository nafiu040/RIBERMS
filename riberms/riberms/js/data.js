/* =========================================================
   RIBERMS — Sample Data
   ---------------------------------------------------------
   Course code format: {DEPT}{YEAR}{SEM}{SERIAL}
   Example: CSE2101
     CSE  = Computer Science & Eng. department
     2    = 2nd year
     1    = 1st semester of that year
     01   = serial number (01st course of that semester)
   Year/Semester mapping to overall semester:
     Year 1, Sem 1 -> Semester 1
     Year 1, Sem 2 -> Semester 2
     Year 2, Sem 1 -> Semester 3
     Year 2, Sem 2 -> Semester 4
     Year 3, Sem 1 -> Semester 5
     Year 3, Sem 2 -> Semester 6
     Year 4, Sem 1 -> Semester 7
     Year 4, Sem 2 -> Semester 8
   ========================================================= */

const DATA = {
  departments: [
    { id: 1, code: 'CSE', name: 'Computer Science & Engineering' },
    { id: 2, code: 'EEE', name: 'Electrical & Electronic Engineering' },
    { id: 3, code: 'BBA', name: 'Business Administration' },
    { id: 4, code: 'ENG', name: 'English Literature' },
  ],

  
  // 8 semesters total (4 years × 2 semesters)
  semesters: [
    { id: 1, number: 1, year: 1, semOfYear: 1, label: '1st Year · 1st Semester' },
    { id: 2, number: 2, year: 1, semOfYear: 2, label: '1st Year · 2nd Semester' },
    { id: 3, number: 3, year: 2, semOfYear: 1, label: '2nd Year · 1st Semester' },
    { id: 4, number: 4, year: 2, semOfYear: 2, label: '2nd Year · 2nd Semester' },
    { id: 5, number: 5, year: 3, semOfYear: 1, label: '3rd Year · 1st Semester' },
    { id: 6, number: 6, year: 3, semOfYear: 2, label: '3rd Year · 2nd Semester' },
    { id: 7, number: 7, year: 4, semOfYear: 1, label: '4th Year · 1st Semester' },
    { id: 8, number: 8, year: 4, semOfYear: 2, label: '4th Year · 2nd Semester' },
  ],

  // Subjects / Courses with proper code format
  courses: [
    // CSE — 1st Year Sem 1
    { id: 1, code: 'CSE1101', title: 'Structured Programming', credit: 3, semesterId: 1, departmentId: 1 },
    { id: 2, code: 'CSE1102', title: 'Discrete Mathematics', credit: 3, semesterId: 1, departmentId: 1 },
    // CSE — 1st Year Sem 2
    { id: 3, code: 'CSE1201', title: 'Object-Oriented Programming', credit: 3, semesterId: 2, departmentId: 1 },
    { id: 4, code: 'CSE1202', title: 'Digital Logic Design', credit: 3, semesterId: 2, departmentId: 1 },
    // CSE — 2nd Year Sem 1
    { id: 5, code: 'CSE2101', title: 'Data Structures & Algorithms', credit: 3, semesterId: 3, departmentId: 1 },
    { id: 6, code: 'CSE2102', title: 'Computer Architecture', credit: 3, semesterId: 3, departmentId: 1 },
    // CSE — 2nd Year Sem 2
    { id: 7, code: 'CSE2201', title: 'Database Management Systems', credit: 3, semesterId: 4, departmentId: 1 },
    { id: 8, code: 'CSE2202', title: 'Operating Systems', credit: 3, semesterId: 4, departmentId: 1 },
    // CSE — 3rd Year Sem 1
    { id: 9, code: 'CSE3101', title: 'Computer Networks', credit: 3, semesterId: 5, departmentId: 1 },
    { id: 10, code: 'CSE3102', title: 'Software Engineering', credit: 3, semesterId: 5, departmentId: 1 },
    // CSE — 3rd Year Sem 2
    { id: 11, code: 'CSE3201', title: 'Artificial Intelligence', credit: 3, semesterId: 6, departmentId: 1 },
    { id: 12, code: 'CSE3202', title: 'Machine Learning', credit: 3, semesterId: 6, departmentId: 1 },

    // EEE — 1st Year Sem 2
    { id: 13, code: 'EEE1201', title: 'Electrical Circuits I', credit: 3, semesterId: 2, departmentId: 2 },
    // EEE — 2nd Year Sem 1
    { id: 14, code: 'EEE2101', title: 'Circuit Analysis', credit: 3, semesterId: 3, departmentId: 2 },
    // EEE — 2nd Year Sem 2
    { id: 15, code: 'EEE2201', title: 'Electromagnetic Fields', credit: 3, semesterId: 4, departmentId: 2 },
    // EEE — 3rd Year Sem 1
    { id: 16, code: 'EEE3101', title: 'Electronic Devices', credit: 3, semesterId: 5, departmentId: 2 },

    // BBA
    { id: 17, code: 'BBA1101', title: 'Principles of Management', credit: 3, semesterId: 1, departmentId: 3 },
    { id: 18, code: 'BBA2101', title: 'Microeconomics', credit: 3, semesterId: 3, departmentId: 3 },
  ],

  // Users — login via ID + password (no usernames)
  users: [
    // Students (studentId is the login ID)
    { id: 1, role: 'STUDENT', loginId: '180007', password: 'demo', name: 'Amina Khatun',   email: 'amina@campus.edu',   departmentId: 1, currentSemesterId: 7 },
    { id: 2, role: 'STUDENT', loginId: '190032', password: 'demo', name: 'Ayesha Jahan',   email: 'ayesha@campus.edu',   departmentId: 1, currentSemesterId: 5 },
    { id: 3, role: 'STUDENT', loginId: '180014', password: 'demo', name: 'Fatima Khatun', email: 'fatima@campus.edu',  departmentId: 2, currentSemesterId: 6 },
    { id: 4, role: 'STUDENT', loginId: '200045', password: 'demo', name: 'Nusrat Jahan',  email: 'nusrat@campus.edu',  departmentId: 1, currentSemesterId: 3 },

    // Teachers (employee ID is the login ID)
    { id: 10, role: 'TEACHER', loginId: '5-1042', password: 'demo', name: 'Dr. Zahra Khatun',   email: 'zahra@campus.edu', departmentId: 1 },
    { id: 11, role: 'TEACHER', loginId: '8-1058', password: 'demo', name: 'Dr. Ruma Akter',     email: 'ruma@campus.edu',  departmentId: 2 },
    { id: 12, role: 'TEACHER', loginId: '9-1073', password: 'demo', name: 'Prof. Ripa Habiba', email: 'ripa@campus.edu', departmentId: 1 },

    // Admin
    { id: 20, role: 'ADMIN', loginId: 'ADMIN-01', password: 'demo', name: 'System Administrator', email: 'admin@campus.edu' },
  ],

  // Exams
  exams: [
    { id: 1, courseId: 5,  date: '2026-05-10', shift: 'MORNING',   startTime: '09:00', endTime: '11:00', type: 'REFERRED',    createdBy: 10 },
    { id: 2, courseId: 3,  date: '2026-05-12', shift: 'MORNING',   startTime: '09:00', endTime: '11:00', type: 'BACKLOG',     createdBy: 10 },
    { id: 3, courseId: 7,  date: '2026-05-14', shift: 'AFTERNOON', startTime: '14:00', endTime: '16:00', type: 'IMPROVEMENT', createdBy: 10 },
    { id: 4, courseId: 8,  date: '2026-05-16', shift: 'MORNING',   startTime: '10:00', endTime: '12:00', type: 'REFERRED',    createdBy: 10 },
    { id: 5, courseId: 9,  date: '2026-05-18', shift: 'AFTERNOON', startTime: '14:00', endTime: '16:00', type: 'BACKLOG',     createdBy: 10 },
    { id: 6, courseId: 13, date: '2026-05-11', shift: 'MORNING',   startTime: '09:00', endTime: '11:00', type: 'REFERRED',    createdBy: 11 },
    { id: 7, courseId: 15, date: '2026-05-13', shift: 'AFTERNOON', startTime: '14:30', endTime: '16:30', type: 'IMPROVEMENT', createdBy: 11 },
    { id: 8, courseId: 11, date: '2026-05-20', shift: 'MORNING',   startTime: '09:00', endTime: '11:30', type: 'REFERRED',    createdBy: 10 },
  ],

  // Enrollments: which students are registered for which exam
  enrollments: [
    { id: 1, studentId: 1, examId: 1 },
    { id: 2, studentId: 1, examId: 3 },
    { id: 3, studentId: 1, examId: 5 },
    { id: 4, studentId: 2, examId: 1 },
    { id: 5, studentId: 2, examId: 2 },
    { id: 6, studentId: 3, examId: 6 },
    { id: 7, studentId: 3, examId: 7 },
  ],
};

/* ---------- Helpers ---------- */
const helpers = {
  getDepartment: (id) => DATA.departments.find(d => d.id === id),
  getCourse:     (id) => DATA.courses.find(c => c.id === id),
  getSemester:   (id) => DATA.semesters.find(s => s.id === id),
  getUser:       (id) => DATA.users.find(u => u.id === id),
  getStudents:   ()   => DATA.users.filter(u => u.role === 'STUDENT'),
  getTeachers:   ()   => DATA.users.filter(u => u.role === 'TEACHER'),
  getAdmins:     ()   => DATA.users.filter(u => u.role === 'ADMIN'),

  /* Get full exam info with course attached */
  hydrateExam: (examId) => {
    const exam = DATA.exams.find(e => e.id === examId);
    if (!exam) return null;
    const course = helpers.getCourse(exam.courseId);
    const semester = helpers.getSemester(course.semesterId);
    const department = helpers.getDepartment(course.departmentId);
    return { ...exam, course, semester, department };
  },

  /* Get a student's exam list with full course info */
  getStudentExams: (studentId) => {
    const ens = DATA.enrollments.filter(e => e.studentId === studentId);
    return ens.map(e => helpers.hydrateExam(e.examId)).filter(Boolean);
  },

  /* Get students enrolled in an exam */
  getExamStudents: (examId) => {
    return DATA.enrollments
      .filter(e => e.examId === examId)
      .map(e => helpers.getUser(e.studentId));
  },

  /* Same-day clash check */
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

  /* Semester rule: student in Nth sem can only take exams from 1..N-1 */
  checkSemesterRule: (studentId, examId) => {
    const student = helpers.getUser(studentId);
    const exam = DATA.exams.find(x => x.id === examId);
    if (!student || !exam) return { allowed: false, reason: 'Invalid data.' };
    const course = helpers.getCourse(exam.courseId);
    const examSemester = course.semesterId;
    if (examSemester >= student.currentSemesterId) {
      return {
        allowed: false,
        reason: `${student.name} is currently in Semester ${student.currentSemesterId}. Referred/improvement/backlog exams must be from Semesters 1–${student.currentSemesterId - 1}. This exam (${course.code}) is for Semester ${examSemester}.`
      };
    }
    return { allowed: true };
  },

  /* Format helpers */
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
    return {
      day: d.getDate(),
      month: d.toLocaleDateString('en-US', { month: 'short' }),
      year: d.getFullYear(),
    };
  },
  getInitials: (name) => {
    return name.split(' ').filter(n => n).map(n => n[0]).slice(0, 2).join('').toUpperCase();
  },

  /* Generate next serial for a given department/semester to suggest course code */
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

  /* Next available ID */
  nextId: (arr) => {
    return arr.length ? Math.max(...arr.map(x => x.id)) + 1 : 1;
  },
};
