import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useReminders } from '../context/ReminderContext';
import { useNotification } from '../hooks/useNotification';
import StatCard from '../components/StatCard';
import { 
  Pill, 
  CalendarClock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Plus, 
  RefreshCw, 
  Clock, 
  Check, 
  X, 
  Bell, 
  BellRing,
  Volume2
} from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();
  const { 
    todayReminders, 
    stats, 
    loading, 
    markReminderStatus, 
    refreshReminders 
  } = useReminders();
  const { permission, requestPermission, playChime } = useNotification();

  const [refreshing, setRefreshing] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshReminders();
    setRefreshing(false);
  };

  const handleStatusChange = async (id, status) => {
    try {
      setUpdatingId(id);
      await markReminderStatus(id, status);
    } catch (e) {
      alert(e.message || 'Error updating reminder');
    } finally {
      setUpdatingId(null);
    }
  };

  // Check for overdue reminders (scheduled time in past but still 'scheduled')
  const now = new Date().getTime();
  const overdueReminders = todayReminders.filter(
    r => r.status === 'scheduled' && new Date(r.scheduled_at).getTime() < now
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Welcome & Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Good day, {user?.name || 'Patient'} 👋
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Here is your daily medication adherence and scheduled reminders for today.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={playChime}
            title="Test reminder chime sound"
            className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:text-health-600 hover:bg-slate-50 transition"
          >
            <Volume2 className="w-5 h-5" />
          </button>

          <button
            onClick={handleRefresh}
            disabled={refreshing || loading}
            className="flex items-center space-x-2 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold transition shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-health-600' : ''}`} />
            <span>Refresh</span>
          </button>

          <Link
            to="/add-medicine"
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-health-600 hover:bg-health-700 text-white text-sm font-bold shadow-md shadow-health-600/20 transition"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Add Medicine</span>
          </Link>
        </div>
      </div>

      {/* Overdue Warning Alert Banner if any */}
      {overdueReminders.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start sm:items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-amber-900">
                You have {overdueReminders.length} overdue medication reminder{overdueReminders.length > 1 ? 's' : ''}!
              </h4>
              <p className="text-xs text-amber-700 mt-0.5">
                Check today's list below and mark whether you took or skipped your dose.
              </p>
            </div>
          </div>
          <span className="text-xs font-bold bg-amber-200 text-amber-900 px-3 py-1 rounded-full whitespace-nowrap">
            Action Needed
          </span>
        </div>
      )}

      {/* Browser Notification Prompt if not granted */}
      {permission !== 'granted' && (
        <div className="bg-health-50 border border-health-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-health-600 text-white flex items-center justify-center shrink-0">
              <BellRing className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">Enable Desktop Reminder Alerts</h4>
              <p className="text-xs text-slate-600 mt-0.5">
                Allow browser alerts to receive notifications right on time when your medications are due.
              </p>
            </div>
          </div>
          <button
            onClick={requestPermission}
            className="text-xs bg-health-600 hover:bg-health-700 text-white font-bold px-4 py-2 rounded-xl transition shadow-sm whitespace-nowrap"
          >
            Allow Notifications
          </button>
        </div>
      )}

      {/* Dashboard Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Total Medicines"
          value={stats.totalMedicines}
          icon={Pill}
          color="blue"
          subtitle="In your regimen"
        />
        <StatCard
          title="Today's Scheduled"
          value={stats.todayReminders}
          icon={CalendarClock}
          color="indigo"
          subtitle="Doses planned today"
        />
        <StatCard
          title="Upcoming Reminders"
          value={stats.upcomingReminders}
          icon={Clock}
          color="amber"
          subtitle="Pending later today"
        />
        <StatCard
          title="Doses Taken"
          value={stats.takenReminders}
          icon={CheckCircle}
          color="green"
          subtitle="Confirmed taken"
        />
        <StatCard
          title="Skipped / Missed"
          value={stats.skippedMissedReminders}
          icon={XCircle}
          color="rose"
          subtitle="Missed or skipped"
        />
      </div>

      {/* Today's Scheduled Reminders Table/Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900">Today's Scheduled Medicines</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Live updates of all medicine slots scheduled for {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-400 font-medium">
              {todayReminders.length} reminder{todayReminders.length !== 1 ? 's' : ''} today
            </span>
          </div>
        </div>

        {todayReminders.length === 0 ? (
          <div className="py-16 text-center px-4">
            <div className="w-16 h-16 rounded-2xl bg-health-50 text-health-600 flex items-center justify-center mx-auto mb-4">
              <Pill className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-slate-800">No Reminders Scheduled for Today</h3>
            <p className="text-sm text-slate-500 max-w-sm mx-auto mt-1 mb-6">
              You haven't scheduled any medications for today, or today's schedule has not been generated yet.
            </p>
            <Link
              to="/add-medicine"
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-health-600 hover:bg-health-700 text-white text-sm font-bold shadow-md transition"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Schedule a Medicine</span>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50/80 text-xs uppercase font-bold text-slate-400 tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-4 px-6">Scheduled Time</th>
                  <th className="py-4 px-6">Medicine & Dosage</th>
                  <th className="py-4 px-6">Instructions</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {todayReminders.map((reminder) => {
                  const remTime = new Date(reminder.scheduled_at);
                  const isPast = remTime.getTime() < now;
                  const isScheduled = reminder.status === 'scheduled';
                  const isOverdue = isScheduled && isPast;

                  return (
                    <tr 
                      key={reminder.id}
                      className={`hover:bg-slate-50/80 transition ${
                        isOverdue ? 'bg-amber-50/30' : ''
                      }`}
                    >
                      {/* Scheduled Time */}
                      <td className="py-4 px-6 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <Clock className={`w-4 h-4 ${isOverdue ? 'text-amber-500' : 'text-slate-400'}`} />
                          <span className={`font-bold ${isOverdue ? 'text-amber-700' : 'text-slate-900'}`}>
                            {remTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </td>

                      {/* Medicine & Dosage */}
                      <td className="py-4 px-6">
                        <div className="font-bold text-slate-900">{reminder.medicine_name}</div>
                        <div className="text-xs text-health-700 font-semibold">{reminder.dosage}</div>
                      </td>

                      {/* Instructions */}
                      <td className="py-4 px-6 max-w-xs">
                        <span className="text-xs text-slate-500 line-clamp-2">
                          {reminder.instructions || 'No specific instructions'}
                        </span>
                      </td>

                      {/* Status Pill */}
                      <td className="py-4 px-6 whitespace-nowrap">
                        {reminder.status === 'taken' && (
                          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>Taken</span>
                          </span>
                        )}
                        {reminder.status === 'skipped' && (
                          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Skipped</span>
                          </span>
                        )}
                        {reminder.status === 'missed' && (
                          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            <span>Missed</span>
                          </span>
                        )}
                        {reminder.status === 'scheduled' && (
                          isOverdue ? (
                            <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 animate-pulse">
                              <AlertTriangle className="w-3.5 h-3.5" />
                              <span>Overdue</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-health-100 text-health-800">
                              <Clock className="w-3.5 h-3.5" />
                              <span>Scheduled</span>
                            </span>
                          )
                        )}
                      </td>

                      {/* Action buttons */}
                      <td className="py-4 px-6 text-right whitespace-nowrap">
                        {reminder.status === 'scheduled' ? (
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => handleStatusChange(reminder.id, 'taken')}
                              disabled={updatingId === reminder.id}
                              className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-sm"
                            >
                              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                              <span>Taken</span>
                            </button>
                            <button
                              onClick={() => handleStatusChange(reminder.id, 'skipped')}
                              disabled={updatingId === reminder.id}
                              className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition"
                            >
                              <X className="w-3.5 h-3.5 text-slate-400 stroke-[2.5]" />
                              <span>Skip</span>
                            </button>
                          </div>
                        ) : (
                          <div className="text-xs text-slate-400">
                            {reminder.action_at ? `Logged at ${new Date(reminder.action_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'Completed'}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
