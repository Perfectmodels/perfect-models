## 2024-10-25 - Securing Realtime Database Rules
**Vulnerability:** The Firebase Realtime Database was configured with global public write access (`".write": true`), allowing unauthorized data manipulation.
**Learning:** Default or overly permissive Firebase rules left the entire database open to overwrite attacks, circumventing application-level security.
**Prevention:** Always enforce `auth != null` or stricter role-based rules for database writes before deploying Firebase configurations.
