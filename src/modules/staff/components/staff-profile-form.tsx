"use client";

import * as React from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { updateStaffProfile, changeStaffPassword } from "@/modules/staff/actions";

export function StaffProfileForm({
  name,
  email,
  roleLabel,
  branchName,
}: {
  name: string;
  email: string;
  roleLabel: string;
  branchName: string | null;
}) {
  const [nameInput, setNameInput] = React.useState(name);
  const [savingName, setSavingName] = React.useState(false);

  const [currentPassword, setCurrentPassword] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [changingPassword, setChangingPassword] = React.useState(false);

  async function handleSaveName() {
    setSavingName(true);
    const result = await updateStaffProfile({ name: nameInput });
    setSavingName(false);
    if (result?.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Ma'lumotlar saqlandi");
  }

  async function handleChangePassword() {
    setChangingPassword(true);
    const result = await changeStaffPassword({ currentPassword, newPassword, confirmPassword });
    setChangingPassword(false);
    if (result?.error) {
      toast.error(result.error);
      return;
    }
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    toast.success("Parol o'zgartirildi");
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <Label>F.I.Sh</Label>
          <Input value={nameInput} onChange={(e) => setNameInput(e.target.value)} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Email</Label>
          <Input value={email} disabled />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Rol</Label>
          <Input value={roleLabel} disabled />
        </div>
        {branchName && (
          <div className="flex flex-col gap-1.5">
            <Label>Filial</Label>
            <Input value={branchName} disabled />
          </div>
        )}
      </div>
      <Button onClick={handleSaveName} disabled={savingName || nameInput.trim().length < 2} className="w-fit gap-1.5">
        {savingName && <Loader2 className="h-4 w-4 animate-spin" />}
        Saqlash
      </Button>

      <Separator />

      <div className="flex flex-col gap-3">
        <h2 className="font-semibold">Parolni o&apos;zgartirish</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <Label>Joriy parol</Label>
            <Input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Yangi parol</Label>
            <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Yangi parolni takrorlang</Label>
            <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
          </div>
        </div>
        <Button
          onClick={handleChangePassword}
          disabled={changingPassword || !currentPassword || newPassword.length < 6}
          className="w-fit gap-1.5"
        >
          {changingPassword && <Loader2 className="h-4 w-4 animate-spin" />}
          Parolni yangilash
        </Button>
      </div>
    </div>
  );
}
