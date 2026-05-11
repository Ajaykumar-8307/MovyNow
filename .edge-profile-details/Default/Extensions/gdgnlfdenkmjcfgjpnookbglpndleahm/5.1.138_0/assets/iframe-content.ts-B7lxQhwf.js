import{b as R,C as _}from"./applyThems-BzSE9nHO.js";import{m as M}from"./sentry-BJUW_4Fu.js";import{A as p,N as D,g as B,r as C}from"./utility_all2-DwxjoOyi.js";import"./autoCouponUI-DwTqP-pl.js";import"./bankOfferUtils-CPiEwyTk.js";let t=document.getElementById("bh-crx-root"),u,o=null,s=!1,a=!1;function w(){if(o){try{typeof o.$destroy=="function"?o.$destroy():typeof o.destroy=="function"&&o.destroy()}catch{}o=null}}function n(e,l){try{if(window.parent&&window.parent!==window){if(e==="BUYHATKE_IFRAME_LOADED"&&a)return;window.parent.postMessage({type:e,source:"buyhatke-extension",url:l||window.location.href},"*"),e==="BUYHATKE_IFRAME_LOADED"&&(a=!0)}}catch{}}let r=null,f=null;function H(){r!==null&&(clearTimeout(r),r=null),f!==null&&(clearTimeout(f),f=null),w(),n("BUYHATKE_IFRAME_UNLOADED"),t&&t.parentNode&&(t.parentNode.removeChild(t),t=null),a=!1}async function h(){if(s||o)return o;try{if(s=!0,await p(),!D())return null;if(u=await B()||await C(),u){t&&(w(),t.parentNode&&t.parentNode.removeChild(t)),t=document.createElement("div"),t.id="bh-crx-root",t.setAttribute("style","display: block !important; position: fixed !important; inset: 0 !important; z-index: 2147483647 !important; pointer-events: none !important;"),document.body.appendChild(t);const e=t.attachShadow({mode:"closed"}),l=chrome.runtime.getURL("src/ui/assets/fonts/metropolis-latin-400-normal.woff2"),y=chrome.runtime.getURL("src/ui/assets/fonts/metropolis-latin-500-normal.woff2"),A=chrome.runtime.getURL("src/ui/assets/fonts/metropolis-latin-600-normal.woff2"),U=chrome.runtime.getURL("src/ui/assets/fonts/metropolis-latin-700-normal.woff2"),g=chrome.runtime.getURL("src/ui/assets/fonts/metropolis-latin-400-normal.woff"),T=chrome.runtime.getURL("src/ui/assets/fonts/metropolis-latin-500-normal.woff"),I=chrome.runtime.getURL("src/ui/assets/fonts/metropolis-latin-600-normal.woff"),L=chrome.runtime.getURL("src/ui/assets/fonts/metropolis-latin-700-normal.woff"),m=document.createElement("style");return m.textContent=`
			  @font-face {
				font-family: 'Metropolis';
				src: url(${l}) format('woff2');
				src: url(${g}) format('woff');
				font-weight: 400;
				font-display: swap;
				font-style: normal;
			  }
			  @font-face {
				font-family: 'Metropolis';
				src: url(${y}) format('woff2');
				src: url(${T}) format('woff');
				font-weight: 500;
				font-display: swap;
				font-style: normal;
			  }
			  @font-face {
				font-family: 'Metropolis';
				src: url(${A}) format('woff2');
				src: url(${I}) format('woff');
				font-weight: 600;
				font-display: swap;
				font-style: normal;
			  }
			  @font-face {
				font-family: 'Metropolis';
				src: url(${U}) format('woff2');
				src: url(${L}) format('woff');
				font-weight: 700;
				font-display: swap;
				font-style: normal;
			  }
				`,e.appendChild(m),R(e),o=M(_,{target:e}),n("BUYHATKE_IFRAME_LOADED"),r=setTimeout(()=>{n("BUYHATKE_RAISE_IFRAME"),r=null},400),f=setTimeout(()=>{n("BUYHATKE_RAISE_IFRAME"),f=null},1200),o}}catch(e){console.error("BuyHatke: Error mounting in iframe:",e),o=null}finally{s=!1}return null}let i=null;p();function c(){i!==null&&clearTimeout(i),i=window.setTimeout(()=>{h(),i=null},100)}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",c):c();const K=h();let d=!1;function E(e){d||(n(e),d=!0),H()}window.addEventListener("beforeunload",()=>{E("BUYHATKE_IFRAME_UNLOADED")});document.addEventListener("visibilitychange",()=>{document.hidden&&n("BUYHATKE_IFRAME_HIDDEN")});window.addEventListener("pagehide",()=>{E("BUYHATKE_IFRAME_UNLOADED")});export{K as default};
