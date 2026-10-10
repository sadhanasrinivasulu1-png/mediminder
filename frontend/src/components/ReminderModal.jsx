import React from 'react';
import { useReminders } from '../context/ReminderContext';
import { Pill, Check, X, Clock, AlertCircle } from 'lucide-react';

export default function ReminderModal() {
  const { activeAlertReminder, dismissAlert, markReminderStatus } = useReminders();

  if (!activeAlertReminder) return null;

  const handleTaken = async () => {
    await markReminderStatus(activeAlertReminder.id, 'taken');
  };

  const handleSkipped = async () => {
    await markReminderStatus(activeAlertReminder.id, 'skipped');
  };

  const scheduledTimeStr = new Date(activeAlertReminder.scheduled_at).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden transform transition-all animate-bounce-short">
        {/* Header with blue gradient */}
        <div className="bg-gradient-to-r from-health-600 to-health-700 p-6 text-white text-center relative">
          <div className="w-16 h-16 mx-auto bg-white/20 rounded-full flex items-center justify-center mb-3 backdrop-blur-md shadow-inner">
            <Pill className="w-8 h-8 text-white" />
          </div>
          <span className="inline-block px-3 py-1 bg-white/20 text-xs font-semibold rounded-full uppercase tracking-wider mb-2">
            Medication Alert
          </span>
          <h3 className="text-2xl font-extrabold tracking-tight">Time for your Medicine!</h3>
          <p className="text-health-100 text-sm mt-1">Scheduled for {scheduledTimeStr}</p>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4">
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Medicine</span>
              <span className="text-lg font-bold text-slate-900">{activeAlertReminder.medicine_name}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Dosage</span>
              <span className="text-sm font-semibold text-health-700 bg-health-50 px-2.5 py-0.5 rounded-full border border-health-200">
                {activeAlertReminder.dosage}
              </span>
            </div>
            {activeAlertReminder.instructions && (
              <div className="pt-2 border-t border-slate-200/60 mt-2 text-xs text-slate-600 flex items-start space-x-1.5">
                <AlertCircle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <span>{activeAlertReminder.instructions}</span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              onClick={handleTaken}
              className="flex items-center justify-center space-x-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold rounded-xl shadow-md shadow-emerald-600/20 transition"
            >
              <Check className="w-5 h-5 stroke-[2.5]" />
              <span>Mark Taken</span>
            </button>

            <button
              onClick={handleSkipped}
              className="flex items-center justify-center space-x-2 py-3 px-4 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 font-bold rounded-xl border border-slate-200 transition"
            >
              <X className="w-5 h-5 text-slate-500 stroke-[2.5]" />
              <span>Skip Dose</span>
            </button>
          </div>

          <div className="text-center pt-1">
            <button
              onClick={dismissAlert}
              className="text-xs text-slate-400 hover:text-slate-600 font-medium underline transition"
            >
              Snooze / Dismiss for now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
