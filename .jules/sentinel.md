## 2025-01-22 - Hardcoded Admin Passwords Removed
**Vulnerability:** Hardcoded admin credentials ('admin2025') were present in the frontend login flow (`Login.tsx`, `AuthContext.tsx`, and `useRealtimeDB.tsx`).
**Learning:** Legacy authentication fallbacks can inadvertently expose critical bypass credentials in the client-side bundle.
**Prevention:** Remove hardcoded credentials completely from source code. Ensure the application relies exclusively on dynamic, secure authentication mechanisms (e.g., Firebase Auth) without hardcoded bypasses.
