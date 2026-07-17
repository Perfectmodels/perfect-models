## 2024-07-17 - Unauthenticated Realtime Database Write Access
**Vulnerability:** Firebase Realtime Database rules (`database.rules.json`) were configured with `".write": true`, allowing anyone to modify, delete, or overwrite data without authentication.
**Learning:** Default or development rules are sometimes inadvertently left in the configuration, posing a critical security gap that could lead to complete database compromise if deployed.
**Prevention:** Always strictly enforce `auth != null` for write operations in Firebase rules at a minimum, even during early development, to prevent unauthenticated access.
