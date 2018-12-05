# 「法規亦毒氣」開發紀錄

這是給程式設計師看的版本。一般使用者請參閱 [`changelog.md`](changelog.md) 。

## 1.2.5
2018-12-05
* 支援把浮動窗固定住。
* 修正一般設定中的存錯資料的問題。
* 還原全國法規資料庫搜尋關鍵字的變色。
* 將遠端存取權限限縮到 `https://cdn.jsdelivr.net/gh/kong0107/` 。

## 1.2.3
2018-12-05
* 取消「偵測到算式／表格」和「可能沒有分段」的警告。
* 新增不處理的選擇器 `.LER-skip` 。
* 修正在立法院法律系統使用關鍵字搜尋時，被標註的關鍵字顯示錯誤的問題。

## 1.2.0
2018-12-05
* 重新編排「設定」頁面。
* 支援用星號的方式標註例外網站格式。（如果規則中有反斜線，仍會被當作正規表達式）
* 將「預設例外清單」的檔案獨立出來，並於更新套件時新增例外清單（而非替換整份清單）。
* 設定頁面改用分頁標籤的模式。（手刻了一個簡易的路由器）
* 更動部分檔案路徑，新增資料夾 `options_ui` 和 `data` 。
* 棄用 marked ，不於選項頁面讀取 `*.md` 。
* 新增 `todo.md` ，記著接下來要做的小事們。

## 1.1.4
2018-12-04
* 修正立法院法律系統的條號顯示。（「條」與「之」字之間有空格）
* 偵測「這裡可能沒有分項」。
* 偵測條文中的表格或算式（由 `lawtext2obj` 實作），並於該項款目不予轉換，用 `<pre />` 放入原本的東西。
* 於偵測到表格或算式時顯示提示。
* 在 `package.json` 的 `script.prepare` 加上 `git submodule update` ，這樣 `npm install` 時就可以把子模組也一起載入。
* <del>可於選項頁面閱覽更新紀錄。</del>（於 1.2.0 版刪除）

## 1.1.1
2018-12-02
* 增加 `LICENSE` 和 `changelog-dev.md` 。
* 將 `manifest.json` 的 `options_page` 改為 `options_ui` 。
* 在整個頁面都沒有比對到法規名稱的情形，不轉換條號。（解決 #24 。參閱變數 `LER.matchedAnyLaw` ）
* 略去處理寬度或高度為 0 的 iFrame 。

## 1.1.0
2018-12-02
* 使用 [mozilla/webextension-polyfill](https://github.com/mozilla/webextension-polyfill) ，改寫為亦支援 Firefox 與 Opera 。
* 改為非同步轉換（搭配 domCrawler 的更新），以避免轉換期間網頁不能動。

## 1.0.1
2018-12-01
* 安裝時即讀取 `aliases.json` 。
* 大法官解釋的連結與預覽。

## 1.0.0
2018-11-30
* 完全重寫，增加程式碼可讀性並使用 ES6 語法。
* 將 DOM 的處理拆給另一個專案 [domCrawler](https://github.com/kong0107/domCrawler/) 。
* 將「把換行字元的排版方式解析成項款目結構」的功能拆給另一個專案 [lawtext2obj](https://github.com/kong0107/lawtext2obj/) 。
* 將資料外包給其他專案 [mojLawSplitJSON](https://github.com/kong0107/mojLawSplitJSON) 和 [jyi](https://github.com/kong0107/jyi) ，讀取其在 jsDelivr 的檔案。
* 彈出框改讀取遠端資料再顯示，而不再內嵌網頁。（解決 #30 ）
* 讓使用者選擇條號轉換的方式。（解決 #28 ）
