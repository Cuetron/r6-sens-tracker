"use client";

import { useState } from 'react';

export default function ContactWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In the future, this is where you will send the data to a new Supabase 'Submissions' table!
    setIsSubmitted(true);
    
    // Automatically close the widget after 3 seconds
    setTimeout(() => {
      setIsOpen(false);
      setIsSubmitted(false);
    }, 3000);
  };

  return (
    <div className="fixed bottom-8 right-8 z-50 font-sans">
      
      {/* --- THE POPUP FORM --- */}
      {isOpen && (
        <div className="mb-4 w-96 bg-[#09090b] border border-gray-800 shadow-[0_0_20px_rgba(0,0,0,0.8)] flex flex-col transform origin-bottom-right transition-all duration-300">
          
          {/* Header */}
          <div className="bg-[#18181b] p-4 border-b border-gray-800 flex justify-between items-center">
            <h3 className="text-[#5ce1e6] font-bold uppercase tracking-widest text-sm">
              Submit Intel
            </h3>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-gray-500 hover:text-white transition-colors text-xl font-bold leading-none"
            >
              ×
            </button>
          </div>

          {/* Form Body */}
          <div className="p-6">
            {isSubmitted ? (
              <div className="text-center py-8">
                <div className="text-[#39ff14] text-4xl mb-4">✓</div>
                <h4 className="text-white font-bold uppercase tracking-widest mb-2">Transmission Sent</h4>
                <p className="text-gray-400 text-sm">The intel will be verified shortly.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Request Type</label>
                  <select className="bg-[#18181b] text-white px-3 py-2 border border-gray-800 focus:outline-none focus:border-[#5ce1e6] text-xs uppercase tracking-wider cursor-pointer">
                    <option value="tip">Community Tip</option>
                    <option value="pro">Pro Player Verification</option>
                    <option value="new">Missing Player Addition</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Player Name</label>
                  <input required type="text" className="bg-[#18181b] text-white px-3 py-2 border border-gray-800 focus:outline-none focus:border-[#5ce1e6] text-xs uppercase tracking-wider placeholder:text-gray-700" placeholder="E.G. BEAULO" />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">X (Twitter) Handle / VOD Source</label>
                  <input required type="text" className="bg-[#18181b] text-white px-3 py-2 border border-gray-800 focus:outline-none focus:border-[#5ce1e6] text-xs uppercase tracking-wider placeholder:text-gray-700" placeholder="@HANDLE OR TWITCH LINK" />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">New Settings</label>
                  <textarea required rows={3} className="bg-[#18181b] text-white px-3 py-2 border border-gray-800 focus:outline-none focus:border-[#5ce1e6] text-xs tracking-wider placeholder:text-gray-700 resize-none" placeholder="Include DPI, Multiplier, Sens..."></textarea>
                </div>

                <button type="submit" className="mt-2 bg-[#5ce1e6] text-black font-black uppercase tracking-widest text-sm px-4 py-3 hover:bg-white transition-colors">
                  Send Data
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* --- THE FLOATING BUTTON --- */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-16 h-16 bg-[#5ce1e6] hover:bg-white text-black rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(92,225,230,0.4)] hover:shadow-[0_0_25px_rgba(255,255,255,0.6)] transition-all duration-300 transform hover:scale-105"
      >
        {/* Simple SVG Icon for a Chat Bubble */}
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785A5.969 5.969 0 006 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337z" />
        </svg>
      </button>

    </div>
  );
}