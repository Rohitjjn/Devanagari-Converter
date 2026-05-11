"use client";

import { FileType, Trash, Download, Loader2 } from "lucide-react";
import { useState, useRef } from "react";
import JSZip from "jszip";

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
          if (!entry.dir && path.toLowerCase().endsWith(".txt")) {
            const text = await entry.async("string");
            entries.push({ name: path, text, size: text.length });
          }
        }
      } else if (
        [".7z", ".rar", ".tar", ".gz", ".bz2", ".xz", ".tgz", ".tar.gz", ".tar.bz2", ".tar.xz"].some((ext) => name.endsWith(ext))
      ) {
         // Fallback if libarchive is set up, else ignore/error.
         // In Next.js we use the global archiveLib if loaded in layout.
         // Assume we might just error if it's not loaded cleanly.
         // For simplicity and 100% adherence to pure Next.js without worker setup mess:
         throw new Error("Only .zip and .txt are fully supported in this environment without custom web worker setup.");
      } else if (name.endsWith(".txt")) {
        const reader = new FileReader();
        const text = await new Promise<string>((resolve, reject) => {
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = () => reject(new Error("Failed to read file"));
          reader.readAsText(file, "UTF-8");
        });
        entries.push({ name: file.name, text, size: text.length });
      }
    } catch (err: any) {
       addLog(`${file.name}: ${err.message}`, "error");
    }

    return entries;
  };

  const handleFiles = async (fileList: FileList | File[]) => {
    let added = 0;
    const newFiles = [...files];
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

  const startBatch = async () => {
    if (isProcessing || files.length === 0) return;
    setIsProcessing(true);
    setLogs([]);
    addLog(`Starting batch conversion of ${files.length} file(s)...`, "info");

    const t0 = performance.now();
    let completed = 0;
    const batchResults: BatchResult[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setCurrentFileName(`⏳ ${file.name}`);
      addLog(`Processing: ${file.name}`, "info");

      try {
        const res = await fetch("/api/convert", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: file.text, mode, options }),
        });
        const data = await res.json();
        
        if (data.success) {
          batchResults.push({
            name: file.name,
            output: data.text,
            warnings: data.warnings,
            success: true,
            charCount: data.charCount,
            timeMs: data.timeMs,
          });
          addLog(`Converted: ${file.name}`, "success");
        } else {
          throw new Error(data.error);
        }
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

      completed++;
      setProgress((completed / files.length) * 100);
      
      // small delay to let UI update
      await new Promise((r) => setTimeout(r, 10));
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
          className="drop-zone cursor-pointer"
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
              <FileType size={28} />
            </div>
            <p className="text-sm font-semibold mb-1" style={{ color: "var(--text-primary)" }}>
              Drop files here to convert
            </p>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              Supports .txt, .zip
            </p>
            <div className="flex flex-wrap justify-center gap-2 mt-4">
              {['TXT', 'ZIP'].map(ext => (
                 <span key={ext} className="px-2.5 py-1 rounded-lg text-[10px] font-semibold border border-[var(--border)] text-[var(--text-muted)]">
                   {ext}
                 </span>
              ))}
            </div>
          </div>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            multiple
            accept=".txt,.zip"
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
