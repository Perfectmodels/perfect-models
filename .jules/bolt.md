## 2024-05-21 - TypeScript Typing for React.memo
**Learning:** In modern React 18+ TypeScript definitions, `React.memo` returns a `NamedExoticComponent` which is not assignable to `React.FC`. Assigning the result of `memo` to a `React.FC` typed variable will cause strict TypeScript compilation errors.
**Action:** When applying `React.memo`, drop the `React.FC` type annotation from the variable declaration and instead type the component's props directly in its argument list (e.g., `const MyComponent = memo(({ prop1 }: MyProps) => { ... })`).
