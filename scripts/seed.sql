-- ---------------------------------------------------------------------------
-- AttendEase demo seed data
-- Safe to run repeatedly: uses INSERT OR IGNORE so existing rows are skipped.
-- ---------------------------------------------------------------------------

INSERT OR IGNORE INTO students
  (student_id, name, email, phone, department, year)
VALUES
  ('STU-1001', 'Aarav Sharma',   'aarav.sharma@example.com',   '+91 90000 10001', 'Computer Science', '3rd Year'),
  ('STU-1002', 'Priya Patel',    'priya.patel@example.com',    '+91 90000 10002', 'Computer Science', '3rd Year'),
  ('STU-1003', 'Rohan Verma',    'rohan.verma@example.com',    '+91 90000 10003', 'Electronics',      '2nd Year'),
  ('STU-1004', 'Ananya Iyer',    'ananya.iyer@example.com',    '+91 90000 10004', 'Mechanical',       '4th Year'),
  ('STU-1005', 'Karan Mehta',    'karan.mehta@example.com',    '+91 90000 10005', 'Computer Science', '1st Year'),
  ('STU-1006', 'Sneha Reddy',    'sneha.reddy@example.com',    '+91 90000 10006', 'Electronics',      '3rd Year'),
  ('STU-1007', 'Vikram Singh',   'vikram.singh@example.com',   '+91 90000 10007', 'Mechanical',       '2nd Year'),
  ('STU-1008', 'Divya Nair',     'divya.nair@example.com',     '+91 90000 10008', 'Civil',            '4th Year');

INSERT OR IGNORE INTO attendance
  (student_id, student_name, attendance_date, attendance_time, status)
VALUES
  ('STU-1001', 'Aarav Sharma', date('now'),        '09:05:00', 'present'),
  ('STU-1002', 'Priya Patel',  date('now'),        '09:07:00', 'present'),
  ('STU-1003', 'Rohan Verma',  date('now'),        '09:10:00', 'present'),
  ('STU-1004', 'Ananya Iyer',  date('now'),        '09:12:00', 'present'),
  ('STU-1001', 'Aarav Sharma', date('now', '-1 day'), '09:02:00', 'present'),
  ('STU-1002', 'Priya Patel',  date('now', '-1 day'), '09:06:00', 'present'),
  ('STU-1005', 'Karan Mehta',  date('now', '-1 day'), '09:15:00', 'present'),
  ('STU-1001', 'Aarav Sharma', date('now', '-2 days'), '09:00:00', 'present'),
  ('STU-1003', 'Rohan Verma',  date('now', '-2 days'), '09:11:00', 'present'),
  ('STU-1006', 'Sneha Reddy',  date('now', '-2 days'), '09:20:00', 'present');
