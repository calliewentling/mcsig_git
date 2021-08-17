(self.webpackChunk=self.webpackChunk||[]).push([[7970],{2233:function(t,i,n){"use strict";var r=n(1625),s=n(640),e=n(5277),h=n(3345),u=n(3086),o=n(1361),a=n(8557),c=n(1209),f=n(4104),w=n(4858),v=n(5957),l=n(718),y=n(1622),B=n(1611),d=n(4589),m=n(7889),D=n(3209),E=1,C=2,b=3,p=4,A=5,F=6,g=7,N=15,P=16,G=17,I=function(t){this.t=t,this.i=0,this.h=!1,this.u=!1,this.o=!1,this.v=!1,this.l=null,this.B=a.Z.XY};I.prototype.readUint8=function(){return this.t.getUint8(this.i++)},I.prototype.readUint32=function(t){return this.t.getUint32((this.i+=4)-4,void 0!==t?t:this.u)},I.prototype.readDouble=function(t){return this.t.getFloat64((this.i+=8)-8,void 0!==t?t:this.u)},I.prototype.readPoint=function(){var t=[];return t.push(this.readDouble()),t.push(this.readDouble()),this.o&&t.push(this.readDouble()),this.v&&t.push(this.readDouble()),t},I.prototype.readLineString=function(){for(var t=this.readUint32(),i=[],n=0;n<t;n++)i.push(this.readPoint());return i},I.prototype.readPolygon=function(){for(var t=this.readUint32(),i=[],n=0;n<t;n++)i.push(this.readLineString());return i},I.prototype.readWkbHeader=function(t){var i=this.readUint8()>0,n=this.readUint32(i),r=Math.floor((268435455&n)/1e3),s=Boolean(2147483648&n)||1===r||3===r,e=Boolean(1073741824&n)||2===r||3===r,h=Boolean(536870912&n),u=(268435455&n)%1e3,o=["XY",s?"Z":"",e?"M":""].join(""),a=h?this.readUint32(i):null;if(void 0!==t&&t!==u)throw new Error("Unexpected WKB geometry type "+u);if(this.h){if(this.u!==i)throw new Error("Inconsistent endian");if(this.B!==o)throw new Error("Inconsistent geometry layout");if(a&&this.l!==a)throw new Error("Inconsistent coordinate system (SRID)")}else this.u=i,this.o=s,this.v=e,this.B=o,this.l=a,this.h=!0;return u},I.prototype.readWkbPayload=function(t){switch(t){case E:return this.readPoint();case C:return this.readLineString();case b:case G:return this.readPolygon();case p:return this.readMultiPoint();case A:return this.readMultiLineString();case F:case N:case P:return this.readMultiPolygon();case g:return this.readGeometryCollection();default:throw new Error("Unsupported WKB geometry type "+t+" is found")}},I.prototype.readWkbBlock=function(t){return this.readWkbPayload(this.readWkbHeader(t))},I.prototype.readWkbCollection=function(t,i){for(var n=this.readUint32(),r=[],s=0;s<n;s++){var e=t.call(this,i);e&&r.push(e)}return r},I.prototype.readMultiPoint=function(){return this.readWkbCollection(this.readWkbBlock,E)},I.prototype.readMultiLineString=function(){return this.readWkbCollection(this.readWkbBlock,C)},I.prototype.readMultiPolygon=function(){return this.readWkbCollection(this.readWkbBlock,b)},I.prototype.readGeometryCollection=function(){return this.readWkbCollection(this.readGeometry)},I.prototype.readGeometry=function(){var t=this.readWkbHeader(),i=this.readWkbPayload(t);switch(t){case E:return new y.Z(i,this.B);case C:return new f.Z(i,this.B);case b:case G:return new B.ZP(i,this.B);case p:return new v.Z(i,this.B);case A:return new w.Z(i,this.B);case F:case N:case P:return new l.Z(i,this.B);case g:return new o.Z(i);default:return null}},I.prototype.getSrid=function(){return this.l};var M=function(t){t=t||{},this.B=t.layout,this.u=!1!==t.littleEndian,this.m=!1!==t.ewkb,this.D=[],this.C=(0,D.f0)({X:0,Y:0,Z:0,M:0},t.nodata)};function S(t){return"string"==typeof t?function(t){for(var i=new Uint8Array(t.length/2),n=0;n<t.length/2;n++)i[n]=parseInt(t.substr(2*n,2),16);return new DataView(i.buffer)}(t):ArrayBuffer.isView(t)?t instanceof DataView?t:new DataView(t.buffer,t.byteOffset,t.byteLength):t instanceof ArrayBuffer?new DataView(t):null}M.prototype.writeUint8=function(t){this.D.push([1,t])},M.prototype.writeUint32=function(t){this.D.push([4,t])},M.prototype.writeDouble=function(t){this.D.push([8,t])},M.prototype.writePoint=function(t,i){for(var n=D.f0.apply(null,i.split("").map((function(i,n){var r;return(r={})[i]=t[n],r}))),r=0,s=this.B;r<s.length;r+=1){var e=s[r];this.writeDouble(e in n?n[e]:this.C[e])}},M.prototype.writeLineString=function(t,i){this.writeUint32(t.length);for(var n=0;n<t.length;n++)this.writePoint(t[n],i)},M.prototype.writePolygon=function(t,i){this.writeUint32(t.length);for(var n=0;n<t.length;n++)this.writeLineString(t[n],i)},M.prototype.writeWkbHeader=function(t,i){t%=1e3,this.B.indexOf("Z")>=0&&(t+=this.m?2147483648:1e3),this.B.indexOf("M")>=0&&(t+=this.m?1073741824:2e3),this.m&&Number.isInteger(i)&&(t|=536870912),this.writeUint8(this.u?1:0),this.writeUint32(t),this.m&&Number.isInteger(i)&&this.writeUint32(i)},M.prototype.writeMultiPoint=function(t,i){this.writeUint32(t.length);for(var n=0;n<t.length;n++)this.writeWkbHeader(1),this.writePoint(t[n],i)},M.prototype.writeMultiLineString=function(t,i){this.writeUint32(t.length);for(var n=0;n<t.length;n++)this.writeWkbHeader(2),this.writeLineString(t[n],i)},M.prototype.writeMultiPolygon=function(t,i){this.writeUint32(t.length);for(var n=0;n<t.length;n++)this.writeWkbHeader(3),this.writePolygon(t[n],i)},M.prototype.writeGeometryCollection=function(t){this.writeUint32(t.length);for(var i=0;i<t.length;i++)this.writeGeometry(t[i])},M.prototype.findMinimumLayout=function(t,i){void 0===i&&(i=a.Z.XYZM);var n,r;if(t instanceof m.ZP)return(n=t.getLayout())===(r=i)?n:n===a.Z.XYZM?r:r===a.Z.XYZM?n:a.Z.XY;if(t instanceof o.Z)for(var s=t.getGeometriesArray(),e=0;e<s.length&&i!==a.Z.XY;e++)i=this.findMinimumLayout(s[e],i);return i},M.prototype.writeGeometry=function(t,i){var n={};n[c.Z.POINT]=E,n[c.Z.LINE_STRING]=C,n[c.Z.POLYGON]=b,n[c.Z.MULTI_POINT]=p,n[c.Z.MULTI_LINE_STRING]=A,n[c.Z.MULTI_POLYGON]=F,n[c.Z.GEOMETRY_COLLECTION]=g;var r=t.getType(),s=n[r];if(!s)throw new Error("GeometryType "+r+" is not supported");if(this.B||(this.B=this.findMinimumLayout(t)),this.writeWkbHeader(s,i),t instanceof m.ZP){var e={};e[c.Z.POINT]=this.writePoint,e[c.Z.LINE_STRING]=this.writeLineString,e[c.Z.POLYGON]=this.writePolygon,e[c.Z.MULTI_POINT]=this.writeMultiPoint,e[c.Z.MULTI_LINE_STRING]=this.writeMultiLineString,e[c.Z.MULTI_POLYGON]=this.writeMultiPolygon,e[r].call(this,t.getCoordinates(),t.getLayout())}else t instanceof o.Z&&this.writeGeometryCollection(t.getGeometriesArray())},M.prototype.getBuffer=function(){var t=this,i=this.D.reduce((function(t,i){return t+i[0]}),0),n=new ArrayBuffer(i),r=new DataView(n),s=0;return this.D.forEach((function(i){switch(i[0]){case 1:r.setUint8(s,i[1]);break;case 4:r.setUint32(s,i[1],t.u);break;case 8:r.setFloat64(s,i[1],t.u)}s+=i[0]})),n};var V=function(t){function i(i){t.call(this);var n=i||{};this.splitCollection=Boolean(n.splitCollection),this.p=null,this.A=!1!==n.hex,this.F=!1!==n.littleEndian,this.g=!1!==n.ewkb,this.B=n.geometryLayout,this.N=n.nodataZ||0,this.P=n.nodataM||0,this.l=n.srid}return t&&(i.__proto__=t),i.prototype=Object.create(t&&t.prototype),i.prototype.constructor=i,i.prototype.getType=function(){return this.A?u.Z.TEXT:u.Z.ARRAY_BUFFER},i.prototype.readFeature=function(t,i){return new e.Z({geometry:this.readGeometry(t,i)})},i.prototype.readFeatures=function(t,i){var n=this.readGeometry(t,i);return(this.splitCollection&&n instanceof o.Z?n.getGeometriesArray():[n]).map((function(t){return new e.Z({geometry:t})}))},i.prototype.readGeometry=function(t,i){var n=S(t);if(!n)return null;var r=new I(n).readGeometry();this.p=n;var s=this.getReadOptions(t,i);return this.p=null,(0,h.fI)(r,!1,s)},i.prototype.readProjection=function(t){var i=this.p||S(t);if(i){var n=new I(i);return n.readWkbHeader(),n.getSrid()&&(0,d.U2)("EPSG:"+n.getSrid())||void 0}},i.prototype.writeFeature=function(t,i){return this.writeGeometry(t.getGeometry(),i)},i.prototype.writeFeatures=function(t,i){return this.writeGeometry(new o.Z(t.map((function(t){return t.getGeometry()}))),i)},i.prototype.writeGeometry=function(t,i){var n=this.adaptOptions(i),r=new M({layout:this.B,littleEndian:this.F,ewkb:this.g,nodata:{Z:this.N,M:this.P}}),s=Number.isInteger(this.l)?Number(this.l):null;if(!1!==this.l&&!Number.isInteger(this.l)){var e=n.dataProjection&&(0,d.U2)(n.dataProjection);if(e){var u=e.getCode();0===u.indexOf("EPSG:")&&(s=Number(u.substring(5)))}}r.writeGeometry((0,h.fI)(t,!0,n),s);var o=r.getBuffer();return this.A?function(t){var i=new Uint8Array(t);return Array.from(i.values()).map((function(t){return(t<16?"0":"")+Number(t).toString(16).toUpperCase()})).join("")}(o):o},i}(h.ZP),U=n(7340),Z=n(1940),j=n(7842),k=n(710),K=new j.Z({source:new U.Z}),W=(new V).readFeature("0103000000010000000500000054E3A59BC4602540643BDF4F8D1739C05C8FC2F5284C4140EC51B81E852B34C0D578E926316843406F1283C0CAD141C01B2FDD2406012B40A4703D0AD79343C054E3A59BC4602540643BDF4F8D1739C0",{dataProjection:"EPSG:4326",featureProjection:"EPSG:3857"}),X=new k.Z({source:new Z.Z({features:[W]})});new r.Z({layers:[K,X],target:"map",view:new s.ZP({center:[2952104.0199,-3277504.823],zoom:4})})}},function(t){"use strict";var i;i=2233,t(t.s=i)}]);
//# sourceMappingURL=wkb.js.map