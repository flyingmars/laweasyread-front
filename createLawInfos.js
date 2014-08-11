var dataDir = '../laweasyread-data/data/';
var fs = require('fs');

var lawInfos = [];
var lawNames = [];
var nameMap = {};
var pcodeMap = {};

/** 處理立法院法律系統的法律名稱
  * names[] 第一個是法律現在的全名
  */
console.log("Parse multiple `statute.json`");
var bugs = { /// See g0v/laweasyread-data#14
	'01242': ['著作權集體管理團體條例', '著作權仲介團體條例'],
	'01423': ['海軍服制條例', '海軍服裝條例'],
	'01656': ['金融監督管理委員會銀行局組織法', '行政院金融監督管理委員會銀行局組織法'],
	'01658': ['金融監督管理委員會保險局組織法', '行政院金融監督管理委員會保險局組織法'],
	'01746': null,	///< 沒資料
	'01801': ['法務部調查局組織法', '法務部調查局組織條例', '司法行政部調查局組織條例'],	///< 有三個
	'01812': ['刑事補償法', '冤獄賠償法'],
	'04503': ['最高法院設置分庭條例', '最高法院設置分庭暫行條例'],
	'04527': ['民事訴訟法', '中華民國民事訴訟法'],	///< 順序問題
	'04528': ['民事訴訟法施行法', '中華民國民事訴訟法施行法'],	///< 順序問題
	'04647': ['公務人員撫卹法', '公務員撫卹法'],
	'04655': ['公務人員交代條例', '公務員交代條例'],
	'04828': ['縣參議會組織條例', '縣參議會組織暫行條例'],
	'05177': null,	///< 沒資料
	'90033': ['船舶無線電台條例', '船舶無綫電台條例'/*, '船舶無&#32171;電台條例'*/]		///< 順序與編碼問題
};
var lyIDs = fs.readdirSync(dataDir + 'law');
for(var i = 0; i < lyIDs.length; ++i) {
	var id = lyIDs[i];
	var statute = JSON.parse(fs.readFileSync(dataDir + 'law/' + id + '/statute.json'));
	delete statute.history;

	if(bugs.hasOwnProperty(id)) {
		if(!bugs[id]) continue;
		statute.names = bugs[id];
	}
	else {
		statute.names = [];
		for(j = statute.name.length - 1; j >= 0; --j)
			statute.names.push(statute.name[j].name);
	}
	delete statute.name;

	lawInfos.push(statute);
	lawNames = lawNames.concat(statute.names);
	for(var j = 0; j < statute.names.length; ++j) nameMap[statute.names[j]] = statute;
	if(statute.PCode) pcodeMap[statute.PCode] = statute;
}
console.log(lawNames.length + " full names in " + lawInfos.length + " laws.");

/** 處理全國法規資料庫的法規
  * 有上萬個，若不篩選的話會太多，但須注意：
  * 有「總統副總統選舉罷免法（新 84.08.09 制定）」
  * 和「總統副總統選舉罷免法（舊 36.03.31 制定）」，
  * 也有「情報機關派遣駐外或各省（市）縣（市）情報人員待遇支給標準」，
  * 因此[\s\.（）]是不宜跳過的。
  */
console.log("Parse `pcode.json`");
var pcodes = JSON.parse(fs.readFileSync(dataDir + 'pcode.json'));
for(var i = 0; i < pcodes.length; ++i) {
	var regulation = pcodes[i];
	if(pcodes[i].PCode.charAt(0) == 'Y') continue;	///< 排除國際法
	/// 用名稱來挑選／排除
	/*
	if(!/((法|律|條例|通則)|(規程|規則|細則|辦法|綱要|標準|準則)|(令|編|登記))(（.+）)?$/.test(pcodes[i].name)
		&& ['中華民國憲法增修條文', '宣告動員戡亂時期終止', '動員戡亂時期臨時條款', '憲法實施之準備程序', '海關進口稅則'].indexOf(pcodes[i].name) == -1
	) {
		if(!/[條合專契公]約|(協議|協定|議定|計畫|瞭解|意向|意願)書?|修正案?|備忘錄|議事錄|換文|換函|綱領|宣言|事宜|原則|紀要|意見|合作|照會|協會$/.test(pcodes[i].name))
			console.log(pcodeArr[i].PCode + ' has unrecognized name format:\n' + pcodes[i].name);
		continue;
	}*/
	if(pcodeMap.hasOwnProperty(regulation.PCode)) {
		if(pcodeMap[regulation.PCode].names.indexOf(regulation.name) == -1) {
			lawNames.push(regulation.name);
			nameMap[regulation.name] = pcodeMap[regulation.PCode];
			pcodeMap[regulation.PCode].names.push(regulation.name);
		}
	}
	else {
		var obj = {PCode: regulation.PCode, names: [regulation.name]};
		lawInfos.push(obj);
		lawNames.push(regulation.name);
		nameMap[regulation.name] = obj;
		pcodeMap[regulation.PCode] = obj;
	}
}
console.log(lawNames.length + " full names in " + lawInfos.length + " statutes.");

/** 處理暱稱
  * 這個就不是 laweasyread-data 的檔案，而是本專案的檔案了。
  */
console.log("Parse `aliases.json`");
var aliases = JSON.parse(fs.readFileSync('aliases.json'));
for(var full in aliases) {
	if(!nameMap.hasOwnProperty(full)) {
		console.log("Warning: " + full + " is not found");
		continue;
	}
	nameMap[full].names = nameMap[full].names.concat(aliases[full]);
	nameMap[aliases[full]] = nameMap[full];
	lawNames = lawNames.concat(aliases[full]);

	/// 加上施行法、施行細則
	var enforce = full + '施行法';
	if(nameMap.hasOwnProperty(enforce)) {
		for(var j = 0; j < aliases[full].length; ++j) {
			nameMap[enforce].names.push(aliases[full][j] + '施行法');
			nameMap[aliases[full][j] + '施行法'] = nameMap[enforce];
			lawNames.push(aliases[full][j] + '施行法');
		}
	}
	var enforce = full + '施行細則';
	if(nameMap.hasOwnProperty(enforce)) {
		for(var j = 0; j < aliases[full].length; ++j) {
			nameMap[enforce].names.push(aliases[full][j] + '施行細則');
			nameMap[enforce].names.push(aliases[full][j] + '細則');
			nameMap[aliases[full][j] + '施行細則'] = nameMap[enforce];
			nameMap[aliases[full][j] + '細則'] = nameMap[enforce];
			lawNames.push(aliases[full][j] + '施行細則');
			lawNames.push(aliases[full][j] + '細則');
		}
	}
}
console.log(lawNames.length + " names in " + lawInfos.length + " statutes.");

/// 由長至短排列（以避免遇到「刑法施行法」卻比對到「刑法」）
lawNames.sort(function(a, b){return b.length - a.length;});

fs.writeFileSync('lawInfos.json', JSON.stringify(lawInfos, null, '\t'));
fs.writeFileSync('lawNamePattern.js', 'lawNamePattern=/' + lawNames.join('|').replace(/\./g, '\\.') + '/g;');
for(var name in nameMap) delete nameMap[name].names;
fs.writeFileSync('nameMap.js', 'nameMap=' + JSON.stringify(nameMap).replace(/},/g, '},\n'));
console.log("Output to `lawInfos.json`, `lawNamePattern.js`, and `nameMap.js`.");
