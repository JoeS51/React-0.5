// My implementation of react 

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
let React = {
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
// const effects = [];
// let effectIdx = 0;
const pendingEffects = [];

// Naive rerender implementation 
// TODO: Improve this 
const rerender = () => {
  idx = 0;
  effectIdx = 0;
  document.querySelector("#root").firstChild.remove();
  render(<App />, document.querySelector("#root"));
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

const Test = (props) => {
  return (
    <div>
      <p>hi</p>
      {props.children}
    </div>
  )
}

// Test JSX
const App = () => {
  const [title, setTitle] = useState("WELCOME TO MY REACT LITE");
  const [counter, setCounter] = useState(0);

  // just runs once at the start for now
  useEffect(() => {
    console.log("in use effect");
    setCounter(10000);
  }, [])

  useEffect(() => {
    console.log("test")
    setTitle("TEKLJSDKLAJKLDAS")
  }, [counter])

  return (
    <div className="joe-test">
      <Test>
        <p>joe test</p>
        <p>joe 2 test</p>
      </Test>
      <h1>{title}</h1>
      <p>
        I made this with my own react implementation
      </p>
      <input onchange={e => setTitle(e.target.value)} value={title} />
      <br />
      <button onclick={() => setCounter(counter + 1)}>Click me</button>
      <br />
      {counter}
    </div>
  );
}

// Code needed to actually run my react logic
render(<App />, document.querySelector("#root"));
executeEffect();
