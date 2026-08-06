"use client";

import * as React from "react";

type AIChatContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
  openChat: () => void;
};

const AIChatContext = React.createContext<AIChatContextValue | null>(null);

export function AIChatProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  const openChat = React.useCallback(() => setOpen(true), []);

  return (
    <AIChatContext.Provider value={{ open, setOpen, openChat }}>
      {children}
    </AIChatContext.Provider>
  );
}

export function useAIChat() {
  const ctx = React.useContext(AIChatContext);
  if (!ctx) throw new Error("useAIChat AIChatProvider ichida ishlatilishi kerak");
  return ctx;
}
