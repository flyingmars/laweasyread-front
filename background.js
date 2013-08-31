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
).addListener(
    function(request, sender, sendResponse) {
        if (request.method == "getLocalStorage") {
            sendResponse(request.key
                ? localStorage[request.key]
                : localStorage
            );
        }
    }
);