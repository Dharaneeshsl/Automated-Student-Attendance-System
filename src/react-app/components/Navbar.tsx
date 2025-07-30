import { Link, useLocation } from "react-router";
import { 
  Home, 
  Users, 
  CheckSquare, 
  BarChart3, 
  GraduationCap 
} from "lucide-react";

export default function Navbar() {
  const location = useLocation();

  const navItems = [
    { path: "/", label: "Dashboard", icon: Home },
    { path: "/students", label: "Students", icon: Users },
    { path: "/attendance", label: "Attendance", icon: CheckSquare },
    { path: "/reports", label: "Reports", icon: BarChart3 },
  ];

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                AttendEase
              </h1>
              <p className="text-xs text-gray-500">Smart Attendance</p>
            </div>
          </Link>

          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                    isActive
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg"
                      : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Mobile menu - simplified for now */}
          <div className="md:hidden">
            <div className="text-sm text-gray-600">Menu</div>
          </div>
        </div>
      </div>
    </nav>
  );
}
