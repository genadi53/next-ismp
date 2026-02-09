"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";

interface MobileMenuContextType {
  isOpen: boolean;
  toggle: () => void;
  close: () => void;
}

const MobileMenuContext = createContext<MobileMenuContextType | null>(null);

export function MobileMenuProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);
  const close = useCallback(() => setIsOpen(false), []);

  return (
    <MobileMenuContext.Provider value={{ isOpen, toggle, close }}>
      {children}
    </MobileMenuContext.Provider>
  );
}

export function useMobileMenu() {
  const context = useContext(MobileMenuContext);
  if (!context) {
    throw new Error("useMobileMenu must be used within MobileMenuProvider");
  }
  return context;
}
