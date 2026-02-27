/**
 * Team Registration Page - TEXPERIA 2026
 * Event-specific registration with UPI payment
 */

import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { teamService, paymentService } from '../services/api';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HiUserGroup, HiUser, HiMail, HiPhone,
  HiOfficeBuilding, HiAcademicCap, HiPlus, HiTrash,
  HiCheckCircle, HiArrowRight
} from 'react-icons/hi';

const EVENT_META = {
  comic_strip: {
    title: 'AI Comic Strip Challenge',
    emoji: '🎨',
    description: 'Create stunning comic strips powered by AI tools. Use Midjourney, DALL-E, Stable Diffusion, or any AI image generator!',
    rules: [
      'Teams of 1-3 members allowed',
      'All AI image generation tools permitted',
      'Comic must have 4-8 panels',
      'Submit in PNG/PDF format',
      'Theme announced on event day',
      'Original content only',
    ],
    fee: 250,
    feeLabel: '₹250 per head',
    feeType: 'head',
    maxMembers: 3,
    color: 'from-comic-cyan to-blue-600',
    accent: 'comic-cyan',
    paymentMethod: 'upi',
    upiId: '7339354593@pthdfc',
    qrImage: '/qrcode.jpeg',
  },
  prompt_idol: {
    title: 'Prompt Engineering Idol',
    emoji: '⚡',
    description: 'Master the art of prompt engineering! Compete to craft the most effective AI prompts across multiple rounds.',
    rules: [
      'Teams of 1-2 members allowed',
      'Multiple rounds of prompt challenges',
      'Prompts judged on accuracy, creativity, efficiency',
      'All LLMs and AI tools permitted',
      'Time-limited rounds',
      'Judges\' decisions are final',
    ],
    fee: 200,
    feeLabel: '₹200 per head',
    feeType: 'head',
    maxMembers: 2,
    color: 'from-comic-pink to-purple-600',
    accent: 'comic-pink',
    paymentMethod: 'upi',
    upiId: '9363132835-pda0@ibl',
    qrImage: '/pandy-qr.png',
  },
  ai_blitz: {
    title: 'AI Blitz',
    emoji: '🧠',
    description: 'Fast-paced AI quiz & rapid-fire challenges. Test your AI knowledge in this thrilling blitz competition!',
    rules: [
      'Team of 4 members (mandatory)',
      'Rapid-fire quiz rounds',
      'Topics: ML, DL, NLP, Computer Vision, GenAI',
      'Time-limited per question',
      'Negative marking may apply',
      'Top teams advance to finals',
    ],
    fee: 300,
    feeLabel: '₹300 per head',
    feeType: 'head',
    maxMembers: 4,
    minMembers: 4,
    color: 'from-comic-yellow to-orange-500',
    accent: 'comic-yellow',
    paymentMethod: 'upi',
    upiId: 'dhivyaparamasivam6@oksbi',
    qrImage: '/durga-qr.jpeg',
  },
};

const TeamRegistration = () => {
  const navigate = useNavigate();
  const { eventId } = useParams();
  const event = EVENT_META[eventId];
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [teamData, setTeamData] = useState({
    event_id: eventId,
    team_name: '', department: '', year: '',
    leader_name: '', leader_email: '', leader_phone: '',
    member2_name: '', member2_email: '',
    member3_name: '', member3_email: '',
    member4_name: '', member4_email: ''
  });
  const minMembers = event?.minMembers || 1;
  const [showMember2, setShowMember2] = useState(minMembers >= 2);
  const [showMember3, setShowMember3] = useState(minMembers >= 3);
  const [showMember4, setShowMember4] = useState(minMembers >= 4);
  const [paymentInfo, setPaymentInfo] = useState(null);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [transactionId, setTransactionId] = useState('');

  useEffect(() => {
    if (!event) {
      toast.error('Invalid event');
      navigate('/');
    }
  }, [event, navigate]);

  const departments = [
    'Computer Science & Engineering (CSE)',
    'Information Technology (IT)',
    'Artificial Intelligence & Machine Learning (AI&ML)',
    'Artificial Intelligence & Data Science (AI&DS)',
    'Computer Science & Business Systems (CSBS)',
    'Data Science (DS)',
    'Cyber Security',
    'Computer Applications (MCA/BCA)',
    'Software Engineering',
    'Information Science & Engineering (ISE)',
    'Electronics & Communication Engineering (ECE)',
    'Electrical & Electronics Engineering (EEE)',
    'Mechanical Engineering',
    'Other'
  ];

  const years = [
    { value: '1st Year', label: '1st Year' },
    { value: '2nd Year', label: '2nd Year' },
    { value: '3rd Year', label: '3rd Year' },
    { value: '4th Year', label: '4th Year' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTeamData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmitTeam = async (e) => {
    e.preventDefault();
    // Validate minimum team size
    if (event.minMembers && memberCount < event.minMembers) {
      toast.error(`${event.title} requires exactly ${event.minMembers} members. Please add all team members.`);
      return;
    }
    setLoading(true);
    try {
      await teamService.create({ ...teamData, event_id: eventId });
      toast.success('Team registered! Proceeding to payment...');
      await fetchPaymentInfo();
      setStep(2);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to register team');
    } finally {
      setLoading(false);
    }
  };

  const fetchPaymentInfo = async () => {
    try {
      const response = await paymentService.getPaymentInfo();
      setPaymentInfo(response.data);
    } catch (error) {
      console.error('Error fetching payment info:', error);
    }
  };

  const handleUpiSubmit = async (e) => {
    e.preventDefault();
    if (!transactionId.trim()) {
      toast.error('Please enter the UPI Transaction ID / UTR number');
      return;
    }
    setPaymentProcessing(true);
    try {
      await paymentService.submitPayment({
        transaction_id: transactionId.trim(),
        order_id: `UPI_${eventId}_${Date.now()}`
      });
      toast.success('🎉 Payment submitted! Awaiting admin verification.');
      navigate('/dashboard');
    } catch (error) {
      const detail = error.response?.data?.detail;
      const msg = Array.isArray(detail) ? detail.map(d => d.msg).join(', ') : (detail || 'Failed to submit payment. Please try again.');
      toast.error(msg);
    } finally {
      setPaymentProcessing(false);
    }
  };

  if (!event) return null;

  const memberCount = 1 + (showMember2 ? 1 : 0) + (showMember3 ? 1 : 0) + (showMember4 ? 1 : 0);
  const totalFee = event.fee * memberCount;

  const FormLabel = ({ icon: Icon, color, children }) => (
    <label className="flex items-center gap-2 font-bangers text-lg mb-2 text-white">
      <Icon className={color} size={18} />
      {children}
    </label>
  );

  const pageVariants = {
    initial: { opacity: 0, x: 40 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -40 },
  };

  return (
    <div className="min-h-screen bg-comic-dark py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-hero-gradient" />
      <div className="absolute inset-0 bg-grid opacity-30" />
      <div className="orb orb-cyan w-[300px] h-[300px] top-[-50px] left-[-50px] animate-blob" />
      <div className="orb orb-pink w-[250px] h-[250px] bottom-[-50px] right-[-50px] animate-blob" style={{ animationDelay: '3s' }} />

      <div className="max-w-3xl mx-auto relative z-10">
        {/* Progress Steps */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center mb-10"
        >
          <div className={`step-indicator ${step >= 1 ? 'active' : 'pending'}`}>1</div>
          <div className={`step-line ${step >= 2 ? 'active' : 'pending'}`} />
          <div className={`step-indicator ${step >= 2 ? 'active' : 'pending'}`}>2</div>
        </motion.div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className={`w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br ${event.color} flex items-center justify-center border-2 border-black shadow-brutal mb-4`}>
            <span className="text-4xl">{event.emoji}</span>
          </div>
          <h1 className="font-bangers text-4xl">
            <span className={`text-${event.accent}`}>{event.title}</span>
          </h1>
          <p className="font-comic text-gray-400 mt-2">
            {step === 1 ? 'Step 1: Enter team details' : 'Step 2: Complete UPI payment'}
          </p>
        </motion.div>

        {/* Event Rules Card */}
        {step === 1 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="card-glass p-6 mb-6"
          >
            <h3 className="font-bangers text-xl text-white mb-3">📋 Event Rules</h3>
            <p className="font-comic text-gray-400 text-sm mb-4">{event.description}</p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {event.rules.map((rule, i) => (
                <li key={i} className="flex items-start gap-2 font-comic text-sm text-gray-300">
                  <HiCheckCircle className={`text-${event.accent} flex-shrink-0 mt-0.5`} size={16} />
                  {rule}
                </li>
              ))}
            </ul>
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="card-glass p-8">
                <form onSubmit={handleSubmitTeam} className="space-y-6">
                  {/* Team Name */}
                  <div>
                    <FormLabel icon={HiUserGroup} color={`text-${event.accent}`}>Team Name</FormLabel>
                    <input
                      type="text" name="team_name"
                      value={teamData.team_name} onChange={handleInputChange}
                      className="input-dark" placeholder="Enter your creative team name" required
                    />
                  </div>

                  {/* Department & Year */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <FormLabel icon={HiOfficeBuilding} color="text-comic-pink">Department</FormLabel>
                      <select
                        name="department" value={teamData.department}
                        onChange={handleInputChange} className="input-dark" required
                      >
                        <option value="">Select Department</option>
                        {departments.map(dept => (
                          <option key={dept} value={dept}>{dept}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <FormLabel icon={HiAcademicCap} color="text-comic-yellow">Year</FormLabel>
                      <select
                        name="year" value={teamData.year}
                        onChange={handleInputChange} className="input-dark" required
                      >
                        <option value="">Select Year</option>
                        {years.map(y => (
                          <option key={y.value} value={y.value}>{y.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Team Leader */}
                  <div className={`rounded-xl p-5 border border-${event.accent}/30`} style={{ background: 'rgba(0, 217, 255, 0.05)' }}>
                    <h3 className={`font-bangers text-xl mb-4 text-${event.accent} flex items-center gap-2`}>
                      <HiUser size={20} /> Team Leader (You)
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="font-comic font-bold mb-2 block text-gray-300 text-sm">Full Name</label>
                        <input
                          type="text" name="leader_name"
                          value={teamData.leader_name} onChange={handleInputChange}
                          className="input-dark" placeholder="Your full name" required
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="font-comic font-bold mb-2 block text-gray-300 text-sm">Email</label>
                          <input
                            type="email" name="leader_email"
                            value={teamData.leader_email} onChange={handleInputChange}
                            className="input-dark" placeholder="your@email.com" required
                          />
                        </div>
                        <div>
                          <label className="font-comic font-bold mb-2 block text-gray-300 text-sm">Phone</label>
                          <input
                            type="tel" name="leader_phone"
                            value={teamData.leader_phone} onChange={handleInputChange}
                            className="input-dark" placeholder="10-digit mobile" pattern="[6-9][0-9]{9}" required
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Member 2 */}
                  <AnimatePresence>
                    {event.maxMembers >= 2 && !showMember2 ? (
                      <motion.button
                        key="add-m2"
                        type="button"
                        onClick={() => setShowMember2(true)}
                        className="flex items-center gap-2 font-comic text-comic-green hover:text-comic-cyan transition-colors"
                        whileHover={{ x: 5 }}
                      >
                        <HiPlus size={20} /> Add Team Member 2 {(event.minMembers || 1) >= 2 ? '(Required)' : '(Optional)'}
                      </motion.button>
                    ) : (
                      <motion.div
                        key="m2-form"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="rounded-xl p-5 border border-comic-green/30"
                        style={{ background: 'rgba(0, 255, 136, 0.05)' }}
                      >
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="font-bangers text-xl text-comic-green flex items-center gap-2">
                            <HiUser size={18} /> Team Member 2 {(event.minMembers || 1) >= 2 && <span className="text-xs text-red-400">(Required)</span>}
                          </h3>
                          {(event.minMembers || 1) < 2 && (
                          <button type="button" onClick={() => { setShowMember2(false); setShowMember3(false); setShowMember4(false); setTeamData(p => ({ ...p, member2_name: '', member2_email: '', member3_name: '', member3_email: '', member4_name: '', member4_email: '' })); }}
                            className="text-red-400 hover:text-red-300 p-1 rounded-lg hover:bg-red-400/10 transition-colors">
                            <HiTrash size={18} />
                          </button>
                          )}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="font-comic font-bold mb-2 block text-gray-300 text-sm">Name</label>
                            <input type="text" name="member2_name" value={teamData.member2_name} onChange={handleInputChange} className="input-dark" placeholder="Member's full name" required={(event.minMembers || 1) >= 2} />
                          </div>
                          <div>
                            <label className="font-comic font-bold mb-2 block text-gray-300 text-sm">Email</label>
                            <input type="email" name="member2_email" value={teamData.member2_email} onChange={handleInputChange} className="input-dark" placeholder="member@email.com" required={(event.minMembers || 1) >= 2} />
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Member 3 */}
                  <AnimatePresence>
                    {event.maxMembers >= 3 && showMember2 && !showMember3 && (
                      <motion.button
                        key="add-m3"
                        type="button"
                        onClick={() => setShowMember3(true)}
                        className="flex items-center gap-2 font-comic text-comic-green hover:text-comic-cyan transition-colors"
                        whileHover={{ x: 5 }}
                      >
                        <HiPlus size={20} /> Add Team Member 3 {(event.minMembers || 1) >= 3 ? '(Required)' : '(Optional)'}
                      </motion.button>
                    )}
                    {showMember3 && (
                      <motion.div
                        key="m3-form"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="rounded-xl p-5 border border-comic-yellow/30"
                        style={{ background: 'rgba(255, 229, 0, 0.05)' }}
                      >
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="font-bangers text-xl text-comic-yellow flex items-center gap-2">
                            <HiUser size={18} /> Team Member 3 {(event.minMembers || 1) >= 3 && <span className="text-xs text-red-400">(Required)</span>}
                          </h3>
                          {(event.minMembers || 1) < 3 && (
                          <button type="button" onClick={() => { setShowMember3(false); setShowMember4(false); setTeamData(p => ({ ...p, member3_name: '', member3_email: '', member4_name: '', member4_email: '' })); }}
                            className="text-red-400 hover:text-red-300 p-1 rounded-lg hover:bg-red-400/10 transition-colors">
                            <HiTrash size={18} />
                          </button>
                          )}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="font-comic font-bold mb-2 block text-gray-300 text-sm">Name</label>
                            <input type="text" name="member3_name" value={teamData.member3_name} onChange={handleInputChange} className="input-dark" placeholder="Member's full name" required={(event.minMembers || 1) >= 3} />
                          </div>
                          <div>
                            <label className="font-comic font-bold mb-2 block text-gray-300 text-sm">Email</label>
                            <input type="email" name="member3_email" value={teamData.member3_email} onChange={handleInputChange} className="input-dark" placeholder="member@email.com" required={(event.minMembers || 1) >= 3} />
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Member 4 */}
                  <AnimatePresence>
                    {event.maxMembers >= 4 && showMember3 && !showMember4 && (
                      <motion.button
                        key="add-m4"
                        type="button"
                        onClick={() => setShowMember4(true)}
                        className="flex items-center gap-2 font-comic text-comic-green hover:text-comic-cyan transition-colors"
                        whileHover={{ x: 5 }}
                      >
                        <HiPlus size={20} /> Add Team Member 4 {(event.minMembers || 1) >= 4 ? '(Required)' : '(Optional)'}
                      </motion.button>
                    )}
                    {showMember4 && (
                      <motion.div
                        key="m4-form"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="rounded-xl p-5 border border-comic-pink/30"
                        style={{ background: 'rgba(255, 0, 255, 0.05)' }}
                      >
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="font-bangers text-xl text-comic-pink flex items-center gap-2">
                            <HiUser size={18} /> Team Member 4 {(event.minMembers || 1) >= 4 && <span className="text-xs text-red-400">(Required)</span>}
                          </h3>
                          {(event.minMembers || 1) < 4 && (
                          <button type="button" onClick={() => { setShowMember4(false); setTeamData(p => ({ ...p, member4_name: '', member4_email: '' })); }}
                            className="text-red-400 hover:text-red-300 p-1 rounded-lg hover:bg-red-400/10 transition-colors">
                            <HiTrash size={18} />
                          </button>
                          )}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="font-comic font-bold mb-2 block text-gray-300 text-sm">Name</label>
                            <input type="text" name="member4_name" value={teamData.member4_name} onChange={handleInputChange} className="input-dark" placeholder="Member's full name" required={(event.minMembers || 1) >= 4} />
                          </div>
                          <div>
                            <label className="font-comic font-bold mb-2 block text-gray-300 text-sm">Email</label>
                            <input type="email" name="member4_email" value={teamData.member4_email} onChange={handleInputChange} className="input-dark" placeholder="member@email.com" required={(event.minMembers || 1) >= 4} />
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Fee Notice */}
                  <div className={`rounded-xl p-4 border border-${event.accent}/30 text-center`} style={{ background: 'rgba(255, 0, 255, 0.05)' }}>
                    <p className={`font-bangers text-xl text-${event.accent}`}>
                      💰 {event.feeLabel}
                    </p>
                    <p className="font-comic text-sm text-gray-400 mt-1">
                      {`${memberCount} member${memberCount > 1 ? 's' : ''} × ₹${event.fee} = ₹${totalFee}`}
                    </p>
                  </div>

                  {/* Submit */}
                  <motion.button
                    type="submit"
                    className={`w-full py-4 font-bangers text-xl uppercase tracking-wider text-black bg-gradient-to-r ${event.color} rounded-xl border-2 border-black shadow-brutal hover:-translate-y-1 hover:shadow-brutal-lg transition-all duration-300 btn-register flex items-center justify-center gap-2 disabled:opacity-50`}
                    disabled={loading}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <span className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                        Processing...
                      </span>
                    ) : (
                      <>💳 Proceed to Payment <HiArrowRight size={20} /></>
                    )}
                  </motion.button>
                </form>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="card-glass p-8">
                <div className="space-y-6">
                  {/* Amount Card */}
                  <div className="text-center p-8 rounded-xl border border-comic-green/30" style={{ background: 'rgba(0, 255, 136, 0.05)' }}>
                    <p className="font-comic text-gray-400 text-sm uppercase tracking-wider">Amount to Pay</p>
                    <p className="font-bangers text-6xl text-comic-green mt-2" style={{ textShadow: '0 0 30px rgba(0,255,136,0.3)' }}>
                      ₹{paymentInfo?.amount || totalFee}
                    </p>
                    <p className="font-comic text-sm text-gray-500 mt-2">
                      {event.title} • {event.feeLabel}
                    </p>
                  </div>

                  {/* ---- UPI QR Code Payment ---- */}
                  <div className="p-5 rounded-xl border border-comic-green/30" style={{ background: 'rgba(0, 255, 136, 0.03)' }}>
                    <div className="text-center mb-4">
                          <span className={`font-bangers text-2xl text-${event.accent}`}>📱 Pay via UPI</span>
                        </div>

                        {/* QR Code */}
                        <div className="flex justify-center mb-5">
                          <div className="p-3 bg-white rounded-2xl shadow-lg">
                            <img
                              src={event.qrImage}
                              alt="Scan QR to pay"
                              className="w-56 h-56 object-contain rounded-lg"
                            />
                          </div>
                        </div>

                        {/* UPI ID */}
                        <div className="text-center mb-4">
                          <p className="font-comic text-gray-400 text-sm mb-1">Or pay directly to UPI ID:</p>
                          <div
                            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-${event.accent}/40 cursor-pointer hover:border-${event.accent} transition-colors`}
                            style={{ background: 'rgba(255,255,255,0.05)' }}
                            onClick={() => { navigator.clipboard.writeText(event.upiId); toast.success('UPI ID copied!'); }}
                          >
                            <span className={`font-mono font-bold text-${event.accent} text-lg`}>{event.upiId}</span>
                            <span className="text-gray-500 text-sm">📋</span>
                          </div>
                        </div>

                        <div className="space-y-2 mt-4">
                          <p className="font-comic text-sm text-gray-400 text-center">
                            1. Scan the QR code above or copy the UPI ID<br/>
                            2. Pay <span className={`font-bold text-${event.accent}`}>₹{paymentInfo?.amount || totalFee}</span> using any UPI app (GPay, PhonePe, Paytm, etc.)<br/>
                            3. Enter the <strong>Transaction ID / UTR number</strong> below
                          </p>
                        </div>
                      </div>

                      {/* Transaction ID Form */}
                      <form onSubmit={handleUpiSubmit} className="space-y-4">
                        <div>
                          <label className="font-bangers text-lg text-white mb-2 block">💳 UPI Transaction ID / UTR Number</label>
                          <input
                            type="text"
                            value={transactionId}
                            onChange={(e) => setTransactionId(e.target.value)}
                            className="input-dark text-lg"
                            placeholder="e.g. 425619283745 or T2602261234567890"
                            required
                          />
                          <p className="font-comic text-xs text-gray-500 mt-1">
                            You can find this in your UPI app's payment history / transaction details.
                          </p>
                        </div>

                        <motion.button
                          type="submit"
                          className={`w-full py-4 font-bangers text-xl uppercase tracking-wider text-black bg-gradient-to-r ${event.color} rounded-xl border-2 border-black shadow-brutal hover:-translate-y-1 hover:shadow-brutal-lg transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50`}
                          disabled={paymentProcessing}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          {paymentProcessing ? (
                            <span className="flex items-center gap-2">
                              <span className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                              Submitting...
                            </span>
                          ) : '✅ Submit Payment Proof'}
                        </motion.button>
                      </form>

                      <p className="font-comic text-center text-sm text-gray-500">
                        Your payment will be verified by the admin team. You'll be notified once confirmed.
                      </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default TeamRegistration;
