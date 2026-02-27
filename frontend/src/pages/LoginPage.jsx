/**
 * Login Page - TEXPERIA 2026
 * Glassmorphism design with animated background
 */

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { HiMail, HiLockClosed, HiArrowRight } from 'react-icons/hi';
import { motion } from 'framer-motion';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const result = await login(email, password);
    if (result.success) {
      navigate(result.role === 'admin' ? '/admin' : '/dashboard');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-comic-dark py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-hero-gradient" />
      <div className="absolute inset-0 bg-grid opacity-30" />

      {/* Animated orbs */}
      <div className="orb orb-cyan w-[300px] h-[300px] top-[-50px] right-[-50px] animate-blob" />
      <div className="orb orb-pink w-[350px] h-[350px] bottom-[-100px] left-[-100px] animate-blob" style={{ animationDelay: '3s' }} />
      <div className="orb orb-yellow w-[200px] h-[200px] top-[50%] left-[10%] animate-blob" style={{ animationDelay: '5s' }} />

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
              className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-comic-cyan to-comic-pink flex items-center justify-center border-2 border-black shadow-brutal mb-4"
            >
              <span className="text-4xl">🎨</span>
            </motion.div>
            <h1 className="font-bangers text-4xl">
              <span className="text-comic-cyan">Welcome</span>
              <span className="text-white"> Back!</span>
            </h1>
            <p className="font-comic text-gray-400 mt-2">
              Login to your account
            </p>
          </div>

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
                placeholder="Password"
                required
              />
            </motion.div>

            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              type="submit"
              className="w-full py-4 font-bangers text-xl uppercase tracking-wider text-black bg-comic-cyan rounded-xl border-2 border-black shadow-brutal hover:bg-comic-yellow hover:-translate-y-1 hover:shadow-brutal-lg transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  Logging in...
                </span>
              ) : (
                <>
                  Login <HiArrowRight size={20} />
                </>
              )}
            </motion.button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center">
            <div className="flex-1 h-px bg-white/10" />
            <span className="px-3 text-gray-500 font-comic text-sm">or</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* Register Link */}
          <div className="text-center font-comic">
            <p className="text-gray-400">
              Don't have an account?{' '}
              <Link
                to="/register"
                className="text-comic-cyan font-bold hover:text-comic-pink transition-colors"
              >
                Register Now →
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
