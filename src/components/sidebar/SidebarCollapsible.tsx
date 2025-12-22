import { type NavigationItem } from "../../config/site.config";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { type PropsWithChildren } from "react";

type SidebarCollapsibleProps = {
  open: boolean;
  onOpenChange: () => void;
  navItems: NavigationItem[];
} & PropsWithChildren;

export default function SidebarCollapsible({
  navItems,
  open,
  onOpenChange,
  children,
}: SidebarCollapsibleProps) {
  return (
    <Collapsible open={open} onOpenChange={onOpenChange}>
      <CollapsibleTrigger asChild>{children}</CollapsibleTrigger>
      <CollapsibleContent className="mt-1 overflow-hidden pl-2 transition-all duration-300 data-[state=closed]:h-0 data-[state=closed]:opacity-0 data-[state=open]:opacity-100">
        <div className="flex flex-col gap-1 py-1">
          {navItems.map((item, idx) => {
            return <NavLink key={`${item.title}-${idx}`} item={item} />;
          })}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

const NavLink = ({ item }: { item: NavigationItem }) => {
  const pathname = usePathname();
  const isActive = pathname === item.path;
  return (
    <Link
      key={item.path}
      href={item.path}
      className={`flex w-full items-center rounded-lg py-2.5 pl-3 text-sm transition-all duration-200 ${
        isActive
          ? "border-l-2 border-slate-400 bg-slate-100 text-slate-900 shadow-sm dark:border-slate-300 dark:bg-slate-800 dark:text-white"
          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 hover:shadow-sm dark:text-slate-400 dark:hover:bg-slate-800/50 dark:hover:text-white"
      }`}
    >
      {item.title}
    </Link>
  );
};
