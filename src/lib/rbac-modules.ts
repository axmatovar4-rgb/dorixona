import { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { Action } from "@/lib/rbac";

export const NEW_MODULES = [
  "crm",
  "procurement",
  "finance",
  "hr",
  "payroll",
  "accounting",
  "supplierManagement",
  "branchManagement",
  "reports",
  "notifications",
  "settings",
  "audit",
  "promoCodes",
  "doctors",
  "deliveryZones",
  "feedback",
] as const;

export type NewModuleName = (typeof NEW_MODULES)[number];

export const NEW_MODULE_LABELS: Record<NewModuleName, string> = {
  crm: "CRM",
  procurement: "Procurement",
  finance: "Finance",
  hr: "HR",
  payroll: "Payroll",
  accounting: "Accounting",
  supplierManagement: "Supplier Management",
  branchManagement: "Branch Management",
  reports: "Reports & Analytics",
  notifications: "Notifications",
  settings: "Settings",
  audit: "Audit",
  promoCodes: "Aksiya kodlari",
  doctors: "Shifokorlar",
  deliveryZones: "Yetkazib berish hududlari",
  feedback: "Fikrlar",
};

export async function canAsync(
  role: Role | null | undefined,
  module: NewModuleName,
  action: Action
): Promise<boolean> {
  if (!role) return false;
  const row = await prisma.rolePermission.findUnique({
    where: { role_module_action: { role, module, action } },
  });
  return row?.allowed ?? false;
}
