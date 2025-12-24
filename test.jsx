/** @jsx ReactLite.createElement */
import ReactLite from './ReactLite.js';

const TestComponent = () => {
    const [message, setMessage] = ReactLite.useState("test component");
    const [count, setCount] = ReactLite.useState(0);
    const testRef = ReactLite.useRef(0);

    ReactLite.useEffect(() => {
        console.log("count increased ${count}");
        return () => console.log("clean up function");
    }, [count]);

    return (
        <div>
            <h1>{message}</h1>
            <p>teste testestet</p>
            <input
                onchange={(e) => setMessage(e.target.value)}
                value={message}
                placeholder="type something..."
            />
            <br />
            <br />
            <button onclick={() => {console.log("clicked ref button"); testRef.current = 5}}>
                Test Ref: {testRef.current}
            </button>
            <button onclick={() => setCount(count + 5)}>
                Count: {count}
            </button>
        </div>
    );
}

ReactLite.setRootComponent(TestComponent, document.querySelector("#root"));
// ReactLite.render(<TestComponent />, document.querySelector("#root"));
