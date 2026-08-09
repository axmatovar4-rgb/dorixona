"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Upload, FileImage } from "lucide-react";
import { Button } from "@/components/ui/button";
import { uploadPrescription } from "@/modules/customer/actions";

export function PrescriptionUpload({ orderId }: { orderId: string }) {
  const router = useRouter();
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [preview, setPreview] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);

  function handleFile(file: File) {
    if (!file.type.startsWith("image/")) {
      toast.error("Faqat rasm fayli tanlang");
      return;
    }
    if (file.size > 3_000_000) {
      toast.error("Rasm hajmi 3 MB dan oshmasin");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
  }

  async function handleSubmit() {
    if (!preview) return;
    setSubmitting(true);
    const result = await uploadPrescription(orderId, preview);
    setSubmitting(false);
    if (result?.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Retsept yuklandi, tekshiruvni kutmoqda");
    router.refresh();
  }

  if (preview) {
    return (
      <div className="flex flex-col gap-2.5">
        {/* eslint-disable-next-line @next/next/no-img-element -- base64 data URI preview, next/image can't optimize it */}
        <img src={preview} alt="Retsept" className="max-h-64 w-fit rounded-xl border object-contain" />
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="rounded-full" onClick={() => setPreview(null)} disabled={submitting}>
            Bekor qilish
          </Button>
          <Button size="sm" className="gap-1.5 rounded-full" onClick={handleSubmit} disabled={submitting}>
            {submitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            Yuborish
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="flex w-full flex-col items-center gap-2 rounded-xl border border-dashed p-5 text-center text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
      >
        <FileImage className="h-6 w-6" />
        Retsept rasmini yuklash uchun bosing
        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground/70">
          <Upload className="h-3 w-3" />
          JPG, PNG — 3 MB gacha
        </span>
      </button>
    </div>
  );
}
