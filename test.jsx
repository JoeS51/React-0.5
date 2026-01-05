/** @jsx ReactLite.createElement */
import ReactLite from './ReactLite.js';

const expensiveCalculation = (num) => {
    console.log("Expensive calculation running");
    let result = 0;
    for (let i = 0; i < 1000; i++) {
        result += num;
    }
    return result;
}

const TestComponent = () => {
    const [message, setMessage] = ReactLite.useState("test component");
    const [count, setCount] = ReactLite.useState(0);
    const memoVal = ReactLite.useMemo(() => {
        return expensiveCalculation(count);
    }, [count]);
    const testRef = ReactLite.useRef(0);

    ReactLite.useEffect(() => {
        console.log("count increased ${count}");
        return () => console.log("clean up function");
    }, [count]);

    return (
        <div>
            <h1>{message}</h1>
            <p>teste testestet</p>
            <p>Memo: {memoVal}</p>
            <input
                onchange={(e) => setMessage(e.target.value)}
                value={message}
                placeholder="type something..."
            />
            <br />
            <br />
            <button onclick={() => { console.log("clicked ref button"); testRef.current = 5 }}>
                Test Ref: {testRef.current}
            </button>
            <button onclick={() => setCount(count + 5)}>
                Count: {count}
            </button>
            <br />
            <br />
            <button onclick={() => { testRef.current.focus() }}>Test Ref</button>
            <input ref={testRef} />
        </div>
    );
}

ReactLite.setRootComponent(TestComponent, document.querySelector("#root"));
// ReactLite.render(<TestComponent />, document.querySelector("#root"));
