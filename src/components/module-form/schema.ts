import { z } from "zod";

export const requirementFormSchema = z.object({
    moduleName: z.string().min(2, "模块名称至少需要2个字符"),
    moduleCategory: z.enum(["功能", "活动"], {
        message: "请选择模块分类",
    }),
    functionOverview: z.string().min(5, "功能概述至少需要5个字符"),
    coreFeatures: z.string().min(5, "核心功能点至少需要5个字符"),

    // Client UI Display section
    clientEntrance: z.string().min(2, "入口描述至少需要2个字符"),
    clientUIPages: z.array(
        z.object({
            imagePath: z.string().min(1, "需上传图片"),
            description: z.string().min(2, "需稍微解释该界面的元素或状态"),
        })
    ),
    redDot: z.string().optional(),
});

export type RequirementFormData = z.infer<typeof requirementFormSchema>;
