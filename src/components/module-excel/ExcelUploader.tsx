"use client";

import { useState, useCallback } from "react";
import { Feather, FileSpreadsheet, AlertCircle, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { parseExcelStructure, SheetStructure } from "@/utils/excel-parser";

interface ExcelUploaderProps {
    onFilesAdded: (structures: SheetStructure[]) => void;
    onFileRemoved: (fileName: string) => void;
    uploadedFiles: string[];
}

export function ExcelUploader({ onFilesAdded, onFileRemoved, uploadedFiles }: ExcelUploaderProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const processFiles = async (fileList: FileList | File[]) => {
        const files = Array.from(fileList).filter(f => f.name.endsWith(".xlsx"));
        if (files.length === 0) {
            setError("请上传 .xlsx 格式的 Excel 文件");
            return;
        }

        setIsProcessing(true);
        setError(null);

        // Ignore already uploaded files
        const newFiles = files.filter(f => !uploadedFiles.includes(f.name));
        if (newFiles.length === 0) {
            setError("选择的文件已存在");
            return;
        }

        try {
            const allStructures: SheetStructure[] = [];
            for (const file of newFiles) {
                const structures = await parseExcelStructure(file);
                allStructures.push(...structures);
            }
            onFilesAdded(allStructures);
        } catch (err) {
            console.error(err);
            setError("解析 Excel 文件失败，请确保文件格式正确");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            processFiles(e.dataTransfer.files);
        }
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            processFiles(e.target.files);
        }
    };

    return (
        <Card className="card-premium w-full p-0 flex flex-col gap-0 border-0 group shadow-none bg-transparent">
            <CardHeader className="border-b border-white/10 bg-zinc-900/30 pb-4 px-6 rounded-t-xl backdrop-blur-md">
                <CardTitle className="flex items-center text-lg font-semibold tracking-wide text-zinc-100">
                    <div className="w-6 h-6 rounded bg-[#8B5CF6]/20 text-[#8B5CF6] flex items-center justify-center mr-3 border border-[#8B5CF6]/30 shadow-[0_0_10px_#8b5cf633]">
                        <span className="text-xs font-bold">01</span>
                    </div>
                    数据上下文接入
                </CardTitle>
                <CardDescription className="text-zinc-400 mt-2">
                    上传游戏配置表 (.xlsx)，引擎将解析表头作为大模型分析业务逻辑的实体上下文支持。
                </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
                <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`
            relative flex flex-col items-center justify-center w-full h-56 border border-dashed rounded-xl cursor-pointer transition-all duration-300
            ${isDragging
                            ? "border-[#8B5CF6]/50 bg-[#8B5CF6]/10 scale-[1.02] shadow-[0_0_30px_#8b5cf626]"
                            : error
                                ? "border-[#EF4444]/50 bg-[#EF4444]/5"
                                : "border-white/10 hover:border-[#8B5CF6]/40 hover:bg-[#8B5CF6]/5 hover:shadow-[0_0_20px_#8b5cf60d]"
                        }
          `}
                >
                    <input
                        type="file"
                        accept=".xlsx"
                        multiple
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        onChange={handleFileChange}
                        disabled={isProcessing}
                    />

                    <div className="flex flex-col items-center justify-center text-center relative pointer-events-none">
                        {isProcessing ? (
                            <div className="relative w-12 h-12 mb-4">
                                <div className="absolute inset-0 rounded-full border-2 border-white/10"></div>
                                <div className="absolute inset-0 rounded-full border-t-2 border-[#8B5CF6] animate-spin"></div>
                            </div>
                        ) : (
                            <div className="w-14 h-14 rounded-2xl bg-zinc-900/80 border border-white/10 flex items-center justify-center mb-4 transition-all group-hover:scale-110 group-hover:border-[#8B5CF6]/30 group-hover:bg-[#8B5CF6]/10 duration-300 shadow-[0_0_15px_#8b5cf61a]">
                                <Feather className={`w-6 h-6 transition-colors ${error ? 'text-[#EF4444]' : 'text-[#8B5CF6]'}`} />
                            </div>
                        )}

                        <h3 className="text-base font-medium text-zinc-100 mb-1 transition-colors group-hover:text-white">
                            点击或拖拽文件到此区域
                        </h3>
                        <p className="text-sm text-zinc-500 mb-4 transition-colors group-hover:text-zinc-400">
                            支持增量上传多个 .xlsx 格式文件
                        </p>

                        {error && (
                            <div className="mt-2 inline-flex items-center px-3 py-1.5 rounded-md bg-[#EF4444]/10 border border-[#EF4444]/20 text-[#EF4444] text-sm font-medium z-20">
                                <AlertCircle className="w-4 h-4 mr-2" />
                                {error}
                            </div>
                        )}
                    </div>
                </div>

                {/* Uploaded Files List */}
                {uploadedFiles.length > 0 && (
                    <div className="mt-5 space-y-2">
                        <div className="flex items-center text-xs font-semibold text-zinc-400 mb-3 tracking-wider uppercase">
                            <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> 已加载列表 ({uploadedFiles.length})
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {uploadedFiles.map(name => (
                                <div key={name} className="flex items-center justify-between p-2.5 rounded-lg border border-white/5 bg-zinc-900/50 hover:bg-zinc-800 transition-colors group">
                                    <div className="flex items-center min-w-0 pr-3">
                                        <FileSpreadsheet className="w-4 h-4 text-[#8B5CF6] shrink-0 mr-2 opacity-70 group-hover:opacity-100" />
                                        <span className="text-sm text-zinc-300 truncate">{name}</span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onFileRemoved(name);
                                        }}
                                        className="shrink-0 text-zinc-500 hover:text-[#EF4444] hover:bg-[#EF4444]/10 p-1.5 rounded-md transition-colors"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card >
    );
}
