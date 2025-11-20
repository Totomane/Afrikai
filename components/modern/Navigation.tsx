import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Globe, Menu, X } from 'lucide-react';

interface NavigationProps {
  onGetStarted: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({ onGetStarted }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/80 backdrop-blur-lg shadow-lg'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <Globe className="w-6 h-6 text-white" />
            </div>
            <span className={`text-xl font-bold ${scrolled ? 'text-gray-900' : 'text-gray-900'}`}>
              AfrikAI
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className={`font-medium hover:text-blue-600 transition-colors ${scrolled ? 'text-gray-700' : 'text-gray-700'}`}>
              Features
            </a>
            <a href="#product" className={`font-medium hover:text-blue-600 transition-colors ${scrolled ? 'text-gray-700' : 'text-gray-700'}`}>
              Product
            </a>
            <a href="#pricing" className={`font-medium hover:text-blue-600 transition-colors ${scrolled ? 'text-gray-700' : 'text-gray-700'}`}>
              Pricing
            </a>
            <a href="#security" className={`font-medium hover:text-blue-600 transition-colors ${scrolled ? 'text-gray-700' : 'text-gray-700'}`}>
              Security
            </a>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <button
              onClick={onGetStarted}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Get Started
            </button>
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6 text-gray-900" />
            ) : (
              <Menu className="w-6 h-6 text-gray-900" />
            )}
          </button>
        </div>

        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden pt-4 pb-2"
          >
            <div className="flex flex-col gap-4">
              <a href="#features" className="text-gray-700 font-medium py-2">Features</a>
              <a href="#product" className="text-gray-700 font-medium py-2">Product</a>
              <a href="#pricing" className="text-gray-700 font-medium py-2">Pricing</a>
              <a href="#security" className="text-gray-700 font-medium py-2">Security</a>
              <button
                onClick={onGetStarted}
                className="px-6 py-3 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-700 transition-all"
              >
                Get Started
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </motion.nav>
  );
};
