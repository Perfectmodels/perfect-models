## 2024-07-02 - Memoize Animated List Items for Search Performance
**Learning:** Wrapping child list item components containing expensive render operations (like `framer-motion` animations) in `React.memo()` prevents input lag and thread blocking in parent components managing search/filter state (e.g., `Models.tsx`).
**Action:** Always memoize list items that use heavy animations or render logic when they are child components of views with frequent state updates, such as text search inputs.
