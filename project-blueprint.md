# Project Blueprint

## 1. System Architecture & Tech Stack
* **Framework:** Next.js ^15.4.9
* **Routing System:** Next.js App Router (using `app/page.tsx`, `app/layout.tsx`, and `app/api/convert/route.ts`).
* **UI Library:** React ^19.2.1 and React DOM ^19.2.1.
* **Build Tools & Bundlers:** Webpack (customized via `next.config.ts`), PostCSS (`postcss.config.mjs`), and Tailwind CSS v4.1.11 (via `@tailwindcss/postcss`).

## 2. Deep Design System & UI/UX
* **Styling Strategy:** Tailwind CSS v4 paired with extensive custom CSS variables in `app/globals.css`.
* **Color Palette:**
  * **Light Mode:**
    * Primary Background: `#F9F9F8`
    * Secondary Background: `#F2F1EF`
    * Tertiary Background: `#EBEAE8`
    * Card Background: `rgba(255, 255, 255, 0.8)` / Solid: `#FFFFFF`
    * Code Background: `rgba(10, 10, 10, 0.85)`
    * Primary Text: `#333333`
    * Secondary Text: `#5A5A55`
    * Muted Text: `#8A8A85`
    * Border: `#E0DFDD` (Hover: `#D0CFCD`)
    * Accent: `#D97757` (Light: `rgba(217, 119, 87, 0.1)`, Glow: `rgba(217, 119, 87, 0.2)`)
    * Success: `#34c759`
    * Error: `#ff3b30`
    * Warning: `#ff9500`
  * **Dark Mode:**
    * Primary Background: `#1C1B1A`
    * Secondary Background: `#262524`
    * Tertiary Background: `#363533`
    * Card Background: `rgba(43, 42, 40, 0.5)` / Solid: `#2B2A28`
    * Code Background: `#131211`
    * Primary Text: `#EBEAE8`
    * Secondary Text: `#B0AFA9`
    * Muted Text: `#8A8A85`
    * Border: `#403E3C` (Hover: `#5A5A55`)
    * Accent: `#D97757` (Light: `rgba(217, 119, 87, 0.15)`, Glow: `rgba(217, 119, 87, 0.3)`)
    * Success: `#30d158`
    * Error: `#ff453a`
    * Warning: `#ff9f0a`
* **Typography:**
  * UI Text: `'SF Pro Display'`, `'Inter'`, `sans-serif` (Weights: 400, 500, 600, 700).
  * Code/Monospace: `'SF Mono'`, `'JetBrains Mono'`, `monospace`.
* **Recurring UI Patterns:**
  * **Border Radius:** `12px` (icons), `14px` (buttons, chips), `20px` (cards, terminals).
  * **Shadows (Light Mode):** Sm: `0 1px 2px rgba(0,0,0,0.04)`, Regular: `0 8px 32px rgba(0,0,0,0.08)`, Lg: `0 20px 60px rgba(0,0,0,0.12)`, Card: `0 4px 24px rgba(0,0,0,0.06), inset 0 0 0 1px rgba(255,255,255,0.5)`, Card Hover: `0 12px 48px rgba(0,0,0,0.1), inset 0 0 0 1px rgba(255,255,255,0.6)`.
  * **Shadows (Dark Mode):** Sm: `0 1px 2px rgba(0,0,0,0.2)`, Regular: `0 8px 32px rgba(0,0,0,0.3)`, Lg: `0 20px 60px rgba(0,0,0,0.4)`, Card: `0 4px 24px rgba(0,0,0,0.15), inset 0 0 0 1px rgba(255,255,255,0.08)`, Card Hover: `0 12px 48px rgba(0,0,0,0.25), inset 0 0 0 1px rgba(255,255,255,0.12)`.
  * **Padding/Margins:** Standard `px-4`, `py-2`, `gap-2`, `gap-3`.
* **UI Component Strategy:** Custom reusable components live in `/components`. Standard utility class merging is handled via `cn` function (using `clsx` and `tailwind-merge`) in `lib/utils.ts`. No external UI component libraries like Shadcn or Radix are currently in use.

## 3. Data Flow & State Management
* **Local/Global State:** Managed purely via native React hooks (`useState`, `useEffect`, `useRef`). No complex global state management library (like Redux, Zustand, or Context API) is implemented.
* **Data Fetching:** Implemented via native `fetch` API directly interacting with the Next.js API routes (`/api/convert`).

## 4. Supabase & Authentication Strategy
* **Authentication Flow:** Not yet implemented.
* **Supabase Client Initialization:** Not yet implemented.
* **Session Management & Protection:** Not yet implemented.

## 5. File Structure & Mental Model
* **Tree-Map of Core Directories:**
  ```
  .
  ├── app/
  │   ├── api/
  │   │   └── convert/
  │   │       └── route.ts     # Server-side API endpoints
  │   ├── globals.css          # Global styles and CSS variables
  │   ├── layout.tsx           # Root layout component
  │   └── page.tsx             # Main entry point and page assembly
  ├── components/              # Reusable UI components
  │   ├── BatchProcessor.tsx
  │   ├── Header.tsx
  │   ├── LiveConverter.tsx
  │   └── ResultsSection.tsx
  ├── hooks/                   # Custom React hooks
  │   └── use-mobile.ts
  ├── lib/                     # Helper functions and utilities
  │   ├── k2u.ts               # Krutidev to Unicode logic
  │   ├── u2k.ts               # Unicode to Krutidev logic
  │   └── utils.ts             # General utilities (e.g., class merging)
  └── public/                  # Static assets (WASM, workers)
  ```
* **Logical Separation of Concerns:**
  * **API Calls:** Managed within Next.js API routes under `app/api/`.
  * **Helper Functions/Utils:** Isolated in the `lib/` directory ensuring core processing logic (`k2u.ts`, `u2k.ts`) is detached from the UI.
  * **UI Components:** Encapsulated in the `components/` directory.

## 6. Coding Standards & Conventions
* **Language:** TypeScript is strictly used across the codebase.
* **Types/Interfaces:** Defined inline within the components and functions that utilize them (e.g., `BatchResult` in `BatchProcessor.tsx`).
* **File Naming Conventions:**
  * **Components:** PascalCase (e.g., `Header.tsx`, `LiveConverter.tsx`).
  * **Hooks:** kebab-case (e.g., `use-mobile.ts`).
  * **Utilities/Helpers:** camelCase or lowercase (e.g., `utils.ts`, `k2u.ts`).
* **Error Handling:** Try-catch blocks are utilized in the API routes (`app/api/convert/route.ts`). In the UI, warnings and errors are captured in state arrays and mapped visually to the user.

## 7. Strict Deployment Constraints
> **WARNING FOR FUTURE AI AGENTS:**
> DEPLOYMENT TARGET: CLOUDFLARE. Edge runtime constraints apply. Absolutely NO usage of Node.js native modules (fs, path, crypto, etc.) in API routes or edge functions.
