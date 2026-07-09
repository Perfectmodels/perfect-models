## 2025-01-24 - Remove Hardcoded Passwords
**Vulnerability:** Discovered hardcoded plaintext passwords in data.ts and useRealtimeDB.tsx defaults.
**Learning:** Hardcoded passwords in source code expose systems to unauthorized access and should never be committed, even in seed or fallback data. Types need to be updated to make the field optional to avoid authentication bypass issues if empty strings were used instead.
**Prevention:** Do not hardcode passwords in the codebase. Ensure TypeScript interfaces handle optional password fields safely.
