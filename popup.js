"use strict";

const $ = s => document.querySelector(s);

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
$("#parseTheCurrentTab").addEventListener("click", () =>
    sendMessageToCurrentTab({command: "parse"})
);

// 「更新」的 span
$("#updateSpan").addEventListener("click", event => {
    const self = event.target;
    self.firstChild.replaceWith("更新中…");
    chrome.runtime.sendMessage({command: "update"}, () => self.remove());
});
