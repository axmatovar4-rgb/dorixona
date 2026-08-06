import {
  LayoutDashboard,
  Users,
  Pill,
  Warehouse,
  ShoppingCart,
  ScanBarcode,
  Wallet,
  UserCog,
  Banknote,
  BookOpenText,
  Truck,
  Building2,
  BarChart3,
  Bell,
  ShieldCheck,
  Settings,
  History,
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
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "CRM", icon: Users, disabled: true },
  {
    title: "Pharmacy",
    icon: Pill,
    children: [
      { title: "Dorilar", href: "/pharmacy/products" },
      { title: "Katalog (kategoriya/brend)", href: "/pharmacy/catalog" },
    ],
  },
  {
    title: "Inventory",
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
  { title: "Procurement", icon: Truck, disabled: true },
  {
    title: "Sales / POS",
    icon: ScanBarcode,
    children: [{ title: "Buyurtmalar", href: "/sales/orders" }],
  },
  { title: "Finance", icon: Wallet, disabled: true },
  { title: "HR", icon: UserCog, disabled: true },
  { title: "Payroll", icon: Banknote, disabled: true },
  { title: "Accounting", icon: BookOpenText, disabled: true },
  { title: "Supplier Management", icon: ShoppingCart, disabled: true },
  { title: "Branch Management", icon: Building2, disabled: true },
  { title: "Reports & Analytics", icon: BarChart3, disabled: true },
  { title: "Notifications", icon: Bell, disabled: true },
  { title: "RBAC", icon: ShieldCheck, disabled: true },
  { title: "Settings", icon: Settings, disabled: true },
  { title: "Audit", icon: History, disabled: true },
];
