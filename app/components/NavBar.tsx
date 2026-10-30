"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Icon from "@/app/components/Icons";
import { openContact } from "@/app/components/openContact";

const LINKS = [
  { href: "/", label: "Database", match: (p: string) => p === "/" || p.startsWith("/player") },
  { href: "/regions", label: "Regions", match: (p: string) => p.startsWith("/regions") },
  { href: "/about", label: "About", match: (p: string) => p.startsWith("/about") },
];

function Logo({ height }: { height: number }) {
  return (
    <Image
      src="/logo-crop.png"
      alt="R6Sens"
      width={519}
      height={172}
      priority
      style={{ height, width: "auto" }}
    />
  );
}

export default function NavBar() {
  const pathname = usePathname();
  const router = useRouter();
  const menuRef = useRef<HTMLDialogElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  // Close the phone menu whenever the page changes.
  useEffect(() => {
    menuRef.current?.close();
  }, [pathname]);

  const openMenu = () => {
    menuRef.current?.showModal();
    setMenuOpen(true);
  };

  // Phone search icon: focus the home search, or go to /?focus=search.
  const goSearch = () => {
    if (pathname === "/") {
      const input = document.getElementById("player-search") as HTMLInputElement | null;
      input?.scrollIntoView({ block: "center" });
      input?.focus();
    } else {
      router.push("/?focus=search");
    }
  };

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-ground">
      <nav
        aria-label="Primary"
        className="page grid h-[60px] grid-cols-[1fr_auto] items-center md:h-[76px] md:grid-cols-[1fr_auto_1fr]"
      >
        <Link href="/" aria-label="R6Sens home" className="justify-self-start">
          <span className="hidden md:block">
            <Logo height={40} />
          </span>
          <span className="md:hidden">
            <Logo height={28} />
          </span>
        </Link>

        {/* Desktop and tablet links */}
        <ul className="hidden items-center gap-10 md:flex">
          {LINKS.map((l) => {
            const active = l.match(pathname);
            return (
              <li key={l.href}>
                <Link
                  href={l.href}
                  aria-current={active ? "page" : undefined}
                  className={`inline-block border-b-2 py-2 text-[15px] font-medium transition-colors duration-[120ms] ${
                    active
                      ? "border-accent text-ink"
                      : "border-transparent text-muted hover:text-ink"
                  }`}
                >
                  {l.label}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="hidden justify-self-end md:block">
          <button type="button" className="btn btn-primary" onClick={() => openContact()}>
            Send your settings
            <Icon name="arrow-up-right" />
          </button>
        </div>

        {/* Phone: search + menu */}
        <div className="flex items-center gap-1 justify-self-end md:hidden">
          <button
            type="button"
            aria-label="Search players"
            onClick={goSearch}
            className="flex h-11 w-11 items-center justify-center"
          >
            <Icon name="search" size={22} />
          </button>
          <button
            type="button"
            aria-label="Open menu"
            aria-haspopup="dialog"
            aria-expanded={menuOpen}
            onClick={openMenu}
            className="flex h-11 w-11 items-center justify-center"
          >
            <Icon name="menu" size={24} />
          </button>
        </div>
      </nav>

      {/* Full-screen phone menu. A native <dialog> traps focus and closes on Escape. */}
      <dialog
        ref={menuRef}
        aria-label="Menu"
        onClose={() => setMenuOpen(false)}
        className="m-0 hidden h-full max-h-none w-full max-w-none flex-col bg-ground p-0 open:flex md:hidden"
      >
        <div className="page flex h-[60px] items-center justify-between border-b border-line">
          <Logo height={28} />
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => menuRef.current?.close()}
            className="flex h-11 w-11 items-center justify-center"
          >
            <Icon name="x" size={24} />
          </button>
        </div>
        <ul className="page flex flex-1 flex-col pt-6">
          {LINKS.map((l) => {
            const active = l.match(pathname);
            return (
              <li key={l.href} className="border-b border-line">
                <Link
                  href={l.href}
                  onClick={() => menuRef.current?.close()}
                  aria-current={active ? "page" : undefined}
                  className={`display block py-5 text-[40px] ${active ? "text-accent" : "text-ink"}`}
                >
                  {l.label}
                </Link>
              </li>
            );
          })}
        </ul>
        <div className="page pb-8">
          <button
            type="button"
            className="btn btn-primary w-full"
            onClick={() => {
              menuRef.current?.close();
              openContact();
            }}
          >
            Send your settings
            <Icon name="arrow-up-right" />
          </button>
        </div>
      </dialog>
    </header>
  );
}
