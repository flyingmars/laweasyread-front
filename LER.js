LER = (()=>{
    const getTextNodes = elem => {
        var textNodes = [];
        elem.childNodes.forEach(child => {
            if(child.nodeType == 3) textNodes.push(child);
            else if(child.hasChildNodes())
                textNodes = textNodes.concat(getTextNodes(child));
        });
        return textNodes;
    }

    const createLawLink = (law, text) => React.createElement("a", {
        target: "_blank",
        href: "https://law.moj.gov.tw/LawClass/LawAll.aspx?PCode=" + law.PCode,
        title: law.name
    }, text);

    const createArtLink = (law, artRange, text) => {

    };

    const parseText = textNode => {
        const newNode = React.createElement("span", {className: "LER-test"}, textNode.textContent);
        const container = document.createElement("SPAN");
        ReactDOM.render(newNode, container);
        //textNode.parentNode.replaceChild(container, textNode);
    };

    const parse = elem => getTextNodes(elem).forEach(parseText);
    console.log("test");

    return {
        parse: parse
    };
})();

LER.parse(document.body);
