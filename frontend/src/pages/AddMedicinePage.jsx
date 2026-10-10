import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { useReminders } from '../context/ReminderContext';
import { 
  Pill, 
  Clock, 
  Calendar, 
  Plus, 
  Trash2, 
  ArrowLeft, 
  AlertCircle,
  CheckCircle2,
  HelpCircle
} from 'lucide-react';

const DAYS_OF_WEEK = [
  { label: 'Sun', value: 0 },
  { label: 'Mon', value: 1 },
  { label: 'Tue', value: 2 },
  { label: 'Wed', value: 3 },
  { label: 'Thu', value: 4 },
  { label: 'Fri', value: 5 },
  { label: 'Sat', value: 6 },
];

export default function AddMedicinePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');
  const { refreshReminders } = useReminders();

  const [medicineName, setMedicineName] = useState('');
  const [dosage, setDosage] = useState('');
  const [instructions, setInstructions] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState('');
  const [isContinuous, setIsContinuous] = useState(true);
  const [frequency, setFrequency] = useState('daily');
  const [selectedDays, setSelectedDays] = useState([1, 2, 3, 4, 5]); // Mon-Fri default
  const [reminderTimes, setReminderTimes] = useState(['08:00']);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isFetchingEdit, setIsFetchingEdit] = useState(false);

  useEffect(() => {
    if (editId) {
      setIsFetchingEdit(true);
      api.medicines.getById(editId)
        .then(res => {
          if (res.success && res.medicine) {
            const m = res.medicine;
            setMedicineName(m.medicine_name);
            setDosage(m.dosage);
            setInstructions(m.instructions || '');
            setStartDate(m.start_date.split('T')[0]);
            if (m.end_date) {
              setEndDate(m.end_date.split('T')[0]);
              setIsContinuous(false);
            } else {
              setIsContinuous(true);
            }
            setFrequency(m.frequency || 'daily');

            if (m.reminder_times && m.reminder_times.length > 0) {
              const times = m.reminder_times.map(t => t.reminder_time.slice(0, 5));
              setReminderTimes([...new Set(times)]);
              const days = m.reminder_times
                .filter(t => t.day_of_week !== null)
                .map(t => t.day_of_week);
              if (days.length > 0) {
                setSelectedDays([...new Set(days)]);
              }
            }
          }
        })
        .catch(err => {
          setError('Failed to load existing medicine: ' + err.message);
        })
        .finally(() => setIsFetchingEdit(false));
    }
  }, [editId]);

  const handleAddTime = () => {
    setReminderTimes([...reminderTimes, '12:00']);
  };

  const handleRemoveTime = (index) => {
    if (reminderTimes.length === 1) return;
    setReminderTimes(reminderTimes.filter((_, i) => i !== index));
  };

  const handleTimeChange = (index, value) => {
    const updated = [...reminderTimes];
    updated[index] = value;
    setReminderTimes(updated);
  };

  const toggleDay = (dayVal) => {
    if (selectedDays.includes(dayVal)) {
      if (selectedDays.length === 1) return; // keep at least one
      setSelectedDays(selectedDays.filter(d => d !== dayVal));
    } else {
      setSelectedDays([...selectedDays, dayVal].sort());
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!medicineName || !dosage || !startDate) {
      setError('Please provide medicine name, dosage, and start date.');
      return;
    }

    if (reminderTimes.length === 0) {
      setError('Please set at least one reminder time.');
      return;
    }

    try {
      setLoading(true);
      setError('');

      // Build reminder_times payload
      let timesPayload = [];
      if (frequency === 'daily') {
        timesPayload = reminderTimes.map(t => ({
          reminder_time: t,
          day_of_week: null
        }));
      } else {
        // For specific days, create slots for each selected day
        for (const day of selectedDays) {
          for (const t of reminderTimes) {
            timesPayload.push({
              reminder_time: t,
              day_of_week: day
            });
          }
        }
      }

      const payload = {
        medicine_name: medicineName,
        dosage,
        instructions,
        start_date: startDate,
        end_date: isContinuous ? null : (endDate || null),
        frequency,
        reminder_times: timesPayload
      };

      if (editId) {
        await api.medicines.update(editId, payload);
      } else {
        await api.medicines.create(payload);
      }

      await refreshReminders();
      navigate('/schedules');
    } catch (err) {
      setError(err.message || 'Error saving medicine schedule.');
    } finally {
      setLoading(false);
    }
  };

  if (isFetchingEdit) {
    return (
      <div className="py-20 text-center">
        <div className="w-8 h-8 border-4 border-health-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-sm text-slate-500">Loading schedule details...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex items-center space-x-3">
        <Link
          to="/schedules"
          className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            {editId ? 'Edit Medicine Schedule' : 'Add New Medicine Schedule'}
          </h1>
          <p className="text-xs text-slate-500">
            Set dosage, recurring frequency, and customizable reminder times.
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-2xl text-sm flex items-start space-x-2">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-500 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-8 space-y-6">
        {/* Section 1: Medicine Details */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-2 border-b border-slate-100 pb-2">
            <Pill className="w-4 h-4 text-health-600" />
            <span>Medication Info</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                Medicine Name *
              </label>
              <input
                type="text"
                value={medicineName}
                onChange={(e) => setMedicineName(e.target.value)}
                placeholder="e.g. Metformin, Lisinopril, Amoxicillin"
                required
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-health-500 text-sm bg-slate-50/50"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                Dosage Instructions *
              </label>
              <input
                type="text"
                value={dosage}
                onChange={(e) => setDosage(e.target.value)}
                placeholder="e.g. 500mg, 1 tablet, 10ml, 2 drops"
                required
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-health-500 text-sm bg-slate-50/50"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
              Special Instructions (Optional)
            </label>
            <textarea
              rows={2}
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="e.g. Take with full glass of water after food. Avoid dairy products."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-health-500 text-sm bg-slate-50/50"
            />
          </div>
        </div>

        {/* Section 2: Frequency & Dates */}
        <div className="space-y-4 pt-2">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-2 border-b border-slate-100 pb-2">
            <Calendar className="w-4 h-4 text-health-600" />
            <span>Frequency & Duration</span>
          </h3>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setFrequency('daily')}
              className={`p-3.5 rounded-xl border text-sm font-bold text-center transition ${
                frequency === 'daily'
                  ? 'bg-health-50 border-health-500 text-health-700 shadow-sm'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              Every Day (Daily)
            </button>

            <button
              type="button"
              onClick={() => setFrequency('specific_days')}
              className={`p-3.5 rounded-xl border text-sm font-bold text-center transition ${
                frequency === 'specific_days'
                  ? 'bg-health-50 border-health-500 text-health-700 shadow-sm'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              Specific Days of Week
            </button>
          </div>

          {frequency === 'specific_days' && (
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Select Scheduled Days:</span>
              <div className="flex flex-wrap gap-2">
                {DAYS_OF_WEEK.map((d) => {
                  const isSelected = selectedDays.includes(d.value);
                  return (
                    <button
                      key={d.value}
                      type="button"
                      onClick={() => toggleDay(d.value)}
                      className={`w-11 h-11 rounded-xl text-xs font-bold transition flex items-center justify-center ${
                        isSelected
                          ? 'bg-health-600 text-white shadow-md'
                          : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {d.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                Start Date *
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-health-500 text-sm bg-slate-50/50"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">
                  End Date
                </label>
                <label className="inline-flex items-center space-x-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isContinuous}
                    onChange={(e) => setIsContinuous(e.target.checked)}
                    className="rounded text-health-600 focus:ring-health-500 h-3.5 w-3.5"
                  />
                  <span className="text-xs text-slate-500">Continuous (Ongoing)</span>
                </label>
              </div>
              <input
                type="date"
                disabled={isContinuous}
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate}
                className={`w-full px-4 py-2.5 rounded-xl border text-sm transition ${
                  isContinuous 
                    ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed' 
                    : 'bg-slate-50/50 border-slate-200 focus:outline-none focus:ring-2 focus:ring-health-500'
                }`}
              />
            </div>
          </div>
        </div>

        {/* Section 3: Reminder Times */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-2">
              <Clock className="w-4 h-4 text-health-600" />
              <span>Reminder Times</span>
            </h3>
            <button
              type="button"
              onClick={handleAddTime}
              className="inline-flex items-center space-x-1 text-xs font-bold text-health-600 hover:text-health-700 hover:underline"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Another Time</span>
            </button>
          </div>

          <p className="text-xs text-slate-500">
            MediMinder supports multiple daily reminders. You will receive real-time alerts for each time slot.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {reminderTimes.map((timeStr, idx) => (
              <div key={idx} className="flex items-center space-x-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <input
                  type="time"
                  value={timeStr}
                  onChange={(e) => handleTimeChange(idx, e.target.value)}
                  required
                  className="w-full bg-white px-3 py-1.5 rounded-lg border border-slate-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-health-500"
                />
                {reminderTimes.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveTime(idx)}
                    title="Remove this time slot"
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Submit Actions */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-3">
          <Link
            to="/schedules"
            className="px-5 py-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-sm font-semibold transition"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-health-600 hover:bg-health-700 active:bg-health-800 text-white font-bold text-sm rounded-xl shadow-lg shadow-health-600/30 transition disabled:opacity-50"
          >
            {loading ? 'Saving Schedule...' : (editId ? 'Update Schedule' : 'Save Medicine Schedule')}
          </button>
        </div>
      </form>
    </div>
  );
}
