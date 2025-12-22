"use client";

import Header from "./Header";
// import Sidebar from "./Sidebar";
import { useMobileMenu } from "./MobileMenuProvider";
import type { PropsWithChildren } from "react";
import Sidebar from "./sidebar/Sidebar";

export function AppLayoutContent({ children }: PropsWithChildren) {
  const { isOpen, toggle, close } = useMobileMenu();

  return (
    <div className="flex min-h-screen flex-col bg-slate-50/50 dark:bg-slate-950/50">
      <Header onMenuClick={toggle} />
      <div className="flex flex-1 flex-row">
        <Sidebar isOpen={isOpen} onClose={close} />
        <main className="mx-auto flex-1 px-6 py-6 transition-all duration-300 md:ml-[240px]">
          <div className="mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
