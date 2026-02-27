/**
 * Student Dashboard - TEXPERIA 2026
 * Premium glassmorphism design with animations
 */

import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { teamService, paymentService } from '../services/api';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { 
  HiUserGroup, HiCheckCircle, HiClock, HiDownload,
  HiPencil, HiCreditCard, HiMail, HiPhone,
  HiOfficeBuilding, HiExclamationCircle, HiClipboardCopy
} from 'react-icons/hi';

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [team, setTeam] = useState(null);
  const [payment, setPayment] = useState(null);
  const [paymentInfo, setPaymentInfo] = useState(null);
  const [registrationOpen, setRegistrationOpen] = useState(true);
  const [transactionId, setTransactionId] = useState('');
  const [submittingPayment, setSubmittingPayment] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const statusRes = await teamService.getRegistrationStatus();
      setRegistrationOpen(statusRes.data.is_open);
      const teamRes = await teamService.getMyTeam();
      setTeam(teamRes.data);
      setPayment(teamRes.data.payment);
      if (teamRes.data.payment?.status !== 'verified') {
        const paymentInfoRes = await paymentService.getPaymentInfo();
        setPaymentInfo(paymentInfoRes.data);
      }
    } catch (error) {
      if (error.response?.status === 404) navigate('/');
      else toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const copyUpiId = () => {
    if (paymentInfo?.upi_id) {
      navigator.clipboard.writeText(paymentInfo.upi_id);
      setCopied(true);
      toast.success('UPI ID copied!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSubmitPayment = async (e) => {
    e.preventDefault();
    if (!transactionId || transactionId.length < 8) { toast.error('Please enter a valid transaction ID (min 8 chars)'); return; }
    setSubmittingPayment(true);
    try {
      await paymentService.submitPayment({
        transaction_id: transactionId,
        order_id: `UPI_${team?.event_id || 'event'}_${Date.now()}`
      });
      toast.success('Payment submitted! Awaiting verification.');
      fetchData();
      setTransactionId('');
    } catch (error) {
      const detail = error.response?.data?.detail;
      const msg = Array.isArray(detail) ? detail.map(d => d.msg).join(', ') : (detail || 'Failed to submit payment');
      toast.error(msg);
    } finally {
      setSubmittingPayment(false);
    }
  };

  const downloadReceipt = () => {
    const receiptContent = `
╔════════════════════════════════════════════════════════════╗
║              TEXPERIA 2026                                 ║
║          AI COMIC STRIP CHALLENGE                          ║
║              PAYMENT RECEIPT                               ║
╠════════════════════════════════════════════════════════════╣
║                                                            ║
║  Team Name: ${team?.team_name?.padEnd(45)}║
║  Leader: ${team?.leader_name?.padEnd(48)}║
║  Department: ${team?.department?.padEnd(44)}║
║  Year: ${team?.year?.padEnd(50)}║
║                                                            ║
╠════════════════════════════════════════════════════════════╣
║  Transaction ID: ${payment?.transaction_id?.padEnd(39)}║
║  Amount: ₹${String(payment?.amount).padEnd(46)}║
║  Status: ${payment?.status?.toUpperCase().padEnd(48)}║
║  Verified: ${payment?.verified_at ? new Date(payment.verified_at).toLocaleString().padEnd(45) : 'Pending'.padEnd(45)}║
║                                                            ║
╠════════════════════════════════════════════════════════════╣
║         SNS College of Technology, Coimbatore              ║
╚════════════════════════════════════════════════════════════╝
    `;
    const blob = new Blob([receiptContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `receipt_${team?.team_name?.replace(/\s+/g, '_')}.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Receipt downloaded!');
  };

  const getPaymentStatus = () => {
    switch (payment?.status) {
      case 'verified': return { text: 'Verified', color: 'text-comic-green', border: 'border-comic-green/30', bg: 'rgba(0,255,136,0.05)', icon: HiCheckCircle, glow: '0 0 20px rgba(0,255,136,0.2)' };
      case 'pending': return { text: 'Awaiting Verification', color: 'text-comic-yellow', border: 'border-comic-yellow/30', bg: 'rgba(255,229,0,0.05)', icon: HiClock, glow: '0 0 20px rgba(255,229,0,0.2)' };
      case 'rejected': return { text: 'Rejected', color: 'text-red-400', border: 'border-red-500/30', bg: 'rgba(239,68,68,0.05)', icon: HiExclamationCircle, glow: '0 0 20px rgba(239,68,68,0.2)' };
      default: return { text: 'Payment Pending', color: 'text-comic-pink', border: 'border-comic-pink/30', bg: 'rgba(255,0,255,0.05)', icon: HiCreditCard, glow: '0 0 20px rgba(255,0,255,0.2)' };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-comic-dark">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-comic-cyan border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="font-bangers text-2xl text-gray-400 mt-4 animate-pulse">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  const ps = getPaymentStatus();
  const StatusIcon = ps.icon;

  return (
    <div className="min-h-screen bg-comic-dark py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-hero-gradient" />
      <div className="absolute inset-0 bg-grid opacity-20" />
      <div className="orb orb-cyan w-[300px] h-[300px] top-[-80px] right-[-80px] animate-blob" />
      <div className="orb orb-pink w-[250px] h-[250px] bottom-[-60px] left-[-60px] animate-blob" style={{ animationDelay: '4s' }} />

      <div className="max-w-4xl mx-auto relative z-10 pt-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <h1 className="font-bangers text-4xl sm:text-5xl">
            <span className="text-comic-cyan">Your</span>
            <span className="text-white"> Dashboard</span>
          </h1>
          <p className="font-comic text-gray-400 mt-2">Manage your registration and payment</p>
        </motion.div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className={`stat-card ${team?.verified ? 'border-comic-green/30' : 'border-comic-yellow/30'}`}
            style={{ boxShadow: team?.verified ? '0 0 20px rgba(0,255,136,0.1)' : '0 0 20px rgba(255,229,0,0.1)' }}
          >
            <div className="flex items-center gap-4">
              {team?.verified ? (
                <div className="w-14 h-14 rounded-xl bg-comic-green/10 flex items-center justify-center">
                  <HiCheckCircle className="text-comic-green" size={32} />
                </div>
              ) : (
                <div className="w-14 h-14 rounded-xl bg-comic-yellow/10 flex items-center justify-center">
                  <HiClock className="text-comic-yellow" size={32} />
                </div>
              )}
              <div>
                <p className="font-comic text-gray-400 text-sm">Registration Status</p>
                <p className={`font-bangers text-xl ${team?.verified ? 'text-comic-green' : 'text-comic-yellow'}`}>
                  {team?.verified ? '✓ Verified' : '⏳ Pending'}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className={`stat-card ${ps.border}`}
            style={{ boxShadow: ps.glow }}
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl flex items-center justify-center" style={{ background: ps.bg }}>
                <StatusIcon className={ps.color} size={32} />
              </div>
              <div>
                <p className="font-comic text-gray-400 text-sm">Payment Status</p>
                <p className={`font-bangers text-xl ${ps.color}`}>{ps.text}</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Pay Now Section */}
        {payment?.status !== 'verified' && paymentInfo && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="card-glass p-6 mb-8"
          >
            <h2 className="font-bangers text-2xl mb-5 flex items-center gap-2 text-white">
              <HiCreditCard className="text-comic-pink" />
              {payment?.status === 'pending' ? 'Payment Submitted' : payment?.status === 'rejected' ? 'Resubmit Payment' : 'Complete Payment'}
            </h2>

            {payment?.status === 'pending' ? (
              <div className="text-center py-6 rounded-xl border border-comic-yellow/20" style={{ background: 'rgba(255,229,0,0.03)' }}>
                <HiClock className="text-comic-yellow mx-auto" size={48} />
                <p className="font-comic mt-3 text-gray-300">Your payment is being verified by admin.</p>
                <p className="font-comic text-sm text-gray-500 mt-1">
                  Transaction ID: <span className="font-mono font-bold text-comic-yellow">{payment.transaction_id}</span>
                </p>
              </div>
            ) : (
              <div className="space-y-5">
                {payment?.status === 'rejected' && (
                  <div className="p-4 rounded-xl border border-red-500/30" style={{ background: 'rgba(239,68,68,0.05)' }}>
                    <p className="font-comic text-red-400 text-center">
                      Your payment was rejected. Please submit a valid transaction ID.
                    </p>
                  </div>
                )}

                {/* Amount */}
                <div className="text-center p-5 rounded-xl border border-comic-green/20" style={{ background: 'rgba(0,255,136,0.03)' }}>
                  <p className="font-comic text-gray-400 text-sm">Amount to Pay</p>
                  <p className="font-bangers text-4xl text-comic-green mt-1">₹{paymentInfo.amount}</p>
                </div>

                {/* QR Code */}
                <div className="flex justify-center">
                  <div className="p-3 rounded-xl border border-white/10" style={{ background: 'rgba(22,22,42,0.8)' }}>
                    <img src="/qrcode.jpeg" alt="UPI QR Code" className="w-52 h-52 rounded-lg object-contain" />
                  </div>
                </div>

                {/* UPI */}
                <div className="p-4 rounded-xl border border-white/10" style={{ background: 'rgba(22,22,42,0.8)' }}>
                  <p className="font-comic text-gray-400 mb-2 text-center text-sm">Or pay to this UPI ID:</p>
                  <div className="flex items-center justify-center gap-3">
                    <code className="font-mono text-lg font-bold text-comic-pink bg-comic-pink/10 px-4 py-2 rounded-xl border border-comic-pink/20">
                      {paymentInfo.upi_id}
                    </code>
                    <button onClick={copyUpiId} className={`p-2 rounded-xl transition-all ${copied ? 'bg-comic-green/20 text-comic-green' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>
                      {copied ? <HiCheckCircle size={20} /> : <HiClipboardCopy size={20} />}
                    </button>
                  </div>
                </div>

                {/* Submit form */}
                <form onSubmit={handleSubmitPayment} className="flex gap-3">
                  <input
                    type="text" value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value.trim())}
                    className="input-dark flex-1 font-mono uppercase"
                    placeholder="Enter Transaction ID" required minLength={8}
                  />
                  <motion.button
                    type="submit"
                    className="px-6 py-3 font-bangers uppercase text-black bg-comic-cyan rounded-xl border-2 border-black shadow-brutal hover:bg-comic-yellow transition-all duration-300 disabled:opacity-50"
                    disabled={submittingPayment}
                    whileTap={{ scale: 0.95 }}
                  >
                    {submittingPayment ? '...' : 'Submit'}
                  </motion.button>
                </form>
              </div>
            )}
          </motion.div>
        )}

        {/* Team Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card-glass p-6 mb-8"
        >
          <div className="flex justify-between items-start mb-6">
            <h2 className="font-bangers text-2xl flex items-center gap-2 text-white">
              <HiUserGroup className="text-comic-cyan" /> Team Details
            </h2>
            {registrationOpen && !team?.verified && (
              <Link to="/team-registration" className="flex items-center gap-1 font-comic text-comic-pink hover:text-comic-cyan transition-colors text-sm">
                <HiPencil size={16} /> Edit
              </Link>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-5">
              <div>
                <p className="font-comic text-gray-500 text-xs uppercase tracking-wider">Team Name</p>
                <p className="font-bangers text-2xl text-comic-cyan">{team?.team_name}</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-comic-pink/10 flex items-center justify-center">
                  <HiOfficeBuilding className="text-comic-pink" size={18} />
                </div>
                <div>
                  <p className="font-comic text-gray-500 text-xs">Department</p>
                  <p className="font-comic font-bold text-white">{team?.department}</p>
                </div>
              </div>
              <div>
                <p className="font-comic text-gray-500 text-xs">Year</p>
                <p className="font-comic font-bold text-white">{team?.year}</p>
              </div>
            </div>

            <div className="space-y-5">
              <div>
                <p className="font-comic text-gray-500 text-xs uppercase tracking-wider">Team Leader</p>
                <p className="font-comic font-bold text-lg text-white">{team?.leader_name}</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-comic-cyan/10 flex items-center justify-center">
                  <HiMail className="text-comic-cyan" size={18} />
                </div>
                <p className="font-comic text-gray-300">{team?.leader_email}</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-comic-green/10 flex items-center justify-center">
                  <HiPhone className="text-comic-green" size={18} />
                </div>
                <p className="font-comic text-gray-300">{team?.leader_phone}</p>
              </div>
            </div>
          </div>

          {/* Members */}
          {(team?.member2_name || team?.member3_name || team?.member4_name) && (
            <div className="mt-6 pt-6 border-t border-white/10">
              <h3 className="font-bangers text-xl mb-4 text-white">Team Members</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {team?.member2_name && (
                  <div className="p-4 rounded-xl border border-comic-green/20" style={{ background: 'rgba(0,255,136,0.03)' }}>
                    <p className="font-comic font-bold text-white">{team.member2_name}</p>
                    <p className="font-comic text-sm text-gray-400">{team.member2_email}</p>
                  </div>
                )}
                {team?.member3_name && (
                  <div className="p-4 rounded-xl border border-comic-yellow/20" style={{ background: 'rgba(255,229,0,0.03)' }}>
                    <p className="font-comic font-bold text-white">{team.member3_name}</p>
                    <p className="font-comic text-sm text-gray-400">{team.member3_email}</p>
                  </div>
                )}
                {team?.member4_name && (
                  <div className="p-4 rounded-xl border border-comic-pink/20" style={{ background: 'rgba(255,0,255,0.03)' }}>
                    <p className="font-comic font-bold text-white">{team.member4_name}</p>
                    <p className="font-comic text-sm text-gray-400">{team.member4_email}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </motion.div>

        {/* Payment Receipt */}
        {payment?.status === 'verified' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="card-glass p-6"
          >
            <div className="flex justify-between items-start mb-6">
              <h2 className="font-bangers text-2xl flex items-center gap-2 text-white">
                <HiCreditCard className="text-comic-green" /> Payment Receipt
              </h2>
              <motion.button
                onClick={downloadReceipt}
                className="flex items-center gap-1 px-4 py-2 font-bangers text-sm text-black bg-comic-green rounded-xl border-2 border-black shadow-brutal hover:bg-comic-cyan transition-all"
                whileTap={{ scale: 0.95 }}
              >
                <HiDownload size={16} /> Download
              </motion.button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <p className="font-comic text-gray-500 text-xs">Transaction ID</p>
                <p className="font-comic font-bold text-sm break-all font-mono text-white">{payment.transaction_id}</p>
              </div>
              <div>
                <p className="font-comic text-gray-500 text-xs">Amount</p>
                <p className="font-bangers text-xl text-comic-green">₹{payment.amount}</p>
              </div>
              <div>
                <p className="font-comic text-gray-500 text-xs">Status</p>
                <span className="badge-success">Verified</span>
              </div>
              <div>
                <p className="font-comic text-gray-500 text-xs">Verified On</p>
                <p className="font-comic font-bold text-white">{payment.verified_at ? new Date(payment.verified_at).toLocaleDateString() : '-'}</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Deadline Notice */}
        {!registrationOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-6 p-4 rounded-xl border border-comic-pink/30 flex items-center gap-3"
            style={{ background: 'rgba(255,0,255,0.05)' }}
          >
            <HiExclamationCircle className="text-comic-pink flex-shrink-0" size={24} />
            <p className="font-comic text-gray-300">
              Registration deadline has passed. Profile editing is now locked.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
