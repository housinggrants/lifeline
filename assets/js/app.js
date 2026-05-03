(function(){
  "use strict";

  var ADPLUS = {
    networkCode: "22871339810",
    website: "housinggrantsfinder.com",
    units: {
      interstitial: "/21849154601,22871339810/Ad.Plus-Interstitial",
      anchor: "/21849154601,22871339810/Ad.Plus-Anchor",
      sideAnchor: "/21849154601,22871339810/Ad.Plus-Side-Anchor",
      pause300: "/21849154601,22871339810/Ad.Plus-Pause-300x250",
      rect300: "/21849154601,22871339810/Ad.Plus-300x250",
      rect336: "/21849154601,22871339810/Ad.Plus-336x280",
      wide970: "/21849154601,22871339810/Ad.Plus-970x250",
      banner728: "/21849154601,22871339810/Ad.Plus-728x90"
    }
  };

  function qs(s,r){return(r||document).querySelector(s)}
  function qsa(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))}
  function slug(){return (location.pathname||"/").replace(/^\/+|\/+$/g,"") || "home"}
  function isTrustPage(){return false}
  function isBotPage(){return /google[a-z0-9]+\.html$/i.test(location.pathname||"")}

  function parseSizes(v){
    if(!v)return [[300,250]];
    return v.split("|").map(function(x){
      var p=x.split("x").map(function(n){return parseInt(n,10)});
      return [p[0],p[1]];
    }).filter(function(p){return p[0]&&p[1]});
  }

  function makeAd(id, unit, sizes, className){
    var wrap=document.createElement("div");
    wrap.className="ad-wrap "+(className||"ad-rectangle")+" adplus-auto-money";
    wrap.setAttribute("aria-label","Advertisement");
    var slotClass = className && className.indexOf("ad-video") !== -1 ? "video-reserve" : "ad-slot";
    wrap.innerHTML='<div class="ad-label">Advertisement</div><div class="'+slotClass+'" id="'+id+'" data-ad-slot="true" data-ad-unit="'+unit+'" data-ad-sizes="'+sizes+'"></div>';
    return wrap;
  }

  function nextAdSpec(index){
    var specs=[
      {unit:ADPLUS.rect300,sizes:"300x250",cls:"ad-rectangle"},
      {unit:ADPLUS.rect336,sizes:"336x280|300x250",cls:"ad-rectangle wide-336"},
      {unit:ADPLUS.wide970,sizes:"970x250|728x90|320x100",cls:"ad-wide"},
      {unit:ADPLUS.rect300,sizes:"300x250",cls:"ad-rectangle"},
      {unit:ADPLUS.banner728,sizes:"728x90|320x100",cls:"ad-wide"},
      {unit:ADPLUS.rect300,sizes:"300x250",cls:"ad-rectangle"}
    ];
    return specs[index % specs.length];
  }

  function hasAdNear(el){
    var prev=el&&el.previousElementSibling, next=el&&el.nextElementSibling;
    return (prev&&prev.classList&&prev.classList.contains("ad-wrap")) || (next&&next.classList&&next.classList.contains("ad-wrap"));
  }

  function injectAutoAds(){
    if(isBotPage())return;
    var main=qs("#main")||qs("main");
    if(!main)return;

    var current=qsa("[data-ad-slot='true']",main).length;
    var pathSlug=slug();
    var maxSlots = 8;
    if(document.body.classList.contains("result-page")) maxSlots=8;

    var targets=[];
    qsa(".hero,.article-hero,.result-hero,.checker-shell,.intro-panel,.content-section,.provider-strip,.next-panels,.warning-box,.faq-block,.internal-links,.source-box,.result-card,.side-card,.state-grid,.toc-card",main).forEach(function(el){
      if(el.closest(".sticky-cta-card"))return;
      if(hasAdNear(el))return;
      targets.push(el);
    });

    var added=0;
    for(var i=0;i<targets.length && current<maxSlots;i++){
      var spec=nextAdSpec(added);
      var id="adplus-auto-"+pathSlug.replace(/[^a-z0-9]+/gi,"-")+"-"+(added+1);
      targets[i].insertAdjacentElement("afterend",makeAd(id,spec.unit,spec.sizes,spec.cls));
      current++;
      added++;
    }

    if(current < 3){
      for(var j=current;j<3;j++){
        var fallbackSpec=nextAdSpec(added);
        var fallbackId="adplus-fallback-"+pathSlug.replace(/[^a-z0-9]+/gi,"-")+"-"+(added+1);
        main.appendChild(makeAd(fallbackId,fallbackSpec.unit,fallbackSpec.sizes,fallbackSpec.cls));
        added++;
        current++;
      }
    }
  }

  function loadGPT(){
    window.googletag=window.googletag||{cmd:[]};
    if(window.__hgfAdplusGptRequested)return;
    window.__hgfAdplusGptRequested=true;
    var s=document.createElement("script");
    s.async=true;
    s.src="https://securepubads.g.doubleclick.net/tag/js/gpt.js";
    s.crossOrigin="anonymous";
    document.head.appendChild(s);
  }

  function defineMoneyAds(){
    if(isBotPage())return;
    injectAutoAds();
    loadGPT();
    window.googletag=window.googletag||{cmd:[]};
    googletag.cmd.push(function(){
      var refreshSlots=[];
      var displayEls=qsa("[data-ad-slot='true']");

      displayEls.forEach(function(el){
        if(el.dataset.defined==="true" || !el.id)return;
        var unit=el.getAttribute("data-ad-unit");
        var sizes=parseSizes(el.getAttribute("data-ad-sizes"));
        if(!unit || !sizes.length)return;
        var slot=googletag.defineSlot(unit,sizes.length===1?sizes[0]:sizes,el.id);
        if(!slot)return;
        slot.addService(googletag.pubads());
        if(unit.indexOf("Pause-300x250") !== -1 && slot.setConfig){
          slot.setConfig({contentPause:true});
        }
        el.dataset.defined="true";
      });

      var interstitialSlot=null;
      if(googletag.enums && googletag.enums.OutOfPageFormat){
        interstitialSlot=googletag.defineOutOfPageSlot(ADPLUS.units.interstitial,googletag.enums.OutOfPageFormat.INTERSTITIAL);
        if(interstitialSlot)interstitialSlot.addService(googletag.pubads());
      }

      var anchorSlot=null;
      if(googletag.enums && googletag.enums.OutOfPageFormat){
        anchorSlot=googletag.defineOutOfPageSlot(ADPLUS.units.anchor,googletag.enums.OutOfPageFormat.BOTTOM_ANCHOR);
        if(anchorSlot){anchorSlot.addService(googletag.pubads());refreshSlots.push(anchorSlot)}
      }

      var leftRail=null,rightRail=null;
      if(window.matchMedia && window.matchMedia("(min-width: 1200px)").matches && googletag.enums && googletag.enums.OutOfPageFormat){
        leftRail=googletag.defineOutOfPageSlot(ADPLUS.units.sideAnchor,googletag.enums.OutOfPageFormat.LEFT_SIDE_RAIL);
        if(leftRail){leftRail.addService(googletag.pubads());refreshSlots.push(leftRail)}
        rightRail=googletag.defineOutOfPageSlot(ADPLUS.units.sideAnchor,googletag.enums.OutOfPageFormat.RIGHT_SIDE_RAIL);
        if(rightRail){rightRail.addService(googletag.pubads());refreshSlots.push(rightRail)}
      }

      googletag.pubads().enableSingleRequest();
      if(googletag.pubads().enableLazyLoad){
        googletag.pubads().enableLazyLoad({fetchMarginPercent:220,renderMarginPercent:120,mobileScaling:2});
      }
      googletag.pubads().collapseEmptyDivs(false);
      googletag.enableServices();

      displayEls.forEach(function(el){
        if(el.dataset.defined==="true" && !el.dataset.displayed){googletag.display(el.id);el.dataset.displayed="true"}
      });
      if(interstitialSlot)googletag.display(interstitialSlot);
      if(anchorSlot)googletag.display(anchorSlot);
      if(leftRail)googletag.display(leftRail);
      if(rightRail)googletag.display(rightRail);

      window.__hgfAdplusRefreshSlots=refreshSlots;
      if(refreshSlots.length && !window.__hgfAdplusRefreshTimer){
        window.__hgfAdplusRefreshTimer=setInterval(function(){
          if(document.hidden || !window.googletag || !window.__hgfAdplusRefreshSlots || !window.__hgfAdplusRefreshSlots.length)return;
          googletag.cmd.push(function(){googletag.pubads().refresh(window.__hgfAdplusRefreshSlots)});
        },30000);
      }
    });
  }

  function setupVideo(){
    var video=qs("[data-adplus-video='true']");
    if(!video || window.__hgfAdplusVideoLoaded)return;
    window.__hgfAdplusVideoLoaded=true;
    video.innerHTML="";
    var external=document.createElement("script");
    external.async=true;
    external.src="https://cdn.ad.plus/player/adplus.js";
    var inline=document.createElement("script");
    inline.setAttribute("data-playerPro","current");
    inline.text='(function(){var s=document.querySelector(\'script[data-playerPro="current"]\');if(s){s.removeAttribute("data-playerPro");}(playerPro=window.playerPro||[]).push({id:"z2I717k6zq5b",after:s,appParams:{"C_NETWORK_CODE":"22871339810","C_WEBSITE":"housinggrantsfinder.com"}});})();';
    video.appendChild(external);
    video.appendChild(inline);
  }

  function initAds(){defineMoneyAds();setupVideo()}

  function initMenu(){var btn=qs(".menu-toggle"),nav=qs(".main-nav");if(!btn||!nav)return;btn.addEventListener("click",function(){var open=nav.classList.toggle("is-open");btn.setAttribute("aria-expanded",open?"true":"false")})}
  function labelFrom(v){return(v||"").replace(/-/g," ").replace(/\b\w/g,function(c){return c.toUpperCase()})}
  function initChecker(){var shell=qs("[data-checker='true']");if(!shell)return;var step=1,total=7,selections={};var progress=qs("#checker-progress"),now=qs("#checker-step-now"),loading=qs(".checker-loading",shell);function showStep(n){step=n;qsa(".checker-stage",shell).forEach(function(st){st.classList.toggle("is-active",parseInt(st.getAttribute("data-step"),10)===n)});if(loading)loading.classList.remove("is-active");if(progress)progress.style.width=Math.round((n/total)*100)+"%";if(now)now.textContent=String(n)}function finish(){qsa(".checker-stage",shell).forEach(function(st){st.classList.remove("is-active")});if(loading)loading.classList.add("is-active");try{sessionStorage.setItem("lifeline_checker",JSON.stringify(selections))}catch(e){}setTimeout(function(){var p=new URLSearchParams();p.set("goal",selections.goal||"phone");p.set("benefit",selections.benefit||"not-sure");p.set("state",selections.state||"not-sure");p.set("priority",selections.priority||"compare");p.set("situation",selections.situation||"compare");p.set("need",selections.need||"documents");window.location.href="/result/?"+p.toString()},1500)}shell.addEventListener("click",function(e){var btn=e.target.closest("button");if(!btn)return;if(btn.dataset.stateNext==="true"){var select=qs("#checker-state");selections.state=select&&select.value?select.value:"not-sure";showStep(4);return}if(btn.dataset.final==="true"){finish();return}var key=btn.getAttribute("data-key"),value=btn.getAttribute("data-value");if(key&&value){selections[key]=value;if(step<7)showStep(step+1)}});showStep(1)}
  function initResult(){if(!document.body.classList.contains("result-page"))return;var params=new URLSearchParams(window.location.search),stored={};try{stored=JSON.parse(sessionStorage.getItem("lifeline_checker")||"{}")}catch(e){}var goal=params.get("goal")||stored.goal||"phone";var benefit=params.get("benefit")||stored.benefit||"not-sure";var state=params.get("state")||stored.state||"not-sure";var priority=params.get("priority")||stored.priority||"compare";var situation=params.get("situation")||stored.situation||"compare";var need=params.get("need")||stored.need||"documents";var title=qs("#result-title"),summary=qs("#result-summary"),tags=qs("#result-tags"),stateName=labelFrom(state);var goalMap={phone:"free phone",iphone:"free iPhone",tablet:"free tablet",service:"free monthly phone service",all:"all available phone options"};var benefitMap={snap:"SNAP or EBT",medicaid:"Medicaid",ssi:"SSI",housing:"Federal Public Housing",veterans:"Veterans Pension",income:"income-based",unsure:"not sure",'not-sure':"not sure"};if(title)title.textContent="Your "+(goalMap[goal]||"phone assistance")+" options are ready";if(summary)summary.textContent="Based on your selections, your safer path is to compare Lifeline eligibility through "+(benefitMap[benefit]||labelFrom(benefit))+" in "+stateName+", then review documents, provider availability, and device terms before submitting any application.";if(tags){tags.innerHTML=[goalMap[goal]||labelFrom(goal),benefitMap[benefit]||labelFrom(benefit),stateName,labelFrom(priority),labelFrom(situation),labelFrom(need)].map(function(x){return"<span>"+x+"</span>"}).join("")}qsa("[data-state-name]").forEach(function(el){el.textContent=stateName});qsa("[data-benefit-name]").forEach(function(el){el.textContent=benefitMap[benefit]||labelFrom(benefit)});qsa("[data-goal-name]").forEach(function(el){el.textContent=goalMap[goal]||labelFrom(goal)})}
  function initFaq(){qsa("details").forEach(function(d){d.addEventListener("toggle",function(){if(d.open){qsa("details",d.parentNode).forEach(function(other){if(other!==d)other.open=false})}})})}

  document.addEventListener("DOMContentLoaded",function(){initMenu();initChecker();initResult();initFaq();initAds()});
})();
