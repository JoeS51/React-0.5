# ReactLite 2-Week Plan (Impressive Finish Line)

Goal: ship a cohesive, article-ready React clone with a complete hooks story, more realistic reconciliation, and a clear demo app.

## Week 1 (Core Engine + Hooks)

### Day 1-2: Reconciliation upgrades
- Add keyed list reconciliation for children with `key` support
- Keep index-based fallback when no keys are provided
- Add fragment support (arrays / nulls without wrapper nodes)

### Day 3: Effects and unmount cleanup
- Run `useEffect` cleanups when a subtree is removed
- Ensure cleanup runs before DOM removal
- Add a tiny demo that unmounts a component

### Day 4: Hook fixes and missing basics
- Fix `useCallback` to return the memoized function
- Add `useReducer`
- Add `useContext` with a minimal Provider/Consumer pattern

### Day 5: Sync effects and refs
- Add `useLayoutEffect` (run immediately after DOM updates, before paint)
- Add `forwardRef` + `useImperativeHandle`

## Week 2 (Scheduling + Events + Polish)

### Day 6-7: Scheduler + time slicing
- Implement a small scheduler (task queue + `requestIdleCallback` or `setTimeout` fallback)
- Allow interruptible rendering in large trees
- Add a demo that shows yielding (large list + input)

### Day 8: Synthetic event system
- Implement event delegation at root
- Normalize event object (basic `target`, `currentTarget`, `preventDefault`, `stopPropagation`)

### Day 9: Memoization at component level
- Add `memo` with shallow props compare
- Add a demo to show rerender prevention

### Day 10: Error handling story
- Add a simple error boundary (catch render errors and show fallback)

### Day 11-12: Advanced hooks (optional but impressive)
- `useId` (stable ids across renders)
- `useDebugValue` (no-op placeholder, but documented)
- `useTransition` + `useDeferredValue` (tie to scheduler)
- `useSyncExternalStore` (basic subscribe/getSnapshot)

### Day 13: Demo app + docs
- Build a small demo app:
  - todo + filter + async data fetch + reorder list
  - shows keys, effects, memo, reducer/context
- Update README: implemented list, limitations, API docs

### Day 14: Article prep
- Write the narrative: design choices, tradeoffs, what you learned
- Include demo GIF or short clip
- Final cleanup pass (remove debug logs)

## Minimal “Impressive” Stop Point

If you need to cut scope, stop after these are done:
- keyed list reconciliation
- unmount cleanup
- `useReducer`, `useContext`, `useLayoutEffect`
- scheduler (simple yielding)
- synthetic events
- demo app + README update

## Notes for this repo

- Core file: `ReactLite.js`
- Demo: `test.jsx` (expand into a proper demo app)
- Docs: `README.md` (sync TODO list with actual features)

## Deliverables Checklist

- [ ] Keys in reconciliation
- [ ] Cleanup on unmount
- [ ] `useCallback` return fix
- [ ] `useReducer`
- [ ] `useContext`
- [ ] `useLayoutEffect`
- [ ] `forwardRef` + `useImperativeHandle`
- [ ] Scheduler + time slicing
- [ ] Synthetic events
- [ ] `memo` with shallow compare
- [ ] Error boundary
- [ ] `useId`
- [ ] `useDebugValue` (documented)
- [ ] `useTransition` + `useDeferredValue`
- [ ] `useSyncExternalStore`
- [ ] Demo app
- [ ] README update
