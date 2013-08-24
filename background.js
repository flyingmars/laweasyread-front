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