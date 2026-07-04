## 2024-07-04 - Unauthenticated Realtime Database Write Access
**Vulnerability:** The Firebase Realtime Database rules (`database.rules.json`) were configured with `".write": true`, allowing anyone to write, modify, or delete data without authentication.
**Learning:** Using globally permissive development rules in production leaves the database vulnerable to unauthorized data manipulation and deletion.
**Prevention:** Always ensure that database write rules require authentication (`"auth != null"`) or more specific authorization checks before deploying.