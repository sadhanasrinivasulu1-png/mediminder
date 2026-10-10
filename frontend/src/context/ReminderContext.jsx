import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { api } from '../services/api';
import { useAuth } from './AuthContext';
import { useNotification } from '../hooks/useNotification';

const ReminderContext = createContext(null);

export function ReminderProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const { sendBrowserNotification } = useNotification();

  const [todayReminders, setTodayReminders] = useState([]);
  const [stats, setStats] = useState({
    totalMedicines: 0,
    todayReminders: 0,
    upcomingReminders: 0,
    takenReminders: 0,
    skippedMissedReminders: 0
  });
  const [activeAlertReminder, setActiveAlertReminder] = useState(null);
  const [loading, setLoading] = useState(false);

  // Set to keep track of reminders alerted during current browser session
  const alertedIdsRef = useRef(new Set());

  const fetchRemindersAndStats = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      setLoading(true);
      const [todayRes, statsRes] = await Promise.all([
        api.reminders.getToday(),
        api.reminders.getStats()
      ]);

      if (todayRes.success) {
        setTodayReminders(todayRes.reminders || []);
        checkForDueReminders(todayRes.reminders || []);
      }
      if (statsRes.success) {
        setStats(statsRes.stats);
      }
    } catch (err) {
      console.warn('Error fetching reminders/stats:', err.message);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Check if any reminder is scheduled right now (due or overdue within last 2 hours)
  const checkForDueReminders = useCallback((reminders) => {
    const now = new Date().getTime();

    for (const rem of reminders) {
      if (rem.status === 'scheduled') {
        const remTime = new Date(rem.scheduled_at).getTime();
        // If scheduled within the last 30 minutes and not alerted yet
        const diffMinutes = (now - remTime) / (1000 * 60);

        if (diffMinutes >= 0 && diffMinutes <= 60 && !alertedIdsRef.current.has(rem.id)) {
          alertedIdsRef.current.add(rem.id);
          setActiveAlertReminder(rem);

          sendBrowserNotification(`Time to take ${rem.medicine_name}!`, {
            body: `Dosage: ${rem.dosage}. ${rem.instructions || 'Please take your medication as scheduled.'}`,
            tag: `med-${rem.id}`
          });
          break; // Show one modal at a time
        }
      }
    }
  }, [sendBrowserNotification]);

  // Poll every 30 seconds for live updates
  useEffect(() => {
    if (!isAuthenticated) return;

    fetchRemindersAndStats();
    const interval = setInterval(() => {
      fetchRemindersAndStats();
    }, 30000);

    return () => clearInterval(interval);
  }, [isAuthenticated, fetchRemindersAndStats]);

  const markReminderStatus = async (reminderId, status) => {
    try {
      const res = await api.reminders.updateStatus(reminderId, status);
      if (res.success) {
        // Update local list
        setTodayReminders(prev => prev.map(r => r.id === reminderId ? { ...r, status, action_at: new Date().toISOString() } : r));
        if (activeAlertReminder && activeAlertReminder.id === reminderId) {
          setActiveAlertReminder(null);
        }
        // Refresh metrics
        api.reminders.getStats().then(s => s.success && setStats(s.stats));
      }
      return res;
    } catch (err) {
      console.error('Failed to update reminder status:', err);
      throw err;
    }
  };

  const dismissAlert = () => {
    setActiveAlertReminder(null);
  };

  return (
    <ReminderContext.Provider value={{
      todayReminders,
      stats,
      loading,
      activeAlertReminder,
      dismissAlert,
      markReminderStatus,
      refreshReminders: fetchRemindersAndStats
    }}>
      {children}
    </ReminderContext.Provider>
  );
}

export function useReminders() {
  const context = useContext(ReminderContext);
  if (!context) {
    throw new Error('useReminders must be used within a ReminderProvider');
  }
  return context;
}
