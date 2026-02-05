import { useState, useEffect } from "react";
import { Link } from "react-router";
import { 
  Users, 
  CheckSquare, 
  TrendingUp, 
  Calendar,
  UserCheck,
  Clock
} from "lucide-react";
import StatsCard from "@/react-app/components/StatsCard";
import RecentAttendance from "@/react-app/components/RecentAttendance";

interface Stats {
  totalStudents: number;
  todayAttendance: number;
  thisWeekAttendance: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats>({
    totalStudents: 0,
    todayAttendance: 0,
    thisWeekAttendance: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setError(null);
      setLoading(true);
      const response = await fetch("/api/stats");
      const result = await response.json();
      if (result.success) {
        setStats(result.data);
      } else {
        setError(result.message || "Unable to load dashboard statistics.");
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error);
      setError("Unable to load dashboard statistics.");
    } finally {
      setLoading(false);
    }
  };

  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
          Welcome to AttendEase
        </h1>
        <p className="text-gray-600 text-lg">
          Smart Student Attendance Management System
        </p>
        <div className="flex items-center justify-center mt-4 text-gray-500">
          <Calendar className="w-4 h-4 mr-2" />
          <span>{currentDate}</span>
        </div>
      </div>

      {/* Stats Cards */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center justify-between">
          <span>{error}</span>
          <button
            type="button"
            onClick={fetchStats}
            className="text-sm font-medium text-red-700 hover:text-red-900"
          >
            Retry
          </button>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Students"
          value={stats.totalStudents}
          icon={Users}
          color="blue"
          loading={loading}
        />
        <StatsCard
          title="Today's Attendance"
          value={stats.todayAttendance}
          icon={UserCheck}
          color="green"
          loading={loading}
        />
        <StatsCard
          title="This Week"
          value={stats.thisWeekAttendance}
          icon={TrendingUp}
          color="purple"
          loading={loading}
        />
        <StatsCard
          title="Attendance Rate"
          value={stats.totalStudents > 0 ? Math.round((stats.todayAttendance / stats.totalStudents) * 100) : 0}
          icon={CheckSquare}
          color="orange"
          loading={loading}
          suffix="%"
        />
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <RecentAttendance />
        
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 shadow-lg">
          <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <Clock className="w-5 h-5 mr-2 text-blue-600" />
            Quick Actions
          </h3>
          <div className="space-y-3">
            <Link
              to="/attendance"
              className="block w-full p-4 text-left rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 hover:from-blue-100 hover:to-indigo-100 transition-all duration-200"
            >
              <div className="font-medium text-blue-700">Mark Attendance</div>
              <div className="text-sm text-blue-600">Start face recognition for today</div>
            </Link>
            <Link
              to="/students"
              className="block w-full p-4 text-left rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 hover:from-green-100 hover:to-emerald-100 transition-all duration-200"
            >
              <div className="font-medium text-green-700">Add New Student</div>
              <div className="text-sm text-green-600">Register a new student</div>
            </Link>
            <Link
              to="/reports"
              className="block w-full p-4 text-left rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 hover:from-purple-100 hover:to-pink-100 transition-all duration-200"
            >
              <div className="font-medium text-purple-700">Generate Report</div>
              <div className="text-sm text-purple-600">Export attendance data</div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
