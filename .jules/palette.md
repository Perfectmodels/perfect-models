## 2024-07-09 - Accessible Loading States
**Learning:** Decorative visual spinners and generic loading states often lack context for screen readers. Explicitly marking loading containers with `role="status"` and `aria-live="polite"`, and hiding decorative elements with `aria-hidden="true"`, ensures all users are informed of dynamic state changes.
**Action:** Always add semantic roles (`status` or `alert`) and live region attributes to dynamic loading components to support assistive technologies.
