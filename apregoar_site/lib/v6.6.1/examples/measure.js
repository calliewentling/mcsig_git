(self.webpackChunk=self.webpackChunk||[]).push([[9869],{7409:function(e,n,t){"use strict";var o,i,r,c,l,a=t(9341),s=t(1625),f=t(4682),u=t(640),w=t(6363),d=t(5659),g=t(5367),m=t(7389),p=t(1611),h=t(4104),v=t(7340),k=t(1940),y=t(7842),b=t(710),M=t(5283),C=t(7231),z=new y.Z({source:new v.Z}),D=new k.Z,E=new b.Z({source:D,style:new w.ZP({fill:new d.Z({color:"rgba(255, 255, 255, 0.2)"}),stroke:new g.Z({color:"#ffcc33",width:2}),image:new m.Z({radius:7,fill:new d.Z({color:"#ffcc33"})})})}),F=new s.Z({layers:[z,E],target:"map",view:new u.ZP({center:[-11e6,46e5],zoom:15})});F.on("pointermove",(function(e){if(!e.dragging){var n="Click to start drawing";if(o){var t=o.getGeometry();t instanceof p.ZP?n="Click to continue drawing the polygon":t instanceof h.Z&&(n="Click to continue drawing the line")}i.innerHTML=n,r.setPosition(e.coordinate),i.classList.remove("hidden")}})),F.getViewport().addEventListener("mouseout",(function(){i.classList.add("hidden")}));var L,P=document.getElementById("type");function S(){var e,n="area"==P.value?"Polygon":"LineString";L=new a.ZP({source:D,type:n,style:new w.ZP({fill:new d.Z({color:"rgba(255, 255, 255, 0.2)"}),stroke:new g.Z({color:"rgba(0, 0, 0, 0.5)",lineDash:[10,10],width:2}),image:new m.Z({radius:5,stroke:new g.Z({color:"rgba(0, 0, 0, 0.7)"}),fill:new d.Z({color:"rgba(255, 255, 255, 0.2)"})})})}),F.addInteraction(L),j(),function(){i&&i.parentNode.removeChild(i);(i=document.createElement("div")).className="ol-tooltip hidden",r=new f.Z({element:i,offset:[15,0],positioning:"center-left"}),F.addOverlay(r)}(),L.on("drawstart",(function(n){o=n.feature;var t=n.coordinate;e=o.getGeometry().on("change",(function(e){var n,o,i,r,a,s=e.target;s instanceof p.ZP?(r=s,n=(a=(0,M.bg)(r))>1e4?Math.round(a/1e6*100)/100+" km<sup>2</sup>":Math.round(100*a)/100+" m<sup>2</sup>",t=s.getInteriorPoint().getCoordinates()):s instanceof h.Z&&(o=s,n=(i=(0,M.xA)(o))>100?Math.round(i/1e3*100)/100+" km":Math.round(100*i)/100+" m",t=s.getLastCoordinate()),c.innerHTML=n,l.setPosition(t)}))})),L.on("drawend",(function(){c.className="ol-tooltip ol-tooltip-static",l.setOffset([0,-7]),o=null,c=null,j(),(0,C.B)(e)}))}function j(){c&&c.parentNode.removeChild(c),(c=document.createElement("div")).className="ol-tooltip ol-tooltip-measure",l=new f.Z({element:c,offset:[0,-15],positioning:"bottom-center",stopEvent:!1,insertFirst:!1}),F.addOverlay(l)}P.onchange=function(){F.removeInteraction(L),S()},S()}},function(e){"use strict";var n;n=7409,e(e.s=n)}]);
//# sourceMappingURL=measure.js.map