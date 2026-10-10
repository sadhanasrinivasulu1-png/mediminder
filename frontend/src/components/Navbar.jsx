import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../hooks/useNotification';
import { 
  Pill, 
  LayoutDashboard, 
  CalendarDays, 
  PlusCircle, 
  History, 
  User, 
  LogOut, 
  Menu, 
  X, 
  Bell, 
  BellOff,
  HeartPulse
} from 'lucide-react';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const { permission, requestPermission } = useNotification();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center">
            <Link to={isAuthenticated ? "/dashboard" : "/"} className="flex items-center space-x-2.5">
              <div className="w-10 h-10 rounded-xl bg-health-600 flex items-center justify-center text-white shadow-md shadow-health-600/20">
                <HeartPulse className="w-6 h-6 animate-pulse-subtle" />
              </div>
              <span className="font-extrabold text-xl tracking-tight text-slate-900">
                Medi<span className="text-health-600">Minder</span>
              </span>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          {isAuthenticated ? (
            <div className="hidden md:flex items-center space-x-1 lg:space-x-2">
              <Link
                to="/dashboard"
                className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition ${
                  isActive('/dashboard') 
                    ? 'bg-health-50 text-health-700' 
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Dashboard</span>
              </Link>

              <Link
                to="/schedules"
                className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition ${
                  isActive('/schedules') 
                    ? 'bg-health-50 text-health-700' 
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <CalendarDays className="w-4 h-4" />
                <span>Schedules</span>
              </Link>

              <Link
                to="/add-medicine"
                className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition ${
                  isActive('/add-medicine') 
                    ? 'bg-health-50 text-health-700' 
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <PlusCircle className="w-4 h-4" />
                <span>Add Medicine</span>
              </Link>

              <Link
                to="/history"
                className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition ${
                  isActive('/history') 
                    ? 'bg-health-50 text-health-700' 
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <History className="w-4 h-4" />
                <span>History</span>
              </Link>
            </div>
          ) : (
            <div className="hidden md:flex items-center space-x-4">
              <Link
                to="/"
                className={`text-sm font-semibold px-3 py-2 rounded-lg transition ${
                  isActive('/') ? 'text-health-700 font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Home
              </Link>
            </div>
          )}

          {/* Right Action Buttons */}
          <div className="hidden md:flex items-center space-x-3">
            {isAuthenticated ? (
              <>
                {/* Browser Notification Permission Button */}
                {permission !== 'granted' && (
                  <button
                    onClick={requestPermission}
                    title="Enable browser push notifications"
                    className="flex items-center space-x-1 text-xs bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-1.5 rounded-full hover:bg-amber-100 transition"
                  >
                    <BellOff className="w-3.5 h-3.5 text-amber-600" />
                    <span>Enable Alerts</span>
                  </button>
                )}

                {/* Profile Link */}
                <Link
                  to="/profile"
                  className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg border text-sm font-medium transition ${
                    isActive('/profile')
                      ? 'border-health-500 bg-health-50 text-health-700'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="w-7 h-7 rounded-full bg-health-100 text-health-700 flex items-center justify-center font-bold text-xs">
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <span className="max-w-[120px] truncate">{user?.name || 'Profile'}</span>
                </Link>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  title="Sign out"
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="text-sm font-semibold text-slate-700 hover:text-health-600 px-3 py-2"
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="text-sm font-semibold bg-health-600 text-white px-4 py-2 rounded-lg hover:bg-health-700 shadow-sm transition"
                >
                  Create Account
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-2 pb-4 space-y-1 shadow-lg">
          {isAuthenticated ? (
            <>
              <div className="px-3 py-2 mb-2 bg-health-50 rounded-lg flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-800 text-sm">{user?.name}</div>
                  <div className="text-xs text-slate-500">{user?.email}</div>
                </div>
                {permission !== 'granted' && (
                  <button
                    onClick={requestPermission}
                    className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded"
                  >
                    Enable Alerts
                  </button>
                )}
              </div>

              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                <LayoutDashboard className="w-5 h-5 text-health-600" />
                <span>Dashboard</span>
              </Link>

              <Link
                to="/schedules"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                <CalendarDays className="w-5 h-5 text-health-600" />
                <span>Medicine Schedules</span>
              </Link>

              <Link
                to="/add-medicine"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                <PlusCircle className="w-5 h-5 text-health-600" />
                <span>Add Medicine</span>
              </Link>

              <Link
                to="/history"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                <History className="w-5 h-5 text-health-600" />
                <span>Reminder History</span>
              </Link>

              <Link
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                <User className="w-5 h-5 text-health-600" />
                <span>My Profile</span>
              </Link>

              <div className="pt-2 border-t border-slate-100 mt-2">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium text-rose-600 hover:bg-rose-50"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Log Out</span>
                </button>
              </div>
            </>
          ) : (
            <div className="space-y-2 pt-2">
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-100"
              >
                Home
              </Link>
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-100"
              >
                Log In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-semibold bg-health-600 text-white text-center shadow-sm"
              >
                Sign Up Free
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
