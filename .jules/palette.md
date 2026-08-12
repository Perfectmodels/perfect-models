## 2024-10-25 - Dynamic Role Mapping for Notifications
**Learning:** Hardcoding `role="alert"` for all Toast notifications causes screen readers to interrupt users aggressively even for polite success/info messages, violating expected `aria-live` behavior.
**Action:** Always dynamically map the `role` attribute based on the notification severity (`role={type === 'error' ? 'alert' : 'status'}`) to ensure correct semantic announcement prioritization.
