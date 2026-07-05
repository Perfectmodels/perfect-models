## 2025-01-01 - Fix Insecure Realtime Database Rules
**Vulnerability:** The Firebase Realtime Database rules (`database.rules.json`) had public read and write access (`".write": true`).
**Learning:** Development rules were likely pushed to production, creating a severe data manipulation vulnerability.
**Prevention:** Ensure production database rules always require authentication for write operations.