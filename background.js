var init = {
    version: "0.4.6.5",
    auto: true,
    exclude_matches: [
        "^https?://([\\w_-]+\\.)?hackpad\\.com/",
        "^http://law\\.moj\\.gov\\.tw/Eng/",
        "^http://law\\.moj\\.gov\\.tw/LawClass/ExContent_print\\.aspx",
        "^http://jirs\\.judicial\\.gov\\.tw/FJUD/PrintFJUD03_0\\.aspx",
        "^https?://drive\\.google\\.com/keep",
        "^https?://docs\\.google\\.com/"
    ].join("\n")
};
if(typeof localStorage.version == "undefined"
    && typeof localStorage.exclude_matches == "string"
) localStorage.exclude_matches += "\n" + init.exclude_matches;
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