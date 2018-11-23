/**
 * 這個檔案是在最後才執行，甚至晚於 `moj.js` 那些。
 *
 * 因為在 `manifest.json` 的 `content_scripts` 區塊中，
 * 不想重複複製可能會越來越多的 `exclude_matches` 陣列，
 * 所以改成在這個檔案中確認 `LER` 是否已經被宣告過，如果未被宣告，就不用執行解析。
 * 其他雖然 LER 有被宣告過，但因故不用解析的情形：
 * * 沒有 document.body ，例如臉書相簿上傳檔案後的跳轉頁面。
 * * 已設定為不用自動轉換的頁面。
 *
 */
"use strict";

let parse = () => {};

if(typeof LER == "object" && document.body) {
    parse = () => LER.parse(document.body);
    getData("autoParse").then(autoParse => {
        if(autoParse) parse();
    });
}

chrome.runtime.onMessage.addListener(message => {
    switch(message.command) {
        case "parse":
            parse();
            break;
        default:
            console.log("Error: uncaught message.");
    }
});
