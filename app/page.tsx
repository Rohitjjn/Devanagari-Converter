"use client";

import { useState } from "react";
import Header from "@/components/Header";
import LiveConverter from "@/components/LiveConverter";
import BatchProcessor, { BatchResult } from "@/components/BatchProcessor";
import ResultsSection from "@/components/ResultsSection";
import { Info } from "lucide-react";

export default function Page() {
  const [mode, setMode] = useState<"k2u" | "u2k">("k2u");
  const [options, setOptions] = useState({
    stripBom: true,
    nfc: true,
    crlf: true,
    autoConvert: true,
  });

  const [batchResults, setBatchResults] = useState<BatchResult[]>([]);
  const [batchTimeMs, setBatchTimeMs] = useState(0);

  const swapMode = () => {
    setMode((m) => (m === "k2u" ? "u2k" : "k2u"));
  };

  const handleModeChange = (newMode: "k2u" | "u2k") => {
    setMode(newMode);
    setBatchResults([]);
  };

  const handleResults = (res: BatchResult[], timeMs: number) => {
    setBatchResults(res);
    setBatchTimeMs(timeMs);
  };

  return (
    <>
      <Header mode={mode} setMode={handleModeChange} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-10">
        <section>
          <LiveConverter mode={mode} options={options} swapMode={swapMode} />
        </section>

        <section className="animate-fade-in" style={{ animationDelay: "0.04s" }}>
          <div className="feature-card">
            <div className="flex flex-wrap items-center gap-6">
              <span className="caption-uppercase text-[var(--muted)]">
                Settings
              </span>
              <label className="flex items-center gap-3 cursor-pointer text-sm text-[var(--muted)] hover:text-[var(--ink)] transition-colors">
                <input
                  type="checkbox"
                  className="toggle-switch"
                  checked={options.stripBom}
                  onChange={(e) => setOptions({ ...options, stripBom: e.target.checked })}
                />
                <span className="body-sm font-medium">Strip BOM</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer text-sm text-[var(--muted)] hover:text-[var(--ink)] transition-colors">
                <input
                  type="checkbox"
                  className="toggle-switch"
                  checked={options.nfc}
                  onChange={(e) => setOptions({ ...options, nfc: e.target.checked })}
                />
                <span className="body-sm font-medium">NFC Normalize</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer text-sm text-[var(--muted)] hover:text-[var(--ink)] transition-colors">
                <input
                  type="checkbox"
                  className="toggle-switch"
                  checked={options.crlf}
                  onChange={(e) => setOptions({ ...options, crlf: e.target.checked })}
                />
                <span className="body-sm font-medium">CRLF → LF</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer text-sm text-[var(--muted)] hover:text-[var(--ink)] transition-colors">
                <input
                  type="checkbox"
                  className="toggle-switch"
                  checked={options.autoConvert}
                  onChange={(e) => setOptions({ ...options, autoConvert: e.target.checked })}
                />
                <span className="body-sm font-medium">Auto-convert</span>
              </label>
            </div>
          </div>
        </section>

        <section>
          <BatchProcessor mode={mode} options={options} onResults={handleResults} />
        </section>

        {batchResults.length > 0 && (
          <section>
            <ResultsSection results={batchResults} timeMs={batchTimeMs} mode={mode} />
          </section>
        )}

        <section className="animate-fade-in" style={{ animationDelay: "0.1s" }}>
          <div className="feature-card flex items-start gap-4" style={{ backgroundColor: 'var(--surface-soft)' }}>
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: "var(--primary-disabled)", color: "var(--primary)" }}
            >
              <Info size={20} />
            </div>
            <div>
              <p className="title-sm" style={{ color: "var(--primary)" }}>
                Font Requirement
              </p>
              <p className="body-sm mt-1.5 leading-relaxed" style={{ color: "var(--muted)" }}>
                Krutidev 010 output requires the Krutidev 010 font installed to display correctly. Without it, text appears as garbled ASCII. Unicode output uses standard Devanagari fonts.
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="body-sm">
            <span className="font-semibold text-[var(--on-dark)]">Devanagari Converter</span> — Forensically accurate batch conversion
          </div>
        </div>
      </footer>
    </>
  );
}
