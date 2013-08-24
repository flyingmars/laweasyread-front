if(typeof LER == "object") (function(){
    if(LER.autoParse instanceof Element)
        (chrome.runtime.sendMessage
            ? chrome.runtime.sendMessage
            : chrome.extension.sendRequest
        )({method: "getLocalStorage", key: "exclude_matches"}, function(response) {
            if(response && response.trim()) {
                var rules = response.trim().split(/\s+/g);
                for(var i = 0; i < rules.length; ++i) {
                    var r = new RegExp(rules[i]);
                    if(r.test(document.location.href)) {
                        console.log("pattern " + rules[i] + " matched.");
                        return;
                    }
                }
            }
            LER.parse(LER.autoParse);
        });

    /** 接收 popup 「轉換這個網頁」按鈕送出的訊息
      * `chrome.runtime.onMessage` 是Chrome 26版之後才有的
      * 舊版(20到25)應呼叫chrome.extension.onMessage
      */
    (chrome.runtime.onMessage
        ? chrome.runtime.onMessage
        : chrome.extension.onMessage
    ).addListener(
        function(request, sender, sendResponse) {
            if (request.method == "parse") {
                LER.parse(request.target
                    ? request.target
                    : document.body
                );
            }
        }
    );
})();