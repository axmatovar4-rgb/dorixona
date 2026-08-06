"use client";

import * as React from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { uz } from "date-fns/locale";
import { Bell, PackageCheck, CalendarClock } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { getMyNotifications, markNotificationsRead } from "@/modules/customer/actions";

type NotificationRow = {
  id: string;
  type: "EXPIRY_WARNING" | "BACK_IN_STOCK";
  title: string;
  body: string;
  productId: string | null;
  isRead: boolean;
  createdAt: Date;
};

export function NotificationBell() {
  const [notifications, setNotifications] = React.useState<NotificationRow[]>([]);
  const [unreadCount, setUnreadCount] = React.useState(0);

  const load = React.useCallback(async () => {
    const result = await getMyNotifications();
    setNotifications(result.notifications);
    setUnreadCount(result.unreadCount);
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  async function handleOpenChange(open: boolean) {
    if (open) {
      await load();
      if (unreadCount > 0) {
        await markNotificationsRead();
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        setUnreadCount(0);
      }
    }
  }

  return (
    <DropdownMenu onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger
        className="relative flex h-9 w-9 items-center justify-center rounded-full hover:bg-muted"
        title="Bildirishnomalar"
      >
        <Bell className="h-[18px] w-[18px]" />
        {unreadCount > 0 && (
          <Badge className="absolute -top-1 -right-1 h-4.5 min-w-4.5 justify-center rounded-full border-2 border-background px-1 text-[10px]">
            {unreadCount}
          </Badge>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Bildirishnomalar</DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        {notifications.length === 0 ? (
          <div className="px-2 py-6 text-center text-sm text-muted-foreground">
            Hozircha bildirishnoma yo&apos;q
          </div>
        ) : (
          <div className="flex max-h-80 flex-col gap-0.5 overflow-y-auto">
            {notifications.map((n) => (
              <Link
                key={n.id}
                href={n.productId ? `/shop/${n.productId}` : "/account"}
                className="flex gap-2.5 rounded-lg px-2 py-2 text-sm hover:bg-muted"
              >
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  {n.type === "EXPIRY_WARNING" ? (
                    <CalendarClock className="h-3.5 w-3.5" />
                  ) : (
                    <PackageCheck className="h-3.5 w-3.5" />
                  )}
                </span>
                <span className="flex-1">
                  <span className="block font-medium">{n.title}</span>
                  <span className="block text-xs text-muted-foreground">{n.body}</span>
                  <span className="mt-0.5 block text-[11px] text-muted-foreground/70">
                    {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true, locale: uz })}
                  </span>
                </span>
              </Link>
            ))}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
