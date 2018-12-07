"use strict";

fetch("https://cdn.jsdelivr.net/gh/g0v/laweasyread-front@v1.x/README.md")
.then(res => res.text())
.then(html => 
    $("#nav-home")
    .html(marked(html))
    .find("a[href]")
    .each((i, elem) => {
        const href = elem.getAttribute("href");
        if(/:\/\//.test(href)) return;
        elem.setAttribute("href", `https://github.com/g0v/laweasyread-front/blob/v1.x/${href}`);
    })
);
