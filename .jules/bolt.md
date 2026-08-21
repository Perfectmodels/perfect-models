## 2024-10-25 - React.memo Optimization in Search Grids
**Learning:** In components with search or filter states (like Models.tsx), mapping over child components with expensive renders (such as those using framer-motion animations) causes input lag during state changes because React re-renders every child on each keystroke.
**Action:** Always wrap these expensive list item components (e.g., ModelCard) with React.memo() to prevent unnecessary re-renders when parent state updates.
