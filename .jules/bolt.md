## 2024-10-25 - Prevent Input Lag in List Filter
**Learning:** Components managing search or filter state, like `Models.tsx`, can suffer from severe thread blocking and input lag when mapping over child items containing expensive operations (such as `framer-motion` components) during state updates.
**Action:** Always wrap child list components containing expensive render operations in `React.memo()` at the export statement to prevent unnecessary re-renders of the entire list during parent state changes.
