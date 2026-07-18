## 2024-10-25 - Restrict Firebase Realtime Database Write Access
**Vulnerability:** The Realtime Database rules allowed globally permissive write access (`".write": true`), meaning anyone could manipulate data without authentication.
**Learning:** Default or overly permissive Firebase rules left over from early development phases can persist into production, exposing the entire database to unauthorized modifications.
**Prevention:** Always enforce strict access controls (`auth != null` or role-based logic) before deploying Firebase applications. Review security rules as a mandatory deployment step.
