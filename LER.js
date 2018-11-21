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
        title: law.fullName || law.name,
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
            replacer: function($0) {
                let rangeText = "";
                LER.parser.artList(arguments).ranges.forEach(range => {
                    const f = range["from"][0];
                    if(f.stratum != "條") return;
                    if(rangeText) rangeText += ",";
                    rangeText += f.number;
                    if(f.append) rangeText += "." + f.append;
                    if(range.to && range.to.stratum == "條") rangeText += "-" + range.to.number;
                });
                const text = $0.replace(LER.regexps.number, x => ` ${cpi(x, 10)} `);
                return {text: text, rangeText: rangeText};
            },
            minLength: 3
        });
    }

    /**
     * 大法官解釋的判斷
     */
    {
        rules.push({
            pattern: LER.regexps.jyi,
            replacer: function($0) {
                const data = LER.parser.jyi(arguments);
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
    }

    return elem => {
        const start = new Date;

        domCrawler.replaceTexts(rules, elem, reject, arr => {
            arr = arr.filter(x => x); // 濾掉空字串
            return arr.map((item, index) => {
                if(typeof item == "string" || item instanceof Element) return item;
                const props = {};
                if(item.rangeText) {
                    if(index) {
                        const prevItem = arr[index - 1];
                        if(prevItem instanceof Element && prevItem.dataset.pcode)
                            props.href = `https://law.moj.gov.tw/LawClass/LawSearchNoIf.aspx?PC=${prevItem.dataset.pcode}&SNo=${item.rangeText}`;
                        else if((prevItem.endsWith("本法") || prevItem.endsWith("本條例")) && LER.defaultLaw) {
                            const name = LER.defaultLaw.name;
                            const theLaw = LER.getLawByName(name.substring(0, name.length - 4));
                            if(theLaw) props.href = `https://law.moj.gov.tw/LawClass/LawSearchNoIf.aspx?PC=${theLaw.PCode}&SNo=${item.rangeText}`;
                            else console.log("LER error: failed to detect enforcement rule.");
                        }
                    }
                    if(!props.href && LER.defaultLaw)
                        props.href = `https://law.moj.gov.tw/LawClass/LawSearchNoIf.aspx?PC=${LER.defaultLaw.PCode}&SNo=${item.rangeText}`;
                }
                if(props.href) props.target = "_blank";
                return domCrawler.createElement(props.href ? "A" : "EM", props, item.text);
            })
        });
        console.log("LER spent " + ((new Date) - start) + " ms.");
    };
})();
