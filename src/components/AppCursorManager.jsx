import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useCursorContext } from '../contexts/CursorContext.jsx';
import RupeeCursor from './RupeeCursor.jsx';
import { X, MousePointer2 } from 'lucide-react';

const AppCursorManager = () => {
  const { preference, updatePreference, hasDismissedPopup, dismissPopup } = useCursorContext();
  
  const showPopup = !preference && !hasDismissedPopup;

  // Handle escape key and modal-active state for popup
  useEffect(() => {
    if (!showPopup) {
      document.body.classList.remove('modal-active');
      return;
    }
    
    document.body.classList.add('modal-active');
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') dismissPopup();
    };
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.classList.remove('modal-active');
    };
  }, [showPopup, dismissPopup]);

  return (
    <>
      {preference === 'rupee' && <RupeeCursor />}
      
      {showPopup && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl p-6 max-w-md w-full shadow-2xl relative" 
            role="dialog" 
            aria-labelledby="cursor-choice-title"
          >
            <button 
              onClick={dismissPopup}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-[var(--bg-surface-2)] transition-colors text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              aria-label="Close popup"
            >
              <X className="w-5 h-5" />
            </button>
            
            <h2 id="cursor-choice-title" className="text-xl font-bold mb-2 text-[var(--text-primary)]">Choose your cursor experience</h2>
            <p className="text-sm text-[var(--text-secondary)] mb-6">Personalize how you interact with IniRazorAI.</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button 
                onClick={() => { updatePreference('rupee'); dismissPopup(); }}
                className="flex flex-col items-center text-center p-4 rounded-xl border border-[var(--border)] hover:border-[var(--primary)] bg-[var(--bg-surface-2)] hover:bg-[var(--primary-subtle)] transition-all group focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              >
                <div className="w-12 h-12 rounded-full border border-[var(--primary)] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform bg-[var(--bg-surface)] relative">
                   <span className="font-extrabold text-[var(--text-primary)] text-lg z-10" style={{ textShadow: '0 0 2px var(--bg-surface), -1px -1px 0 var(--bg-surface), 1px -1px 0 var(--bg-surface), -1px 1px 0 var(--bg-surface), 1px 1px 0 var(--bg-surface)' }}>₹</span>
                </div>
                <h3 className="font-semibold text-sm text-[var(--text-primary)] mb-1">₹ Rupee Cursor</h3>
                <p className="text-xs text-[var(--text-muted)]">A custom cursor designed for the IniRazorAI experience.</p>
              </button>

              <button 
                onClick={() => { updatePreference('default'); dismissPopup(); }}
                className="flex flex-col items-center text-center p-4 rounded-xl border border-[var(--border)] hover:border-[var(--text-primary)] bg-[var(--bg-surface-2)] hover:bg-[var(--bg-surface)] transition-all group focus:outline-none focus:ring-2 focus:ring-[var(--text-primary)]"
              >
                <div className="w-12 h-12 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
                   <MousePointer2 className="w-5 h-5 text-[var(--text-secondary)]" />
                </div>
                <h3 className="font-semibold text-sm text-[var(--text-primary)] mb-1">Normal Cursor</h3>
                <p className="text-xs text-[var(--text-muted)]">Use your device's default cursor.</p>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
};

export default AppCursorManager;
