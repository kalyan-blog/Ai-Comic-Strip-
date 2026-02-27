/**
 * Splash Screen Component - TEXPERIA 2026 Opening Animation
 * AI Comic Strip Challenge - SNS College of Technology
 */

import { useState, useEffect } from 'react';

const SplashScreen = ({ onComplete }) => {
  const [isExiting, setIsExiting] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    // Start exit animation after 1.8 seconds
    const exitTimer = setTimeout(() => {
      setIsExiting(true);
    }, 1800);

    // Complete and unmount after exit animation
    const completeTimer = setTimeout(() => {
      onComplete();
    }, 2400);

    return () => {
      clearTimeout(exitTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden transition-all duration-500 ease-out
        ${isExiting ? 'opacity-0 scale-105' : 'opacity-100 scale-100'}`}
      style={{
        background: 'linear-gradient(135deg, #FAFAFA 0%, #F5F5F5 50%, #EBEBEB 100%)',
      }}
    >
      {/* Subtle background pattern */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0,0,0,0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,0,0,0.05) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Main Image Container */}
      <div 
        className={`relative flex flex-col items-center justify-center px-4 transition-all duration-1000 ease-out
          ${imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
      >
        {/* TEXPERIA Banner Image */}
        <img
          src="/TEXPERIA.jpeg"
          alt="TEXPERIA 2026 - Beyond Books"
          className="max-w-full max-h-[70vh] w-auto h-auto object-contain rounded-2xl shadow-2xl border-4 border-black"
          style={{
            boxShadow: '8px 8px 0px 0px #000000, 16px 16px 30px rgba(0,0,0,0.2)',
          }}
          onLoad={() => setImageLoaded(true)}
        />

        {/* Subtitle */}
        <div 
          className={`mt-8 text-center transition-all duration-700 delay-500
            ${imageLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
        >
          <p className="font-bangers text-2xl md:text-3xl text-gray-800 mb-2">
            <span className="text-comic-cyan">AI</span>
            <span className="text-gray-800"> Comic Strip </span>
            <span className="text-comic-pink">Challenge</span>
          </p>
          <p className="font-comic text-gray-600">
            SNS College of Technology
          </p>
        </div>

        {/* Loading dots */}
        <div 
          className={`mt-6 flex gap-2 transition-all duration-500 delay-700
            ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
        >
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-3 h-3 rounded-full animate-bounce"
              style={{
                backgroundColor: i === 0 ? '#FFD700' : i === 1 ? '#1a1a1a' : '#FFD700',
                animationDelay: `${i * 0.15}s`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Loading placeholder while image loads */}
      {!imageLoaded && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-gray-300 border-t-yellow-500 rounded-full animate-spin mb-4 mx-auto" />
            <p className="font-bangers text-2xl text-gray-600">Loading...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SplashScreen;
