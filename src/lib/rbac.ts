import { Role } from "@prisma/client";

export type ModuleName = "pharmacy" | "inventory" | "sales";
export type Action = "view" | "create" | "edit" | "delete";

const ALL: Action[] = ["view", "create", "edit", "delete"];
const WRITE: Action[] = ["view", "create", "edit"];
const READ: Action[] = ["view"];
const NONE: Action[] = [];

const PERMISSIONS: Record<Role, Record<ModuleName, Action[]>> = {
  SUPER_ADMIN: { pharmacy: ALL, inventory: ALL, sales: ALL },
  ADMIN: { pharmacy: ALL, inventory: ALL, sales: ALL },
  PHARMACIST: { pharmacy: WRITE, inventory: READ, sales: READ },
  WAREHOUSE_MANAGER: { pharmacy: READ, inventory: ALL, sales: READ },
  CASHIER: { pharmacy: READ, inventory: READ, sales: WRITE },
  MANAGER: { pharmacy: WRITE, inventory: WRITE, sales: WRITE },
  ACCOUNTANT: { pharmacy: READ, inventory: READ, sales: READ },
  HR: { pharmacy: NONE, inventory: NONE, sales: NONE },
};

export function can(
  role: Role | null | undefined,
  module: ModuleName,
  action: Action
): boolean {
  if (!role) return false;
  return PERMISSIONS[role]?.[module]?.includes(action) ?? false;
}

export function assertCan(role: Role | null | undefined, module: ModuleName, action: Action) {
  if (!can(role, module, action)) {
    throw new Error(`Ruxsat yo'q: ${role ?? "mehmon"} rolida ${module} moduliga "${action}" amalini bajarish mumkin emas`);
  }
}
