"use client";

import { FileType, Trash, Download, Loader2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import JSZip from "jszip";
import { Archive } from "libarchive.js";
import { processTextK2U } from "@/lib/k2u";
import { processTextU2K } from "@/lib/u2k";

// Initialize libarchive.js worker
Archive.init({
    workerUrl: "/worker-bundle.js",
});

function autoDecodeBuffer(buffer: ArrayBuffer | Uint8Array, fallbackEncoding: "utf-8" | "windows-1252" = "utf-8"): string {
  const bytes = new Uint8Array(buffer);
  
  if (bytes.length >= 3 && bytes[0] === 0xEF && bytes[1] === 0xBB && bytes[2] === 0xBF) {
    return new TextDecoder("utf-8").decode(bytes); 
  }
  if (bytes.length >= 2 && bytes[0] === 0xFF && bytes[1] === 0xFE) {
    return new TextDecoder("utf-16le").decode(bytes);
  }
  if (bytes.length >= 2 && bytes[0] === 0xFE && bytes[1] === 0xFF) {
    return new TextDecoder("utf-16be").decode(bytes);
  }
  
  let nullsInOdds = 0;
  let nullsInEvens = 0;
  let devanagariInOdds = 0;
  let devanagariInEvens = 0;
  let utf8DevanagariCount = 0;

  const checkLen = Math.min(bytes.length, 5000);
  for (let i = 0; i < checkLen; i += 2) {
    if (bytes[i] === 0) nullsInEvens++;
    if (i + 1 < checkLen && bytes[i + 1] === 0) nullsInOdds++;
    if (bytes[i] === 0x09) devanagariInEvens++;
    if (i + 1 < checkLen && bytes[i + 1] === 0x09) devanagariInOdds++;
  }
  
  for(let i = 0; i < checkLen - 2; i++) {
    if (bytes[i] === 0xE0 && (bytes[i+1] === 0xA4 || bytes[i+1] === 0xA5)) {
      if (bytes[i+2] >= 0x80 && bytes[i+2] <= 0xBF) {
        utf8DevanagariCount++;
      }
    }
  }

  if ((nullsInOdds + devanagariInOdds) > checkLen / 4 && (nullsInOdds + devanagariInOdds) > (nullsInEvens + devanagariInEvens) * 2) {
    return new TextDecoder("utf-16le").decode(bytes);
  }
  if ((nullsInEvens + devanagariInEvens) > checkLen / 4 && (nullsInEvens + devanagariInEvens) > (nullsInOdds + devanagariInOdds) * 2) {
    return new TextDecoder("utf-16be").decode(bytes);
  }

  if (utf8DevanagariCount > 2) {
    return new TextDecoder("utf-8").decode(bytes);
  }

  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch (e) {
    return new TextDecoder(fallbackEncoding).decode(bytes);
  }
}

export interface BatchResult {
  name: string;
  output: string;
  warnings: string[];
  success: boolean;
  charCount: number;
  timeMs: number;
}

export default function BatchProcessor({
  mode,
  options,
  onResults,
}: {
  mode: "k2u" | "u2k";
  options: { stripBom: boolean; nfc: boolean; crlf: boolean; autoConvert: boolean };
  onResults: (res: BatchResult[], timeMs: number) => void;
}) {
  const [files, setFiles] = useState<{ name: string; text: string; size: number }[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionError, setExtractionError] = useState("");
  const [progress, setProgress] = useState(0);
  const [currentFileName, setCurrentFileName] = useState("");
  const [logs, setLogs] = useState<{ time: string; msg: string; type: string }[]>([]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addLog = (msg: string, type = "info") => {
    const now = new Date();
    const time = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`;
    setLogs((prev) => [...prev, { time, msg, type }]);
  };

  const extractFile = async (file: File) => {
    const name = file.name.toLowerCase();
    const entries: { name: string; text: string; size: number }[] = [];

    try {
      if (name.endsWith(".zip")) {
        const buffer = await file.arrayBuffer();
        const zip = await JSZip.loadAsync(buffer);
        for (const [path, entry] of Object.entries(zip.files)) {
          if (!entry.dir && path.match(/\.(txt|csv|md|json|xml|html|htm|srt|vtt|rtf|log|tsv|js|css)$/i)) {
            const buf = await entry.async("uint8array");
            const text = autoDecodeBuffer(buf, mode === "k2u" ? "windows-1252" : "utf-8");
            entries.push({ name: path, text, size: text.length });
          }
        }
      } else if (
        [".7z", ".rar", ".tar", ".gz", ".bz2", ".xz", ".tgz", ".tar.gz", ".tar.bz2", ".tar.xz"].some((ext) => name.endsWith(ext))
      ) {
         try {
           const archive = await Archive.open(file);
           let extractCount = 0;
           
           // Wrap extractFiles in a Promise with a timeout
           const extractPromise = archive.extractFiles((entry: any) => {
             extractCount++;
             if (extractCount % 5 === 0) {
               setCurrentFileName(`Extracting: found ${extractCount} objects in ${file.name}...`);
             }
           });
           
           const timeoutPromise = new Promise((_, reject) => {
             setTimeout(() => reject(new Error("Extraction timed out. If this is a modern RAR (RAR5) file, it might not be supported. Please upload as a ZIP file instead.")), 15000);
           });
           
           const extracted = await Promise.race([extractPromise, timeoutPromise]);
           
           const processExtracted = async (obj: any, pathPrefix = "") => {
             for (const [key, val] of Object.entries(obj)) {
               const currentPath = pathPrefix ? `${pathPrefix}/${key}` : key;
               if (!val) continue;
               
               // Check if it's a file-like object using duck typing
               if (typeof val === "object" && val !== null && "size" in val) {
                 if (currentPath.match(/\.(txt|csv|md|json|xml|html|htm|srt|vtt|rtf|log|tsv|js|css)$/i)) {
                   let text = "";
                   let buf: ArrayBuffer | Uint8Array;
                   
                   try {
                     if ((val as any).arrayBuffer && typeof (val as any).arrayBuffer === "function") {
                       buf = await (val as any).arrayBuffer();
                     } else if ((val as any).fileData) {
                       buf = (val as any).fileData;
                     } else {
                       throw new Error("Cannot read file buffer");
                     }

                     // For Krutidev to Unicode, the source text is Krutidev (ANSI/Windows-1252).
                     text = autoDecodeBuffer(buf, mode === "k2u" ? "windows-1252" : "utf-8");
                   } catch(readErr) {
                       console.error("Fallback to basic text(): ", readErr);
                       if (typeof (val as any).text === "function") {
                          text = await (val as any).text();
                       }
                   }
                   entries.push({ name: currentPath, text, size: text.length });
                 }
               } else if (typeof val === "object") {
                 // It's a directory
                 await processExtracted(val, currentPath);
               }
             }
           };
           
           await processExtracted(extracted);
         } catch (e: any) {
           throw new Error(`Archive extraction failed: ${e.message}`);
         }
      } else if (name.match(/\.(txt|csv|md|json|xml|html|htm|srt|vtt|rtf|log|tsv|js|css)$/i)) {
        const reader = new FileReader();
        const text = await new Promise<string>((resolve, reject) => {
          reader.onload = () => resolve(autoDecodeBuffer(reader.result as ArrayBuffer, mode === "k2u" ? "windows-1252" : "utf-8"));
          reader.onerror = () => reject(new Error("Failed to read file"));
          reader.readAsArrayBuffer(file);
        });
        entries.push({ name: file.name, text, size: text.length });
      }
    } catch (err: any) {
       addLog(`${file.name}: ${err.message}`, "error");
    }

    return entries;
  };

  const handleFiles = async (fileList: FileList | File[]) => {
    setIsExtracting(true);
    setExtractionError("");
    let added = 0;
    const newFiles = [...files];
    try {
      for (const file of Array.from(fileList)) {
        const extracted = await extractFile(file);
        for (const entry of extracted) {
           newFiles.push(entry);
           added++;
        }
      }
      setFiles(newFiles);
      if (added > 0) {
        addLog(`Added ${added} file(s)`, "success");
      } else {
        setExtractionError("No valid text/csv/xml files found in the selected files.");
      }
    } catch (e: any) {
      setExtractionError(e.message || "Unknown error during extraction.");
    } finally {
      setIsExtracting(false);
    }
  };

  const removeFile = (idx: number) => {
    setFiles(files.filter((_, i) => i !== idx));
  };

  const clearFiles = () => {
    setFiles([]);
    setLogs([]);
    onResults([], 0); // clear results
  };

  const processFileClient = (text: string) => {
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

    const t0 = performance.now();
    let result;
    if (mode === "k2u") {
      result = processTextK2U(processedText);
    } else {
      result = processTextU2K(processedText);
    }
    const timeMs = performance.now() - t0;
    return {
      text: result.text,
      warnings: [...preWarnings, ...(result.warnings || [])],
      charCount: result.charCount,
      timeMs
    };
  };

  const startBatch = async () => {
    if (isProcessing || files.length === 0) return;
    setIsProcessing(true);
    setLogs([]);
    addLog(`Starting batch conversion of ${files.length} file(s)...`, "info");

    const t0 = performance.now();
    let completed = 0;
    const batchResults: BatchResult[] = [];

    // Client-side execution chunking to avoid freezing the UI
    const CHUNK_SIZE = 1;

    for (let i = 0; i < files.length; i += CHUNK_SIZE) {
      const chunk = files.slice(i, i + CHUNK_SIZE);
      
      setCurrentFileName(`⏳ Processing ${i + 1} - ${Math.min(i + CHUNK_SIZE, files.length)} of ${files.length}...`);
      
      // Let React render the progress update
      await new Promise((r) => setTimeout(r, 0));

      for (const file of chunk) {
        try {
          const data = processFileClient(file.text);
          batchResults.push({
            name: file.name,
            output: data.text,
            warnings: data.warnings,
            success: true,
            charCount: data.charCount,
            timeMs: data.timeMs,
          });
          addLog(`Converted: ${file.name}`, "success");
        } catch (err: any) {
          batchResults.push({
            name: file.name,
            output: "",
            warnings: [err.message],
            success: false,
            charCount: file.text.length,
            timeMs: 0,
          });
          addLog(`Failed: ${file.name} — ${err.message}`, "error");
        }
      }

      completed += chunk.length;
      setProgress((completed / files.length) * 100);
    }

    const totalTimeMs = Math.round(performance.now() - t0);
    setIsProcessing(false);
    setCurrentFileName("Done");
    addLog(`Batch complete in ${(totalTimeMs / 1000).toFixed(1)}s`, "info");
    onResults(batchResults, totalTimeMs);
  };

  return (
    <div className="animate-fade-in" style={{ animationDelay: "0.08s" }}>
      <div className="premium-card p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: "var(--accent-light)", color: "var(--accent)" }}
            >
              <FileType size={18} />
            </div>
            <div>
              <h2
                className="text-base font-semibold tracking-tight"
                style={{ fontFamily: "'SF Pro Display',Inter,sans-serif" }}
              >
                Batch Processing
              </h2>
              <p className="text-xs text-[var(--text-muted)]">
                Drop archives or text files for bulk conversion
              </p>
            </div>
          </div>
        </div>

        <div
          className={`drop-zone cursor-pointer ${isExtracting ? 'opacity-50 pointer-events-none' : ''}`}
          tabIndex={0}
          role="button"
          aria-label="Upload files: Drag and drop or press Enter to select"
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              fileInputRef.current?.click();
            }
          }}
          onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add("drag-over"); }}
          onDragLeave={(e) => { e.preventDefault(); e.currentTarget.classList.remove("drag-over"); }}
          onDrop={(e) => {
            e.preventDefault();
            e.currentTarget.classList.remove("drag-over");
            handleFiles(e.dataTransfer.files);
          }}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="relative z-10">
            <div
              className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center"
              style={{ background: "var(--accent-light)", color: "var(--accent)" }}
            >
              {isExtracting ? <Loader2 size={28} className="animate-spin" /> : <FileType size={28} />}
            </div>
            <p className="text-sm font-semibold mb-1" style={{ color: "var(--text-primary)" }}>
              {isExtracting ? "Extracting files..." : "Drop files here to convert"}
            </p>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              Supports .txt, .csv, .json, .md, .html, .xml and archives (.zip, .rar, .7z, .tar, .gz) — ZIP is highly recommended for best performance.
            </p>
            <div className="flex flex-wrap justify-center gap-2 mt-4">
              {['TEXT', 'CSV', 'JSON', 'ARCHIVE'].map(ext => (
                 <span key={ext} className="px-2.5 py-1 rounded-lg text-[10px] font-semibold border border-[var(--border)] text-[var(--text-muted)]">
                   {ext}
                 </span>
              ))}
            </div>
            {extractionError && (
              <div className="mt-4 text-xs font-semibold" style={{ color: "var(--error)" }}>
                {extractionError}
              </div>
            )}
          </div>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            multiple
            accept=".txt,.csv,.md,.json,.xml,.html,.htm,.srt,.vtt,.rtf,.log,.tsv,.js,.css,.zip,.rar,.7z,.tar,.gz,.bz2,.xz,.tgz,application/vnd.rar,application/x-rar-compressed,application/x-7z-compressed,application/zip,application/x-tar,application/gzip,application/x-bzip2,application/x-xz,text/*"
            onChange={(e) => {
              if (e.target.files) {
                 handleFiles(e.target.files);
                 e.target.value = '';
              }
            }}
          />
        </div>

        {files.length > 0 && (
          <div className="mt-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                Selected Files (<span>{files.length}</span>)
              </span>
              <button
                className="text-xs text-[var(--text-muted)] hover:text-[var(--error)] transition-colors flex items-center gap-1 font-medium"
                onClick={clearFiles}
                aria-label="Clear all selected files"
              >
                <Trash size={12} />
                Clear all
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {files.map((file, idx) => (
                <div key={idx} className="file-chip">
                  <span>📄</span>
                  <span className="truncate max-w-[200px] text-sm">{file.name}</span>
                  <span className="text-[10px] text-[var(--text-muted)]">
                    {(file.size / 1024).toFixed(1)} KB
                  </span>
                  <button
                    className="ml-1 text-[var(--text-muted)] hover:text-[var(--error)] transition-colors"
                    onClick={() => removeFile(idx)}
                    aria-label={`Remove file ${file.name}`}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-3 mt-5">
              <button className="btn-primary" onClick={startBatch} disabled={isProcessing || files.length === 0}>
                {isProcessing ? <Loader2 size={16} className="animate-spin" /> : <FileType size={16} />}
                {isProcessing ? "Converting..." : "Convert All"}
              </button>
            </div>
          </div>
        )}
      </div>

       {isProcessing && (
        <div className="premium-card p-8 mt-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-3 h-3 rounded-full" style={{ background: "var(--accent)" }}></div>
                <div className="pulse-ring" style={{ background: "var(--accent)" }}></div>
              </div>
              <span
                className="text-sm font-semibold"
                style={{ fontFamily: "'SF Pro Display',Inter,sans-serif" }}
              >
                Converting batch...
              </span>
            </div>
            <span className="text-xs font-mono text-[var(--text-muted)]">
              {Math.round(progress)}%
            </span>
          </div>
          <div className="progress-track mb-4">
            <div className="progress-fill" style={{ width: `${progress}%` }}></div>
          </div>
          <div className="text-xs text-[var(--text-muted)] mb-4 font-mono">{currentFileName}</div>
          <div className="status-log">
             {logs.map((log, i) => (
               <div key={i} className="log-entry">
                  <span className="log-time">{log.time}</span>
                  <span className={`log-msg ${log.type === 'error' ? 'text-red-500' : log.type === 'success' ? 'text-green-500' : 'text-gray-500'}`}>
                    {log.msg}
                  </span>
               </div>
             ))}
          </div>
        </div>
      )}
    </div>
  );
}
