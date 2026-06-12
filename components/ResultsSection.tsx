"use client";

import { CheckCircle, AlertTriangle, XCircle, TerminalSquare, Download } from "lucide-react";
import { useState } from "react";
import JSZip from "jszip";
import { BatchResult } from "./BatchProcessor";

export default function ResultsSection({
  results,
  timeMs,
  mode,
}: {
  results: BatchResult[];
  timeMs: number;
  mode: "k2u" | "u2k";
}) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (results.length === 0) return null;

  const success = results.filter((r) => r.success).length;
  const warnings = results.filter((r) => r.warnings.length > 0 && r.success).length;
  const failed = results.filter((r) => !r.success).length;
  const activeResult = results[activeIndex];

  const downloadResults = async () => {
    const successful = results.filter((r) => r.success);
    if (successful.length === 0) return;

    try {
      const zip = new JSZip();
      const folder = zip.folder("converted");

      for (const r of successful) {
        const outName = r.name;
        folder!.file(outName, r.output);
      }

      const blob = await zip.generateAsync({
        type: "blob",
        compression: "DEFLATE",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;

      const now = new Date();
      const pad = (n: number) => String(n).padStart(2, "0");
      const ts = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(
        now.getDate()
      )}_${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(now.getSeconds())}`;
      a.download = `Converted_${mode.toUpperCase()}_${ts}.zip`;

      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 5000);
    } catch (err: any) {
      console.error(err);
    }
  };

  const renderPreviewLines = () => {
    if (!activeResult) return null;
    if (!activeResult.success) {
      return (
        <div style={{ color: "var(--error)", fontFamily: "var(--font-code)", fontSize: "13px" }}>
          Error: {activeResult.warnings[0] || "Unknown error"}
        </div>
      );
    }
    const lines = activeResult.output.split("\n").slice(0, 500);
    const maxLineNumWidth = String(Math.min(lines.length, 500)).length;

    return (
      <>
        {lines.map((line, i) => (
          <div key={i} style={{ display: "flex" }}>
            <span
              style={{
                color: "var(--muted-soft)",
                userSelect: "none",
                marginRight: "16px",
                textAlign: "right",
                fontFamily: "var(--font-code)",
                fontSize: "12px",
                minWidth: `${maxLineNumWidth + 1}ch`,
                lineHeight: "1.6",
              }}
            >
              {String(i + 1).padStart(maxLineNumWidth, " ")}
            </span>
            <span style={{ lineHeight: "1.6" }}>
              {line || "\u00A0"}
            </span>
          </div>
        ))}
        {activeResult.output.split("\n").length > 500 && (
          <div style={{ color: "var(--muted-soft)", fontStyle: "italic", marginTop: "8px", paddingTop: "8px", borderTop: "1px solid var(--surface-dark-elevated)" }}>
            ... {activeResult.output.split("\n").length - 500} more lines (download ZIP for full file)
          </div>
        )}
      </>
    );
  };

  return (
    <div className="animate-fade-in mt-10">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: "var(--primary-disabled)", color: "var(--primary)" }}
          >
            <TerminalSquare size={18} />
          </div>
          <div>
            <h2 className="title-md">
              Conversion Results
            </h2>
            <p className="body-sm text-[var(--muted)]">
              Preview and download converted files
            </p>
          </div>
        </div>
        <button className="button-secondary" onClick={downloadResults}>
          <Download size={16} />
          Download ZIP
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-5">
        <div className="stat-card">
          <div className="text-2xl font-bold code" style={{ color: "var(--ink)" }}>{results.length}</div>
          <div className="caption-uppercase text-[var(--muted)] mt-1 font-semibold">Total</div>
        </div>
        <div className="stat-card">
          <div className="text-2xl font-bold code" style={{ color: "var(--success)" }}>{success}</div>
          <div className="caption-uppercase text-[var(--muted)] mt-1 font-semibold">Success</div>
        </div>
        <div className="stat-card">
          <div className="text-2xl font-bold code" style={{ color: "var(--warning)" }}>{warnings}</div>
          <div className="caption-uppercase text-[var(--muted)] mt-1 font-semibold">Warnings</div>
        </div>
        <div className="stat-card">
          <div className="text-2xl font-bold code" style={{ color: "var(--error)" }}>{failed}</div>
          <div className="caption-uppercase text-[var(--muted)] mt-1 font-semibold">Failed</div>
        </div>
        <div className="stat-card">
          <div className="text-2xl font-bold code" style={{ color: "var(--primary)" }}>
            {timeMs < 1000 ? `${timeMs}ms` : `${(timeMs / 1000).toFixed(1)}s`}
          </div>
          <div className="caption-uppercase text-[var(--muted)] mt-1 font-semibold">Time</div>
        </div>
      </div>

      <div className="product-mockup-card-dark p-0 overflow-hidden border border-[var(--hairline)]" style={{ borderColor: 'transparent' }}>
        <div className="border-b border-[var(--surface-dark-elevated)] px-5 py-4 flex items-center gap-2" style={{ background: "rgba(255,255,255,0.02)" }}>
          <span className="code text-[var(--muted-soft)] text-xs">converted_files/</span>
        </div>
        <div className="flex flex-col md:flex-row min-h-[480px] max-h-[700px]">
          <div className="w-full md:w-[320px] border-b md:border-b-0 md:border-r border-[var(--surface-dark-elevated)] overflow-y-auto" style={{ background: "rgba(255,255,255,0.02)" }}>
            {results.map((r, i) => (
              <div
                key={i}
                className={`p-3.5 px-5 cursor-pointer flex items-center gap-3 text-sm border-l-2 transition-all ${i === activeIndex ? "bg-[var(--surface-dark-elevated)] border-[var(--primary)] text-[var(--primary)]" : "border-transparent text-[var(--muted-soft)] hover:bg-[rgba(255,255,255,0.04)] hover:text-[var(--on-dark)]"}`}
                style={{ animationDelay: `${i * 0.02}s` }}
                onClick={() => setActiveIndex(i)}
              >
                <span className="text-sm w-5 text-center shrink-0">
                  {r.success ? (r.warnings.length > 0 ? "⚠️" : "✅") : "❌"}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="truncate body-sm">{r.name}</div>
                  <div className="text-[10px] text-[var(--muted-soft)] font-mono">
                    {r.charCount.toLocaleString()} chars · {r.timeMs}ms
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex-1 flex flex-col overflow-hidden bg-[var(--surface-dark-soft)]">
            <div className="flex-1 overflow-auto p-6 text-[15px] leading-relaxed text-[#e8e8e8] whitespace-pre-wrap break-words font-deva">
              {renderPreviewLines()}
            </div>
            {activeResult && (
              <div className="border-t border-[var(--surface-dark-elevated)] p-3 px-5 text-xs text-[#8e8e93] flex gap-6 flex-wrap code bg-[rgba(255,255,255,0.02)]">
                <span style={{ color: "var(--on-dark)" }}>{activeResult.name}</span>
                <span>{activeResult.charCount.toLocaleString()} chars</span>
                <span>{activeResult.timeMs}ms</span>
                <span className={activeResult.warnings.length > 0 || !activeResult.success ? (activeResult.success ? "text-[var(--warning)]" : "text-[var(--error)]") : "text-[var(--success)]"}>
                  {activeResult.success ? "Converted" : "Failed"}
                  {activeResult.warnings.length > 0 ? ` · ${activeResult.warnings.length} warning(s)` : ""}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
