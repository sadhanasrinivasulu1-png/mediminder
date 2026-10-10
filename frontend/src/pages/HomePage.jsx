import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  HeartPulse, 
  ShieldCheck, 
  Clock, 
  Bell, 
  CheckCircle2, 
  Calendar, 
  Smartphone, 
  ArrowRight,
  Pill
} from 'lucide-react';

export default function HomePage() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-health-50 via-white to-slate-50 pt-16 pb-20 lg:pt-24 lg:pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Hero Text */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center space-x-2 bg-health-100/80 border border-health-200 text-health-800 px-4 py-1.5 rounded-full text-xs font-bold tracking-wide uppercase">
                <HeartPulse className="w-4 h-4 text-health-600 animate-pulse-subtle" />
                <span>Next-Gen Healthcare Medication Manager</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight">
                Never Miss a Dose. <br />
                <span className="text-health-600">Health on Schedule.</span>
              </h1>

              <p className="text-lg text-slate-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                MediMinder is your intelligent daily medication companion. Schedule multiple daily dosages, receive real-time audio and browser alerts, and track medication compliance effortlessly.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
                {isAuthenticated ? (
                  <Link
                    to="/dashboard"
                    className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 bg-health-600 hover:bg-health-700 text-white font-bold px-8 py-3.5 rounded-xl shadow-lg shadow-health-600/30 transition transform hover:-translate-y-0.5"
                  >
                    <span>Go to Dashboard</span>
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                ) : (
                  <>
                    <Link
                      to="/register"
                      className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 bg-health-600 hover:bg-health-700 text-white font-bold px-8 py-3.5 rounded-xl shadow-lg shadow-health-600/30 transition transform hover:-translate-y-0.5"
                    >
                      <span>Start Free Today</span>
                      <ArrowRight className="w-5 h-5" />
                    </Link>
                    <Link
                      to="/login"
                      className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 bg-white hover:bg-slate-100 text-slate-700 font-semibold px-8 py-3.5 rounded-xl border border-slate-300 shadow-sm transition"
                    >
                      <span>Demo Login</span>
                    </Link>
                  </>
                )}
              </div>

              {/* Trust Badges */}
              <div className="pt-6 grid grid-cols-3 gap-4 border-t border-slate-200/80 text-left">
                <div>
                  <div className="text-2xl font-extrabold text-health-700">100%</div>
                  <div className="text-xs text-slate-500 font-medium">On-Time Accuracy</div>
                </div>
                <div>
                  <div className="text-2xl font-extrabold text-health-700">Multi-Time</div>
                  <div className="text-xs text-slate-500 font-medium">Daily Reminders</div>
                </div>
                <div>
                  <div className="text-2xl font-extrabold text-health-700">Zero Dups</div>
                  <div className="text-xs text-slate-500 font-medium">Conflict-Free Engine</div>
                </div>
              </div>
            </div>

            {/* Right Column: Interactive Card Preview */}
            <div className="lg:col-span-5">
              <div className="relative mx-auto max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200/80 p-6 space-y-5">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-health-600 text-white flex items-center justify-center shadow-md">
                      <Pill className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">Today's Schedule</h4>
                      <p className="text-xs text-slate-400">3 medications pending</p>
                    </div>
                  </div>
                  <span className="flex h-3 w-3 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                  </span>
                </div>

                {/* Sample items */}
                <div className="space-y-3">
                  <div className="p-3.5 rounded-2xl bg-health-50 border border-health-100 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-900 text-sm">Amoxicillin (500mg)</div>
                      <div className="text-xs text-slate-500">After food with water • 08:00 AM</div>
                    </div>
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-100/80 px-2.5 py-1 rounded-full">
                      Taken
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-white border border-slate-200 flex items-center justify-between shadow-sm">
                    <div>
                      <div className="font-bold text-slate-900 text-sm">Vitamin D3 (2000 IU)</div>
                      <div className="text-xs text-slate-500">Morning routine • 09:00 AM</div>
                    </div>
                    <span className="text-xs font-bold text-health-700 bg-health-100 px-2.5 py-1 rounded-full">
                      Due Now
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between opacity-80">
                    <div>
                      <div className="font-bold text-slate-900 text-sm">Lisinopril (10mg)</div>
                      <div className="text-xs text-slate-500">Evening dose • 08:30 PM</div>
                    </div>
                    <span className="text-xs font-bold text-slate-500 bg-slate-200/80 px-2.5 py-1 rounded-full">
                      Upcoming
                    </span>
                  </div>
                </div>

                <div className="bg-slate-900 text-white rounded-xl p-4 text-xs flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Bell className="w-4 h-4 text-health-400" />
                    <span>Real-Time Chimes Active</span>
                  </div>
                  <span className="text-health-400 font-bold">Node-Cron Sync</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-16 bg-white border-t border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-extrabold text-slate-900">Engineered for Your Well-being</h2>
            <p className="mt-2 text-slate-500 text-sm">
              Comprehensive medication management designed for patients, caregivers, and health-conscious individuals.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-6 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-health-100 text-health-600 flex items-center justify-center">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Custom Scheduling</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Add multiple reminder times per day, specify frequency (daily or specific days of the week), and set start and end dates.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-6 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-health-100 text-health-600 flex items-center justify-center">
                <Bell className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Audio & Push Alerts</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Receive browser push notifications and soft pleasant chimes the moment your medication is due, even with dashboard minimized.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-6 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-health-100 text-health-600 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Compliance History</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Log taken, skipped, and missed doses with timestamps. Export and review adherence history anytime with your doctor.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
