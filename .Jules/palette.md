## Palette's UX Journal

## 2026-05-12 - [Accessible Custom Drop Zones & Icon Button Context]
**Learning:** 
Custom `div` based drag-and-drop zones frequently lack basic keyboard accessibility (`tabIndex` and `onKeyDown` for Space/Enter mapping) and ARIA semantics (`role="button"`, `aria-label`). Users relying on keyboards or screen readers are completely blocked from file uploads using these zones if they aren't explicitly mapped. Additionally, icon-only action buttons (like Copy/Swap/Trash) lose context without `aria-label`s. Another powerful micro-interaction is swapping the generic "Copy" icon out for a "Check" icon transiently on copy success to offer explicit user feedback without needing an overlapping floating toast component. 

**Action:** 
- Whenever encountering a `div onClick={() => ref.current?.click()}` for file uploads, immediately ensure it has `tabIndex={0}`, `role="button"`, an `aria-label`, and an `onKeyDown` hook supporting Enter/Space.
- Provide transient state updates on action buttons (like a copy to clipboard) to switch to success icons so the user explicitly knows the action succeeded.
- Always provide `aria-label`s on screen-reader invisible or ambiguous icon-only control structures.
