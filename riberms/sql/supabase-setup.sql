-- =========================================================
-- RIBERMS — Supabase Database Setup (v2 with audit log)
-- =========================================================
-- HOW TO RUN:
--   1. Open your Supabase project dashboard
--   2. Click "SQL Editor" in the left sidebar
--   3. Click "+ New query"
--   4. Paste this whole file
--   5. Click "Run"
-- =========================================================


-- ===== CLEAN SLATE (safe to re-run) =====
DROP TABLE IF EXISTS audit_logs  CASCADE;
DROP TABLE IF EXISTS enrollments CASCADE;
DROP TABLE IF EXISTS exams       CASCADE;
DROP TABLE IF EXISTS users       CASCADE;
DROP TABLE IF EXISTS courses     CASCADE;
DROP TABLE IF EXISTS semesters   CASCADE;
DROP TABLE IF EXISTS departments CASCADE;


-- ===== SCHEMA =====

CREATE TABLE departments (
  id   BIGSERIAL PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL
);

CREATE TABLE semesters (
  id          BIGSERIAL PRIMARY KEY,
  number      INT  UNIQUE NOT NULL,
  year        INT  NOT NULL,
  sem_of_year INT  NOT NULL,
  label       TEXT NOT NULL
);

CREATE TABLE courses (
  id            BIGSERIAL PRIMARY KEY,
  code          TEXT UNIQUE NOT NULL,
  title         TEXT NOT NULL,
  credit        NUMERIC(3,1) DEFAULT 3,
  semester_id   BIGINT REFERENCES semesters(id)   ON DELETE CASCADE,
  department_id BIGINT REFERENCES departments(id) ON DELETE CASCADE
);

CREATE TABLE users (
  id                   BIGSERIAL PRIMARY KEY,
  role                 TEXT NOT NULL CHECK (role IN ('STUDENT', 'TEACHER', 'ADMIN')),
  login_id             TEXT UNIQUE NOT NULL,
  password             TEXT NOT NULL DEFAULT 'merciful',
  name                 TEXT NOT NULL,
  email                TEXT,
  department_id        BIGINT REFERENCES departments(id) ON DELETE SET NULL,
  current_semester_id  BIGINT REFERENCES semesters(id)   ON DELETE SET NULL
);

CREATE TABLE exams (
  id         BIGSERIAL PRIMARY KEY,
  course_id  BIGINT REFERENCES courses(id) ON DELETE CASCADE,
  date       DATE NOT NULL,
  shift      TEXT NOT NULL CHECK (shift IN ('MORNING', 'AFTERNOON')),
  start_time TIME NOT NULL,
  end_time   TIME NOT NULL,
  type       TEXT NOT NULL CHECK (type IN ('REFERRED', 'IMPROVEMENT', 'BACKLOG')),
  created_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
  CHECK (end_time > start_time)
);

CREATE TABLE enrollments (
  id         BIGSERIAL PRIMARY KEY,
  student_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  exam_id    BIGINT REFERENCES exams(id) ON DELETE CASCADE,
  UNIQUE (student_id, exam_id)
);

-- AUDIT LOG: tracks every change in the system
CREATE TABLE audit_logs (
  id          BIGSERIAL PRIMARY KEY,
  actor_id    BIGINT REFERENCES users(id) ON DELETE SET NULL,
  actor_name  TEXT,        -- snapshot in case user is later deleted
  actor_role  TEXT,        -- snapshot
  action      TEXT NOT NULL,  -- CREATE, UPDATE, DELETE, ENROLL, UNENROLL
  entity      TEXT NOT NULL,  -- exam, student, teacher, course, department, enrollment
  entity_id   BIGINT,         -- id of affected row (nullable for deletes)
  summary     TEXT,           -- human-readable description
  details     JSONB,          -- before/after, extra context
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_created_at ON audit_logs (created_at DESC);
CREATE INDEX idx_audit_actor ON audit_logs (actor_id);


-- ===== ROW LEVEL SECURITY (open for class demo) =====
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE semesters   ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses     ENABLE ROW LEVEL SECURITY;
ALTER TABLE users       ENABLE ROW LEVEL SECURITY;
ALTER TABLE exams       ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs  ENABLE ROW LEVEL SECURITY;

CREATE POLICY "open_all" ON departments FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "open_all" ON semesters   FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "open_all" ON courses     FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "open_all" ON users       FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "open_all" ON exams       FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "open_all" ON enrollments FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "open_all" ON audit_logs  FOR ALL TO anon USING (true) WITH CHECK (true);

CREATE POLICY "open_auth" ON departments FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "open_auth" ON semesters   FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "open_auth" ON courses     FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "open_auth" ON users       FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "open_auth" ON exams       FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "open_auth" ON enrollments FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "open_auth" ON audit_logs  FOR ALL TO authenticated USING (true) WITH CHECK (true);


-- ===== SEED DATA =====

-- Departments
INSERT INTO departments (code, name) VALUES
  ('CSE', 'Computer Science & Engineering'),
  ('EEE', 'Electrical & Electronic Engineering'),
  ('BBA', 'Business Administration'),
  ('ENG', 'English Literature');

-- Semesters
INSERT INTO semesters (number, year, sem_of_year, label) VALUES
  (1, 1, 1, '1st Year · 1st Semester'),
  (2, 1, 2, '1st Year · 2nd Semester'),
  (3, 2, 1, '2nd Year · 1st Semester'),
  (4, 2, 2, '2nd Year · 2nd Semester'),
  (5, 3, 1, '3rd Year · 1st Semester'),
  (6, 3, 2, '3rd Year · 2nd Semester'),
  (7, 4, 1, '4th Year · 1st Semester'),
  (8, 4, 2, '4th Year · 2nd Semester');

-- Courses (DSA = CSE2101)
INSERT INTO courses (code, title, credit, semester_id, department_id) VALUES
  ('CSE1101', 'Structured Programming',          3, (SELECT id FROM semesters WHERE number=1), (SELECT id FROM departments WHERE code='CSE')),
  ('CSE1102', 'Discrete Mathematics',            3, (SELECT id FROM semesters WHERE number=1), (SELECT id FROM departments WHERE code='CSE')),
  ('CSE1201', 'Object-Oriented Programming',     3, (SELECT id FROM semesters WHERE number=2), (SELECT id FROM departments WHERE code='CSE')),
  ('CSE1202', 'Digital Logic Design',            3, (SELECT id FROM semesters WHERE number=2), (SELECT id FROM departments WHERE code='CSE')),
  ('CSE2101', 'Data Structures & Algorithms',    3, (SELECT id FROM semesters WHERE number=3), (SELECT id FROM departments WHERE code='CSE')),
  ('CSE2102', 'Computer Architecture',           3, (SELECT id FROM semesters WHERE number=3), (SELECT id FROM departments WHERE code='CSE')),
  ('CSE2201', 'Database Management Systems',     3, (SELECT id FROM semesters WHERE number=4), (SELECT id FROM departments WHERE code='CSE')),
  ('CSE2202', 'Operating Systems',               3, (SELECT id FROM semesters WHERE number=4), (SELECT id FROM departments WHERE code='CSE')),
  ('CSE3101', 'Computer Networks',               3, (SELECT id FROM semesters WHERE number=5), (SELECT id FROM departments WHERE code='CSE')),
  ('CSE3102', 'Software Engineering',            3, (SELECT id FROM semesters WHERE number=5), (SELECT id FROM departments WHERE code='CSE')),
  ('CSE3201', 'Artificial Intelligence',         3, (SELECT id FROM semesters WHERE number=6), (SELECT id FROM departments WHERE code='CSE')),
  ('CSE3202', 'Machine Learning',                3, (SELECT id FROM semesters WHERE number=6), (SELECT id FROM departments WHERE code='CSE')),
  ('EEE1201', 'Electrical Circuits I',           3, (SELECT id FROM semesters WHERE number=2), (SELECT id FROM departments WHERE code='EEE')),
  ('EEE2101', 'Circuit Analysis',                3, (SELECT id FROM semesters WHERE number=3), (SELECT id FROM departments WHERE code='EEE')),
  ('EEE2201', 'Electromagnetic Fields',          3, (SELECT id FROM semesters WHERE number=4), (SELECT id FROM departments WHERE code='EEE')),
  ('EEE3101', 'Electronic Devices',              3, (SELECT id FROM semesters WHERE number=5), (SELECT id FROM departments WHERE code='EEE')),
  ('BBA1101', 'Principles of Management',        3, (SELECT id FROM semesters WHERE number=1), (SELECT id FROM departments WHERE code='BBA')),
  ('BBA2101', 'Microeconomics',                  3, (SELECT id FROM semesters WHERE number=3), (SELECT id FROM departments WHERE code='BBA'));

-- Users — all female, all 5-digit IDs, password = 'merciful'
INSERT INTO users (role, login_id, password, name, email, department_id, current_semester_id) VALUES
  -- Students (5-digit IDs starting with 1)
  ('STUDENT', '18001', 'merciful', 'Ayesha Rahman',     'ayesha@campus.edu',   (SELECT id FROM departments WHERE code='CSE'), (SELECT id FROM semesters WHERE number=7)),
  ('STUDENT', '19002', 'merciful', 'Tasnim Akter',      'tasnim@campus.edu',   (SELECT id FROM departments WHERE code='CSE'), (SELECT id FROM semesters WHERE number=5)),
  ('STUDENT', '18003', 'merciful', 'Sumaiya Khatun',    'sumaiya@campus.edu',  (SELECT id FROM departments WHERE code='EEE'), (SELECT id FROM semesters WHERE number=6)),
  ('STUDENT', '20004', 'merciful', 'Nusrat Jahan',      'nusrat@campus.edu',   (SELECT id FROM departments WHERE code='CSE'), (SELECT id FROM semesters WHERE number=3)),
  ('STUDENT', '21005', 'merciful', 'Mehnaz Karim',      'mehnaz@campus.edu',   (SELECT id FROM departments WHERE code='BBA'), (SELECT id FROM semesters WHERE number=4)),

  -- Teachers (5-digit IDs starting with 2)
  ('TEACHER', '20101', 'merciful', 'Dr. Farzana Hossain',  'farzana@campus.edu', (SELECT id FROM departments WHERE code='CSE'), NULL),
  ('TEACHER', '20102', 'merciful', 'Dr. Ruma Akter',       'ruma@campus.edu',    (SELECT id FROM departments WHERE code='EEE'), NULL),
  ('TEACHER', '20103', 'merciful', 'Prof. Salma Begum',    'salma@campus.edu',   (SELECT id FROM departments WHERE code='CSE'), NULL),

  -- Admin (5-digit ID starting with 9)
  ('ADMIN',   '90001', 'merciful', 'Dr. Shirin Akter', 'shirin@campus.edu', NULL, NULL);

-- Exams
INSERT INTO exams (course_id, date, shift, start_time, end_time, type, created_by) VALUES
  ((SELECT id FROM courses WHERE code='CSE2101'), '2026-05-10', 'MORNING',   '09:00', '11:00', 'REFERRED',    (SELECT id FROM users WHERE login_id='20101')),
  ((SELECT id FROM courses WHERE code='CSE1201'), '2026-05-12', 'MORNING',   '09:00', '11:00', 'BACKLOG',     (SELECT id FROM users WHERE login_id='20101')),
  ((SELECT id FROM courses WHERE code='CSE2201'), '2026-05-14', 'AFTERNOON', '14:00', '16:00', 'IMPROVEMENT', (SELECT id FROM users WHERE login_id='20101')),
  ((SELECT id FROM courses WHERE code='CSE2202'), '2026-05-16', 'MORNING',   '10:00', '12:00', 'REFERRED',    (SELECT id FROM users WHERE login_id='20101')),
  ((SELECT id FROM courses WHERE code='CSE3101'), '2026-05-18', 'AFTERNOON', '14:00', '16:00', 'BACKLOG',     (SELECT id FROM users WHERE login_id='20101')),
  ((SELECT id FROM courses WHERE code='EEE1201'), '2026-05-11', 'MORNING',   '09:00', '11:00', 'REFERRED',    (SELECT id FROM users WHERE login_id='20102')),
  ((SELECT id FROM courses WHERE code='EEE2201'), '2026-05-13', 'AFTERNOON', '14:30', '16:30', 'IMPROVEMENT', (SELECT id FROM users WHERE login_id='20102')),
  ((SELECT id FROM courses WHERE code='CSE3201'), '2026-05-20', 'MORNING',   '09:00', '11:30', 'REFERRED',    (SELECT id FROM users WHERE login_id='20101'));

-- Enrollments
INSERT INTO enrollments (student_id, exam_id) VALUES
  ((SELECT id FROM users WHERE login_id='18001'), (SELECT e.id FROM exams e JOIN courses c ON e.course_id=c.id WHERE c.code='CSE2101')),
  ((SELECT id FROM users WHERE login_id='18001'), (SELECT e.id FROM exams e JOIN courses c ON e.course_id=c.id WHERE c.code='CSE2201')),
  ((SELECT id FROM users WHERE login_id='18001'), (SELECT e.id FROM exams e JOIN courses c ON e.course_id=c.id WHERE c.code='CSE3101')),
  ((SELECT id FROM users WHERE login_id='19002'), (SELECT e.id FROM exams e JOIN courses c ON e.course_id=c.id WHERE c.code='CSE2101')),
  ((SELECT id FROM users WHERE login_id='19002'), (SELECT e.id FROM exams e JOIN courses c ON e.course_id=c.id WHERE c.code='CSE1201')),
  ((SELECT id FROM users WHERE login_id='18003'), (SELECT e.id FROM exams e JOIN courses c ON e.course_id=c.id WHERE c.code='EEE1201')),
  ((SELECT id FROM users WHERE login_id='18003'), (SELECT e.id FROM exams e JOIN courses c ON e.course_id=c.id WHERE c.code='EEE2201'));

-- Initial audit log entry
INSERT INTO audit_logs (actor_name, actor_role, action, entity, summary)
VALUES ('System', 'SYSTEM', 'INIT', 'system', 'Database initialized with seed data');


-- ===== DONE =====
SELECT 'RIBERMS setup complete ✅' AS status,
       (SELECT COUNT(*) FROM departments) AS departments,
       (SELECT COUNT(*) FROM courses)     AS courses,
       (SELECT COUNT(*) FROM users)       AS users,
       (SELECT COUNT(*) FROM exams)       AS exams,
       (SELECT COUNT(*) FROM enrollments) AS enrollments,
       (SELECT COUNT(*) FROM audit_logs)  AS audit_logs;
