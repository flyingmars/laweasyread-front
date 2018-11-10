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
    let container = document.body;
    const skippableTags = "TEXTAREA,STYLE,SCRIPT,CODE,A,BUTTON,SELECT,SUMMARY,TEMPLATE".split(",");

    /*const re = new RegExp("(" + LER.laws.map(law=>law.name).join("|") + ")", "g");
    const getLawByName = name => LER.laws.find(law => law.name == name);*/

    /**
     * 仿照 React.createElement
     */
    const createElement = (type, props, ...children) => {
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

    const createLawLink = (law, text) => createElement("a", {
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

        // 嗯…舊版那種超長的正規表達式果然較慢
        /*const splitted = text.split(re).map((part, index) =>
            (index % 2) ? createLawLink(getLawByName(part)) : part
        );*/

        let splitted = [text];
        for(let index = getIndex(text.length); index < LER.laws.length; ++index) {
            const law = LER.laws[index];

            for(let i = splitted.length - 1; i >= 0; --i) {
                const frag = splitted[i];
                if(typeof frag != "string" || frag.length < law.name.length) continue;

                const debris = frag.split(law.name);
                if(debris.length == 1) continue;
                debug.counter.match++;

                // 自己塞反而比較慢呢
                /*const tail = splitted.slice(i + 1);
                splitted.splice(i, Infinity);
                debris.forEach((d, j) => {
                    if(j) splitted.push(createLawLink(law));
                    if(d) splitted.push(d);
                });
                splitted = splitted.concat(tail);*/

                for(let j = debris.length - 1; j > 0; --j) debris.splice(j, 0, createLawLink(law));
                splitted.splice(i, 1, ...debris);
            }

            /*const wow = splitted.map(item => {
                if(typeof item != "string" || item.length < law.name.length) return [item];
                const arr = item.split(law.name);
                for(let i = arr.length - 1; i > 0; --i) arr.splice(i, 0, createLawLink(law));
                return arr;
            });
            splitted = wow.reduce((acc, val) => acc.concat(val));*/
            //splitted = [].concat.apply([], wow);    ///< 比上面用 Array#reduce 慢
            //splitted = wow.flat(1); ///< 比上面只用 Array#concat 慢

        }
        if(splitted.length == 1) return debug.counter.noMatch++;
        //splitted = splitted.filter(item => (typeof item != "string") || item.length);
        textNode.replaceWith(...splitted);
    };

    return elem => {
        const start = new Date;
        container = elem;
        getTextNodes(elem).forEach(parseText);
        console.log("LER spent " + ((new Date) - start) + " ms.");
        console.log(debug.counter);
    };
})();

LER.parse(document.body);
