"use client";

import { useEffect, useRef, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import Icon from '@/app/components/Icons';
import { OPEN_CONTACT_EVENT } from '@/app/components/openContact';

// Initialize Supabase directly in the component
// (not the cached server client: this form writes and must never be cached)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const EMPTY_FORM = {
  requestType: 'tip',
  playerName: '',
  sourceLink: '',
  newSettings: ''
};

const fieldClass =
  'w-full border border-line bg-panel px-3 py-3 text-[15px] text-ink placeholder:text-muted transition-colors duration-[120ms] hover:border-muted focus:border-accent focus:outline-none';

// The contact form, shown as a modal. Any "Send your settings" button opens it
// through openContact() (see openContact.ts). A native <dialog> handles focus
// trapping and closing on Escape.
export default function ContactWidget() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Form State
  const [formData, setFormData] = useState(EMPTY_FORM);

  useEffect(() => {
    const onOpen = (e: Event) => {
      const requestType = (e as CustomEvent<{ requestType?: string }>).detail?.requestType;
      if (requestType) setFormData((prev) => ({ ...prev, requestType }));
      setError('');
      setIsSubmitted(false);
      if (!dialogRef.current?.open) dialogRef.current?.showModal();
    };
    window.addEventListener(OPEN_CONTACT_EVENT, onOpen);
    return () => {
      window.removeEventListener(OPEN_CONTACT_EVENT, onOpen);
      if (closeTimer.current) clearTimeout(closeTimer.current);
    };
  }, []);

  const close = () => dialogRef.current?.close();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

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
      setFormData(EMPTY_FORM);

      // Automatically close the dialog after 3 seconds
      closeTimer.current = setTimeout(() => {
        dialogRef.current?.close();
        setIsSubmitted(false);
      }, 3000);

    } catch (err) {
      console.error('Error submitting intel:', err);
      setError('That did not send. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="contact-title"
      onClick={(e) => {
        // Click on the backdrop (the dialog element itself) closes it
        if (e.target === dialogRef.current) close();
      }}
      className="m-auto hidden w-[calc(100%-40px)] max-w-[480px] border border-line bg-ground p-0 open:block"
    >
      <div className="flex items-center justify-between border-b border-line px-6 py-4">
        <h2 id="contact-title" className="display text-[28px]">
          Send your settings
        </h2>
        <button
          type="button"
          aria-label="Close"
          onClick={close}
          className="-mr-2 flex h-11 w-11 items-center justify-center text-muted transition-colors duration-[120ms] hover:text-ink"
        >
          <Icon name="x" size={22} />
        </button>
      </div>

      <div className="p-6">
        {isSubmitted ? (
          <div role="status" className="py-10 text-center">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center border border-accent text-accent">
              <Icon name="check" size={28} />
            </div>
            <p className="display text-[32px]">Sent</p>
            <p className="mt-3 text-[15px] text-muted">The settings will be verified shortly.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">

            <div className="flex flex-col gap-2">
              <label htmlFor="contact-type" className="text-[13px] text-muted">Request type</label>
              <select
                id="contact-type"
                name="requestType"
                value={formData.requestType}
                onChange={handleChange}
                className={`${fieldClass} cursor-pointer`}
              >
                <option value="tip">Community tip</option>
                <option value="pro">Pro player verification</option>
                <option value="new">Missing player addition</option>
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="contact-player" className="text-[13px] text-muted">Player name</label>
              <input
                id="contact-player"
                required
                type="text"
                name="playerName"
                value={formData.playerName}
                onChange={handleChange}
                className={fieldClass}
                placeholder="e.g. Beaulo"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="contact-source" className="text-[13px] text-muted">X handle or VOD source</label>
              <input
                id="contact-source"
                required
                type="text"
                name="sourceLink"
                value={formData.sourceLink}
                onChange={handleChange}
                className={fieldClass}
                placeholder="@itsQuetron or a Twitch link"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="contact-settings" className="text-[13px] text-muted">New settings</label>
              <textarea
                id="contact-settings"
                required
                rows={4}
                name="newSettings"
                value={formData.newSettings}
                onChange={handleChange}
                className={`${fieldClass} resize-none`}
                placeholder="Include DPI, multiplier, sens..."
              ></textarea>
            </div>

            {error && (
              <p role="alert" className="text-[14px] text-ink">
                {error}
              </p>
            )}

            <button type="submit" disabled={isSubmitting} className="btn btn-primary w-full">
              {isSubmitting ? 'Sending...' : 'Send settings'}
              {!isSubmitting && <Icon name="arrow-up-right" />}
            </button>
          </form>
        )}
      </div>
    </dialog>
  );
}
