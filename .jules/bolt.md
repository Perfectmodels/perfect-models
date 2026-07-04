## 2024-10-25 - React.memo() with Framer Motion
**Learning:** Components containing expensive framer-motion animations can cause input lag if they re-render on every parent state change (like a search input).
**Action:** Always wrap child list item components containing expensive render operations in React.memo() to prevent input lag and thread blocking in parent components managing search/filter state.
