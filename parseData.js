/**
 * 開發者輸出 data.js 用。
 *
 * 由另一專案讀取所有法規資料，
 * 而後依法規名稱長度，由長至短排序後輸出成 JS 檔，供後續於前端或瀏覽器外掛讀取。
 */
const fs = require("fs");

const mojData = JSON.parse(fs.readFileSync("../mojLawSplit/json/index.json").toString());
const aliases = JSON.parse(fs.readFileSync("./aliases.json").toString());

/**
 * 把讀入的暱稱轉為一個暱稱一筆法規
 * TODO: 自動加入對應的施行細則（如果有的話）的簡稱
 */
for(let PCode in aliases) {
    const fullName = mojData.find(law => law.PCode == PCode).name;
    aliases[PCode].forEach(name =>
        mojData.push({PCode, name, fullName})
    );
}


/**
 * 找出法規名稱最後面有修訂日期的那些，塞入一筆最新版的對照。
 */
const namesWithoutDates = mojData.reduce((acc, cur) => {
    const match = /（新?\s?(\d+\.\d+\.\d+)\s?訂定）$/.exec(cur.name);
    if(!match) return acc;
    const name = cur.name.substring(0, match.index);
    const newItem = {PCode: cur.PCode, name};
    //console.log(newItem);

    // 如果已經有同名的法規，那就看誰的 PCode 比較大（「應該」也就比較新）
    const existing = acc.findIndex(law => law.name == name);
    if(existing != -1) {
        const e = acc[existing];
        if(e.PCode < cur.PCode) acc[existing] = newItem;
    }
    else acc.push(newItem);

    return acc;
}, []);


mojData.sort((a, b) => b.name.length - a.name.length);
const json = JSON.stringify(mojData, ["PCode", "name", "fullName"], 1);
fs.writeFileSync("./data.json", json);
