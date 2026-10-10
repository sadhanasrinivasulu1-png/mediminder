import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../hooks/useNotification';
import { 
  User, 
  Mail, 
  Globe, 
  Calendar, 
  ShieldCheck, 
  Bell, 
  Volume2, 
  CheckCircle, 
  AlertCircle 
} from 'lucide-react';

export default function ProfilePage() {
  const { user, updateProfile } = useAuth();
  const { permission, requestPermission, sendBrowserNotification, playChime } = useNotification();

  const [name, setName] = useState(user?.name || '');
  const [timezone, setTimezone] = useState(user?.timezone || 'UTC');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError('');
      setMessage('');
      await updateProfile({ name, timezone });
      setMessage('Profile updated successfully!');
    } catch (err) {
      setError(err.message || 'Error updating profile');
    } finally {
      setSaving(false);
    }
  };

  const handleTestNotification = () => {
    playChime();
    sendBrowserNotification('MediMinder Test Alert', {
      body: 'This is a test notification. Your medicine alarms are active!'
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          User Profile & Preferences
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Manage your account credentials, regional timezone, and reminder alerts.
        </p>
      </div>

      {message && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-2xl text-sm flex items-center space-x-2">
          <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-2xl text-sm flex items-center space-x-2">
          <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left: Account Summary Card */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-5 text-center flex flex-col items-center">
          <div className="w-20 h-20 rounded-full bg-health-100 text-health-700 flex items-center justify-center font-extrabold text-3xl shadow-inner">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>

          <div>
            <h3 className="font-extrabold text-slate-900 text-lg">{user?.name}</h3>
            <p className="text-xs text-slate-500">{user?.email}</p>
          </div>

          <div className="w-full border-t border-slate-100 pt-4 space-y-2 text-left text-xs">
            <div className="flex items-center justify-between text-slate-600">
              <span className="text-slate-400">Account ID:</span>
              <span className="font-mono font-bold text-slate-800">#{user?.id}</span>
            </div>
            <div className="flex items-center justify-between text-slate-600">
              <span className="text-slate-400">Timezone:</span>
              <span className="font-semibold text-slate-800">{user?.timezone || 'UTC'}</span>
            </div>
            <div className="flex items-center justify-between text-slate-600">
              <span className="text-slate-400">Security:</span>
              <span className="font-bold text-emerald-600 flex items-center space-x-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>JWT Active</span>
              </span>
            </div>
          </div>
        </div>

        {/* Right: Profile Edit Form & Notification settings */}
        <div className="md:col-span-2 space-y-6">
          <form onSubmit={handleUpdate} className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-2 border-b border-slate-100 pb-2">
              <User className="w-4 h-4 text-health-600" />
              <span>Personal Details</span>
            </h3>

            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-health-500 text-sm bg-slate-50/50"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                Email Address (Read-Only)
              </label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-100 text-slate-400 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                Timezone (Used for Schedule Timers)
              </label>
              <input
                type="text"
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-health-500 text-sm bg-slate-50/50"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 bg-health-600 hover:bg-health-700 active:bg-health-800 text-white font-bold text-sm rounded-xl shadow-md shadow-health-600/20 transition disabled:opacity-50"
              >
                {saving ? 'Updating...' : 'Save Profile Changes'}
              </button>
            </div>
          </form>

          {/* Notification Diagnostics Box */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-2 border-b border-slate-100 pb-2">
              <Bell className="w-4 h-4 text-health-600" />
              <span>Audio & Notification Settings</span>
            </h3>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
              <div>
                <div className="text-sm font-bold text-slate-900">Desktop Push Notifications</div>
                <div className="text-xs text-slate-500">
                  Status: <span className="font-bold text-health-700 uppercase">{permission}</span>
                </div>
              </div>

              {permission !== 'granted' ? (
                <button
                  type="button"
                  onClick={requestPermission}
                  className="px-4 py-2 bg-health-600 hover:bg-health-700 text-white text-xs font-bold rounded-xl transition"
                >
                  Request Permission
                </button>
              ) : (
                <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">
                  Permission Active
                </span>
              )}
            </div>

            <div className="flex items-center space-x-3 pt-2">
              <button
                type="button"
                onClick={playChime}
                className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition shadow-sm"
              >
                <Volume2 className="w-4 h-4 text-health-600" />
                <span>Test Audio Chime</span>
              </button>

              <button
                type="button"
                onClick={handleTestNotification}
                className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl border border-health-200 bg-health-50 hover:bg-health-100 text-health-800 text-xs font-bold transition shadow-sm"
              >
                <Bell className="w-4 h-4 text-health-600" />
                <span>Send Test Notification</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
