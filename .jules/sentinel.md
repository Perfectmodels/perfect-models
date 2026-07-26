## 2024-07-26 - Restrict Global Write Access in Realtime Database
**Vulnerability:** The Firebase Realtime Database rules allowed unauthenticated, global write access (`".write": true`) at the root level.
**Learning:** Default or overly permissive database rules often persist from early prototyping stages, leaving the entire database vulnerable to unauthorized modification or deletion by anyone on the internet.
**Prevention:** Always ensure Firebase database rules require at least `auth != null` for write operations before deploying to production, and apply principle of least privilege.
