import React, { useState } from 'react';
import { reportService } from '../services/api';
import { FileSpreadsheet, Download, Printer, Play, Calendar, RefreshCw, Table } from 'lucide-react';

const Reports = ({ showNotification }) => {
  const [reportType, setReportType] = useState('Staff Report');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [reportResult, setReportResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await reportService.generate(reportType, fromDate, toDate);
      setReportResult(data);
      showNotification(`${reportType} generated successfully with ${data.total_records} records.`, 'success');
    } catch (err) {
      showNotification('Failed to generate report', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadCSV = () => {
    if (!reportResult || !reportResult.data || reportResult.data.length === 0) {
      showNotification('No report data available to download.', 'error');
      return;
    }

    const rows = reportResult.data;
    const headers = Object.keys(rows[0]);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => headers.map((h) => `"${r[h] ?? ''}"`).join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${reportType.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showNotification('CSV file downloaded successfully!', 'success');
  };

  const handlePrintPDF = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900/80 p-6 rounded-3xl border border-slate-800 shadow-xl no-print">
        <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
          <FileSpreadsheet className="w-7 h-7 text-blue-400" />
          Report Generation Center
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          Generate, preview, and download custom system reports for Staff, Shifts, Schedules, Leaves, and Attendance.
        </p>
      </div>

      {/* Report Options Form */}
      <div className="bg-slate-900/80 p-6 rounded-3xl border border-slate-800 shadow-xl space-y-4 no-print">
        <form onSubmit={handleGenerate} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          {/* Report Type */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Select Report Type *
            </label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500 font-medium"
            >
              <option value="Staff Report">1. Staff Report</option>
              <option value="Shift Report">2. Shift Report</option>
              <option value="Schedule Report">3. Schedule Report</option>
              <option value="Leave Report">4. Leave Report</option>
              <option value="Attendance Report">5. Attendance Report</option>
            </select>
          </div>

          {/* From Date */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              From Date
            </label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* To Date */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              To Date
            </label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Generate Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold text-sm shadow-lg shadow-blue-900/40 transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Play className="w-4 h-4 fill-current" />
            )}
            <span>Generate Report</span>
          </button>
        </form>
      </div>

      {/* Generated Report Output View */}
      {reportResult && (
        <div className="bg-slate-900/80 rounded-3xl border border-slate-800 shadow-xl p-6 space-y-4 print-area">
          {/* Header Action Buttons for Generated Report */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4 no-print">
            <div>
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Table className="w-5 h-5 text-cyan-400" />
                {reportResult.report_type} Results
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Total Records Found: <span className="font-bold text-cyan-300">{reportResult.total_records}</span>
                {reportResult.from_date && ` | Date Range: ${reportResult.from_date} to ${reportResult.to_date}`}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleDownloadCSV}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-2 shadow-md shadow-emerald-900/30 transition-all"
              >
                <Download className="w-4 h-4" />
                Download CSV
              </button>
              <button
                onClick={handlePrintPDF}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-semibold text-xs flex items-center gap-2 border border-slate-700 transition-all"
              >
                <Printer className="w-4 h-4" />
                Print / Save PDF
              </button>
            </div>
          </div>

          {/* Report Data Table */}
          <div className="overflow-x-auto">
            {reportResult.data.length === 0 ? (
              <div className="py-12 text-center text-slate-500">
                No data records available for the selected criteria.
              </div>
            ) : (
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-slate-950/60 border-b border-slate-800 text-slate-400 uppercase text-[11px] tracking-wider font-semibold">
                    {Object.keys(reportResult.data[0]).map((key) => (
                      <th key={key} className="py-3 px-3">
                        {key.replace(/_/g, ' ')}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {reportResult.data.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                      {Object.keys(row).map((key) => (
                        <td key={key} className="py-3 px-3 text-slate-200">
                          {row[key] !== null && row[key] !== undefined ? String(row[key]) : '--'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
