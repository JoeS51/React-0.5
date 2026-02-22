const React = {
  createElement: (type, props, ...children) => {
    return {
      type,
      props: props || {},
      children: children.flat(),
    };
  }
};

function render(vnode, container) {
  if (typeof vnode === "string" || typeof vnode === "number") {
    container.appendChild(document.createTextNode(String(vnode)));
    return;
  }

  if (typeof vnode.type === "function") {
    const childVNode = vnode.type({ ...(vnode.props || {}), children: vnode.children });
    render(childVNode, container);
    return;
  }

  const domNode = document.createElement(vnode.type);
  vnode.children.forEach(child => render(child, domNode));
  container.appendChild(domNode);
}

export { React, render };
export default React;
