## 2024-07-05 - Screen Reader Experience for Full-Page Loaders
**Learning:** When using animated logos as loading indicators in this app, relying on image `alt` text fails to properly notify screen readers of the transition state. They require an explicit status region to announce the loading phase correctly without reading the logo name repeatedly.
**Action:** Always add `role="status"` and `aria-live="polite"` to the loader container, provide a visually hidden screen-reader-only text span, and explicitly hide the decorative animated logo using `aria-hidden="true"`.
