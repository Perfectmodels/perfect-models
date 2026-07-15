## 2024-10-25 - Unauthorized Database Write Access
**Vulnerability:** The Realtime Database was configured with global write access (`".write": true`), allowing unauthenticated data modification.
**Learning:** Default or overly permissive database rules during early development were not restricted before production deployment.
**Prevention:** Always restrict write access to authenticated users (`auth != null`) by default and implement strict domain-based validation rules.