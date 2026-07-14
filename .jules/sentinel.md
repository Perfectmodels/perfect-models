## 2024-10-25 - Open Realtime Database Write Access
**Vulnerability:** The Realtime Database security rules (`database.rules.json`) were configured with global write access (`".write": true`), allowing unauthenticated manipulation of data.
**Learning:** Development rules were left active instead of being restricted for production, exposing the entire database to unauthorized writes and deletion.
**Prevention:** Always configure `".write": "auth != null"` in production environments to ensure only authenticated users can alter database contents.
