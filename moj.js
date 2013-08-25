(function(){
    if(typeof LER != "object" || !LER.setDefaultLaw) return;

    /// 判斷「預設法規」
    var pages = ["All", "Single", "ParaDeatil", "SearchNo", "SearchContent", "History"];
    var match = document.location.pathname.match(/^\/LawClass\/Law(\w+)(_print)?.aspx/);
    if(match && pages.indexOf(match[1]) >= 0)
        try {
            LER.setDefaultLaw(document.getElementById("Content").getElementsByTagName('A')[1].lastChild.data.replace(/\s/g, ''));
        } catch(e) {
            console.log("`#Content a` doesn't seem to exist.");
        }

    /** 在法規名稱處加上一個anchor
      * 以找「第一個TH標籤」實作，後續或許可以有其他應用。
      */
    var firstTH = document.getElementsByTagName("TH")[0];
    if(firstTH)
        firstTH.innerHTML = '<a name="firstTH">' + firstTH.innerText + '</a>';

    /** 內嵌時，把header/footer拿掉
      * 但應該要留下<form />
      */
    if(window != top) {
        var main = document.getElementById("main");
        if(main) main.parentNode.replaceChild(document.getElementById("mainFrame_body"), main);
        var base = document.getElementsByTagName("BASE")[0];
        if(!base) {
            base = document.createElement("BASE");
            document.head.appendChild(base);
        }
        base.target = "_blank";
    }

    var tla = document.querySelector(".TableLawAll");
    if(tla) {
        /** 把每個條號的<a href>都加上 name 屬性
          */
        var as = tla.getElementsByTagName("A");
        for(var i = 0; i < as.length; ++i)
            as[i].name = "article_" + as[i].href.substr(as[i].href.indexOf("FLNO=")+5);

        /** 利用條文表格左方的空間
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