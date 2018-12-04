"use strict";

/**
 * 取得資料
 * @param {string} updateDate 本地資料庫的版本
 * @param {string} remoteDate 已偵測到遠端的版本
 * @param {number} lastCheckUpdate 日期物件的毫秒數
 */

getData([
    "updateDate",
    "remoteDate",
    "lastCheckUpdate"
]).then(storage => {
    if(storage.updateDate) setContent("#updateDate", storage.updateDate);
    else hide("#updateDateContainer");

    const ub = $("#updateButton");
    if(storage.remoteDate > storage.updateDate) {
        setContent(ub, `更新到 ${storage.remoteDate}`);
        ub.classList.add("btn-info");
    }
    else ub.classList.add("btn-primary");

    if(storage.lastCheckUpdate)
        setContent(
            "#lastCheckUpdate",
            (new Date(storage.lastCheckUpdate)).toLocaleString()
        );
    else hide("#lastCheckUpdateContainer");
});


/**
 * 設定「檢查更新」鈕
 * 結果分為「安裝更新」和「不用更新」。
 */
$("#updateButton").addEventListener("click", event => {
    const self = event.target;
    const cl = self.classList;
    hide("#lastCheckUpdateContainer");
    setContent(self, "檢查更新中…");
    cl.remove("btn-primary", "btn-info");
    cl.add("btn-warning");
    browser.runtime.sendMessage({command: "update"})
    .then(newDate => {
        if(newDate) { // 有更新且已安裝
            setContent("#updateDate", newDate);
            setContent(self, "已更新");
            cl.add("btn-success");
        }
        else {
            setContent(self, "無可更新");
            cl.add("btn-secondary");
        }
        show("#updateDateContainer");
        cl.remove("btn-warning");
        self.disabled = true;
        setContent("#lastCheckUpdate", (new Date).toLocaleString());
        show("#lastCheckUpdateContainer");
    });
});
