/* Sharia Halaal Trader – script.js
   Is file ko <head> me load kiya gaya hai (bina defer), taaki revisit check page dikhne se pehle chale. */

/* ===== 1) Settings + Revisit check ===== */
var TELEGRAM_LINK    = "https://t.me/+8dmExi9qqfgyNzBl";
var REVISIT_REDIRECT = true;  // true = pehle join kar chuke log seedha Telegram jaayein, false = sabko page dikhe

// Revisit check: pehle button daba chuka hai to page chhupa do (PageView ke baad Telegram)
var TEST_MODE = /[?&]test=1/.test(location.search);  // testing: link ke end me ?test=1
var IS_REVISIT=false;
(function(){
  if(!REVISIT_REDIRECT) return;
  if(TEST_MODE || location.search.indexOf("stay=1")>-1) return;   // test/stay mode me page hamesha dikhe
  try{ IS_REVISIT = localStorage.getItem("sht_sub")==="1"; }catch(e){}
  if(!IS_REVISIT) IS_REVISIT = /(?:^|; )sht_sub=1/.test(document.cookie);
  if(IS_REVISIT){
    var st=document.createElement("style");
    st.textContent="html{background:#04261c}body{visibility:hidden}";
    document.head.appendChild(st);
  }
})();

/* ===== 2) Meta Pixel ===== */
!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
document,'script','https://connect.facebook.net/en_US/fbevents.js');
// Meta ke automatic events band (SubscribedButtonClick, Microdata) - Subscribe sirf hamare code se
fbq('set', 'autoConfig', false, '1343437741023605');
fbq('init', '1343437741023605');
fbq('track', 'PageView');

// Revisit: Pixel load hokar PageView bhej de, phir Telegram (max 1.5 sec wait)
if(IS_REVISIT){
  var go=false, startT=Date.now();
  function goTG(){ if(go) return; go=true; location.replace(TELEGRAM_LINK); }
  (function wait(){
    if(window.fbq && window.fbq.callMethod) return setTimeout(goTG,300);
    if(Date.now()-startT>1500) return goTG();
    setTimeout(wait,50);
  })();
}

/* ===== 3) Button, Subscribe event, test mode, privacy popup (page load hone ke baad) ===== */
document.addEventListener("DOMContentLoaded", function(){
  var CLICK_DELAY = 0.3; // button turant dikhta hai, click itne second baad hoga

  var cta=document.getElementById("cta");
  cta.href=TELEGRAM_LINK;
  setTimeout(function(){cta.classList.remove("wait");cta.classList.add("ready");},CLICK_DELAY*1000);

  // ---- Duplicate rokne ke liye: localStorage + cookie ----
  function getCookie(n){var m=document.cookie.match(new RegExp("(?:^|; )"+n+"=([^;]*)"));return m?decodeURIComponent(m[1]):null;}
  function alreadySubscribed(){
    var ls=null; try{ ls=localStorage.getItem("sht_sub"); }catch(e){}
    return ls==="1" || getCookie("sht_sub")==="1";
  }
  function markSubscribed(){
    try{ localStorage.setItem("sht_sub","1"); }catch(e){}
    document.cookie="sht_sub=1; max-age="+(60*60*24*90)+"; path=/; SameSite=Lax"; // 90 din
  }

  // ---- Asli user check ----
  var touched=false, fired=false, loadedAt=Date.now();
  ["pointerdown","touchstart","mousedown"].forEach(function(ev){
    cta.addEventListener(ev,function(e){ if(e.isTrusted) touched=true; },{passive:true});
  });

  cta.addEventListener("click",function(e){
    e.preventDefault();
    if(fired) return;
    var realUser = e.isTrusted && touched && (Date.now()-loadedAt) >= CLICK_DELAY*1000 && !navigator.webdriver;
    fired=true;
    if(TEST_MODE) testMsg(realUser ? "✅ Subscribe event bheja gaya" : "🤖 Bot/fake click – event nahi gaya");
    if(realUser && (TEST_MODE || !alreadySubscribed())){
      var eventId = "sub_" + Date.now() + "_" + Math.random().toString(36).slice(2,10);
      if(window.fbq) fbq('track','Subscribe',{},{eventID:eventId});   // sirf pehli baar
      if(!TEST_MODE) markSubscribed();   // test mode me yaad nahi rakhta, baar-baar test kar sako
    }
    setTimeout(function(){ window.location.href=TELEGRAM_LINK; }, TEST_MODE ? 1500 : 300);
  });

  // Back button se wapas aaye to button phir kaam kare
  window.addEventListener("pageshow",function(e){ if(e.persisted) fired=false; });

  // ---- Test mode badge ----
  function testMsg(t){ var b=document.getElementById("tbadge"); if(b) b.textContent="TEST MODE · "+t; }
  if(TEST_MODE){
    var tb=document.createElement("div"); tb.id="tbadge";
    tb.style.cssText="position:fixed;top:0;left:0;right:0;z-index:99;background:#ffcc00;color:#111;font:700 12.5px system-ui,sans-serif;text-align:center;padding:8px";
    document.body.appendChild(tb);
    testMsg("PageView bheja gaya · ab button dabao");
  }

  // Privacy popup
  var pp=document.getElementById("privacy");
  function openPP(e){ if(e) e.preventDefault(); pp.hidden=false; document.body.style.overflow="hidden"; }
  function closePP(){ pp.hidden=true; document.body.style.overflow=""; }
  document.getElementById("openPrivacy").addEventListener("click",openPP);
  document.getElementById("closePrivacy").addEventListener("click",closePP);
  pp.addEventListener("click",function(e){ if(e.target===pp) closePP(); });
  document.addEventListener("keydown",function(e){ if(e.key==="Escape" && !pp.hidden) closePP(); });
});
