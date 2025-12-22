import { MobileMenuProvider } from "./MobileMenuProvider";
import { AppLayoutContent } from "./AppLayoutContent";
import type { PropsWithChildren } from "react";

export default function AppLayout({ children }: PropsWithChildren) {
  return (
    <MobileMenuProvider>
      <AppLayoutContent>{children}</AppLayoutContent>
    </MobileMenuProvider>
  );
}
