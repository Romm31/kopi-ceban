"use client";

import { Menu } from "@prisma/client";
import { useState, useMemo, useEffect } from "react";
import { MenuCard } from "@/components/menu-card";
import { SearchBar } from "@/components/search-bar";
import { FilterChips, FilterOption } from "@/components/filter-chips";
import { Coffee, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

interface PesanClientProps {
  initialMenuItems: Menu[];
}

// Helper to determine dummy category based on menu name
function getCategory(menuName: string): string {
  const nameLower = menuName.toLowerCase();
  if (nameLower.includes("susu") || nameLower.includes("latte") || nameLower.includes("milk")) {
    return "kopi-susu";
  } else if (nameLower.includes("teh") || nameLower.includes("tea") || nameLower.includes("juice")) {
    return "non-kopi";
  }
  return "signature";
}

export function PesanClient({ initialMenuItems }: PesanClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState<FilterOption[]>([]);
  const [isVisible, setIsVisible] = useState<Record<number, boolean>>({});

  // Intersection Observer for scroll reveal
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const id = entry.target.getAttribute("data-menu-id");
          if (id && entry.isIntersecting) {
            setIsVisible((prev) => ({ ...prev, [parseInt(id)]: true }));
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll("[data-menu-id]").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [initialMenuItems]);

  const handleFilterToggle = (filter: FilterOption) => {
    setActiveFilters((prev) => {
      const exists = prev.some((f) => f.id === filter.id);
      if (exists) {
        return prev.filter((f) => f.id !== filter.id);
      }
      // Remove other filters of same type (e.g., only one price filter active)
      const filtered = prev.filter((f) => f.type !== filter.type);
      return [...filtered, filter];
    });
  };

  const handleClearFilters = () => setActiveFilters([]);

  // Filter and search logic
  const filteredMenuItems = useMemo(() => {
    let result = [...initialMenuItems];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (item) =>
          item.name.toLowerCase().includes(query) ||
          item.description?.toLowerCase().includes(query) ||
          getCategory(item.name).includes(query)
      );
    }

    // Apply filters
    activeFilters.forEach((filter) => {
      switch (filter.type) {
        case "price":
          if (filter.value === "low") {
            result.sort((a, b) => a.price - b.price);
          } else if (filter.value === "high") {
            result.sort((a, b) => b.price - a.price);
          } else if (filter.value === "under-10k") {
            result = result.filter((item) => item.price < 10000);
          } else if (filter.value === "10k-20k") {
            result = result.filter((item) => item.price >= 10000 && item.price <= 20000);
          } else if (filter.value === "over-20k") {
            result = result.filter((item) => item.price > 20000);
          }
          break;
        case "name":
          if (filter.value === "asc") {
            result.sort((a, b) => a.name.localeCompare(b.name));
          } else if (filter.value === "desc") {
            result.sort((a, b) => b.name.localeCompare(a.name));
          }
          break;
        case "availability":
          if (filter.value === "available") {
            result = result.filter((item) => item.isAvailable);
          } else if (filter.value === "sold-out") {
            result = result.filter((item) => !item.isAvailable);
          }
          break;
        case "category":
          result = result.filter((item) => getCategory(item.name) === filter.value);
          break;
      }
    });

    return result;
  }, [initialMenuItems, searchQuery, activeFilters]);

  // Recommendations: Top 3 available items (deterministic to avoid hydration mismatch)
  const recommendations = useMemo(() => {
    const available = initialMenuItems.filter((item) => item.isAvailable);
    // Use deterministic sorting by id to avoid hydration mismatch
    return available.sort((a, b) => a.id - b.id).slice(0, 3);
  }, [initialMenuItems]);

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <SearchBar value={searchQuery} onChange={setSearchQuery} />
        </motion.div>

        {/* Filter Chips */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <FilterChips
            activeFilters={activeFilters}
            onFilterToggle={handleFilterToggle}
            onClearAll={handleClearFilters}
          />
        </motion.div>

        {/* Recommendations Section */}
        {recommendations.length > 0 && !searchQuery && activeFilters.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-gradient-to-br from-primary/5 to-transparent rounded-2xl p-4 sm:p-6 border border-primary/10"
          >
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
              <Sparkles className="w-5 h-5 text-primary" />
              <h2 className="text-lg sm:text-xl font-bold text-foreground">Rekomendasi untuk Kamu</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {recommendations.map((item, idx) => (
                <MenuCard key={item.id} menu={item} index={idx} />
              ))}
            </div>
          </motion.div>
        )}

        {/* Main Menu Grid */}
        <div className="space-y-3 sm:space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground">
              Semua Menu {filteredMenuItems.length > 0 && `(${filteredMenuItems.length})`}
            </h2>
          </div>

          {filteredMenuItems.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-16 sm:py-20 bg-card rounded-xl border border-dashed border-border shadow-lg"
            >
              <Coffee className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 text-muted-foreground/20" />
              <p className="text-muted-foreground text-base sm:text-lg font-semibold">Tidak ada menu yang cocok</p>
              <p className="text-muted-foreground/60 text-sm mt-2">
                Coba ubah pencarian atau filter Anda.
              </p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
              {filteredMenuItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  data-menu-id={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={isVisible[item.id] ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                >
                  <MenuCard menu={item} index={index} />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
