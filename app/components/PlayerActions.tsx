"use client";

import { useEffect, useRef, useState } from 'react';
import Icon from '@/app/components/Icons';

// Share + Copy settings for the player page.
// Share uses the Web Share API when the browser has it, otherwise it copies the URL.
export default function PlayerActions({
  name,
  copyText,
}: {
  name: string;
  copyText: string;
}) {
  const [toast, setToast] = useState('');
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  const show = (message: string) => {
    setToast(message);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(''), 2200);
  };

  const copy = async (text: string, message: string) => {
    try {
      await navigator.clipboard.writeText(text);
      show(message);
    } catch {
      show('Could not copy. Please copy it by hand.');
    }
  };

  const share = async () => {
    const url = window.location.href;
    if (typeof navigator.share === 'function') {
      try {
        await navigator.share({ title: `${name} settings | R6Sens`, url });
        return;
      } catch (err) {
        // The visitor closed the share sheet: nothing more to do.
        if (err instanceof DOMException && err.name === 'AbortError') return;
      }
    }
    await copy(url, 'Link copied');
  };

  return (
    <>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={share}
          aria-label="Share"
          className="btn btn-secondary order-2 w-11 shrink-0 px-0 md:order-1 md:w-auto md:px-5"
        >
          <span className="hidden md:inline">Share</span>
          <Icon name="link" />
        </button>
        <button
          type="button"
          onClick={() => copy(copyText, 'Settings copied')}
          className="btn btn-primary order-1 flex-1 md:order-2 md:flex-none"
        >
          Copy settings
          <Icon name="copy" />
        </button>
      </div>

      {/* Toast */}
      <div
        role="status"
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex justify-center px-5"
      >
        {toast && (
          <p className="border border-line bg-panel px-4 py-3 text-[14px] font-medium text-ink">
            {toast}
          </p>
        )}
      </div>
    </>
  );
}
