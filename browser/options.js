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
const domParser = new DOMParser();

/**
 * 讀取資料並設定最初的顯示值
 */
fetch("/manifest.json")
.then(res => res.json())
.then(manifest => {
    $("#version").append(manifest.version);
});

fetch("/options_default.json")
.then(res => res.json())
.then(getData)
.then(storage => {
    //console.log(storage);
    if(storage.updateDate) setContent("#updateDate", storage.updateDate);
    else hide("#updateDateContainer");

    const ub = $("#updateButton");
    if(storage.remoteDate > storage.updateDate) {
        setContent(ub, `更新到 ${storage.remoteDate}`);
        ub.classList.add("btn-info");
    }
    else ub.classList.add("btn-primary");

    if(storage.lastCheckUpdate)
        setContent("#lastCheckUpdate", (new Date(storage.lastCheckUpdate)).toLocaleString());
    else hide("#lastCheckUpdateContainer");

    $("#autoParse").checked = storage.autoParse;
    setContent("#exclude_matches", storage.exclude_matches);
    $("#artNumberParserMethod-" + storage.artNumberParserMethod).checked = true;
    $("#enablePopup").checked = storage.enablePopup;
});
$("#saveButton").disabled = true;
hide("#lastSaveContainer");
hide("#saveButtonContainer");

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
    browser.runtime.sendMessage({command: "update"})
    .then(newDate => {
        if(newDate) { // 有更新且已安裝
            setContent("#updateDate", newDate);
            setContent(self, "已更新");
            cl.add("btn-success");
        }
        else {
            setContent(self, "無可更新");
            cl.add("btn-secondary");
        }
        show("#updateDateContainer");
        cl.remove("btn-warning");
        self.disabled = true;
        setContent("#lastCheckUpdate", (new Date).toLocaleString());
        show("#lastCheckUpdateContainer");
    });
});


/**
 * 按下「儲存」鈕
 */
$("#saveButton").addEventListener("click", event => {
    event.target.disabled = true;

    let artNumberParserMethod;
    document.querySelectorAll("input[name=artNumberParserMethod]")
    .forEach(ie => {if(ie.checked) artNumberParserMethod = ie.value;});

    setData({
        autoParse: $("#autoParse").checked,
        exclude_matches: $("#exclude_matches").value.trim(),
        artNumberParserMethod: artNumberParserMethod,
        enablePopup: $("#enablePopup").checked
    }).then(() => {
        console.log("options saved");
        setContent("#lastSave", (new Date).toLocaleString());
        show("#lastSaveContainer");
    });
});


/**
 * 有任何更改時就顯示儲存按鈕
 * 注意 onchange 對 textarea 只在鍵盤輸入後的失焦事件時觸發，而 chrome 不支援 checkbox 和 radio 的 oninput 。
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/Events/input#Browser_compatibility }
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/Events/change#Description }
 */
const onChange = () => {
    show("#saveButtonContainer");
    $("#saveButton").disabled = false;
};
$("#autoParse").addEventListener("change", onChange);
$("#exclude_matches").addEventListener("input", onChange);
$("#enablePopup").addEventListener("change", onChange);


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
    },
    {
        title: "使用「§」符號",
        value: "dollar",
        example: "§91-1 第 2 項第 5 款"
    }/*,
    { // 必須要只在有「條」的時候才適合啟動，機制要再修…
        title: "連同「項」跟「款」也用簡記的方式",
        value: "shortest",
        example: "§91-1 Ⅱ⑤"   // 羅馬數字：U+2160~216B ；圓圈數字：U+2460~2473
    }*/
].map(option => {
    const optionProps = {
        type: "radio",
        name: "artNumberParserMethod",
        id: "artNumberParserMethod-" + option.value,
        value: option.value,
        onchange: onChange
    };
    return e("tr", null,
        e("td", null,
            e("label", null,
                e("input", optionProps),
                option.title
            )
        ),
        e("td", null,
            e("label", {"for": optionProps.id}, option.example)
        )
    );
});
$("#artNumberParserOptions").append(...artNumberParserOptions);


/**
 * 相關檔案：專案裡的 *.md
 */
const styleTag = e("style", null, "body > :not(.LER-modal) {display: none}");
const docs = [
    {
        file: "/README.md",
        title: "專案介紹"
    },
    {
        file: "/changelog.md",
        title: "更新紀錄"
    },
    {
        file: "/changelog-dev.md",
        title: "開發紀錄"
    }
].map(doc => {
    const modalId = "modal" + doc.file.replace(/[/\.]/g, "-");
    const target = e("span", {className: "nav-link text-info"}, doc.title);

    fetch(doc.file)
    .then(res => res.text())
    .then(text => {
        const nodes = domParser.parseFromString(marked(text), "text/html").body.childNodes;
        const closeButton = e("button", {className: "close", title: "關閉"}, "\xD7");
        document.body.appendChild(
            e("div",
                {
                    id: modalId,
                    className: "LER-modal container",
                    style: {display: "none"}
                },
                closeButton,
                ...nodes
            )
        );
        const modal = $(`#${modalId}`);
        target.addEventListener("click", () => {
            document.querySelectorAll(".LER-modal").forEach(elem => elem.style.display = "none");
            document.head.appendChild(styleTag);
            modal.style.display = "";
            window.scroll(0, 0);
        });
        closeButton.addEventListener("click", () => {
            modal.style.display = "none";
            styleTag.remove();
        });
    });
    return e(
        "li",
        {className: "nav-item"},
        target
    );
});
$("#docs").append(...docs);

/**
 * 相關連結
 */
const links = [
    {
        href: "https://github.com/g0v/laweasyread-front/tree/gh-pages/dist",
        text: "下載舊版"
    },
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
    const props = {
        className: "nav-link text-warning",
        href: link.href,
        title: link.title || ""
    };
    return e(
        "li",
        {className: "nav-item"},
        e("A", props, link.text)
    );
});
$("#links").append(...links);
