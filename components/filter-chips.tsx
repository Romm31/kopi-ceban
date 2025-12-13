"use client";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

export type FilterType = "price" | "name" | "availability" | "category";

export interface FilterOption {
  id: string;
  label: string;
  type: FilterType;
  value: string;
}

interface FilterChipsProps {
  activeFilters: FilterOption[];
  onFilterToggle: (filter: FilterOption) => void;
  onClearAll: () => void;
}

const allFilters: FilterOption[] = [
  // Price filters
  { id: "price-low", label: "Termurah", type: "price", value: "low" },
  { id: "price-high", label: "Termahal", type: "price", value: "high" },
  { id: "price-under-10k", label: "< 10.000", type: "price", value: "under-10k" },
  { id: "price-10k-20k", label: "10.000 - 20.000", type: "price", value: "10k-20k" },
  { id: "price-over-20k", label: "> 20.000", type: "price", value: "over-20k" },
  
  // Name filters
  { id: "name-asc", label: "A → Z", type: "name", value: "asc" },
  { id: "name-desc", label: "Z → A", type: "name", value: "desc" },
  
  // Availability filters
  { id: "available-only", label: "Tersedia", type: "availability", value: "available" },
  { id: "sold-out", label: "Habis", type: "availability", value: "sold-out" },
  
  // Category filters (dummy)
  { id: "cat-kopi-susu", label: "Kopi Susu", type: "category", value: "kopi-susu" },
  { id: "cat-non-kopi", label: "Non-Kopi", type: "category", value: "non-kopi" },
  { id: "cat-signature", label: "Signature", type: "category", value: "signature" },
];

export function FilterChips({ activeFilters, onFilterToggle, onClearAll }: FilterChipsProps) {
  const isActive = (filter: FilterOption) => 
    activeFilters.some(f => f.id === filter.id);

  return (
    <div className="w-full space-y-3">
      {/* Scrollable Filter Container */}
      <div className="overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-muted-foreground/30 scrollbar-track-transparent">
        <div className="flex gap-2 min-w-max px-1">
          {allFilters.map((filter) => {
            const active = isActive(filter);
            return (
              <Badge
                key={filter.id}
                onClick={() => onFilterToggle(filter)}
                className={cn(
                  "px-4 py-2.5 text-sm font-semibold rounded-full cursor-pointer transition-all duration-300 border-2 hover:scale-105 active:scale-95 whitespace-nowrap",
                  active
                    ? "bg-[#d4a857] text-[#0f0e0c] border-[#d4a857] shadow-lg shadow-[#d4a857]/30 hover:bg-[#d4a857]/90"
                    : "bg-card/80 text-muted-foreground border-border/50 hover:border-[#d4a857]/50 hover:text-foreground hover:shadow-md"
                )}
              >
                {filter.label}
              </Badge>
            );
          })}
        </div>
      </div>

      {/* Clear All Button */}
      {activeFilters.length > 0 && (
        <div className="flex justify-center">
          <button
            onClick={onClearAll}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-muted-foreground hover:text-destructive transition-colors rounded-lg hover:bg-destructive/10 border border-transparent hover:border-destructive/20"
          >
            <X className="w-4 h-4" />
            Hapus Semua Filter ({activeFilters.length})
          </button>
        </div>
      )}
    </div>
  );
}

export { allFilters };
