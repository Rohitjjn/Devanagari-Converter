import { NextRequest, NextResponse } from "next/server";
import { processTextK2U } from "@/lib/k2u";
import { processTextU2K } from "@/lib/u2k";

export async function POST(req: NextRequest) {
  try {
    const { text, mode, options } = await req.json();

    if (typeof text !== "string" || !["k2u", "u2k"].includes(mode)) {
      return NextResponse.json(
        { error: "Invalid request payload" },
        { status: 400 }
      );
    }

    let processedText = text;
    const preWarnings: string[] = [];

    if (options?.stripBom && processedText.charCodeAt(0) === 0xfeff) {
      processedText = processedText.slice(1);
      preWarnings.push("Stripped UTF-8 BOM");
    }
    if (options?.nfc) {
      processedText = processedText.normalize("NFC");
    }
    if (options?.crlf) {
      processedText = processedText.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
    }

    const t0 = Date.now();
    let result;

    if (mode === "k2u") {
      result = processTextK2U(processedText);
    } else {
      result = processTextU2K(processedText);
    }
    const timeMs = Date.now() - t0;

    return NextResponse.json({
      success: true,
      text: result.text,
      warnings: [...preWarnings, ...(result.warnings || [])],
      charCount: result.charCount,
      timeMs,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
