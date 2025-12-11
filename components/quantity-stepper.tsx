"use client";

import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface QuantityStepperProps {
  value: number;
  onIncrease: () => void;
  onDecrease: () => void;
  className?: string;
  min?: number;
  max?: number;
}

export function QuantityStepper({
  value,
  onIncrease,
  onDecrease,
  className,
  min = 0,
  max = 99,
}: QuantityStepperProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8 rounded-full border-primary/50 text-primary hover:bg-primary/10 hover:text-primary"
        onClick={onDecrease}
        disabled={value <= min}
      >
        <Minus className="h-3 w-3" />
      </Button>
      <span className="w-6 text-center text-sm font-medium tabular-nums text-foreground">
        {value}
      </span>
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8 rounded-full border-primary/50 text-primary hover:bg-primary/10 hover:text-primary"
        onClick={onIncrease}
        disabled={value >= max}
      >
        <Plus className="h-3 w-3" />
      </Button>
    </div>
  );
}
