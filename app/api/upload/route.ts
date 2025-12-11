import { NextResponse } from "next/server";
import path from "path";
import { writeFile } from "fs/promises";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No files received." }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const filename = Date.now() + "_" + file.name.replaceAll(" ", "_");
    const relativePath = `/uploads/${filename}`;
    const filePath = path.join(process.cwd(), "public", "uploads", filename);

    await writeFile(filePath, buffer);

    return NextResponse.json({ 
        url: relativePath,
        success: 1 
    });
  } catch (error) {
    console.error("Error occurred ", error);
    return NextResponse.json({ error: "Failed to upload file." }, { status: 500 });
  }
}
