"use strict";

const sendParseMessage = (tab, selection) => 
    browser.tabs.sendMessage(tab.id, {
        command: "parseText", selection: selection
    })
;

const contextMenuItems = [
    {
        props: {
            id: "parseAll",
            title: "列出本頁所有法律資料",
            contexts: ["page"]
        },
        click: (info, tab) => sendParseMessage(tab)
    },
    {
        props: {
            id: "parseSelection",
            title: "找出「%s」的法律資料",
            contexts: ["selection"]
        },
        click: (info, tab) => sendParseMessage(tab, info.selectionText)
    }
];

/**
 * 為了繞過 "cannot create item with duplicate id" 的錯誤問題，
 * 先刪除全部再加入，但未確認個官方對此的建議解法。
 * 亦未確認這會不會有一直加 listener 的問題。
 */ 
browser.contextMenus.removeAll().then(() =>
    contextMenuItems.forEach(item => {
        browser.contextMenus.create(item.props);
        browser.contextMenus.onClicked.addListener((info, tab) => {
            if(info.menuItemId !== item.props.id) return;
            item.click(info, tab);
        });
    })
);
