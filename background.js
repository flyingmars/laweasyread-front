"use strict";

const remoteDocRoot = "https://raw.githubusercontent.com/kong0107/mojLawSplitJSON/gh-pages";

/**
 * 安裝時要做的事
 * @see {@link https://developer.chrome.com/extensions/runtime#event-onInstalled }
 */
chrome.runtime.onInstalled.addListener(() => {
    // 讀取資料
    fetch("./data.json")
    .then(res => res.json())
    .then(laws => setData({laws}))
    .then(() => console.log("Laws loaded."));

    // 設定計時器，用於檢查更新
    chrome.alarms.create("perHour", {
        when: Date.now(),
        periodInMinutes: 60
    });
});

chrome.alarms.onAlarm.addListener(alarm => {
    console.log(alarm);
    checkUpdate();
});


/**
 * 檢查有無更新，並將已知最新的版本日期存起來。
 * @return {Promise} 有較新的資料就回傳新資料的日期字串，若無則回傳 false 。
 */
const checkUpdate = async() => {
    const [vLocal = "", vRemote] = await Promise.all([
        getData("updateDate"),
        fetch(remoteDocRoot + "/UpdateDate.txt").then(res => res.text())
    ]);
    if(vLocal > vRemote || !/^\d{8}$/.test(vRemote)) throw new SyntaxError("UpdateDate format error");
    await setData({remoteDate: vRemote});
    console.log("checkUpdate: " + vRemote);
    if(vLocal == vRemote) return false;
    return vRemote;
}

/**
 * 更新資料
 * @return {Promise}
 */
const update = async() => {
    const vRemote = await checkUpdate();
    if(!vRemote) return;

    const [mojData, aliases] = await Promise.all([
        fetch(remoteDocRoot + "/index.json").then(res => res.json()),
        fetch("./aliases.json").then(res => res.json())
    ]);
    await setData({
        updateDate: vRemote,
        laws: parseData(mojData, aliases)
    });
    console.log("laws updated");
};


/**
 * 訊息處理
 * 注意要回傳 true 才能讓非同步的回呼函式順利運作。
 * @see {@link https://developer.chrome.com/extensions/runtime#event-onMessage }
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log("runtime.onMessage", message);
    switch(message.command) {
        case "checkUpdate":
            checkUpdate().then(sendResponse);
            break;
        case "update":
            update().then(sendResponse);
            break;
        default:
            sendResponse("Error: uncaught message.");
    }
    return true;
});
