"use strict";
/**
 * 把 lawtext2obj 的輸出轉成有序列表
 */
const createList = paras => {
    const e = domCrawler.createElement;
    const listItems = paras.map(para => {
        const children = (para.children && para.children.length) ? createList(para.children) : "";
        const frags = para.text.split("\n").map(frag => e("p", null, frag)); // 還是為了所得稅法第14條
        return e("li", null, ...frags, children);
    });
    return e("ol", {className: `LER-stratum-${paras[0].stratum}`}, ...listItems);
};
