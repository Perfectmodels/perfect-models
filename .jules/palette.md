## 2024-10-25 - Accessible Transient Action Buttons
**Learning:** Transient or hover-revealed action buttons (like image remove buttons using `opacity-0 group-hover:opacity-100`) become invisible traps for keyboard navigation if they lack focus states and screen reader labels.
**Action:** Always pair `opacity-0 group-hover:opacity-100` with `focus-visible:opacity-100 focus-visible:ring-2 focus-visible:outline-none`, and include an explicit `aria-label` for icon-only buttons.
