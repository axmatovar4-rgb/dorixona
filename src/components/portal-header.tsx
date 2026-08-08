"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  Search,
  ShoppingBag,
  Sparkles,
  Package,
  User,
  MapPin,
  LogOut,
  Pill,
  Stethoscope,
} from "lucide-react";
import { LogoMark } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCart } from "@/modules/customer/cart-context";
import { useAIChat } from "@/modules/customer/ai-chat-context";
import { NotificationBell } from "@/modules/customer/components/notification-bell";
import { signOutAction } from "@/lib/actions";
import { ModeToggle } from "@/components/mode-toggle";
import { cn } from "@/lib/utils";

export function PortalHeader({ customerName }: { customerName: string | null }) {
  const router = useRouter();
  const pathname = usePathname();
  const { itemCount } = useCart();
  const { openChat } = useAIChat();
  const [search, setSearch] = React.useState("");

  const initials = (customerName ?? "")
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    router.push(search.trim() ? `/shop?search=${encodeURIComponent(search.trim())}` : "/shop");
  }

  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6">
        <Link href="/shop" className="flex shrink-0 items-center gap-2">
          <LogoMark className="h-9 w-9" />
          <span className="hidden text-lg font-bold tracking-tight sm:inline">PharmCare</span>
        </Link>

        <Button
          className="hidden shrink-0 gap-1.5 rounded-full sm:flex"
          render={<Link href="/shop#catalog" />}
        >
          <Pill className="h-4 w-4" />
          Dorixona
        </Button>

        <form onSubmit={handleSearch} className="mx-auto hidden w-full max-w-md md:block">
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Dori nomini qidiring..."
              className="h-11 rounded-full border-transparent bg-muted pl-10 focus-visible:border-ring focus-visible:bg-background"
            />
          </div>
        </form>

        <div className="ml-auto flex items-center gap-1 sm:gap-1.5">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full text-primary hover:bg-primary/10 hover:text-primary md:flex"
            onClick={openChat}
            title="AI Assistant"
          >
            <Sparkles className="h-[18px] w-[18px]" />
          </Button>

          <ModeToggle />

          {customerName && <NotificationBell />}

          {customerName && (
            <Link
              href="/orders"
              className={cn(
                "hidden h-9 w-9 items-center justify-center rounded-full hover:bg-muted sm:flex",
                pathname.startsWith("/orders") && "bg-muted text-primary"
              )}
              title="Buyurtmalarim"
            >
              <Package className="h-[18px] w-[18px]" />
            </Link>
          )}

          <Link
            href="/cart"
            className="relative flex h-9 w-9 items-center justify-center rounded-full hover:bg-muted"
            title="Savat"
          >
            <ShoppingBag className="h-[18px] w-[18px]" />
            {itemCount > 0 && (
              <Badge className="absolute -top-1 -right-1 h-4.5 min-w-4.5 justify-center rounded-full border-2 border-background px-1 text-[10px]">
                {itemCount}
              </Badge>
            )}
          </Link>

          {customerName ? (
            <DropdownMenu>
              <DropdownMenuTrigger className="ml-1 flex items-center gap-2 rounded-full p-0.5 hover:bg-muted">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuGroup>
                  <DropdownMenuLabel>{customerName}</DropdownMenuLabel>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem render={<Link href="/account" />}>
                  <User className="h-4 w-4" />
                  Profilim
                </DropdownMenuItem>
                <DropdownMenuItem render={<Link href="/orders" />}>
                  <Package className="h-4 w-4" />
                  Buyurtmalarim
                </DropdownMenuItem>
                <DropdownMenuItem render={<Link href="/account/appointments" />}>
                  <Stethoscope className="h-4 w-4" />
                  Qabullarim
                </DropdownMenuItem>
                <DropdownMenuItem render={<Link href="/account/addresses" />}>
                  <MapPin className="h-4 w-4" />
                  Manzillarim
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive" onClick={() => signOutAction()}>
                  <LogOut className="h-4 w-4" />
                  Chiqish
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button className="ml-1 rounded-full" render={<Link href="/login" />}>
              Tizimga kirish
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
