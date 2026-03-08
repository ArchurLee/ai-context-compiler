"use client";

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Feather, Image as ImageIcon, Loader2, Plus, Trash2 } from "lucide-react";

import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { requirementFormSchema, RequirementFormData } from "./schema";

interface Props {
    onFormSubmit: (data: RequirementFormData) => void;
}

export function RequirementForm({ onFormSubmit }: Props) {
    const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);

    const form = useForm<RequirementFormData>({
        resolver: zodResolver(requirementFormSchema),
        defaultValues: {
            moduleName: "",
            moduleCategory: "功能",
            functionOverview: "",
            coreFeatures: "",
            clientEntrance: "",
            clientUIPages: [],
            redDot: "",
        },
        mode: "onChange",
    });

    const { fields: pageFields, append: appendPage, remove: removePage } = useFieldArray<RequirementFormData, "clientUIPages">({
        control: form.control,
        name: "clientUIPages",
    });

    // We rely on React-Hook-Form's built-in validation for errors
    // No need to watch on every keystroke anymore.

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        const file = files[0];
        if (!file.type.startsWith("image/")) {
            form.setError(`clientUIPages.${index}.imagePath`, { message: "必须上传图片文件" });
            return;
        }

        setUploadingIndex(index);

        try {
            const formData = new FormData();
            formData.append("file", file);

            const res = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });

            if (!res.ok) throw new Error("上传失败");

            const data = await res.json();
            form.setValue(`clientUIPages.${index}.imagePath`, data.url, { shouldValidate: true });
            form.clearErrors(`clientUIPages.${index}.imagePath`);
        } catch (error) {
            console.error(error);
            form.setError(`clientUIPages.${index}.imagePath`, { message: "上传失败，请重试" });
        } finally {
            setUploadingIndex(null);
            e.target.value = "";
        }
    };

    return (
        <Card className="card-premium w-full mt-8 p-0 flex flex-col gap-0 border-0 group shadow-none bg-transparent">
            <CardHeader className="border-b border-white/10 bg-zinc-900/30 pb-4 px-6 rounded-t-xl backdrop-blur-md">
                <CardTitle className="flex items-center text-lg font-semibold tracking-wide text-[#F8FAFC]">
                    <div className="w-6 h-6 rounded bg-[#8B5CF6]/10 text-[#8B5CF6] flex items-center justify-center mr-3 border border-[#8B5CF6]/20 shadow-[0_0_10px_#8b5cf633]">
                        <span className="text-xs font-bold">02</span>
                    </div>
                    业务逻辑与意图描绘
                </CardTitle>
                <CardDescription className="text-[#94A3B8] mt-2">
                    用自然语言描述您的功能规则，AI将把此段描述与“模块一”的表结构进行融合编译。
                </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
                <Form {...form}>
                    <form
                        id="generate-form"
                        onSubmit={form.handleSubmit(onFormSubmit, (errors) => {
                            console.error("Form validation failed:", errors);
                            alert("提交失败：请向上滚动检查是否有漏填的信息！\n(部分输入框下方会有红字提示，例如模块名称、功能概述等必需项至少需要数个字符)");
                        })}
                        className="space-y-8"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <FormField
                                control={form.control}
                                name="moduleName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-[#F8FAFC] font-medium">系统/模块名称</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="例如：装备强化系统"
                                                className="input-premium h-12 w-full text-[#F8FAFC] placeholder:text-[#94A3B8]"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage className="text-[#EF4444] text-xs" />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="moduleCategory"
                                render={({ field }) => (
                                    <FormItem className="space-y-3">
                                        <FormLabel className="text-[#F8FAFC] font-medium">模块分类</FormLabel>
                                        <FormControl>
                                            <RadioGroup
                                                onValueChange={field.onChange}
                                                value={field.value}
                                                className="flex flex-row space-x-4 h-12 items-center"
                                            >
                                                <FormItem className="flex items-center space-x-2 space-y-0 cursor-pointer">
                                                    <FormControl>
                                                        <RadioGroupItem value="功能" className="border-white/20 text-[#8B5CF6] data-[state=checked]:border-[#8B5CF6] data-[state=checked]:shadow-[0_0_8px_#8b5cf680] transition-all" />
                                                    </FormControl>
                                                    <FormLabel className="font-normal text-zinc-300 cursor-pointer">常驻功能</FormLabel>
                                                </FormItem>
                                                <FormItem className="flex items-center space-x-2 space-y-0 cursor-pointer">
                                                    <FormControl>
                                                        <RadioGroupItem value="活动" className="border-white/20 text-[#8B5CF6] data-[state=checked]:border-[#8B5CF6] data-[state=checked]:shadow-[0_0_8px_#8b5cf680] transition-all" />
                                                    </FormControl>
                                                    <FormLabel className="font-normal text-zinc-300 cursor-pointer">限时活动</FormLabel>
                                                </FormItem>
                                            </RadioGroup>
                                        </FormControl>
                                        <FormMessage className="text-[#EF4444] text-xs" />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="functionOverview"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-[#F8FAFC] font-medium">功能概述</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="一句话描述该系统用来干什么，它在游戏里的定位是什么..."
                                            className="input-premium resize-none min-h-[80px] w-full text-[#F8FAFC] placeholder:text-[#94A3B8]"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage className="text-[#EF4444] text-xs" />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="coreFeatures"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-[#F8FAFC] font-medium flex items-center">
                                        核心功能点与流转逻辑
                                        <span className="ml-3 text-[10px] py-1 px-3 rounded-md bg-[#8B5CF6]/10 text-[#8B5CF6] border border-[#8B5CF6]/20 font-bold tracking-wider shadow-[0_0_10px_#8b5cf61a]">
                                            核心推断域
                                        </span>
                                    </FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder={`请详细描述判定条件、消耗、与状态流转。\n例如：\n1. 点击强化按钮时，判断金币是否足够。\n2. 扣除对应配表消耗，并计算成功率。\n3. 成功后特效播放，失败后进入沉淀池...`}
                                            className="input-premium min-h-[160px] resize-y w-full text-[#F8FAFC] placeholder:text-[#94A3B8] leading-relaxed"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage className="text-[#EF4444] text-xs" />
                                </FormItem>
                            )}
                        />

                        {/* Client Expressions (Entrance + Pages) */}
                        <div className="space-y-6 pt-6 border-t border-white/10">
                            <h3 className="text-lg font-semibold tracking-wide text-zinc-100 flex items-center">
                                客户端表现层细节
                                <span className="ml-3 text-[10px] py-1 px-3 rounded-md bg-zinc-800/80 text-zinc-400 border border-white/10 font-bold tracking-wider">
                                    UI/UX
                                </span>
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <FormField
                                    control={form.control}
                                    name="clientEntrance"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-[#F8FAFC] font-medium">界面入口</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="例如：主界面 -> 英雄系统 -> 强化Tab"
                                                    className="input-premium min-h-[52px] resize-y w-full text-[#F8FAFC] placeholder:text-[#94A3B8]"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage className="text-[#EF4444] text-xs" />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="redDot"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-[#F8FAFC] font-medium">红点规则 (选填)</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="例如：材料足够强化时亮起红点，点击后消失"
                                                    className="input-premium min-h-[52px] resize-y w-full text-[#F8FAFC] placeholder:text-[#94A3B8]"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage className="text-[#EF4444] text-xs" />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="space-y-4">
                                <FormLabel className="text-[#F8FAFC] font-medium flex items-center">UI 界面拆解 (图文对应)</FormLabel>
                                {pageFields.map((item, index) => (
                                    <div key={item.id} className="p-5 rounded-xl border border-white/10 bg-zinc-900/30 flex gap-6 items-start relative group">
                                        <button
                                            type="button"
                                            onClick={() => removePage(index)}
                                            className="absolute top-4 right-4 text-zinc-500 hover:text-[#EF4444] transition-colors opacity-0 group-hover:opacity-100"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>

                                        {/* Image Upload Block */}
                                        <div className="shrink-0">
                                            <FormField
                                                control={form.control}
                                                name={`clientUIPages.${index}.imagePath`}
                                                render={({ field }) => (
                                                    <FormItem className="space-y-0">
                                                        <FormControl>
                                                            <div className="relative w-[280px] h-[498px] rounded-xl overflow-hidden border border-white/10 bg-zinc-950 flex flex-col items-center justify-center group-hover:border-[#8B5CF6]/30 transition-colors">
                                                                {field.value && field.value !== "http://placeholder" ? (
                                                                    // eslint-disable-next-line @next/next/no-img-element
                                                                    <img src={String(field.value)} alt="UI Reference" className="w-full h-full object-cover" />
                                                                ) : (
                                                                    <>
                                                                        {uploadingIndex === index ? (
                                                                            <Loader2 className="w-6 h-6 text-[#8B5CF6] animate-spin mb-2" />
                                                                        ) : (
                                                                            <Feather className="w-6 h-6 text-zinc-600 mb-2" />
                                                                        )}
                                                                        <span className="text-xs text-zinc-500 font-medium px-4 text-center">
                                                                            {field.value === "http://placeholder" ? "未上传配图" : "上传UI配图"}
                                                                        </span>
                                                                    </>
                                                                )}
                                                                <input
                                                                    type="file"
                                                                    accept="image/*"
                                                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                                    onChange={(e) => handleImageUpload(e, index)}
                                                                    disabled={uploadingIndex !== null}
                                                                />
                                                            </div>
                                                        </FormControl>
                                                        <FormMessage className="text-[#EF4444] text-xs mt-2" />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>

                                        {/* Description Block */}
                                        <div className="flex-1 space-y-2 max-w-full">
                                            <FormField
                                                control={form.control}
                                                name={`clientUIPages.${index}.description`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-zinc-400 text-sm">页面说明 / 元素拆解 ({index + 1})</FormLabel>
                                                        <FormControl>
                                                            <Textarea
                                                                placeholder="请描述该界面中包含哪些重要节点以及它们的表现规则。例如：&#10;- 左侧显示模型（支持旋转）&#10;- 右侧显示【强化等级+1】，金币不足时按钮置灰。"
                                                                className="input-premium min-h-[466px] resize-none w-full text-zinc-200 placeholder:text-zinc-600 text-sm"
                                                                {...field}
                                                            />
                                                        </FormControl>
                                                        <FormMessage className="text-[#EF4444] text-xs" />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    </div>
                                ))}

                                <Button
                                    type="button"
                                    onClick={() => appendPage({ imagePath: "http://placeholder", description: "" })}
                                    className="w-full h-12 btn-secondary border-dashed border-[#8B5CF6]/30 text-[#8B5CF6]/80 hover:text-[#8B5CF6] hover:bg-[#8B5CF6]/10"
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    新增 UI 界面说明模块
                                </Button>
                                <p className="text-xs text-zinc-500 mt-2 text-center">可以为复杂的系统添加多个界面拆解（含弹窗、子级面板），每一屏对应一份说明。</p>
                            </div>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}
