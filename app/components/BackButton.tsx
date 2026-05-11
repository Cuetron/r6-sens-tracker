"use client";

import { useRouter } from 'next/navigation';

export default function BackButton() {
  const router = useRouter();

  return (
    <button 
      onClick={() => router.back()} 
      className="text-[#5ce1e6] hover:text-white uppercase tracking-widest text-sm font-bold transition-colors cursor-pointer"
    >
      ← Go Back
    </button>
  );
}