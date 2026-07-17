## 2024-10-25 - Unmemoized Framer-Motion Cards in Filterable Grids
**Learning:** Rendering complex `framer-motion` components (like `ModelCard`) inside a grid that updates frequently (e.g., the search filter in `Models.tsx` which updates state on every keystroke) causes significant main thread blocking and lag if the cards are not memoized, because React re-evaluates all animation frames.
**Action:** Always wrap heavy list item components, especially those utilizing `framer-motion`, in `React.memo()` when they are rendered inside a parent with rapid state updates.
