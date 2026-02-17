/** @jsx ReactLite.createElement */
import ReactLite from "../ReactLite.js";

const App = () => {
  return (
    <div>
      <h1>useCallback</h1>
      <p>Placeholder example page.</p>
    </div>
  );
};

ReactLite.setRootComponent(App, document.querySelector("#root"));
