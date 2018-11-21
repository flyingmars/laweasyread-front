"use strict";

/**
 * 讀取資料
 * TODO: 下載、更新為最新版
 */
chrome.runtime.onInstalled.addListener(() => {
    fetch("./data.json")
    .then(res => res.json())
    .then(laws => chrome.storage.local.set(
        {laws: laws},
        () => console.log("%d laws are loaded.", laws.length)
    ));
});
