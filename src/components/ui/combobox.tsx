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
} & Record<string, string | number>;

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
  const [focusedIndex, setFocusedIndex] = React.useState(-1);
  const itemRefs = React.useRef<(HTMLDivElement | null)[]>([]);

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
    const foundItem = list.find((item) => item.value === value);
    // If value exists but not in list yet, show the value itself
    return foundItem?.label ?? value;
  }, [list, value]);

  // Reset search and focused index when popover closes
  React.useEffect(() => {
    if (!open) {
      setSearchValue("");
      setFocusedIndex(-1);
    }
  }, [open]);

  // Set focused index when popover opens or filtered data changes
  React.useEffect(() => {
    if (open && filteredData.length > 0) {
      const selectedIndex = filteredData.findIndex(
        (item) => item.value === value,
      );
      setFocusedIndex(selectedIndex >= 0 ? selectedIndex : 0);
    }
  }, [open, filteredData, value]);

  // Scroll focused item into view
  React.useEffect(() => {
    if (focusedIndex >= 0 && itemRefs.current[focusedIndex]) {
      itemRefs.current[focusedIndex]?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [focusedIndex]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open || filteredData.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setFocusedIndex((prev) =>
          prev < filteredData.length - 1 ? prev + 1 : prev,
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setFocusedIndex((prev) => (prev > 0 ? prev - 1 : prev));
        break;
      case "Enter":
        e.preventDefault();
        if (focusedIndex >= 0 && focusedIndex < filteredData.length) {
          const item = filteredData[focusedIndex];
          const newValue = item?.value === value ? "" : item?.value;
          onValueChange?.(newValue ?? "");
          setOpen(false);
        }
        break;
      case "Escape":
        e.preventDefault();
        setOpen(false);
        break;
    }
  };

  const handleItemSelect = (itemValue: string) => {
    const newValue = itemValue === value ? "" : itemValue;
    onValueChange?.(newValue);
    setOpen(false);
  };

  return (
    <div className="w-full">
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
        <PopoverContent
          className="w-full max-w-lg min-w-[200px] p-0 lg:min-w-[375px]"
          align="start"
        >
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
                  onKeyDown={handleKeyDown}
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
                  <div
                    className="flex flex-col gap-1"
                    onKeyDown={handleKeyDown}
                    tabIndex={-1}
                  >
                    {filteredData.map((item, index) => (
                      <div
                        ref={(el) => {
                          itemRefs.current[index] = el;
                        }}
                        className={cn(
                          "hover:bg-accent hover:text-accent-foreground relative flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none",
                          value === item.value &&
                            "bg-accent text-accent-foreground",
                          focusedIndex === index &&
                            "bg-accent text-accent-foreground",
                        )}
                        key={item.value}
                        onClick={() => handleItemSelect(item.value)}
                        onMouseEnter={() => setFocusedIndex(index)}
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
    </div>
  );
}
