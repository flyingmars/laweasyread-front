/**
 * 一些會用在 content_scripts 的函式
 */
"use strict";

const errorHandler = error =>
    console.log(error);
;

/**
 * 把 lawtext2obj 的輸出轉成有序列表
 */
const createList = paras => {
    if(!paras.length) throw new SyntaxError("Unknown structure.");
    const e = domCrawler.createElement;
    const listItems = paras.map((para, index) => {
        const props = {};
        switch(para.warning) {
            case "fullLine":
                if(para.stratum === 0 && index + 1 < paras.length) {
                    props.className = "LER-warning warning-fullLine";
                    //console.log(para);
                }
                break;
            case "table":
            case "formula":
                return e("li",
                    {className: `LER-warning warning-${para.warning}`},
                    e("pre", null, para.raw.join("\n"))
                );
        }

        const children = (para.children && para.children.length) ? createList(para.children) : "";
        const frags = para.text.split("\n").map(frag => e("p", null, frag)); // 還是為了所得稅法第14條
        return e("li", props, ...frags, children);
    });
    return e("ol", {className: `LER-stratum-${paras[0].stratum}`}, ...listItems);
};


/**
 * 擷取 JSON 檔案並解析
 * 在 HTTP 錯誤的情形也會 reject
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/fetch }
 */
const fetchJSON = (...args) =>
    fetch(...args).then(response =>
        new Promise((resolve, reject) =>
            response.ok ? resolve(response.json()) : reject(response)
        )
    )
;
