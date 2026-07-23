## 2024-10-25 - Fix Unauthenticated Database Writes
**Vulnerability:** Firebase Realtime Database rules (`database.rules.json`) were configured with `".write": true`, allowing any anonymous user to modify or delete the entire database.
**Learning:** The database rules lacked proper authentication checks for write operations, relying on a default or test configuration that was never secured for production.
**Prevention:** Ensure Realtime Database security rules strictly require authentication (`auth != null`) for write operations by default.
