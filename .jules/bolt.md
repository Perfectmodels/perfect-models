## 2024-10-25 - Prevent input lag by memoizing expensive animated list items
**Learning:** To prevent input lag and thread blocking in parent components managing search/filter state (e.g., Models.tsx), child list item components containing expensive render operations (like framer-motion animations) must be wrapped in React.memo().
**Action:** Always wrap child components containing framer-motion animations in React.memo() when rendered in a list whose parent maintains search/filter state.
