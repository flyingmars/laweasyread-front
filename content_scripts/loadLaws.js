"use strict";

LER.loadLaws = getData("laws").then((laws = []) => {
    const rules = laws.map(law => ({
        pattern: law.name,
        replacer: {type: "law", law: law},
        minLength: law.name.length
    }));
    LER.rules.unshift(...rules);
    return LER.laws = laws;
});
