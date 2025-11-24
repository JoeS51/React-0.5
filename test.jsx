/** @jsx ReactLite.createElement */
import ReactLite from './ReactLite.js';

const TestComponent = () => {
    const [message, setMessage] = ReactLite.useState("test component");
    const [count, setCount] = ReactLite.useState(0);

    ReactLite.useEffect(() => {
        console.log("Test component mounted");
    }, []);

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
            <button onclick={() => setCount(count + 1)}>
                Count: {count}
            </button>
        </div>
    );
}

ReactLite.setRootComponent(TestComponent, document.querySelector("#root"));
ReactLite.render(<TestComponent />, document.querySelector("#root"));
ReactLite.executeEffect();