import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendTelegramMessage } from "@/lib/telegram";

export const runtime = "nodejs";

type TelegramUpdate = {
  message?: {
    chat: { id: number };
    text?: string;
  };
};

export async function POST(req: NextRequest) {
  const update = (await req.json()) as TelegramUpdate;
  const message = update.message;
  if (!message?.text) return Response.json({ ok: true });

  const match = message.text.match(/^\/start\s+(\S+)/);
  if (!match) return Response.json({ ok: true });

  const token = match[1];
  const chatId = String(message.chat.id);

  const customer = await prisma.customer.findUnique({
    where: { telegramLinkToken: token },
  });

  if (!customer) {
    await sendTelegramMessage(chatId, "Havola muddati o'tgan yoki noto'g'ri. Ilovadan qaytadan urinib ko'ring.");
    return Response.json({ ok: true });
  }

  await prisma.customer.update({
    where: { id: customer.id },
    data: { telegramChatId: chatId, telegramLinkToken: null },
  });

  await sendTelegramMessage(
    chatId,
    `✅ Muvaffaqiyatli ulandingiz, ${customer.firstName}! Endi dorilaringiz tugash muddati va mavjudlik bildirishnomalarini shu yerda olasiz.`
  );

  return Response.json({ ok: true });
}
