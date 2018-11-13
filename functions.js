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


/**
 * 比對用的正規表達式們
 */
LER.regexps = {
    number: "([\\d零一二三四五六七八九十百千]+)",
    article: "第number條(之number)?",
    artRange: "article([至到]article)*",
    artList: "artRange([,、及或和與]artRange)*"
};
{
    const res = LER.regexps;
    Object.getOwnPropertyNames(res).reduce((prev, cur) => {
        res[cur] = res[cur].replace(RegExp(prev, "g"), res[prev]);
        return cur;
    });
    for(let i in res) res[i] = new RegExp(res[i], "g");
    //console.log(res);
}
