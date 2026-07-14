## 2024-05-18 - Memoizing Animated List Items
**Learning:** Wrapping list item components containing expensive framer-motion animations in React.memo() is critical when parent components manage search/filter state, to prevent input lag and main thread blocking.
**Action:** Always apply React.memo() at the export statement (e.g., export default React.memo(Comp)) for React.FC components to avoid TypeScript errors and prevent unnecessary re-renders in dynamic lists.
