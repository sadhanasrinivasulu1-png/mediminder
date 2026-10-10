import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useReminders } from '../context/ReminderContext';
import { 
  Pill, 
  Plus, 
  Calendar, 
  Clock, 
  Edit3, 
  Trash2, 
  Search, 
  AlertCircle,
  CalendarDays
} from 'lucide-react';

const DAYS_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function MedicineSchedulePage() {
  const navigate = useNavigate();
  const { refreshReminders } = useReminders();

  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState('');

  const fetchMedicines = async () => {
    try {
      setLoading(true);
      const res = await api.medicines.getAll();
      if (res.success) {
        setMedicines(res.medicines || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch medicines');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedicines();
  }, []);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete the schedule for "${name}"? This will also remove upcoming reminders.`)) {
      return;
    }

    try {
      setDeletingId(id);
      await api.medicines.delete(id);
      setMedicines(prev => prev.filter(m => m.id !== id));
      await refreshReminders();
    } catch (err) {
      alert('Error deleting medicine: ' + err.message);
    } finally {
      setDeletingId(null);
    }
  };

  const filteredMedicines = medicines.filter(m => 
    m.medicine_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.dosage.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (m.instructions && m.instructions.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Medicine Schedules
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage your active medications, timing presets, and dosage frequencies.
          </p>
        </div>

        <Link
          to="/add-medicine"
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-health-600 hover:bg-health-700 text-white text-sm font-bold shadow-md shadow-health-600/20 transition self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Add New Medicine</span>
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center bg-white rounded-2xl border border-slate-200/80 px-4 py-2 shadow-sm">
        <Search className="w-5 h-5 text-slate-400 mr-2.5" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by medicine name, dosage, or instructions..."
          className="w-full bg-transparent text-sm focus:outline-none placeholder-slate-400"
        />
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-2xl text-sm flex items-start space-x-2">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-500 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="py-20 text-center">
          <div className="w-10 h-10 border-4 border-health-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm text-slate-500">Loading your schedules...</p>
        </div>
      ) : filteredMedicines.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-health-50 text-health-600 flex items-center justify-center mx-auto mb-4">
            <Pill className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">
            {searchTerm ? 'No matching medicines found' : 'No medicines scheduled yet'}
          </h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto mt-1 mb-6">
            {searchTerm ? 'Try a different search keyword.' : 'Add your first medication to activate automatic reminders.'}
          </p>
          <Link
            to="/add-medicine"
            className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-health-600 hover:bg-health-700 text-white text-sm font-bold shadow-md transition"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Create First Schedule</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMedicines.map((med) => {
            // Format times
            const timesList = med.reminder_times || [];
            const timeLabels = timesList.map(t => {
              const [h, m] = t.reminder_time.split(':');
              const hourNum = parseInt(h, 10);
              const ampm = hourNum >= 12 ? 'PM' : 'AM';
              const displayHour = hourNum % 12 || 12;
              return `${displayHour}:${m} ${ampm}`;
            });

            // Format specific days if applicable
            const specificDays = timesList
              .filter(t => t.day_of_week !== null)
              .map(t => DAYS_NAMES[t.day_of_week]);
            const uniqueDays = [...new Set(specificDays)];

            return (
              <div
                key={med.id}
                className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between"
              >
                <div className="space-y-4">
                  {/* Top: Name & Action Buttons */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center space-x-3">
                      <div className="w-11 h-11 rounded-2xl bg-health-50 text-health-600 flex items-center justify-center shrink-0 border border-health-100">
                        <Pill className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-extrabold text-slate-900 text-lg leading-tight">
                          {med.medicine_name}
                        </h3>
                        <span className="inline-block mt-0.5 text-xs font-bold text-health-700 bg-health-50 px-2.5 py-0.5 rounded-full border border-health-200">
                          {med.dosage}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => navigate(`/add-medicine?edit=${med.id}`)}
                        title="Edit schedule"
                        className="p-2 text-slate-400 hover:text-health-600 hover:bg-health-50 rounded-lg transition"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(med.id, med.medicine_name)}
                        disabled={deletingId === med.id}
                        title="Delete schedule"
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Instructions */}
                  {med.instructions && (
                    <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 italic">
                      "{med.instructions}"
                    </div>
                  )}

                  {/* Frequency & Days */}
                  <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
                    <div className="flex items-center justify-between text-slate-600">
                      <span className="font-semibold flex items-center space-x-1.5 text-slate-500">
                        <CalendarDays className="w-3.5 h-3.5 text-health-600" />
                        <span>Frequency</span>
                      </span>
                      <span className="font-bold text-slate-900 capitalize">
                        {med.frequency === 'daily' ? 'Daily' : `Specific Days (${uniqueDays.join(', ')})`}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-slate-600">
                      <span className="font-semibold flex items-center space-x-1.5 text-slate-500">
                        <Calendar className="w-3.5 h-3.5 text-health-600" />
                        <span>Duration</span>
                      </span>
                      <span className="text-slate-800 font-medium">
                        {new Date(med.start_date).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                        {' → '}
                        {med.end_date ? new Date(med.end_date).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) : 'Ongoing'}
                      </span>
                    </div>
                  </div>

                  {/* Reminder Times Chips */}
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      Scheduled Daily Times ({timeLabels.length})
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {timeLabels.length > 0 ? (
                        timeLabels.map((t, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 text-xs font-semibold"
                          >
                            <Clock className="w-3 h-3 text-health-600" />
                            <span>{t}</span>
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-slate-400">No times set</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-400">
                    Added {new Date(med.created_at).toLocaleDateString()}
                  </span>
                  <Link
                    to={`/add-medicine?edit=${med.id}`}
                    className="text-health-600 font-bold hover:underline"
                  >
                    Modify →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
