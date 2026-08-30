## 2024-07-04 - Screen Reader Accessibility in Loading States
**Learning:** Decorative visual spinners in dynamic loading states are often completely ignored by screen readers, leaving visually impaired users unaware that content is loading.
**Action:** Always add `role="status"` and `aria-live="polite"` to the text container, explicitly hide decorative visual spinners using `aria-hidden="true"`, and provide screen-reader-only text.
