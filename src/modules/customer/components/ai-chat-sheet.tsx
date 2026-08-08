"use client";

import * as React from "react";
import { Sparkles, Send, Loader2, ShieldAlert, User } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useAIChat } from "@/modules/customer/ai-chat-context";

type Message = {
  id: string;
  role: "user" | "assistant";
  text: string;
};

const SUGGESTIONS = [
  "Boshim og'riyapti, nima qilishim mumkin?",
  "Parasetamolni qanday saqlash kerak?",
  "Vitamin C sizlarda bormi?",
];

export function AIChatSheet() {
  const { open, setOpen } = useAIChat();
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [input, setInput] = React.useState("");
  const [pending, setPending] = React.useState(false);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, pending]);

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || pending) return;

    const userMsg: Message = { id: crypto.randomUUID(), role: "user", text: trimmed };
    const nextHistory = [...messages, userMsg];
    setMessages(nextHistory);
    setInput("");
    setPending(true);

    const assistantId = crypto.randomUUID();
    setMessages((prev) => [...prev, { id: assistantId, role: "assistant", text: "" }]);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nextHistory.map((m) => ({ role: m.role, text: m.text })),
        }),
      });

      if (!res.ok || !res.body) {
        throw new Error("request failed");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setMessages((prev) =>
          prev.map((m) => (m.id === assistantId ? { ...m, text: acc } : m))
        );
      }
    } catch {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? { ...m, text: "Uzr, javob berishda xatolik yuz berdi. Qaytadan urinib ko'ring." }
            : m
        )
      );
    } finally {
      setPending(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    send(input);
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent side="right" className="flex w-full flex-col gap-0 p-0 sm:max-w-md">
        <SheetHeader className="gap-1.5 border-b px-5 py-4">
          <SheetTitle className="flex items-center gap-2 text-base">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Sparkles className="h-4 w-4" />
            </span>
            AI Sog&apos;liq Yordamchisi
          </SheetTitle>
          <SheetDescription className="sr-only">
            Sog&apos;liq va dorilar bo&apos;yicha AI yordamchi bilan suhbat
          </SheetDescription>
        </SheetHeader>

        <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
          {messages.length === 0 && (
            <div className="flex flex-col gap-4">
              <div className="rounded-2xl bg-muted/60 p-4 text-sm text-muted-foreground">
                Salom! Men sizga dorilar, ularni saqlash va qo&apos;llash bo&apos;yicha umumiy
                ma&apos;lumot bera olaman. Men tashxis qo&apos;ymayman va davolash rejasi
                tuzmayman — jiddiy holatlarda shifokorga murojaat qilishni tavsiya qilaman.
              </div>
              <div className="flex flex-wrap gap-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="rounded-full border bg-background px-3 py-1.5 text-xs font-medium text-foreground/80 transition-colors hover:border-primary hover:text-primary"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((m, index) => {
            const isStreaming = pending && m.role === "assistant" && index === messages.length - 1;
            return (
              <div
                key={m.id}
                className={cn("flex gap-2.5", m.role === "user" && "flex-row-reverse")}
              >
                <div
                  className={cn(
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-full",
                    m.role === "assistant" ? "bg-primary/10 text-primary" : "bg-muted text-foreground"
                  )}
                >
                  {m.role === "assistant" ? <Sparkles className="h-3.5 w-3.5" /> : <User className="h-3.5 w-3.5" />}
                </div>
                <div
                  className={cn(
                    "max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm whitespace-pre-wrap",
                    m.role === "assistant"
                      ? "bg-muted/70 text-foreground"
                      : "bg-primary text-primary-foreground"
                  )}
                >
                  {m.text}
                  {isStreaming && (
                    <span className="ml-1 inline-flex items-center gap-0.5 align-middle">
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-current opacity-60 [animation-delay:-0.3s]" />
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-current opacity-60 [animation-delay:-0.15s]" />
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-current opacity-60" />
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="border-t bg-card/60 px-5 py-3">
          <div className="mb-2 flex items-start gap-1.5 text-[11px] text-muted-foreground">
            <ShieldAlert className="mt-0.5 h-3 w-3 shrink-0" />
            AI yordamchi tashxis qo&apos;ymaydi va shifokorni almashtirmaydi.
          </div>
          <form onSubmit={handleSubmit} className="flex items-end gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send(input);
                }
              }}
              placeholder="Savolingizni yozing..."
              rows={1}
              className="max-h-32 min-h-11 flex-1 resize-none rounded-2xl"
            />
            <Button
              type="submit"
              size="icon"
              disabled={pending || !input.trim()}
              className="h-11 w-11 shrink-0 rounded-full"
            >
              {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  );
}
