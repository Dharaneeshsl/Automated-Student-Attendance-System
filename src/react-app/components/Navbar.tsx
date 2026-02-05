import { Link, useLocation } from "react-router";
import { useEffect, useState } from "react";
import {
  Home,
  Users,
  CheckSquare,
  BarChart3,
  GraduationCap,
  Menu,
  X
} from "lucide-react";

export default function Navbar() {
  const location = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const navItems = [
    { path: "/", label: "Dashboard", icon: Home },
    { path: "/students", label: "Students", icon: Users },
    { path: "/attendance", label: "Attendance", icon: CheckSquare },
    { path: "/reports", label: "Reports", icon: BarChart3 },
  ];

  const isActivePath = (path: string) =>
    location.pathname === path || location.pathname.startsWith(`${path}/`);

  useEffect(() => {
    setIsMobileOpen(false);
  }, [location.pathname]);

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
              const isActive = isActivePath(item.path);
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  aria-current={isActive ? "page" : undefined}
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

          <div className="md:hidden">
            <button
              type="button"
              onClick={() => setIsMobileOpen((prev) => !prev)}
              className="inline-flex items-center justify-center p-2 rounded-lg text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-colors"
              aria-label={isMobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={isMobileOpen}
            >
              {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
        {isMobileOpen && (
          <>
            <button
              type="button"
              aria-hidden
              className="md:hidden fixed inset-0 bg-black/20"
              onClick={() => setIsMobileOpen(false)}
            />
            <div className="md:hidden pb-4 relative z-10">
              <div className="flex flex-col space-y-2 bg-white/90 backdrop-blur-sm rounded-xl p-3 shadow-lg border border-gray-200">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = isActivePath(item.path);
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setIsMobileOpen(false)}
                      aria-current={isActive ? "page" : undefined}
                      className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
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
            </div>
          </>
        )}
      </div>
    </nav>
  );
}
