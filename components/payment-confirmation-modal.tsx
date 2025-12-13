"use client";

import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { Button } from "@/components/ui/button";
import { AlertCircle, X } from "lucide-react";

interface PaymentConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function PaymentConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
}: PaymentConfirmationModalProps) {
  const [mounted, setMounted] = useState(false);
  const [show, setShow] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setShow(true);
      // Prevent scrolling when modal is open
      document.body.style.overflow = "hidden";
    } else {
      const timer = setTimeout(() => setShow(false), 300); // Wait for animation
      document.body.style.overflow = "unset";
      return () => clearTimeout(timer);
    }
    return () => { document.body.style.overflow = "unset"; };
  }, [isOpen]);

  if (!mounted) return null;

  // We keep the component mounted for a bit to allow exit animation
  if (!show && !isOpen) return null;

  return ReactDOM.createPortal(
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${
        isOpen ? "opacity-100 backdrop-blur-lg" : "opacity-0 backdrop-blur-none pointer-events-none"
      }`}
    >
      {/* Dimmed Background */}
      <div 
        className="absolute inset-0 bg-[#13110f]/80 transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div
        className={`relative w-full max-w-md bg-[#13110f]/90 border border-[#d4a857]/20 rounded-xl shadow-2xl shadow-black/50 p-6 sm:p-8 transform transition-all duration-300 ${
          isOpen ? "scale-100 translate-y-0 opacity-100" : "scale-[1.05] translate-y-4 opacity-0"
        }`}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-neutral-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center text-center space-y-4">
          <div className="w-16 h-16 bg-[#d4a857]/10 rounded-full flex items-center justify-center ring-1 ring-[#d4a857]/30 mb-2">
            <AlertCircle className="w-8 h-8 text-[#d4a857]" />
          </div>

          <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#d4a857]">
            Apakah Anda yakin sudah melakukan pembayaran?
          </h3>

          <p className="text-neutral-300 text-sm sm:text-base leading-relaxed">
            Pastikan Anda telah menyelesaikan pembayaran melalui QRIS. Jika belum, jangan tinggalkan halaman ini.
          </p>

          <div className="grid grid-cols-2 gap-3 w-full mt-6">
            <Button
              variant="outline"
              onClick={onClose}
              className="w-full h-11 bg-transparent border-neutral-700 text-neutral-300 hover:bg-neutral-800 hover:text-white"
            >
              Belum, Kembali
            </Button>
            <Button
              onClick={onConfirm}
              className="w-full h-11 bg-[#d4a857] text-[#13110f] hover:bg-[#c2964b] font-bold"
            >
              Sudah Bayar
            </Button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
