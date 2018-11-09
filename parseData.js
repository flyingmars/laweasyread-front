const fs = require("fs");

const mojData = JSON.parse(fs.readFileSync("../mojLawSplit/json/index.json").toString());
mojData.sort((a, b) => b.name.length - a.name.length);
const json = JSON.stringify(mojData, ["PCode", "name"], 1);

const lengthIndex = Array(mojData[0].name.length + 1).fill(-1);
mojData.forEach((law, index) => {
    const length = law.name.length;
    if(lengthIndex[length] < 0) lengthIndex[length] = index;
});

const js = 'if(typeof LER == "undefined") LER = {};\n'
    + 'LER.lengthIndex = ' + JSON.stringify(lengthIndex) + ';\n'
    + `LER.laws = ${json};\n`
;

fs.writeFileSync("./data.js", js);
