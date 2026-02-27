/**
 * Register Page - TEXPERIA 2026
 * Glassmorphism design with animated background
 */

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { HiMail, HiLockClosed, HiArrowRight, HiShieldCheck } from 'react-icons/hi';
import { motion } from 'framer-motion';

const RegisterPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) { setError('Passwords do not match'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setLoading(true);
    const result = await register(email, password);
    if (result.success) navigate('/team-registration');
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-comic-dark py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-hero-gradient" />
      <div className="absolute inset-0 bg-grid opacity-30" />

      {/* Animated orbs */}
      <div className="orb orb-pink w-[300px] h-[300px] top-[-50px] left-[-50px] animate-blob" />
      <div className="orb orb-cyan w-[350px] h-[350px] bottom-[-100px] right-[-100px] animate-blob" style={{ animationDelay: '3s' }} />
      <div className="orb orb-green w-[200px] h-[200px] top-[40%] right-[10%] animate-blob" style={{ animationDelay: '5s' }} />

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="card-glass p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-comic-pink to-comic-yellow flex items-center justify-center border-2 border-black shadow-brutal mb-4"
            >
              <span className="text-4xl">🚀</span>
            </motion.div>
            <h1 className="font-bangers text-4xl">
              <span className="text-comic-pink">Join the</span>
              <span className="text-white"> Challenge!</span>
            </h1>
            <p className="font-comic text-gray-400 mt-2">
              Create your account to register
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 rounded-xl border border-red-500/30"
              style={{ background: 'rgba(239, 68, 68, 0.1)' }}
            >
              <p className="font-comic text-red-400 text-sm">{error}</p>
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="relative"
            >
              <HiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-dark pl-12"
                placeholder="Email Address"
                required
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="relative"
            >
              <HiLockClosed className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-dark pl-12"
                placeholder="Password (min 6 characters)"
                required
                minLength={6}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="relative"
            >
              <HiShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="input-dark pl-12"
                placeholder="Confirm Password"
                required
              />
            </motion.div>

            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              type="submit"
              className="w-full py-4 font-bangers text-xl uppercase tracking-wider text-black bg-comic-green rounded-xl border-2 border-black shadow-brutal hover:bg-comic-cyan hover:-translate-y-1 hover:shadow-brutal-lg transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  Creating Account...
                </span>
              ) : (
                <>
                  Create Account <HiArrowRight size={20} />
                </>
              )}
            </motion.button>
          </form>

          {/* Info Box */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="mt-6 p-4 rounded-xl border border-comic-cyan/20"
            style={{ background: 'rgba(0, 217, 255, 0.05)' }}
          >
            <p className="font-comic text-sm text-gray-400">
              📝 After creating your account, you'll be able to register your team and complete payment.
            </p>
          </motion.div>

          {/* Divider */}
          <div className="my-6 flex items-center">
            <div className="flex-1 h-px bg-white/10" />
            <span className="px-3 text-gray-500 font-comic text-sm">or</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* Login Link */}
          <div className="text-center font-comic">
            <p className="text-gray-400">
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-comic-cyan font-bold hover:text-comic-pink transition-colors"
              >
                Login Here →
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default RegisterPage;
