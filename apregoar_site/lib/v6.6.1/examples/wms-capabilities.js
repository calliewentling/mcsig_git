(self.webpackChunk=self.webpackChunk||[]).push([[5764],{210:function(t,n,e){"use strict";var r=e(9216),i=e(9167),o=e(8137),u=e(3590),a=[null,"http://www.opengis.net/wms"],c=(0,i.C5)(a,{Service:(0,i.Pr)((function(t,n){return(0,i.O)({},f,t,n)})),Capability:(0,i.Pr)((function(t,n){return(0,i.O)({},s,t,n)}))}),s=(0,i.C5)(a,{Request:(0,i.Pr)((function(t,n){return(0,i.O)({},x,t,n)})),Exception:(0,i.Pr)((function(t,n){return(0,i.O)([],y,t,n)})),Layer:(0,i.Pr)((function(t,n){var e=(0,i.O)({},h,t,n);if(void 0===e.Layer)return Object.assign(e,B(t,n));return e}))}),d=function(t){function n(){t.call(this),this.version=void 0}return t&&(n.__proto__=t),n.prototype=Object.create(t&&t.prototype),n.prototype.constructor=n,n.prototype.readFromNode=function(t){this.version=t.getAttribute("version").trim();var n=(0,i.O)({version:this.version},c,t,[]);return n||null},n}(r.Z),f=(0,i.C5)(a,{Name:(0,i.Pr)(o.s2),Title:(0,i.Pr)(o.s2),Abstract:(0,i.Pr)(o.s2),KeywordList:(0,i.Pr)(P),OnlineResource:(0,i.Pr)(u.Q),ContactInformation:(0,i.Pr)((function(t,n){return(0,i.O)({},l,t,n)})),Fees:(0,i.Pr)(o.s2),AccessConstraints:(0,i.Pr)(o.s2),LayerLimit:(0,i.Pr)(o.t),MaxWidth:(0,i.Pr)(o.t),MaxHeight:(0,i.Pr)(o.t)}),l=(0,i.C5)(a,{ContactPersonPrimary:(0,i.Pr)((function(t,n){return(0,i.O)({},v,t,n)})),ContactPosition:(0,i.Pr)(o.s2),ContactAddress:(0,i.Pr)((function(t,n){return(0,i.O)({},m,t,n)})),ContactVoiceTelephone:(0,i.Pr)(o.s2),ContactFacsimileTelephone:(0,i.Pr)(o.s2),ContactElectronicMailAddress:(0,i.Pr)(o.s2)}),v=(0,i.C5)(a,{ContactPerson:(0,i.Pr)(o.s2),ContactOrganization:(0,i.Pr)(o.s2)}),m=(0,i.C5)(a,{AddressType:(0,i.Pr)(o.s2),Address:(0,i.Pr)(o.s2),City:(0,i.Pr)(o.s2),StateOrProvince:(0,i.Pr)(o.s2),PostCode:(0,i.Pr)(o.s2),Country:(0,i.Pr)(o.s2)}),y=(0,i.C5)(a,{Format:(0,i.Ei)(o.s2)}),h=(0,i.C5)(a,{Name:(0,i.Pr)(o.s2),Title:(0,i.Pr)(o.s2),Abstract:(0,i.Pr)(o.s2),KeywordList:(0,i.Pr)(P),CRS:(0,i.ke)(o.s2),EX_GeographicBoundingBox:(0,i.Pr)((function(t,n){var e=(0,i.O)({},C,t,n);if(!e)return;var r=e.westBoundLongitude,o=e.southBoundLatitude,u=e.eastBoundLongitude,a=e.northBoundLatitude;if(void 0===r||void 0===o||void 0===u||void 0===a)return;return[r,o,u,a]})),BoundingBox:(0,i.ke)((function(t,n){var e=[(0,o.ej)(t.getAttribute("minx")),(0,o.ej)(t.getAttribute("miny")),(0,o.ej)(t.getAttribute("maxx")),(0,o.ej)(t.getAttribute("maxy"))],r=[(0,o.ej)(t.getAttribute("resx")),(0,o.ej)(t.getAttribute("resy"))];return{crs:t.getAttribute("CRS"),extent:e,res:r}})),Dimension:(0,i.ke)((function(t,n){return{name:t.getAttribute("name"),units:t.getAttribute("units"),unitSymbol:t.getAttribute("unitSymbol"),default:t.getAttribute("default"),multipleValues:(0,o.v$)(t.getAttribute("multipleValues")),nearestValue:(0,o.v$)(t.getAttribute("nearestValue")),current:(0,o.v$)(t.getAttribute("current")),values:(0,o.s2)(t)}})),Attribution:(0,i.Pr)((function(t,n){return(0,i.O)({},L,t,n)})),AuthorityURL:(0,i.ke)((function(t,n){var e=w(t,n);if(e)return e.name=t.getAttribute("name"),e;return})),Identifier:(0,i.ke)(o.s2),MetadataURL:(0,i.ke)((function(t,n){var e=w(t,n);if(e)return e.type=t.getAttribute("type"),e;return})),DataURL:(0,i.ke)(w),FeatureListURL:(0,i.ke)(w),Style:(0,i.ke)((function(t,n){return(0,i.O)({},R,t,n)})),MinScaleDenominator:(0,i.Pr)(o.fy),MaxScaleDenominator:(0,i.Pr)(o.fy),Layer:(0,i.ke)(B)}),L=(0,i.C5)(a,{Title:(0,i.Pr)(o.s2),OnlineResource:(0,i.Pr)(u.Q),LogoURL:(0,i.Pr)(M)}),C=(0,i.C5)(a,{westBoundLongitude:(0,i.Pr)(o.fy),eastBoundLongitude:(0,i.Pr)(o.fy),southBoundLatitude:(0,i.Pr)(o.fy),northBoundLatitude:(0,i.Pr)(o.fy)}),x=(0,i.C5)(a,{GetCapabilities:(0,i.Pr)(T),GetMap:(0,i.Pr)(T),GetFeatureInfo:(0,i.Pr)(T)}),S=(0,i.C5)(a,{Format:(0,i.ke)(o.s2),DCPType:(0,i.ke)((function(t,n){return(0,i.O)({},g,t,n)}))}),g=(0,i.C5)(a,{HTTP:(0,i.Pr)((function(t,n){return(0,i.O)({},p,t,n)}))}),p=(0,i.C5)(a,{Get:(0,i.Pr)(w),Post:(0,i.Pr)(w)}),R=(0,i.C5)(a,{Name:(0,i.Pr)(o.s2),Title:(0,i.Pr)(o.s2),Abstract:(0,i.Pr)(o.s2),LegendURL:(0,i.ke)(M),StyleSheetURL:(0,i.Pr)(w),StyleURL:(0,i.Pr)(w)}),b=(0,i.C5)(a,{Format:(0,i.Pr)(o.s2),OnlineResource:(0,i.Pr)(u.Q)}),A=(0,i.C5)(a,{Keyword:(0,i.Ei)(o.s2)});function B(t,n){var e=n[n.length-1],r=(0,i.O)({},h,t,n);if(r){var u=(0,o.v$)(t.getAttribute("queryable"));void 0===u&&(u=e.queryable),r.queryable=void 0!==u&&u;var a=(0,o._E)(t.getAttribute("cascaded"));void 0===a&&(a=e.cascaded),r.cascaded=a;var c=(0,o.v$)(t.getAttribute("opaque"));void 0===c&&(c=e.opaque),r.opaque=void 0!==c&&c;var s=(0,o.v$)(t.getAttribute("noSubsets"));void 0===s&&(s=e.noSubsets),r.noSubsets=void 0!==s&&s;var d=(0,o.ej)(t.getAttribute("fixedWidth"));d||(d=e.fixedWidth),r.fixedWidth=d;var f=(0,o.ej)(t.getAttribute("fixedHeight"));f||(f=e.fixedHeight),r.fixedHeight=f;["Style","CRS","AuthorityURL"].forEach((function(t){if(t in e){var n=r[t]||[];r[t]=n.concat(e[t])}}));return["EX_GeographicBoundingBox","BoundingBox","Dimension","Attribution","MinScaleDenominator","MaxScaleDenominator"].forEach((function(t){if(!(t in r)){var n=e[t];r[t]=n}})),r}}function w(t,n){return(0,i.O)({},b,t,n)}function T(t,n){return(0,i.O)({},S,t,n)}function M(t,n){var e=w(t,n);if(e){var r=[(0,o._E)(t.getAttribute("width")),(0,o._E)(t.getAttribute("height"))];return e.size=r,e}}function P(t,n){return(0,i.O)([],A,t,n)}var U=new d;fetch("data/ogcsample.xml").then((function(t){return t.text()})).then((function(t){var n=U.read(t);document.getElementById("log").innerText=JSON.stringify(n,null,2)}))}},function(t){"use strict";var n;n=210,t(t.s=n)}]);
//# sourceMappingURL=wms-capabilities.js.map