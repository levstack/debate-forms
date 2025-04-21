"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Minus, Plus } from "lucide-react";

interface NumberInputProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  className?: string;
}

export function NumberInput({
  value,
  onChange,
  min = 0,
  max = 1,
  step = 0.1,
  disabled = false,
  className = "",
}: NumberInputProps) {
  const [inputValue, setInputValue] = useState(value.toString());

  const increment = () => {
    const newValue = Math.min(
      max,
      Number.parseFloat((value + step).toFixed(1))
    );
    onChange(newValue);
    setInputValue(newValue.toString());
  };

  const decrement = () => {
    const newValue = Math.max(
      min,
      Number.parseFloat((value - step).toFixed(1))
    );
    onChange(newValue);
    setInputValue(newValue.toString());
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);

    const parsed = Number.parseFloat(e.target.value);
    if (!isNaN(parsed)) {
      const clamped = Math.max(min, Math.min(max, parsed));
      onChange(clamped);
    }
  };

  const handleBlur = () => {
    const parsed = Number.parseFloat(inputValue);
    if (isNaN(parsed)) {
      setInputValue(value.toString());
    } else {
      const clamped = Math.max(min, Math.min(max, parsed));
      const rounded = Number.parseFloat(clamped.toFixed(1));
      setInputValue(rounded.toString());
      onChange(rounded);
    }
  };

  return (
    <div className={`flex h-9 items-center ${className}`}>
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="h-8 w-8 rounded-r-none"
        onClick={decrement}
        disabled={disabled || value <= min}
        aria-label="Decrease value"
      >
        <Minus className="h-3 w-3" />
      </Button>
      <Input
        type="number"
        value={inputValue}
        onChange={handleInputChange}
        onBlur={handleBlur}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        className="h-8 w-16 rounded-none text-center [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        aria-label="Number input"
      />
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="h-8 w-8 rounded-l-none"
        onClick={increment}
        disabled={disabled || value >= max}
        aria-label="Increase value"
      >
        <Plus className="h-3 w-3" />
      </Button>
    </div>
  );
}
