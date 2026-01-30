"use client";
import { User, Settings, LogOut, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { api } from "@/trpc/react";
import { initialsFromName } from "@/lib/username";
import { Skeleton } from "../ui/skeleton";



export default function ProfileDropdown() {
  const { data: user } = api.auth.getCurrentUser.useQuery();

  if (!user || !user.user) {
    return (<Skeleton className="size-9 rounded-full" />)
  }
  const { nameBg, fullName, email, } = user.user;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative size-9 rounded-full transition-all duration-200 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <Avatar>
            <AvatarFallback>{initialsFromName(nameBg)}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm leading-none font-medium">{fullName}</p>
            <p className="text-xs leading-none text-slate-500 dark:text-slate-400">
              {email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800">
          <User className="mr-2 h-4 w-4" />
          <span>Профил</span>
        </DropdownMenuItem>
        <DropdownMenuItem className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800">
          <Settings className="mr-2 h-4 w-4" />
          <span>Настройки</span>
        </DropdownMenuItem>
        <DropdownMenuItem className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800">
          <Bell className="mr-2 h-4 w-4" />
          <span>Известия</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="cursor-pointer text-red-600 hover:bg-slate-100 dark:text-red-400 dark:hover:bg-slate-800">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Изход</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
