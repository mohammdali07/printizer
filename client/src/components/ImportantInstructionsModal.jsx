import React, { useState, useEffect } from 'react';
import { AlertTriangle, X, CheckCircle2 } from 'lucide-react';

const INSTRUCTIONS_SEEN_KEY = 'prz_important_instructions_seen';

const INSTRUCTIONS = [
  {
    num: 1,
    title: 'Design File',
    body: 'For printing, designs must be properly arranged, set, and converted to curves in a CDR file before submission.'
  },
  {
    num: 2,
    title: 'Process Details',
    body: 'Please mention all relevant processing details inside the CDR file itself, regardless of the type of process required for the submitted printing job.'
  },
  {
    num: 3,
    title: 'Colour Mode',
    body: 'Designs must be submitted in CMYK colour mode only. If files are submitted in RGB, Pantone, or any other colour mode, the responsibility will be entirely yours.'
  },
  {
    num: 4,
    title: 'Bitmap Conversion',
    body: 'Images, text, transparency, tracing, PowerClip, and other such elements must be converted to bitmaps before submission. If they are not converted to bitmaps, the responsibility will be entirely yours.'
  },
  {
    num: 5,
    title: 'Job Size & Printing Area',
    body: 'Please check the job dimensions and printing area carefully before submitting the CDR file.'
  },
  {
    num: 6,
    title: 'Colour Matching',
    body: 'Please provide a colour sample for colour matching. If no sample is provided, the responsibility for any colour mismatch will be entirely yours.'
  },
  {
    num: 7,
    title: 'Software Version',
    body: 'Files must be submitted in CorelDRAW X7 format.'
  }
];

export default function ImportantInstructionsModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    try {
      const seen = localStorage.getItem(INSTRUCTIONS_SEEN_KEY);
      if (!seen) {
        setIsOpen(true);
        localStorage.setItem(INSTRUCTIONS_SEEN_KEY, '1');
      }
    } catch {
      setIsOpen(true);
    }
  }, []);

  const handleClose = () => {
    try {
      localStorage.setItem(INSTRUCTIONS_SEEN_KEY, '1');
    } catch {}
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
      <div
        onClick={handleClose}
        className="fixed inset-0"
        aria-hidden="true"
      />
      <div className="relative z-10 bg-white rounded-2xl sm:rounded-3xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden text-left">
        {/* Header */}
        <div className="bg-brand-navy px-5 py-4 sm:px-6 sm:py-5 text-white flex items-start justify-between gap-4">
          <div className="flex items-start space-x-3">
            <div className="w-9 h-9 rounded-xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center shrink-0 mt-0.5">
              <AlertTriangle className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-white leading-tight">
                Important Instructions
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-300 mt-0.5">
                To avoid wasting time and money, please read the following instructions carefully before submitting your files.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center shrink-0 transition cursor-pointer"
            aria-label="Close Important Instructions"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-6 max-h-[68vh] overflow-y-auto space-y-3">
          {INSTRUCTIONS.map((item) => (
            <div
              key={item.num}
              className="flex items-start space-x-3 bg-slate-50 border border-slate-200/80 rounded-xl p-3 sm:p-3.5"
            >
              <span className="w-6 h-6 rounded-full bg-brand-crimson text-white text-xs font-extrabold flex items-center justify-center shrink-0 mt-0.5">
                {item.num}
              </span>
              <p className="text-xs sm:text-[13px] text-slate-700 leading-relaxed">
                <strong className="text-slate-900">{item.title}:</strong> {item.body}
              </p>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-5 py-3.5 sm:px-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={handleClose}
            className="w-full sm:w-auto bg-brand-crimson hover:bg-brand-red text-white font-bold text-xs sm:text-sm px-6 py-2.5 rounded-xl shadow-md transition flex items-center justify-center space-x-2 cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>I Understand, Continue</span>
          </button>
        </div>
      </div>
    </div>
  );
}
