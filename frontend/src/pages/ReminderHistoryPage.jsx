import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { 
  History, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Clock, 
  Calendar, 
  Filter, 
  Check, 
  Pill,
  Award
} from 'lucide-react';

export default function ReminderHistoryPage() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const res = await api.reminders.getHistory(params);
      if (res.success) {
        setHistory(res.history || []);
      }
    } catch (err) {
      console.error('Error fetching history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [statusFilter, startDate, endDate]);

  // Calculate compliance statistics
  const totalCount = history.length;
  const takenCount = history.filter(h => h.status === 'taken').length;
  const skippedCount = history.filter(h => h.status === 'skipped').length;
  const missedCount = history.filter(h => h.status === 'missed').length;
  const complianceRate = totalCount > 0 ? Math.round((takenCount / totalCount) * 100) : 100;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Medication History & Compliance
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Complete audit trail of taken, skipped, and missed medication doses.
          </p>
        </div>
      </div>

      {/* Compliance Overview Card */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-health-100 text-health-600 flex items-center justify-center shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900">{complianceRate}%</div>
            <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Adherence Rate</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-emerald-700">{takenCount}</div>
            <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Doses Taken</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
            <XCircle className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-700">{skippedCount}</div>
            <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Doses Skipped</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-rose-700">{missedCount}</div>
            <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Doses Missed</div>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1">Filter Status:</span>
          {[
            { label: 'All Statuses', value: '' },
            { label: 'Taken', value: 'taken' },
            { label: 'Skipped', value: 'skipped' },
            { label: 'Missed', value: 'missed' },
            { label: 'Scheduled', value: 'scheduled' }
          ].map(f => (
            <button
              key={f.value}
              onClick={() => setStatusFilter(f.value)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                statusFilter === f.value
                  ? 'bg-health-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="flex items-center space-x-2 w-full md:w-auto justify-end">
          <div className="flex items-center space-x-1.5 text-xs text-slate-500">
            <Calendar className="w-3.5 h-3.5" />
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs"
              placeholder="From"
            />
            <span>to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs"
              placeholder="To"
            />
          </div>
          {(startDate || endDate || statusFilter) && (
            <button
              onClick={() => { setStartDate(''); setEndDate(''); setStatusFilter(''); }}
              className="text-xs text-health-600 hover:underline font-semibold ml-2"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* History Log Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 text-center">
            <div className="w-10 h-10 border-4 border-health-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-sm text-slate-500">Retrieving compliance logs...</p>
          </div>
        ) : history.length === 0 ? (
          <div className="py-16 text-center px-4">
            <div className="w-16 h-16 rounded-2xl bg-health-50 text-health-600 flex items-center justify-center mx-auto mb-4">
              <History className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-slate-800">No History Records Found</h3>
            <p className="text-sm text-slate-500 max-w-sm mx-auto mt-1">
              Records will automatically appear here once scheduled reminders are marked or pass their scheduled time.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50/80 text-xs uppercase font-bold text-slate-400 tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-4 px-6">Scheduled Date & Time</th>
                  <th className="py-4 px-6">Medicine & Dosage</th>
                  <th className="py-4 px-6">Outcome Status</th>
                  <th className="py-4 px-6">Action Recorded At</th>
                  <th className="py-4 px-6">Special Instructions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {history.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-4 px-6 whitespace-nowrap">
                      <div className="font-bold text-slate-900">
                        {new Date(item.scheduled_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                      <div className="text-xs text-slate-400 flex items-center space-x-1 mt-0.5">
                        <Clock className="w-3 h-3" />
                        <span>{new Date(item.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </td>

                    <td className="py-4 px-6">
                      <div className="font-bold text-slate-900">{item.medicine_name}</div>
                      <div className="text-xs text-health-700 font-semibold">{item.dosage}</div>
                    </td>

                    <td className="py-4 px-6 whitespace-nowrap">
                      {item.status === 'taken' && (
                        <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Taken</span>
                        </span>
                      )}
                      {item.status === 'skipped' && (
                        <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Skipped</span>
                        </span>
                      )}
                      {item.status === 'missed' && (
                        <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>Missed</span>
                        </span>
                      )}
                      {item.status === 'scheduled' && (
                        <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-health-100 text-health-800">
                          <Clock className="w-3.5 h-3.5" />
                          <span>Scheduled</span>
                        </span>
                      )}
                    </td>

                    <td className="py-4 px-6 whitespace-nowrap text-xs text-slate-500">
                      {item.action_at ? (
                        <div>
                          <div>{new Date(item.action_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                          <div className="text-[11px] text-slate-400">{new Date(item.action_at).toLocaleDateString()}</div>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Pending user action</span>
                      )}
                    </td>

                    <td className="py-4 px-6 max-w-xs text-xs text-slate-500">
                      {item.instructions || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
