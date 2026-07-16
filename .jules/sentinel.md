## 2024-07-16 - Realtime Database Public Write Vulnerability
**Vulnerability:** Firebase Realtime Database rules (`database.rules.json`) were configured with `".write": true`, allowing any anonymous user to modify or delete the entire database.
**Learning:** The database rules lacked proper authentication checks for write operations, potentially due to leaving development rules in production.
**Prevention:** Ensure `".write": "auth != null"` is properly configured in production environments.
