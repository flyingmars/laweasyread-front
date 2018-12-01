/**
 * 一些延伸 WebExtension API 的函式。
 */
"use strict";

/**
 *
 */
const errorHandler = error =>
    console.error(error);
;


/**
 * 抓 browser.storage 裡的資料
 * 把 StorageArea#get 改寫成回傳 promise
 * 在 keys 為字串時，改成直接傳回該筆資料，而不是 {keys: value} 。
 */
const getData = (keys, area = "local") => {
    let promise = browser.storage[area].get(keys);
    if(typeof keys === "string")
        promise = promise.then(s => s[keys]);
    return promise;
};


/**
 * 設定資料
 * 把 StorageArea#set 改寫成回傳 promise
 */
const setData = (items, area = "local") =>
    browser.storage[area].set(items)
;


/**
 * 傳送訊息到當前的分頁
 */
const sendMessageToCurrentTab = message =>
    browser.tabs.query({active: true, currentWindow: true})
    .then(tabs => browser.tabs.sendMessage(tabs[0].id, message))
;


/**
 * 回傳網址是在「需要排除的列表」中的哪一個規則。
 */
const isExcluded = async(href = location.href) =>
    (await getData("exclude_matches"))
    .split("\n")
    .filter(x => x) // 略去空行
    .find(line => RegExp(line).test(href))
;
