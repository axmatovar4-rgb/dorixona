"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { NAV_ITEMS } from "@/components/nav-data";
import { LogoMark } from "@/components/logo";

export function AppSidebar({ className }: { className?: string }) {
  const pathname = usePathname();
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    Dorixona: pathname.startsWith("/pharmacy"),
    Ombor: pathname.startsWith("/inventory"),
    Sotuvlar: pathname.startsWith("/sales"),
  });

  return (
    <nav className={cn("flex h-full w-64 flex-col border-r bg-sidebar", className)}>
      <div className="flex h-14 items-center gap-2 border-b px-4">
        <LogoMark className="h-8 w-8 shrink-0" />
        <span className="font-semibold">PharmCare ERP</span>
      </div>

      <div className="flex-1 overflow-y-auto py-2">
        <ul className="flex flex-col gap-0.5 px-2">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;

            if (item.disabled) {
              return (
                <li key={item.title}>
                  <div className="flex cursor-not-allowed items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground/50">
                    <Icon className="h-4 w-4 shrink-0" />
                    <span className="flex-1">{item.title}</span>
                    <span className="rounded bg-muted px-1.5 py-0.5 text-[10px]">
                      Tez kunda
                    </span>
                  </div>
                </li>
              );
            }

            if (item.children) {
              const isOpen = openGroups[item.title];
              const isActiveGroup = item.children.some((c) =>
                pathname.startsWith(c.href)
              );

              return (
                <li key={item.title}>
                  <button
                    type="button"
                    onClick={() =>
                      setOpenGroups((s) => ({ ...s, [item.title]: !s[item.title] }))
                    }
                    className={cn(
                      "flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-sidebar-accent",
                      isActiveGroup && "text-sidebar-primary"
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span className="flex-1 text-left">{item.title}</span>
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 transition-transform",
                        isOpen && "rotate-180"
                      )}
                    />
                  </button>
                  {isOpen && (
                    <ul className="ml-4 flex flex-col gap-0.5 border-l pl-3 py-1">
                      {item.children.map((child) => {
                        const active = pathname.startsWith(child.href);
                        return (
                          <li key={child.href}>
                            <Link
                              href={child.href}
                              className={cn(
                                "block rounded-md px-3 py-1.5 text-sm hover:bg-sidebar-accent",
                                active &&
                                  "bg-sidebar-accent font-medium text-sidebar-primary"
                              )}
                            >
                              {child.title}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </li>
              );
            }

            const active = item.href === pathname;
            return (
              <li key={item.title}>
                <Link
                  href={item.href!}
                  className={cn(
                    "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-sidebar-accent",
                    active && "bg-sidebar-accent text-sidebar-primary"
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {item.title}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
