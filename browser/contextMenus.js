"use strict";

const contextMenuItems = [
    {
        props: {
            id: "parseDocument",
            title: "將本頁的法條加上連結",
            contexts: ["all"]
        },
        click: (info, tab) => browser.tabs.sendMessage(tab.id, {command: "parseDocument"})
    },
    {
        props: {
            id: "parseContent",
            title: "列出本頁的法律資料",
            contexts: ["all"]
        },
        click: (info, tab) => browser.tabs.sendMessage(tab.id, {command: "parseText"})
    },
    {
        props: {
            id: "parseSelection",
            title: "分析「%s」的法律資料",
            contexts: ["selection"]
        },
        click: (info, tab) => browser.tabs.sendMessage(tab.id, {command: "parseText", selection: info.selectionText})
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
