"use client";

import Link from "next/link";
import Image from "next/image";
import { Coffee, Instagram } from "lucide-react";

export function Footer() {
  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Menu", href: "/menu" },
    { name: "Pesan", href: "/pesan" },
    { name: "Tentang", href: "#" },
  ];

  return (
    <footer className="w-full bg-[#0f0e0c] border-t border-[#2a2826] py-10 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
          {/* Column 1: Logo & Description */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-3 group w-fit">
              <div className="relative h-10 w-10 sm:h-12 sm:w-12 rounded-full overflow-hidden shadow-md group-hover:shadow-primary/40 transition-all duration-300 border border-primary/20">
                 <Image 
                    src="/logo/logo.jpg" 
                    alt="Kopi Ceban Logo" 
                    fill 
                    className="object-cover object-center"
                 />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold font-serif text-foreground tracking-wide leading-none">
                  Kopi <span className="text-primary">Ceban</span>
                </span>
                <span className="text-[10px] text-primary/80 tracking-widest uppercase mt-0.5 font-medium">Since 2024</span>
              </div>
            </Link>
            <p className="text-neutral-300 text-sm leading-relaxed max-w-xs">
              Nikmati cita rasa kopi terbaik dengan harga bersahabat. Racikan premium dari biji pilihan.
            </p>
          </div>

          {/* Column 2: Navigation */}
          <div className="space-y-4">
            <h3 className="text-white font-bold text-lg font-serif">Navigasi</h3>
            <nav className="flex flex-col space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="text-neutral-300 hover:text-primary transition-colors duration-300 text-sm w-fit group relative"
                >
                  <span className="relative">
                    {link.name}
                    <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300" />
                  </span>
                </Link>
              ))}
            </nav>
          </div>

          {/* Column 3: Contact & Social */}
          <div className="space-y-4">
            <h3 className="text-white font-bold text-lg font-serif">Hubungi Kami</h3>
            <div className="space-y-3 text-sm">
              <p className="text-neutral-300">
                <span className="font-semibold text-white block mb-1">Alamat:</span>
                Panglima Polim, Bandar Lampung
              </p>
              <div>
                <span className="font-semibold text-white block mb-2">Social Media:</span>
                <a
                  href="https://instagram.com/kopiceban_"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-neutral-300 hover:text-primary transition-all duration-300 group"
                >
                  <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 group-hover:shadow-lg group-hover:shadow-primary/30 transition-all">
                    <Instagram className="w-5 h-5" />
                  </div>
                  <span className="group-hover:translate-x-0.5 transition-transform">@kopiceban_</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-10 pt-6 border-t border-[#2a2826] text-center">
          <p className="text-neutral-400 text-sm">
            © 2025 Kopi Ceban. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
