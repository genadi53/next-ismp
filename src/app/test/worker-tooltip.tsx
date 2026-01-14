"use client";

import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { User } from "lucide-react";
import { useState } from "react";

interface Worker {
  id: string;
  name: string;
  crew: string;
  role: string;
  photo?: string;
  oreTonnes: number;
  materialMoved: number;
  tkph: number;
  drillingRate: number | null;
  idleTimePercent: number;
  shiftUtilPercent: number;
  queueTime: number;
  status: "active" | "break" | "offline";
  sparklineData: number[];
}

export function WorkerTooltip({
  worker,
  children,
}: {
  worker: Worker;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <span
          onMouseEnter={() => setOpen(true)}
          onMouseLeave={() => setOpen(false)}
        >
          {children}
        </span>
      </PopoverTrigger>
      <PopoverContent
        className="w-64"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
      >
        <div className="flex gap-3">
          <div className="bg-muted flex h-12 w-12 items-center justify-center rounded-full">
            <User className="text-muted-foreground h-6 w-6" />
          </div>
          <div className="flex-1 space-y-1">
            <h4 className="text-sm font-semibold">{worker.name}</h4>
            <p className="text-muted-foreground text-xs">{worker.role}</p>
            <div className="flex gap-4 text-xs">
              <div>
                <span className="text-muted-foreground">TKPH: </span>
                <span className="font-medium">{worker.tkph}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Използ.: </span>
                <span className="font-medium">{worker.shiftUtilPercent}%</span>
              </div>
            </div>
            <Badge
              variant={worker.status === "active" ? "default" : "secondary"}
              className="h-5 text-[10px]"
            >
              {worker.status === "active"
                ? "Активен"
                : worker.status === "break"
                  ? "Почивка"
                  : "Офлайн"}
            </Badge>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
