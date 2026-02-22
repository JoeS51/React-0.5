/** @jsx React.createElement */
import React, { render } from "./react.js";

const App = () => {
  return (
    <div id="hi">
      <h1>test</h1>
    </div>
  );
};

render(<App />, document.querySelector("#root"));
