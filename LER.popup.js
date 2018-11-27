"use strict";
/**
 * 建立浮動視窗的程式碼太繁瑣，所以集中到這個檔案來。
 */
{
const remoteDocRoot = "https://cdn.jsdelivr.net/gh/kong0107/mojLawSplitJSON@gh-pages";

// 語法糖們
const e = domCrawler.createElement;
    
    
/**
 * 回傳用於在滑鼠移過時要顯示條文內容的函式
 * 只在第一次要顯示時才建立元件
 */
const popupArticleContent = (pcode, rangeText) => {
    let popup;
    return event => {
        const elem = event.target;
        if(!popup) {
            popup = document.body.appendChild(modalTemplate.cloneNode(true));
            loadArticles(popup.childNodes[1], pcode, rangeText);

            elem.addEventListener("mouseleave", event => {
                if(!isEventInElem(event, popup)) popup.style.display = "none";
            });
            popup.addEventListener("mouseleave", event => {
                if(!isEventInElem(event, elem)) popup.style.display = "none";
            });

        }
        else popup.style.display = "";

        // 使用者可能調整過視窗尺寸，所以位置要每次重新算。
        const rect = event.target.getBoundingClientRect();
        popup.style.top = rect.bottom + window.scrollX + "px";
        popup.style.left = rect.left + window.scrollY + "px";
        popup.firstChild.style.marginLeft = Math.max(event.clientX - rect.left - 7, 0) + "px";
    };
};
const modalTemplate = e("div", {className: "LER-modal"},
    e("div", {className: "LER-modal-header"}),
    e("div", {className: "LER-modal-body"}),
    e("div", {className: "LER-modal-footer"})
);
const isEventInElem = (event, elem) => {
    const point = new DOMPoint(event.pageX, event.pageY);
    const rect = elem.getBoundingClientRect();
    return (
        point.x >= Math.floor(rect.left + window.scrollX) &&
        point.x <= Math.ceil(rect.right + window.scrollX) &&
        point.y >= Math.floor(rect.top + window.scrollY) &&
        point.y <= Math.ceil(rect.bottom + window.scrollY)
    );
};
const loadArticles = (popupBody, pcode, rangeText) => {
    popupBody.append("讀取中…");
    fetch(remoteDocRoot + "/UpdateDate.txt")
    .then(res => res.text())
    .then(text => {
        popupBody.lastChild.remove();
        popupBody.append(text);
    });
};

LER.popupArticles = popupArticleContent;

}