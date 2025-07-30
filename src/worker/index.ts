import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { cors } from "hono/cors";
import { 
  CreateStudentSchema, 
  CreateAttendanceSchema,
  ApiResponse 
} from "@/shared/types";

const app = new Hono<{ Bindings: Env }>();

// Enable CORS for all routes
app.use("*", cors());

// Students API
app.get("/api/students", async (c) => {
  try {
    const db = c.env.DB;
    const students = await db.prepare("SELECT * FROM students WHERE is_active = 1 ORDER BY created_at DESC").all();
    
    return c.json({
      success: true,
      data: students.results
    } as ApiResponse);
  } catch (error) {
    return c.json({
      success: false,
      message: "Failed to fetch students"
    } as ApiResponse, 500);
  }
});

app.post("/api/students", zValidator("json", CreateStudentSchema), async (c) => {
  try {
    const db = c.env.DB;
    const studentData = c.req.valid("json");
    
    // Check if student ID already exists
    const existing = await db.prepare("SELECT id FROM students WHERE student_id = ?").first(studentData.student_id);
    if (existing) {
      return c.json({
        success: false,
        message: "Student ID already exists"
      } as ApiResponse, 409);
    }
    
    const result = await db.prepare(`
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
  } catch (error) {
    return c.json({
      success: false,
      message: "Failed to create student"
    } as ApiResponse, 500);
  }
});

app.put("/api/students/:id", zValidator("json", CreateStudentSchema), async (c) => {
  try {
    const db = c.env.DB;
    const id = c.req.param("id");
    const studentData = c.req.valid("json");
    
    const result = await db.prepare(`
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
      return c.json({
        success: false,
        message: "Student not found"
      } as ApiResponse, 404);
    }
    
    return c.json({
      success: true,
      message: "Student updated successfully"
    } as ApiResponse);
  } catch (error) {
    return c.json({
      success: false,
      message: "Failed to update student"
    } as ApiResponse, 500);
  }
});

app.delete("/api/students/:id", async (c) => {
  try {
    const db = c.env.DB;
    const id = c.req.param("id");
    
    const result = await db.prepare("UPDATE students SET is_active = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?").bind(id).run();
    
    if (result.meta.changes === 0) {
      return c.json({
        success: false,
        message: "Student not found"
      } as ApiResponse, 404);
    }
    
    return c.json({
      success: true,
      message: "Student deleted successfully"
    } as ApiResponse);
  } catch (error) {
    return c.json({
      success: false,
      message: "Failed to delete student"
    } as ApiResponse, 500);
  }
});

// Attendance API
app.get("/api/attendance", async (c) => {
  try {
    const db = c.env.DB;
    const date = c.req.query("date");
    const studentId = c.req.query("student_id");
    
    let query = "SELECT * FROM attendance WHERE 1=1";
    const params: any[] = [];
    
    if (date) {
      query += " AND attendance_date = ?";
      params.push(date);
    }
    
    if (studentId) {
      query += " AND student_id = ?";
      params.push(studentId);
    }
    
    query += " ORDER BY attendance_date DESC, attendance_time DESC";
    
    const attendance = await db.prepare(query).bind(...params).all();
    
    return c.json({
      success: true,
      data: attendance.results
    } as ApiResponse);
  } catch (error) {
    return c.json({
      success: false,
      message: "Failed to fetch attendance"
    } as ApiResponse, 500);
  }
});

app.post("/api/attendance", zValidator("json", CreateAttendanceSchema), async (c) => {
  try {
    const db = c.env.DB;
    const attendanceData = c.req.valid("json");
    
    // Check if attendance already exists for this student on this date
    const existing = await db.prepare(
      "SELECT id FROM attendance WHERE student_id = ? AND attendance_date = ?"
    ).bind(attendanceData.student_id, attendanceData.attendance_date).first();
    
    if (existing) {
      return c.json({
        success: false,
        message: "Attendance already marked for this student today"
      } as ApiResponse, 409);
    }
    
    const result = await db.prepare(`
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
  } catch (error) {
    return c.json({
      success: false,
      message: "Failed to mark attendance"
    } as ApiResponse, 500);
  }
});

// Get attendance statistics
app.get("/api/stats", async (c) => {
  try {
    const db = c.env.DB;
    
    const totalStudents = await db.prepare("SELECT COUNT(*) as count FROM students WHERE is_active = 1").first();
    const todayAttendance = await db.prepare("SELECT COUNT(*) as count FROM attendance WHERE attendance_date = date('now')").first();
    const thisWeekAttendance = await db.prepare("SELECT COUNT(*) as count FROM attendance WHERE attendance_date >= date('now', '-7 days')").first();
    
    return c.json({
      success: true,
      data: {
        totalStudents: totalStudents?.count || 0,
        todayAttendance: todayAttendance?.count || 0,
        thisWeekAttendance: thisWeekAttendance?.count || 0
      }
    } as ApiResponse);
  } catch (error) {
    return c.json({
      success: false,
      message: "Failed to fetch statistics"
    } as ApiResponse, 500);
  }
});

export default app;
