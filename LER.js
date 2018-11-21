"use strict";

/**
 * 本專案主要物件
 * 主程式 LER.parse 宣告在文件最末。
 */
const LER = {
    laws: [],
    rules: []
};

{
/****************
 * 語法糖們
 */
const e = domCrawler.createElement;
const cpi = chinese_parseInt;

/**
 * 取得第一個比對結果
 * 全域正規表達式有 lastIndex 的問題，直接這樣寫個函式就不用擔心了。
 */
const reMatch = (regexp, str) => {
    regexp.lastIndex = 0;
    return regexp.exec(str);
};

/**
 * 用正規表達式比對整個目標字串
 * @returns 每次比對結果所組成的陣列
 */
const reMatchAll = (regexp, str) => {
    if(!regexp.global) regexp = new RegExp(regexp, regexp.flags + "g");
    let m, ret = [];
    regexp.lastIndex = 0;
    while(m = regexp.exec(str)) ret.push(m);
    return ret;
};

/**
 * 依指定的屬性找到法規
 * @example
 * // returns {"PCode": "B0000001", "name": "民法"}
 * getLaw({PCode: "B0000001"});
 */
const getLaw = keys => LER.laws.find(law => {
    for(let pn in keys)
        if(law[pn] != keys[pn]) return false;
    return true;
});

/**
 * 回傳「是否要跳過這個元素」的函式
 * TODO: 用 class name 指示應忽略的元素
 */
const skippableTags = "TEXTAREA,STYLE,SCRIPT,CODE,A,BUTTON,SELECT,SUMMARY,TEMPLATE".split(",");
const reject = node => {
    if(skippableTags.includes(node.tagName)) return true;
    if(node.nodeType != 3) return false;
    if(node.isContentEditable) return true;

    const text = node.textContent;
    if(text.length < 2) return true;
    if(/^[\x20-\xff]*$/.test(text)) return true; //< 如果只有字母 ASCII
    if(!/[\u4E00-\u9FFF]{2}/.test(text)) return true; //< 如果沒有連續的「中日韓統一表意文字」
    return false;
};


/****************
 * 字串比對相關
 *
 * 條號結構（未考慮對等連接詞時）：
 * 第X條─┬──────┬─┬──────┬───────────────(next)
 *       └─之X ─┘ ├─但書─┘
 *                ├─前/後段─────────────$
 *                └─至第X條─┬──────┬─$
 *                          └─之X ─┘
 *
 * (con't)─┬──────────────────┬─────────┬─$
 *         └─第X項─┬──────────┤         └─第X款─┬──────┬─┬─────第X目─┬──────┬───…
 *                 ├─但書─────┤                 ├─但書─┘ └─$         ├─但書─┘
 *                 ├─第X類────┴──至第X類──$     │                    │
 *                 ├─前/後段──$                 ├─前/後段──$         ├─前/後段──$
 *                 └─至第X項──$                 └─至第X款──$         └─至第X目──$
 *
 *
 * 不嚴謹但能夠允許上圖的結構：
 * ╟───{part}─┬──────┬─┬─┬─至──{part}─┬─╢
 *   ↑        └─但書─┘ │ ├─[前後]段───┤
 *   └─────────────────┘ └────────────┘
 *
 * 其中{part}即：
 * ╟───第X[條項類款目]──┬─────┬──╢
 *                      └─之X─┘
 */

/**
 * 比對用的正規表達式們
 * 先用字串的方式表達，再依序轉換成正規表達式物件。
 * 若有修改，則要留意括號的數量與位置會影響後續的函式。
 */
const regexps = {
    number: "([\\d零一二三四五六七八九十百千]+)",    // 1

    artPart: "第number([條項類款目])(之number)?(但書)?",  // 5
    artRange: "((artPart)+)([前後]段|([至到])(artPart))?", // 15
    artList: "(artRange)(([,、及或和與])(artRange))*", // 34

    jyi: "((司法院)?(大法官)?釋字)第number號([,、及]第number號)*"
};
const names = Object.getOwnPropertyNames(regexps);
for(let i = 1; i < names.length; ++i) {
    for(let j = i - 1; j >= 0; --j)
        regexps[names[i]] = regexps[names[i]].replace(new RegExp(names[j], "g"), regexps[names[j]]);
}
for(let e in regexps) regexps[e] = new RegExp(regexps[e], "g");

/**
 * 把正規表達式抓到的資料轉成易懂的結構
 * 注意輸入的是 RegExp#exec 的回傳結果，而不是字串。
 *
 * JavaScript 的 RegExp 沒有能一次抓出出現多次的子字串的函式，所以只好自己一步步拆解。
 * @see {@link https://stackoverflow.com/questions/53327130/ }
 * @see {@link https://stackoverflow.com/questions/3537878/ }
 */
const parser = {
    artPart: match => {
        const ret = {
            number: cpi(match[1]),
            stratum: match[2]
        };
        if(match[3]) ret.append = cpi(match[4]);
        if(match[5]) ret.but = true
        return ret;
    },
    artRange: match => {
        const ret = {
            "from": reMatchAll(regexps.artPart, match[1]).map(parser.artPart)
        };
        if(!match[8]) return ret;
        if(!match[9]) {
            ret.part = match[8];
            return ret;
        }
        ret.conj = match[9];
        ret.to = parser.artPart(reMatch(regexps.artPart, match[10]));
        return ret;
    },
    artList: match => {
        let prevIndex = 0;
        const conjunctions = [];
        const ranges = reMatchAll(regexps.artRange, match[0]).map(m => {
            if(prevIndex) conjunctions.push(match[0].substring(prevIndex, m.index));
            prevIndex = m.index + m[0].length;
            return parser.artRange(m);
        });
        return {
            ranges: ranges,
            conjs: conjunctions
        };
    },

    jyi: match => {
        let prevIndex = 0;
        const conjunctions = [];
        const jyis = reMatchAll(regexps.number, match[0]).map(m => {
            if(prevIndex) conjunctions.push(match[0].substring(prevIndex + 1, m.index - 1));
            prevIndex = m.index + m[0].length;
            return cpi(m[0]);
        });
        return {
            previous: match[1],
            jyis: jyis,
            conjs: conjunctions
        };
    }
};


/****************
 * 替換規則們
 */

/**
 * 規則：條號判斷
 */
LER.rules.push({
    pattern: regexps.artList,
    replacer: function($0) {
        let rangeText = "";
        parser.artList(arguments).ranges.forEach(range => {
            const f = range["from"][0];
            if(f.stratum != "條") return;
            if(rangeText) rangeText += ",";
            rangeText += f.number;
            if(f.append) rangeText += "." + f.append;
            if(range.to && range.to.stratum == "條") rangeText += "-" + range.to.number;
        });
        const text = $0.replace(regexps.number, x => ` ${cpi(x, 10)} `);
        return {type: "articles", text: text, rangeText: rangeText};
    },
    minLength: 3
});

/**
 * 規則：大法官解釋
 */
LER.rules.push({
    pattern: regexps.jyi,
    replacer: function($0) {
        const data = parser.jyi(arguments);
        const nodes = [data.previous];
        data.jyis.forEach((jyi, index) => {
            if(index) nodes.push(data.conjs[index - 1]);
            nodes.push(domCrawler.createElement("A", {
                href: "https://www.judicial.gov.tw/constitutionalcourt/p03_01_1.asp?expno=" + jyi,
                target: "_blank"
            }, `第${jyi}號`));
        });
        return domCrawler.createElement("SPAN", {"data-conjList": data.conjs.join()}, ...nodes);
    },
    minLength: 7
});


/****************
 * 把單一文字節點的資料解析完之後，弄成節點陣列
 */
const objArr2nodes = arr => {
    arr = arr.filter(x => x);   // 要先濾掉空字串
    return arr.map((item, index) => {
        if(typeof item == "string" || item instanceof Element) return item;
        switch(item.type) {
            case "law": {
                const law = item.law;
                return e("a", {
                    target: "_blank",
                    href: `https://law.moj.gov.tw/LawClass/LawAll.aspx?PCode=${law.PCode}`,
                    title: law.fullName || law.name,
                    "data-pcode": law.PCode
                }, item.text || law.name)
            }
            case "articles": {
                let theLaw;
                if(index) {
                    const prevItem = arr[index - 1];
                    if(prevItem.type == "law") theLaw = prevItem.law;
                    else if(LER.defaultLaw && LER.defaultLaw.name.endsWith("施行細則") && /本(法|條例)$/.test(prevItem)) {
                        // TODO: 不用每次出現「本法」就再跑一次 getLaw
                        const name = LER.defaultLaw.name;
                        theLaw = getLaw({name: name.substring(0, name.length - 4)});
                    }
                }
                if(!theLaw && LER.defaultLaw) theLaw = LER.defaultLaw;
                if(!theLaw) return e("EM", null, item.text);
                return e("A", {
                    target: "_blank",
                    href: `https://law.moj.gov.tw/LawClass/LawSearchNo.aspx?PC=${theLaw.PCode}&SNo=${item.rangeText}`
                }, item.text);
            }
            default:
                console.log(item);
                throw new TypeError("uncaught type");
        }
    })
};


/****************
 * 主程式：解析指定的節點其內的文字。
 */
const parse = elem => {
    const start = new Date;
    domCrawler.replaceTexts(LER.rules, elem, reject, objArr2nodes);
    console.log("LER spent " + ((new Date) - start) + " ms.");
};

/**
 * 把主程式包裝起來
 * `LER.loadLaws` 是 Promise 物件，建立於其他檔案。
 */
LER.parse = elem => LER.loadLaws.then(() => parse(elem));
LER.getLaw = getLaw; //< TODO: 改成 setDefaultLaw
}
