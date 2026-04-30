
(function(){
  "use strict";

  const ADPLUS = {
    networkCode: "22871339810",
    website: "housinggrantsfinder.com",
    units: {
      interstitial: "/21849154601,22871339810/Ad.Plus-Interstitial",
      anchor: "/21849154601,22871339810/Ad.Plus-Anchor",
      anchorSmall: "/21849154601,22871339810/Ad.Plus-Anchor-Small",
      sideAnchor: "/21849154601,22871339810/Ad.Plus-Side-Anchor",
      mobileAnchor: "/21849154601,22871339810/Ad.Plus-320x100"
    }
  };

  function qs(sel, root){ return (root || document).querySelector(sel); }
  function qsa(sel, root){ return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  function parseSizes(value){
    if(!value) return [[300,250]];
    return value.split("|").map(function(item){
      const parts = item.split("x").map(function(n){ return parseInt(n, 10); });
      return [parts[0], parts[1]];
    }).filter(function(pair){ return pair[0] && pair[1]; });
  }

  function loadGPT(){
    if(window.__adplusGptLoading) return;
    window.__adplusGptLoading = true;
    window.googletag = window.googletag || {cmd: []};
    const s = document.createElement("script");
    s.async = true;
    s.src = "https://securepubads.g.doubleclick.net/tag/js/gpt.js";
    s.crossOrigin = "anonymous";
    document.head.appendChild(s);
  }

  function setupDisplayAds(){
    const slots = qsa("[data-ad-slot='true']");
    if(!slots.length) return;
    loadGPT();
    window.googletag = window.googletag || {cmd: []};
    googletag.cmd.push(function(){
      slots.forEach(function(el){
        if(el.dataset.defined === "true") return;
        const unit = el.getAttribute("data-ad-unit");
        const sizes = parseSizes(el.getAttribute("data-ad-sizes"));
        if(!unit || !el.id) return;
        const slot = googletag.defineSlot(unit, sizes.length === 1 ? sizes[0] : sizes, el.id);
        if(slot){ slot.addService(googletag.pubads()); el.dataset.defined = "true"; }
      });
      googletag.pubads().enableSingleRequest();
      googletag.pubads().collapseEmptyDivs(false);
      googletag.enableServices();
      slots.forEach(function(el){
        if(el.dataset.defined === "true"){ googletag.display(el.id); }
      });
    });
  }

  function setupAnchor(){
    if(qs(".adplus-bottom-anchor")) return;
    const wrap = document.createElement("div");
    wrap.className = "adplus-bottom-anchor";
    wrap.setAttribute("aria-label", "Advertisement");
    wrap.innerHTML = '<div class="ad-label">Advertisement</div><div class="ad-slot" id="adplus-anchor-slot"></div>';
    document.body.appendChild(wrap);
    loadGPT();
    window.googletag = window.googletag || {cmd: []};
    googletag.cmd.push(function(){
      let slot = null;
      if(googletag.enums && googletag.enums.OutOfPageFormat){
        slot = googletag.defineOutOfPageSlot(ADPLUS.units.anchor, googletag.enums.OutOfPageFormat.BOTTOM_ANCHOR);
      }
      if(!slot){
        slot = googletag.defineSlot(ADPLUS.units.anchorSmall, [[728,90],[320,100],[300,100]], "adplus-anchor-slot");
      }
      if(slot){ slot.addService(googletag.pubads()); }
      googletag.enableServices();
      if(slot && slot.getSlotElementId && slot.getSlotElementId() !== "adplus-anchor-slot"){
        googletag.display(slot);
      }else{
        googletag.display("adplus-anchor-slot");
      }
    });
  }

  function setupInterstitial(){
    if(sessionStorage.getItem("adplus_interstitial_seen") === "1") return;
    sessionStorage.setItem("adplus_interstitial_seen", "1");
    loadGPT();
    window.googletag = window.googletag || {cmd: []};
    googletag.cmd.push(function(){
      if(!(googletag.enums && googletag.enums.OutOfPageFormat)) return;
      const slot = googletag.defineOutOfPageSlot(ADPLUS.units.interstitial, googletag.enums.OutOfPageFormat.INTERSTITIAL);
      if(slot){
        slot.addService(googletag.pubads());
        googletag.enableServices();
        googletag.display(slot);
      }
    });
  }

  function setupSideRails(){
    if(window.innerWidth < 1500) return;
    if(qs(".adplus-side-rail")) return;
    ["left","right"].forEach(function(side){
      const rail = document.createElement("div");
      rail.className = "adplus-side-rail " + side;
      rail.innerHTML = '<div><div class="ad-label">Advertisement</div><div class="ad-slot" id="adplus-side-' + side + '" data-ad-slot="true" data-ad-unit="' + ADPLUS.units.sideAnchor + '" data-ad-sizes="160x600">Side rail</div></div>';
      document.body.appendChild(rail);
    });
  }

  function setupVideo(){
    const video = qs("[data-adplus-video='true']");
    if(!video || window.__adplusVideoLoaded) return;
    window.__adplusVideoLoaded = true;
    window.adplusVideoSettings = {
      playerId: "z2I717k6zq5b",
      C_NETWORK_CODE: ADPLUS.networkCode,
      C_WEBSITE: ADPLUS.website,
      containerId: "adplus-video-1"
    };
    const s = document.createElement("script");
    s.async = true;
    s.src = "https://cdn.ad.plus/player/adplus.js";
    document.head.appendChild(s);
  }

  function initAds(){
    setupSideRails();
    setupDisplayAds();
    setupAnchor();
    setupInterstitial();
    setupVideo();
  }

  function initMenu(){
    const btn = qs(".menu-toggle");
    const nav = qs(".main-nav");
    if(!btn || !nav) return;
    btn.addEventListener("click", function(){
      const open = nav.classList.toggle("is-open");
      btn.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  function labelFrom(value){
    if(!value) return "";
    return value.replace(/-/g, " ").replace(/\b\w/g, function(c){ return c.toUpperCase(); });
  }

  function initChecker(){
    const shell = qs("[data-checker='true']");
    if(!shell) return;
    let step = 1;
    const total = 7;
    const selections = {};
    const progress = qs("#checker-progress");
    const now = qs("#checker-step-now");

    function showStep(n){
      step = n;
      qsa(".checker-stage", shell).forEach(function(stage){
        stage.classList.toggle("is-active", parseInt(stage.getAttribute("data-step"), 10) === n);
      });
      if(progress) progress.style.width = Math.round((n / total) * 100) + "%";
      if(now) now.textContent = String(n);
    }

    function goNext(){
      if(step < 6){ showStep(step + 1); return; }
      showStep(7);
      try { sessionStorage.setItem("lifeline_checker", JSON.stringify(selections)); } catch(e){}
      setTimeout(function(){
        const params = new URLSearchParams();
        params.set("goal", selections.goal || "phone");
        params.set("benefit", selections.benefit || "not-sure");
        params.set("state", selections.state || "not-sure");
        params.set("priority", selections.priority || "compare");
        params.set("documents", selections.documents || "not-sure");
        window.location.href = "/result/?" + params.toString();
      }, 1500);
    }

    shell.addEventListener("click", function(e){
      const btn = e.target.closest("button");
      if(!btn) return;
      if(btn.dataset.stateNext === "true"){
        const select = qs("#checker-state");
        selections.state = select && select.value ? select.value : "not-sure";
        goNext();
        return;
      }
      const key = btn.getAttribute("data-key");
      const value = btn.getAttribute("data-value");
      if(key && value){
        selections[key] = value;
        goNext();
      }
    });

    showStep(1);
  }

  function initResult(){
    if(!document.body.classList.contains("result-page")) return;
    const params = new URLSearchParams(window.location.search);
    let stored = {};
    try { stored = JSON.parse(sessionStorage.getItem("lifeline_checker") || "{}"); } catch(e){}
    const goal = params.get("goal") || stored.goal || "phone";
    const benefit = params.get("benefit") || stored.benefit || "not-sure";
    const state = params.get("state") || stored.state || "not-sure";
    const priority = params.get("priority") || stored.priority || "compare";
    const documents = params.get("documents") || stored.documents || "not-sure";

    const title = qs("#result-title");
    const summary = qs("#result-summary");
    const tags = qs("#result-tags");

    const goalMap = {
      phone:"Lifeline phone service path",
      iphone:"Possible iPhone availability path",
      tablet:"Possible tablet availability path",
      service:"Free monthly service path",
      all:"All available Lifeline options path"
    };
    const benefitMap = {
      snap:"SNAP or EBT",
      medicaid:"Medicaid",
      ssi:"SSI",
      fpha:"Federal Public Housing",
      veterans:"Veterans Pension",
      income:"Income-based",
      "not-sure":"not sure"
    };

    if(title) title.textContent = goalMap[goal] || "Lifeline phone service path";
    if(summary){
      summary.textContent = "Your selections point toward " + (benefitMap[benefit] || "a Lifeline") + " eligibility in " + labelFrom(state) + ". The recommended next step is to compare provider availability, prepare documents, and verify any phone, iPhone, or tablet offer before applying.";
    }
    if(tags){
      [
        "Goal: " + labelFrom(goal),
        "Benefit: " + (benefitMap[benefit] || labelFrom(benefit)),
        "State: " + labelFrom(state),
        "Priority: " + labelFrom(priority),
        "Documents: " + labelFrom(documents)
      ].forEach(function(text){
        const span = document.createElement("span");
        span.textContent = text;
        tags.appendChild(span);
      });
    }
  }

  function initFAQ(){
    qsa("details").forEach(function(d){
      d.addEventListener("toggle", function(){
        if(d.open){
          qsa("details").forEach(function(other){
            if(other !== d && other.closest(".faq-block") === d.closest(".faq-block")) other.open = false;
          });
        }
      });
    });
  }

  document.addEventListener("DOMContentLoaded", function(){
    initMenu();
    initChecker();
    initResult();
    initFAQ();
    initAds();
  });
})();
