document.addEventListener("DOMContentLoaded", function() {
    var auto = document.getElementById("auto");
    var reParse = document.getElementById("reParse");
    var addExclude = document.getElementById("addExclude");
    var closeLinkList = document.getElementById("closeLinkList");
    var ghost = document.getElementById("ghost");
    var input = document.getElementById("input");
    var output = document.getElementById("output");

    reParse.onclick = function() {
        chrome.tabs.getSelected(null, function(tab) {
            chrome.tabs.sendMessage(tab.id, {method: "parse"});
        });
    };

    auto.checked = (typeof localStorage["auto"] != "undefined") && JSON.parse(localStorage["auto"]);
    auto.onclick = function() {
        localStorage["auto"] = JSON.stringify(this.checked);
        if(this.checked) reParse.onclick();
    };

    addExclude.onclick = function() {
        chrome.tabs.getSelected(null, function(tab) {
            chrome.tabs.create({
                url: "options.html#exclude=" + tab.url
            });
        });
    };

    closeLinkList.onclick = function() {
        this.parentNode.style.display = "none";
    };


    ghost.onclick = ghost.onmousedown = function() {
        this.style.display = "none";
        input.focus();
    };

    LER.setPopupEnable(false);  // 這裡空間不夠啦
    input.onfocus = function() { ghost.style.display = "none"; };
    input.onblur = function() {
        if(this.value.replace(/\s/g, "") == "") {
            this.value = "";
            ghost.style.display = "";
        }
    };
    input.onkeyup = function() {
        if(this.value.replace(/\s/g, "") == "") {
            output.style.display = "none";
            return;
        }
        output.style.display = "";
        output.innerHTML = this.value.replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br>");
        LER.parse(output);
    };
    input.onkeyup();
});
