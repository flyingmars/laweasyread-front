"use strict";

LER.loadLaws = new Promise((resolve, reject) => {
    chrome.storage.local.get({laws: []}, storage => {
        if(chrome.runtime.lastError) return reject(chrome.runtime.lastError);
        const rules = storage.laws.map(law => {
            return {
                pattern: law.name,
                replacer: {type: "law", law: law},
                minLength: law.name.length
            };
        });
        LER.rules.unshift(...rules);
        resolve(LER.laws = storage.laws);
    });
});
