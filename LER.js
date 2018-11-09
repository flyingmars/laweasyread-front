if(typeof LER == "undefined") LER = {};
LER.parse = (()=>{
    const debug = {
        counter: {
            ascii: 0,
            nonCJK: 0,
            CJK: 0,
            noMatch: 0
        }
    };

    /**
     * 仿照 React.createElement
     */
    const e = (type, props, ...children) => {
        const elem = document.createElement(type);
        for(let attr in props) elem.setAttribute(attr, props[attr]);
        elem.append.apply(elem, children);
        return elem;
    };

    const getTextNodes = elem => {
        var textNodes = [];
        elem.childNodes.forEach(child => {
            if(child.nodeType == 3) textNodes.push(child);
            else if(child.hasChildNodes())
                textNodes = textNodes.concat(getTextNodes(child));
        });
        return textNodes;
    };

    const createLawLink = (law, text) => e("a", {
        target: "_blank",
        href: "https://law.moj.gov.tw/LawClass/LawAll.aspx?PCode=" + law.PCode,
        title: law.name
    }, text || law.name);

    const parseText = textNode => {
        const text = textNode.textContent;
        if(/^[\x20-\xff]*$/.test(text)) return debug.counter.ascii++; ///< 如果只有字母 ASCII
        if(!/[\u4E00-\u9FFF]/.test(text)) return debug.counter.nonCJK++; ///< 如果完全沒有「中日韓統一表意文字」
        debug.counter.CJK++;

        let splitted = [text];
        LER.data.forEach(law => {
            const wow = splitted.map(item => {
                if(typeof item != "string") return [item];
                const arr = item.split(law.name);
                for(let i = arr.length - 1; i > 0; --i) arr.splice(i, 0, createLawLink(law));
                return arr;
            });
            splitted = [].concat.apply([], wow);
        });
        if(splitted.length == 1) return debug.counter.noMatch++;
        textNode.replaceWith.apply(textNode, splitted);
    };

    return elem => {
        getTextNodes(elem).forEach(parseText);
        console.log(debug.counter);
    };
})();

LER.parse(document.body);
