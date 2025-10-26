// React implementationnnnnnnn
let React = {
  createElement: (tags, props, ...children) => {
    if (typeof tags == "function") {
      // console.log("here")
      return tags(props)
    }
    const element = { tags, props, children }
    // console.log(element);
    return element;
  }
};

const render = (reactElement, container) => {
  if (typeof reactElement == "string") {
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

let globalTitle = "";

const rerender = () => {
  document.querySelector("#root").firstChild.remove();
  render(<App />, document.querySelector("#root"));
}

const useState = (initialState) => {
  if (globalTitle == "") {
    globalTitle = initialState
  }
  let setState = (newState) => {
    console.log("set state called with ", newState)
    globalTitle = newState
    rerender();
  }
  return [globalTitle, setState]
}

// HTML
const App = () => {
  const [title, setTitle] = useState("TITLE");

  return (
    <div className="joe-test">
      <input onchange={e => setTitle(e.target.value)} value={title} />
      <h1>{title}</h1>
      <p>
        hello
      </p>
    </div>
  );
}

render(<App />, document.querySelector("#root"));
