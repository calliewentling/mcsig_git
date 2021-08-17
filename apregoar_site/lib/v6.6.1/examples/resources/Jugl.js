!function(){var t={prefix:"jugl",namespaceURI:null,loadTemplate:function(t){n(t.url,(function(i){var s,n;if(!i.status||i.status>=200&&i.status<300){try{s=i.responseXML,n=new r(s.documentElement)}catch(t){(s=document.createElement("div")).innerHTML=i.responseText,n=new r(s.firstChild)}t.callback&&t.callback.call(t.scope,n)}else t.failure&&t.failure.call(t.scope,i)}))}},i=function(t,i){for(var s in t=t||{},i=i||{})t[s]=i[s];return t},s=function(t,i){var s,n,e,r,h;if("string"==typeof t){if(!(s=document.getElementById(t)))throw Error("Element id not found: "+t);t=s}if("string"==typeof i){if(!(s=document.getElementById(i)))throw Error("Element id not found: "+i);i=s}if(i.namespaceURI&&i.xml)for((n=document.createElement("div")).innerHTML=i.xml,r=0,h=(e=n.childNodes).length;r<h;++r)t.appendChild(e[r]);else t.ownerDocument&&t.ownerDocument.importNode&&t.ownerDocument!==i.ownerDocument&&(i=t.ownerDocument.importNode(i,!0)),t.appendChild(i);return i},n=function(t,i,s){var n;if("undefined"!=typeof XMLHttpRequest)n=new XMLHttpRequest;else{if("undefined"==typeof ActiveXObject)throw new Error("XMLHttpRequest not supported");n=new ActiveXObject("Microsoft.XMLHTTP")}n.open("GET",t),n.onreadystatechange=function(){4===n.readyState&&i.call(s,n)},n.send(null)},e=function(t,i){this.template=t,this.node=i,this.scope={},this.scope.repeat={}};i(e.prototype,{clone:function(){var t=this.node.cloneNode(!0);t.removeAttribute("id");var s=new e(this.template,t);return i(s.scope,this.scope),s},getAttribute:function(i){var s;return 1===this.node.nodeType&&(s=this.template.usingNS?this.node.getAttributeNodeNS(t.namespaceURI,i):this.node.getAttributeNode(t.prefix+":"+i))&&!s.specified&&(s=!1),s?new h(this,s,i):s},setAttribute:function(t,i){this.node.setAttribute(t,i)},removeAttributeNode:function(t){this.node.removeAttributeNode(t.node)},getChildNodes:function(){for(var t,s=this.node.childNodes.length,n=new Array(s),r=0;r<s;++r)(t=new e(this.template,this.node.childNodes[r])).scope=i({},this.scope),n[r]=t;return n},removeChildNodes:function(){for(;this.node.hasChildNodes();)this.node.removeChild(this.node.firstChild)},removeChild:function(t){return this.node.removeChild(t.node),node},removeSelf:function(){this.node.parentNode.removeChild(this.node)},importNode:function(t){this.node.ownerDocument&&this.node.ownerDocument.importNode&&t.node.ownerDocument!==this.node.ownerDocument&&(t.node=this.node.ownerDocument.importNode(t.node,!0))},appendChild:function(t){this.importNode(t),this.node.appendChild(t.node)},insertAfter:function(t){this.importNode(t);var i=this.node.parentNode,s=this.node.nextSibling;s?i.insertBefore(t.node,s):i.appendChild(t.node)},insertBefore:function(t){this.importNode(t),this.node.parentNode.insertBefore(t.node,this.node)},process:function(){for(var t,i=["define","condition","repeat"],s=0,n=i.length;s<n;++s)if((t=this.getAttribute(i[s]))&&!t.process())return;var e=this.getAttribute("content");if(e)e.process();else{var r=this.getAttribute("replace");r&&r.process()}var h=this.getAttribute("attributes");h&&h.process(),e||r||this.processChildNodes();var o=this.getAttribute("omit-tag");o&&o.process();var u=this.getAttribute("reflow");u&&u.process()},processChildNodes:function(){for(var t=this.getChildNodes(),i=0,s=t.length;i<s;++i)t[i].process()}});var r=function(t){if("string"!=typeof(t=t||{})&&1!==t.nodeType||(t={node:t}),"string"==typeof t.node&&(t.node=document.getElementById(t.node),!t.node))throw Error("Element id not found: "+t.node);t.node?(this.node=t.node,this.loaded=!0):t.url&&this.load({url:t.url,callback:t.callback,scope:t.scope})};i(r.prototype,{node:null,usingNS:!1,xmldom:window.ActiveXObject?new ActiveXObject("Microsoft.XMLDOM"):null,trimSpace:/^\s*(\w+)\s+(.*?)\s*$/,loaded:!1,loading:!1,process:function(n){var r,h;return n=i({context:null,clone:!1,string:!1},n),this.usingNS=this.node.getAttributeNodeNS&&t.namespaceURI,r=new e(this,this.node),(n.clone||n.string)&&(r=r.clone()),n.context&&(r.scope=n.context),r.process(),n.string?h=r.node.innerHTML?r.node.innerHTML:this.xmldom?r.node.xml:(new XMLSerializer).serializeToString(r.node):(h=r.node,n.parent&&(n.clone?h=s(n.parent,r.node):this.appendTo(n.parent))),h},load:function(i){"string"==typeof i&&(i={url:i}),i=i||{},this.loading=!0;var s;i.failure&&(s=function(t){i.failure.call(i.scope,t)}),t.loadTemplate({url:i.url,callback:function(t){this.node=t.node,this.loading=!1,this.loaded=!0,i.callback&&i.callback.apply(i.scope,[t])},failure:s,scope:this})},appendTo:function(t){return this.node=s(t,this.node),this}});var h=function(t,i,s){this.element=t,this.node=i,this.type=s,this.nodeValue=i.nodeValue,this.nodeName=i.nodeName,this.template=t.template};i(h.prototype,{splitAttributeValue:function(t){t=null!=t?t:this.nodeValue;var i=this.template.trimSpace.exec(t);return i&&3===i.length&&[i[1],i[2]]},splitExpressionPrefix:function(){var t=this.splitAttributeValue();return(!t||"structure"!=t[0]&&"text"!=t[0])&&(t=[null,this.nodeValue]),t},getAttributeValues:function(){return this.nodeValue.replace(/[\t\n]/g,"").replace(/;\s*$/,"").replace(/;;/g,"\t").split(";").join("\n").replace(/\t/g,";").split(/\n/g)},removeSelf:function(){this.element.removeAttributeNode(this)},process:function(){return this.processAttribute[this.type].apply(this,[])},evalInScope:function(t){var i=this.element.scope,s=[],n=[];for(key in i)s.push(key),n.push(i[key]);return new Function(s.join(","),"return "+t).apply({},n)},processAttribute:{define:function(){var t,i,s,n=this.getAttributeValues();for(i=0,s=n.length;i<s;++i)t=this.splitAttributeValue(n[i]),this.element.scope[t[0]]=this.evalInScope(t[1]);return this.removeSelf(),!0},condition:function(){var t=!!this.evalInScope(this.nodeValue);return this.removeSelf(),t||this.element.removeSelf(),t},repeat:function(){var t,i=this.splitAttributeValue(),s=i[0],n=this.evalInScope(i[1]);if(this.removeSelf(),!(n instanceof Array)){var e=new Array;for(var r in n)e.push(r);n=e}for(var h=this.element,o=0,u=n.length;o<u;++o)(t=this.element.clone()).scope[s]=n[o],t.scope.repeat[s]={index:o,number:o+1,even:!(o%2),odd:!!(o%2),start:0===o,end:o===u-1,length:u},h.insertAfter(t),t.process(),h=t;return this.element.removeSelf(),!1},content:function(){var t=this.splitExpressionPrefix(),i=this.evalInScope(t[1]);if(this.removeSelf(),"structure"===t[0])try{this.element.node.innerHTML=i}catch(t){var s=document.createElement("div");if(s.innerHTML=i,this.element.node.xml&&this.template.xmldom){for(;this.element.node.firstChild;)this.element.node.removeChild(this.element.node.firstChild);this.template.xmldom.loadXML(s.outerHTML);for(var n=this.template.xmldom.firstChild.childNodes,r=0,h=n.length;r<h;++r)this.element.node.appendChild(n[r])}else this.element.node.innerHTML=s.innerHTML}else{var o;o=this.element.node.xml&&this.template.xmldom?this.template.xmldom.createTextNode(i):document.createTextNode(i);var u=new e(this.template,o);this.element.removeChildNodes(),this.element.appendChild(u)}return!0},replace:function(){var t=this.splitExpressionPrefix(),i=this.evalInScope(t[1]);if(this.removeSelf(),"structure"===t[0]){var s=document.createElement("div");for(s.innerHTML=i,this.element.node.xml&&this.template.xmldom&&(this.template.xmldom.loadXML(s.outerHTML),s=this.template.xmldom.firstChild);s.firstChild;){var n=s.removeChild(s.firstChild);this.element.node.ownerDocument&&this.element.node.ownerDocument.importNode&&n.ownerDocument!=this.element.node.ownerDocument&&(n=this.element.node.ownerDocument.importNode(n,!0)),this.element.node.parentNode.insertBefore(n,this.element.node)}}else{var r;r=this.element.node.xml&&this.template.xmldom?this.template.xmldom.createTextNode(i):document.createTextNode(i);var h=new e(this.template,r);this.element.insertBefore(h)}return this.element.removeSelf(),!0},attributes:function(){for(var t,i,s,n=this.getAttributeValues(),e=0,r=n.length;e<r;++e)i=(t=this.splitAttributeValue(n[e]))[0],!1!==(s=this.evalInScope(t[1]))&&this.element.setAttribute(i,s);return this.removeSelf(),!0},"omit-tag":function(){var t=""===this.nodeValue||!!this.evalInScope(this.nodeValue);if(this.removeSelf(),t){for(var i=this.element.getChildNodes(),s=0,n=i.length;s<n;++s)this.element.insertBefore(i[s]);this.element.removeSelf()}},reflow:function(){var t=""===this.nodeValue||!!this.evalInScope(this.nodeValue);this.removeSelf(),t&&(this.element.node.outerHTML?this.element.node.outerHTML=this.element.node.outerHTML:this.element.node.innerHTML=this.element.node.innerHTML)}}}),window.jugl=i(t,{Template:r})}();