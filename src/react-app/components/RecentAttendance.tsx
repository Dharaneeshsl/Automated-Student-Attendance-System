import { useState, useEffect } from "react";
import { Clock, User } from "lucide-react";
import { Attendance } from "@/shared/types";

export default function RecentAttendance() {
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecentAttendance();
  }, []);

  const fetchRecentAttendance = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await fetch(`/api/attendance?date=${today}`);
      const result = await response.json();
      if (result.success) {
        setAttendance(result.data.slice(0, 5)); // Show only last 5
      }
    } catch (error) {
      console.error("Failed to fetch recent attendance:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 shadow-lg">
        <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
          <Clock className="w-5 h-5 mr-2 text-blue-600" />
          Recent Attendance
        </h3>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse flex items-center space-x-3 p-3 rounded-lg">
              <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                <div className="h-3 bg-gray-300 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 shadow-lg">
      <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
        <Clock className="w-5 h-5 mr-2 text-blue-600" />
        Today's Attendance
      </h3>
      
      {attendance.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <User className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No attendance marked today</p>
        </div>
      ) : (
        <div className="space-y-3">
          {attendance.map((record) => (
            <div key={record.id} className="flex items-center space-x-3 p-3 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center">
                <span className="text-white font-medium text-sm">
                  {record.student_name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1">
                <div className="font-medium text-gray-800">{record.student_name}</div>
                <div className="text-sm text-gray-600">
                  ID: {record.student_id} • {record.attendance_time}
                </div>
              </div>
              <div className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700 font-medium">
                Present
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
