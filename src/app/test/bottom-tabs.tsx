"use client";

import { cn } from "@/lib/cn";
import { Activity, Truck, User, Users } from "lucide-react";
import { useDashboard } from "./store";

type SheetId = 1 | 2 | 3 | 4;

// =============================================================================
// EXCEL-STYLE FOOTER TABS
// =============================================================================

export function SheetTabs() {
  const {
    miningDashboard: { ui },
  } = useDashboard();

  const { activeSheetId, setActiveSheetId } = ui;
  const tabs = [
    { id: 1 as SheetId, label: "Обзор смяна", icon: Activity },
    { id: 2 as SheetId, label: "Флот и оборудване", icon: Truck },
    { id: 3 as SheetId, label: "Работници и производство", icon: Users },
    { id: 4 as SheetId, label: "Детайлен изглед", icon: User },
  ];

  return (
    <div className="bg-muted fixed right-0 bottom-0 left-0 z-50 border-t">
      <div className="flex h-10 items-end">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSheetId === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveSheetId(tab.id)}
              className={cn(
                "relative flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all",
                "border-border/50 border-r",
                isActive
                  ? "bg-background text-foreground border-t-primary -mb-px rounded-t-md border-t-2 shadow-sm"
                  : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground",
              )}
            >
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{tab.label}</span>
              {isActive && (
                <div className="border-t-primary absolute -top-0.5 left-1/2 h-0 w-0 -translate-x-1/2 border-t-4 border-r-4 border-l-4 border-r-transparent border-l-transparent" />
              )}
            </button>
          );
        })}
        <div className="flex-1" />
      </div>
    </div>
  );
}
