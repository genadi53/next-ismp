"use client";

import Image from "next/image";
import Link from "next/link";
import { ThemeToggleButton } from "./ThemeToggle";
import ProfileDropdown from "./user/ProfileDropdown";
import SupportEmailButton from "./user/SupportEmailButton";
import { Menu } from "lucide-react";
import { Button } from "./ui/button";
import { useTheme } from "next-themes";

interface HeaderProps {
  onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const { theme } = useTheme();
  const logoUrl = theme === "dark" ? "/logo-black.png" : "/logo.png";

  return (
    <header className="sticky top-0 z-50 flex h-16 w-full flex-row items-center justify-between border-b border-slate-200/60 bg-white/80 px-6 shadow-sm backdrop-blur-md dark:border-slate-700/60 dark:bg-slate-900/80">
      <div className="flex h-10 flex-row items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={onMenuClick}
          aria-label="Toggle menu"
        >
          <Menu className="h-6 w-6" />
        </Button>
        <Link
          className="relative h-full w-60 cursor-pointer transition-transform hover:scale-105"
          href="/"
        >
          <Image
            src={logoUrl}
            sizes="(max-width: 768px) 100vw, 100vw"
            alt="Ellatzite-Med logo"
            className="object-contain"
            fill
            priority
          />
        </Link>
        {/* <div className="hidden sm:block">
          <h1 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
            ИСМП Портал
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Информационна система за минно планиране
          </p>
        </div> */}
      </div>

      <div className="flex items-center gap-3">
        <SupportEmailButton />
        <ProfileDropdown />
        <ThemeToggleButton />
      </div>
    </header>
  );
}
