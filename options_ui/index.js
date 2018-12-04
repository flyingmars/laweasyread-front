"use strict";

const e = domCrawler.createElement;
const domParser = new DOMParser();
const hash = location.hash.substring(1);

const $ = (s, n = document) => (typeof s === "string") ? n.querySelector(s) : s;
const setContent = (elem, ...nodes) => {
    elem = $(elem);
    while(elem.hasChildNodes()) elem.lastChild.remove();
    elem.append(...nodes);
};
const hide = elem => $(elem).style.display = "none";
const show = elem => $(elem).style.display = "";


// 讀取並顯示專案版本
fetch("/manifest.json")
.then(res => res.json())
.then(manifest => {
    $("#version").append(manifest.version);
});


/**
 * 自己刻一個簡單的 router
 */
const routes = [
    {
        name: "general",
        title: "選項"
    },
    {
        name: "exclusion",
        title: "例外"
    },
    {
        name: "update",
        title: "更新"
    },
    {
        name: "docs",
        title: "關於"
    }
];

let activeTab;
const tabs = [];
const containers = [];
routes.forEach((route, index) => {
    const tab = e("li", {className: "nav-item"},
        e("a",
            {
                className: "nav-link",
                href: `#${route.name}`,
                onclick: event => event.preventDefault()
            },
            route.title
        )
    );
    tabs.push(tab);
    $("#navbar").appendChild(tab);

    const container = e("div", {id: `name-${route.name}`});
    containers.push(container);

    const main = $("main");
    tab.addEventListener("click", () => {
        if(tab.classList.contains("active")) return;

        tabs.forEach(t => t.classList.remove("active"));
        tab.classList.add("active");
        if(main.hasChildNodes()) main.lastChild.remove();
        main.appendChild(container);
        history.replaceState(null, null, `#${route.name}`);
        activeTab = tab; // 其實用不到

        // 只在第一次顯示此元件時讀取內容
        if(container.hasChildNodes()) return;
        fetch(`${route.name}.html`)
        .then(res => res.text())
        .then(html => {
            container.append(...domParser.parseFromString(html, "text/html").body.childNodes);
            $("main").appendChild(container);
            document.body.appendChild(e("script", {src: `${route.name}.js`}));
        });
    });

    if(!index || hash === route.name) activeTab = tab;
});

activeTab.dispatchEvent(new Event("click"));
