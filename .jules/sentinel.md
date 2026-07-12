## 2024-10-25 - Removed Hardcoded Initial Passwords
**Vulnerability:** Hardcoded fallback credentials/passwords found in client-side Vite application in `src/constants/data.ts` and `src/hooks/useRealtimeDB.tsx`.
**Learning:** Hardcoded initial seed passwords can introduce a critical vulnerability if developers use empty strings as placeholders during refactoring (creating an empty password bypass) or if the hardcoded passwords leak into the production bundle.
**Prevention:** Completely remove hardcoded bypass logic rather than replacing it with defaults, and ensure interfaces define sensitive fields as optional rather than requiring dummy values.
