"use strict";

LER.loadLaws = getData("laws").then((laws = []) => {
    // 放棄一些過長的法規名稱，可以加快速度。
    laws = laws.filter(law =>
        !law.name.endsWith("）")
        //&& law.name.length < 20
    );
    //console.log(laws.length);
    const rules = laws.map(law => ({
        pattern: law.name,
        replacer: () => {
            LER.matchedAnyLaw = true;
            return {type: "law", law: law};
        },
        minLength: law.name.length
    }));
    LER.rules.unshift(...rules);
    return LER.laws = laws;
});
