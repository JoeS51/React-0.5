# React Lite: Flight Implementation Assignment

## Overview
You've successfully implemented the core reconciliation algorithm! Now it's time to add critical missing features that will make your React implementation more complete and production-ready. This assignment focuses on three interconnected features that handle component lifecycle and resource management.

---

## Assignment 1: useEffect Cleanup Functions

### Background
Currently, your `useEffect` implementation can create side effects but has no way to clean them up. This leads to memory leaks when effects create timers, event listeners, or subscriptions that persist after the component unmounts or the effect re-runs.

### Requirements
1. **Modify useEffect to accept and store cleanup functions**
   - The callback passed to useEffect can optionally return a function
   - This returned function is the "cleanup" function
   - Store these cleanup functions for later execution

2. **Execute cleanup functions at the right times**
   - Before running an effect again (when dependencies change)
   - When a component unmounts (see Assignment 3)
   - Cleanup from the previous effect runs BEFORE the new effect

3. **Handle edge cases**
   - What if the effect doesn't return a cleanup function?
   - What if the cleanup function itself throws an error?
   - Ensure cleanup functions have access to their closure values

### Test Cases to Implement
```javascript
// Test 1: Timer cleanup
const TimerComponent = () => {
    useEffect(() => {
        const timer = setInterval(() => console.log('tick'), 1000);
        return () => clearInterval(timer);  // This should work!
    }, []);
}

// Test 2: Event listener cleanup
const MouseTracker = () => {
    useEffect(() => {
        const handler = (e) => console.log(e.x, e.y);
        window.addEventListener('mousemove', handler);
        return () => window.removeEventListener('mousemove', handler);
    }, []);
}

// Test 3: Cleanup runs before next effect
const DependencyChange = ({ userId }) => {
    useEffect(() => {
        console.log(`Subscribing to user ${userId}`);
        return () => console.log(`Unsubscribing from user ${userId}`);
    }, [userId]);  // Should cleanup previous user before subscribing to new
}
```

### Hints
- You'll need to track cleanup functions similar to how you track effects
- Think about when `executeEffect()` runs and how you can run cleanups before it
- The cleanup function is whatever the effect callback returns

---

## Assignment 2: useRef Hook

### Background
`useRef` provides a way to persist mutable values across renders without triggering re-renders. It's commonly used for:
- Accessing DOM elements directly
- Storing mutable values that don't need to trigger re-renders
- Keeping references to interval/timeout IDs

### Requirements
1. **Create the useRef function**
   - Takes an initial value
   - Returns an object with a `current` property
   - The returned object must be the SAME object across renders (referential equality)

2. **Ensure persistence across renders**
   - Like useState, needs to maintain refs across re-renders
   - Unlike useState, changing ref.current should NOT trigger re-render
   - Each call to useRef in a component should get its own ref

3. **Support DOM element references**
   - When a ref object is passed as a `ref` prop to an element, set `ref.current` to the DOM node
   - This happens during the render phase
   - Update your render/reconciliation to handle the `ref` prop specially

### Test Cases to Implement
```javascript
// Test 1: Basic ref usage
const InputFocus = () => {
    const inputRef = useRef(null);

    const focusInput = () => {
        inputRef.current.focus();  // Direct DOM access
    };

    return (
        <div>
            <input ref={inputRef} />
            <button onclick={focusInput}>Focus Input</button>
        </div>
    );
}

// Test 2: Mutable value storage
const Timer = () => {
    const [seconds, setSeconds] = useState(0);
    const intervalRef = useRef(null);

    const start = () => {
        intervalRef.current = setInterval(() => {
            setSeconds(s => s + 1);
        }, 1000);
    };

    const stop = () => {
        clearInterval(intervalRef.current);
    };

    return (
        <div>
            <p>Seconds: {seconds}</p>
            <button onclick={start}>Start</button>
            <button onclick={stop}>Stop</button>
        </div>
    );
}

// Test 3: Ref persistence check
const RefPersistence = () => {
    const ref1 = useRef({ value: 'test' });
    const ref2 = useRef({ value: 'test' });

    console.log('Same ref object?', ref1 === ref1);  // Should be true across renders
    console.log('Different refs?', ref1 !== ref2);   // Should be true
}
```

### Hints
- Think about how useState maintains state across renders - useRef is similar but simpler
- The ref object itself (`{ current: value }`) must remain the same object
- When handling the `ref` prop in render/reconcile, check if it exists and set `ref.current = domElement`

---

## Assignment 3: Component Unmounting & Lifecycle

### Background
Currently, components can mount and update, but there's no proper handling when components are removed from the tree. This is crucial for cleanup and preventing memory leaks.

### Requirements
1. **Detect component unmounting**
   - During reconciliation, identify when a component is being removed
   - This happens when a component exists in prevTree but not in newTree
   - Track which components are being unmounted

2. **Trigger cleanup on unmount**
   - Run all cleanup functions for all effects of unmounting components
   - This must happen BEFORE removing the DOM elements
   - Handle nested components (unmount children before parents)

3. **Implement proper lifecycle order**
   - Mount: render → DOM update → effects run
   - Update: cleanup old effects → render → DOM update → new effects run
   - Unmount: cleanup effects → remove from DOM

4. **Handle component replacement**
   - When a component at the same position changes type (e.g., `<ComponentA />` → `<ComponentB />`)
   - ComponentA should fully unmount (with cleanups) before ComponentB mounts

### Test Cases to Implement
```javascript
// Test 1: Basic unmount cleanup
const ToggleComponent = () => {
    const [show, setShow] = useState(true);

    return (
        <div>
            <button onclick={() => setShow(!show)}>Toggle</button>
            {show && <ChildWithEffect />}
        </div>
    );
}

const ChildWithEffect = () => {
    useEffect(() => {
        console.log('Child mounted');
        return () => console.log('Child unmounting!');  // Should run when toggled off
    }, []);

    return <p>Child component</p>;
}

// Test 2: Nested unmounting
const ParentComponent = () => {
    useEffect(() => {
        console.log('Parent mounted');
        return () => console.log('Parent cleanup');
    }, []);

    return <ChildComponent />;
}

const ChildComponent = () => {
    useEffect(() => {
        console.log('Child mounted');
        return () => console.log('Child cleanup');  // Should run before parent cleanup
    }, []);

    return <p>Child</p>;
}

// Test 3: Component replacement
const ComponentSwitcher = () => {
    const [type, setType] = useState('A');

    return (
        <div>
            <button onclick={() => setType(type === 'A' ? 'B' : 'A')}>Switch</button>
            {type === 'A' ? <ComponentA /> : <ComponentB />}
        </div>
    );
}
```

### Hints
- You'll need to track which effects belong to which components
- Consider adding a unique ID to each component instance
- During reconciliation, before removing DOM nodes, trigger cleanups
- Think about how to traverse the tree to find all unmounting components

---

## Architecture Considerations

### Current State Management
You currently have global arrays for states and effects:
```javascript
const states = [];
const effects = [];
const effectDeps = [];
```

### Questions to Consider
1. How will you associate effects with specific components for unmounting?
2. How will you store refs separately from states?
3. How will you track cleanup functions - new array or modify effects array?
4. When a component unmounts, how do you remove its states/effects/refs from the global arrays?

### Data Structure Ideas
Consider whether you need to:
- Add component instance tracking
- Create a map of component ID → its hooks
- Modify the virtual DOM nodes to include lifecycle metadata
- Track parent-child relationships for proper unmount order

---

## Success Criteria

Your implementation is complete when:

1. **useEffect Cleanup**
   - [ ] Effects can return cleanup functions
   - [ ] Cleanups run before re-running effects (dependency change)
   - [ ] Cleanups run on component unmount
   - [ ] No memory leaks from timers/listeners

2. **useRef**
   - [ ] useRef returns a persistent object with `current` property
   - [ ] Changing ref.current doesn't trigger re-render
   - [ ] ref prop on elements sets ref.current to DOM node
   - [ ] Multiple refs in same component work independently

3. **Unmounting**
   - [ ] Components removed from tree have their effects cleaned up
   - [ ] Nested components unmount in correct order (children first)
   - [ ] Component replacement triggers proper unmount/mount cycle
   - [ ] No console errors or warnings during unmount

---

## Testing Your Implementation

Create a test file that combines all three features:

```javascript
const TestApp = () => {
    const [showTimer, setShowTimer] = useState(true);
    const buttonRef = useRef(null);

    useEffect(() => {
        console.log('App mounted');
        if (buttonRef.current) {
            buttonRef.current.style.color = 'blue';
        }
        return () => console.log('App cleanup');
    }, []);

    return (
        <div>
            <button ref={buttonRef} onclick={() => setShowTimer(!showTimer)}>
                Toggle Timer
            </button>
            {showTimer && <Timer />}
        </div>
    );
}

const Timer = () => {
    const [count, setCount] = useState(0);
    const intervalRef = useRef(null);

    useEffect(() => {
        intervalRef.current = setInterval(() => {
            setCount(c => c + 1);
        }, 1000);

        return () => {
            clearInterval(intervalRef.current);
            console.log('Timer cleaned up!');
        };
    }, []);

    return <div>Count: {count}</div>;
}
```

Success indicators:
- Timer stops when component unmounts
- No console errors
- Cleanup messages appear in correct order
- Ref properly accesses DOM element

---

## PSEUDOCODE HINTS (Only look if stuck!)

<details>
<summary>Click to reveal useEffect Cleanup pseudocode</summary>

```
// Modify your existing useEffect implementation

const effectCleanups = []  // New global array for cleanup functions

const useEffect = (userFunc, deps) => {
    const currIdx = effectIdx
    const prevDeps = effectDeps[currIdx]

    // Check if effect should run (your existing logic)
    const shouldRun = // ... your existing dependency check

    if (shouldRun) {
        // Run previous cleanup if it exists
        if (effectCleanups[currIdx]) {
            effectCleanups[currIdx]()  // Execute the cleanup
        }

        // Queue the new effect
        pendingEffects.push(() => {
            // Run the effect and capture its return value
            const cleanup = userFunc()

            // Store the cleanup function if it exists
            if (typeof cleanup === 'function') {
                effectCleanups[currIdx] = cleanup
            } else {
                effectCleanups[currIdx] = null
            }
        })
    }

    effectDeps[currIdx] = deps
    effectIdx++
}

// In executeEffect, modify to handle the new structure
const executeEffect = () => {
    pendingEffects.forEach(effect => effect())
    pendingEffects = []
}
```

</details>

<details>
<summary>Click to reveal useRef pseudocode</summary>

```
// Global storage for refs (similar to states)
const refs = []
let refIdx = 0

const useRef = (initialValue) => {
    const frozen = refIdx

    // First time: create the ref object
    if (frozen >= refs.length) {
        refs.push({ current: initialValue })
    }

    refIdx++

    // Return the SAME object every time (important!)
    return refs[frozen]
}

// In rerender function, reset refIdx similar to idx
const rerender = () => {
    idx = 0
    effectIdx = 0
    refIdx = 0  // Reset ref index
    // ... rest of rerender
}

// In render function, handle ref prop
const render = (reactElement, container, isRoot, appendBefore) => {
    // ... existing code ...

    if (reactElement.tags !== 'text') {
        // ... create actualDomElement ...

        // Handle ref prop specially
        if (reactElement.props && reactElement.props.ref) {
            // Set the ref's current to point to this DOM element
            reactElement.props.ref.current = actualDomElement
        }

        // ... rest of rendering ...
    }
}

// In reconcile, preserve refs during updates
// When updating DOM props, exclude 'ref' from being set as attribute
const updateDomProps = (domElement, prevProps, newProps) => {
    // ... existing code ...

    Object.keys(newProps).forEach(key => {
        if (key !== 'children' && key !== 'ref') {  // Skip ref
            // ... update prop ...
        }
    })

    // Handle ref updates
    if (prevProps?.ref !== newProps?.ref) {
        if (prevProps?.ref) prevProps.ref.current = null
        if (newProps?.ref) newProps.ref.current = domElement
    }
}
```

</details>

<details>
<summary>Click to reveal Component Unmounting pseudocode</summary>

```
// Track component instances and their hooks
let componentStack = []  // Track current component being rendered
let componentHooks = new Map()  // Map component instance to its hook indices

// Create unique IDs for component instances
let componentIdCounter = 0
const generateComponentId = () => ++componentIdCounter

// Modified reconcile to handle unmounting
const reconcile = (prevTree, newTree, parentDom) => {
    // ... existing scenarios ...

    // Scenario: Component is being removed (prevTree exists, newTree doesn't)
    if (prevTree && !newTree) {
        // Trigger unmount lifecycle
        unmountComponent(prevTree)

        // Remove from DOM
        if (prevTree.dom) {
            parentDom.removeChild(prevTree.dom)
        }
        return
    }

    // ... rest of reconcile ...
}

const unmountComponent = (component) => {
    // First unmount all children recursively
    if (component.children) {
        component.children.forEach(child => unmountComponent(child))
    }

    // Then cleanup this component's effects
    if (component.componentId) {
        const hookIndices = componentHooks.get(component.componentId)
        if (hookIndices) {
            // Run all cleanup functions for this component
            hookIndices.effects.forEach(effectIndex => {
                if (effectCleanups[effectIndex]) {
                    effectCleanups[effectIndex]()
                    effectCleanups[effectIndex] = null
                }
            })

            // Clean up the component's hook storage
            componentHooks.delete(component.componentId)
        }
    }
}

// Track which component is currently rendering
const render = (reactElement, container, isRoot, appendBefore) => {
    // If this is a functional component
    if (typeof reactElement.tags === 'function') {
        // Assign component ID if it doesn't have one
        if (!reactElement.componentId) {
            reactElement.componentId = generateComponentId()
        }

        // Push to stack so hooks know which component they belong to
        componentStack.push(reactElement.componentId)

        // Track hook indices for this component
        if (!componentHooks.has(reactElement.componentId)) {
            componentHooks.set(reactElement.componentId, {
                states: [],
                effects: [],
                refs: []
            })
        }

        // ... render the component ...

        componentStack.pop()
    }

    // ... rest of render ...
}

// Modify hooks to track which component they belong to
const useState = (initialState) => {
    const currentComponent = componentStack[componentStack.length - 1]
    const frozen = idx

    // Track this state index belongs to current component
    if (currentComponent) {
        const hooks = componentHooks.get(currentComponent)
        if (!hooks.states.includes(frozen)) {
            hooks.states.push(frozen)
        }
    }

    // ... rest of useState ...
}

// Similar tracking for useEffect and useRef
```

</details>

---

## Final Notes

Remember:
1. Start with cleanup functions - they're the foundation
2. useRef is simpler than it seems - it's just a persistent object
3. Unmounting is the trickiest - consider drawing the component tree on paper
4. Test each feature in isolation before combining them
5. Console.log liberally to understand the lifecycle flow

Good luck on your flight! This should keep you busy and teach you a lot about React's internals. The real React handles these features with more sophistication, but implementing them yourself will give you deep insight into why React works the way it does.

When you're done, you'll have a React implementation that can handle real-world scenarios like timers, DOM manipulation, and proper cleanup - that's pretty impressive for a from-scratch implementation!