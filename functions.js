"use strict";
if(typeof LER == "undefined") LER = {};

/**
 * 仿照 React.createElement
 */
LER.createElement = (type, props, ...children) => {
    const elem = document.createElement(type);
    for(let attr in props) {
        switch(attr) {
            case "class":
            case "className":
                elem.className = props.className;
                break;
            default:
                elem.setAttribute(attr, props[attr]);
        }
    }
    elem.append(...children);
    return elem;
};
