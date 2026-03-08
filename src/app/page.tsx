"use client";

import { useState } from "react";
import { Loader2, Wand2 } from "lucide-react";
import { SheetStructure } from "@/utils/excel-parser";
import { ExcelUploader, ExcelStructureViewer } from "@/components/module-excel";
import { RequirementForm, RequirementFormData } from "@/components/module-form";
import { MarkdownPreview } from "@/components/module-preview";
import { InteractiveEditor } from "@/components/module-preview/InteractiveEditor";
import { Button } from "@/components/ui/button";
import { ParticleBackground } from "@/components/ui/ParticleBackground";
import { ApiSettingsDialog, AISettings, defaultSettings } from "@/components/ui/api-settings-dialog";

export default function Home() {
  const [structures, setStructures] = useState<SheetStructure[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedText, setGeneratedText] = useState("");
  const [aiSettings, setAiSettings] = useState<AISettings>(defaultSettings);

  const handleGenerate = async (validFormData: RequirementFormData) => {

    setIsGenerating(true);
    setGeneratedText("");

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ structures, formData: validFormData, aiConfig: aiSettings }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "生成失败");
      }
      if (!response.body) throw new Error("无返回数据流");

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let done = false;

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          setGeneratedText((prev) => prev + chunk);
        }
      }
    } catch (error) {
      setGeneratedText(`### ❌ 核心总线编译失败\n\n**拦截到的运行时异常**：\n\`\`\`text\n${error instanceof Error ? error.message : "未知网络或代理拦截故障"}\n\`\`\`\n\n**[!] 诊断建议**：\n1. 如果您使用的是默认 Gemini，**国内直连 Vercel 可能会被墙**，请点击右上角齿轮⚙️，切换为【通义千问】/【硅基流动】等国内大模型聚合源，并填入对应的 API Key。\n2. 如果您用的正是国内源，请检查您的 API Key 是否正确填写，或者免费额度是否耗尽。\n3. Vercel 免费版云函数上限时间为 **60秒**，如果填写的文档超级长极有可能触发 \`504 Gateway Timeout\`。`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-background text-foreground overflow-x-hidden relative">
      {/* Neural Network Particle Background Layer */}
      <ParticleBackground />

      {/* Top Navbar */}
      <nav className="h-16 flex items-center justify-between px-6 border-b border-white/10 bg-zinc-950/60 backdrop-blur-xl shrink-0 z-50 sticky top-0">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-[#8B5CF6]/20 flex items-center justify-center border border-[#8B5CF6]/30">
            <span className="w-3 h-3 rounded-full bg-[#8B5CF6] animate-pulse shadow-[0_0_10px_#8B5CF6]"></span>
          </div>
          <h1 className="font-semibold text-lg text-zinc-100 tracking-wide">
            AI Context Compiler <span className="text-zinc-500 text-sm ml-2 font-normal">Beta</span>
          </h1>
        </div>

        <div className="flex items-center">
          <ApiSettingsDialog onSettingsChange={setAiSettings} />
        </div>
      </nav>

      <main className="flex-1 overflow-y-auto w-full relative z-10 custom-scrollbar">
        <div className="max-w-5xl mx-auto py-10 px-6 flex flex-col space-y-10 pb-32">

          {/* Module 1: Excel */}
          <section aria-label="Module 1: Excel Parsing" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <ExcelUploader
              uploadedFiles={Array.from(new Set(structures.map(s => s.sourceFile)))}
              onFilesAdded={(newStructs: SheetStructure[]) => setStructures(prev => {
                const newMap = new Map(prev.map(s => [s.sheetName, s]));
                for (const struct of newStructs) {
                  newMap.set(struct.sheetName, struct);
                }
                return Array.from(newMap.values());
              })}
              onFileRemoved={(fileName: string) => {
                setStructures(prev => prev.filter(s => s.sourceFile !== fileName));
              }}
            />
            <div className="mt-6">
              <ExcelStructureViewer structures={structures} />
            </div>
          </section>

          {/* Module 2: Requirement Form */}
          <section aria-label="Module 2: Requirement Form" className="animate-in fade-in slide-in-from-bottom-6 duration-700">
            <RequirementForm onFormSubmit={handleGenerate} />
          </section>

          {/* AI Generation Trigger Area */}
          <div className="flex flex-col items-center justify-center py-8 relative">
            <div className="absolute inset-y-0 left-1/2 w-px bg-gradient-to-b from-white/10 to-transparent -translate-x-1/2 -z-10"></div>
            <Button
              type="submit"
              form="generate-form"
              disabled={isGenerating}
              size="lg"
              className="btn-primary h-14 px-12 rounded-full text-lg shadow-[0_0_30px_rgba(139,92,246,0.3)] hover:shadow-[0_0_40px_rgba(139,92,246,0.6)] group"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                  认知编译图谱计算中...
                </>
              ) : (
                <>
                  <Wand2 className="mr-3 h-5 w-5 group-hover:rotate-12 transition-transform" />
                  开始编译核心业务引擎
                </>
              )}
            </Button>
          </div>

          {/* Preview Content Area */}
          {(generatedText || isGenerating) && (
            <section
              ref={(el) => { if (el && isGenerating) el.scrollIntoView({ behavior: 'smooth', block: 'start' }); }}
              className="mt-8 animate-in fade-in slide-in-from-bottom-8 duration-700 bg-zinc-950/80 backdrop-blur-xl border border-[#8B5CF6]/30 rounded-2xl shadow-[0_0_40px_rgba(139,92,246,0.15)] overflow-hidden"
            >
              <div className="flex items-center px-6 py-4 border-b border-white/10 bg-zinc-900/50">
                <div className="flex space-x-2 mr-4">
                  <div className="w-3 h-3 rounded-full bg-[#EF4444]"></div>
                  <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                  <div className="w-3 h-3 rounded-full bg-[#8B5CF6]"></div>
                </div>
                <h2 className="text-sm font-semibold tracking-wide text-zinc-300">AI 编译终端总线</h2>
              </div>

              <div className="p-8 min-h-[400px]">
                {generatedText ? (
                  <InteractiveEditor initialContent={generatedText} />
                ) : (
                  <div className="flex flex-col items-center justify-center h-[300px] text-zinc-500">
                    <Loader2 className="w-10 h-10 text-[#8B5CF6] animate-spin mb-4" />
                    <p className="animate-pulse">正在通过大模型进行深度逻辑推演与渲染组合...</p>
                  </div>
                )}
              </div>
            </section>
          )}

        </div>
      </main>
    </div>
  );
}
