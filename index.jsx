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


const App = () => {
  return (
    <div className="joe-test">
      <h1>TITLE</h1>
      <p>
        hello
      </p>
    </div>
  );
}

const render = (reactElement, container) => {
  console.log(reactElement)
  console.log(container)
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
    console.log(reactElement.props)
    reactElement.children.forEach(child => render(child
      , actualDomElement));
  }
  container.appendChild(actualDomElement);
}

render(<App />, document.querySelector("#root"));
