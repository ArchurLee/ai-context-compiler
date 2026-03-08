"use client";

import { useEffect, useRef, useState } from "react";
import ReactMarkdown, { Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import mermaid from "mermaid";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
    content: string;
}

// A component to render mermaid code blocks
const MermaidComponent = ({ code }: { code: string }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [svg, setSvg] = useState<string>("");
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        mermaid.initialize({
            startOnLoad: false,
            theme: "default",
            securityLevel: "loose",
            fontFamily: "var(--font-geist-sans), sans-serif",
        });

        let isMounted = true;

        const renderDiagram = async () => {
            if (!isMounted) return;
            try {
                const id = `mermaid-svg-${Math.random().toString(36).substr(2, 9)}`;
                const { svg: svgCode } = await mermaid.render(id, code);
                if (isMounted) {
                    setSvg(svgCode);
                    setError(null);
                }
            } catch (err: any) {
                if (isMounted) {
                    console.warn("Mermaid parsing error:", err.message || err);
                    setError("无法解析此拓扑图语法");
                }
            }
        };

        renderDiagram();

        return () => {
            isMounted = false;
        };
    }, [code]);

    if (error) {
        return (
            <div className="p-4 border border-[#EF4444]/50 bg-[#EF4444]/10 text-[#EF4444] rounded-md text-sm my-4 font-mono">
                <p className="font-bold mb-2">Mermaid 语法错误:</p>
                <pre className="whitespace-pre-wrap overflow-x-auto">{code}</pre>
            </div>
        );
    }

    return (
        <div
            className="my-6 p-4 border border-white/10 rounded-xl bg-zinc-900/40 overflow-x-auto flex justify-center shadow-[var(--shadow-md)]"
            dangerouslySetInnerHTML={{ __html: svg }}
        />
    );
};

export function MarkdownPreview({ content }: Props) {
    const [isCopied, setIsCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(content);
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        } catch (err) {
            console.error("Failed to copy", err);
        }
    };

    // Custom components for react-markdown to intercept mermaid blocks
    const components: Components = {
        code(props) {
            const { children, className, node, ...rest } = props;
            const match = /language-(\w+)/.exec(className || "");
            const isMermaid = match && match[1] === "mermaid";

            if (isMermaid) {
                return <MermaidComponent code={String(children).replace(/\n$/, "")} />;
            }

            return (
                <code className={className} {...rest}>
                    {children}
                </code>
            );
        },
        // Add custom styling to standard markdown elements to match the app theme
        h1: ({ children }) => <h1 className="scroll-m-20 text-3xl font-extrabold tracking-tight lg:text-4xl mt-10 mb-6">{children}</h1>,
        h2: ({ children }) => <h2 className="scroll-m-20 border-b pb-2 text-2xl font-semibold tracking-tight first:mt-0 mt-8 mb-4">{children}</h2>,
        h3: ({ children }) => <h3 className="scroll-m-20 text-xl font-semibold tracking-tight mt-6 mb-3">{children}</h3>,
        p: ({ children }) => <p className="leading-7 [&:not(:first-child)]:mt-4 mb-4">{children}</p>,
        ul: ({ children }) => <ul className="my-4 ml-6 list-disc [&>li]:mt-2">{children}</ul>,
        ol: ({ children }) => <ol className="my-4 ml-6 list-decimal [&>li]:mt-2">{children}</ol>,
        li: ({ children }) => <li className="leading-7">{children}</li>,
        blockquote: ({ children }) => <blockquote className="mt-6 border-l-2 pl-6 italic mb-4 bg-muted/50 py-2 pr-4">{children}</blockquote>,
    };

    return (
        <div className="relative group bg-transparent text-zinc-100 rounded-xl border border-transparent h-full flex flex-col">
            <div className="absolute top-6 right-6 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                    variant="secondary"
                    size="sm"
                    className="h-9 btn-secondary rounded-full bg-zinc-900/80 backdrop-blur-md px-4"
                    onClick={handleCopy}
                    disabled={!content || content.length === 0}
                >
                    {isCopied ? (
                        <Check className="h-4 w-4 text-[#8B5CF6] mr-2" />
                    ) : (
                        <Copy className="h-4 w-4 mr-2" />
                    )}
                    {isCopied ? "已复制" : "一键复制"}
                </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
                {content ? (
                    <div className="prose prose-invert prose-headings:text-zinc-100 prose-p:text-zinc-300 prose-pre:bg-zinc-950/50 prose-pre:border prose-pre:border-white/10 prose-a:text-[#8B5CF6] hover:prose-a:text-[#8B5CF6]/80 max-w-none w-full">
                        <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={components}
                        >
                            {content}
                        </ReactMarkdown>
                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center text-zinc-500">
                        <p>等待生成内容...</p>
                    </div>
                )}
            </div>
        </div>
    );
}
