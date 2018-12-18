# Development

## Design Principle

對所有文字節點比對所有法條名稱，然後將單一文字節點依規則替換成新的節點們。


## Milestones

- [x] 比對到法規全名並加上連結
- [x] 比對法規簡稱
- [x] 將中文條號簡化
- [x] 將條號加上連結
- [x] 大法官解釋加上連結
- [x] 滑鼠移過時，顯示相關資訊
- [ ] 裁判書連結
- [ ] 整合立法院資料（連結[ronnywang/tw-law-corpus](https://github.com/ronnywang/tw-law-corpus)）
  - [ ] 法條的引用與被引用情形
  - [ ] 修法理由？
- [ ] 瀏覽器外掛
  - [ ] 主流瀏覽器
    - [x] [Chrome](https://chrome.google.com/webstore/detail/iedodmlnmhobigohbkalkkjlbmdkjalj)
    - [x] [Firefox](https://addons.mozilla.org/zh-TW/firefox/addon/laweasyread/)
    - [x] Opera: 搭配 [Install Chrome Extensions](https://addons.opera.com/en/extensions/details/install-chrome-extensions/)
    - [ ] Edge
  - [x] 常用站台排版
    - [x] 全國法規資料庫的排版
    - [x] 立法院法律系統的排版
    - [ ] 其他政府機關的法規查詢介面
    - [ ] 裁判書？
    - [ ] 法源法律網？
  - [x] 設定頁面
  - [x] 更新法規名稱資料（不含法條）
  - [ ] 下載法規資料庫（包含法條）
  - [ ] 於頁面在例外清單中時，顯示適當標記
- [ ] 允許網站嵌入本專案
  - [ ] 設定轉換選項
  - [ ] 轉成 ES5
  - [ ] 支援 IE


## Files

* `changelog.md`: [更新紀錄](changelog.md)
* `changelog-dev.md`: [開發紀錄](changelog-dev.md)
* `g0v.json`: G0V 專案設定
* `package.json`: Node.js 專案設定
* `maniffest.json`: 瀏覽器擴充功能設定
* `LER.js`: 本專案主程式
* `parseData.js`: 將其他資料轉為本專案所需的資料並存為 `data/laws.js`
* `data/laws.json`: 全國法規資料庫的法規名稱與其編號，由 `/parseData.js` 輸出。
* `data/aliases.json`: 法規的簡稱、暱稱對照，手動維護。
* `data/options_default.json`: 預設的使用者設定。
* `data/exclude_matches_default.txt`: 預設的例外網站清單。


## Data Sources

* [mojLawSplitJSON](https://github.com/kong0107/mojLawSplitJSON)
* [jyi](https://github.com/kong0107/jyi)
* [ronnywang/tw-law-corpus](https://github.com/ronnywang/tw-law-corpus/)


## Dependencies

* [domCrawler](https://github.com/kong0107/domCrawler): 抓取文字節點並套用轉換規則。
* [chinese-parseInt](https://github.com/kong0107/chinese-parseint/): 將中文數字轉成整數。
* [lawtext2obj](https://github.com/kong0107/lawtext2obj/): 將全國法規資料庫那種用換行排版的字串，分析成巢狀陣列。
* [mozilla/webextension-polyfill](https://github.com/mozilla/webextension-polyfill): 方便開發跨瀏覽器的外掛。


## Important Cases

* 不符合中央法規標準法所定的格式：
  * [所得稅法第4條（第1項第16款第2段、第22款第3段）、第14條（第1項第9類第1款第2段）、第17條（第1項第2款第3目之6.(2)）](https://law.moj.gov.tw/LawClass/LawSearchNoIf.aspx?PC=G0340003&DF=&SNo=4%2c14%2c17)
  * [土地法第2條](https://law.moj.gov.tw/LawClass/LawSingleIf.aspx?Pcode=D0060001&FLNO=2)
* 多個條文引用，且條文引用包含「前段」、「但書」等字樣：
  * [行政訴訟法第131條](https://law.moj.gov.tw/LawClass/LawSingle.aspx?Pcode=A0030154&FLNO=131)
* 條文中的算式：
  * [全民健康保險藥物給付項目及支付標準第75條](https://law.moj.gov.tw/LawClass/LawSingleIf.aspx?Pcode=L0060035&FLNO=75)
* 原始資料缺漏一些標點符號：
  * [中央研究院組織法 第7條](https://law.moj.gov.tw/LawClass/LawSingle.aspx?Pcode=A0010016&FLNO=7)第2款


# License

[MIT License](http://en.wikipedia.org/wiki/MIT_License)再加上一條：
被授權人於出版發行、散布、再授權及販售軟體及軟體的副本時，應於MIT授權條款上方或下方加上此規則，並：
* 陳述被授權人對於一個以上之公共議題之立場；或
* 附上與其立場類似之文章之永久連結。

此軟體此版本設定之公共議題為「性別」，立場為「性解放」，支持十歲以上智識者均得自主與人發生性行為與性交易，「性忠貞」並不是「道德」的一部份。（參閱[反守貞地圖．哲學哲學雞蛋糕](http://phiphicake.blogspot.tw/2013/06/blog-post_4.html)。惟亦請留意諸多國家規定與未達法定年齡者合意性交、性交易仍需受刑事或行政處罰。於中華民國，與未滿十六歲者合意猥褻或性交、引誘未滿十八歲者為猥褻或性交，以及與任何人為有對價之性交或猥褻行為，均為法律所禁止。參閱[刑法第227條](http://law.moj.gov.tw/LawClass/LawSingle.aspx?Pcode=C0000001&FLNO=227)、[兒童及少年福利與權益保障法第2條、第49條第9款、第97條第1項](http://law.moj.gov.tw/LawClass/LawSearchNo.aspx?PC=D0050001&SNo=2,49,97)、[兒童及少年性剝削防制條例第2條、第31條](http://law.moj.gov.tw/LawClass/LawSearchNo.aspx?PC=D0050023&SNo=2,31)、[社會秩序維護法第80條](http://law.moj.gov.tw/LawClass/LawSingle.aspx?Pcode=D0080067&FLNO=80)。）


## License Explanation

* 於其軟體再版時，得變更議題與立場、連結。
* 軟體之使用與修改者，無須同意原軟體授權條款中，基於本規則而對特定議題表態之立場。
