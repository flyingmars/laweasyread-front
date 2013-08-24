function ge(id) {return document.getElementById(id);}

document.addEventListener('DOMContentLoaded', function() {
    // 建立物件、指定JS
    ge("save").onclick = saveOptions;
    document.getElementsByTagName("FORM")[0].onsubmit = function() {return false;};
    var tas = document.getElementsByTagName("TEXTAREA");
    for(var i = 0; i < tas.length; ++i) {
        tas[i].onkeyup = function() {
            ge("save").style.display = "";
            this.style.height = "";
            this.style.height = Math.max(this.scrollHeight, 50) + "px";
        };
        tas[i].onkeyup();
    }
    ge("exclude_add").onclick = function() {
        var str = ge("exclude_input").value.trim();
        if(!str.length) return;
        if(!str.indexOf("http://") || !str.indexOf("https://")) str = "^" + str;
        ge("exclude_matches").value +=
            "\n" + str.replace(/[\.\?\+\*\(\)\[\]\{\}\|]/g, "\\$&");
        ge("exclude_input").value = "";
        ge("exclude_matches").onkeyup();
        ge("save").style.display = "";
    }
    ge("exclude_edit").onclick = function() {
        ge("exclude_matches").disabled = false;
    }
    ge("save").style.display = "none";

    // 從`localStorage`取出資料並顯示
    ge("exclude_matches").value = localStorage["exclude_matches"] || "";
});

function saveOptions() {
    localStorage["exclude_matches"] = ge("exclude_matches").value;
    ge("save").style.display = "none";
    ge("status").innerHTML = "儲存成功 於 " + (new Date).toLocaleTimeString();
    ge("exclude_matches").disabled = true;
}