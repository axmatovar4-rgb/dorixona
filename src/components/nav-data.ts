import {
  LayoutDashboard,
  Users,
  Pill,
  Warehouse,
  ScanBarcode,
  UserCog,
  Banknote,
  Truck,
  Building2,
  BarChart3,
  Bell,
  Settings,
  History,
  Percent,
  Stethoscope,
  CalendarCheck,
  MapPinned,
  KeyRound,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  title: string;
  href?: string;
  icon: LucideIcon;
  disabled?: boolean;
  children?: { title: string; href: string }[];
};

export const NAV_ITEMS: NavItem[] = [
  { title: "Boshqaruv paneli", href: "/dashboard", icon: LayoutDashboard },
  { title: "Mijozlar (CRM)", href: "/crm", icon: Users },
  {
    title: "Dorixona",
    icon: Pill,
    children: [
      { title: "Dorilar", href: "/pharmacy/products" },
      { title: "Katalog (kategoriya/brend)", href: "/pharmacy/catalog" },
    ],
  },
  {
    title: "Ombor",
    icon: Warehouse,
    children: [
      { title: "Kirim (Stock-in)", href: "/inventory/stock-in" },
      { title: "Chiqim (Stock-out)", href: "/inventory/stock-out" },
      { title: "Transferlar", href: "/inventory/transfers" },
      { title: "Harakatlar tarixi", href: "/inventory/movements" },
      { title: "Ogohlantirishlar", href: "/inventory/alerts" },
      { title: "Inventarizatsiya", href: "/inventory/counts" },
      { title: "Omborlar", href: "/inventory/warehouses" },
      { title: "Filiallar", href: "/inventory/branches" },
    ],
  },
  { title: "Xaridlar", href: "/procurement", icon: Truck },
  { title: "Aksiya kodlari", href: "/promo-codes", icon: Percent },
  { title: "Shifokorlar", href: "/doctors", icon: Stethoscope },
  { title: "Qabullar", href: "/appointments", icon: CalendarCheck },
  { title: "Yetkazib berish hududlari", href: "/delivery-zones", icon: MapPinned },
  { title: "Foydalanuvchilar", href: "/users", icon: KeyRound },
  {
    title: "Sotuvlar",
    icon: ScanBarcode,
    children: [{ title: "Buyurtmalar", href: "/sales/orders" }],
  },
  { title: "Xodimlar", href: "/hr", icon: UserCog },
  { title: "Ish haqi", href: "/payroll", icon: Banknote },
  { title: "Yetkazib beruvchilar", href: "/suppliers", icon: Truck },
  { title: "Filiallar boshqaruvi", href: "/branches", icon: Building2 },
  { title: "Hisobotlar", href: "/reports", icon: BarChart3 },
  { title: "Bildirishnomalar", href: "/notifications", icon: Bell },
  { title: "Sozlamalar", href: "/settings", icon: Settings },
  { title: "Audit jurnali", href: "/audit", icon: History },
];
