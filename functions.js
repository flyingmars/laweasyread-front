"use strict";
/**
 * 這個檔案放一些 LER.parse 不會用到的函式。
 */
if(typeof LER == "undefined") LER = {};

/**
 * 把 lawtext2obj 的輸出轉成有序列表
 */
LER.createList = paras => {
    const e = domCrawler.createElement;
    const listItems = paras.map(para => {
        const children = (para.children && para.children.length) ? LER.createList(para.children) : "";
        const frags = para.text.split("\n").map(frag => e("p", null, frag)); // 還是為了所得稅法第14條
        return e("li", null, ...frags, children);
    });
    return e("ol", {className: `LER-stratum-${paras[0].stratum}`}, ...listItems);
};
