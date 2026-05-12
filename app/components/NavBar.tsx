"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function NavBar() {
  const pathname = usePathname(); // This gets the current URL path

  return (
    <nav className="sticky top-0 z-50 flex items-center justify-between px-12 py-6 bg-[#09090b]/80 backdrop-blur-md border-b border-gray-800 mb-8">
      
      {/* Left: Logo */}
      <Link href="/" className="flex items-center hover:opacity-80 transition-opacity">
        <img 
          src="/logo.png" 
          alt="R6 Sens Tracker Logo" 
          className="h-10 w-auto object-contain drop-shadow-[0_0_8px_rgba(92,225,230,0.5)]" 
        />
      </Link>

      {/* Center: Smart Links */}
      <div className="flex space-x-12 uppercase tracking-widest text-sm font-semibold absolute left-1/2 transform -translate-x-1/2">
        <Link 
          href="/" 
          // If the path is exactly "/", show the white underline. Otherwise, make it gray.
          className={`transition-colors ${pathname === '/' ? 'border-b-2 border-white pb-1' : 'text-gray-300 hover:text-white'}`}
        >
          Database
        </Link>
        <Link 
          href="/regions" 
          // If the path starts with "/regions" (handles sub-regions too!), show the underline.
          className={`transition-colors ${pathname.startsWith('/regions') ? 'border-b-2 border-white pb-1' : 'text-gray-300 hover:text-white'}`}
        >
          Regions
        </Link>
        <Link 
          href="/about" 
          className={`transition-colors ${pathname === '/about' ? 'border-b-2 border-white pb-1' : 'text-gray-300 hover:text-white'}`}
        >
          About & Contact
        </Link>
      </div>
      
      {/* Right: Spacer */}
      <div className="w-[120px]"></div> 
    </nav>
  );
}