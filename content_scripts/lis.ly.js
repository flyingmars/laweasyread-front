"use strict";

/**
 * 這邊跟 lawtext2obj 很像，但其實空格排版的機制不同。
 */
const stratumRE = [
    /^(?! )/,
    /^第[一二三四五六七八九十]+類：/,          // 所得稅法第14條第1項
    /^[一二三四五六七八九十]+(、|　|  )/,  // 憲法裡的「款」有些是全形空格，有些是兩個半形空格
    /^[\(（][一二三四五六七八九十]+[\)）]/, // 有些括號是全形，有些是半形
    /^\d+\./,
    /^[\(（]\d+[\)）]/
];
const getStratum = text => {
    for(let i = stratumRE.length - 1; i >= 0; --i)
        if(stratumRE[i].test(text)) return i;
    return -1;
};

const start = new Date;
document.querySelectorAll("td").forEach(td => {
    if(!td.hasChildNodes() || !/^\s*　　/.test(td.firstChild.textContent)) return;
    const className = td.className;

    /**
     * 修正理由欄
     * 目前假設理由欄只分一層，但其實也有再分層的，例如洗錢防制法第3條於0950505 的修正理由
     */
    if(/^\n?　　一、/.test(td.firstChild.textContent)) {
        const lis = Array.from(td.childNodes)
            .filter(child => child.nodeType == 3)
            .map(textNode => domCrawler.createElement(
                "li",
                {style: {textIndent: "-2em"}},
                textNode.textContent.trim()
            ))
        ;
        td.replaceWith(domCrawler.createElement("td", {className},
            domCrawler.createElement("ul", {style: {listStyleType: "none"}}, ...lis)
        ));
        return;
    }

    let warning = false;
    let paras = []; // 每一行文字，即各項款目
    let others = []; // 原本頁面中有、不打算處理但仍要保留的元件

    const childs = td.childNodes;
    childs.forEach((child, index) => {
        /**
         * 如果是文字，那就是法條的一個項/款/目，先集中起來再做分層；
         * 如果是 FONT ，那就是網站的關鍵字標註（在全文搜尋時會發生），要跟前後併再一起；
         * 如果是 BR ，那就跳過。
         * 如果是其他，那就集中起來最後一起挪到最後。（已知的其實只有「相關條文」的圖鈕）
         */

        const lastPara = paras[paras.length - 1];
        switch(child.nodeName) {
            case "#text":
                const text = child.textContent.trim();
                if(!text) return;
                if(index && childs[index - 1].nodeName === "FONT") {
                    lastPara.text += text;
                    lastPara.nodes.push(text);
                    return;
                }
                const stratum = getStratum(text);
                if(stratum === 1) warning = "category"; // 標示所得稅法第14條
                paras.push({
                    stratum: stratum,
                    text: text,
                    nodes: [text],
                    children: []
                });
                return;
            case "FONT":
                lastPara.text += child.textContent;
                lastPara.nodes.push(child);
                return;
            case "BR":
                return;
            default:
                others.push(child);
        }


        /*if(child.nodeType == 3) {
            const text = child.textContent.trim();
            if(!text) return;

            // 處理立法院法律系統的內文搜尋標示
            if(index && td.childNodes[index - 1].nodeName === "FONT") {
                paras[paras.length - 1].text += text;
                return;
            }

            const stratum = getStratum(text);
            if(stratum == 1) warning = true; // 標示所得稅法第14條
            paras.push({
                text: text,
                stratum: stratum,
                children: []
            });
            return;
        }
        // 處理立法院法律系統的內文搜尋標示
        if(child.nodeName === "FONT") {
            paras[paras.length - 1].text += child.textContent;
            return;
        }
        if(child.nodeName === "BR") return;
        others.push(child);*/
    });

    if(warning) return; // 如果是所得稅法第14條，就先不處理…

    td.replaceWith(domCrawler.createElement("td", {className},
        createList(lawtext2obj.arr2nested(paras)),
        ...others
    ));
});
console.log("Parse lines to ULs: " + ((new Date) - start) + " ms.");


/**
 * 設定預設法規
 */
{
let lawName;
try {
    lawName = document.querySelector("td.law_NA").firstChild.textContent;
} catch(e){}
try {
    lawName = document.querySelector("td.law_n").firstChild.textContent;
} catch(e){}

if(lawName) LER.loadLaws.then(() => {
    LER.defaultLaw = LER.getLaw({name: lawName});
});
}


/**
 * 搭配 `popup.html` 的表單以強制啟動立法院法律系統的搜尋功能。
 */
if(!location.search) {
    const input = document.getElementsByName("_1_5_T")[0];
    if(input && input.value)
        document.getElementsByName("_IMG_檢索")[0].click();

}