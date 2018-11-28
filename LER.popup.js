"use strict";
/**
 * 建立浮動視窗的程式碼太繁瑣，所以集中到這個檔案來。
 */
{
// 遠端資料根目錄
const remoteDocRoot = "https://cdn.jsdelivr.net/gh/kong0107/mojLawSplitJSON@gh-pages";

// 語法糖
const e = domCrawler.createElement;

// 樣板，用於複製
const modalTemplate = e("div", {className: "LER-modal-container"},
    e("div", {className: "LER-modal-before"}),
    e("div", {className: "LER-modal"}),
    e("div", {className: "LER-modal-after"})
);

// 判斷事件座標是不是發生在某元件內部
const isEventInElem = (event, elem) => {
    const rect = elem.getBoundingClientRect();
    return (
        event.pageX >= Math.floor(rect.left + window.scrollX) &&
        event.pageX <= Math.ceil(rect.right + window.scrollX) &&
        event.pageY >= Math.floor(rect.top + window.scrollY) &&
        event.pageY <= Math.ceil(rect.bottom + window.scrollY)
    );
};

/**
 * 非同步抓取法條們的內文，建立成 HTML Element 。
 */
const loadArticles = async(pcode, compRanges) => {
    // 先把範圍轉成較簡單的格式，才方便比對哪幾條在這些範圍中。
    const ranges = compRanges
        .filter(r => r["from"][0].stratum == "條")
        .map(r => {
            const f = r["from"][0];
            const start = f.number * 100 + (f.append || 0);
            if(!r.to || r.to.stratum !== "條") return start;
            const end = r.to.number * 100 + (r.to.append || 0);
            return [start, end];
        })
    ;

    const law = await fetch(
        `${remoteDocRoot}/FalVMingLing/${pcode}.json`
    ).then(res => res.json());
    const articles = law["法規內容"].filter(article => {
        if(!article["條號"]) return false;
        const am = /(\d+)(-(\d+))?/.exec(article["條號"]);
        const artNum = parseInt(am[1]) * 100 + parseInt(am[2] ? am[3] : 0);
        for(let i = 0; i < ranges.length; ++i) {
            const r = ranges[i];
            if(typeof r === "number") {
                if(r === artNum) return true;
                else continue;
            }
            if(r[0] <= artNum && artNum <= r[1]) return true;
        }
        return false;
    }).map(article => e("dl", null,
        e("dt", null, article["條號"]),
        e("dd", null, createList(lawtext2obj(article["條文內容"])))
    ));

    return e("div", null,
        e("header", null, law["法規名稱"]),
        ...articles
    );
};

/**
 * 本檔案主程式：回傳用於在滑鼠移過時要顯示條文內容的函式
 * 只在第一次要顯示時才建立元件與讀取資料
 */
LER.popupArticles = (pcode, ranges) => {
    let popup;
    return event => {
        const elem = event.target;
        if(!popup) {
            popup = document.body.appendChild(modalTemplate.cloneNode(true));

            const body = popup.childNodes[1];
            body.append("讀取中");
            loadArticles(pcode, ranges).then(doc => {
                body.lastChild.remove();
                body.appendChild(doc);
            });

            /**
             * 滑鼠離開某元件時，如果也已不再另一元件的話才隱藏浮動窗
             * 不宜用 `MouseEvent.relatedTarget` ，因為那會抓到預期的對象的子元件。
             * （類似 mouseleave 和 mouseout 差異的問題）
             */
            elem.addEventListener("mouseleave", event => {
                if(!isEventInElem(event, popup)) popup.style.display = "none";
            });
            popup.addEventListener("mouseleave", event => {
                if(!isEventInElem(event, elem)) popup.style.display = "none";
            });

        }
        else popup.style.display = "";

        /**
         * 使用者可能調整過視窗尺寸，所以要每次重新算浮動窗的位置。
         * 位置：Y軸即目標元素的下緣；X軸位置即視滑鼠在目標元素的比例，但不能讓浮動窗超過畫面寬度。
         * 位置跟尺寸的資訊必須在元素顯示後才能取得，所以這一段不能放在前面。
         *
         * 注意 `Element.getBoundingClientRect` 取得的位置是相對於顯示畫面，而非相對於文件左上角。
         * 不過如果只是算比例，到是仍可以用之跟 MouseEvent.clientX 相加減。
         */
        const rect = event.target.getBoundingClientRect();
        popup.style.top = rect.bottom + window.scrollY + "px";

        let left = rect.left + window.scrollX;
        left += Math.max(rect.width - popup.offsetWidth, 0) * (event.clientX - rect.left) / rect.width;
        if(left + popup.offsetWidth > document.body.clientWidth)
            left = document.body.clientWidth - popup.offsetWidth;
        popup.style.left = left + "px";

        // 箭頭的位置：跟著滑鼠座標的X值，但不能超出浮動窗本身。
        const arrow = popup.firstChild;
        let arrowLeft = Math.min(
            event.pageX - left - arrow.offsetWidth / 2,
            popup.offsetWidth - arrow.offsetWidth
        );
        arrow.style.marginLeft = Math.max(arrowLeft, 0) + "px";
    };
};

}