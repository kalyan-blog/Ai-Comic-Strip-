/**
 * Admin Dashboard - TEXPERIA 2026
 * Premium dark glassmorphism design with event-based filtering
 */

import { useState, useEffect } from 'react';
import { adminService } from '../services/api';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { 
  HiUserGroup, HiCurrencyRupee, HiCheckCircle, HiClock,
  HiSearch, HiDownload, HiRefresh, HiCheck, HiX, HiTrash,
  HiChevronLeft, HiChevronRight, HiBan
} from 'react-icons/hi';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const EVENT_TABS = [
  { id: '', label: 'All Events', emoji: '🎯', color: 'comic-cyan' },
  { id: 'comic_strip', label: 'AI Comic Strip', emoji: '🎨', color: 'comic-pink' },
  { id: 'prompt_idol', label: 'Prompt Idol', emoji: '✍️', color: 'comic-yellow' },
  { id: 'ai_blitz', label: 'AI Blitz', emoji: '⚡', color: 'comic-green' },
];

const EVENT_LABELS = {
  comic_strip: '🎨 AI Comic Strip',
  prompt_idol: '✍️ Prompt Idol',
  ai_blitz: '⚡ AI Blitz',
};

const colorMap = {
  'text-comic-cyan': { bg: 'rgba(0,217,255,0.08)', border: 'border-comic-cyan/30', glow: '0 0 20px rgba(0,217,255,0.15)' },
  'text-comic-green': { bg: 'rgba(0,255,136,0.08)', border: 'border-comic-green/30', glow: '0 0 20px rgba(0,255,136,0.15)' },
  'text-comic-yellow': { bg: 'rgba(255,229,0,0.08)', border: 'border-comic-yellow/30', glow: '0 0 20px rgba(255,229,0,0.15)' },
  'text-comic-pink': { bg: 'rgba(255,0,255,0.08)', border: 'border-comic-pink/30', glow: '0 0 20px rgba(255,0,255,0.15)' },
};

const StatCard = ({ icon: Icon, title, value, color, delay = 0 }) => {
  const cm = colorMap[color] || colorMap['text-comic-cyan'];
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={`stat-card ${cm.border}`}
      style={{ boxShadow: cm.glow }}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="font-comic text-gray-400 text-sm">{title}</p>
          <p className={`font-bangers text-3xl ${color}`}>{value}</p>
        </div>
        <div className="w-14 h-14 rounded-xl flex items-center justify-center" style={{ background: cm.bg }}>
          <Icon className={color} size={28} />
        </div>
      </div>
    </motion.div>
  );
};

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [eventStats, setEventStats] = useState(null);
  const [teams, setTeams] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, total_pages: 0 });
  const [search, setSearch] = useState('');
  const [filterDept, setFilterDept] = useState('');
  const [filterVerified, setFilterVerified] = useState('');
  const [filterEvent, setFilterEvent] = useState('');

  useEffect(() => { fetchStats(); fetchDepartments(); fetchEventStats(); }, []);
  useEffect(() => { fetchTeams(); }, [pagination.page, search, filterDept, filterVerified, filterEvent]);

  const fetchStats = async () => {
    try { const r = await adminService.getStats(); setStats(r.data); }
    catch { toast.error('Failed to load statistics'); }
  };
  const fetchEventStats = async () => {
    try { const r = await adminService.getEventStats(); setEventStats(r.data); }
    catch { console.error('Failed to load event statistics'); }
  };
  const fetchDepartments = async () => {
    try { const r = await adminService.getDepartments(); setDepartments(r.data); }
    catch { console.error('Failed to load departments'); }
  };
  const fetchTeams = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.page, limit: pagination.limit,
        ...(search && { search }),
        ...(filterDept && { department: filterDept }),
        ...(filterVerified !== '' && { verified: filterVerified === 'true' }),
        ...(filterEvent && { event_id: filterEvent }),
      };
      const r = await adminService.getTeams(params);
      setTeams(r.data.teams);
      setPagination(prev => ({ ...prev, total: r.data.total, total_pages: r.data.total_pages }));
    } catch { toast.error('Failed to load teams'); }
    finally { setLoading(false); }
  };

  const toggleVerification = async (id) => {
    try { await adminService.toggleVerification(id); toast.success('Verification updated'); fetchTeams(); fetchStats(); fetchEventStats(); }
    catch { toast.error('Failed to update verification'); }
  };
  const verifyPayment = async (id) => {
    try { await adminService.verifyPayment(id); toast.success('Payment verified!'); fetchTeams(); fetchStats(); fetchEventStats(); }
    catch { toast.error('Failed to verify payment'); }
  };
  const rejectPayment = async (id) => {
    if (!confirm('Reject this payment?')) return;
    try { await adminService.rejectPayment(id); toast.success('Payment rejected'); fetchTeams(); fetchStats(); fetchEventStats(); }
    catch { toast.error('Failed to reject payment'); }
  };
  const deleteTeam = async (id, teamName) => {
    if (!confirm(`Are you sure you want to DELETE team "${teamName}"? This will permanently remove the team, payment, and user account. This action cannot be undone.`)) return;
    try { await adminService.deleteTeam(id); toast.success(`Team "${teamName}" deleted`); fetchTeams(); fetchStats(); fetchEventStats(); }
    catch { toast.error('Failed to delete team'); }
  };
  const exportCSV = async () => {
    try {
      const r = await adminService.exportCSV(filterEvent || undefined);
      const url = window.URL.createObjectURL(new Blob([r.data]));
      const a = document.createElement('a'); a.href = url;
      const suffix = filterEvent ? `_${filterEvent}` : '';
      a.setAttribute('download', `teams_export${suffix}_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(a); a.click(); a.remove();
      toast.success('CSV exported');
    } catch { toast.error('Failed to export CSV'); }
  };
  const exportAllCSV = async () => {
    try {
      const r = await adminService.exportAllCSV();
      const url = window.URL.createObjectURL(new Blob([r.data], { type: 'application/zip' }));
      const a = document.createElement('a'); a.href = url;
      a.setAttribute('download', `TEXPERIA_all_events_${new Date().toISOString().split('T')[0]}.zip`);
      document.body.appendChild(a); a.click(); a.remove();
      toast.success('All event CSVs exported as ZIP');
    } catch { toast.error('Failed to export all CSVs'); }
  };

  const chartData = {
    labels: stats?.departments ? Object.keys(stats.departments) : [],
    datasets: [{
      label: 'Teams per Department',
      data: stats?.departments ? Object.values(stats.departments) : [],
      backgroundColor: ['rgba(0,217,255,0.7)', 'rgba(255,0,255,0.7)', 'rgba(255,229,0,0.7)', 'rgba(0,255,136,0.7)', 'rgba(255,107,0,0.7)', 'rgba(123,0,255,0.7)'],
      borderColor: ['#00D9FF', '#FF00FF', '#FFE500', '#00FF88', '#FF6B00', '#7B00FF'],
      borderWidth: 2,
      borderRadius: 8,
    }],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: { display: true, text: 'Department-wise Registrations', font: { family: 'Bangers', size: 20 }, color: '#ffffff' },
    },
    scales: {
      y: { beginAtZero: true, ticks: { color: '#9CA3AF', font: { family: 'Comic Neue' } }, grid: { color: 'rgba(255,255,255,0.05)' } },
      x: { ticks: { color: '#9CA3AF', font: { family: 'Comic Neue', size: 10 }, maxRotation: 45 }, grid: { display: false } },
    },
  };

  return (
    <div className="min-h-screen bg-comic-dark py-8 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-hero-gradient" />
      <div className="absolute inset-0 bg-grid opacity-15" />
      <div className="orb orb-pink w-[300px] h-[300px] top-[-100px] right-[-100px] animate-blob" />
      <div className="orb orb-cyan w-[250px] h-[250px] bottom-[-80px] left-[-80px] animate-blob" style={{ animationDelay: '5s' }} />

      <div className="max-w-7xl mx-auto relative z-10 pt-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8"
        >
          <h1 className="font-bangers text-4xl">
            <span className="text-comic-pink">Admin</span>
            <span className="text-white"> Dashboard</span>
          </h1>
          <div className="flex gap-3">
            <motion.button
              onClick={exportAllCSV}
              className="flex items-center gap-2 px-4 py-2 font-bangers text-sm text-black bg-comic-yellow rounded-xl border-2 border-black shadow-brutal hover:bg-comic-orange transition-all"
              whileTap={{ scale: 0.95 }}
            >
              <HiDownload size={18} /> Export All Events
            </motion.button>
            <motion.button
              onClick={exportCSV}
              className="flex items-center gap-2 px-4 py-2 font-bangers text-sm text-black bg-comic-green rounded-xl border-2 border-black shadow-brutal hover:bg-comic-cyan transition-all"
              whileTap={{ scale: 0.95 }}
            >
              <HiDownload size={18} /> Export CSV
            </motion.button>
            <motion.button
              onClick={() => { fetchStats(); fetchTeams(); fetchEventStats(); }}
              className="flex items-center gap-2 px-4 py-2 font-bangers text-sm text-black bg-comic-cyan rounded-xl border-2 border-black shadow-brutal hover:bg-comic-yellow transition-all"
              whileTap={{ scale: 0.95 }}
            >
              <HiRefresh size={18} /> Refresh
            </motion.button>
          </div>
        </motion.div>

        {/* Event Tabs */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="flex flex-wrap gap-3 mb-8"
        >
          {EVENT_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => { setFilterEvent(tab.id); setPagination(p => ({ ...p, page: 1 })); }}
              className={`px-5 py-2.5 rounded-xl font-bangers text-sm border-2 transition-all ${
                filterEvent === tab.id
                  ? `bg-${tab.color} text-black border-black shadow-brutal scale-105`
                  : `bg-transparent text-gray-400 border-white/10 hover:border-${tab.color}/50 hover:text-white`
              }`}
            >
              {tab.emoji} {tab.label}
            </button>
          ))}
        </motion.div>

        {/* Event-wise Stats Cards */}
        {eventStats && eventStats.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
          >
            {eventStats.map((ev) => (
              <div
                key={ev.event_id}
                className="card-glass p-4 border border-white/10 hover:border-comic-cyan/30 transition-all cursor-pointer"
                onClick={() => { setFilterEvent(ev.event_id); setPagination(p => ({ ...p, page: 1 })); }}
              >
                <p className="font-bangers text-lg text-white mb-2">{EVENT_LABELS[ev.event_id] || ev.event_name}</p>
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div>
                    <p className="font-bangers text-xl text-comic-cyan">{ev.total_teams || 0}</p>
                    <p className="font-comic text-xs text-gray-500">Teams</p>
                  </div>
                  <div>
                    <p className="font-bangers text-xl text-comic-green">₹{ev.total_revenue || 0}</p>
                    <p className="font-comic text-xs text-gray-500">Revenue</p>
                  </div>
                  <div>
                    <p className="font-bangers text-xl text-comic-yellow">{ev.verified_teams || 0}</p>
                    <p className="font-comic text-xs text-gray-500">Verified</p>
                  </div>
                  <div>
                    <p className="font-bangers text-xl text-comic-pink">{ev.pending_payments || 0}</p>
                    <p className="font-comic text-xs text-gray-500">Pending</p>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {/* Overall Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <StatCard icon={HiUserGroup} title="Total Teams" value={stats?.total_teams || 0} color="text-comic-cyan" delay={0.05} />
          <StatCard icon={HiCheckCircle} title="Verified Teams" value={stats?.verified_teams || 0} color="text-comic-green" delay={0.1} />
          <StatCard icon={HiCurrencyRupee} title="Total Revenue" value={`₹${stats?.total_revenue || 0}`} color="text-comic-yellow" delay={0.15} />
          <StatCard icon={HiClock} title="Pending Payments" value={stats?.pending_payments || 0} color="text-comic-pink" delay={0.2} />
        </div>

        {/* Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="card-glass p-6 mb-8"
        >
          <div className="h-[300px] sm:h-[400px]">
            <Bar data={chartData} options={chartOptions} />
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card-glass p-5 mb-6"
        >
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="relative">
              <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input
                type="text" value={search}
                onChange={(e) => { setSearch(e.target.value); setPagination(p => ({...p, page: 1})); }}
                className="input-dark pl-10 text-sm"
                placeholder="Search teams..."
              />
            </div>
            <select
              value={filterDept}
              onChange={(e) => { setFilterDept(e.target.value); setPagination(p => ({...p, page: 1})); }}
              className="input-dark text-sm"
            >
              <option value="">All Departments</option>
              {departments.map(d => (
                <option key={d.department} value={d.department}>{d.department} ({d.count})</option>
              ))}
            </select>
            <select
              value={filterVerified}
              onChange={(e) => { setFilterVerified(e.target.value); setPagination(p => ({...p, page: 1})); }}
              className="input-dark text-sm"
            >
              <option value="">All Status</option>
              <option value="true">Verified</option>
              <option value="false">Pending</option>
            </select>
            <button
              onClick={() => { setSearch(''); setFilterDept(''); setFilterVerified(''); setFilterEvent(''); }}
              className="px-4 py-2.5 font-comic text-sm text-gray-400 rounded-xl border border-white/10 hover:border-comic-pink/50 hover:text-comic-pink transition-all"
              style={{ background: 'rgba(22,22,42,0.6)' }}
            >
              Clear Filters
            </button>
          </div>
        </motion.div>

        {/* Teams Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="card-glass overflow-x-auto"
        >
          <table className="table-modern w-full">
            <thead>
              <tr>
                <th className="text-left py-3 px-4 font-bangers text-base text-gray-300">Team</th>
                <th className="text-left py-3 px-4 font-bangers text-base text-gray-300 hidden lg:table-cell">Event</th>
                <th className="text-left py-3 px-4 font-bangers text-base text-gray-300 hidden sm:table-cell">Department</th>
                <th className="text-left py-3 px-4 font-bangers text-base text-gray-300 hidden md:table-cell">Leader</th>
                <th className="text-left py-3 px-4 font-bangers text-base text-gray-300">Payment</th>
                <th className="text-left py-3 px-4 font-bangers text-base text-gray-300">Status</th>
                <th className="text-center py-3 px-4 font-bangers text-base text-gray-300">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="7" className="text-center py-8"><div className="w-8 h-8 border-2 border-comic-cyan border-t-transparent rounded-full animate-spin mx-auto" /></td></tr>
              ) : teams.length === 0 ? (
                <tr><td colSpan="7" className="text-center py-8 font-comic text-gray-500">No teams found</td></tr>
              ) : (
                teams.map((team) => (
                  <tr key={team.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-4">
                      <p className="font-comic font-bold text-white">{team.team_name}</p>
                      <p className="font-comic text-xs text-gray-500">{team.year}</p>
                    </td>
                    <td className="py-3 px-4 hidden lg:table-cell">
                      <span className="inline-block px-2 py-0.5 bg-comic-cyan/10 text-comic-cyan text-xs font-bold rounded-lg border border-comic-cyan/20">
                        {EVENT_LABELS[team.event_id] || team.event_id}
                      </span>
                    </td>
                    <td className="py-3 px-4 hidden sm:table-cell">
                      <p className="font-comic text-sm text-gray-300">{team.department}</p>
                    </td>
                    <td className="py-3 px-4 hidden md:table-cell">
                      <p className="font-comic text-white text-sm">{team.leader_name}</p>
                      <p className="font-comic text-xs text-gray-500">{team.leader_email}</p>
                    </td>
                    <td className="py-3 px-4">
                      {team.payment_status === 'verified' ? (
                        <span className="badge-success text-xs">₹{team.payment_amount} ✓</span>
                      ) : team.payment_status === 'pending' ? (
                        <div className="flex items-center gap-1.5">
                          <span className="inline-block px-2 py-0.5 bg-comic-yellow/10 text-comic-yellow text-xs font-bold rounded-lg border border-comic-yellow/20">₹{team.payment_amount}</span>
                          <button onClick={() => verifyPayment(team.id)} className="p-1 rounded-lg bg-comic-green/10 hover:bg-comic-green/20 text-comic-green transition-colors" title="Verify"><HiCheck size={14} /></button>
                          <button onClick={() => rejectPayment(team.id)} className="p-1 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors" title="Reject"><HiBan size={14} /></button>
                        </div>
                      ) : team.payment_status === 'rejected' ? (
                        <span className="inline-block px-2 py-0.5 bg-red-500/10 text-red-400 text-xs font-bold rounded-lg border border-red-500/20">Rejected</span>
                      ) : (
                        <span className="inline-block px-2 py-0.5 bg-white/5 text-gray-500 text-xs font-bold rounded-lg border border-white/10">No Payment</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {team.verified ? (
                        <span className="badge-success text-xs">Verified</span>
                      ) : (
                        <span className="inline-block px-2 py-0.5 bg-comic-yellow/10 text-comic-yellow text-xs font-bold rounded-lg border border-comic-yellow/20">Pending</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => toggleVerification(team.id)}
                        className={`p-2 rounded-xl transition-all ${
                          team.verified
                            ? 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20'
                            : 'bg-comic-green/10 hover:bg-comic-green/20 text-comic-green border border-comic-green/20'
                        }`}
                        title={team.verified ? 'Unverify' : 'Verify'}
                      >
                        {team.verified ? <HiX size={18} /> : <HiCheck size={18} />}
                      </button>
                      <button
                        onClick={() => deleteTeam(team.id, team.team_name)}
                        className="p-2 rounded-xl transition-all bg-red-500/10 hover:bg-red-500/30 text-red-500 border border-red-500/20 ml-1"
                        title="Delete Team"
                      >
                        <HiTrash size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Pagination */}
          {pagination.total_pages > 1 && (
            <div className="flex justify-between items-center p-4 border-t border-white/5">
              <p className="font-comic text-sm text-gray-500">
                {((pagination.page - 1) * pagination.limit) + 1}–{Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPagination(p => ({...p, page: p.page - 1}))}
                  disabled={pagination.page === 1}
                  className="p-2 rounded-xl border border-white/10 text-gray-400 hover:border-comic-cyan/50 hover:text-comic-cyan disabled:opacity-30 disabled:hover:border-white/10 transition-all"
                  style={{ background: 'rgba(22,22,42,0.6)' }}
                >
                  <HiChevronLeft size={18} />
                </button>
                <span className="px-4 py-2 font-bangers text-comic-cyan bg-comic-cyan/10 border border-comic-cyan/30 rounded-xl">
                  {pagination.page}
                </span>
                <button
                  onClick={() => setPagination(p => ({...p, page: p.page + 1}))}
                  disabled={pagination.page === pagination.total_pages}
                  className="p-2 rounded-xl border border-white/10 text-gray-400 hover:border-comic-cyan/50 hover:text-comic-cyan disabled:opacity-30 disabled:hover:border-white/10 transition-all"
                  style={{ background: 'rgba(22,22,42,0.6)' }}
                >
                  <HiChevronRight size={18} />
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default AdminDashboard;
