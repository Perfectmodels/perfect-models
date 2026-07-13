## 2025-02-18 - Hardcoded API Keys in Client Config
**Vulnerability:** Hardcoded API keys (e.g., Firebase `apiKey`, `appId`) were found in `src/firebaseConfig.ts` as fallbacks for environment variables.
**Learning:** Hardcoding sensitive infrastructure keys in source code exposes them to anyone with repository access. While Firebase keys are often public in client bundles, relying on hardcoded defaults in version control risks leaking production credentials or tying development builds to production environments.
**Prevention:** Always rely strictly on environment variables (`import.meta.env`) for configuration and never commit hardcoded fallback keys. Use `.env.example` to document required variables.
