"use client";
import React, { useState, useRef, useEffect } from "react";
import { Input } from "./input";
import { cn } from "@/lib/cn";
import { Clock } from "lucide-react";

interface TimeInputProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  name?: string;
  id?: string;
}

export const TimeInput = React.forwardRef<HTMLInputElement, TimeInputProps>(
  (
    {
      value = "",
      onChange,
      placeholder = "00:00",
      className,
      disabled,
      name,
      id,
    },
    _ref,
  ) => {
    const [displayValue, setDisplayValue] = useState(value);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
      setDisplayValue(value);
    }, [value]);

    const formatTime = (input: string): string => {
      // Remove all non-numeric characters
      const numbers = input.replace(/\D/g, "");

      if (numbers.length === 0) return "";
      if (numbers.length === 1) return numbers;
      if (numbers.length === 2) return numbers;
      if (numbers.length === 3)
        return `${numbers.slice(0, 2)}:${numbers.slice(2)}`;
      if (numbers.length >= 4)
        return `${numbers.slice(0, 2)}:${numbers.slice(2, 4)}`;

      return numbers;
    };

    const validateTime = (time: string): boolean => {
      if (!time || time === "") return true;

      console.log(time);

      const [_hours, _minutes] = time.split(":").map(Number);

      // if (isNaN(hours) || isNaN(minutes)) return false;
      // if (hours < 0 || hours > 23) return false;
      // if (minutes < 0 || minutes > 59) return false;

      return true;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const input = e.target.value;
      const formatted = formatTime(input);

      setDisplayValue(formatted);

      if (validateTime(formatted) && onChange) {
        onChange(formatted);
      }
    };

    const handleBlur = () => {
      if (!validateTime(displayValue)) {
        setDisplayValue(value); // Revert to original value if invalid
        return;
      }

      // Handle various incomplete formats and auto-complete them
      if (displayValue && displayValue.trim() !== "") {
        let formatted = displayValue;

        // If no colon, treat as hours and add ":00"
        if (!displayValue.includes(":")) {
          const hours = displayValue.padStart(2, "0");
          formatted = `${hours}:00`;
        }
        // If has colon but no minutes after it
        else if (displayValue.endsWith(":")) {
          const hours = displayValue.slice(0, -1).padStart(2, "0");
          formatted = `${hours}:00`;
        }
        // If has colon but incomplete minutes
        else {
          const [hours, minutes] = displayValue.split(":");
          const paddedHours = hours?.padStart(2, "0");
          const paddedMinutes = minutes ? minutes.padEnd(2, "0") : "00";
          formatted = `${paddedHours}:${paddedMinutes}`;
        }

        setDisplayValue(formatted);
        if (onChange) {
          onChange(formatted);
        }
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      // Allow: backspace, delete, tab, escape, enter, and navigation keys
      if ([8, 9, 27, 13, 46, 37, 38, 39, 40].includes(e.keyCode)) {
        return;
      }

      // Allow numbers only
      if (!/[0-9]/.test(e.key)) {
        e.preventDefault();
      }

      // Auto-insert colon after 2 digits
      if (displayValue.length === 2 && /[0-9]/.test(e.key)) {
        e.preventDefault();
        const newValue = `${displayValue}:${e.key}`;
        setDisplayValue(newValue);
        if (onChange) {
          onChange(newValue);
        }
      }
    };

    return (
      <div className="relative">
        <Input
          ref={inputRef}
          type="text"
          value={displayValue}
          onChange={handleChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={cn(
            "pr-10 text-left font-mono tracking-wider",
            "focus:border-blue-500 focus:ring-2 focus:ring-blue-500",
            "transition-colors duration-200 hover:border-gray-400",
            className,
          )}
          disabled={disabled}
          name={name}
          id={id}
          maxLength={5}
          autoComplete="off"
        />
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
          <Clock className="h-4 w-4 text-gray-400" />
        </div>
      </div>
    );
  },
);

TimeInput.displayName = "TimeInput";
