// My implementation of react 

// Virtual dom node
let React = {
  createElement: (tags, props, ...children) => {
    if (typeof tags == "function") {
      const res = { ...(props || {}), children }
      return tags(res)
    }
    const element = { tags, props, children }
    return element;
  }
  // create text element
};

// Mounting function. Takes virtual DOM and builds the actual DOM 
const render = (reactElement, container) => {

  if (Array.isArray(reactElement)) {
    reactElement.forEach(node => render(node, container))
    return
  }

  if (typeof reactElement == "string" || typeof reactElement == "number") {
    const textElement = document.createTextNode(reactElement);
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

// HTML
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

render(<App />, document.querySelector("#root"));
executeEffect();
