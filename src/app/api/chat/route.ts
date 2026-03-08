import { google, createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOpenAI } from "@ai-sdk/openai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { streamText } from "ai";

export const maxDuration = 60;

export async function POST(req: Request) {
    try {
        const { messages, aiConfig } = await req.json();

        if (!messages || messages.length === 0) {
            return new Response("Missing messages", { status: 400 });
        }

        const systemPrompt = `
您是一位资深的游戏客户端主程。您刚才已经基于策划的需求输出了一份【技术架构文档】。
现在，策划或技术负责人在向您提出追加修改或细化要求的指令。
请结合上下文的历史对话记录，以专业的态度直接给出**修改后相应的 Markdown 文本**。
如果有代码需要补充、有状态机逻辑 (Mermaid) 需要修补，请直接编写并输出。
不要进行无关的寒暄废话，始终保持架构师的严谨口吻。
`;

        let model;

        if (aiConfig && aiConfig.provider === "openai") {
            const openai = createOpenAI({
                apiKey: aiConfig.customKey || "sk-dummy-key",
                baseURL: aiConfig.customBaseUrl || "https://api.openai.com/v1",
            });
            model = openai(aiConfig.modelId || 'gpt-4o');
        } else if (aiConfig && aiConfig.provider === "anthropic") {
            const anthropic = createAnthropic({
                apiKey: aiConfig.customKey || "sk-ant-dummy-key",
                baseURL: aiConfig.customBaseUrl || "https://api.anthropic.com/v1",
            });
            model = anthropic(aiConfig.modelId || 'claude-3-5-sonnet-latest');
        } else {
            if (aiConfig && aiConfig.customKey) {
                const customGoogle = createGoogleGenerativeAI({
                    apiKey: aiConfig.customKey,
                });
                model = customGoogle(aiConfig.modelId || 'gemini-2.5-flash');
            } else {
                model = google(aiConfig?.modelId || 'gemini-2.5-flash');
            }
        }

        const result = streamText({
            model: model,
            system: systemPrompt,
            messages,
            temperature: 0.7,
        });

        return result.toTextStreamResponse();

    } catch (error: any) {
        console.error("对话报错:", error);
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
}
