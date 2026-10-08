/* Sarna Haldar Portfolio — vanilla JS */
(function(){
  "use strict";
  var prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Theme
  var root = document.documentElement;
  function getSaved(){ try{return localStorage.getItem("sarna-mood-v2")}catch(e){return null} }
  function applyTheme(m){
    root.dataset.theme = m;
    root.style.colorScheme = m==="day"?"light":"dark";
    try{localStorage.setItem("sarna-mood-v2",m)}catch(e){}
    var meta=document.querySelector('meta[name="theme-color"]');
    if(meta) meta.setAttribute("content", m==="day"?"#f2f6f7":"#050505");
    var btns=document.querySelectorAll("[data-theme-label]");
    btns.forEach(function(b){ b.textContent = m==="night" ? "Day" : "Night"; });
  }
  var initial = getSaved();
  if(initial!=="day" && initial!=="night") initial="night";
  applyTheme(initial);
  document.addEventListener("click",function(e){
    var t=e.target.closest("[data-theme-toggle]");
    if(!t) return;
    applyTheme(root.dataset.theme==="day"?"night":"day");
  });

  // Header scroll + active nav + toTop
  var header=document.getElementById("siteHeader");
  var toTop=document.getElementById("toTop");
  function onScroll(){
    var y=window.scrollY||0;
    if(header) header.classList.toggle("scrolled", y>12);
    if(toTop) toTop.classList.toggle("show", y>480);
  }
  window.addEventListener("scroll",onScroll,{passive:true}); onScroll();
  if(toTop) toTop.addEventListener("click",function(){
    window.scrollTo({top:0,behavior:prefersReduced?"instant":"smooth"});
  });

  // Mobile menu
  var menuBtn=document.getElementById("menuBtn");
  var mobileNav=document.getElementById("mobileNav");
  if(menuBtn&&mobileNav){
    menuBtn.addEventListener("click",function(){
      var open=mobileNav.classList.toggle("open");
      menuBtn.setAttribute("aria-expanded",open?"true":"false");
      menuBtn.textContent=open?"✕":"☰";
      document.body.style.overflow=open?"hidden":"";
    });
    mobileNav.addEventListener("click",function(e){
      if(e.target.closest("a")){
        mobileNav.classList.remove("open");
        menuBtn.setAttribute("aria-expanded","false");
        menuBtn.textContent="☰";
        document.body.style.overflow="";
      }
    });
  }

  // Reveal on scroll
  var revealEls=document.querySelectorAll(".reveal");
  if(!("IntersectionObserver" in window)||prefersReduced){
    revealEls.forEach(function(el){el.classList.add("visible")});
  }else{
    var io=new IntersectionObserver(function(entries){
      entries.forEach(function(en){
        if(en.isIntersecting){en.target.classList.add("visible");io.unobserve(en.target)}
      });
    },{threshold:.12,rootMargin:"0px 0px -40px 0px"});
    revealEls.forEach(function(el){io.observe(el)});
  }

  // Counters (genuine numbers only: 2+ , 6+ months)
  function animateCount(el){
    var target=parseInt(el.dataset.count||"0",10);
    var suffix=el.dataset.suffix||"";
    if(prefersReduced){el.textContent=target+suffix;return}
    var start=null,dur=800;
    function tick(t){
      if(!start)start=t;
      var p=Math.min((t-start)/dur,1);
      var e=1-Math.pow(1-p,3);
      el.textContent=Math.round(target*e)+suffix;
      if(p<1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
  var counters=document.querySelectorAll("[data-count]");
  if("IntersectionObserver" in window && !prefersReduced){
    var cio=new IntersectionObserver(function(es){
      es.forEach(function(en){ if(en.isIntersecting){animateCount(en.target);cio.unobserve(en.target)} });
    },{threshold:.6});
    counters.forEach(function(c){cio.observe(c)});
  }else{counters.forEach(animateCount)}

  // Hero parallax (subtle)
  var hero=document.getElementById("home");
  var art=document.getElementById("heroArt");
  if(hero&&art&&!prefersReduced){
    hero.addEventListener("mousemove",function(e){
      var r=hero.getBoundingClientRect();
      var x=(e.clientX-r.left)/r.width-.5, y=(e.clientY-r.top)/r.height-.5;
      art.style.transform="translate3d("+(x*14).toFixed(1)+"px,"+(y*10).toFixed(1)+"px,0)";
    });
    hero.addEventListener("mouseleave",function(){art.style.transform="translate3d(0,0,0)"});
  }

  // FAQ accordion
  document.querySelectorAll(".faq-item").forEach(function(item){
    var btn=item.querySelector(".faq-q");
    if(!btn) return;
    btn.addEventListener("click",function(){
      var open=item.classList.contains("open");
      document.querySelectorAll(".faq-item.open").forEach(function(o){o.classList.remove("open");o.querySelector(".faq-q").setAttribute("aria-expanded","false")});
      if(!open){item.classList.add("open");btn.setAttribute("aria-expanded","true")}
    });
  });

  // Testimonials: simple slider (buttons + dots)
  var track=document.getElementById("tTrack");
  var slides=track?Array.prototype.slice.call(track.children):[];
  var dotsWrap=document.getElementById("tDots");
  var idx=0;
  function show(i){
    if(!slides.length) return;
    idx=(i+slides.length)%slides.length;
    slides.forEach(function(s,k){s.style.display=k===idx?"block":"none"});
    if(dotsWrap){
      Array.prototype.forEach.call(dotsWrap.children,function(d,k){
        d.classList.toggle("active",k===idx);
      });
    }
  }
  if(track&&slides.length){
    // On desktop show grid, on mobile show slider: we keep slider behavior for all, but grid via CSS on wide screens shows all.
    // To keep simple + accessible: if wide screen, show all; else slider.
    function layout(){
      if(window.innerWidth>=1020){
        slides.forEach(function(s){s.style.display="block"});
      }else{show(idx)}
    }
    window.addEventListener("resize",layout); layout();
    var prev=document.getElementById("tPrev"),next=document.getElementById("tNext");
    if(prev) prev.addEventListener("click",function(){show(idx-1)});
    if(next) next.addEventListener("click",function(){show(idx+1)});
    if(dotsWrap){
      slides.forEach(function(_,k){
        var b=document.createElement("button");
        b.className="dotbtn"+(k===0?" active":"");
        b.setAttribute("aria-label","Show testimonial "+(k+1));
        b.addEventListener("click",function(){show(k)});
        dotsWrap.appendChild(b);
      });
    }
  }

  // Case study modal
  var modal=document.getElementById("caseModal");
  var modalBody=document.getElementById("caseBody");
  var CASES={
    "digital-marketing-campaign":{title:"Digital Marketing Campaign",cat:"Digital Marketing",ind:"Service Business",desc:"A concept campaign connecting content planning, audience engagement and lead inquiries.",work:["Audience and channel planning","Content theme development","Posting framework","Measurement plan"],tools:"Social media platforms / Google Analytics"},
    "meta-ads-campaign":{title:"Meta Ads Campaign",cat:"Meta Ads · Instagram Ads",ind:"Fashion Accessories E-commerce",desc:"A demo campaign structure for a fashion accessories brand across Facebook and Instagram.",work:["Campaign objective selection","Audience research and ad set plan","Creative concept directions","Monitoring checklist"],tools:"Meta Ads Manager / Facebook / Instagram"},
    "one-page-seo-optimization":{title:"One-Page SEO Optimization",cat:"One-Page SEO",ind:"Local Home Cleaning Service",desc:"A concept for organizing a local service page around clearer search intent and useful content.",work:["Keyword and intent mapping","Title + meta description","Heading + internal linking plan","Image alt recommendations"],tools:"WordPress / SEO plugin / Keyword tools"},
    "wordpress-business-website":{title:"Professional WordPress Business Website",cat:"WordPress Website",ind:"Local Service Business",desc:"A clean business website concept designed to make services easy to understand and explore.",work:["Responsive page layout","Service page structure","Contact flow","Mobile navigation"],tools:"WordPress / Elementor"}
  };
  function openCase(slug){
    var c=CASES[slug]; if(!c||!modal||!modalBody) return;
    modalBody.innerHTML="<p class='tag'>"+c.cat+" · Concept Project</p><h3 style='margin:12px 0 6px;font-size:22px'>"+c.title+"</h3><p style='color:var(--muted);font-size:13px'>Industry: "+c.ind+"</p><p style='color:var(--muted)'>"+c.desc+"</p><h4 style='margin:16px 0 8px;font-size:13px;letter-spacing:.08em'>WORK COMPLETED</h4><ul style='margin:0;padding-left:18px;color:var(--muted);font-size:13px'>"+c.work.map(function(w){return "<li>"+w+"</li>"}).join("")+"</ul><p style='margin-top:12px;font-size:12px;color:var(--muted)'><b>Tools:</b> "+c.tools+"</p><p style='font-size:11px;color:var(--muted);margin-top:10px'>Demo case study — no client outcomes or performance results are implied.</p>";
    modal.classList.add("open");
    document.body.style.overflow="hidden";
  }
  function closeCase(){ if(!modal) return; modal.classList.remove("open"); document.body.style.overflow=""; }
  document.addEventListener("click",function(e){
    var opener=e.target.closest("[data-case]");
    if(opener){e.preventDefault();openCase(opener.getAttribute("data-case"));return}
    if(e.target.closest("[data-close-case]")||e.target.classList.contains("modal-bg")) closeCase();
  });
  document.addEventListener("keydown",function(e){if(e.key==="Escape"){closeCase();closeChat();}});

  // Images fade-in
  document.querySelectorAll("img[data-fade]").forEach(function(img){
    function done(){img.classList.add("loaded")}
    if(img.complete&&img.naturalWidth>0) done();
    else{img.addEventListener("load",done);img.addEventListener("error",function(){img.style.display="none"})}
  });

  // Contact form -> mailto (no backend)
  var form=document.getElementById("contactForm");
  if(form){
    form.addEventListener("submit",function(e){
      e.preventDefault();
      var fd=new FormData(form);
      var subject=encodeURIComponent("Project enquiry — "+(fd.get("service")||"Website / Marketing"));
      var body=encodeURIComponent("Name: "+fd.get("name")+"\nEmail: "+fd.get("email")+"\nService: "+fd.get("service")+"\nBudget: "+fd.get("budget")+"\n\n"+fd.get("message"));
      window.location.href="mailto:sharnahaldar704@gmail.com?subject="+subject+"&body="+body;
      var note=document.getElementById("formNote");
      if(note) note.hidden=false;
    });
  }

  // Chat (FAQ helper, no backend)
  var chatBtn=document.getElementById("chatBtn");
  var chatPanel=document.getElementById("chatPanel");
  var chatBody=document.getElementById("chatBody");
  var chatForm=document.getElementById("chatForm");
  var chatInput=document.getElementById("chatInput");
  function closeChat(){ if(chatPanel){chatPanel.classList.remove("open");chatBtn.setAttribute("aria-expanded","false")} }
  var FAQS=[
    ["services","I offer digital marketing, SEO, social media, Meta & Google Ads, lead generation and WordPress website design."],
    ["wordpress","Yes — responsive WordPress sites, Elementor builds, landing pages and WooCommerce stores."],
    ["seo","SEO support includes keyword research, on-page and technical SEO, local SEO, audits and WordPress SEO setup."],
    ["meta","Yes — Meta Ads for Facebook and Instagram: setup, audience targeting and monitoring."],
    ["google ads","Yes — Google Search campaigns: keywords, ad groups, tracking support and optimization."],
    ["social","Yes — content planning, posting, engagement and Facebook page management."],
    ["lead","Yes — audience research, targeted lists and organized, usable data."],
    ["price","Pricing depends on scope. Share requirements and I will prepare a custom quote."],
    ["contact","Email sharnahaldar704@gmail.com, WhatsApp 01938337336, or use the contact form."]
  ];
  function reply(q){
    q=q.toLowerCase();
    for(var i=0;i<FAQS.length;i++){ if(q.indexOf(FAQS[i][0])>-1) return FAQS[i][1]; }
    return "I can help with digital marketing, SEO, ads, social media, leads and WordPress. Tell me a little about your project, or use Contact for a personal reply.";
  }
  function addMsg(text,me){
    var d=document.createElement("div");
    d.className="msg "+(me?"me":"bot"); d.textContent=text;
    chatBody.appendChild(d); chatBody.scrollTop=chatBody.scrollHeight;
  }
  if(chatBtn&&chatPanel){
    chatBtn.addEventListener("click",function(){
      var open=chatPanel.classList.toggle("open");
      chatBtn.setAttribute("aria-expanded",open?"true":"false");
    });
    if(chatForm) chatForm.addEventListener("submit",function(e){
      e.preventDefault();
      var v=(chatInput.value||"").trim(); if(!v) return;
      addMsg(v,true); chatInput.value="";
      setTimeout(function(){addMsg(reply(v),false)},250);
    });
  }

  // Canvas ambient network (light, respects reduced motion)
  var canvas=document.getElementById("bg-canvas");
  if(canvas){
    var ctx=canvas.getContext("2d");
    var pts=[],W=0,H=0,raf=0,mx=-9999,my=-9999,pulse=null;
    var accentNight=[0,229,255],accentDay=[10,156,184];
    function accent(){return document.documentElement.dataset.theme==="day"?accentDay:accentNight}
    function resize(){
      var dpr=Math.min(window.devicePixelRatio||1,1.5);
      W=window.innerWidth;H=window.innerHeight;
      canvas.width=W*dpr;canvas.height=H*dpr;
      canvas.style.width=W+"px";canvas.style.height=H+"px";
      ctx.setTransform(dpr,0,0,dpr,0,0);
      pts=[];var n=Math.min(72,Math.max(18,Math.round(W*H/28000)));
      for(var i=0;i<n;i++){var a=Math.random()*Math.PI*2,s=.018+Math.random()*.05;
        pts.push({x:Math.random()*W,y:Math.random()*H,vx:Math.cos(a)*s,vy:Math.sin(a)*s,r:.6+Math.random()*1.1});}
      if(prefersReduced) draw(0);
    }
    function draw(t){
      ctx.clearRect(0,0,W,H);
      var ac=accent();
      for(var k=0;k<pts.length;k++){
        var p=pts[k];
        if(!prefersReduced){
          var dx=mx-p.x,dy=my-p.y,d=Math.hypot(dx,dy);
          if(d<160&&d>1){var f=(1-d/160)*.0011;p.vx+=dx*f;p.vy+=dy*f}
          p.vx*=.997;p.vy*=.997;p.x+=p.vx;p.y+=p.vy;
          if(p.x<-12)p.x=W+12;if(p.x>W+12)p.x=-12;if(p.y<-12)p.y=H+12;if(p.y>H+12)p.y=-12;
        }
      }
      ctx.lineWidth=.7;
      for(var i=0;i<pts.length;i++)for(var j=i+1;j<pts.length;j++){
        var a=pts[i],b=pts[j],dd=Math.hypot(a.x-b.x,a.y-b.y);
        if(dd<128){ctx.strokeStyle="rgba("+ac[0]+","+ac[1]+","+ac[2]+","+((1-dd/128)*.14).toFixed(3)+")";ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();}
      }
      for(var q=0;q<pts.length;q++){
        var pt=pts[q],near=Math.hypot(pt.x-mx,pt.y-my)<120;
        var tw=.28+Math.sin(t*.0008+q*1.73)*.06;
        ctx.fillStyle="rgba("+ac[0]+","+ac[1]+","+ac[2]+","+(near?.62:tw).toFixed(3)+")";
        ctx.beginPath();ctx.arc(pt.x,pt.y,near?pt.r*1.25:pt.r,0,Math.PI*2);ctx.fill();
      }
      if(pulse&&!prefersReduced){
        var age=t-pulse.t,pr=age/800;
        if(pr<1){ctx.beginPath();ctx.arc(pulse.x,pulse.y,12+pr*135,0,Math.PI*2);ctx.strokeStyle="rgba("+ac[0]+","+ac[1]+","+ac[2]+","+((1-pr)*.23).toFixed(3)+")";ctx.stroke();}
        else pulse=null;
      }
      if(!prefersReduced&&!document.hidden) raf=requestAnimationFrame(draw);
    }
    function start(){cancelAnimationFrame(raf);raf=requestAnimationFrame(draw)}
    window.addEventListener("resize",resize,{passive:true});
    window.addEventListener("pointermove",function(e){mx=e.clientX;my=e.clientY},{passive:true});
    window.addEventListener("pointerdown",function(e){pulse={x:e.clientX,y:e.clientY,t:performance.now()}},{passive:true});
    document.addEventListener("visibilitychange",function(){if(document.hidden)cancelAnimationFrame(raf);else start()});
    resize();start();
  }

  // Footer year
  var yr=document.getElementById("yr"); if(yr) yr.textContent=new Date().getFullYear();
})();
