## Bolt's Performance Journal

## 2026-05-12 - [Batch Processing Network Waterfall]
**Learning:** Next.js applications that process collections of files remotely using an API route face severe network waterfall issues if they await each `fetch` call sequentially. Even if the processing logic on the server is incredibly fast (e.g. 1ms text conversion), the HTTP RTT overhead for hundreds of items dominates total processing time. Moving the logic client-side entirely is one fix, but if server isolation is preferred or required, chunked concurrency is essential.
**Action:** Always batch or throttle client-to-server operations using `Promise.all` with a sensible concurrency limit (e.g., chunks of 5-10 requests at a time) rather than sequential await loops when dealing with array/list processing to balance rapid execution without rate-limiting / blocking.
