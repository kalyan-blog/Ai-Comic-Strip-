/**
 * Navbar Component - TEXPERIA 2026
 * Glassmorphism design with animated mobile menu
 */

import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { HiMenu, HiX } from 'react-icons/hi';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          setScrolled(window.scrollY > 20);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsOpen(false);
  };

  const NavLink = ({ to, children, className = '' }) => {
    const isActive = location.pathname === to;
    return (
      <Link
        to={to}
        className={`font-comic text-sm font-bold tracking-wide uppercase transition-all duration-300 px-3 py-2 rounded-lg
          ${isActive ? 'text-comic-cyan' : 'text-gray-300 hover:text-white hover:bg-white/5'}
          ${className}`}
      >
        {children}
        {isActive && (
          <div
            className="h-0.5 bg-comic-cyan mt-0.5 rounded-full"
          />
        )}
      </Link>
    );
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'py-2 border-b border-white/10'
          : 'py-3 border-b border-transparent'
      }`}
      style={{
        background: scrolled
          ? 'rgba(15, 15, 35, 0.95)'
          : 'rgba(15, 15, 35, 0.7)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-comic-cyan to-comic-pink flex items-center justify-center border-2 border-black shadow-brutal transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
              <span className="text-lg">🎨</span>
            </div>
            <div className="hidden sm:block">
              <span className="font-bangers text-xl leading-none">
                <span className="text-comic-yellow">TEX</span>
                <span className="text-white">PERIA</span>
              </span>
              <span className="block text-[10px] font-comic text-gray-400 tracking-widest uppercase">
                2026 • Beyond Books
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            <NavLink to="/">Home</NavLink>

            {!isAuthenticated ? (
              <>
                <NavLink to="/login">Login</NavLink>
                <Link
                  to="/register"
                  className="ml-2 px-5 py-2 font-bangers text-sm uppercase tracking-wider text-black bg-comic-cyan rounded-xl border-2 border-black shadow-brutal hover:bg-comic-yellow hover:-translate-y-0.5 hover:shadow-brutal-lg transition-all duration-300"
                >
                  Register
                </Link>
              </>
            ) : (
              <>
                {isAdmin ? (
                  <NavLink to="/admin">Admin Panel</NavLink>
                ) : (
                  <NavLink to="/dashboard">Dashboard</NavLink>
                )}
                <button
                  onClick={handleLogout}
                  className="ml-2 px-5 py-2 font-bangers text-sm uppercase tracking-wider text-white bg-white/10 rounded-xl border border-white/20 hover:bg-comic-pink hover:border-comic-pink hover:text-white transition-all duration-300"
                >
                  Logout
                </button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden relative w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors duration-200"
          >
            {isOpen ? <HiX size={22} /> : <HiMenu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
        {isOpen && (
          <div
            className="md:hidden overflow-hidden border-t border-white/10 animate-slide-down"
            style={{
              background: 'rgba(15, 15, 35, 0.97)',
            }}
          >
            <div className="px-4 py-4 space-y-2">
              <Link
                to="/"
                className="block font-comic font-bold text-white hover:text-comic-cyan py-3 px-4 rounded-xl hover:bg-white/5 transition-all duration-300"
                onClick={() => setIsOpen(false)}
              >
                Home
              </Link>

              {!isAuthenticated ? (
                <>
                  <Link
                    to="/login"
                    className="block font-comic font-bold text-white hover:text-comic-cyan py-3 px-4 rounded-xl hover:bg-white/5 transition-all duration-300"
                    onClick={() => setIsOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="block text-center py-3 px-4 font-bangers text-black bg-comic-cyan rounded-xl border-2 border-black shadow-brutal"
                    onClick={() => setIsOpen(false)}
                  >
                    Register Now 🚀
                  </Link>
                </>
              ) : (
                <>
                  {isAdmin ? (
                    <Link
                      to="/admin"
                      className="block font-comic font-bold text-white hover:text-comic-pink py-3 px-4 rounded-xl hover:bg-white/5 transition-all duration-300"
                      onClick={() => setIsOpen(false)}
                    >
                      Admin Panel
                    </Link>
                  ) : (
                    <Link
                      to="/dashboard"
                      className="block font-comic font-bold text-white hover:text-comic-cyan py-3 px-4 rounded-xl hover:bg-white/5 transition-all duration-300"
                      onClick={() => setIsOpen(false)}
                    >
                      Dashboard
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="w-full text-center py-3 px-4 font-bangers text-white bg-comic-pink/20 rounded-xl border border-comic-pink/30 hover:bg-comic-pink hover:text-white transition-all duration-300"
                  >
                    Logout
                  </button>
                </>
              )}
            </div>
          </div>
        )}
    </nav>
  );
};

export default Navbar;
