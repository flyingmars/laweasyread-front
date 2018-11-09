const fs = require("fs");

const mojData = JSON.parse(fs.readFileSync("../mojLawSplit/json/index.json").toString());
mojData.sort((a, b) => b.name.length - a.name.length);
const json = JSON.stringify(mojData, ["PCode", "name"], 1);
const js = 'if(typeof LER == "undefined") LER = {};\n' + `LER.data = ${json};\n`;
fs.writeFileSync("./data.js", js);
