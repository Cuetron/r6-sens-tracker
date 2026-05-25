"use client";

import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase directly in the component
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function ContactWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    requestType: 'tip',
    playerName: '',
    sourceLink: '',
    newSettings: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Insert the data into your Supabase table
      const { error } = await supabase
        .from('submissions')
        .insert([
          {
            request_type: formData.requestType,
            player_name: formData.playerName,
            source_link: formData.sourceLink,
            new_settings: formData.newSettings,
          }
        ]);

      if (error) throw error;

      // Success sequence
      setIsSubmitted(true);
      
      // Reset form
      setFormData({
        requestType: 'tip',
        playerName: '',
        sourceLink: '',
        newSettings: ''
      });

      // Automatically close the widget after 3 seconds
      setTimeout(() => {
        setIsOpen(false);
        setIsSubmitted(false);
      }, 3000);

    } catch (error) {
      console.error('Error submitting intel:', error);
      alert('Transmission failed. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed bottom-8 right-8 z-50 font-sans flex flex-col items-end">
      
      {/* --- THE POPUP FORM --- */}
      <div 
        className={`mb-4 w-96 bg-[#09090b]/95 backdrop-blur-md border border-white/10 rounded-lg shadow-2xl shadow-black/50 transform origin-bottom-right transition-all duration-300 ease-out overflow-hidden ${
          isOpen ? 'scale-100 opacity-100 translate-y-0 pointer-events-auto' : 'scale-95 opacity-0 translate-y-4 pointer-events-none'
        }`}
      >
        {/* Header */}
        <div className="bg-white/5 p-4 border-b border-white/10 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#5ce1e6] animate-pulse"></div>
            <h3 className="text-[#5ce1e6] font-bold uppercase tracking-widest text-xs">
              Submit Intel
            </h3>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="text-gray-400 hover:text-white hover:bg-white/10 rounded-md p-1 transition-all text-lg font-bold leading-none flex items-center justify-center w-6 h-6"
          >
            ×
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6">
          {isSubmitted ? (
            <div className="text-center py-10 animate-in fade-in zoom-in duration-300">
              <div className="w-16 h-16 bg-[#5ce1e6]/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-[#5ce1e6]/30">
                <svg className="w-8 h-8 text-[#5ce1e6]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h4 className="text-white font-bold uppercase tracking-widest mb-2">Transmission Sent</h4>
              <p className="text-gray-400 text-sm">The settings will be verified shortly.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold">Request Type</label>
                <select 
                  name="requestType"
                  value={formData.requestType}
                  onChange={handleChange}
                  className="bg-black/50 text-gray-200 px-3 py-2.5 rounded-md border border-white/10 focus:outline-none focus:ring-2 focus:ring-[#5ce1e6]/50 focus:border-transparent text-xs uppercase tracking-wider cursor-pointer transition-all appearance-none hover:border-white/20"
                >
                  <option value="tip">Community Tip</option>
                  <option value="pro">Pro Player Verification</option>
                  <option value="new">Missing Player Addition</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold">Player Name</label>
                <input 
                  required 
                  type="text" 
                  name="playerName"
                  value={formData.playerName}
                  onChange={handleChange}
                  className="bg-black/50 text-white px-3 py-2.5 rounded-md border border-white/10 focus:outline-none focus:ring-2 focus:ring-[#5ce1e6]/50 focus:border-transparent text-xs uppercase tracking-wider placeholder:text-gray-600 transition-all hover:border-white/20" 
                  placeholder="E.G. BEAULO" 
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold">X Handle / VOD Source</label>
                <input 
                  required 
                  type="text" 
                  name="sourceLink"
                  value={formData.sourceLink}
                  onChange={handleChange}
                  className="bg-black/50 text-white px-3 py-2.5 rounded-md border border-white/10 focus:outline-none focus:ring-2 focus:ring-[#5ce1e6]/50 focus:border-transparent text-xs uppercase tracking-wider placeholder:text-gray-600 transition-all hover:border-white/20" 
                  placeholder="@ITSQUETRON OR TWITCH LINK" 
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold">New Settings</label>
                <textarea 
                  required 
                  rows={3} 
                  name="newSettings"
                  value={formData.newSettings}
                  onChange={handleChange}
                  className="bg-black/50 text-white px-3 py-2.5 rounded-md border border-white/10 focus:outline-none focus:ring-2 focus:ring-[#5ce1e6]/50 focus:border-transparent text-xs tracking-wider placeholder:text-gray-600 resize-none transition-all hover:border-white/20" 
                  placeholder="Include DPI, Multiplier, Sens..."
                ></textarea>
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting}
                className="mt-2 bg-[#5ce1e6] hover:bg-white text-black font-black uppercase tracking-widest text-xs px-4 py-3.5 rounded-md shadow-[0_0_15px_rgba(92,225,230,0.2)] hover:shadow-[0_0_20px_rgba(255,255,255,0.4)] transition-all duration-300 transform active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Transmitting...' : 'Transmit Data'}
              </button>
            </form>
          )}
        </div>
      </div>

      {/* --- THE FLOATING BUTTON --- */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-[#5ce1e6] hover:bg-white text-black rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(92,225,230,0.4)] hover:shadow-[0_0_25px_rgba(255,255,255,0.6)] transition-all duration-300 transform hover:scale-105 active:scale-95"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={`w-7 h-7 transition-transform duration-300 ${isOpen ? 'rotate-90 scale-0 opacity-0 absolute' : 'rotate-0 scale-100 opacity-100'}`}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785A5.969 5.969 0 006 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337z" />
        </svg>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className={`w-7 h-7 transition-transform duration-300 ${isOpen ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-0 opacity-0 absolute'}`}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

    </div>
  );
}