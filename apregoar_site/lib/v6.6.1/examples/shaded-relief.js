(self.webpackChunk=self.webpackChunk||[]).push([[4600],{7163:function(t,n,e){"use strict";var a=e(1625),o=e(640),r=e(7842),i=e(4743),u=e(6343),s=e(9175),c=e(7340);var h=new u.Z({url:"https://{a-d}.tiles.mapbox.com/v3/aj.sf-dem/{z}/{x}/{y}.png",crossOrigin:"anonymous"}),m=new s.ZP({sources:[h],operationType:"image",operation:function(t,n){var e,a,o,r,i,u,s,c,h,m,f,M,p=t[0],v=p.width,w=p.height,d=p.data,l=new Uint8ClampedArray(d.length),y=2*n.resolution,g=v-1,x=w-1,b=[0,0,0,0],z=2*Math.PI,A=Math.PI/2,O=Math.PI*n.sunEl/180,Z=Math.PI*n.sunAz/180,j=Math.cos(O),C=Math.sin(O);function E(t){return t[0]+2*t[1]+3*t[2]}for(a=0;a<=x;++a)for(r=0===a?0:a-1,i=a===x?x:a+1,e=0;e<=g;++e)o=e===g?g:e+1,u=4*(a*v+(0===e?0:e-1)),b[0]=d[u],b[1]=d[u+1],b[2]=d[u+2],b[3]=d[u+3],s=n.vert*E(b),u=4*(a*v+o),b[0]=d[u],b[1]=d[u+1],b[2]=d[u+2],b[3]=d[u+3],c=(n.vert*E(b)-s)/y,u=4*(r*v+e),b[0]=d[u],b[1]=d[u+1],b[2]=d[u+2],b[3]=d[u+3],s=n.vert*E(b),u=4*(i*v+e),b[0]=d[u],b[1]=d[u+1],b[2]=d[u+2],b[3]=d[u+3],h=(n.vert*E(b)-s)/y,m=Math.atan(Math.sqrt(c*c+h*h)),f=(f=Math.atan2(h,-c))<0?A-f:f>A?z-f+A:A-f,M=255*(C*Math.cos(m)+j*Math.sin(m)*Math.cos(Z-f)),l[u=4*(a*v+e)]=M,l[u+1]=M,l[u+2]=M,l[u+3]=d[u+3];return{data:l,width:v,height:w}}}),f=(new a.Z({target:"map",layers:[new r.Z({source:new c.Z}),new i.Z({opacity:.3,source:m})],view:new o.ZP({extent:[-13675026,4439648,-13580856,4580292],center:[-13615645,4497969],minZoom:10,maxZoom:16,zoom:13})}),{});["vert","sunEl","sunAz"].forEach((function(t){var n=document.getElementById(t),e=document.getElementById(t+"Out");n.addEventListener("input",(function(){e.innerText=n.value,m.changed()})),e.innerText=n.value,f[t]=n})),m.on("beforeoperations",(function(t){var n=t.data;for(var e in n.resolution=t.resolution,f)n[e]=Number(f[e].value)}))}},function(t){"use strict";var n;n=7163,t(t.s=n)}]);
//# sourceMappingURL=shaded-relief.js.map