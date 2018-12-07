# 法規亦毒氣

此瀏覽器外掛
可將網頁中的法規、條文、大法官解釋加上連結，並可於滑鼠經過時瀏覽其內容；
並對全國法規資料庫與立法院法律系統的網頁進行排版調整。


## 連結

* [Chrome 擴充功能](https://chrome.google.com/webstore/detail/iedodmlnmhobigohbkalkkjlbmdkjalj)
* [Firefox 附加元件](https://addons.mozilla.org/zh-TW/firefox/addon/laweasyread/)
* [更新紀錄](changelog.md)
* [開發文件](README-dev.md)


## 範例

安裝後再瀏覽立法院法律系統：
![立法院法律系統使用成效](https://g0v.github.io/laweasyread-front/images/demo_lis.ly.png)

安裝後再瀏覽全國法規資料庫：
![全國法規資料庫使用成效](https://g0v.github.io/laweasyread-front/images/demo_moj.png)


## 安裝

### 從各瀏覽器的官方網站

* [Chrome 擴充功能](https://chrome.google.com/webstore/detail/iedodmlnmhobigohbkalkkjlbmdkjalj)
* [Firefox 附加元件](https://addons.mozilla.org/zh-TW/firefox/addon/laweasyread/)
* Opera 延伸套件 審核中


### 手動安裝

1. 在[發布頁面](https://github.com/g0v/laweasyread-front/tree/gh-pages/dist)下載所需版本，並解壓縮之。
2. 進入瀏覽器的「擴充功能」設定頁面。
3. 開啟「開發人員模式」。
4. 點選「載入為封裝項目」，尋找步驟一解壓縮後的檔案路徑。


### 網站嵌入

此版本尚不支援網站嵌入，不過 0.4 版的功能還可以運作（只是不會再更新）。請在您的網頁中加入以下的程式碼：

```html
<link rel="stylesheet" href="https://g0v.github.io/laweasyread-front/stylesheets/main.css" crossorigin="anonymous">
<script src="https://g0v.github.io/laweasyread-front/dist/laweasyread.js" crossorigin="anonymous"></script>
<script src="https://g0v.github.io/laweasyread-front/javascripts/embedded2.js" crossorigin="anonymous"></script>
```

示範頁面： https://g0v.github.io/laweasyread-front/demo/0.4.html


## 使用說明

* 僅針對收錄於中華民國法務部的全國法規資料庫的法規。
* 頁面較複雜或資料較多時，不會瞬間轉換完畢。
* 法條連結均連向最新版的條文，因此瀏覽較舊的文章或判決時務必留意條文可能已經變更。
* 法規名稱、法條內文的更新會略晚於全國法規資料庫兩週。
* 已知的難解問題：
  * 條文中的數學公式與表格。
  * 在網頁提到「德國憲法」、「日本憲法」時，「憲法」仍會轉換到中華民國憲法。
  * 在網頁提到「輔仁大學法律系」（或其他學校的法律系）時，當中的「大學法」仍會被比對到。


### 隱私權政策

本程式會：
* 將您的使用設定存在您的電腦中
* 讓您的瀏覽器對第三方網站 `cdn.jsdelivr.net` 進行連線。
  該站是紐約時報也信任的網站服務，因此可以放心，或是親自查閱[他們的隱私權政策](https://www.jsdelivr.com/privacy-policy-jsdelivr-net)。

除了前述網站，本程式不會將您的任何資料傳送給任何人或機構。
