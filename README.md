# minify-css-calc

Parse and minify css calc statements

# List of features (WIP)

- Reducing calc() functions to the maximum
- Optimizing calc functions with var()
- Optimizing nested min, max and clamp functions
- Mostly compatible with reduce-css-calc
- Written in TypeScript

# Usage

```typescript
import { minifyCSSCalc } from "minify-css-calc";

minifyCSSCalc("calc(1 + 1)");
// 2

minifyCSSCalc("calc((6 / 2) - (4 * 2) + 1)");
// -4

minifyCSSCalc("min(2px, 5px)");
// 2px

minifyCSSCalc("clamp(0, 1, 1)");
// 1

minifyCSSCalc("min(min(5px, 6px), max(3px, 4px))");
// 4px

minifyCSSCalc("min(min(5rem, 6px), max(3px, 4px))");
// min(4px,5rem)
```
