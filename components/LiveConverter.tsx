"use client";

import { Copy, Delete, RefreshCw, XCircle, Check } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export default function LiveConverter({
  mode,
  options,
  swapMode,
}: {
  mode: "k2u" | "u2k";
  options: { stripBom: boolean; nfc: boolean; crlf: boolean; autoConvert: boolean };
  swapMode: () => void;
}) {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [warnings, setWarnings] = useState<string[]>([]);
  const [isRotated, setIsRotated] = useState(false);
  const [prevMode, setPrevMode] = useState(mode);

  const [copiedInput, setCopiedInput] = useState(false);
  const [copiedOutput, setCopiedOutput] = useState(false);

  if (mode !== prevMode) {
    setInput(output);
    setOutput(input);
    setPrevMode(mode);
  }

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const outputRef = useRef<HTMLTextAreaElement>(null);

  const isK2U = mode === "k2u";

  const convertText = async (text: string) => {
    if (!text) {
      setOutput("");
      setWarnings([]);
      return;
    }

    try {
      const res = await fetch("/api/convert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, mode, options }),
      });
      const data = await res.json();
      if (data.success) {
        setOutput(data.text);
        setWarnings(data.warnings);
      } else {
        setWarnings([data.error]);
      }
    } catch (e: any) {
      setWarnings([e.message]);
    }
  };

  useEffect(() => {
    if (!options.autoConvert) return;
    const timer = setTimeout(() => {
      convertText(input);
    }, 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [input, mode, options]);

  const clearLive = () => {
    setInput("");
    setOutput("");
    setWarnings([]);
  };

  const handleSwap = () => {
    setIsRotated(true);
    setTimeout(() => setIsRotated(false), 300);
    swapMode();
  };

  const copyToClipboard = async (text: string, isInput: boolean) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      if (isInput) {
        setCopiedInput(true);
        setTimeout(() => setCopiedInput(false), 2000);
      } else {
        setCopiedOutput(true);
        setTimeout(() => setCopiedOutput(false), 2000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="premium-card p-8 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: "var(--accent-light)", color: "var(--accent)" }}
          >
            <RefreshCw size={18} />
          </div>
          <div>
            <h2
              className="text-base font-semibold tracking-tight"
              style={{ fontFamily: "'SF Pro Display',Inter,sans-serif" }}
            >
              Live Converter
            </h2>
            <p className="text-xs text-[var(--text-muted)]">
              {isK2U
                ? "Type or paste Krutidev text for instant conversion"
                : "Type or paste Unicode Devanagari text for instant conversion"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="btn-icon" onClick={clearLive} title="Clear input and output text" aria-label="Clear input and output text">
             <Delete size={16} />
          </button>
        </div>
      </div>

      <div className="editor-grid grid grid-cols-1 md:grid-cols-2 gap-5 relative">
        {/* Input Area */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
              {isK2U ? "Krutidev 010" : "Unicode Devanagari"}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-[var(--text-muted)] font-mono">
                {input.length} chars
              </span>
              <button
                className="btn-icon"
                style={{ width: "28px", height: "28px" }}
                onClick={() => copyToClipboard(input, true)}
                title="Copy input"
                aria-label="Copy input text"
              >
                {copiedInput ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
              </button>
            </div>
          </div>
          <div className="editor-box">
            <textarea
              ref={inputRef}
              className="editor-textarea font-deva"
              placeholder={isK2U ? "Type or paste text here..." : "यहाँ यूनिकोड हिंदी टाइप करें..."}
              spellCheck="false"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              style={{ whiteSpace: "pre-wrap", overflowX: "auto" }}
            />
          </div>
        </div>

        {/* Swap Button */}
        <div className="hidden md:flex flex-col items-center absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-0">
          <button
            className={`swap-btn w-11 h-11 rounded-full flex items-center justify-center shadow-lg border border-[var(--border)] overflow-visible ${
              isRotated ? "rotated" : ""
            }`}
            style={{ background: "var(--bg-card-solid)", color: "var(--accent)" }}
            onClick={handleSwap}
            title="Swap conversion direction"
            aria-label="Swap conversion direction"
          >
            <RefreshCw size={18} />
          </button>
        </div>

        {/* Output Area */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
              {isK2U ? "Unicode Devanagari" : "Krutidev 010"}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-[var(--text-muted)] font-mono">
                {output.length} chars
              </span>
              <button
                className="btn-icon"
                style={{ width: "28px", height: "28px" }}
                onClick={() => copyToClipboard(output, false)}
                title="Copy output"
                aria-label="Copy output text"
              >
                {copiedOutput ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
              </button>
            </div>
          </div>
          <div className="editor-box">
            <textarea
              ref={outputRef}
              className="editor-textarea font-deva"
              readOnly
              placeholder="Converted output will appear here..."
              spellCheck="false"
              value={output}
              style={{ whiteSpace: "pre-wrap", overflowX: "auto" }}
            />
          </div>
        </div>
      </div>

      {warnings.length > 0 && (
        <div className="mt-4">
          {warnings.map((w, i) => (
            <div
              key={i}
              className="flex items-center gap-2 text-xs py-1"
              style={{ color: "var(--warning)" }}
            >
              <XCircle size={12} />
              <span>{w}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
