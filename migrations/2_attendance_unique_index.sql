-- Enforce one attendance record per student per date at the database level.
-- This mirrors the application-level 409 check and prevents duplicate marks.
CREATE UNIQUE INDEX IF NOT EXISTS idx_attendance_student_date_unique
  ON attendance(student_id, attendance_date);
