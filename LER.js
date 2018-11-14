"use strict";
if(typeof LER == "undefined") LER = {};
LER.parse = (()=>{
    const skippableTags = "TEXTAREA,STYLE,SCRIPT,CODE,A,BUTTON,SELECT,SUMMARY,TEMPLATE".split(",");

    /**
     * 回傳「是否要跳過這個元素」的函式
     */
    const reject = node => {
        if(skippableTags.includes(node.tagName)) return true;
        if(node.nodeType != 3) return false;

        const text = node.textContent;
        if(text.length < 2) return true;
        if(/^[\x20-\xff]*$/.test(text)) return true; //< 如果只有字母 ASCII
        if(!/[\u4E00-\u9FFF]{2}/.test(text)) return true; //< 如果沒有連續的「中日韓統一表意文字」
        return false;
    };

    /**
     * 建立法規的超連結元素
     */
    const createLawLink = (law, text) => domCrawler.createElement("a", {
        target: "_blank",
        href: "https://law.moj.gov.tw/LawClass/LawAll.aspx?PCode=" + law.PCode,
        title: law.name,
        "data-pcode": law.PCode
    }, text || law.name);

    /**
     * 把法規名稱們弄成替換規則
     */
    const rules = LER.laws.map(law => {
        return {
            pattern: law.name,
            replacer: () => createLawLink(law),
            minLength: law.name.length
        };
    });

    /**
     * 加上條號的判斷
     */
    {
        const cpi = chinese_parseInt;
        const res = LER.regexps;
        rules.push({
            pattern: res.artList,
            replacer: $0 => {
                let match;
                let ranges = "";
                res.artRange.lastIndex = 0;
                while(match = res.artRange.exec($0)) {
                    //console.log(match);
                    if(ranges) ranges += ",";
                    ranges += cpi(match[1]);
                    if(match[3]) ranges += "." + cpi(match[3]);
                    if(match[14]) ranges += "-" + cpi(match[14]);
                    if(match[16]) ranges += "." + cpi(match[16]);
                }
                return {text: $0, rangeText: ranges};
            },
            minLength: 3
        });
    }

    return elem => {
        const start = new Date;

        domCrawler.replaceTexts(rules, elem, reject, arr => {
            arr = arr.filter(x => x);
            return arr.map((item, index) => {
                if(typeof item == "string" || item instanceof Element) return item;
                //const props = {"data-range": item.rangeText, "data-index": index};
                const props = {};
                if(index) {
                    const prevItem = arr[index - 1];
                    if(prevItem instanceof Element && prevItem.dataset.pcode) {
                        //props["data-pcode"] = prevItem.dataset.pcode;
                        props.href = `https://law.moj.gov.tw/LawClass/LawSearchNoIf.aspx?PC=${prevItem.dataset.pcode}&SNo=${item.rangeText}`;
                        props.target = "_blank";
                    }
                }
                return domCrawler.createElement(props.href ? "A" : "EM", props, item.text);
            })
        });
        console.log("LER spent " + ((new Date) - start) + " ms.");
    };
})();
