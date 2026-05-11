import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Mail } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';

const FloatingContactButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div 
      ref={containerRef}
      className="fixed bottom-6 right-6 z-[9999] lg:hidden flex flex-col items-end gap-3"
    >
      <AnimatePresence>
        {isOpen && (
          <div className="flex flex-col items-end gap-3 mb-2">
            {/* WhatsApp Option */}
            <motion.a
              href="https://wa.me/918300278515"
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 20, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.8 }}
              transition={{ 
                type: "spring",
                stiffness: 260,
                damping: 20,
                delay: 0.1 
              }}
              className="flex items-center gap-3 bg-[#25D366] text-white px-5 py-2.5 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95 group"
            >
              <span className="text-sm font-semibold tracking-wide">WhatsApp</span>
              <div className="bg-white/20 p-1.5 rounded-full">
                <FaWhatsapp className="text-xl" />
              </div>
            </motion.a>

            {/* Email Option */}
            <motion.a
              href="mailto:camohanrajbullbear@gmail.com"
              initial={{ opacity: 0, y: 20, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.8 }}
              transition={{ 
                type: "spring",
                stiffness: 260,
                damping: 20
              }}
              className="flex items-center gap-3 bg-white text-gray-800 px-5 py-2.5 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95 border border-gray-100 group"
            >
              <span className="text-sm font-semibold tracking-wide">Email Us</span>
              <div className="bg-primary/10 p-1.5 rounded-full">
                <Mail size={20} className="text-primary" />
              </div>
            </motion.a>
          </div>
        )}
      </AnimatePresence>

      {/* Main Floating Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.9 }}
        className={`w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 border-2 ${
          isOpen 
            ? 'bg-gray-900 border-gray-700 text-white' 
            : 'bg-primary border-white/20 text-primary-foreground'
        }`}
        aria-label="Contact options"
      >
        <motion.div
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ 
            type: "spring",
            stiffness: 260,
            damping: 20
          }}
        >
          <Plus size={32} strokeWidth={2.5} />
        </motion.div>
      </motion.button>
    </div>
  );
};

export default FloatingContactButton;
