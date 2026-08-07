import { NextRequest } from "next/server";
import {
  createModelContent,
  createPartFromFunctionCall,
  createPartFromFunctionResponse,
  createPartFromText,
  type Content,
  type Part,
} from "@google/genai";
import { auth } from "@/lib/auth";
import { gemini, AI_MODEL, AI_SYSTEM_PROMPT } from "@/lib/ai";
import { searchMedicinesTool, runSearchMedicines } from "@/modules/ai/tools";

export const runtime = "nodejs";

type ChatMessage = { role: "user" | "assistant"; text: string };
type PendingCall = {
  id: string;
  name: string;
  args: Record<string, unknown>;
  thoughtSignature?: string;
};

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

  const contents: Content[] = incoming.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.text }],
  }));

  const encoder = new TextEncoder();

  if (!process.env.GEMINI_API_KEY) {
    return new Response("AI Sog'liq Yordamchisi tez orada ishga tushadi ✨", {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        let toolRounds = 0;

        while (true) {
          const apiStream = await gemini.models.generateContentStream({
            model: AI_MODEL,
            contents,
            config: {
              systemInstruction: AI_SYSTEM_PROMPT,
              tools: [{ functionDeclarations: [searchMedicinesTool] }],
            },
          });

          let fullText = "";
          const pendingCalls: PendingCall[] = [];

          for await (const chunk of apiStream) {
            const text = chunk.text;
            if (text) {
              fullText += text;
              controller.enqueue(encoder.encode(text));
            }
            for (const part of chunk.candidates?.[0]?.content?.parts ?? []) {
              if (part.functionCall?.name) {
                pendingCalls.push({
                  id: part.functionCall.id ?? `${part.functionCall.name}-${pendingCalls.length}`,
                  name: part.functionCall.name,
                  args: part.functionCall.args ?? {},
                  thoughtSignature: part.thoughtSignature,
                });
              }
            }
          }

          const modelParts: Part[] = [];
          if (fullText) modelParts.push(createPartFromText(fullText));
          for (const call of pendingCalls) {
            const callPart = createPartFromFunctionCall(call.name, call.args);
            if (call.thoughtSignature) callPart.thoughtSignature = call.thoughtSignature;
            modelParts.push(callPart);
          }
          if (modelParts.length > 0) {
            contents.push(createModelContent(modelParts));
          }

          if (pendingCalls.length === 0 || toolRounds >= MAX_TOOL_ROUNDS) {
            break;
          }
          toolRounds++;

          const responseParts: Part[] = [];
          for (const call of pendingCalls) {
            let resultText: string;
            try {
              if (call.name === "search_medicines") {
                const input = call.args as { query: string };
                resultText = await runSearchMedicines(input.query);
              } else {
                resultText = JSON.stringify({ error: "Noma'lum vosita" });
              }
            } catch {
              resultText = JSON.stringify({ error: "Vositani bajarishda xatolik yuz berdi" });
            }
            responseParts.push(
              createPartFromFunctionResponse(call.id, call.name, JSON.parse(resultText))
            );
          }

          contents.push({ role: "user", parts: responseParts });
        }
      } catch (err) {
        console.error("AI chat error:", err);
        controller.enqueue(
          encoder.encode("\n\nUzr, javob berishda xatolik yuz berdi. Birozdan so'ng qayta urinib ko'ring.")
        );
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
