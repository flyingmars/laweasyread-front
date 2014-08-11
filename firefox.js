var data = require("sdk/self").data;
var tabs = require("sdk/tabs");

require("widget").Widget({
  id: "widgetID1",
  label: "My Mozilla Widget",
  contentURL: data.url("icon.png"),
  onClick: function() {
    tabs.open("http://g0v.github.io/laweasyread-front/");
  }
});

require("sdk/page-mod").PageMod({
  include: "*",
  contentScriptFile: [
    data.url("parseInt.js"),
    data.url("lawNamePattern.js"),
    data.url("nameMap.js"),
    data.url("courts.js"),
    data.url("LER.js")
  ],
  contentScript: 'LER.parse(document.body);',
  contentStyleFile: data.url("main.css")
});