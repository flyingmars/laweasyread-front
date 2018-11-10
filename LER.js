"use strict";
if(typeof LER == "undefined") LER = {};
LER.parse = (()=>{
    const debug = {
        counter: {
            ascii: 0,
            nonCJK: 0,
            CJK: 0,
            noMatch: 0,
            match: 0,
            longer: 0,
            shorter: 0
        },
        laws: LER.laws
    };
    const skippableTags = "TEXTAREA,STYLE,SCRIPT,CODE,A,BUTTON,SELECT,SUMMARY,TEMPLATE".split(",");

    /**
     * 仿照 React.createElement
     */
    const createElement = (type, props, ...children) => {
        const elem = document.createElement(type);
        for(let attr in props) elem.setAttribute(attr, props[attr]);
        elem.append(...children);
        return elem;
    };

    /**
     * 建立法規的超連結元素
     */
    const createLawLink = (law, text) => createElement("a", {
        target: "_blank",
        href: "https://law.moj.gov.tw/LawClass/LawAll.aspx?PCode=" + law.PCode,
        title: law.name
    }, text || law.name);

    /**
     * 取得所有 TEXT_NODE
     *
     * 遞迴函式，所以會是 DFS 、符合 DOM 中的順序。
     * 會跳過 `skippableTags` 的。
     * TODO: 應該再加上用 CSS 選擇器來排除的機制。
     */
    const getTextNodes = elem => {
        var textNodes = [];
        elem.childNodes.forEach(child => {
            if(child.nodeType == 3) textNodes.push(child);
            else if(!skippableTags.includes(child.tagName) && child.hasChildNodes())
                textNodes = textNodes.concat(getTextNodes(child));
        });
        return textNodes;
    };

    /**
     * 用字串長度找到需要開始比對的法條的索引值
     *
     * 利於跳過那些太長的法規名稱。
     */
    const getIndex = length => {
        const li = LER.lengthIndex;
        if(length >= li.length) {
            debug.counter.longer++;
            return 0;
        }
        debug.counter.shorter++;
        if(length < 2) length = 2; ///< "民法"
        let ii = length;
        while(li[ii] < 0) --ii;
        return li[ii];
    };

    /**
     * 偵測單一文字結點中要轉換的字串，並將結點替換成轉換結果
     *
     * 主程式
     */
    const parseText = textNode => {
        const text = textNode.textContent;

        // 可以跳過的就跳過
        if(text.length < 2) return;
        if(/^[\x20-\xff]*$/.test(text)) return debug.counter.ascii++; //< 如果只有字母 ASCII
        if(!/[\u4E00-\u9FFF]/.test(text)) return debug.counter.nonCJK++; //< 如果完全沒有「中日韓統一表意文字」
        debug.counter.CJK++;


        // 用各個法規名稱把字串切斷，再逐一塞入各法規的超連結
        let splitted = [text];
        for(let index = getIndex(text.length); index < LER.laws.length; ++index) {
            const law = LER.laws[index];

            for(let i = splitted.length - 1; i >= 0; --i) {
                const frag = splitted[i];
                if(typeof frag != "string" || frag.length < law.name.length) continue;

                const debris = frag.split(law.name);
                if(debris.length == 1) continue;
                debug.counter.match++;

                for(let j = debris.length - 1; j > 0; --j) debris.splice(j, 0, createLawLink(law));
                splitted.splice(i, 1, ...debris);
            }

        }

        // 只在曾經有比對到的情形改變 DOM
        if(splitted.length == 1) return debug.counter.noMatch++;
        textNode.replaceWith(...splitted);
    };

    return elem => {
        const start = new Date;
        getTextNodes(elem).forEach(parseText);
        console.log("LER spent " + ((new Date) - start) + " ms.");
        console.log(debug.counter);
    };
})();

LER.parse(document.body);
