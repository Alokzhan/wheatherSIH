import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Download, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Bell
} from 'lucide-react';
import { MOCK_ALERTS } from '../data/mockData';
import type { AlertItem } from '../types/weather';
import { generateAlertSummaryPDF, exportToCSV } from '../utils/exportUtils';

export const AlertCenter: React.FC = () => {
  const [alerts, setAlerts] = useState<AlertItem[]>(MOCK_ALERTS);
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchDistrict, setSearchDistrict] = useState<string>('');

  const filteredAlerts = alerts.filter(a => {
    if (severityFilter !== 'all' && a.riskLevel !== severityFilter) return false;
    if (statusFilter !== 'all' && a.status !== statusFilter) return false;
    if (searchDistrict && !a.district.toLowerCase().includes(searchDistrict.toLowerCase())) return false;
    return true;
  });

  const handleAcknowledge = (id: string) => {
    setAlerts(prev => prev.map(a => a.id === id ? {
      ...a,
      acknowledgedBy: 'Disaster Officer DEOC Prayagraj',
      status: 'mitigated' as const
    } : a));
  };

  const handleExportPDF = () => {
    generateAlertSummaryPDF(filteredAlerts);
  };

  const handleExportCSV = () => {
    const csvRows = filteredAlerts.map(a => ({
      Alert_ID: a.id,
      Title: a.title,
      District: a.district,
      Severity: a.riskLevel,
      Issued_At: a.issuedAt,
      Valid_Until: a.validUntil,
      Status: a.status,
      Tehsils: a.affectedTehsils.join('; '),
      Summary: a.summary,
    }));
    exportToCSV(`AstraWatch_Alerts_${Date.now()}.csv`, csvRows);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider block">FR-07 &amp; FR-09 ALERT CENTER</span>
            <h2 className="text-2xl font-black text-slate-100 flex items-center gap-2">
              <Bell className="h-6 w-6 text-red-400 animate-bounce" />
              Active Alerts Bulletin &amp; Dispatch Dispatcher
            </h2>
            <p className="text-xs text-slate-400">
              Severity-based machine-readable hazard warnings, officer acknowledgement workflow, and CSV/PDF export.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleExportPDF}
              className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-lg"
            >
              <Download className="h-4 w-4" />
              Export Bulletin (PDF)
            </button>
            <button
              onClick={handleExportCSV}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2"
            >
              <Download className="h-4 w-4 text-emerald-400" />
              Export CSV
            </button>
          </div>
        </div>

        {/* Filters bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          {/* Search District */}
          <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs">
            <Search className="h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Filter by district (Prayagraj, Varanasi...)"
              value={searchDistrict}
              onChange={(e) => setSearchDistrict(e.target.value)}
              className="w-full bg-transparent text-slate-200 placeholder-slate-500 focus:outline-none"
            />
          </div>

          {/* Severity filter */}
          <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs">
            <Filter className="h-4 w-4 text-slate-400" />
            <span className="text-slate-400 shrink-0">Severity:</span>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="w-full bg-transparent text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-slate-900">All Severities</option>
              <option value="critical" className="bg-slate-900">Critical (Red Alert)</option>
              <option value="severe" className="bg-slate-900">Severe (Orange Warning)</option>
              <option value="moderate" className="bg-slate-900">Moderate (Yellow Alert)</option>
              <option value="low" className="bg-slate-900">Low</option>
            </select>
          </div>

          {/* Status filter */}
          <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs">
            <Clock className="h-4 w-4 text-slate-400" />
            <span className="text-slate-400 shrink-0">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-transparent text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-slate-900">All Statuses</option>
              <option value="active" className="bg-slate-900">Active Warnings</option>
              <option value="mitigated" className="bg-slate-900">Acknowledged / Mitigated</option>
              <option value="archived" className="bg-slate-900">Archived Historical</option>
            </select>
          </div>
        </div>
      </div>

      {/* Alerts Feed */}
      <div className="space-y-4">
        {filteredAlerts.length === 0 ? (
          <div className="glass-panel p-8 text-center rounded-2xl border border-slate-800 text-slate-400 text-sm">
            No alerts match the selected filters.
          </div>
        ) : (
          filteredAlerts.map(alert => {
            const badgeClass = 
              alert.riskLevel === 'critical' ? 'badge-critical' :
              alert.riskLevel === 'severe' ? 'badge-severe' :
              alert.riskLevel === 'moderate' ? 'badge-moderate' : 'badge-low';

            return (
              <div key={alert.id} className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4 hover:border-slate-700 transition-all">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-lg text-xs font-mono font-bold uppercase tracking-wider ${badgeClass}`}>
                      {alert.riskLevel}
                    </span>
                    <span className="text-xs font-mono text-slate-400">{alert.id}</span>
                    <span className="text-xs text-slate-400">District: <strong className="text-slate-200">{alert.district}</strong></span>
                  </div>

                  <div className="text-[11px] text-slate-400 font-mono">
                    Issued: {alert.issuedAt} • Valid: {alert.validUntil}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-slate-100 mb-1">{alert.title}</h3>
                  <p className="text-xs text-slate-300 leading-relaxed mb-3">{alert.summary}</p>

                  <div className="text-xs space-y-1 bg-slate-900/60 p-3 rounded-xl border border-slate-800 mb-3">
                    <span className="text-slate-400 font-bold block mb-1">Recommended Response Actions:</span>
                    {alert.recommendedActions.map((action, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-slate-300">
                        <CheckCircle2 className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                        <span>{action}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
                  <div className="flex items-center gap-2 text-slate-400">
                    <MapPin className="h-3.5 w-3.5 text-cyan-400" />
                    <span>Tehsils: <strong className="text-slate-200">{alert.affectedTehsils.join(', ')}</strong></span>
                  </div>

                  <div className="flex items-center gap-3">
                    {alert.acknowledgedBy ? (
                      <span className="text-[11px] text-emerald-400 font-mono flex items-center gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Acknowledged by {alert.acknowledgedBy}
                      </span>
                    ) : (
                      <button
                        onClick={() => handleAcknowledge(alert.id)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-950 hover:bg-emerald-900 border border-emerald-800 text-emerald-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Acknowledge Alert Dispatch
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
