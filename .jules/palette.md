## 2024-07-16 - Transient Action Button Accessibility
**Learning:** The codebase frequently uses `opacity-0 group-hover:opacity-100` for transient actions like image deletion. This pattern hides interactive elements from keyboard-only users because they cannot hover to reveal them.
**Action:** Always pair `opacity-0 group-hover:opacity-100` with `focus-visible:opacity-100 focus-visible:ring-2 focus-visible:outline-none` and ensure an `aria-label` is present for screen readers.
