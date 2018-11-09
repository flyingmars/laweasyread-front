# Introduction

* 新版，預計用 ES6 實作，並參考（或直接使用） React 。
* 法規名稱資料（暫定）不再從 g0v/laweasyread-data 抓，而是從 kong0107/mojLawSplitJSON 抓。詳見 `parseData.js` 。

## Files

* `README.md`: 此說明文件
* `g0v.json`: G0V 專案設定
* `package.json`: Node.js 專案設定
* `maniffest.json`: Google Chrome 擴充功能設定
* `icon.png`: Google Chrome 擴充功能圖示
* `LER.js`: 本專案主程式
* `data.js`: 法規名稱資料
* `parseData.js`: 將其他資料轉為本專案所需的資料並存為 `data.js`
* `demo.html`: 測試用
