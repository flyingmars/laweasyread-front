"use strict";

const start = new Date;
document.querySelectorAll(".TableLawAll td:nth-of-type(3) pre").forEach(pre =>
    pre.replaceWith(LER.createList(lawtext2obj(pre.textContent)))
);
console.log("Parse PREs to ULs: " + ((new Date) - start) + " ms.");

/**
 * 設定預設法規
 * 不同頁面的網址變數名稱竟然不一樣，真是太扯了。所以反而不方便用 URLSearchParams
 */
{
    const m = location.search.match(/\Wpc(ode)?=(\w\d{7})(\W|$)/i);
    if(m) LER.defaultLaw = m[2];
}


/**
 * 友善列印
 */
if(location.pathname.indexOf("_print.aspx") > -1) {
    const table = document.querySelectorAll("table")[2];
    table.removeAttribute("width");
    table.style.width = "100%";
    table.querySelectorAll("td").forEach(td =>
        td.removeAttribute("width", "")
    );
}
