"use client";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";

export function ThemeToggleButton() {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <Button
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      variant="outline"
      size="icon"
      aria-label="color theme switch"
      className="h-9 w-9 border-slate-200 transition-all duration-200 hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
    >
      <Sun className="h-[1.1rem] w-[1.1rem] scale-100 rotate-0 text-slate-600 transition-all dark:scale-0 dark:-rotate-90 dark:text-slate-300" />
      <Moon className="absolute h-[1.1rem] w-[1.1rem] scale-0 rotate-90 text-slate-600 transition-all dark:scale-100 dark:rotate-0 dark:text-slate-300" />
    </Button>
  );
}
