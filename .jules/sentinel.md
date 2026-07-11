## 2024-10-25 - Unauthenticated RTDB Writes Allowed
**Vulnerability:** The Realtime Database rules (`database.rules.json`) were configured with `".write": true`, allowing any anonymous user to modify or delete the entire database.
**Learning:** Default test mode or globally permissive rules are often left over from initial development and can be deployed to production, exposing all data.
**Prevention:** Always enforce `".write": "auth != null"` at the root level as a baseline, and apply more granular access controls per node based on business logic.