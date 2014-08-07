/// 確認到底是哪個頁面
var match = /p03_0(\d)(_printpage)?/.exec(location.pathname);

/// 刪除上方的flash動畫
if(!match[2])
	document.getElementsByTagName('TBODY')[0].removeChild(document.getElementsByTagName('TR')[0]);

/// 取得主要內容的表格
var index;
if(!match[2]) index = 4;
else index = (match[1] == "1") ? 2 : 1;
var ct = document.getElementsByTagName('TABLE')[index];
ct.classList.add("contentTable");

/// 若是內嵌，就只顯示主要內容表格
if(window != top)
	document.body.replaceChild(ct, document.body.firstElementChild);

/// 針對表格排版
var anchors = {
    "解釋字號": "number",
	"解釋日期": "date",
    "解釋公布日期": "date",
    "解釋爭點": "issue",
    "解釋文": "holding",
    "理由書": "reasoning",
    "相關法條": "related-articles",
	"事實": "facts",
	"意見書": "opinions",
    "相關附件": "related-annexes",
    "新聞稿、意見書、抄本(含解釋文、理由書、意見書、聲請書及其附件)": "documents"
};
var ths = ct.getElementsByTagName('TH');
for(var i = ths.length - 1; i >= 0; --i) {
	var rowTitle = ths[i].innerText.trim();
	if(anchors[rowTitle]) ths[i].innerHTML = '<a name="' + anchors[rowTitle] + '">' + rowTitle + '</a>';

	if(rowTitle == "解釋文" || rowTitle == "理由書") {
		var divs = ths[i].nextElementSibling.getElementsByTagName('DIV');
		while(divs.length) {
			var text = divs[0].innerText.trim();
			if(text.indexOf("大法官會議主") == 0) break;
			if(!text.length) {
				divs[0].parentNode.removeChild(divs[0]);
				continue;
			}
			var p = document.createElement('P');
			p.classList.add("jyi-reasoning");
			p.appendChild(document.createTextNode(text));
			divs[0].parentNode.replaceChild(p, divs[0]);
		}
	}
}
