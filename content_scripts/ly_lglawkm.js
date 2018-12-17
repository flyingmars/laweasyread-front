"use strict";

/**
 * 搭配 `popup.html` 的表單以強制啟動立法院法律系統的搜尋功能。
 */
if(!location.search) {
    const input = document.getElementsByName("_1_5_T")[0];
    if(input && input.value)
        document.getElementsByName("_IMG_檢索")[0].click();
}
console.log("haha");
