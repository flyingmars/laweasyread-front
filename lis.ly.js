"use strict";
// 參考 https://github.com/g0v/laweasyread-front/blob/master/ly.js

const e = LER.createElement;

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

document.querySelectorAll("td").forEach(td => {
    if(!td.hasChildNodes() || !/^\n　　/.test(td.firstChild.textContent)) return;

    /**
     * 這邊跟 lawtext2obj 很像，但就衝著第14條第1項第1類第2段那種情形，不方便寫成同一個函式
     */
    let warning = false;
    let nested = []; // 巢狀法條結構
    let paras = []; // 每一行文字，即各項款目
    let others = []; // 原本頁面中有、不打算處理但仍要保留的元件

    td.childNodes.forEach(child => {
        /**
         * 如果是文字，那就是法條的一個項/款/目，先集中起來再做分層；
         * 如果是其他，那就集中起來最後一起挪到最後。（已知的其實只有「相關條文」的圖鈕）
         */
        if(child.nodeType == 3) {
            const text = child.textContent.trim();
            if(!text) return;
            paras.push({
                text: text,
                stratum: getStratum(text),
                children: []
            });
            return;
        }
        if(child.nodeName == "BR") return;
        others.push(child);
    });

    /**
     * 把項目塞到「前一個比自己高層級」的 children 裡。
     */
    paras.forEach((para, i) => {
        const s = para.stratum;
        if(s < 0) throw new Error("分層錯誤");
        if(s == 0) {
            nested.push(para);
            return;
        }
        if(s == 1) { // 在立法院法律系統，所得稅法第14條第1項第1類第2段沒法跟「項」做區別。
            para.warning = true;
            warning = true;
        }
        for(let j = i - 1; j >= 0; --j)
            if(paras[j].stratum < s) {
                paras[j].children.push(para);
                return;
            }
    });
    paras.forEach(para => {
        if(!para.children.length) delete para.children;
    });
    
    if(warning) return; // 如果是所得稅法第14條，就先不處理…

    td.replaceWith(e("td", null,
        LER.createList(nested),
        ...others
    ));

});
