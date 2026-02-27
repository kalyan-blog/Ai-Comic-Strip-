/**
 * Footer - TEXPERIA 2026
 * Premium dark design with glow accents
 */

import { Link } from 'react-router-dom';
import { FaInstagram, FaTwitter, FaLinkedin, FaEnvelope } from 'react-icons/fa';

const socials = [
  { icon: FaInstagram, href: '#', label: 'Instagram', color: 'hover:text-comic-pink hover:shadow-[0_0_12px_rgba(255,0,255,0.4)]' },
  { icon: FaTwitter, href: '#', label: 'Twitter', color: 'hover:text-comic-cyan hover:shadow-[0_0_12px_rgba(0,217,255,0.4)]' },
  { icon: FaLinkedin, href: '#', label: 'LinkedIn', color: 'hover:text-comic-cyan hover:shadow-[0_0_12px_rgba(0,217,255,0.4)]' },
  { icon: FaEnvelope, href: 'mailto:gajavanan27@gmail.com', label: 'Email', color: 'hover:text-comic-yellow hover:shadow-[0_0_12px_rgba(255,229,0,0.4)]' },
];

const Footer = () => (
  <footer className="relative bg-comic-darker border-t border-white/10">
    {/* Gradient top line */}
    <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-comic-cyan to-transparent" />

    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        {/* Brand */}
        <div>
          <h3 className="font-bangers text-3xl mb-2">
            <span className="text-comic-yellow">TEX</span>
            <span className="text-white">PERIA</span>
            <span className="text-comic-yellow"> 2026</span>
          </h3>
          <p className="text-xs mb-3 px-3 py-1 inline-block rounded-full border border-white/10" style={{ background: 'rgba(22,22,42,0.8)' }}>
            <span className="text-gray-300">BEYOND BOOKS</span> <span>📖✨</span>
          </p>
          <p className="font-comic text-gray-500 text-sm leading-relaxed">
            Unleash your creativity with AI-powered comic creation!
            Organized by SNS College of Technology.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="font-bangers text-lg text-comic-cyan mb-4">Quick Links</h4>
          <ul className="space-y-2 font-comic">
            {[
              { to: '/', label: 'Home' },
              { to: '/register', label: 'Register' },
              { href: '#rules', label: 'Rules' },
              { href: '#faq', label: 'FAQ' },
              { href: '#contact', label: 'Contact' },
            ].map((link) => (
              <li key={link.label}>
                {link.to ? (
                  <Link to={link.to} className="text-gray-500 hover:text-comic-cyan transition-colors text-sm">
                    {link.label}
                  </Link>
                ) : (
                  <a href={link.href} className="text-gray-500 hover:text-comic-cyan transition-colors text-sm">
                    {link.label}
                  </a>
                )}
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="font-bangers text-lg text-comic-cyan mb-4">Get in Touch</h4>
          <div className="font-comic text-gray-500 text-sm space-y-1.5">
            <p>SNS College of Technology</p>
            <p>Coimbatore, Tamil Nadu</p>
            <p>Email: gajavanan27@gmail.com</p>
          </div>

          <div className="flex gap-3 mt-5">
            {socials.map(({ icon: Icon, href, label, color }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                className={`w-10 h-10 rounded-xl border border-white/10 flex items-center justify-center text-gray-500 transition-all duration-300 ${color}`}
                style={{ background: 'rgba(22,22,42,0.6)' }}
              >
                <Icon size={18} />
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div className="mt-10 pt-6 border-t border-white/5 text-center">
        <p className="font-comic text-gray-600 text-sm">
          © 2026 AI Comic Strip Challenge. All rights reserved.
        </p>
        <p className="font-comic text-gray-700 text-xs mt-1">
          Made with 💜 by SNS College of Technology
        </p>
      </div>
    </div>
  </footer>
);

export default Footer;
