"use client";

import { useEffect, useState } from "react";

export default function Header({
  mode,
  setMode,
}: {
  mode: "k2u" | "u2k";
  setMode: (mode: "k2u" | "u2k") => void;
}) {
  const isK2U = mode === "k2u";

  return (
    <header className="sticky top-0 z-50 top-nav border-b border-[var(--hairline)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-full flex items-center justify-between w-full">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-[var(--on-primary)] font-bold text-sm"
            style={{ background: "var(--ink)" }}
          >
            {/* The signature Anthropic spike-mark as an inline SVG substitute */}
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <div className="hidden sm:block">
            <h1 className="title-md tracking-tight leading-none text-[var(--ink)]">
              Devanagari Converter
            </h1>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-2">
          <button
            onClick={() => setMode("k2u")}
            className={isK2U ? "category-tab-active" : "category-tab"}
          >
            Krutidev → Unicode
          </button>
          <button
            onClick={() => setMode("u2k")}
            className={!isK2U ? "category-tab-active" : "category-tab"}
          >
            Unicode → Krutidev
          </button>
        </div>
      </div>

      <div className="md:hidden border-t border-[var(--hairline)] px-4 py-2 flex items-center gap-2 absolute top-[64px] left-0 w-full bg-[var(--canvas)]">
        <button
           onClick={() => setMode("k2u")}
          className={`flex-1 text-center ${isK2U ? "category-tab-active" : "category-tab"}`}
        >
          Krutidev → Unicode
        </button>
        <button
           onClick={() => setMode("u2k")}
          className={`flex-1 text-center ${!isK2U ? "category-tab-active" : "category-tab"}`}
        >
          Unicode → Krutidev
        </button>
      </div>
    </header>
  );
}
