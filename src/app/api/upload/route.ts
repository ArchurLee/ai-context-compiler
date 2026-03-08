import { NextRequest, NextResponse } from "next/server";

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

        // Convert to base64 for Vercel Serverless environment
        const base64 = buffer.toString('base64');
        const mimeType = file.type || 'image/png';
        const dataUri = `data:${mimeType};base64,${base64}`;

        // Return the Data URI to the client
        return NextResponse.json({
            url: dataUri,
            success: true
        });
    } catch (error: any) {
        console.error("Error uploading file:", error);
        return NextResponse.json(
            { error: "Internal server error: " + error.message },
            { status: 500 }
        );
    }
}
