## 2024-10-25 - Accessibility of transient/hover-revealed buttons
**Learning:** Buttons revealed only on group hover (`opacity-0 group-hover:opacity-100`) are invisible to keyboard-only users. Furthermore, icon-only buttons (like 'X' for removal) lack context for screen readers.
**Action:** Always add focus-visible utilities (`focus-visible:opacity-100 focus-visible:ring-2 focus-visible:outline-none`) and explicit `aria-label`s to transient action buttons to ensure they are fully accessible to keyboard and screen reader users.
