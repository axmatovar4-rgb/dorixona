import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { auth } from "@/lib/auth";
import { anthropic, AI_MODEL, AI_SYSTEM_PROMPT } from "@/lib/ai";
import { searchMedicinesTool, runSearchMedicines } from "@/modules/ai/tools";

export const runtime = "nodejs";

type ChatMessage = { role: "user" | "assistant"; text: string };

const MAX_TURNS = 20;
const MAX_TOOL_ROUNDS = 3;

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.type !== "CUSTOMER") {
    return new Response("Unauthorized", { status: 401 });
  }

  const body = (await req.json()) as { messages?: ChatMessage[] };
  const incoming = (body.messages ?? []).slice(-MAX_TURNS);
  if (incoming.length === 0 || incoming[incoming.length - 1].role !== "user") {
    return new Response("Bad request", { status: 400 });
  }

  const messages: Anthropic.MessageParam[] = incoming.map((m) => ({
    role: m.role,
    content: m.text,
  }));

  const encoder = new TextEncoder();

  if (!process.env.ANTHROPIC_API_KEY) {
    return new Response("AI Sog'liq Yordamchisi tez orada ishga tushadi ✨", {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        let toolRounds = 0;

        while (true) {
          const apiStream = anthropic.messages.stream({
            model: AI_MODEL,
            max_tokens: 2048,
            system: AI_SYSTEM_PROMPT,
            tools: [searchMedicinesTool],
            messages,
          });

          for await (const event of apiStream) {
            if (
              event.type === "content_block_delta" &&
              event.delta.type === "text_delta"
            ) {
              controller.enqueue(encoder.encode(event.delta.text));
            }
          }

          const finalMessage = await apiStream.finalMessage();
          messages.push({ role: "assistant", content: finalMessage.content });

          if (finalMessage.stop_reason !== "tool_use" || toolRounds >= MAX_TOOL_ROUNDS) {
            break;
          }
          toolRounds++;

          const toolUseBlocks = finalMessage.content.filter(
            (b): b is Anthropic.ToolUseBlock => b.type === "tool_use"
          );

          const toolResults: Anthropic.ToolResultBlockParam[] = [];
          for (const block of toolUseBlocks) {
            let resultText: string;
            try {
              if (block.name === "search_medicines") {
                const input = block.input as { query: string };
                resultText = await runSearchMedicines(input.query);
              } else {
                resultText = JSON.stringify({ error: "Noma'lum vosita" });
              }
            } catch {
              resultText = JSON.stringify({ error: "Vositani bajarishda xatolik yuz berdi" });
            }
            toolResults.push({
              type: "tool_result",
              tool_use_id: block.id,
              content: resultText,
            });
          }

          messages.push({ role: "user", content: toolResults });
        }
      } catch (err) {
        console.error("AI chat error:", err);
        const message =
          err instanceof Anthropic.APIError &&
          (err.status === 401 || err.status === 403 || err.type === "billing_error")
            ? "AI Sog'liq Yordamchisi hozircha sozlanmagan. Iltimos, keyinroq qayta urinib ko'ring."
            : "Uzr, javob berishda xatolik yuz berdi. Birozdan so'ng qayta urinib ko'ring.";
        controller.enqueue(encoder.encode(`\n\n${message}`));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache",
    },
  });
}
