import { BrowserRouter as Router, Routes, Route } from "react-router";
import { useState, useEffect } from "react";
import Navbar from "@/react-app/components/Navbar";
import Dashboard from "@/react-app/pages/Dashboard";
import Students from "@/react-app/pages/Students";
import Attendance from "@/react-app/pages/Attendance";
import Reports from "@/react-app/pages/Reports";

export default function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate app initialization
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center animate-pulse">
            <span className="text-white font-bold text-xl">AE</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">AttendEase</h1>
          <p className="text-gray-600">Smart Attendance Management</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/students" element={<Students />} />
            <Route path="/attendance" element={<Attendance />} />
            <Route path="/reports" element={<Reports />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
