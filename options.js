"use strict";

const e = domCrawler.createElement;
const $ = s => (typeof s == "string") ? document.querySelector(s) : s;
const hide = elem => $(elem).style.display = "none";
const show = elem => $(elem).style.display = "";
const setContent = (elem, ...nodes) => {
    elem = $(elem);
    while(elem.lastChild) elem.lastChild.remove();
    elem.append(...nodes);
};

/**
 * 讀取資料並設定最初的顯示值
 */
fetch("./manifest.json")
.then(res => res.json())
.then(manifest => {
    $("#version").append(manifest.version);
});

fetch("./options_default.json")
.then(res => res.json())
.then(getData)
.then(storage => {
    //console.log(storage);
    setContent("#updateDate", storage.updateDate);

    const ub = $("#updateButton");
    if(storage.remoteDate > storage.updateDate) {
        setContent(ub, `更新到 ${storage.remoteDate}`);
        ub.classList.add("btn-info");
    }
    else ub.classList.add("btn-primary");

    setContent("#lastCheckUpdate", (new Date(storage.lastCheckUpdate)).toLocaleString());
    $("#autoParse").checked = storage.autoParse;
    setContent("#exclude_matches", storage.exclude_matches);
    $("#artNumberParserMethod-" + storage.artNumberParserMethod).checked = true;
});
hide("#saveButton");

/**
 * 設定「檢查更新」鈕
 * 結果分為「安裝更新」和「不用更新」。
 */
$("#updateButton").addEventListener("click", event => {
    const self = event.target;
    const cl = self.classList;
    hide("#lastCheckUpdateContainer");
    setContent(self, "檢查更新中…");
    cl.remove("btn-primary", "btn-info");
    cl.add("btn-warning");
    chrome.runtime.sendMessage({command: "update"}, newDate => {
        if(newDate) { // 有更新且已安裝
            setContent("#updateDate", newDate);
            setContent(self, "已更新");
            cl.add("btn-success");
        }
        else {
            setContent(self, "無可更新");
            cl.add("btn-secondary");
        }
        cl.remove("btn-warning");
        self.disabled = true;
        setContent("#lastCheckUpdate", (new Date).toLocaleString());
        show("#lastCheckUpdateContainer");
    });
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
