"use strict";

const $ = s => document.querySelector(s);

// 顯示專案版本
$("#version").append(browser.runtime.getManifest().version);

getData({
    autoParse: false,
    updateDate: "",
    remoteDate: ""
})
.then(storage => {
    $("#autoParse").checked = storage.autoParse;
    if(storage.remoteDate > storage.updateDate) {
        const e = $("#updateSpan");
        e.style.display = "";
        e.title = `可更新至 ${storage.remoteDate} 的法規名稱`;
    }
});

// 自動轉換的 checkbox
$("#autoParse").addEventListener("click", event => {
    const checked = event.target.checked;
    setData({autoParse: checked});
    if(checked) sendMessageToCurrentTab({command: "parse"});
});

// 手動轉換的 button
// TODO: 在不能轉換的頁面（網址為 chrome 開頭的那些）隱藏這個按鈕
// 因為就算是 <all_urls> 也不包含 chrome*:// 協定。
// @see {@link https://developer.chrome.com/extensions/match_patterns }
$("#parseTheCurrentTab").addEventListener("click", () =>
    sendMessageToCurrentTab({command: "parse"})
);

// 「更新」的 span
$("#updateSpan").addEventListener("click", event => {
    const self = event.target;
    self.firstChild.replaceWith("更新中…");
    browser.runtime.sendMessage({command: "update"})
    .then(() => self.remove());
});
