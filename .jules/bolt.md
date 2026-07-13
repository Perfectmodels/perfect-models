## 2024-10-26 - React.memo for Framer Motion children
**Learning:** Components containing expensive framer-motion animations can cause significant render lag when rendered in lists where the parent's state (like search/filters) changes frequently.
**Action:** Always wrap list item components containing expensive render operations like framer-motion in `React.memo()` to prevent input lag and thread blocking in parent components.
