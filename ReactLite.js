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
const render = (reactElement, container) => {

  if (Array.isArray(reactElement)) {
    console.log(reactElement)
    reactElement.forEach(node => render(node, container))
    return
  }

  if (reactElement.tags === TEXT_ELEMENT) {
    const textElement = document.createTextNode(reactElement.props.nodeValue);
    container.appendChild(textElement);
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
}

const reconcile = () => {
  // TODO: implement reconciliation functionality here for the render function
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

const rerender = () => {
  if (!_rootComponent || !_rootContainer) {
    console.error("Root component or container not set");
    return;
  }
  idx = 0;
  effectIdx = 0;
  const firstChild = _rootContainer.firstChild;
  if (firstChild) {
    firstChild.remove();
  }
  render(_rootComponent(), _rootContainer);
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
}

// export as ES6
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

