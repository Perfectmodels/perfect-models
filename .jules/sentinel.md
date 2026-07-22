## 2024-10-25 - Realtime Database Insecure Rules Vulnerability
**Vulnerability:** The Realtime Database security rules (`database.rules.json`) were configured with global write access (`".write": true`), allowing unauthenticated attackers to modify or delete all data.
**Learning:** Default or overly permissive database rules are a critical risk. Failing to require authentication for writes enables trivial data manipulation and malicious wiping of the entire database.
**Prevention:** Always restrict write access in Firebase Realtime Database rules by ensuring `auth != null` is required for data modification, and consistently review rules before deployment.
