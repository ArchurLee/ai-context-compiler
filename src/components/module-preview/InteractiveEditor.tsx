"use client";

import { useEffect, useRef } from "react";
import { useChat } from "@ai-sdk/react";
import { MarkdownPreview } from "./MarkdownPreview";
import { Send, Loader2, Sparkles, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface InteractiveEditorProps {
    initialContent: string;
    onHistoryChange?: (messages: any[]) => void;
}

export function InteractiveEditor({ initialContent, onHistoryChange }: InteractiveEditorProps) {
    // Read the user's custom provider API settings
    const getStoredConfig = () => {
        if (typeof window !== "undefined") {
            const saved = localStorage.getItem("aiContextCompilerSettings");
            return saved ? JSON.parse(saved) : undefined;
        }
        return undefined;
    };

    // @ts-ignore
    const chat = useChat({
        api: "/api/chat",
        body: {
            aiConfig: getStoredConfig(),
        },
        initialMessages: [
            // Inject the initially generated document as an "assistant" message so the context is preserved
            {
                id: "initial-doc",
                role: "assistant",
                content: initialContent,
            }
        ],
        onResponse(response: Response) {
            if (response.status !== 200) {
                console.error("Chat returned an error:", response.statusText);
            }
        }
    } as any);

    const { messages = [], input = "", handleInputChange = () => { }, handleSubmit = (e: any) => e?.preventDefault(), isLoading = false, setMessages = () => { } } = (chat || {}) as any;

    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to the bottom when messages change
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
        // Notify parent if they want to save history or sync states
        onHistoryChange?.(messages);
    }, [messages, onHistoryChange]);

    // Update the base initial message if a brand new generation happens from the parent
    useEffect(() => {
        // @ts-ignore
        if (initialContent && (messages.length === 0 || (messages[0] as any).content !== initialContent)) {
            setMessages([{ id: "initial-doc", role: "assistant", content: initialContent }]);
        }
    }, [initialContent]);

    // Combine all assistant responses conceptually, or just render the latest stream
    // Since this is a "chat-over-document" experience, we want to show the full history as a unified document or a thread.
    // For a strict "Iterable Document" experience, we'll render the chat history visually like an IDE terminal at the bottom.

    return (
        <div className="flex flex-col h-full bg-zinc-950/80 rounded-2xl border border-white/5 overflow-hidden shadow-2xl relative">
            <div className="flex-1 overflow-y-auto px-4 py-2 custom-scrollbar">
                {messages.map((m: any) => (
                    <div key={m.id} className={`my-4 flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
                        {m.role === 'user' ? (
                            <div className="bg-[#8B5CF6]/20 border border-[#8B5CF6]/40 text-purple-100 px-5 py-3 rounded-2xl rounded-tr-sm max-w-[85%]">
                                <p className="text-sm whitespace-pre-wrap">{m.content}</p>
                            </div>
                        ) : (
                            <div className="w-full bg-transparent">
                                {m.id === "initial-doc" ? (
                                    <div className="relative">
                                        <div className="absolute -left-3 top-6 w-1 h-12 bg-emerald-500/50 rounded-full blur-[2px]" />
                                        <MarkdownPreview content={(m as any).content} />
                                    </div>
                                ) : (
                                    <div className="mt-6 border-l-2 border-[#8B5CF6] pl-6 py-2">
                                        <div className="flex items-center text-[#8B5CF6] mb-3 text-sm font-medium">
                                            <Sparkles className="w-4 h-4 mr-2" /> AI 修改迭代
                                        </div>
                                        <MarkdownPreview content={m.content} />
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ))}

                {isLoading && messages[messages.length - 1]?.role === 'user' && (
                    <div className="flex items-center gap-3 text-zinc-500 my-8 px-6">
                        <Loader2 className="h-5 w-5 animate-spin text-[#8B5CF6]" />
                        <span className="text-sm animate-pulse">正在深度重构系统架构代码...</span>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Quick iteration input bar attached to bottom */}
            <div className="p-4 bg-zinc-900 border-t border-white/10 backdrop-blur-xl">
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        if (!input.trim() || isLoading) return;
                        handleSubmit(e);
                    }}
                    className="relative flex items-end gap-3 max-w-5xl mx-auto"
                >
                    <div className="relative flex-1 bg-zinc-950 border border-white/10 rounded-xl focus-within:border-[#8B5CF6] focus-within:ring-1 focus-within:ring-[#8B5CF6]/50 transition-all duration-300 group">
                        <Textarea
                            tabIndex={0}
                            rows={1}
                            value={input}
                            onChange={handleInputChange}
                            placeholder="发现漏了状态机？或者想加入断线重连逻辑？告诉 AI 继续重构..."
                            spellCheck={false}
                            className="min-h-[52px] w-full resize-none bg-transparent px-4 py-3.5 text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:ring-0 custom-scrollbar"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    if (input.trim() && !isLoading) {
                                        handleSubmit(e);
                                    }
                                }
                            }}
                        />
                    </div>

                    <Button
                        type="submit"
                        disabled={isLoading || !input.trim()}
                        className="h-[52px] w-[52px] rounded-xl bg-[#8B5CF6] hover:bg-[#7C3AED] text-white flex-shrink-0 transition-all duration-300 disabled:opacity-50 disabled:hover:bg-[#8B5CF6] relative overflow-hidden group"
                    >
                        {isLoading ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                            <>
                                <Send className="h-5 w-5 absolute z-10 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform rounded-xl" />
                            </>
                        )}
                    </Button>
                </form>
                <div className="text-center mt-2 flex justify-center items-center text-[10px] text-zinc-600 font-medium tracking-wide">
                    <MessageSquare className="w-3 h-3 mr-1" />
                    [Enter] 发送 / [Shift + Enter] 换行 · AI 可读取上方所有历史流转文档
                </div>
            </div>
        </div>
    );
}
