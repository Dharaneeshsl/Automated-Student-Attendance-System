import { Hono, type Context } from "hono";
import { zValidator } from "@hono/zod-validator";
import { cors } from "hono/cors";
import type { Env } from "../../worker-configuration";
import {
  CreateStudentSchema,
  CreateAttendanceSchema,
  ApiResponse
} from "@/shared/types";

const app = new Hono<{ Bindings: Env }>();

// Enable CORS for all routes
app.use("*", cors());

/**
 * Builds a consistent JSON error response and logs the underlying
 * error so it surfaces in Workers observability / logs.
 */
const fail = (c: Context<{ Bindings: Env }>, message: string, status = 500, cause?: unknown) => {
  if (cause) console.error(`[${status}] ${message}`, cause);
  return c.json({ success: false, message } as ApiResponse, status as 400 | 404 | 409 | 500);
};

// ---------------------------------------------------------------------------
// Health check
// ---------------------------------------------------------------------------
app.get("/api/health", async (c) => {
  try {
    await c.env.DB.prepare("SELECT 1").first();
    return c.json({
      success: true,
      data: {
        status: "ok",
        timestamp: new Date().toISOString()
      }
    } as ApiResponse);
  } catch (err) {
    return fail(c, "Health check failed", 500, err);
  }
});

// ---------------------------------------------------------------------------
// Students API
// ---------------------------------------------------------------------------
app.get("/api/students", async (c) => {
  try {
    const { results } = await c.env.DB
      .prepare("SELECT * FROM students WHERE is_active = 1 ORDER BY created_at DESC")
      .all();
    return c.json({ success: true, data: results } as ApiResponse);
  } catch (err) {
    return fail(c, "Failed to fetch students", 500, err);
  }
});

app.get("/api/students/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const student = await c.env.DB
      .prepare("SELECT * FROM students WHERE id = ? AND is_active = 1")
      .bind(id)
      .first();

    if (!student) {
      return fail(c, "Student not found", 404);
    }

    return c.json({ success: true, data: student } as ApiResponse);
  } catch (err) {
    return fail(c, "Failed to fetch student", 500, err);
  }
});

app.post("/api/students", zValidator("json", CreateStudentSchema), async (c) => {
  try {
    const studentData = c.req.valid("json");

    // Check if student ID already exists
    const existing = await c.env.DB
      .prepare("SELECT id FROM students WHERE student_id = ?")
      .bind(studentData.student_id)
      .first();

    if (existing) {
      return fail(c, "Student ID already exists", 409);
    }

    const result = await c.env.DB.prepare(`
      INSERT INTO students (student_id, name, email, phone, department, year, face_encoding_data, photo_url, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      studentData.student_id,
      studentData.name,
      studentData.email || null,
      studentData.phone || null,
      studentData.department || null,
      studentData.year || null,
      studentData.face_encoding_data || null,
      studentData.photo_url || null,
      studentData.is_active
    ).run();

    return c.json({
      success: true,
      message: "Student created successfully",
      data: { id: result.meta.last_row_id }
    } as ApiResponse);
  } catch (err) {
    return fail(c, "Failed to create student", 500, err);
  }
});

app.put("/api/students/:id", zValidator("json", CreateStudentSchema), async (c) => {
  try {
    const id = c.req.param("id");
    const studentData = c.req.valid("json");

    // Prevent colliding with another student's ID
    const existing = await c.env.DB
      .prepare("SELECT id FROM students WHERE student_id = ? AND id != ?")
      .bind(studentData.student_id, id)
      .first();

    if (existing) {
      return fail(c, "Student ID already in use by another student", 409);
    }

    const result = await c.env.DB.prepare(`
      UPDATE students
      SET student_id = ?, name = ?, email = ?, phone = ?, department = ?, year = ?,
          face_encoding_data = ?, photo_url = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(
      studentData.student_id,
      studentData.name,
      studentData.email || null,
      studentData.phone || null,
      studentData.department || null,
      studentData.year || null,
      studentData.face_encoding_data || null,
      studentData.photo_url || null,
      studentData.is_active,
      id
    ).run();

    if (result.meta.changes === 0) {
      return fail(c, "Student not found", 404);
    }

    return c.json({
      success: true,
      message: "Student updated successfully"
    } as ApiResponse);
  } catch (err) {
    return fail(c, "Failed to update student", 500, err);
  }
});

app.delete("/api/students/:id", async (c) => {
  try {
    const id = c.req.param("id");

    const result = await c.env.DB
      .prepare("UPDATE students SET is_active = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?")
      .bind(id)
      .run();

    if (result.meta.changes === 0) {
      return fail(c, "Student not found", 404);
    }

    return c.json({
      success: true,
      message: "Student deleted successfully"
    } as ApiResponse);
  } catch (err) {
    return fail(c, "Failed to delete student", 500, err);
  }
});

// ---------------------------------------------------------------------------
// Attendance API
// ---------------------------------------------------------------------------
app.get("/api/attendance", async (c) => {
  try {
    const date = c.req.query("date");
    const studentId = c.req.query("student_id");
    const dateFrom = c.req.query("date_from");
    const dateTo = c.req.query("date_to");

    let query = "SELECT * FROM attendance WHERE 1=1";
    const params: string[] = [];

    if (date) {
      query += " AND attendance_date = ?";
      params.push(date);
    }
    if (studentId) {
      query += " AND student_id = ?";
      params.push(studentId);
    }
    if (dateFrom) {
      query += " AND attendance_date >= ?";
      params.push(dateFrom);
    }
    if (dateTo) {
      query += " AND attendance_date <= ?";
      params.push(dateTo);
    }

    query += " ORDER BY attendance_date DESC, attendance_time DESC";

    const { results } = await c.env.DB.prepare(query).bind(...params).all();

    return c.json({ success: true, data: results } as ApiResponse);
  } catch (err) {
    return fail(c, "Failed to fetch attendance", 500, err);
  }
});

app.post("/api/attendance", zValidator("json", CreateAttendanceSchema), async (c) => {
  try {
    const attendanceData = c.req.valid("json");

    // Check if attendance already exists for this student on this date
    const existing = await c.env.DB.prepare(
      "SELECT id FROM attendance WHERE student_id = ? AND attendance_date = ?"
    ).bind(attendanceData.student_id, attendanceData.attendance_date).first();

    if (existing) {
      return fail(c, "Attendance already marked for this student on this date", 409);
    }

    const result = await c.env.DB.prepare(`
      INSERT INTO attendance (student_id, student_name, attendance_date, attendance_time, status)
      VALUES (?, ?, ?, ?, ?)
    `).bind(
      attendanceData.student_id,
      attendanceData.student_name,
      attendanceData.attendance_date,
      attendanceData.attendance_time,
      attendanceData.status
    ).run();

    return c.json({
      success: true,
      message: "Attendance marked successfully",
      data: { id: result.meta.last_row_id }
    } as ApiResponse);
  } catch (err) {
    return fail(c, "Failed to mark attendance", 500, err);
  }
});

app.delete("/api/attendance/:id", async (c) => {
  try {
    const id = c.req.param("id");

    const result = await c.env.DB
      .prepare("DELETE FROM attendance WHERE id = ?")
      .bind(id)
      .run();

    if (result.meta.changes === 0) {
      return fail(c, "Attendance record not found", 404);
    }

    return c.json({
      success: true,
      message: "Attendance record removed successfully"
    } as ApiResponse);
  } catch (err) {
    return fail(c, "Failed to remove attendance record", 500, err);
  }
});

// ---------------------------------------------------------------------------
// Statistics
// ---------------------------------------------------------------------------
app.get("/api/stats", async (c) => {
  try {
    const totalStudents = await c.env.DB
      .prepare("SELECT COUNT(*) as count FROM students WHERE is_active = 1")
      .first<{ count: number }>();
    const todayAttendance = await c.env.DB
      .prepare("SELECT COUNT(*) as count FROM attendance WHERE attendance_date = date('now')")
      .first<{ count: number }>();
    const thisWeekAttendance = await c.env.DB
      .prepare("SELECT COUNT(*) as count FROM attendance WHERE attendance_date >= date('now', '-7 days')")
      .first<{ count: number }>();

    return c.json({
      success: true,
      data: {
        totalStudents: totalStudents?.count || 0,
        todayAttendance: todayAttendance?.count || 0,
        thisWeekAttendance: thisWeekAttendance?.count || 0
      }
    } as ApiResponse);
  } catch (err) {
    return fail(c, "Failed to fetch statistics", 500, err);
  }
});

export default app;
