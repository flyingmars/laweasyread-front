"use strict";
if(typeof LER == "undefined") LER = {};
LER.parse = (()=>{
    const skippableTags = "TEXTAREA,STYLE,SCRIPT,CODE,A,BUTTON,SELECT,SUMMARY,TEMPLATE".split(",");

    /**
     * 建立法規的超連結元素
     */
    const createLawLink = (law, text) => domCrawler.createElement("a", {
        target: "_blank",
        href: "https://law.moj.gov.tw/LawClass/LawAll.aspx?PCode=" + law.PCode,
        title: law.name
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
     * 取得所有 TEXT_NODE
     */
    const getTextNodes = node =>
        domCrawler.getTextNodes(node, n => skippableTags.includes(n.tagName))
    ;

    return elem => {
        const start = new Date;
        domCrawler.replaceTexts(rules, elem, n => {
            if(skippableTags.includes(n.tagName)) return true;
            if(n.nodeType != 3) return false;

            const text = n.textContent;
            if(text.length < 2) return true;
            if(/^[\x20-\xff]*$/.test(text)) return true; //< 如果只有字母 ASCII
            if(!/[\u4E00-\u9FFF]/.test(text)) return true; //< 如果完全沒有「中日韓統一表意文字」
            return false;
        })

        console.log("LER spent " + ((new Date) - start) + " ms.");
    };
})();
