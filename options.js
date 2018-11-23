"use strict";


const $ = s => (typeof s == "string") ? document.querySelector(s) : s;
const hide = elem => $(elem).style.display = "none";
const show = elem => $(elem).style.display = "";
const setContent = (elem, ...nodes) => {
    elem = $(elem);
    while(elem.lastChild) elem.lastChild.remove();
    elem.append(...nodes);
};

const e = domCrawler.createElement;

//hide("#lastCheckUpdateContainer");

fetch("./manifest.json")
.then(res => res.json())
.then(manifest => {
    $("#version").append(manifest.version);
});

fetch("./options_default.json")
.then(res => res.json())
.then(getData)
.then(storage => {
    console.log(storage);
    setContent("#updateDate", storage.updateDate);
    if(storage.remoteDate > storage.updateDate) {
        const ub = $("#updateButton");
        setContent(ub, "更新");
        ub.classList.replace("btn-primary", "btn-warning");
    }
    setContent("#lastCheckUpdate", (new Date(storage.lastCheckUpdate)).toLocaleString());
    $("#autoParse").checked = storage.autoParse;
    setContent("#exclude_matches", storage.exclude_matches);
    $("#artNumberParserMethod-" + storage.artNumberParserMethod).checked = true;
});

/**
 * 條號轉換方式的選擇
 */
const artNumberParserOptions = [
    {
        title: "不轉換",
        value: "none",
        example: "第九十一條之一第二項第五款"
    },
    {
        title: "把中文數字轉成阿拉伯數字",
        value: "parseInt",
        example: "第 91 條之 1 第 2 項第 5 款"
    },
    {
        title: "重組條號的「之」結構",
        value: "hyphen",
        example: "第 91-1 條第 2 項第 5 款"
    }/*,
    {
        title: "使用「§」符號",
        value: "dollar",
        example: "§91-1 第 2 項第 5 款"
    },
    {
        title: "連同「項」跟「款」也用簡記的方式",
        value: "shortest",
        example: "§91-1 Ⅱ⑤"   // 羅馬數字：U+2160~216B ；圓圈數字：U+2460~2473
    }*/
].map(option => {
    const optionProps = {
        type: "radio",
        name: "artNumberParserMethod",
        id: "artNumberParserMethod-" + option.value,
        value: option.value
    };

    return e(
        "tr", null, e(
            "td", null, e(
                "label", null, e(
                    "input", optionProps
                ),
                option.title
            )
        ),
        e("td", null, option.example)
    );
});
$("#artNumberParserOptions").append(...artNumberParserOptions);


/**
 * 相關連結
 */
const links = [
    {
        href: "https://github.com/g0v/laweasyread-front/issues/",
        text: "問題回報",
        title: "Issues on GitHub"
    },
    {
        href: "https://g0v.tw/",
        text: "零時政府"
    },
    {
        href: "https://www.facebook.com/kong.sex/",
        text: "專案發起人",
        title: "阿空"
    }
].map(link => {
    const linkProps = {
        className: "nav-link text-warning",
        href: link.href,
        title: link.title || ""
    };
    return e(
        "li",
        {className: "nav-item"},
        e("A", linkProps, link.text)
    );
});
$(".nav").append(...links);
