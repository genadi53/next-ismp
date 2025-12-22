"use client";
import SITE_CONFIG, { type NavigationItem } from "../../config/site.config";
import SidebarCollapsible from "./SidebarCollapsible";
import { ChevronDown, X } from "lucide-react";
import { Button } from "../ui/button";
import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import { usePathname } from "next/navigation";
import Link from "next/link";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  const [openSections, setOpenSections] = useState<{ [key: string]: boolean }>(
    {},
  );

  // Open the correct section on mount
  useEffect(() => {
    for (const [section, items] of Object.entries(SITE_CONFIG)) {
      const onCurrentPage = items.some((item) =>
        (item as NavigationItem).path.includes(pathname),
      );
      if (onCurrentPage) {
        setOpenSections((prev) => ({
          ...Object.keys(prev).reduce(
            (acc, key) => ({ ...acc, [key]: false }),
            {},
          ),
          [section]: true,
        }));
        break;
      }
    }
  }, [pathname]);

  // Close sidebar on route change (mobile only)
  useEffect(() => {
    onClose();
  }, [pathname, onClose]);

  return (
    <>
      {/* Backdrop overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <nav
        className={cn(
          "scrollbar-thin fixed top-16 left-0 z-50 h-[calc(100vh-4rem)] w-[240px] shrink-0 flex-col overflow-y-auto border-r border-slate-200/60 bg-white/95 px-3 shadow-lg backdrop-blur-sm transition-transform duration-300 ease-in-out dark:border-slate-700/60 dark:bg-slate-900/95",
          // Mobile: slide in from left
          "md:flex md:translate-x-0",
          // Desktop: always visible
          isOpen
            ? "flex translate-x-0"
            : "hidden -translate-x-full md:flex md:translate-x-0",
        )}
      >
        {/* Close button for mobile */}
        <div className="flex justify-end pt-4 md:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex w-full flex-col gap-1 pb-6 md:py-6">
          {Object.entries(SITE_CONFIG).map(([section, items]) => {
            return (
              <div key={section} className="w-full">
                {items.length > 1 ? (
                  <SidebarCollapsible
                    navItems={items as unknown as NavigationItem[]}
                    open={!!openSections[section]}
                    onOpenChange={() =>
                      setOpenSections((prev) => ({
                        ...Object.keys(prev).reduce(
                          (acc, key) => ({ ...acc, [key]: false }),
                          {},
                        ),
                        [section]: !prev[section],
                      }))
                    }
                  >
                    <Button
                      variant="ghost"
                      className="group flex h-auto w-full items-center justify-between rounded-lg p-3 text-slate-600 transition-all duration-200 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
                    >
                      <span className="text-left text-sm font-semibold">
                        {section}
                      </span>
                      <ChevronDown
                        className={cn(
                          "ml-auto h-4 w-4 text-slate-400 transition-all duration-300 group-hover:text-slate-600 dark:group-hover:text-slate-200",
                          !!openSections[section] && "rotate-180",
                        )}
                      />
                    </Button>
                  </SidebarCollapsible>
                ) : (
                  <Button
                    variant="ghost"
                    key={items[0].title}
                    className="flex h-auto w-full items-center justify-start rounded-lg p-3 text-slate-600 transition-all duration-200 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
                    asChild
                  >
                    <Link href={items[0].path}>
                      <span className="text-left text-sm font-semibold">
                        {items[0].title}
                      </span>
                    </Link>
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      </nav>
    </>
  );
}
