"use client";

import * as React from "react";
import { Role } from "@prisma/client";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { NEW_MODULES, NEW_MODULE_LABELS, type NewModuleName } from "@/lib/rbac-modules";
import { getRolePermissions, setRolePermission } from "@/modules/rbac-admin/actions";

const ROLES: Role[] = ["SUPER_ADMIN", "ADMIN", "PHARMACIST", "CASHIER", "WAREHOUSE_MANAGER", "HR", "ACCOUNTANT", "MANAGER"];
const ACTIONS = ["view", "create", "edit", "delete"] as const;
const ACTION_LABELS: Record<string, string> = { view: "Ko'rish", create: "Yaratish", edit: "Tahrirlash", delete: "O'chirish" };

export function RbacGrid() {
  const [role, setRole] = React.useState<Role>("MANAGER");
  const [permissions, setPermissions] = React.useState<Record<string, boolean>>({});
  const [loading, setLoading] = React.useState(true);

  const load = React.useCallback(async (r: Role) => {
    setLoading(true);
    const rows = await getRolePermissions(r);
    const map: Record<string, boolean> = {};
    for (const row of rows) map[`${row.module}:${row.action}`] = row.allowed;
    setPermissions(map);
    setLoading(false);
  }, []);

  React.useEffect(() => {
    load(role);
  }, [role, load]);

  async function handleToggle(module: NewModuleName, action: (typeof ACTIONS)[number], checked: boolean) {
    setPermissions((prev) => ({ ...prev, [`${module}:${action}`]: checked }));
    const result = await setRolePermission(role, module, action, checked);
    if (result?.error) {
      toast.error(result.error);
      setPermissions((prev) => ({ ...prev, [`${module}:${action}`]: !checked }));
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium">Rol</label>
        <Select
          items={ROLES.map((r) => ({ value: r, label: r }))}
          value={role}
          onValueChange={(v) => setRole(v as Role)}
        >
          <SelectTrigger className="w-56">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ROLES.map((r) => (
              <SelectItem key={r} value={r}>
                {r}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Modul</TableHead>
            {ACTIONS.map((a) => (
              <TableHead key={a} className="text-center">
                {ACTION_LABELS[a]}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {NEW_MODULES.map((module) => (
            <TableRow key={module}>
              <TableCell className="font-medium">{NEW_MODULE_LABELS[module]}</TableCell>
              {ACTIONS.map((action) => (
                <TableCell key={action} className="text-center">
                  <Checkbox
                    checked={!!permissions[`${module}:${action}`]}
                    disabled={loading}
                    onCheckedChange={(checked) => handleToggle(module, action, !!checked)}
                  />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
