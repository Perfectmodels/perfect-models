## 2024-05-15 - Hardcoded Credentials in Seed Data
**Vulnerability:** Found hardcoded plaintext passwords (`admin2025`, `password2025`) used for initial data seeding in `src/hooks/useRealtimeDB.tsx` and `src/constants/data.ts`.
**Learning:** Hardcoded credentials in client-side code are exposed to users in the JS bundle and can be used to bypass authentication if default values are deployed to production.
**Prevention:** Remove plaintext default passwords from client-side code. Initial credentials should be provisioned securely via environment variables or explicitly set by the administrator upon first login.
