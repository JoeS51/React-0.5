// My implementation of react 

// Virtual dom node
let React = {
  createElement: (tags, props, ...children) => {
    if (typeof tags == "function") {
      // console.log("here")
      console.log("is a function component")
      if (!props) props = {}
      props.children = children
      const res = { ...(props || {}), children }
      console.log(props)
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
  if (typeof reactElement.tags == "function") {
    console.log(reactElement)
    console.log("JHDLKASJDLKAJDKL:SA")
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
  if (reactElement?.props?.children) {
    reactElement.props.children.forEach(child => render(child
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

  return (
    <div className="joe-test">
      <Test><p>joe test</p></Test>
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
