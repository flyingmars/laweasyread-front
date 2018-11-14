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
    article: "第number條(之number)?(前段|但書)?",
    paragraph: "(第number[項款目])+(前段|但書)?",
    paraList: "paragraph([,、及或和與至到]paragraph)*",
    artFull: "article(paraList)?",
    artRange: "artFull([至到]artFull)*",
    artList: "artRange([,、及或和與]artRange)*"
};
{
    const res = LER.regexps;
    const names = Object.getOwnPropertyNames(res);
    names.forEach((reKey, index) => {
        for(let j = 0; j < index; ++j)
            res[reKey] = res[reKey].replace(RegExp(names[j], "g"), res[names[j]]);
    });
    //console.log(res);
    for(let i in res) res[i] = new RegExp(res[i], "g");
}
