"use client";

import { useEffect, useRef } from 'react';

// Counts the numbers in a value up from zero, once, over 400ms, the first time
// it scrolls into view. Without JavaScript, or when the visitor prefers reduced
// motion, the final value is simply shown.
export default function CountUp({ text, className }: { text: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (!/\d/.test(text)) return;

    let raf = 0;
    let started = false;

    const run = () => {
      const t0 = performance.now();
      const step = (now: number) => {
        const p = Math.min(1, (now - t0) / 400);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = text.replace(/\d+(\.\d+)?/g, (m) => {
          const decimals = (m.split('.')[1] ?? '').length;
          return (parseFloat(m) * eased).toFixed(decimals);
        });
        if (p < 1) raf = requestAnimationFrame(step);
        else el.textContent = text;
      };
      raf = requestAnimationFrame(step);
    };

    const io = new IntersectionObserver((entries) => {
      if (!started && entries.some((e) => e.isIntersecting)) {
        started = true;
        io.disconnect();
        run();
      }
    });
    io.observe(el);

    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
      el.textContent = text;
    };
  }, [text]);

  return (
    <span ref={ref} className={className}>
      {text}
    </span>
  );
}
