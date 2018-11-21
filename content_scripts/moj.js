"use strict";

const start = new Date;
document.querySelectorAll(".TableLawAll td:nth-of-type(3) pre").forEach(pre =>
    pre.replaceWith(createList(lawtext2obj(pre.textContent)))
);
console.log("Parse PREs to ULs: " + ((new Date) - start) + " ms.");

/**
 * 設定預設法規
 * 不同頁面的網址變數名稱竟然不一樣，真是太扯了。所以反而不方便用 URLSearchParams
 */
{
    const m = location.search.match(/\Wpc(ode)?=(\w\d{7})(\W|$)/i);
    if(m) LER.loadLaws.then(() => {
        LER.defaultLaw = LER.getLaw({PCode: m[2]});
    });

}
