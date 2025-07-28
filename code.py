```python
import cv2
import face_recognition
import numpy as np
import sqlite3
import pandas as pd
from datetime import datetime
import os

# Directory to store student images
DATASET_DIR = "dataset"
if not os.path.exists(DATASET_DIR):
    os.makedirs(DATASET_DIR)

# Initialize SQLite database
def init_db():
    conn = sqlite3.connect('attendance.db')
    c = conn.cursor()
    c.execute('''CREATE TABLE IF NOT EXISTS students
                 (id INTEGER PRIMARY KEY, name TEXT, encoding BLOB)''')
    c.execute('''CREATE TABLE IF NOT EXISTS attendance
                 (id INTEGER, name TEXT, date TEXT, time TEXT)''')
    conn.commit()
    conn.close()

# Step 1: Collect student face images
def capture_student_image(student_id, student_name):
    cam = cv2.VideoCapture(0)
    print(f"Capturing image for {student_name}. Press 'q' to capture.")
    while True:
        ret, frame = cam.read()
        if not ret:
            print("Error: Camera not accessible")
            break
        cv2.imshow("Capture", frame)
        if cv2.waitKey(1) & 0xFF == ord('q'):
            image_path = f"{DATASET_DIR}/{student_id}_{student_name}.jpg"
            cv2.imwrite(image_path, frame)
            print(f"Image saved: {image_path}")
            break
    cam.release()
    cv2.destroyAllWindows()
    return image_path

# Step 2 & 3: Preprocess and generate face encodings
def generate_face_encoding(image_path):
    image = face_recognition.load_image_file(image_path)
    # Convert to grayscale for preprocessing
    image_gray = cv2.cvtColor(image, cv2.COLOR_RGB2GRAY)
    # Resize to standard size (optional, for consistency)
    image_resized = cv2.resize(image_gray, (0, 0), fx=0.5, fy=0.5)
    # Convert back to RGB for face_recognition
    image_rgb = cv2.cvtColor(image_resized, cv2.COLOR_GRAY2RGB)
    encodings = face_recognition.face_encodings(image_rgb)
    if encodings:
        return encodings[0].tobytes()  # Convert to bytes for SQLite storage
    else:
        print("No face detected in the image")
        return None

# Step 4: Store student data in database
def store_student_data(student_id, student_name, encoding):
    conn = sqlite3.connect('attendance.db')
    c = conn.cursor()
    c.execute("INSERT OR REPLACE INTO students (id, name, encoding) VALUES (?, ?, ?)",
              (student_id, student_name, encoding))
    conn.commit()
    conn.close()

# Step 5: Real-time face recognition
def recognize_faces():
    known_encodings = []
    known_names = []
    known_ids = []
    
    # Load known faces from database
    conn = sqlite3.connect('attendance.db')
    c = conn.cursor()
    c.execute("SELECT id, name, encoding FROM students")
    for row in c.fetchall():
        known_ids.append(row[0])
        known_names.append(row[1])
        encoding = np.frombuffer(row[2], dtype=np.float64)
        known_encodings.append(encoding)
    conn.close()
    
    cam = cv2.VideoCapture(0)
    print("Starting real-time recognition. Press 'q' to stop.")
    while True:
        ret, frame = cam.read()
        if not ret:
            print("Error: Camera not accessible")
            break
        # Convert frame to RGB
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        # Find faces in the frame
        face_locations = face_recognition.face_locations(rgb_frame)
        face_encodings = face_recognition.face_encodings(rgb_frame, face_locations)
        
        for (top, right, bottom, left), face_encoding in zip(face_locations, face_encodings):
            matches = face_recognition.compare_faces(known_encodings, face_encoding, tolerance=0.5)
            name = "Unknown"
            student_id = None
            if True in matches:
                match_index = matches.index(True)
                name = known_names[match_index]
                student_id = known_ids[match_index]
                # Step 6: Log attendance
                log_attendance(student_id, name)
            # Draw rectangle and name on frame
            cv2.rectangle(frame, (left, top), (right, bottom), (0, 255, 0), 2)
            cv2.putText(frame, name, (left, top-10), cv2.FONT_HERSHEY_SIMPLEX, 0.9, (0, 255, 0), 2)
        
        cv2.imshow("Recognition", frame)
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break
    
    cam.release()
    cv2.destroyAllWindows()

# Step 6: Log attendance in database
def log_attendance(student_id, student_name):
    current_date = datetime.now().strftime("%Y-%m-%d")
    current_time = datetime.now().strftime("%H:%M:%S")
    conn = sqlite3.connect('attendance.db')
    c = conn.cursor()
    c.execute("INSERT INTO attendance (id, name, date, time) VALUES (?, ?, ?, ?)",
              (student_id, student_name, current_date, current_time))
    conn.commit()
    conn.close()
    print(f"Attendance logged for {student_name} at {current_time}")

# Step 7: Export attendance report
def export_attendance_report():
    conn = sqlite3.connect('attendance.db')
    df = pd.read_sql_query("SELECT * FROM attendance", conn)
    conn.close()
    report_path = "attendance_report.csv"
    df.to_csv(report_path, index=False)
    print(f"Attendance report exported to {report_path}")

# Main function to run the system
def main():
    init_db()
    
    # Example: Add a student
    student_id = 1
    student_name = "John Doe"
    image_path = capture_student_image(student_id, student_name)
    encoding = generate_face_encoding(image_path)
    if encoding:
        store_student_data(student_id, student_name, encoding)
    
    # Run real-time recognition
    recognize_faces()
    
    # Export attendance report
    export_attendance_report()

if __name__ == "__main__":
    main()
```
