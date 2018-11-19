"use strict";
/**
 * 這個檔案放一些 LER.parse 不會用到的函式。
 */
if(typeof LER == "undefined") LER = {};

/**
 * 把 lawtext2obj 的輸出轉成有序列表
 */
LER.createList = paras => {
    const e = domCrawler.createElement;
    const listItems = paras.map(para => {
        const children = (para.children && para.children.length) ? LER.createList(para.children) : "";
        const frags = para.text.split("\n").map(frag => e("p", null, frag)); // 還是為了所得稅法第14條
        return e("li", null, ...frags, children);
    });
    return e("ol", {className: `LER-stratum-${paras[0].stratum}`}, ...listItems);
};


/**
 * 比對用的正規表達式們
 * 先用字串的方式表達，再依序轉換成正規表達式物件。
 * 若有修改，則要留意括號的數量與位置會影響後續的函式。
 *
 * 條號結構（未考慮對等連接詞時）：
 * 第X條─┬──────┬─┬──────┬───────────────(next)
 *       └─之X ─┘ ├─但書─┘
 *                ├─前/後段─────────────$
 *                └─至第X條─┬──────┬─$
 *                          └─之X ─┘
 *
 * (con't)─┬──────────────────┬─────────┬─$
 *         └─第X項─┬──────────┤         └─第X款─┬──────┬─┬─────第X目─┬──────┬───$ （但所得稅法第17條第1項第2款第3目…）
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
 *
 */
{
// 一些函示語法糖
const cpi = chinese_parseInt;
const reMatch = LER.reMatch = (regexp, str) => {
    regexp.lastIndex = 0;
    return regexp.exec(str);
};
const reMatchAll = (regexp, str) => {
    if(!regexp.global) regexp = new RegExp(regexp, regexp.flags + "g");
    let m, ret = [];
    regexp.lastIndex = 0;
    while(m = regexp.exec(str)) ret.push(m);
    return ret;
};

/**
 * 比對用的正規表達式們
 * 先宣告成字串，組合後再轉成正規表達式。
 */
const res = LER.regexps = {
    number: "([\\d零一二三四五六七八九十百千]+)",    // 1

    artPart: "第number([條項類款目])(之number)?(但書)?",  // 5
    artRange: "((artPart)+)([前後]段|([至到])(artPart))?", // 15
    artList: "(artRange)(([,、及或和與])(artRange))*", // 34

    jyi: "((司法院)?(大法官)?釋字)第number號([,、及]第number號)*"
};
const names = Object.getOwnPropertyNames(res);
for(let i = 1; i < names.length; ++i) {
    for(let j = i - 1; j >= 0; --j)
        res[names[i]] = res[names[i]].replace(new RegExp(names[j], "g"), res[names[j]]);
}
for(let e in res) res[e] = new RegExp(res[e], "g");


/**
 * 把正規表達式抓到的資料轉成易懂的結構
 * 注意輸入的是 RegExp#exec 的回傳結果，而不是字串。
 *
 * JavaScript 的 RegExp 沒有能一次抓出出現多次的子字串的函式，所以只好自己一步步拆解。
 * @see {@link https://stackoverflow.com/questions/53327130/ }
 * @see {@link https://stackoverflow.com/questions/3537878/ }
 */
const parser = LER.parser = {
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
            "from": reMatchAll(res.artPart, match[1]).map(parser.artPart)
        };
        if(!match[8]) return ret;
        if(!match[9]) {
            ret.part = match[8];
            return ret;
        }
        ret.conj = match[9];
        ret.to = parser.artPart(reMatch(res.artPart, match[10]));
        return ret;
    },
    artList: match => {
        let prevIndex = 0;
        const conjunctions = [];
        const ranges = reMatchAll(res.artRange, match[0]).map(m => {
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
        const jyis = reMatchAll(res.number, match[0]).map(m => {
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

}


LER.getLawByName = name =>
    LER.laws.find(law => law.name == name)
;

LER.getLawByPCode = pcode =>
    LER.laws.find(law => law.PCode == pcode)
;

