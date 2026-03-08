"use client";

import { useState, useEffect } from "react";
import { SheetStructure } from "@/utils/excel-parser";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface Props {
    structures: SheetStructure[];
}

export function ExcelStructureViewer({ structures }: Props) {
    const [activeTab, setActiveTab] = useState<string>("");

    useEffect(() => {
        if (structures.length > 0 && !structures.some(s => s.sheetName === activeTab)) {
            setActiveTab(structures[0].sheetName);
        }
    }, [structures, activeTab]);
    if (!structures || structures.length === 0) {
        return null;
    }

    return (
        <Card className="card-premium mt-6 w-full p-2 border-0 bg-transparent flex flex-col gap-0 shadow-none">
            <CardHeader className="pb-3 px-2">
                <CardTitle className="flex items-center text-md font-medium text-foreground">
                    已抓取的表结构 (Context)
                </CardTitle>
                <CardDescription className="text-muted-foreground text-xs">
                    解析了 {structures.length} 个子表。此结构将作为 AI 生成逻辑的参考上下文。
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <ScrollArea className="w-full pb-2 mb-2">
                        <TabsList className="w-full flex justify-start">
                            {structures.map((sheet) => (
                                <TabsTrigger key={sheet.sheetName} value={sheet.sheetName} className="min-w-fit">
                                    {sheet.sheetName}
                                    <Badge variant="secondary" className="ml-2 text-xs">
                                        {sheet.columns.length} 列
                                    </Badge>
                                </TabsTrigger>
                            ))}
                        </TabsList>
                    </ScrollArea>

                    {structures.map((sheet) => (
                        <TabsContent key={sheet.sheetName} value={sheet.sheetName} className="mt-4 focus-visible:ring-0">
                            <div className="rounded-xl border border-white/10 overflow-hidden bg-black/20">
                                <Table>
                                    <TableHeader className="bg-zinc-900/40 hover:bg-zinc-900/40">
                                        <TableRow className="border-white/10 hover:bg-transparent">
                                            <TableHead className="w-[80px] text-zinc-400 font-medium">序号</TableHead>
                                            <TableHead className="text-zinc-400 font-medium">说明 (中文字段)</TableHead>
                                            <TableHead className="text-zinc-400 font-medium">键名与类型 (英文字段)</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {sheet.columns.length === 0 ? (
                                            <TableRow className="border-white/10 hover:bg-transparent">
                                                <TableCell colSpan={3} className="h-24 text-center text-zinc-600">
                                                    此表为空或格式无法提取结构
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            sheet.columns.map((col, idx) => (
                                                <TableRow key={idx} className="border-white/5 hover:bg-white/5 transition-colors">
                                                    <TableCell className="font-medium text-zinc-500">{idx + 1}</TableCell>
                                                    <TableCell className="text-zinc-300">{col.name}</TableCell>
                                                    <TableCell>
                                                        <code className="relative rounded bg-[#8B5CF6]/10 border border-[#8B5CF6]/20 text-[#8B5CF6] px-[0.4rem] py-[0.15rem] font-mono text-xs font-medium">
                                                            {col.type}
                                                        </code>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </TabsContent>
                    ))}
                </Tabs>
            </CardContent>
        </Card>
    );
}
