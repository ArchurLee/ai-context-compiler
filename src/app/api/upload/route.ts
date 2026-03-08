import { NextRequest, NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid"; // Will need to install uuid

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json(
                { error: "No file uploaded" },
                { status: 400 }
            );
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Create unique filename
        const originalExt = path.extname(file.name);
        const filename = `${uuidv4()}${originalExt}`;

        // Path where it will be saved
        const uploadDir = path.join(process.cwd(), "public", "uploads");
        const filepath = path.join(uploadDir, filename);

        // Write file
        await writeFile(filepath, buffer);

        // Return relative URL for the client
        return NextResponse.json({
            url: `/uploads/${filename}`,
            success: true
        });
    } catch (error) {
        console.error("Error uploading file:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
