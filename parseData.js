/**
 * 開發者輸出 data.js 用。
 *
 * 由另一專案讀取所有法規資料，
 * 而後依法規名稱長度，由長至短排序後輸出成 JS 檔，供後續於前端或瀏覽器外掛讀取。
 */
const fs = require("fs");

const mojData = JSON.parse(fs.readFileSync("../mojLawSplit/json/index.json").toString());
mojData.sort((a, b) => b.name.length - a.name.length);
const json = JSON.stringify(mojData, ["PCode", "name"], 1);

const js = 'if(typeof LER == "undefined") LER = {};\n'
    + `LER.laws = ${json};\n`
;

fs.writeFileSync("./data.js", js);
