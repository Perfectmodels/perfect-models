## 2024-10-25 - Screen reader friendly Loading states
**Learning:** Decorative pulsing logos in global loading overlays are often read aloud as generic alt text (e.g., "PMM") rather than the actual loading state, confusing screen reader users during transitions.
**Action:** Always add `role="status"` and `aria-live="polite"` to the container, explicitly hide decorative visual spinners using `aria-hidden="true"`, and provide a visually hidden fallback text (using `sr-only`).
