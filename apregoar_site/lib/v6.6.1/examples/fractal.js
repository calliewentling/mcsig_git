(self.webpackChunk=self.webpackChunk||[]).push([[1180],{5544:function(t,n,r){"use strict";var e=r(5277),o=r(4104),a=r(1625),i=r(710),u=r(1940),c=r(640),f=1e7,v=Math.cos(Math.PI/6),w=f*Math.sin(Math.PI/6),h=f*v,s=new o.Z([[0,f],[h,-w],[-h,-w],[0,f]]),M=new e.Z(s),p=new i.Z({source:new u.Z({features:[M]})});new a.Z({layers:[p],target:"map",view:new c.ZP({center:[0,0],zoom:1})});function d(t){var n=t.next,r=t.point,e=t.next.point,o=e[0]-r[0],a=e[1]-r[1],i={point:[r[0]+o/3,r[1]+a/3]},u=Math.sqrt(o*o+a*a)/(2*v),c=Math.atan2(a,o)+Math.PI/6,f={point:[r[0]+u*Math.cos(c),r[1]+u*Math.sin(c)]},w={point:[e[0]-o/3,e[1]-a/3]};t.next=i,i.next=f,f.next=w,w.next=n}var m,l=document.getElementById("depth");function b(){!function(t){for(var n=s.clone(),r=function(t){for(var n={point:t[0]},r=t.length,e=0,o=n;e<r-1;++e)o.next={point:t[e+1]},o=o.next;return n}(n.getCoordinates()),e=0;e<t;++e)for(var o=r;o.next;){var a=o.next;d(o),o=a}var i=function(t){for(var n=[t.point],r=t,e=1;r.next;r=r.next,++e)n[e]=r.next.point;return n}(r);document.getElementById("count").innerHTML=i.length,n.setCoordinates(i),M.setGeometry(n)}(Number(l.value))}l.onchange=function(){window.clearTimeout(m),m=window.setTimeout(b,200)},b()}},function(t){"use strict";var n;n=5544,t(t.s=n)}]);
//# sourceMappingURL=fractal.js.map