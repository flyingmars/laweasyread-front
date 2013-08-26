if(typeof LER == "object") (function(){

    /** 執行自動轉換
      */
    if(LER.autoParse instanceof Element) {
        (chrome.runtime.sendMessage
            ? chrome.runtime.sendMessage
            : chrome.extension.sendRequest
        )({method: "getLocalStorage"/*, key: "exclude_matches"*/}, function(response) {
            // 如果自動轉換被關閉了，那就不用處理
            if(typeof response.auto != "undefined" && !JSON.parse(response.auto)) return;
            // 如果是在例外清單中，也不用處理
            if(response.exclude_matches && response.exclude_matches.trim()) {
                var rules = response.exclude_matches.trim().split(/\s+/g);
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
    }

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