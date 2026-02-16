// My implementation of React based on various aritcles

const TEXT_ELEMENT = "text";

// Creates a virtual dom text node (helpful for reconciliation)
const createTextElement = (text) => {
  return {
    tags: TEXT_ELEMENT,
    props: { nodeValue: text },
    children: []
  };
}

// Virtual dom node
const React = {
  createElement: (tags, props, ...children) => {
    if (typeof tags == "function") {
      const res = { ...(props || {}), children }
      return tags(res)
    }

    const normalizedChildren = children.map(child =>
      typeof child === "object"
        ? child
        : createTextElement(child)
    );

    const element = { tags, props, children: normalizedChildren }
    return element;
  }
};

// Takes virtual DOM and builds the actual DOM 
const render = (reactElement, container, isRoot = false, appendBefore = null) => {

  if (Array.isArray(reactElement)) {
    console.log(reactElement)
    reactElement.forEach(node => render(node, container))
    return
  }

  if (reactElement.tags === TEXT_ELEMENT) {
    const textElement = document.createTextNode(reactElement.props.nodeValue);
    reactElement.dom = textElement;
    container.insertBefore(textElement, appendBefore);
    return;
  }

  const actualDomElement = document.createElement(reactElement.tags)
  if (reactElement.props) {
    Object.keys(reactElement.props)
      .filter(p => (p != "children" && p != "ref"))
      .forEach(p => (actualDomElement[p] = reactElement.props[p]));

    // Set useRef
    if (reactElement.props.ref) {
      reactElement.props.ref.current = actualDomElement;
      console.log("use ref")
      console.log(reactElement.props.ref.current)
    }
  }

  if (reactElement.children) {
    console.log("HERERE")
    console.log(reactElement.children)
    reactElement.children.forEach(child => render(child
      , actualDomElement));
  }
  container.insertBefore(actualDomElement, appendBefore);
  reactElement.dom = actualDomElement;
}


// For reconciliation, there are a couple scenarios: TODO describe the steps here
const reconcile = (prevTree, newTree, container, beforeDom = null) => {
  // remove logs once this works
  // console.log("in reconciliation")
  // console.log(prevTree)
  // console.log(newTree)

  // Scenario where virtual dom was created 
  if (!prevTree && newTree) {
    render(newTree, container, beforeDom);
    return;
  }

  // Scenario where virtual dom was deleted (delete from dom)
  if (prevTree && !newTree) {
    container.removeChild(prevTree.dom);
    return;
  }

  // Tag was changed (swap v nodes in-place)
  if (prevTree.tags !== newTree.tags) {
    render(newTree, container, prevTree.dom)
    container.removeChild(prevTree.dom);
    return;
  }

  // Checking if these virtual nodes are text elements
  if (newTree.tags == TEXT_ELEMENT) {
    newTree.dom = prevTree.dom;
    if (prevTree.props.nodeValue != newTree.props.nodeValue) {
      prevTree.dom.nodeValue = newTree.props.nodeValue;
    }
    return;
  }

  newTree.dom = prevTree.dom;
  updateDomProps(newTree.dom, prevTree.props, newTree.props);

  const prevChildren = prevTree.children || [];
  const newChildren = newTree.children || [];
  const maxLen = Math.max(prevChildren.length, newChildren.length);

  for (let i = 0; i < maxLen; i++) {
    const before = prevTree.dom?.childNodes[i] || null;
    reconcile(prevChildren[i], newChildren[i], prevTree.dom, before)
  }

}

const updateDomProps = (dom, prevProps = {}, newProps = {}) => {
  if (prevProps) {
    for (const key of Object.keys(prevProps)) {
      if (key === "children") continue;
      if (!(key in newProps)) {
        dom[key] = "";
      }
    }
  }

  if (newProps) {
    for (const key of Object.keys(newProps)) {
      if (key === "children") continue;
      if (prevProps[key] !== newProps[key]) {
        dom[key] = newProps[key];
      }
    }
  }
}

// Global States
const states = [];
let idx = 0;
const effects = [];
const effectDeps = [];
let effectIdx = 0;
const pendingEffects = [];
const cleanupEffects = [];
const refs = [];
let refIdx = 0;
let currRef;

// Naive rerender implementation 
// TODO: Improve this 
let _rootComponent = null;
let _rootContainer = null;
let _previousTree = null // this will store the previous Virtual DOM tree
let _isRendering = false; // needed this for a weird bug maybe can remove

const rerender = () => {
  if (!_rootComponent || !_rootContainer) {
    console.error("Root component or container not set");
    return;
  }
  idx = 0;
  effectIdx = 0;
  refIdx = 0;
  memoIdx = 0;

  const firstChild = _rootContainer.firstChild;
  const newTree = _rootComponent();
  console.log("before reconciliation")
  console.log(states);
  reconcile(_previousTree, newTree, _rootContainer)

  // if (firstChild) {
  //   firstChild.remove();
  // }
  // render(_rootComponent(), _rootContainer, true);


  // This stores the tree for reconciliation in next render
  _previousTree = newTree;
  console.log("after reconciliation")
  console.log(states);
  executeEffect();
}

const useState = (initialState) => {
  const frozen = idx;
  if (frozen >= states.length) {
    states.push(initialState)
  }

  let setState = (newState) => {
    if (typeof newState === 'function') {
      states[frozen] = newState(states[frozen])
    } else {
      states[frozen] = newState;
    }
    rerender();
  }
  idx++;
  console.log("in use state")
  console.log(states)
  return [states[frozen], setState]
}

const useEffect = (userFunc, deps) => {
  const currIdx = effectIdx;
  const prevDeps = effectDeps[currIdx];
  let addToPending = false;

  if (prevDeps === undefined) {
    addToPending = true;
  } else if (!deps) { // no dep array means run every render
    addToPending = true;
  } else {
    if (prevDeps.length !== deps.length) {
      addToPending = true;
    } else {
      for (let i = 0; i < deps.length; i++) {
        if (prevDeps[i] !== deps[i]) {
          addToPending = true;
          break;
        }
      }
    }
  }

  if (addToPending) {
    if (cleanupEffects[currIdx]) {
      console.log("cleaning up in use effect")
      cleanupEffects[currIdx]();
    }
    // adding cleanup function too if it exists
    pendingEffects.push(() => {
      const cleanupFunc = userFunc();
      if (typeof cleanupFunc === "function") {
        cleanupEffects[currIdx] = cleanupFunc;
      } else {
        cleanupEffects[currIdx] = null;
      }
    })
  }

  effects[currIdx] = userFunc;
  effectDeps[currIdx] = deps;

  effectIdx++;
}

const useRef = (state) => {
  if (refIdx >= refs.length) {
    let newRef = {
      current: state,
    }
    refs.push(newRef)
  }

  let resRef = refs[refIdx];
  refIdx += 1;
  return resRef;
}

const memos = [];
let memoIdx = 0;

const useMemo = (func, deps) => {
  const currIdx = memoIdx;
  const prevDeps = memos[currIdx]?.deps;
  let shouldRecompute = false;

  // Can copy logic from useEffect (TODO: use helper function here?)
  if (prevDeps === undefined) {
    shouldRecompute = true;
  } else if (!deps) {
    shouldRecompute = true;
  } else {
    if (prevDeps.length !== deps.length) {
      shouldRecompute = true;
    } else {
      for (let i = 0; i < deps.length; i++) {
        if (prevDeps[i] !== deps[i]) {
          shouldRecompute = true;
          break;
        }
      }
    }
  }

  if (shouldRecompute) {
    memos[currIdx] = { value: func(), deps }
  }

  memoIdx++;
  return memos[currIdx].value;
}

const useCallback = (func, deps) => {
  return useMemo(() => func, deps);
}

const useReducer = (reducer, initialArg, init) => {
  const frozen = idx;
  console.log(frozen)
  console.log(states)
  if (frozen >= states.length) {
    console.log("in fornzen")
    const derivedInitState = init ? init(initialArg) : initialArg;
    states.push(derivedInitState);
  }

  console.log(frozen)
  console.log("donnne")

  let dispatch = (args) => {
    states[frozen] = reducer(states[frozen], args);
    rerender();
  }

  idx++;
  console.log("in use reudcer")
  console.log(states)
  return [states[frozen], dispatch]
}

const executeEffect = () => {
  const effectsToRun = pendingEffects.slice();
  pendingEffects.length = 0;
  for (const fn of effectsToRun) {
    fn()
  }
  console.log("in execute effect")
  console.log(states)
}

// Helper function to set up the root component for rerender
const setRootComponent = (component, container) => {
  _rootComponent = component;
  _rootContainer = container;
  rerender();
}

export const createElement = React.createElement;
export { render, useState, useEffect, useRef, useMemo, useCallback, useReducer, setRootComponent, executeEffect };

// Also create a default export with everything
export default {
  createElement: React.createElement,
  render,
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
  useReducer,
  setRootComponent,
  executeEffect
};

