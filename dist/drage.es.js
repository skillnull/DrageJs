function e(t){return e="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e},e(t)}function t(t){var n=function(t,n){if("object"!=e(t)||!t)return t;var r=t[Symbol.toPrimitive];if(void 0!==r){var o=r.call(t,n);if("object"!=e(o))return o;throw new TypeError("@@toPrimitive must return a primitive value.")}return String(t)}(t,"string");return"symbol"==e(n)?n:n+""}function n(e,n,r){return n&&function(e,n){for(var r=0;r<n.length;r++){var o=n[r];o.enumerable=o.enumerable||!1,o.configurable=!0,"value"in o&&(o.writable=!0),Object.defineProperty(e,t(o.key),o)}}(e.prototype,n),Object.defineProperty(e,"prototype",{writable:!1}),e}var r=new(function(){return n((function e(){!function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}(this,e),this.ref,this.draggingFlag=!1,this.initX,this.initY,this.currentX,this.currentY,this.offsetX=0,this.offsetY=0,this.pageX,this.pageY,this.style={position:"fixed",zIndex:"999999"},this.setStorage,this.animationFrame,this.clientW=document.documentElement.clientWidth||document.body.clientWidth||window.innerWidth,this.clientH=document.documentElement.clientHeight||document.body.clientHeight||window.innerHeight}),[{key:"listen",value:function(e){var t=this,n=e.ref,r=e.style,o=void 0===r?{}:r,i=e.setStorage,s=void 0===i?"local":i;window.onresize=function(){t.storageHandle("remove"),t.clientW=document.documentElement.clientWidth||document.body.clientWidth||window.innerWidth,t.clientH=document.documentElement.clientHeight||document.body.clientHeight||window.innerHeight},this.ref=n,o&&(this.style=o),s&&(this.setStorage=s,this.storageHandle("get")),this.ref&&this.ref.setAttribute("draggable",!1),this.ref&&this.ref.addEventListener("touchstart",(function(e){return t.onStart(e,t)}),{passive:!1}),this.ref&&this.ref.addEventListener("mousedown",(function(e){return t.onStart(e,t)}),{passive:!1}),document.addEventListener("touchend",(function(e){return t.onEnd(e,t)})),document.addEventListener("mouseup",(function(e){return t.onEnd(e,t)}))}},{key:"storageHandle",value:function(e){if("get"===e){var t;"local"===this.setStorage&&(t=localStorage.getItem("DrageJS_INFO")),"session"===this.setStorage&&(t=sessionStorage.getItem("DrageJS_INFO"));try{if(!(t=JSON.parse(t)))return;this.currentX=t.currentX,this.initX=t.currentX,this.offsetX=t.currentX,this.currentY=t.currentY,this.initY=t.currentY,this.offsetY=t.currentY,this.setRef()}catch(e){console.log(e)}}"set"===e&&("local"===this.setStorage&&localStorage.setItem("DrageJS_INFO",JSON.stringify({currentX:this.currentX,currentY:this.currentY})),"session"===this.setStorage&&sessionStorage.setItem("DrageJS_INFO",JSON.stringify({currentX:this.currentX,currentY:this.currentY}))),"remove"===e&&(localStorage.removeItem("DrageJS_INFO"),sessionStorage.removeItem("DrageJS_INFO"))}},{key:"setRef",value:function(){if(this.ref){for(var e in this.style)this.ref.style[e]=this.style[e];this.ref.style.transform="translate3d(".concat(this.currentX,"px, ").concat(this.currentY,"px, 0)")}}},{key:"onStart",value:function(e,t){e.preventDefault(),t.draggingFlag=!0;var n="mousedown"===e.type?e:e.changedTouches&&e.changedTouches[0];t.initX=n.clientX-t.offsetX,t.initY=n.clientY-t.offsetY,t.pageX=n.pageX,t.pageY=n.pageY,document.addEventListener("touchmove",(function(e){return t.onMove(e,t)}),{passive:!1}),document.addEventListener("mousemove",(function(e){return t.onMove(e,t)}),{passive:!1})}},{key:"onMove",value:function(e,t){if(t.draggingFlag&&e){e.preventDefault();var n="mousemove"===e.type?e:e.changedTouches&&e.changedTouches[0];t.animationFrame&&cancelAnimationFrame(this.animationFrame),t.animationFrame=requestAnimationFrame((function(){var e=t.ref.getBoundingClientRect(),r=e.top,o=e.bottom,i=e.left,s=e.right;t.currentX=n.clientX-t.initX,t.currentY=n.clientY-t.initY;var u=t.currentX-t.offsetX,c=t.currentY-t.offsetY;i<=0?u<=0&&(t.offsetX-=i,t.currentX=t.offsetX):s>=t.clientW?u>=0&&(t.currentX=t.offsetX):t.offsetX=t.currentX,r<=0?c<=0&&(t.offsetY-=r,t.currentY=t.offsetY):o>=t.clientH?c>=0&&(t.currentY=t.offsetY):t.offsetY=t.currentY,t.setRef()}))}}},{key:"onEnd",value:function(e,t){t.draggingFlag=!1,document.removeEventListener("touchmove",(function(e){return t.onMove(e,t)})),document.removeEventListener("mousemove",(function(e){return t.onMove(e,t)})),t.storageHandle("set")}},{key:"removeListen",value:function(e){var t=this,n=e||(this.ref||document);n&&(n.removeEventListener("touchmove",(function(e){return t.onMove(e,t)})),n.removeEventListener("mousemove",(function(e){return t.onMove(e,t)})),n.removeEventListener("touchstart",(function(e){return t.onStart(e,t)})),n.removeEventListener("mousedown",(function(e){return t.onStart(e,t)})),n.removeEventListener("touchend",(function(e){return t.onEnd(e,t)})),n.removeEventListener("mouseup",(function(e){return t.onEnd(e,t)})),n.removeEventListener("mouseout",(function(e){return t.onEnd(e,t)})))}}])}());window.Drage=r;export{r as default};