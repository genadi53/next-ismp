"use client";
import { type Column } from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ChevronsUpDown, EyeOff } from "lucide-react";

import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface DataTableColumnHeaderProps<
  TData,
  TValue,
> extends React.HTMLAttributes<HTMLDivElement> {
  column: Column<TData, TValue>;
  title: string;
  longTitle?: string[];
  splitString?: string;
  haveColumnFilter?: boolean;
}

export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  longTitle,
  className,
  // @ts-expect-error: Unsued variable
  splitString = " ",
  haveColumnFilter = true,
}: DataTableColumnHeaderProps<TData, TValue>) {
  if (!column.getCanSort()) {
    return (
      <div className={cn(className)}>
        <span
          className={cn(
            "flex flex-col items-center justify-center",
            longTitle && "-mt-1.5",
          )}
        >
          {/* longTitle && title
                  .split(splitString)
                  .filter((word) => !!word)
                  .map((word, idx) => <span key={word + idx}>{word}</span>)} */}

          {longTitle &&
            longTitle.map((word, idx) => <span key={word + idx}>{word}</span>)}
          {!longTitle && title}
        </span>
      </div>
    );
  }

  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="data-[state=open]:bg-accent -ml-3 h-8"
          >
            <span
              className={cn(
                "flex flex-col items-center justify-center",
                longTitle && "-mt-1.5",
              )}
            >
              {/* longTitle && title
                  .split(splitString)
                  .filter((word) => !!word)
                  .map((word, idx) => <span key={word + idx}>{word}</span>)} */}

              {longTitle &&
                longTitle.map((word, idx) => (
                  <span key={word + idx}>{word}</span>
                ))}
              {!longTitle && title}
            </span>
            {column.getIsSorted() === "desc" ? (
              <ArrowDown />
            ) : column.getIsSorted() === "asc" ? (
              <ArrowUp />
            ) : (
              <ChevronsUpDown />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem onClick={() => column.toggleSorting(false)}>
            <ArrowUp className="text-muted-foreground/70 h-3.5 w-3.5" />
            Asc
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => column.toggleSorting(true)}>
            <ArrowDown className="text-muted-foreground/70 h-3.5 w-3.5" />
            Desc
          </DropdownMenuItem>

          {haveColumnFilter && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => column.toggleVisibility(false)}>
                <EyeOff className="text-muted-foreground/70 h-3.5 w-3.5" />
                Hide
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
