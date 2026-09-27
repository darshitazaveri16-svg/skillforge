import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Compass,
  User,
  LogIn,
  UserPlus,
  LogOut,
  LayoutDashboard,
  Target,
  Briefcase,
  BrainCircuit,
  TrendingUp,
  Map,
  FileText,
  Menu,
  X,
} from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setMobileOpen(false);
  };

  // Close mobile menu on route change
  React.useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-md bg-slate-900/80 border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            <Compass className="w-6 h-6 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-white via-slate-200 to-indigo-300 bg-clip-text text-transparent">
              SkillForge
            </span>
            <span className="text-[10px] text-indigo-400 font-medium tracking-wider uppercase -mt-1">
              Career Readiness Platform
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-2 lg:gap-3">
          {user ? (
            user.role === 'admin' ? (
              // Admin Desktop Navigation
              <>
                <Link
                  to="/admin"
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 rounded-lg transition-colors"
                >
                  <LayoutDashboard className="w-4 h-4 text-rose-400" />
                  Dashboard
                </Link>

                <Link
                  to="/admin/students"
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 rounded-lg transition-colors"
                >
                  <User className="w-4 h-4 text-rose-400" />
                  Students
                </Link>

                <Link
                  to="/admin/careers"
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 rounded-lg transition-colors"
                >
                  <Briefcase className="w-4 h-4 text-rose-400" />
                  Careers
                </Link>

                <Link
                  to="/admin/skills"
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 rounded-lg transition-colors"
                >
                  <BrainCircuit className="w-4 h-4 text-rose-400" />
                  Skills
                </Link>

                <Link
                  to="/admin/questions"
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 rounded-lg transition-colors"
                >
                  <TrendingUp className="w-4 h-4 text-rose-400" />
                  Questions
                </Link>

                <div className="flex items-center gap-2 pl-3 border-l border-slate-800">
                  <div className="flex flex-col text-right hidden lg:flex">
                    <span className="text-sm font-semibold text-white">{user.name}</span>
                    <span className="text-[10px] text-rose-400 font-bold tracking-wider uppercase">
                      Platform Admin
                    </span>
                  </div>

                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-rose-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-md">
                    {user.name ? user.name.charAt(0).toUpperCase() : 'A'}
                  </div>

                  <button
                    onClick={handleLogout}
                    title="Logout"
                    className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 rounded-lg transition-colors ml-1"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              // Student Desktop Navigation
              <>
                <Link
                  to="/careers"
                  className="flex items-center gap-1.5 px-2.5 py-1.5 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 rounded-lg transition-colors"
                >
                  <Briefcase className="w-4 h-4 text-indigo-400" />
                  Careers
                </Link>

                <Link
                  to="/assessment"
                  className="flex items-center gap-1.5 px-2.5 py-1.5 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 rounded-lg transition-colors"
                >
                  <BrainCircuit className="w-4 h-4 text-indigo-400" />
                  Assessment
                </Link>

                <Link
                  to="/readiness"
                  className="flex items-center gap-1.5 px-2.5 py-1.5 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 rounded-lg transition-colors"
                >
                  <TrendingUp className="w-4 h-4 text-indigo-400" />
                  Readiness
                </Link>

                <Link
                  to="/roadmap"
                  className="flex items-center gap-1.5 px-2.5 py-1.5 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 rounded-lg transition-colors"
                >
                  <Map className="w-4 h-4 text-indigo-400" />
                  Learning Roadmap
                </Link>

                <Link
                  to="/resume-analyzer"
                  className="flex items-center gap-1.5 px-2.5 py-1.5 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 rounded-lg transition-colors"
                >
                  <FileText className="w-4 h-4 text-indigo-400" />
                  Resume Analyzer
                </Link>

                <Link
                  to="/dashboard"
                  className="flex items-center gap-1.5 px-2.5 py-1.5 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 rounded-lg transition-colors"
                >
                  <LayoutDashboard className="w-4 h-4 text-indigo-400" />
                  Dashboard
                </Link>

                <Link
                  to="/profile"
                  className="flex items-center gap-1.5 px-2.5 py-1.5 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 rounded-lg transition-colors"
                >
                  <User className="w-4 h-4 text-indigo-400" />
                  Profile
                </Link>

                <div className="flex items-center gap-2 pl-3 border-l border-slate-800">
                  <div className="flex flex-col text-right hidden lg:flex">
                    <span className="text-sm font-semibold text-white">{user.name}</span>
                    <span className="text-[11px] text-indigo-400 font-medium flex items-center justify-end gap-1">
                      <Target className="w-3 h-3" />
                      {user.targetCareer || 'Full Stack Developer'}
                    </span>
                  </div>

                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white font-bold text-xs shadow-md">
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>

                  <button
                    onClick={handleLogout}
                    title="Logout"
                    className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 rounded-lg transition-colors ml-1"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </>
            )
          ) : (
            <>
              <Link
                to="/login"
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 rounded-lg transition-colors"
              >
                <LogIn className="w-4 h-4" />
                Login
              </Link>
              <Link
                to="/register"
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 rounded-lg shadow-md shadow-indigo-600/20 transition-all hover:scale-[1.02]"
              >
                <UserPlus className="w-4 h-4" />
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* Mobile Navigation Toggle */}
        <div className="flex md:hidden items-center gap-2">
          {user && (
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white font-bold text-xs">
              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
          )}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            aria-label="Toggle Navigation Menu"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Dropdown */}
      {mobileOpen && (
        <div className="md:hidden border-t border-slate-800 bg-slate-900/95 backdrop-blur-lg px-4 pt-3 pb-5 space-y-2">
          {user ? (
            user.role === 'admin' ? (
              // Mobile Admin Navigation
              <div className="space-y-1">
                <div className="px-3 py-2 border-b border-slate-800/80 mb-2">
                  <div className="text-sm font-semibold text-white">{user.name}</div>
                  <div className="text-xs text-rose-400 font-bold uppercase tracking-wider">Platform Admin</div>
                </div>
                <Link
                  to="/admin"
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-slate-800 hover:text-white"
                >
                  <LayoutDashboard className="w-4 h-4 text-rose-400" />
                  Dashboard
                </Link>
                <Link
                  to="/admin/students"
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-slate-800 hover:text-white"
                >
                  <User className="w-4 h-4 text-rose-400" />
                  Students
                </Link>
                <Link
                  to="/admin/careers"
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-slate-800 hover:text-white"
                >
                  <Briefcase className="w-4 h-4 text-rose-400" />
                  Careers
                </Link>
                <Link
                  to="/admin/skills"
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-slate-800 hover:text-white"
                >
                  <BrainCircuit className="w-4 h-4 text-rose-400" />
                  Skills
                </Link>
                <Link
                  to="/admin/questions"
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-slate-800 hover:text-white"
                >
                  <TrendingUp className="w-4 h-4 text-rose-400" />
                  Questions
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full mt-3 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-rose-950/40 text-rose-400 border border-rose-800/40 text-sm font-medium"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            ) : (
              // Mobile Student Navigation
              <div className="space-y-1">
                <div className="px-3 py-2 border-b border-slate-800/80 mb-2">
                  <div className="text-sm font-semibold text-white">{user.name}</div>
                  <div className="text-xs text-indigo-400 font-medium flex items-center gap-1 mt-0.5">
                    <Target className="w-3 h-3" />
                    {user.targetCareer || 'Full Stack Developer'}
                  </div>
                </div>
                <Link
                  to="/careers"
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-slate-800 hover:text-white"
                >
                  <Briefcase className="w-4 h-4 text-indigo-400" />
                  Careers
                </Link>
                <Link
                  to="/assessment"
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-slate-800 hover:text-white"
                >
                  <BrainCircuit className="w-4 h-4 text-indigo-400" />
                  Assessment
                </Link>
                <Link
                  to="/readiness"
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-slate-800 hover:text-white"
                >
                  <TrendingUp className="w-4 h-4 text-indigo-400" />
                  Readiness
                </Link>
                <Link
                  to="/roadmap"
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-slate-800 hover:text-white"
                >
                  <Map className="w-4 h-4 text-indigo-400" />
                  Learning Roadmap
                </Link>
                <Link
                  to="/resume-analyzer"
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-slate-800 hover:text-white"
                >
                  <FileText className="w-4 h-4 text-indigo-400" />
                  Resume Analyzer
                </Link>
                <Link
                  to="/dashboard"
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-slate-800 hover:text-white"
                >
                  <LayoutDashboard className="w-4 h-4 text-indigo-400" />
                  Dashboard
                </Link>
                <Link
                  to="/profile"
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-slate-800 hover:text-white"
                >
                  <User className="w-4 h-4 text-indigo-400" />
                  Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full mt-3 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-rose-950/40 text-rose-400 border border-rose-800/40 text-sm font-medium"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            )
          ) : (
            <div className="flex flex-col gap-2 pt-2">
              <Link
                to="/login"
                className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-200 bg-slate-800 rounded-lg hover:bg-slate-700"
              >
                <LogIn className="w-4 h-4" />
                Login
              </Link>
              <Link
                to="/register"
                className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-500"
              >
                <UserPlus className="w-4 h-4" />
                Get Started
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
