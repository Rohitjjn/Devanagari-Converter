import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(req: NextRequest, { params }: { params: Promise<{ file: string }> }) {
  const { file } = await params;
  
  if (!file || file.includes("..")) return new NextResponse("Not Found", { status: 404 });
  
  const filePath = path.join(process.cwd(), "node_modules", "libarchive.js", "dist", file);
  
  try {
    const fileBuffer = fs.readFileSync(filePath);
    const contentType = file.endsWith(".wasm") ? "application/wasm" : "application/javascript";
    
    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": contentType,
      },
    });
  } catch (err) {
    return new NextResponse("Not Found", { status: 404 });
  }
}
