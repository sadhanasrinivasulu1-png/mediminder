import React from 'react';
import { HeartPulse, ShieldCheck, Clock, BellRing } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-health-600 flex items-center justify-center text-white">
                <HeartPulse className="w-5 h-5" />
              </div>
              <span className="font-bold text-lg text-slate-900">
                Medi<span className="text-health-600">Minder</span>
              </span>
            </div>
            <p className="text-sm text-slate-500 max-w-sm">
              Your reliable, secure healthcare companion. Stay on track with daily medications, doses, and customizable alerts.
            </p>
            <div className="flex items-center space-x-4 text-xs text-slate-400 pt-2">
              <span className="flex items-center space-x-1">
                <ShieldCheck className="w-4 h-4 text-health-600" />
                <span>JWT Secured</span>
              </span>
              <span className="flex items-center space-x-1">
                <Clock className="w-4 h-4 text-health-600" />
                <span>Node-Cron Scheduled</span>
              </span>
              <span className="flex items-center space-x-1">
                <BellRing className="w-4 h-4 text-health-600" />
                <span>Real-Time Alerts</span>
              </span>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-slate-900 text-sm mb-3">Quick Links</h4>
            <ul className="space-y-2 text-sm text-slate-600">
              <li><Link to="/dashboard" className="hover:text-health-600">Dashboard</Link></li>
              <li><Link to="/schedules" className="hover:text-health-600">Medicine Schedules</Link></li>
              <li><Link to="/add-medicine" className="hover:text-health-600">Add New Medicine</Link></li>
              <li><Link to="/history" className="hover:text-health-600">Compliance History</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-slate-900 text-sm mb-3">Health & Security</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              MediMinder complies with privacy standards. Reminders are securely tracked per account with encrypted authentication.
            </p>
            <div className="mt-3 text-xs text-slate-400">
              &copy; {new Date().getFullYear()} MediMinder Health Systems. All rights reserved.
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
