## 2024-07-06 - React.memo for Search Input Lag
**Learning:** In parent components like Models.tsx that manage frequent state updates (e.g., search/filter inputs), failing to memoize child list items containing expensive render operations like framer-motion animations can cause severe input lag and thread blocking.
**Action:** Always wrap child list item components in React.memo() at the export statement to prevent unnecessary re-renders when parent state changes.
