"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function SearchBar({ value, onChange, placeholder = "Cari menu kopi...", className }: SearchBarProps) {
  return (
    <div className={cn("relative w-full max-w-2xl mx-auto", className)}>
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
        <Search className="w-5 h-5" />
      </div>
      <Input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-14 pl-12 pr-6 text-base bg-card/80 backdrop-blur-sm border-2 border-border/50 rounded-xl focus-visible:ring-2 focus-visible:ring-[#d4a857] focus-visible:border-[#d4a857] transition-all duration-300 placeholder:text-muted-foreground/60 shadow-lg shadow-black/5 hover:shadow-xl hover:shadow-[#d4a857]/10"
      />
    </div>
  );
}
