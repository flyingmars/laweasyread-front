"use strict";

const e = LER.createElement;

const createList = paras => {
    const listItems = paras.map(para => {
        const children = para.children ? createList(para.children) : "";
        const frags = para.text.split("\n").map(frag => e("p", null, frag)); // 還是為了所得稅法第14條
        return e("li", null, ...frags, children);
    });
    return e("ul", {className: `LER-stratum-${paras[0].stratum}`}, ...listItems);
}

const start = new Date;
document.querySelectorAll(".TableLawAll").forEach(container => {
    container
    .querySelectorAll("td:nth-of-type(3) pre")
    .forEach(pre => {
        pre.replaceWith(createList(lawtext2obj(pre.textContent)));
    });
});
console.log("Parse PREs to ULs: " + ((new Date) - start) + " ms.");

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
