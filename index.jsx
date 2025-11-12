// My implementation of react 

// Virtual dom node
let React = {
  createElement: (tags, props, ...children) => {
    if (typeof tags == "function") {
      // console.log("here")
      console.log("is a function component")
      const res = { ...(props || {}), children }
      console.log(res)
      return tags(res)
    }
    const element = { tags, props, children }
    // console.log(element);
    return element;
  }
};

// Mounting function. Takes virtual DOM and builds the actual DOM 
const render = (reactElement, container) => {
  console.log("in render")
  console.log(reactElement)

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
    console.log("REACT ELEMENT PROPS")
    console.log(reactElement.props)
    Object.keys(reactElement.props)
      .filter(p => p != "children")
      .forEach(p => (actualDomElement[p] = reactElement.props[p]));
  }

  if (reactElement.children) {
    console.log("REACT CHILDREN")
    console.log(reactElement.children)
    reactElement.children.forEach(child => render(child
      , actualDomElement));
  }
  container.appendChild(actualDomElement);
}

// Global States
const states = [];
let idx = 0;

// Naive rerender implementation 
// TODO: Improve this 
const rerender = () => {
  idx = 0;
  document.querySelector("#root").firstChild.remove();
  render(<App />, document.querySelector("#root"));
}

const useState = (initialState) => {
  console.log("in usestate")
  const frozen = idx;
  if (frozen >= states.length) {
    states.push(initialState)
  }

  let setState = (newState) => {
    console.log("set state called with ", newState)
    states[frozen] = newState;
    rerender();
  }
  idx++;
  return [states[frozen], setState]
}

const useEffect = (userFunc) => {
  userFunc();
}

const Test = (props) => {
  console.log("IN TEST")
  console.log(props)
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
    //setCounter() this isnt working yet
  })

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
