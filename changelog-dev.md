# 「法規亦毒氣」開發紀錄

這是給程式設計師看的版本。一般使用者請參閱 [changelog.md](changelog.md) 。

## 1.1.1
2018-12-02
* 增加 LICENSE 和 changelog-dev.md

## 1.1.0
2018-12-02
* 使用 [mozilla/webextension-polyfill](https://github.com/mozilla/webextension-polyfill) ，改寫為亦支援 Firefox 與 Opera 。
* 改為非同步轉換（搭配 domCrawler 的更新），以避免轉換期間網頁不能動。

## 1.0.1
2018-12-01
* 安裝時即讀取 `aliases.json` 。
* 大法官解釋的連結與預覽

## 1.0.0
2018-11-30
* 完全重寫，增加程式碼可讀性並使用 ES6 語法。
* 將 DOM 的處理拆給另一個專案 [domCrawler](https://github.com/kong0107/domCrawler/) 。
* 將「把換行字元的排版方式解析成項款目結構」的功能拆給另一個專案 [lawtext2obj](https://github.com/kong0107/lawtext2obj/) 。
* 將資料外包給其他專案 [mojLawSplitJSON](https://github.com/kong0107/mojLawSplitJSON) 和 [jyi](https://github.com/kong0107/jyi) ，讀取其在 jsDelivr 的檔案。
* 彈出框改讀取遠端資料再顯示，而不再內嵌網頁。（以解決 #30 與 #24 ）
* 讓使用者選擇條號轉換的方式。（對應 #28 ）
