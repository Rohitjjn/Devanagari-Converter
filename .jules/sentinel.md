## 2026-05-12 - [XSS via dangerouslySetInnerHTML]
**Vulnerability:** Found `dangerouslySetInnerHTML` rendering API warnings in `components/LiveConverter.tsx` which could expose the app to XSS if the warnings payload is manipulated.
**Learning:** React components consuming external API strings should assume the string is unsafe, even if the API is internal or expected to only return text. 
**Prevention:** Avoid `dangerouslySetInnerHTML` for simple text messaging such as warnings/errors. Use standard JSX text interpolation like `<span>{warning}</span>` which auto-escapes HTML characters.
