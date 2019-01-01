"use strict";

const start = new Date;

// 先把關鍵字換成文字節點，待會再換回來。
const keywords = [];
document.querySelectorAll(".text-pre mark").forEach(markElem => {
    const kw = markElem.textContent;
    if(keywords.indexOf(kw) === -1) keywords.push(kw);
    markElem.replaceWith(kw);
});
const rules = keywords.map(kw => ({
    pattern: kw,
    replacer: domCrawler.createElement("MARK", null, kw),
    minLength: kw.length
}));


// 把BR換行排版的法條內容換成巢狀列表
document.querySelectorAll(".text-pre").forEach(div => {
    div.normalize();
    const text = Array.prototype.filter.call(
        div.childNodes, node => node.nodeType === 3
    ).map(textNode => textNode.textContent).join("\n");

    const elem = createList(lawtext2obj(text));
    domCrawler.replaceTexts(rules, elem);
    while(div.hasChildNodes()) div.lastChild.remove();
    div.classList.remove("text-pre");
    div.append(elem);
});


// 設定預設法規
const params = new URLSearchParams(location.search);
const pcode = params.get("pcode");
if(pcode) LER.loadLaws.then(() =>
    LER.defaultLaw = LER.getLaw({PCode: pcode})
);


console.log("Parse PREs to ULs: " + ((new Date) - start) + " ms.");
