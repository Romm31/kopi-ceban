"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

// --- Custom Icon System ---
const getIcon = (name: string, isActive: boolean) => {
  const colorClass = isActive ? "text-[#d4a857]" : "text-neutral-200 group-hover:text-[#d4a857]";
  
  switch (name) {
    case "Home":
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={cn("w-5 h-5 transition-all duration-300 group-hover:scale-110 group-hover:rotate-12", colorClass)}
        >
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      );
    case "Menu":
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={cn("w-5 h-5 transition-all duration-300 group-hover:scale-110 group-hover:rotate-12", colorClass)}
        >
          <path d="M8 6h13" />
          <path d="M8 12h13" />
          <path d="M8 18h13" />
          <path d="M3 6h.01" />
          <path d="M3 12h.01" />
          <path d="M3 18h.01" />
        </svg>
      );
    case "Pesan":
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={cn("w-5 h-5 transition-all duration-300 group-hover:scale-110 group-hover:rotate-12", colorClass)}
        >
          <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
          <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
          <line x1="6" y1="1" x2="6" y2="4" />
          <line x1="10" y1="1" x2="10" y2="4" />
          <line x1="14" y1="1" x2="14" y2="4" />
        </svg>
      );
    case "Tentang":
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={cn("w-5 h-5 transition-all duration-300 group-hover:scale-110 group-hover:rotate-12", colorClass)}
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="16" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
      );
    default:
      return null;
  }
};

export function Navbar() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Scroll Detection
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Lock Body Scroll
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [mobileMenuOpen]);

  // Links Configuration
  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Menu", href: "/menu" },
    { name: "Pesan", href: "/pesan" },
  ];

  return (
    <>
      <nav
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-in-out border-b",
          isScrolled
            ? "bg-[#0f0e0c]/95 backdrop-blur-xl py-3 border-[#2a2826] shadow-xl shadow-black/40"
            : "bg-transparent py-5 border-transparent"
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* --- Logo Section --- */}
            <Link href="/" className="flex items-center gap-3 group relative z-50">
              <div className="relative h-10 w-10 sm:h-12 sm:w-12 rounded-full overflow-hidden shadow-lg shadow-[#d4a857]/10 group-hover:shadow-[#d4a857]/30 transition-all duration-500 border border-[#d4a857]/20 group-hover:scale-105">
                <Image
                  src="/logo/logo.jpg"
                  alt="Kopi Ceban"
                  fill
                  className="object-cover"
                />
              </div>
              <span className="text-xl sm:text-2xl font-serif font-bold text-[#fefefe] tracking-wide">
                Kopi <span className="text-[#d4a857]">Ceban</span>
              </span>
            </Link>

            {/* --- Desktop Menu --- */}
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className="group flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-300 hover:bg-[#d4a857]/5"
                  >
                    {getIcon(link.name, isActive)}
                    <span
                      className={cn(
                        "text-sm font-medium tracking-wide transition-colors duration-300",
                        isActive ? "text-[#d4a857]" : "text-neutral-300 group-hover:text-[#d4a857]"
                      )}
                    >
                      {link.name}
                    </span>
                  </Link>
                );
              })}
            </div>

            {/* --- Mobile Hamburger --- */}
            <div className="md:hidden relative z-50">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-neutral-200 hover:text-[#d4a857] hover:bg-transparent transition-transform active:scale-95"
              >
                 {/* Custom Hamburger Icon */}
                <div className="flex flex-col gap-1.5 w-6">
                    <span 
                        className={cn("h-0.5 w-full bg-current rounded-full transition-all duration-300",
                        mobileMenuOpen ? "rotate-45 translate-y-2" : "")} 
                    />
                    <span 
                        className={cn("h-0.5 w-full bg-current rounded-full transition-all duration-300",
                        mobileMenuOpen ? "opacity-0" : "")} 
                    />
                    <span 
                        className={cn("h-0.5 w-full bg-current rounded-full transition-all duration-300",
                        mobileMenuOpen ? "-rotate-45 -translate-y-2" : "")} 
                    />
                </div>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* --- Mobile Drawer (Slide-In) --- */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm md:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed inset-y-0 right-0 z-50 w-[80%] max-w-sm bg-[#0f0e0c]/95 border-l border-[#2a2826] shadow-2xl md:hidden flex flex-col pt-28 px-6"
            >
              {/* Drawer Links */}
              <div className="flex flex-col space-y-4">
                {navLinks.map((link, idx) => {
                  const isActive = pathname === link.href;
                  return (
                    <motion.div
                        key={link.name}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                    >
                        <Link
                            href={link.href}
                            onClick={() => setMobileMenuOpen(false)}
                            className={cn(
                                "group flex items-center gap-4 p-4 rounded-xl border border-transparent transition-all duration-300",
                                isActive 
                                    ? "bg-[#d4a857]/10 border-[#d4a857]/20" 
                                    : "hover:bg-[#2a2826]"
                            )}
                        >
                            {getIcon(link.name, isActive)}
                            <span className={cn(
                                "text-lg font-bold tracking-wide",
                                isActive ? "text-[#d4a857]" : "text-neutral-200 group-hover:text-[#d4a857]"
                            )}>
                                {link.name}
                            </span>
                        </Link>
                    </motion.div>
                  );
                })}
              </div>

              {/* Bottom Decoration */}
              <div className="mt-auto mb-10 text-center">
                  <p className="text-neutral-500 text-xs tracking-widest uppercase mb-2">Kopi Ceban App</p>
                  <div className="h-1 w-12 bg-[#d4a857]/30 mx-auto rounded-full" />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
