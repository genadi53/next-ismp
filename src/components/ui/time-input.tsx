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

/**
 * Parses a time value that could be a date string, Date object, or HH:mm format string
 * Returns HH:mm format or empty string
 *
 * IMPORTANT: This function extracts time without timezone conversion to avoid
 * UTC vs local time issues (e.g., 11:00 UTC becoming 13:00 in UTC+2)
 */
const parseTimeValue = (value: string | Date | null | undefined): string => {
  if (!value) return "";

  // If it's a Date object, extract hours and minutes directly (local time)
  if (value instanceof Date) {
    if (isNaN(value.getTime())) return "";
    const hours = value.getHours();
    const minutes = value.getMinutes();
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
  }

  // Ensure we're working with a string from this point
  if (typeof value !== "string") {
    // Try to convert to string if possible
    try {
      value = String(value);
    } catch {
      return "";
    }
  }

  // If it's already in HH:mm or HH:mm:ss format, validate and return it
  const hhmmPattern = /^\d{1,2}:\d{1,2}(:\d{1,2})?$/;
  if (hhmmPattern.test(value)) {
    const parts = value.split(":");
    if (parts.length >= 2) {
      const hours = Number(parts[0]);
      const minutes = Number(parts[1]);
      if (
        !isNaN(hours) &&
        !isNaN(minutes) &&
        hours >= 0 &&
        hours <= 23 &&
        minutes >= 0 &&
        minutes <= 59
      ) {
        return `${hours.toString().padStart(2, "0")}:${minutes
          .toString()
          .padStart(2, "0")}`;
      }
    }
  }

  // Try to extract time from ISO date string WITHOUT timezone conversion
  // This handles formats like "2024-01-08T11:00:00Z" or "2024-01-08T11:00:00.000Z"
  // We extract the time portion directly from the string, not via Date object
  const isoTimeMatch = /T(\d{2}):(\d{2})/.exec(value);
  if (isoTimeMatch) {
    const hours = Number(isoTimeMatch[1]);
    const minutes = Number(isoTimeMatch[2]);
    if (
      !isNaN(hours) &&
      !isNaN(minutes) &&
      hours >= 0 &&
      hours <= 23 &&
      minutes >= 0 &&
      minutes <= 59
    ) {
      return `${hours.toString().padStart(2, "0")}:${minutes
        .toString()
        .padStart(2, "0")}`;
    }
  }

  // Try to extract time from SQL Server datetime format "YYYY-MM-DD HH:mm:ss"
  const sqlTimeMatch = /\d{4}-\d{2}-\d{2}\s+(\d{2}):(\d{2})/.exec(value);
  if (sqlTimeMatch) {
    const hours = Number(sqlTimeMatch[1]);
    const minutes = Number(sqlTimeMatch[2]);
    if (
      !isNaN(hours) &&
      !isNaN(minutes) &&
      hours >= 0 &&
      hours <= 23 &&
      minutes >= 0 &&
      minutes <= 59
    ) {
      return `${hours.toString().padStart(2, "0")}:${minutes
        .toString()
        .padStart(2, "0")}`;
    }
  }

  return "";
};

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
    const [displayValue, setDisplayValue] = useState(() =>
      parseTimeValue(value),
    );
    const inputRef = useRef<HTMLInputElement>(null);
    // Use a ref to track the current value for keydown handler to avoid stale closures
    const displayValueRef = useRef(displayValue);

    useEffect(() => {
      const parsed = parseTimeValue(value);
      setDisplayValue(parsed);
      displayValueRef.current = parsed;
    }, [value]);

    // Keep ref in sync with state
    useEffect(() => {
      displayValueRef.current = displayValue;
    }, [displayValue]);

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

      const parts = time.split(":");
      if (parts.length !== 2) return false;

      const hours = Number(parts[0]);
      const minutes = Number(parts[1]);

      if (isNaN(hours) || isNaN(minutes)) return false;
      if (hours < 0 || hours > 23) return false;
      if (minutes < 0 || minutes > 59) return false;

      return true;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const input = e.target.value;
      const formatted = formatTime(input);

      setDisplayValue(formatted);
      displayValueRef.current = formatted;

      if (validateTime(formatted) && onChange) {
        onChange(formatted);
      }
    };

    const handleBlur = () => {
      if (!validateTime(displayValue)) {
        const reverted = parseTimeValue(value);
        setDisplayValue(reverted); // Revert to original value if invalid
        displayValueRef.current = reverted;
        return;
      }

      // Handle various incomplete formats and auto-complete them
      if (displayValue && displayValue !== "") {
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
          const parts = displayValue.split(":");
          const hours = parts[0] ?? "00";
          const minutes = parts[1] ?? "00";
          const paddedHours = hours.padStart(2, "0");
          const paddedMinutes = minutes.padStart(2, "0");
          formatted = `${paddedHours}:${paddedMinutes}`;
        }

        setDisplayValue(formatted);
        displayValueRef.current = formatted;
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
        return;
      }

      // Use ref to get the current value (avoids stale closure issues)
      const currentValue = displayValueRef.current;

      // Auto-insert colon after 2 digits - only if we have exactly 2 digits (no colon yet)
      if (currentValue.length === 2 && !currentValue.includes(":")) {
        e.preventDefault();
        const newValue = `${currentValue}:${e.key}`;
        setDisplayValue(newValue);
        displayValueRef.current = newValue;
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
