## 2024-05-24 - Unauthenticated RTDB Writes
**Vulnerability:** The Realtime Database rules (`database.rules.json`) were configured with `".write": true`, allowing unauthenticated public write access.
**Learning:** Default or overly permissive database rules in development can easily leak into production configurations, leading to unauthorized data manipulation and deletion.
**Prevention:** Always default to restrictive security rules (`".write": "auth != null"`) and explicitly allow specific operations based on business logic.
