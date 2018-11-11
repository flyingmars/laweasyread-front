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

/**
 * 把 lawtext2obj 的輸出轉成有序列表
 */
LER.createList = paras => {
    const e = LER.createElement;
    const listItems = paras.map(para => {
        const children = (para.children && para.children.length) ? LER.createList(para.children) : "";
        const frags = para.text.split("\n").map(frag => e("p", null, frag)); // 還是為了所得稅法第14條
        return e("li", null, ...frags, children);
    });
    return e("ol", {className: `LER-stratum-${paras[0].stratum}`}, ...listItems);
}
