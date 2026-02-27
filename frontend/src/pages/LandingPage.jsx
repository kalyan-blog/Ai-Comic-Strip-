/**
 * Landing Page - TEXPERIA 2026
 * Premium design with animations and visual effects
 */

import { useState, useEffect, useRef, useMemo, memo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { contactService } from '../services/api';
import toast from 'react-hot-toast';
import { motion, useInView } from 'framer-motion';
import { 
  HiChevronDown, 
  HiUserGroup,
  HiCurrencyRupee,
  HiCalendar,
  HiLightBulb,
  HiCheckCircle,
  HiSparkles,
  HiStar
} from 'react-icons/hi';

/* ─── Animated background orbs (lightweight) ─── */
const FloatingOrbs = memo(() => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
    <div className="orb orb-cyan w-[250px] h-[250px] top-[-80px] left-[-80px] animate-blob" />
    <div className="orb orb-pink w-[200px] h-[200px] top-[20%] right-[-40px] animate-blob" style={{ animationDelay: '2s' }} />
  </div>
));

/* ─── Particle field (reduced for performance) ─── */
const PARTICLES = Array.from({ length: 10 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 3 + 2,
  delay: Math.random() * 6,
  duration: Math.random() * 4 + 6,
  color: ['#00D9FF', '#FF00FF', '#FFE500', '#00FF88'][i % 4],
}));

const ParticleField = memo(() => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
    {PARTICLES.map((p) => (
      <div
        key={p.id}
        className="particle"
        style={{
          left: `${p.x}%`,
          top: `${p.y}%`,
          width: p.size,
          height: p.size,
          background: p.color,
          animationDelay: `${p.delay}s`,
          animationDuration: `${p.duration}s`,
          willChange: 'transform, opacity',
        }}
      />
    ))}
  </div>
));

/* ─── Countdown Timer (optimized) ─── */
const TimeBox = memo(({ value, label }) => (
  <div className="flex flex-col items-center">
    <div className="relative">
      <div className="bg-comic-dark font-bangers text-4xl sm:text-5xl px-5 sm:px-7 py-4 sm:py-5 rounded-xl border-2 border-white/10 min-w-[70px] sm:min-w-[100px] text-center">
        <span className="text-comic-cyan">{String(value).padStart(2, '0')}</span>
      </div>
    </div>
    <span className="font-comic text-xs sm:text-sm mt-2 text-gray-400 uppercase tracking-widest">{label}</span>
  </div>
));

const CountdownTimer = memo(({ targetDate }) => {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calc = () => {
      const diff = new Date(targetDate) - new Date();
      if (diff > 0) {
        setTimeLeft({
          days: Math.floor(diff / (1000 * 60 * 60 * 24)),
          hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((diff / 1000 / 60) % 60),
          seconds: Math.floor((diff / 1000) % 60),
        });
      }
    };
    calc();
    const t = setInterval(calc, 1000);
    return () => clearInterval(t);
  }, [targetDate]);

  return (
    <div className="flex justify-center gap-3 sm:gap-5">
      <TimeBox value={timeLeft.days} label="Days" />
      <div className="flex items-center text-2xl text-comic-cyan font-bangers self-start mt-5">:</div>
      <TimeBox value={timeLeft.hours} label="Hours" />
      <div className="flex items-center text-2xl text-comic-pink font-bangers self-start mt-5">:</div>
      <TimeBox value={timeLeft.minutes} label="Mins" />
      <div className="flex items-center text-2xl text-comic-yellow font-bangers self-start mt-5">:</div>
      <TimeBox value={timeLeft.seconds} label="Secs" />
    </div>
  );
});

/* ─── Animated Section Wrapper (lighter transitions) ─── */
const AnimatedSection = memo(({ children, className = '', delay = 0 }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.4, delay, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  );
});

/* ─── FAQ Accordion Item (lighter) ─── */
const FAQItem = memo(({ question, answer, isOpen, onClick, index }) => (
  <div className="accordion-item">
    <button className="accordion-header" onClick={onClick}>
      <span className="flex items-center gap-3">
        <span className="w-8 h-8 rounded-lg bg-gradient-to-r from-comic-cyan to-comic-pink flex items-center justify-center text-sm font-bangers text-white">
          {String(index + 1).padStart(2, '0')}
        </span>
        {question}
      </span>
      <HiChevronDown size={24} className={`text-comic-cyan transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
    </button>
    {isOpen && (
      <div className="accordion-content animate-slide-down">
        <p>{answer}</p>
      </div>
    )}
  </div>
));

/* ─── Feature Card (lighter) ─── */
const FeatureCard = memo(({ icon: Icon, title, description, color, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.1, duration: 0.3 }}
    viewport={{ once: true }}
    className="card-neon group cursor-default"
  >
    <div className={`w-14 h-14 rounded-xl ${color} flex items-center justify-center mb-5 transition-transform duration-200 group-hover:scale-105`}>
      <Icon className="text-black" size={28} />
    </div>
    <h3 className="font-bangers text-2xl mb-2 text-white">{title}</h3>
    <p className="font-comic text-gray-400 leading-relaxed">{description}</p>
  </motion.div>
));

/* ─── Main Landing Page ─── */
const LandingPage = () => {
  const { isAuthenticated } = useAuth();
  const [openFAQ, setOpenFAQ] = useState(null);
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const [submitting, setSubmitting] = useState(false);

  const registrationDeadline = '2026-03-09T23:59:59';

  const events = [
    {
      id: 'comic_strip',
      title: 'AI Comic Strip Challenge',
      emoji: '🎨',
      description: 'Create stunning comic strips powered by AI tools. Unleash your storytelling with AI-generated visuals!',
      fee: '₹250 per head',
      color: 'from-comic-cyan to-blue-600',
      border: 'border-comic-cyan',
      glow: 'shadow-[0_0_30px_rgba(0,217,255,0.3)]',
      prizes: '🏆 Cash Prizes + Certificates',
      teamSize: '1-3 members',
    },
    {
      id: 'prompt_idol',
      title: 'Prompt Engineering Idol',
      emoji: '⚡',
      description: 'Master the art of prompt engineering! Compete to craft the most effective AI prompts across challenges.',
      fee: '₹200 per head',
      color: 'from-comic-pink to-purple-600',
      border: 'border-comic-pink',
      glow: 'shadow-[0_0_30px_rgba(255,0,255,0.3)]',
      prizes: '🏆 Cash Prizes + Certificates',
      teamSize: '1-2 members',
    },
    {
      id: 'ai_blitz',
      title: 'AI Blitz',
      emoji: '🧠',
      description: 'Fast-paced AI quiz & rapid-fire challenges. Test your AI knowledge in this thrilling blitz competition!',
      fee: '₹300 per head',
      color: 'from-comic-yellow to-orange-500',
      border: 'border-comic-yellow',
      glow: 'shadow-[0_0_30px_rgba(255,229,0,0.3)]',
      prizes: '🏆 Cash Prizes + Certificates',
      teamSize: '4 members',
    },
  ];

  const faqs = [
    { question: "What events are available?", answer: "TEXPERIA 2026 has three events: AI Comic Strip Challenge, Prompt Engineering Idol, and AI Blitz. Each has its own registration and rules!" },
    { question: "How many members can be in a team?", answer: "AI Comic Strip: 1-3 members, Prompt Engineering Idol: 1-2 members, AI Blitz: 4 members (mandatory). Mix and match your dream squad!" },
    { question: "What AI tools are allowed?", answer: "All AI tools are allowed! Midjourney, DALL-E, Stable Diffusion, ChatGPT, and more." },
    { question: "What is the registration fee?", answer: "AI Comic Strip Challenge: ₹250 per head. Prompt Engineering Idol: ₹200 per head. AI Blitz: ₹300 per head. Total = fee × number of team members." },
    { question: "How does payment work?", answer: "All events use UPI for secure payments — scan the QR code, pay, and enter your transaction ID. Your payment will be verified by the admin." },
    { question: "Can I register for multiple events?", answer: "Yes! You can register for all three events with the same account. Each event has its own registration." },
  ];

  const rules = [
    "Team sizes vary per event: Comic Strip (1-3), Prompt Idol (1-2), AI Blitz (4 mandatory)",
    "All AI tools are permitted for creation",
    "Original content only — no plagiarism",
    "Each event has specific submission guidelines",
    "Theme will be announced on event day",
    "Payment must be completed before registration is confirmed",
  ];

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await contactService.submit(contactForm);
      toast.success('Message sent successfully!');
      setContactForm({ name: '', email: '', message: '' });
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to send message');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-comic-dark">
      {/* ════════ HERO SECTION ════════ */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 bg-hero-gradient" />
        <FloatingOrbs />
        <ParticleField />
        <div className="absolute inset-0 bg-grid opacity-50" />

        <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto pt-20">
          {/* Tag */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="mb-6"
          >
            <span className="badge-glow">
              <HiSparkles className="mr-1" /> BEYOND BOOKS 📖✨
            </span>
          </motion.div>

          {/* Main Title */}
          <motion.h1
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="font-bangers text-6xl sm:text-8xl md:text-9xl mb-2 leading-none"
          >
            <span className="text-comic-yellow" style={{ textShadow: '0 0 30px rgba(255,229,0,0.3)' }}>TEX</span>
            <span className="text-white text-shadow-comic">PERIA</span>
            <span className="text-comic-yellow" style={{ textShadow: '0 0 30px rgba(255,229,0,0.3)' }}> 2026</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="font-bangers text-2xl sm:text-4xl md:text-5xl mb-6 leading-tight"
          >
            <span className="text-comic-cyan" style={{ textShadow: '0 0 20px rgba(0,217,255,0.3)' }}>3 Epic</span>
            <span className="text-white"> AI </span>
            <span className="text-comic-pink" style={{ textShadow: '0 0 20px rgba(255,0,255,0.3)' }}>Challenges</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="font-comic text-xl sm:text-2xl text-gray-400 mb-3"
          >
            🎨 AI Comic Strip • ⚡ Prompt Engineering • 🧠 AI Blitz
          </motion.p>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="font-comic text-sm text-gray-500 mb-10 tracking-wider uppercase"
          >
            Organized by SNS College of Technology
          </motion.p>

          {/* Countdown */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0 }}
            className="mb-10"
          >
            <p className="font-bangers text-lg text-gray-400 mb-4 tracking-wider">
              ⏰ REGISTRATION CLOSES IN
            </p>
            <CountdownTimer targetDate={registrationDeadline} />
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <a href="#events" className="btn-primary btn-register text-xl px-10 py-4">
              🚀 Explore Events
            </a>
            {!isAuthenticated ? (
              <Link to="/login" className="btn-outline text-lg px-8 py-4">
                Already Registered? Login
              </Link>
            ) : (
              <Link to="/dashboard" className="btn-outline text-lg px-8 py-4">
                📊 Go to Dashboard
              </Link>
            )}
          </motion.div>

          {/* Fee badge */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4 }}
            className="mt-8 flex flex-wrap gap-3 justify-center"
          >
            <span className="inline-block bg-comic-cyan text-black font-bangers text-sm px-4 py-2 rounded-full border-2 border-black shadow-brutal">
              🎨 Comic Strip: ₹250/head
            </span>
            <span className="inline-block bg-comic-pink text-black font-bangers text-sm px-4 py-2 rounded-full border-2 border-black shadow-brutal">
              ⚡ Prompt Idol: ₹200/head
            </span>
            <span className="inline-block bg-comic-yellow text-black font-bangers text-sm px-4 py-2 rounded-full border-2 border-black shadow-brutal">
              🧠 AI Blitz: ₹300/head
            </span>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce-slow"
        >
          <div className="w-6 h-10 border-2 border-white/20 rounded-full flex justify-center">
            <div className="w-1.5 h-3 bg-comic-cyan rounded-full mt-2" />
          </div>
        </div>
      </section>

      {/* ════════ EVENTS SECTION ════════ */}
      <section id="events" className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-mesh-gradient" />
        <div className="absolute inset-0 bg-grid opacity-30" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <AnimatedSection className="text-center mb-16">
            <h2 className="section-title">
              <span className="text-comic-yellow">🏆</span>
              <span className="text-white"> Choose Your </span>
              <span className="text-comic-cyan">Challenge</span>
            </h2>
            <p className="section-subtitle">
              Pick your event and register to compete!
            </p>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {events.map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.35 }}
                viewport={{ once: true }}
                className="relative group"
              >
                <div className={`relative card-glass p-8 rounded-2xl border-2 ${event.border} hover:-translate-y-2 transition-transform duration-200 h-full flex flex-col`}>
                  {/* Event emoji */}
                  <div className="text-center mb-6">
                    <div className="text-6xl mb-4 inline-block">
                      {event.emoji}
                    </div>
                    <h3 className="font-bangers text-3xl text-white mb-2">{event.title}</h3>
                    <p className="font-comic text-gray-400 text-sm leading-relaxed">{event.description}</p>
                  </div>

                  {/* Details */}
                  <div className="space-y-3 mb-6 flex-grow">
                    <div className="flex items-center gap-3 font-comic text-sm">
                      <span className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">💰</span>
                      <span className="text-gray-300">{event.fee}</span>
                    </div>
                    <div className="flex items-center gap-3 font-comic text-sm">
                      <span className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">👥</span>
                      <span className="text-gray-300">{event.teamSize}</span>
                    </div>
                    <div className="flex items-center gap-3 font-comic text-sm">
                      <span className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">🎁</span>
                      <span className="text-gray-300">{event.prizes}</span>
                    </div>
                  </div>

                  {/* Register Button */}
                  <Link
                    to={isAuthenticated ? `/team-registration/${event.id}` : '/register'}
                    className={`block w-full py-3 font-bangers text-xl text-center uppercase tracking-wider text-black bg-gradient-to-r ${event.color} rounded-xl border-2 border-black shadow-brutal hover:-translate-y-1 hover:shadow-brutal-lg transition-all duration-300`}
                  >
                    Register Now →
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════ FEATURES SECTION ════════ */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-mesh-gradient" />
        <div className="absolute inset-0 bg-grid opacity-30" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <AnimatedSection className="text-center mb-16">
            <h2 className="section-title">
              <span className="text-comic-pink">Why</span>
              <span className="text-white"> Participate?</span>
            </h2>
            <p className="section-subtitle">
              3 epic challenges. Unlimited creativity. Real rewards. This is your moment to shine!
            </p>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <FeatureCard
              icon={HiUserGroup}
              title="Squad Goals"
              description="Build your dream team — solo warriors or powerhouse squads, your call!"
              color="bg-comic-cyan"
              index={0}
            />
            <FeatureCard
              icon={HiLightBulb}
              title="Future-Ready Skills"
              description="Get hands-on with AI tools the industry is buzzing about — level up before you graduate!"
              color="bg-comic-pink"
              index={1}
            />
            <FeatureCard
              icon={HiCurrencyRupee}
              title="Cash Prizes & Certs"
              description="Walk away with cash prizes, certificates, and bragging rights that look fire on your resume!"
              color="bg-comic-yellow"
              index={2}
            />
            <FeatureCard
              icon={HiCalendar}
              title="One Day, Big Impact"
              description="A single day of intense competition that could redefine your AI journey forever"
              color="bg-comic-green"
              index={3}
            />
          </div>
        </div>
      </section>

      {/* ════════ RULES SECTION ════════ */}
      <section id="rules" className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-dots" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <AnimatedSection className="text-center mb-16">
            <h2 className="section-title">
              <span className="text-comic-yellow">📜</span>
              <span className="text-white"> Rules & Guidelines</span>
            </h2>
          </AnimatedSection>

          <div className="card-glass p-8">
            <ul className="space-y-4">
              {rules.map((rule, index) => (
                <li
                  key={index}
                  className="flex items-start gap-4 font-comic text-lg group animate-fade-in"
                  style={{ animationDelay: `${index * 60}ms` }}
                >
                  <div className="w-8 h-8 rounded-lg bg-comic-green/20 flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:bg-comic-green/40 transition-colors">
                    <HiCheckCircle className="text-comic-green" size={20} />
                  </div>
                  <span className="text-gray-300">{rule}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Judging Criteria */}
          <AnimatedSection delay={0.2} className="mt-12">
            <h3 className="font-bangers text-2xl text-center text-white mb-8">
              <HiStar className="inline text-comic-yellow mr-2" />
              Judging Criteria
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Creativity', pct: 30, color: 'from-comic-cyan to-blue-500' },
                { label: 'Story', pct: 25, color: 'from-comic-pink to-purple-500' },
                { label: 'Visual Appeal', pct: 25, color: 'from-comic-yellow to-orange-500' },
                { label: 'AI Usage', pct: 20, color: 'from-comic-green to-teal-500' },
              ].map((c, i) => (
                <div
                  key={c.label}
                  className="card-glass text-center p-5 animate-fade-in"
                  style={{ animationDelay: `${i * 80}ms` }}
                >
                  <div className={`font-bangers text-3xl bg-gradient-to-r ${c.color} bg-clip-text text-transparent`}>
                    {c.pct}%
                  </div>
                  <p className="font-comic text-sm text-gray-400 mt-1">{c.label}</p>
                </div>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ════════ FAQ SECTION ════════ */}
      <section id="faq" className="py-24 relative">
        <div className="absolute inset-0 bg-mesh-gradient opacity-50" />

        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <AnimatedSection className="text-center mb-16">
            <h2 className="section-title">
              <span className="text-comic-cyan">❓</span>
              <span className="text-white"> Frequently Asked </span>
              <span className="text-comic-pink">Questions</span>
            </h2>
          </AnimatedSection>

          <div className="space-y-3">
            {faqs.map((faq, index) => (
              <FAQItem
                key={index}
                question={faq.question}
                answer={faq.answer}
                isOpen={openFAQ === index}
                onClick={() => setOpenFAQ(openFAQ === index ? null : index)}
                index={index}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ════════ CONTACT SECTION ════════ */}
      <section id="contact" className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-dots" />

        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <AnimatedSection className="text-center mb-16">
            <h2 className="section-title">
              <span className="text-comic-cyan">📬</span>
              <span className="text-white"> Get in Touch</span>
            </h2>
            <p className="section-subtitle">
              Have questions? We'd love to hear from you.
            </p>
          </AnimatedSection>

          <AnimatedSection>
            <div className="card-glass p-8">
              <form onSubmit={handleContactSubmit} className="space-y-5">
                <div>
                  <label className="block font-bangers text-lg mb-2 text-white">Your Name</label>
                  <input
                    type="text"
                    value={contactForm.name}
                    onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                    className="input-dark"
                    placeholder="Enter your name"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bangers text-lg mb-2 text-white">Email Address</label>
                  <input
                    type="email"
                    value={contactForm.email}
                    onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                    className="input-dark"
                    placeholder="Enter your email"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bangers text-lg mb-2 text-white">Message</label>
                  <textarea
                    value={contactForm.message}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                    className="input-dark min-h-[150px] resize-none"
                    placeholder="How can we help you?"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-4 font-bangers text-xl uppercase tracking-wider text-black bg-comic-cyan rounded-xl border-2 border-black shadow-brutal hover:bg-comic-yellow hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50"
                >
                  {submitting ? '📤 Sending...' : '📨 Send Message'}
                </button>
              </form>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
