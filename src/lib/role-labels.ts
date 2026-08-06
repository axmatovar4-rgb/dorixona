import { Role } from "@prisma/client";

export const ROLE_LABELS: Record<Role, string> = {
  SUPER_ADMIN: "Super Admin",
  ADMIN: "Admin",
  PHARMACIST: "Farmatsevt",
  CASHIER: "Kassir",
  WAREHOUSE_MANAGER: "Ombor mudiri",
  HR: "HR",
  ACCOUNTANT: "Buxgalter",
  MANAGER: "Menejer",
};
