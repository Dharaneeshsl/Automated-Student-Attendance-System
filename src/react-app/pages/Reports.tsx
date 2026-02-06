import { useState, useEffect } from "react";
import { 
  Download, 
  Calendar, 
  Filter,
  FileText,
  BarChart3,
  TrendingUp,
  Users
} from "lucide-react";
import { Student, Attendance } from "@/shared/types";

export default function Reports() {
  const [students, setStudents] = useState<Student[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selectedStudent, setSelectedStudent] = useState("");

  useEffect(() => {
    // Set default dates (last 30 days)
    const today = new Date();
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    setDateTo(today.toISOString().split('T')[0]);
    setDateFrom(thirtyDaysAgo.toISOString().split('T')[0]);

    fetchStudents();
    fetchAttendance();
  }, []);

  useEffect(() => {
    if (dateFrom && dateTo) {
      fetchAttendance();
    }
  }, [dateFrom, dateTo, selectedStudent]);

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
      setLoading(true);
      if (dateFrom && dateTo && new Date(dateFrom) > new Date(dateTo)) {
        setAttendance([]);
        return;
      }
      let url = "/api/attendance";
      const params = new URLSearchParams();
      
      if (selectedStudent) {
        params.append("student_id", selectedStudent);
      }
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      const response = await fetch(url);
      const result = await response.json();
      if (result.success) {
        // Filter by date range
        const filtered = result.data.filter((record: Attendance) => {
          const recordDate = new Date(record.attendance_date);
          const fromDate = new Date(dateFrom);
          const toDate = new Date(dateTo);
          return recordDate >= fromDate && recordDate <= toDate;
        });
        setAttendance(filtered);
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

  const generateCSV = () => {
    const headers = ["Student ID", "Student Name", "Date", "Time", "Status"];
    const rows = attendance.map(record => [
      record.student_id,
      record.student_name,
      record.attendance_date,
      record.attendance_time,
      record.status
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `attendance_report_${dateFrom}_to_${dateTo}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getAttendanceStats = () => {
    const totalRecords = attendance.length;
    const uniqueStudents = new Set(attendance.map(record => record.student_id)).size;
    const uniqueDates = new Set(attendance.map(record => record.attendance_date)).size;
    
    const avgDaily = uniqueDates > 0 ? Math.round(totalRecords / uniqueDates) : 0;
    const attendanceRate = students.length > 0 ? Math.round((uniqueStudents / students.length) * 100) : 0;

    return {
      totalRecords,
      uniqueStudents,
      uniqueDates,
      avgDaily,
      attendanceRate
    };
  };

  const getStudentAttendanceSummary = () => {
    const summary = students.map(student => {
      const studentRecords = attendance.filter(record => record.student_id === student.student_id);
      const uniqueDates = new Set(studentRecords.map(record => record.attendance_date)).size;
      const totalPossibleDays = new Set(attendance.map(record => record.attendance_date)).size;
      const attendanceRate = totalPossibleDays > 0 ? Math.round((uniqueDates / totalPossibleDays) * 100) : 0;

      return {
        ...student,
        daysPresent: uniqueDates,
        totalDays: totalPossibleDays,
        attendanceRate
      };
    });

    return summary.sort((a, b) => b.attendanceRate - a.attendanceRate);
  };

  const stats = getAttendanceStats();
  const studentSummary = getStudentAttendanceSummary();
  const hasDateError = Boolean(dateFrom && dateTo && new Date(dateFrom) > new Date(dateTo));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Attendance Reports</h1>
        <p className="text-gray-600">Generate and analyze attendance data</p>
      </div>

      {/* Filters */}
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 shadow-lg">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center justify-between mb-4">
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
        {hasDateError && (
          <div className="bg-amber-50 border border-amber-200 text-amber-700 px-4 py-3 rounded-lg mb-4">
            The start date must be before the end date.
          </div>
        )}
        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <Filter className="w-5 h-5 mr-2 text-blue-600" />
          Report Filters
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Student</label>
            <select
              value={selectedStudent}
              onChange={(e) => setSelectedStudent(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Students</option>
              {students.map((student) => (
                <option key={student.id} value={student.student_id}>
                  {student.name} ({student.student_id})
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex items-end">
            <button
              onClick={generateCSV}
              disabled={attendance.length === 0 || hasDateError}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-4 h-4" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 border border-blue-200 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 font-medium">Total Records</p>
              <p className="text-2xl font-bold text-blue-700">{stats.totalRecords}</p>
            </div>
            <FileText className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 border border-green-200 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 font-medium">Students Present</p>
              <p className="text-2xl font-bold text-green-700">{stats.uniqueStudents}</p>
            </div>
            <Users className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 border border-purple-200 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-600 font-medium">Active Days</p>
              <p className="text-2xl font-bold text-purple-700">{stats.uniqueDates}</p>
            </div>
            <Calendar className="w-8 h-8 text-purple-500" />
          </div>
        </div>

        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 border border-orange-200 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-orange-600 font-medium">Avg Daily</p>
              <p className="text-2xl font-bold text-orange-700">{stats.avgDaily}</p>
            </div>
            <BarChart3 className="w-8 h-8 text-orange-500" />
          </div>
        </div>

        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 border border-indigo-200 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-indigo-600 font-medium">Attendance Rate</p>
              <p className="text-2xl font-bold text-indigo-700">{stats.attendanceRate}%</p>
            </div>
            <TrendingUp className="w-8 h-8 text-indigo-500" />
          </div>
        </div>
      </div>

      {/* Student Summary */}
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">Student Attendance Summary</h3>
        </div>
        
        {loading ? (
          <div className="p-6">
            <div className="animate-pulse space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-300 rounded w-1/4"></div>
                    <div className="h-3 bg-gray-300 rounded w-1/3"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : studentSummary.length === 0 ? (
          <div className="p-8 text-center">
            <FileText className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No data available</h3>
            <p className="text-gray-500">Adjust your filters to see attendance data</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-4 px-6 font-medium text-gray-700">Student</th>
                  <th className="text-left py-4 px-6 font-medium text-gray-700">Department</th>
                  <th className="text-left py-4 px-6 font-medium text-gray-700">Days Present</th>
                  <th className="text-left py-4 px-6 font-medium text-gray-700">Total Days</th>
                  <th className="text-left py-4 px-6 font-medium text-gray-700">Attendance Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {studentSummary.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center">
                          <span className="text-white font-medium text-xs">
                            {student.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{student.name}</div>
                          <div className="text-sm text-gray-500">ID: {student.student_id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-gray-900">{student.department || "—"}</td>
                    <td className="py-4 px-6">
                      <span className="text-green-700 font-medium">{student.daysPresent}</span>
                    </td>
                    <td className="py-4 px-6 text-gray-900">{student.totalDays}</td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              student.attendanceRate >= 80
                                ? "bg-green-500"
                                : student.attendanceRate >= 60
                                ? "bg-yellow-500"
                                : "bg-red-500"
                            }`}
                            style={{ width: `${student.attendanceRate}%` }}
                          ></div>
                        </div>
                        <span className={`text-sm font-medium ${
                          student.attendanceRate >= 80
                            ? "text-green-700"
                            : student.attendanceRate >= 60
                            ? "text-yellow-700"
                            : "text-red-700"
                        }`}>
                          {student.attendanceRate}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
