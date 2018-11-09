if(typeof LER == "undefined") LER = {};
LER.parse = (()=>{
    const debug = {
        counter: {
            ascii: 0,
            nonCJK: 0,
            CJK: 0,
            noMatch: 0,
            longer: 0,
            shorter: 0
        },
        laws: LER.laws
    };
    let container = document.body;
    const skippableTags = "TEXTAREA,STYLE,SCRIPT,CODE,A,BUTTON,SELECT,SUMMARY,TEMPLATE".split(",");

    /**
     * 仿照 React.createElement
     */
    const e = (type, props, ...children) => {
        const elem = document.createElement(type);
        for(let attr in props) elem.setAttribute(attr, props[attr]);
        elem.append(...children);
        return elem;
    };

    const getTextNodes = elem => {
        var textNodes = [];
        elem.childNodes.forEach(child => {
            if(child.nodeType == 3) textNodes.push(child);
            else if(!skippableTags.includes(child.tagName) && child.hasChildNodes())
                textNodes = textNodes.concat(getTextNodes(child));
        });
        return textNodes;
    };

    const createLawLink = (law, text) => e("a", {
        target: "_blank",
        href: "https://law.moj.gov.tw/LawClass/LawAll.aspx?PCode=" + law.PCode,
        title: law.name
    }, text || law.name);

    /**
     * 用字串長度找到需要開始比對的法條的索引值
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
     */
    const parseText = textNode => {
        const text = textNode.textContent;
        if(text.length < 2) return;
        if(/^[\x20-\xff]*$/.test(text)) return debug.counter.ascii++; ///< 如果只有字母 ASCII
        if(!/[\u4E00-\u9FFF]/.test(text)) return debug.counter.nonCJK++; ///< 如果完全沒有「中日韓統一表意文字」
        debug.counter.CJK++;

        let splitted = [text];
        for(let index = getIndex(text.length); index < LER.laws.length; ++index) {
            const law = LER.laws[index];
        //LER.laws.forEach(law => {
            const wow = splitted.map(item => {
                if(typeof item != "string" || item.length < law.name.length) return [item];
                const arr = item.split(law.name);
                for(let i = arr.length - 1; i > 0; --i) arr.splice(i, 0, createLawLink(law));
                return arr;
            });
            splitted = [].concat.apply([], wow);    ///< 這樣竟然比用 Array#flat 快！？
            //splitted = wow.flat(1); ///< 這樣其實比較慢
        //});
        }
        if(splitted.length == 1) return debug.counter.noMatch++;
        textNode.replaceWith(...splitted);
    };

    return elem => {
        const start = new Date;
        container = elem;
        getTextNodes(elem).forEach(parseText);
        debug.timeElapsed = (new Date) - start;
        console.log(debug);
    };
})();

LER.parse(document.body);
