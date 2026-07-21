## 2025-02-15 - Unauthenticated Write Access in Realtime Database
**Vulnerability:** The Realtime Database was configured with globally permissive write access (`".write": true`), allowing unauthenticated users to modify or delete data.
**Learning:** Development environments often use permissive rules to speed up iteration, which can accidentally be deployed to production if not explicitly updated.
**Prevention:** Always require authentication (`auth != null`) for write operations in database rules and avoid globally permissive rules in production configurations.
