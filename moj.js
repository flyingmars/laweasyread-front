(function(){
    if(typeof LER != "object" || !LER.setDefaultLaw) return;

    /// 判斷「預設法規」
    var pages = ["All", "Single", "ParaDeatil", "SearchNo", "SearchContent", "History"];
    var match = document.location.pathname.match(
	    new RegExp("^\/LawClass\/Law(" + pages.join('|') + ")(_print|If)?\.aspx")
	);
    if(match && pages.indexOf(match[1]) >= 0)
        try {
			var c = document.getElementById((match[2] == "If") ? "Content2" : "Content");
            LER.setDefaultLaw(c.getElementsByTagName('TD')[1].firstElementChild.lastChild.data);
        } catch(e) {
            console.log("`#Content a` doesn't seem to exist.");
        }

    /** 內嵌時，將頁面跳轉均預設為新視窗，這是為了讓各連結與其浮出視窗維持一致。
	  * 雖然會影響了全國法規資料庫自身原本的運作方式（把預設為開在原本的內嵌視窗中的內容，改在新分頁開），不過影響應該不大…
	  */
    if(window != top) {
        var base = document.createElement("BASE");
        base.target = "_blank";
        document.head.appendChild(base);
    }

    var tla = document.querySelector(".TableLawAll");
    if(tla) {
        /** 把每個條號的<a href>都加上 name 屬性
          */
        var as = tla.getElementsByTagName("A");
        for(var i = 0; i < as.length; ++i)
            as[i].name = "article_" + as[i].href.substr(as[i].href.indexOf("FLNO=")+5);

        /** 單條顯示時，條文表格左方有一個沒用到的 <th /> 空間可以利用。
          */
        tla = tla.parentNode.parentNode;
        if(tla.childElementCount > 1) {
            tla.removeChild(tla.firstElementChild);
            tla.firstElementChild.colSpan = 2;
        }
    }

    /** 列印介面
      */
    var cf = document.getElementById("ctl00_cphContent_Forword");
    if(cf) {
        cf = cf.getElementsByTagName("PRE")[0].parentNode;
        cf.innerHTML = cf.innerText.replace(/\s+/g, '');
    }

})();