/** @jsx ReactLite.createElement */
import ReactLite from "../ReactLite.js";

const initialItems = [
  { id: "a", label: "item 1" },
  { id: "b", label: "item 2" },
  { id: "c", label: "item 3" },
  { id: "d", label: "item 4" },
];

const Item = ({ item }) => {
  return (
    <li data-id={item.id}>
      <span>{item.label}</span>
      <input placeholder={`Type for ${item.label}`} />
    </li>
  );
};

const App = () => {
  const [items, setItems] = ReactLite.useState(initialItems);
  const [useKeys, setUseKeys] = ReactLite.useState(true);

  const reverse = () => {
    setItems([...items].reverse());
  };

  const shuffle = () => {
    const next = [...items];
    for (let i = next.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [next[i], next[j]] = [next[j], next[i]];
    }
    setItems(next);
  };

  const reset = () => {
    setItems(initialItems);
  };

  return (
    <div>
      <h1>Keyed Reconciliation Demo</h1>
      <p>Type in an input, then reorder the list.</p>
      <label>
        <input
          type="checkbox"
          checked={useKeys}
          onchange={() => setUseKeys(!useKeys)}
        />
        Use keys
      </label>
      <div>
        <button onclick={reverse}>Reverse</button>
        <button onclick={shuffle}>Shuffle</button>
        <button onclick={reset}>Reset</button>
      </div>
      <ul>
        {items.map((item) =>
          useKeys ? <Item key={item.id} item={item} /> : <Item item={item} />
        )}
      </ul>
    </div>
  );
};

ReactLite.setRootComponent(App, document.querySelector("#root"));
