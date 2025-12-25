## React Lite - A Reimplementation of React from Scratch

A lightweight re-implementation of React's core ideas including a virtual DOM, a custom renderer, createElement, and hooks (useState, useEffect, useRef).

I built this from the ground up to better understand how React works under the hood. Specifically, I wanted to learn about virtual DOM construction, rendering, reconciliation, and how hooks actually work (so I stop having infinite rerenders).

### Core Design Choices

**Virtual DOM Representation**
Each virtual node is a simple object with `tags`, `props`, and `children`. Text nodes get special treatment via `createTextElement` which wraps them in a virtual node structure. I chose this as it makes reconciliation way easier since everything has the same shape.

**Functional Components**
When `createElement` encounters a function as the tag, it just calls that function with props. 

**Reconciliation Algorithm**
The reconciler I implemented currently handles four scenarios:
1. New node created (render it fresh)
2. Node deleted (remove from DOM)
3. Tag changed (swap in-place)
4. Same tag (update props, recurse on children)

I store a reference to the actual DOM element on each virtual node (`reactElement.dom`) so I can update/remove it later without traversing the real DOM.

**Hooks via Global State**
Hooks use global arrays (`states`, `effects`, `refs`) indexed by call order. This is why hooks can't be called conditionally as the indices would get messed up. Each render resets the indices to 0 so hooks read from the right slots.

**useEffect Cleanup**
In React, effects can return cleanup functions. To support cleanup functions, I store and execute them before re-running the effect (when the deps change) or on unmount. Pending effects queue up and run after the DOM updates via `executeEffect`.

**useRef**
Returns a persistent object with a `current` property. Unlike useState, mutating `ref.current` doesn't trigger a rerender.

### How to Run

1. Start a local server:
```bash
python3 -m http.server 8000
```

2. Import in your JSX file:
```javascript
import React, { useState, useEffect, useRef, setRootComponent } from './ReactLite.js';
```

3. Use `setRootComponent(App, container)` to mount your app

### What's Implemented

- [x] Virtual DOM with createElement
- [x] Render function (virtual DOM → real DOM)
- [x] Functional components
- [x] Reconciliation algorithm
- [x] useState hook
- [x] useEffect hook with dependency tracking
- [x] useEffect cleanup functions
- [x] useRef hook

### What's Next

- [ ] Component unmounting lifecycle
- [ ] useMemo / useCallback
- [ ] Better error handling
- [ ] Keys for list reconciliation
