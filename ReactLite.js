// My implementation of React Lite

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
const render = (reactElement, container, isRoot = false) => {

  if (Array.isArray(reactElement)) {
    console.log(reactElement)
    reactElement.forEach(node => render(node, container))
    return
  }

  if (reactElement.tags === TEXT_ELEMENT) {
    const textElement = document.createTextNode(reactElement.props.nodeValue);
    container.appendChild(textElement);
    reactElement.dom = textElement;
    return;
  }

  const actualDomElement = document.createElement(reactElement.tags)
  if (reactElement.props) {
    Object.keys(reactElement.props)
      .filter(p => p != "children")
      .forEach(p => (actualDomElement[p] = reactElement.props[p]));
  }

  if (reactElement.children) {
    reactElement.children.forEach(child => render(child
      , actualDomElement));
  }
  container.appendChild(actualDomElement);
  reactElement.dom = actualDomElement;
}


// For reconciliation, there are a couple scenarios: TODO describe the steps here
const reconcile = (prevTree, newTree, container) => {
  // remove logs once this works
  console.log("in reconciliation")
  console.log(prevTree)
  console.log(newTree)
  // Check if there was no change
  if ((prevTree && newTree) && (prevTree.tags == newTree.tags)) {
    if (prevTree.tags == TEXT_ELEMENT && prevTree.props.nodeValue != newTree.props.nodeValue) {
      console.log("comparing text node")
    }
    // check children iteratively
    const prevChildren = prevTree.children || []
    const newChildren = newTree.children || []
    for (let i = 0; i < Math.max(prevChildren.length, newChildren.length); i++) {
      reconcile(prevChildren[i], newChildren[i], prevTree.dom)
    }
  } else if (!prevTree && newTree) { // new virtual node 
    container.textContent = "";
    render(newTree, container);
    return;
  } else if (!newTree && prevTree) { // deleted virtual node

  }
}

// Global States
const states = [];
let idx = 0;
const effects = [];
const effectDeps = [];
let effectIdx = 0;
const pendingEffects = [];

// Naive rerender implementation 
// TODO: Improve this 
let _rootComponent = null;
let _rootContainer = null;
let _previousTree = null // this will store the previous Virtual DOM tree
let _isRendering = false; // needed this for a weird bug maybe can remove

const rerender = () => {
  if (_isRendering) {
    return;
  }
  if (!_rootComponent || !_rootContainer) {
    console.error("Root component or container not set");
    return;
  }
  idx = 0;
  effectIdx = 0;
  _isRendering = true;

  const firstChild = _rootContainer.firstChild;
  const newTree = _rootComponent();

  reconcile(_previousTree, newTree, _rootContainer)

  // if (firstChild) {
  //   firstChild.remove();
  // }
  // render(_rootComponent(), _rootContainer, true);


  // This stores the tree for reconciliation in next render
  _previousTree = newTree;
  console.log("Previous Tree:")
  console.log(_previousTree)
  _isRendering = false;
  executeEffect();
}

const useState = (initialState) => {
  const frozen = idx;
  if (frozen >= states.length) {
    states.push(initialState)
  }

  let setState = (newState) => {
    states[frozen] = newState;
    rerender();
  }
  idx++;
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
    pendingEffects.push(userFunc);
  }

  effects[currIdx] = userFunc;
  effectDeps[currIdx] = deps;

  effectIdx++;
}

const executeEffect = () => {
  const effectsToRun = pendingEffects.slice();
  pendingEffects.length = 0;
  for (const fn of effectsToRun) {
    fn()
  }
}

// Helper function to set up the root component for rerender
const setRootComponent = (component, container) => {
  _rootComponent = component;
  _rootContainer = container;
  rerender();
}

export const createElement = React.createElement;
export { render, useState, useEffect, setRootComponent, executeEffect };

// Also create a default export with everything
export default {
  createElement: React.createElement,
  render,
  useState,
  useEffect,
  setRootComponent,
  executeEffect
};

