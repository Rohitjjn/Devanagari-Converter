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
        const outName =
          r.name.replace(/\.txt$/i, "") +
          (mode === "k2u" ? "_unicode.txt" : "_krutidev.txt");
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
        <div style={{ color: "var(--error)", fontFamily: "'SF Mono', 'JetBrains Mono', monospace", fontSize: "13px" }}>
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
                color: "#636366",
                userSelect: "none",
                marginRight: "16px",
                textAlign: "right",
                fontFamily: "'SF Mono','JetBrains Mono',monospace",
                fontSize: "11px",
                minWidth: `${maxLineNumWidth + 1}ch`,
                lineHeight: "1.8",
              }}
            >
              {String(i + 1).padStart(maxLineNumWidth, " ")}
            </span>
            <span style={{ lineHeight: "1.8" }}>
              {line || "\u00A0"}
            </span>
          </div>
        ))}
        {activeResult.output.split("\n").length > 500 && (
          <div style={{ color: "#636366", fontStyle: "italic", marginTop: "8px", paddingTop: "8px", borderTop: "1px solid var(--border)" }}>
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
            style={{ background: "var(--accent-light)", color: "var(--accent)" }}
          >
            <TerminalSquare size={18} />
          </div>
          <div>
            <h2
              className="text-base font-semibold tracking-tight"
              style={{ fontFamily: "'SF Pro Display',Inter,sans-serif" }}
            >
              Conversion Results
            </h2>
            <p className="text-xs text-[var(--text-muted)]">
              Preview and download converted files
            </p>
          </div>
        </div>
        <button className="btn-secondary" onClick={downloadResults}>
          <Download size={16} />
          Download ZIP
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-5">
        <div className="stat-card">
          <div className="text-2xl font-bold font-mono" style={{ color: "var(--text-primary)" }}>{results.length}</div>
          <div className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] mt-1 font-semibold">Total</div>
        </div>
        <div className="stat-card">
          <div className="text-2xl font-bold font-mono" style={{ color: "var(--success)" }}>{success}</div>
          <div className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] mt-1 font-semibold">Success</div>
        </div>
        <div className="stat-card">
          <div className="text-2xl font-bold font-mono" style={{ color: "var(--warning)" }}>{warnings}</div>
          <div className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] mt-1 font-semibold">Warnings</div>
        </div>
        <div className="stat-card">
          <div className="text-2xl font-bold font-mono" style={{ color: "var(--error)" }}>{failed}</div>
          <div className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] mt-1 font-semibold">Failed</div>
        </div>
        <div className="stat-card">
          <div className="text-2xl font-bold font-mono" style={{ color: "var(--accent)" }}>
            {timeMs < 1000 ? `${timeMs}ms` : `${(timeMs / 1000).toFixed(1)}s`}
          </div>
          <div className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] mt-1 font-semibold">Time</div>
        </div>
      </div>

      <div className="terminal">
        <div className="terminal-header">
          <div className="terminal-dot" style={{ background: "#ff5f56" }}></div>
          <div className="terminal-dot" style={{ background: "#ffbd2e" }}></div>
          <div className="terminal-dot" style={{ background: "#27c93f" }}></div>
          <span className="text-xs text-[var(--text-muted)] font-mono ml-2">converted_files/</span>
        </div>
        <div className="terminal-body">
          <div className="file-tree">
            {results.map((r, i) => (
              <div
                key={i}
                className={`file-tree-item batch-animate ${i === activeIndex ? "active" : ""}`}
                style={{ animationDelay: `${i * 0.02}s` }}
                onClick={() => setActiveIndex(i)}
              >
                <span className="status-icon">
                  {r.success ? (r.warnings.length > 0 ? "⚠️" : "✅") : "❌"}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="truncate text-sm">{r.name}</div>
                  <div className="text-[10px] text-[var(--text-muted)]">
                    {r.charCount.toLocaleString()} chars · {r.timeMs}ms
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="preview-pane">
            <div className="preview-content font-deva">
              {renderPreviewLines()}
            </div>
            {activeResult && (
              <div className="preview-statusbar font-mono">
                <span style={{ color: "#e8e8e8" }}>{activeResult.name}</span>
                <span style={{ color: "#8e8e93" }}>{activeResult.charCount.toLocaleString()} chars</span>
                <span style={{ color: "#8e8e93" }}>{activeResult.timeMs}ms</span>
                <span className={activeResult.warnings.length > 0 || !activeResult.success ? (activeResult.success ? "text-yellow-500" : "text-red-500") : "text-green-500"}>
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
