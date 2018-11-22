"use strict";

const $ = s => document.querySelector(s);

window.addEventListener("load", () => {
    getData([
        "autoParse",
        "updateDate",
        "remoteDate"
    ])
    .then(storage => {
        $("#autoParse").checked = !!storage.autoParse;
    });

    $("#autoParse").addEventListener("click", event => {
        const checked = event.target.checked;
        setData({autoParse: checked});
        if(checked) sendMessageToCurrentTab({command: "parse"});
    });

    $("#parseTheCurrentTab").addEventListener("click", () =>
        sendMessageToCurrentTab({command: "parse"})
    );
});
