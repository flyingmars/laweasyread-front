var init = {
    "auto": true,
    "exclude_matches": "https?:\\/\\/([\\w_-]+\\.)?hackpad.com\\/*"
};
for(var key in init)
    if(typeof localStorage[key] == "undefined")
        localStorage[key] = typeof init[key] == "string"
            ? init[key]
            : JSON.stringify(init[key])
        ;

(chrome.runtime.onMessage
    ? chrome.runtime.onMessage
    : chrome.extension.onMessage
).addListener(function(request, sender, sendResponse) {
    console.log(arguments);
    switch(request.method) {
    case "getLocalStorage":
        sendResponse(request.key
            ? localStorage[request.key]
            : localStorage
        );
        break;
    case "setStatus":
        switch(request.status) {
        case "auto":
            chrome.browserAction.setIcon({
                path: "icon.png"
            });
            break;
        case "disabled":
            chrome.browserAction.setIcon({
                path: "icon_disabled.png"
            });
            break;
        case "excluded":
            chrome.browserAction.setIcon({
                path: "icon_excluded.png",
                tabId: sender.tab.id
            });
            break;
        default:
            console.log("Unknown tab status");
            console.log(arguments);
        }
        break;
    default:
        console.log("Unknown request");
        console.log(arguments);
    }
});