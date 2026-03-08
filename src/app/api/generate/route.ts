import { google, createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOpenAI } from "@ai-sdk/openai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { streamText } from "ai";

export const maxDuration = 60; // Allow generating for up to 60 seconds

export async function POST(req: Request) {
    try {
        const { structures, formData, aiConfig } = await req.json();

        if (!formData || !formData.coreFeatures) {
            return new Response("Missing Form Data", { status: 400 });
        }

        const systemPrompt = `
您是一位拥有十年大厂经验的【资深游戏客户端主程】及【游戏策划指导专家】。
您的目标是接收下方的【游戏策划草案】与【Excel数据配表结构】，为您团队下的客户端研发人员输出一份【极度专业的客户端研发需求规格说明书】。

说明书请必须遵循以下要求：
1. **结构严谨**：包含“系统架构概览”、“核心数据模型(Data Model)”、“UI交互与表现(View)”、“状态机流转(Controller)”、“异常情况兜底”等标准程序向章节。
2. **状态拓扑图必选**：在业务逻辑复杂的模块，**必须**使用 \`\`\`mermaid 包裹标准的 stateDiagram-v2 或 flowchart TB 来绘制状态流转图。
    - **【🚨 极其重要的 Mermaid 语法警告】**：
      - flowchart 节点如含有空格或特殊字符**必须**用双引号包裹，例如：\`id1["详细节点名称"]\`。
      - **绝对禁止**给已经定义过的节点重复添加描述文本！（例如：只能写 \`A --> B\`，绝不能写 \`A["描述"] --> B["描述"]\`）
      - **绝对禁止**给 \`subgraph\` 群组附加节点括号！（例如：报错提示 Group nodes can only have label。只能写 \`subgraph GroupName\`，绝不能写 \`subgraph GroupName["xxx"]\`）。
3. **数据关联**：必须分析策划提供的 Excel 结构表，指出哪些字段在这个业务中是核心关联字段（Foreign Key 或 ID），应该用什么本地缓存策略。
4. **客户端表现层**：策划提供了“界面拆解”和“红点规则”，请您将它们抽象为了特定的 UI Component，并标注其打开途径和销毁时机。
5. **基于事实**：不要脑补策划没有提及的复杂衍生系统，仅基于给出的数据进行深度架构化整理。不要加入客套话。排版必须精美，使用标准的 Markdown 语法。

【策划输入参数】：
- 模块名称：${formData.moduleName}
- 模块类型：${formData.moduleCategory}
- 功能概述：${formData.functionOverview}
- 界面入口与红点机制：入口=${formData.clientEntrance}，红点规则=${formData.redDot || '无'}
- UI界面拆解与说明：
${formData.clientUIPages?.map((page: any, i: number) => `  [页面 ${i + 1}] 配图：${page.imagePath}\n  页面说明：${page.description}`).join('\n')}

- 核心功能点与状态流转（策划核心逻辑梳理）：
${formData.coreFeatures}

【相关的 Excel 数据表结构预读取（可能为空，如果不为空请参考数据结构）】：
${JSON.stringify(structures, null, 2)}
`;

        let model;

        if (aiConfig && aiConfig.provider === "openai") {
            // Using custom OpenAI Compatible Provider (e.g. DeepSeek, Kimi, etc.)
            const openai = createOpenAI({
                apiKey: aiConfig.customKey || "sk-dummy-key",
                baseURL: (aiConfig.customBaseUrl || "https://api.openai.com/v1").replace(/\/+$/, "").replace(/\/chat\/completions$/, "").replace(/\/v1$/, "") + "/v1",
            });
            // Try to default to some known fast/cheap model if not specified
            model = openai(aiConfig.modelId || 'gpt-4o');
        } else if (aiConfig && aiConfig.provider === "anthropic") {
            // Using custom Anthropic Native Provider
            const anthropic = createAnthropic({
                apiKey: aiConfig.customKey || "sk-ant-dummy-key",
                baseURL: (aiConfig.customBaseUrl || "https://api.anthropic.com/v1").replace(/\/+$/, "").replace(/\/v1$/, "") + "/v1",
            });
            model = anthropic(aiConfig.modelId || 'claude-3-5-sonnet-latest');
        } else {
            // Default to our system Gemini or Custom Gemini
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
            messages: [
                { role: "user", content: "请根据上述架构要求与策划案，为我编译最终级别的Markdown架构需求说明书。" }
            ],
            temperature: 0.7,
        });

        // Respond with a stream directly 
        // We use result.toTextStreamResponse() for newer versions of @ai-sdk
        return result.toTextStreamResponse();

    } catch (error: any) {
        console.error("生成报错:", error);
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
}
