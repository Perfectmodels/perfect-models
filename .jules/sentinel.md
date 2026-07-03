## 2024-07-03 - Unauthenticated RTDB Write Access
**Vulnerability:** The Firebase Realtime Database rules (`database.rules.json`) were configured with `".write": true`, allowing any unauthenticated user to write, modify, or delete all data.
**Learning:** Default or overly permissive database rules can easily be deployed and left in production, leading to severe data integrity and security risks.
**Prevention:** Always ensure Firebase database rules require at least authentication (`"auth != null"`) for write operations before deploying.
