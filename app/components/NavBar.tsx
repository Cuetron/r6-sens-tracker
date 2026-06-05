"use client";

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function NavBar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false); // Controls the mobile menu

  return (
    // ADDED: 'relative' to trap the absolute links, and 'h-fit' to kill the invisible shield
    <nav className="relative h-fit sticky top-0 z-50 flex flex-col md:flex-row items-center justify-between px-6 md:px-12 py-4 md:py-6 bg-[#09090b]/80 backdrop-blur-md border-b border-gray-800 mb-8 w-full">
      
      {/* Top Bar (Always visible) */}
      <div className="flex items-center justify-between w-full md:w-auto">
        {/* Left: Logo */}
        <Link href="/" className="flex items-center hover:opacity-80 transition-opacity">
          <img 
            src="/logo.png" 
            alt="R6 Sens Tracker Logo" 
            className="h-8 md:h-10 w-auto object-contain drop-shadow-[0_0_8px_rgba(92,225,230,0.5)]" 
          />
        </Link>

        {/* Right: Hamburger Menu Button (Mobile Only) */}
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden text-white hover:text-[#5ce1e6] focus:outline-none transition-colors"
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
          </svg>
        </button>
      </div>

      {/* Center: Smart Links (Desktop Only) */}
      <div className="hidden md:flex space-x-12 uppercase tracking-widest text-sm font-semibold absolute left-1/2 transform -translate-x-1/2">
        <Link href="/" className={`transition-colors ${pathname === '/' ? 'border-b-2 border-white pb-1' : 'text-gray-300 hover:text-white'}`}>Database</Link>
        <Link href="/regions" className={`transition-colors ${pathname.startsWith('/regions') ? 'border-b-2 border-white pb-1' : 'text-gray-300 hover:text-white'}`}>Regions</Link>
        <Link href="/about" className={`transition-colors ${pathname === '/about' ? 'border-b-2 border-white pb-1' : 'text-gray-300 hover:text-white'}`}>About & Contact</Link>
      </div>
      
      {/* Mobile Links Dropdown */}
      {isOpen && (
        <div className="flex flex-col md:hidden w-full pt-4 gap-4 text-center uppercase tracking-widest text-sm font-bold border-t border-gray-800 mt-4">
          <Link href="/" onClick={() => setIsOpen(false)} className={`py-2 transition-colors ${pathname === '/' ? 'text-[#5ce1e6]' : 'text-gray-300'}`}>Database</Link>
          <Link href="/regions" onClick={() => setIsOpen(false)} className={`py-2 transition-colors ${pathname.startsWith('/regions') ? 'text-[#5ce1e6]' : 'text-gray-300'}`}>Regions</Link>
          <Link href="/about" onClick={() => setIsOpen(false)} className={`py-2 transition-colors ${pathname === '/about' ? 'text-[#5ce1e6]' : 'text-gray-300'}`}>About & Contact</Link>
        </div>
      )}
      
      {/* Right: Spacer (Desktop Only) */}
      <div className="hidden md:block w-[120px]"></div> 
    </nav>
  );
}