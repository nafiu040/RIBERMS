/* =========================================================
   RIBERMS — Supabase DB Layer
   ---------------------------------------------------------
   Wraps all Supabase calls. Snake_case in DB, camelCase in JS.
   ========================================================= */

let _sb = null;
function getSupabase() {
  if (_sb) return _sb;
  if (!window.supabase) throw new Error('Supabase JS library not loaded.');
  if (!SUPABASE_CONFIG.url || SUPABASE_CONFIG.url.includes('YOUR_')) {
    throw new Error('Please set your Supabase URL and anon key in config.js');
  }
  _sb = window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
  return _sb;
}

/* ---------- Mappers ---------- */
function mapSemester(s) {
  return { id: s.id, number: s.number, year: s.year, semOfYear: s.sem_of_year, label: s.label };
}
function mapCourse(c) {
  return { id: c.id, code: c.code, title: c.title, credit: Number(c.credit),
           semesterId: c.semester_id, departmentId: c.department_id };
}
function unmapCourse(c) {
  const out = {};
  if (c.code !== undefined) out.code = c.code;
  if (c.title !== undefined) out.title = c.title;
  if (c.credit !== undefined) out.credit = c.credit;
  if (c.semesterId !== undefined) out.semester_id = c.semesterId;
  if (c.departmentId !== undefined) out.department_id = c.departmentId;
  return out;
}
function mapUser(u) {
  return { id: u.id, role: u.role, loginId: u.login_id, password: u.password,
           name: u.name, email: u.email,
           departmentId: u.department_id, currentSemesterId: u.current_semester_id };
}
function unmapUser(u) {
  const out = {};
  if (u.role !== undefined) out.role = u.role;
  if (u.loginId !== undefined) out.login_id = u.loginId;
  if (u.password !== undefined) out.password = u.password;
  if (u.name !== undefined) out.name = u.name;
  if (u.email !== undefined) out.email = u.email;
  if (u.departmentId !== undefined) out.department_id = u.departmentId;
  if (u.currentSemesterId !== undefined) out.current_semester_id = u.currentSemesterId;
  return out;
}
function mapExam(e) {
  return { id: e.id, courseId: e.course_id, date: e.date, shift: e.shift,
           startTime: e.start_time ? e.start_time.slice(0, 5) : e.start_time,
           endTime:   e.end_time   ? e.end_time.slice(0, 5)   : e.end_time,
           type: e.type, createdBy: e.created_by };
}
function unmapExam(e) {
  const out = {};
  if (e.courseId !== undefined) out.course_id = e.courseId;
  if (e.date !== undefined) out.date = e.date;
  if (e.shift !== undefined) out.shift = e.shift;
  if (e.startTime !== undefined) out.start_time = e.startTime;
  if (e.endTime !== undefined) out.end_time = e.endTime;
  if (e.type !== undefined) out.type = e.type;
  if (e.createdBy !== undefined) out.created_by = e.createdBy;
  return out;
}
function mapEnrollment(en) {
  return { id: en.id, studentId: en.student_id, examId: en.exam_id };
}
function mapAuditLog(a) {
  return { id: a.id, actorId: a.actor_id, actorName: a.actor_name, actorRole: a.actor_role,
           action: a.action, entity: a.entity, entityId: a.entity_id,
           summary: a.summary, details: a.details, createdAt: a.created_at };
}

/* ---------- DB API ---------- */
const DB = {

  async loadAll() {
    const sb = getSupabase();
    const [dept, sem, crs, usr, exm, enr] = await Promise.all([
      sb.from('departments').select('*').order('id'),
      sb.from('semesters').select('*').order('number'),
      sb.from('courses').select('*').order('code'),
      sb.from('users').select('*').order('id'),
      sb.from('exams').select('*').order('date'),
      sb.from('enrollments').select('*').order('id'),
    ]);
    for (const r of [dept, sem, crs, usr, exm, enr]) {
      if (r.error) throw new Error(`Database error: ${r.error.message}`);
    }
    DATA.departments = dept.data;
    DATA.semesters   = sem.data.map(mapSemester);
    DATA.courses     = crs.data.map(mapCourse);
    DATA.users       = usr.data.map(mapUser);
    DATA.exams       = exm.data.map(mapExam);
    DATA.enrollments = enr.data.map(mapEnrollment);
  },

  /* ---- USERS ---- */
  async findUserByLoginId(loginId) {
    const sb = getSupabase();
    const { data, error } = await sb.from('users').select('*').eq('login_id', loginId).maybeSingle();
    if (error) throw new Error(error.message);
    return data ? mapUser(data) : null;
  },
  async createUser(user) {
    const sb = getSupabase();
    const { data, error } = await sb.from('users').insert(unmapUser(user)).select().single();
    if (error) throw new Error(error.message);
    return mapUser(data);
  },
  async updateUser(id, updates) {
    const sb = getSupabase();
    const { data, error } = await sb.from('users').update(unmapUser(updates)).eq('id', id).select().single();
    if (error) throw new Error(error.message);
    return mapUser(data);
  },
  async deleteUser(id) {
    const sb = getSupabase();
    const { error } = await sb.from('users').delete().eq('id', id);
    if (error) throw new Error(error.message);
  },

  /* ---- DEPARTMENTS ---- */
  async createDepartment(dept) {
    const sb = getSupabase();
    const { data, error } = await sb.from('departments').insert({ code: dept.code, name: dept.name }).select().single();
    if (error) throw new Error(error.message);
    return data;
  },
  async updateDepartment(id, updates) {
    const sb = getSupabase();
    const payload = {};
    if (updates.code !== undefined) payload.code = updates.code;
    if (updates.name !== undefined) payload.name = updates.name;
    const { data, error } = await sb.from('departments').update(payload).eq('id', id).select().single();
    if (error) throw new Error(error.message);
    return data;
  },
  async deleteDepartment(id) {
    const sb = getSupabase();
    const { error } = await sb.from('departments').delete().eq('id', id);
    if (error) throw new Error(error.message);
  },

  /* ---- COURSES ---- */
  async createCourse(course) {
    const sb = getSupabase();
    const { data, error } = await sb.from('courses').insert(unmapCourse(course)).select().single();
    if (error) throw new Error(error.message);
    return mapCourse(data);
  },
  async updateCourse(id, updates) {
    const sb = getSupabase();
    const { data, error } = await sb.from('courses').update(unmapCourse(updates)).eq('id', id).select().single();
    if (error) throw new Error(error.message);
    return mapCourse(data);
  },
  async deleteCourse(id) {
    const sb = getSupabase();
    const { error } = await sb.from('courses').delete().eq('id', id);
    if (error) throw new Error(error.message);
  },

  /* ---- EXAMS ---- */
  async createExam(exam) {
    const sb = getSupabase();
    const { data, error } = await sb.from('exams').insert(unmapExam(exam)).select().single();
    if (error) throw new Error(error.message);
    return mapExam(data);
  },
  async updateExam(id, updates) {
    const sb = getSupabase();
    const { data, error } = await sb.from('exams').update(unmapExam(updates)).eq('id', id).select().single();
    if (error) throw new Error(error.message);
    return mapExam(data);
  },
  async deleteExam(id) {
    const sb = getSupabase();
    const { error } = await sb.from('exams').delete().eq('id', id);
    if (error) throw new Error(error.message);
  },

  /* ---- ENROLLMENTS ---- */
  async createEnrollment(studentId, examId) {
    const sb = getSupabase();
    const { data, error } = await sb.from('enrollments').insert({ student_id: studentId, exam_id: examId }).select().single();
    if (error) throw new Error(error.message);
    return mapEnrollment(data);
  },
  async deleteEnrollment(id) {
    const sb = getSupabase();
    const { error } = await sb.from('enrollments').delete().eq('id', id);
    if (error) throw new Error(error.message);
  },

  /* ---- AUDIT LOG ---- */
  async createAuditLog(entry) {
    const sb = getSupabase();
    const payload = {
      actor_id: entry.actorId || null,
      actor_name: entry.actorName || null,
      actor_role: entry.actorRole || null,
      action: entry.action,
      entity: entry.entity,
      entity_id: entry.entityId || null,
      summary: entry.summary || null,
      details: entry.details || null,
    };
    const { data, error } = await sb.from('audit_logs').insert(payload).select().single();
    if (error) throw new Error(error.message);
    return mapAuditLog(data);
  },
  async getAuditLogs(limit = 200) {
    const sb = getSupabase();
    const { data, error } = await sb.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(limit);
    if (error) throw new Error(error.message);
    return data.map(mapAuditLog);
  },
};

/* ---------- Audit log helper ---------- */
async function logAudit(action, entity, entityId, summary, details) {
  try {
    const actor = Session.get();
    await DB.createAuditLog({
      actorId: actor ? actor.id : null,
      actorName: actor ? actor.name : 'Unknown',
      actorRole: actor ? actor.role : null,
      action, entity, entityId, summary, details,
    });
  } catch (err) {
    // Don't break the main flow if audit logging fails
    console.warn('Audit log failed:', err.message);
  }
}
