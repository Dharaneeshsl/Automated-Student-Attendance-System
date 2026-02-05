import { useState, useEffect } from "react";
import { 
  Camera, 
  Play, 
  Square, 
  CheckCircle, 
  Calendar,
  User,
  Clock
} from "lucide-react";
import { Student, Attendance as AttendanceType } from "@/shared/types";

export default function Attendance() {
  const [students, setStudents] = useState<Student[]>([]);
  const [attendance, setAttendance] = useState<AttendanceType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedStudent, setSelectedStudent] = useState("");

  useEffect(() => {
    fetchStudents();
    fetchAttendance();
  }, [selectedDate]);

  const fetchStudents = async () => {
    try {
      setError(null);
      const response = await fetch("/api/students");
      const result = await response.json();
      if (result.success) {
        setStudents(result.data);
      } else {
        setError(result.message || "Unable to load students.");
      }
    } catch (error) {
      console.error("Failed to fetch students:", error);
      setError("Unable to load students.");
    }
  };

  const fetchAttendance = async () => {
    try {
      setError(null);
      setActionError(null);
      setLoading(true);
      const response = await fetch(`/api/attendance?date=${selectedDate}`);
      const result = await response.json();
      if (result.success) {
        setAttendance(result.data);
      } else {
        setError(result.message || "Unable to load attendance.");
      }
    } catch (error) {
      console.error("Failed to fetch attendance:", error);
      setError("Unable to load attendance.");
    } finally {
      setLoading(false);
    }
  };

  const markAttendance = async (studentId: string, studentName: string) => {
    try {
      setActionError(null);
      const now = new Date();
      const attendanceData = {
        student_id: studentId,
        student_name: studentName,
        attendance_date: selectedDate,
        attendance_time: now.toTimeString().split(' ')[0],
        status: "present"
      };

      const response = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(attendanceData)
      });

      const result = await response.json();
      
      if (result.success) {
        fetchAttendance();
      } else {
        setActionError(result.message || "Failed to mark attendance");
      }
    } catch (error) {
      console.error("Failed to mark attendance:", error);
      setActionError("Failed to mark attendance");
    }
  };

  const simulateRecognition = () => {
    if (students.length === 0) {
      setActionError("No students registered. Please add students first.");
      return;
    }

    setIsCapturing(true);
    
    // Simulate face recognition delay
    setTimeout(() => {
      const unmarkedStudents = students.filter(student => 
        !attendance.some(att => att.student_id === student.student_id)
      );
      
      if (unmarkedStudents.length > 0) {
        const randomStudent = unmarkedStudents[Math.floor(Math.random() * unmarkedStudents.length)];
        markAttendance(randomStudent.student_id, randomStudent.name);
      } else {
        setActionError("All students have already been marked present today!");
      }
      
      setIsCapturing(false);
    }, 2000);
  };

  const isStudentPresent = (studentId: string) => {
    return attendance.some(att => att.student_id === studentId);
  };

  const getAttendanceRate = () => {
    if (students.length === 0) return 0;
    return Math.round((attendance.length / students.length) * 100);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Attendance Management</h1>
        <p className="text-gray-600">Track student attendance with smart recognition</p>
      </div>

      {/* Date Selection and Stats */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center justify-between">
          <span>{error}</span>
          <button
            type="button"
            onClick={() => {
              fetchStudents();
              fetchAttendance();
            }}
            className="text-sm font-medium text-red-700 hover:text-red-900"
          >
            Retry
          </button>
        </div>
      )}
      {actionError && (
        <div className="bg-amber-50 border border-amber-200 text-amber-700 px-4 py-3 rounded-lg">
          {actionError}
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 shadow-lg">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Calendar className="w-4 h-4 inline mr-2" />
            Select Date
          </label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-green-200 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 font-medium">Present Today</p>
              <p className="text-2xl font-bold text-green-700">{attendance.length}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-blue-200 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 font-medium">Attendance Rate</p>
              <p className="text-2xl font-bold text-blue-700">{getAttendanceRate()}%</p>
            </div>
            <User className="w-8 h-8 text-blue-500" />
          </div>
        </div>
      </div>

      {/* Face Recognition Section */}
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 border border-gray-200 shadow-lg">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Face Recognition Attendance</h2>
          
          <div className="relative mb-6">
            <div className="w-64 h-48 mx-auto bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center border-2 border-dashed border-gray-300">
              {isCapturing ? (
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center animate-pulse">
                    <Camera className="w-8 h-8 text-white" />
                  </div>
                  <p className="text-sm text-gray-600">Scanning for faces...</p>
                </div>
              ) : (
                <div className="text-center">
                  <Camera className="w-16 h-16 mx-auto mb-3 text-gray-400" />
                  <p className="text-sm text-gray-600">Camera feed will appear here</p>
                </div>
              )}
            </div>
          </div>

          <button
            onClick={simulateRecognition}
            disabled={isCapturing || students.length === 0}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 mx-auto ${
              isCapturing || students.length === 0
                ? "bg-gray-400 text-white cursor-not-allowed"
                : "bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 shadow-lg"
            }`}
          >
            {isCapturing ? (
              <>
                <Square className="w-5 h-5" />
                <span>Scanning...</span>
              </>
            ) : (
              <>
                <Play className="w-5 h-5" />
                <span>Start Recognition</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Manual Attendance and Today's Records */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Manual Attendance */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 shadow-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Manual Attendance</h3>
          
          <div className="space-y-4">
            {students.length === 0 && !loading && (
              <div className="text-sm text-gray-600 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
                Add students first to enable manual attendance.
              </div>
            )}
            <select
              value={selectedStudent}
              onChange={(e) => setSelectedStudent(e.target.value)}
              disabled={students.length === 0}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select a student</option>
              {students.map((student) => (
                <option key={student.id} value={`${student.student_id}|${student.name}`}>
                  {student.name} ({student.student_id})
                </option>
              ))}
            </select>

            <button
              onClick={() => {
                if (selectedStudent) {
                  const [studentId, studentName] = selectedStudent.split('|');
                  markAttendance(studentId, studentName);
                  setSelectedStudent("");
                }
              }}
              disabled={!selectedStudent}
              className="w-full px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Mark Present
            </button>
          </div>
        </div>

        {/* Today's Records */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 shadow-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <Clock className="w-5 h-5 mr-2 text-blue-600" />
            Today's Records ({attendance.length})
          </h3>
          
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {attendance.length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                <CheckCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No attendance marked yet</p>
              </div>
            ) : (
              attendance.map((record) => (
                <div key={record.id} className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center">
                      <span className="text-white font-medium text-xs">
                        {record.student_name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <div className="font-medium text-gray-800 text-sm">{record.student_name}</div>
                      <div className="text-xs text-gray-600">ID: {record.student_id}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700 font-medium">
                      Present
                    </div>
                    <div className="text-xs text-gray-500 mt-1">{record.attendance_time}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* All Students Status */}
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 shadow-lg">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">All Students Status</h3>
        
        {loading ? (
          <div className="animate-pulse space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center space-x-3 p-3 rounded-lg">
                <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-300 rounded w-1/4"></div>
                  <div className="h-3 bg-gray-300 rounded w-1/6"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {students.map((student) => {
              const present = isStudentPresent(student.student_id);
              return (
                <div
                  key={student.id}
                  className={`flex items-center justify-between p-3 rounded-lg border transition-all duration-200 ${
                    present
                      ? "bg-gradient-to-r from-green-50 to-emerald-50 border-green-200"
                      : "bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      present
                        ? "bg-gradient-to-r from-green-500 to-emerald-500"
                        : "bg-gradient-to-r from-gray-400 to-slate-400"
                    }`}>
                      <span className="text-white font-medium text-xs">
                        {student.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <div className="font-medium text-gray-800 text-sm">{student.name}</div>
                      <div className="text-xs text-gray-600">ID: {student.student_id}</div>
                    </div>
                  </div>
                  <div className={`text-xs px-2 py-1 rounded-full font-medium ${
                    present
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-600"
                  }`}>
                    {present ? "Present" : "Absent"}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
