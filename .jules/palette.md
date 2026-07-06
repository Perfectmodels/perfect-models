## 2024-10-25 - Screen reader friendly loading states
**Learning:** Decorative visual spinners and pulsing images in loading components are not announced by screen readers, leaving visually impaired users unaware of background processes.
**Action:** Always add `role="status"` and `aria-live="polite"` to loading containers, include visually hidden screen reader text (e.g., `sr-only`), and explicitly hide decorative visual spinners using `aria-hidden="true"`.
