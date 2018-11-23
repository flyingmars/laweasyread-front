"use strict";

const parse = (typeof LER == "object") && document.body
    ? () => LER.parse(document.body)
    : () => {}
;

getData("autoParse").then(autoParse => {
    console.log(autoParse);
    if(autoParse) parse();
});

chrome.runtime.onMessage.addListener(message => {
    switch(message.command) {
        case "parse":
            parse();
            break;
        default:
            console.log("Error: uncaught message.");
    }
});
