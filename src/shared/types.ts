import z from "zod";

// Student schema
export const StudentSchema = z.object({
  id: z.number().optional(),
  student_id: z.string().min(1, "Student ID is required"),
  name: z.string().min(1, "Name is required"),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  department: z.string().optional(),
  year: z.string().optional(),
  face_encoding_data: z.string().optional(),
  photo_url: z.string().optional(),
  is_active: z.boolean().default(true),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

export const CreateStudentSchema = StudentSchema.omit({ id: true, created_at: true, updated_at: true });

export type Student = z.infer<typeof StudentSchema>;
export type CreateStudent = z.infer<typeof CreateStudentSchema>;

// Attendance schema
export const AttendanceSchema = z.object({
  id: z.number().optional(),
  student_id: z.string(),
  student_name: z.string(),
  attendance_date: z.string(),
  attendance_time: z.string(),
  status: z.string().default("present"),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

export const CreateAttendanceSchema = AttendanceSchema.omit({ id: true, created_at: true, updated_at: true });

export type Attendance = z.infer<typeof AttendanceSchema>;
export type CreateAttendance = z.infer<typeof CreateAttendanceSchema>;

// API Response schemas
export const ApiResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  data: z.any().optional(),
});

export type ApiResponse = z.infer<typeof ApiResponseSchema>;
