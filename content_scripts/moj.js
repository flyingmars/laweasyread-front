"use strict";
{
const start = new Date;

/**
 * 標註搜尋的關鍵字
 * 原本全國法規資料庫會在使用者搜尋關鍵字時，在關鍵字加上顏色，但會被 `lawtext2obj` 蓋掉，
 * 所以這邊再手動抓出該關鍵字以進行變色。
 */
const params = new URLSearchParams(location.search);
const rules = [
    {name: "k1", color: "#FF0000"},
    {name: "k2", color: "#429f00"},
    {name: "k3", color: "#CC6600"}
].map(rule => {
    const q = params.get(rule.name);
    if(!q) return null;
    return {
        pattern: q,
        replacer: domCrawler.createElement("SPAN", {style: {color: rule.color}}, q),
        minLength: q.length
    };
}).filter(rule => rule && rule.minLength > 0);

document.querySelectorAll(".TableLawAll td:nth-of-type(3) pre").forEach(pre => {
    const elem = createList(lawtext2obj(pre.textContent));
    domCrawler.replaceTexts(rules, elem);
    pre.replaceWith(elem);
});


/**
 * 設定預設法規
 * 不同頁面的網址變數名稱竟然不一樣，真是太扯了。所以反而不方便用 URLSearchParams
 */
const m = location.search.match(/\Wpc(ode)?=(\w\d{7})(\W|$)/i);
if(m) LER.loadLaws.then(() => {
    LER.defaultLaw = LER.getLaw({PCode: m[2]});
});


console.log("Parse PREs to ULs: " + ((new Date) - start) + " ms.");
}
