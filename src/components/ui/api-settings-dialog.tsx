"use client";

import { useState, useEffect } from "react";
import { Settings, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export type AIProvider = "gemini" | "openai" | "anthropic";

export interface AISettings {
    provider: AIProvider;
    customKey: string;
    customBaseUrl: string;
    modelId: string;
}

export const defaultSettings: AISettings = {
    provider: "gemini",
    customKey: "",
    customBaseUrl: "",
    modelId: "",
};

interface ApiSettingsDialogProps {
    onSettingsChange?: (settings: AISettings) => void;
}

export function ApiSettingsDialog({ onSettingsChange }: ApiSettingsDialogProps) {
    const [open, setOpen] = useState(false);
    const [settings, setSettings] = useState<AISettings>(defaultSettings);
    const [showKey, setShowKey] = useState(false);

    // 加载本地配置
    useEffect(() => {
        const saved = localStorage.getItem("aiContextCompilerSettings");
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                setSettings(parsed);
                onSettingsChange?.(parsed);
            } catch (e) {
                console.error("Failed to parse saved settings", e);
            }
        }
    }, [onSettingsChange]);

    const handleSave = () => {
        localStorage.setItem("aiContextCompilerSettings", JSON.stringify(settings));
        onSettingsChange?.(settings);
        setOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger
                render={
                    <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full hover:bg-white/10 text-zinc-400 hover:text-white transition-colors duration-200" />
                }
            >
                <Settings className="h-5 w-5" />
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-zinc-950/90 backdrop-blur-2xl border-white/10 text-zinc-100 shadow-[0_0_50px_rgba(139,92,246,0.15)]">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold tracking-wide flex items-center">
                        <div className="w-8 h-8 rounded-lg bg-[#8B5CF6]/20 flex items-center justify-center border border-[#8B5CF6]/30 mr-3">
                            <Settings className="w-4 h-4 text-[#8B5CF6]" />
                        </div>
                        引擎配置中心
                    </DialogTitle>
                    <DialogDescription className="text-zinc-400 pt-2">
                        切换底层大语言模型驱动，您可以使用自建的 OpenAI 兼容代理池（如 DeepSeek、硅基流动等）覆盖系统内置的 Gemini 节点。
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-6 py-4">
                    <div className="space-y-4">
                        <Label className="text-zinc-300 font-semibold tracking-wide">驱动程序 (Provider)</Label>
                        <RadioGroup
                            value={settings.provider}
                            onValueChange={(value) => setSettings({ ...settings, provider: value as AIProvider })}
                            className="flex flex-col space-y-2"
                        >
                            <div className="flex items-center space-x-3 bg-zinc-900/50 border border-white/5 p-3 rounded-xl hover:border-white/20 transition-colors">
                                <RadioGroupItem value="gemini" id="r1" className="border-[#8B5CF6] text-[#8B5CF6]" />
                                <Label htmlFor="r1" className="flex-1 cursor-pointer">
                                    <div className="font-medium text-zinc-200">Google Gemini (内置节点)</div>
                                    <div className="text-xs text-zinc-500 mt-0.5">采用服务器环境变量中配置的默认引擎</div>
                                </Label>
                            </div>
                            <div className="flex items-center space-x-3 bg-zinc-900/50 border border-white/5 p-3 rounded-xl hover:border-white/20 transition-colors">
                                <RadioGroupItem value="openai" id="r2" className="border-[#8B5CF6] text-[#8B5CF6]" />
                                <Label htmlFor="r2" className="flex-1 cursor-pointer">
                                    <div className="font-medium text-zinc-200">OpenAI 兼容协议 (自定义节点)</div>
                                    <div className="text-xs text-zinc-500 mt-0.5">支持 DeepSeek, 通义千问, 代理商分发池等</div>
                                </Label>
                            </div>
                            <div className="flex items-center space-x-3 bg-zinc-900/50 border border-white/5 p-3 rounded-xl hover:border-white/20 transition-colors">
                                <RadioGroupItem value="anthropic" id="r3" className="border-[#8B5CF6] text-[#8B5CF6]" />
                                <Label htmlFor="r3" className="flex-1 cursor-pointer">
                                    <div className="font-medium text-zinc-200">Anthropic (Claude 原生协议)</div>
                                    <div className="text-xs text-zinc-500 mt-0.5">支持 Claude 3.5 Sonnet 等官方原生接口</div>
                                </Label>
                            </div>
                        </RadioGroup>
                    </div>

                    <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                        <div className="space-y-2 relative">
                            <Label htmlFor="apiKey" className="text-zinc-300">私有 API Key</Label>
                            <div className="relative">
                                <Input
                                    id="apiKey"
                                    type={showKey ? "text" : "password"}
                                    placeholder={settings.provider === "gemini" ? "AIzaSy..." : "sk-..."}
                                    value={settings.customKey}
                                    onChange={(e) => setSettings({ ...settings, customKey: e.target.value })}
                                    className="input-premium pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowKey(!showKey)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
                                >
                                    {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="modelId" className="text-zinc-300">
                                自定义模型名称 (Model ID) <span className="text-zinc-500 font-normal text-xs ml-2">留空则使用内置默认</span>
                            </Label>
                            <Input
                                id="modelId"
                                placeholder={settings.provider === "gemini" ? "gemini-2.5-flash / gemini-1.5-pro" : "gpt-4o / deepseek-chat / claude-3-5-sonnet"}
                                value={settings.modelId || ""}
                                onChange={(e) => setSettings({ ...settings, modelId: e.target.value })}
                                className="input-premium"
                            />
                        </div>

                        {(settings.provider === "openai" || settings.provider === "anthropic") && (
                            <div className="space-y-2">
                                <Label htmlFor="baseUrl" className="text-zinc-300">
                                    Base URL <span className="text-zinc-500 font-normal text-xs ml-2">(代理池网关，例如 https://api.deepseek.com/v1)</span>
                                </Label>
                                <Input
                                    id="baseUrl"
                                    placeholder={settings.provider === "anthropic" ? "https://api.anthropic.com/v1" : "https://api.openai.com/v1"}
                                    value={settings.customBaseUrl}
                                    onChange={(e) => setSettings({ ...settings, customBaseUrl: e.target.value })}
                                    className="input-premium"
                                />
                            </div>
                        )}
                    </div>
                </div>
                <div className="flex justify-end gap-3 mt-2">
                    <Button variant="ghost" onClick={() => setOpen(false)} className="text-zinc-400 hover:text-zinc-100 hover:bg-white/10 rounded-xl">
                        取消
                    </Button>
                    <Button onClick={handleSave} className="btn-primary rounded-xl px-6">
                        保存并应用
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
