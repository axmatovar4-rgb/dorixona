import type { Metadata } from "next";
import { PageContainer } from "@/modules/customer/components/section";
import { FeedbackForm } from "@/modules/feedback/components/feedback-form";

export const metadata: Metadata = { title: "Fikr bildirish" };

export default function FeedbackPage() {
  return (
    <PageContainer className="flex max-w-xl flex-col gap-6 py-8 sm:py-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Fikr bildirish</h1>
        <p className="mt-1 text-muted-foreground">Ilova haqidagi fikringiz bizga muhim</p>
      </div>
      <FeedbackForm />
    </PageContainer>
  );
}
