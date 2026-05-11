"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export default function Header({
  mode,
  setMode,
}: {
  mode: "k2u" | "u2k";
  setMode: (mode: "k2u" | "u2k") => void;
}) {
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    const initialTheme = savedTheme || (prefersDark ? "dark" : "light");
    if (initialTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTheme(initialTheme);
  }, []);

  const toggleTheme = () => {
    const html = document.documentElement;
    if (html.classList.contains("dark")) {
      html.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setTheme("light");
    } else {
      html.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setTheme("dark");
    }
  };

  const isK2U = mode === "k2u";

  return (
    <header className="sticky top-0 z-50 glass-header">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm"
            style={{ background: "var(--accent)" }}
          >
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
            <h1
              className="font-semibold text-base tracking-tight leading-none"
              style={{ fontFamily: "'SF Pro Display',Inter,sans-serif" }}
            >
              Devanagari Converter
            </h1>
            <p className="text-[11px] text-[var(--text-muted)] mt-0.5 tracking-wide">
              KRUTIDEV ↔ UNICODE
            </p>
          </div>
        </div>

        <div className="hidden md:block">
          <div className="mode-toggle">
            <div
              className={`slider absolute top-[4px] bottom-[4px] w-[50%] bg-[var(--accent)] rounded-full transition-transform duration-200 ${
                isK2U ? "translate-x-0" : "translate-x-full"
              }`}
              style={{ width: "calc(50% - 4px)" }}
            />
            <button
              onClick={() => setMode("k2u")}
              className={`flex-1 ${isK2U ? "text-white" : "text-[var(--text-secondary)]"}`}
            >
              Krutidev → Unicode
            </button>
            <button
              onClick={() => setMode("u2k")}
              className={`flex-1 ${!isK2U ? "text-white" : "text-[var(--text-secondary)]"}`}
            >
              Unicode → Krutidev
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            className="btn-icon"
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            {theme === "light" ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </div>

      <div className="md:hidden border-t border-[var(--border)] px-4 py-2">
        <div className="mode-toggle w-full flex relative">
          <div
            className={`slider absolute top-[4px] bottom-[4px] w-[50%] bg-[var(--accent)] rounded-full transition-transform duration-200 ${
              isK2U ? "translate-x-0" : "translate-x-full"
            }`}
             style={{ width: "calc(50% - 4px)" }}
          />
          <button
             onClick={() => setMode("k2u")}
            className={`flex-1 z-10 ${isK2U ? "text-white" : "text-[var(--text-secondary)]"}`}
          >
            Krutidev → Unicode
          </button>
          <button
             onClick={() => setMode("u2k")}
            className={`flex-1 z-10 ${!isK2U ? "text-white" : "text-[var(--text-secondary)]"}`}
          >
            Unicode → Krutidev
          </button>
        </div>
      </div>
    </header>
  );
}
