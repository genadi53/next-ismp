"use client";
import * as React from "react";
import { Check, ChevronsUpDown, SearchIcon } from "lucide-react";

import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Card, CardHeader, CardContent } from "./card";
import { Input } from "./input";
import { ScrollArea } from "./scroll-area";

type ComboboxData = {
  label: string;
  value: string;
  [key: string]: string | number;
};

type ComboboxProps = {
  placeholderString?: string;
  list: ComboboxData[];
  value?: string;
  onValueChange?: (value: string) => void;
  triggerStyles?: string;
  disabled?: boolean;
};

export function Combobox({
  list,
  placeholderString = "Изберете...",
  value,
  onValueChange,
  triggerStyles,
  disabled = false,
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [searchValue, setSearchValue] = React.useState("");

  // Filter data based on search value
  const filteredData = React.useMemo(() => {
    if (!searchValue) return list;
    return list.filter((item) =>
      item.label.toLowerCase().includes(searchValue.toLowerCase()),
    );
  }, [list, searchValue]);

  // Get the label for the current value
  const selectedLabel = React.useMemo(() => {
    if (!value) return null;
    return list.find((item) => item.value === value)?.label;
  }, [list, value]);

  // Reset search when popover closes
  React.useEffect(() => {
    if (!open) {
      setSearchValue("");
    }
  }, [open]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn("w-full justify-between", triggerStyles)}
        >
          {selectedLabel ? (
            <span className="truncate">{selectedLabel}</span>
          ) : (
            <span className="text-muted-foreground">{placeholderString}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full max-w-lg p-0" align="start">
        <Card className="w-full gap-2 border-none p-0 shadow-none">
          <CardHeader className="border-b px-2 pt-2 pb-0 [.border-b]:pb-2">
            <div
              data-slot="command-input-wrapper"
              className="flex h-9 items-center gap-2 px-1"
            >
              <SearchIcon className="size-4 shrink-0 opacity-50" />
              <Input
                className="placeholder:text-muted-foreground flex h-10 w-full rounded-md border-none bg-transparent py-3 text-sm outline-hidden focus-visible:ring-0 disabled:cursor-not-allowed disabled:opacity-50"
                value={searchValue}
                placeholder="Търсене..."
                onChange={(e) => {
                  setSearchValue(e.target.value);
                }}
              />
            </div>
          </CardHeader>
          <CardContent className="w-full px-2 pb-2">
            <ScrollArea className="max-h-[300px] scroll-py-1 overflow-x-hidden overflow-y-auto">
              {filteredData.length === 0 ? (
                <div className="text-muted-foreground py-6 text-center text-sm">
                  Няма резултати.
                </div>
              ) : (
                <div className="flex flex-col gap-1">
                  {filteredData.map((item) => (
                    <div
                      className={cn(
                        "hover:bg-accent hover:text-accent-foreground relative flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none",
                        value === item.value &&
                          "bg-accent text-accent-foreground",
                      )}
                      key={item.value}
                      onClick={() => {
                        const newValue = item.value === value ? "" : item.value;
                        onValueChange?.(newValue);
                        setOpen(false);
                      }}
                    >
                      <span className="flex-1 truncate">{item.label}</span>
                      <Check
                        className={cn(
                          "h-4 w-4 shrink-0",
                          value === item.value ? "opacity-100" : "opacity-0",
                        )}
                      />
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  );
}
