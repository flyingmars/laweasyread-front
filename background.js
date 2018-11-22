"use strict";

/**
 * 讀取資料
 * TODO: 下載、更新為最新版
 * @see {@link https://developer.chrome.com/extensions/runtime#event-onInstalled }
 */
chrome.runtime.onInstalled.addListener(() => {
    fetch("./data.json")
    .then(res => res.json())
    .then(laws => chrome.storage.local.set(
        {laws: laws},
        () => console.log("%d laws are loaded.", laws.length)
    ));
});


/**
 * 檢查有無更新
 * @return {Promise} 有較新的資料就回傳新資料的日期字串，若無則回傳 false 。
 */
const checkUpdate = async() => {
    const pLocal = new Promise(resolve =>
        chrome.storage.local.get({updateDate: ""}, storage => resolve(storage.updateDate))
    );
    const pRemote = fetch("https://raw.githubusercontent.com/kong0107/mojLawSplitJSON/gh-pages/UpdateDate.txt").then(res => res.text());
    const [vLocal, vRemote] = await Promise.all([pLocal, pRemote]);
    if(vLocal > vRemote || !/^\d{8}$/.test(vRemote)) throw new SyntaxError("UpdateDate format error");
    if(vLocal == vRemote) return false;
    return vRemote;
}

/**
 * 更新資料
 * @return {Promise}
 */
const update = async(date) => {
    const [mojData, aliases] = await Promise.all([
        fetch("https://raw.githubusercontent.com/kong0107/mojLawSplitJSON/gh-pages/index.json").then(res => res.json()),
        fetch("./aliases.json").then(res => res.json())
    ]);
    await new Promise(resolve =>
        chrome.storage.local.set({
            updateDate: date,
            laws: parseData(mojData, aliases)
        }, resolve)
    );
    console.log([mojData, aliases, date]);
    return;
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
            update(message.date).then(sendResponse);
            break;
        default:
            sendResponse("Error: uncaught message.");
    }
    return true;
});
