function createElement(type, props, ...children) {
	return {
		type,
		props: {
			...props,
			children: children.map(child =>
				typeof child === 'object' ? child : createTextElement(child)
			)
		}
	}
}

function createTextElement(text) {
	return {
		type: 'TEXT_ELEMENT',
		props: {
			nodeValue: text,
			children: []
		}
	}
}

function render(element, container) {
	const dom = element.type === 'TEXT_ELEMENT' ? document.createTextNode('') : document.createElement(element.type)

	const isProperty = key => key !== 'children'
	Object.entries(element.props).forEach(([name, value]) => {
		if (isProperty(name)) {
			dom[name] = value
		}
	})

	element.props.children.forEach(child => render(child, dom))
	container.appendChild(dom)
}

const JoeReact = {
	createElement,
	render,
};

/** @jsx JoeReact.createElement */
const element = (
	<div>
		<h1>Hello from Joe's React</h1>
		<p>this is a pppppp</p>
	</div>
);
const container = document.getElementById("root");
JoeReact.render(element, container);

