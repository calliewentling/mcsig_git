(self.webpackChunk=self.webpackChunk||[]).push([[5843],{4162:function(e,t,n){"use strict";var r=n(800),o=n(1625),a=n(640),i=n(242),s=new o.Z({target:"map",view:new a.ZP({center:[0,0],extent:[-180,-90,180,90],projection:"EPSG:4326",zoom:2})}),c=document.createElement("div"),u=new XMLHttpRequest;u.open("GET","data/world.svg"),u.addEventListener("load",(function(){var e=u.responseXML.documentElement;c.ownerDocument.importNode(e),c.appendChild(e)})),u.send();var v=.140625;c.style.width="2560px",c.style.height="1280px",c.style.transformOrigin="top left",c.className="svg-layer",s.addLayer(new r.Z({render:function(e){var t=v/e.viewState.resolution,n=e.viewState.center,r=e.size,o=(0,i.fs)(r[0]/2,r[1]/2,t,t,e.viewState.rotation,-n[0]/v-1280,n[1]/v-640);return c.style.transform=o,c.style.opacity=this.getOpacity(),c}}))}},function(e){"use strict";var t;t=4162,e(e.s=t)}]);
//# sourceMappingURL=svg-layer.js.map