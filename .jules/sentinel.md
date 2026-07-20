## 2024-07-20 - Public RTDB Write Access
**Vulnerability:** The Realtime Database was configured with `".write": true`, allowing unauthenticated public write access to the entire database.
**Learning:** Default or development Firebase rules were left active, exposing the database to arbitrary data manipulation or deletion by anyone on the internet.
**Prevention:** Always restrict `.write` access to `auth != null` at a minimum in `database.rules.json` before deploying, and regularly audit Firebase security rules.
