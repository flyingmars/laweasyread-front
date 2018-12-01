"use strict";

//const remoteDocRoot = "https://raw.githubusercontent.com/kong0107/mojLawSplitJSON/gh-pages";
const remoteDocRoot = "https://cdn.jsdelivr.net/gh/kong0107/mojLawSplitJSON@gh-pages";

/**
 * 安裝時要做的事
 */
browser.runtime.onInstalled.addListener(() => {
    // 讀取法規資料
    Promise.all([
        fetch("/data.json").then(res => res.json()),
        fetch("/aliases.json").then(res => res.json())
    ]).then(([mojData, aliases]) =>
        setData({laws: parseData(mojData, aliases)})
    ).then(() => console.log("Laws loaded."));

    // 讀取資料庫的選項，補上預設的後就再存進去。
    fetch("/options_default.json")
    .then(res => res.json())
    .then(getData)
    .then(setData);

    // 設定計時器，用於檢查更新
    browser.alarms.create("perHour", {
        //when: Date.now(),
        periodInMinutes: 60
    });
});

browser.alarms.onAlarm.addListener(alarm => {
    //console.log(alarm);
    checkUpdate();
});


/**
 * 訊息處理
 */
browser.runtime.onMessage.addListener(message => {
    console.log("runtime.onMessage", message);
    switch(message.command) {
        case "checkUpdate":
            return checkUpdate();
        case "update":
            return update();
        default:
            return Promise.reject("Error: uncaught message.");
    }
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
    await setData({
        remoteDate: vRemote,
        lastCheckUpdate: Date.now()
    });
    console.log("checkUpdate: " + vRemote);
    if(vLocal == vRemote) return false;
    return vRemote;
};

/**
 * 更新資料
 * @return {Promise}
 */
const update = async() => {
    const vRemote = await checkUpdate();
    if(!vRemote) return;

    const [mojData, aliases] = await Promise.all([
        fetch(remoteDocRoot + "/index.json").then(res => res.json()),
        fetch("/aliases.json").then(res => res.json())
    ]);
    await setData({
        updateDate: vRemote,
        laws: parseData(mojData, aliases)
    });
    console.log("laws updated");
    return vRemote;
};
