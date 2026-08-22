(function(){
  'use strict';
  window.addEventListener('load',()=>{
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if(window.gsap && window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);

    // ==========================================
    // NAV — background on scroll
    // ==========================================
    const nav=document.getElementById('nav');
    if(nav){
      window.addEventListener('scroll',()=>{nav.classList.toggle('is-scrolled',window.scrollY>80)},{passive:true});
    }

    // ==========================================
    // MOBILE NAV — builds a full-screen panel if the page
    // doesn't already ship one (#navMobile), so the hamburger
    // works on every page, not just index.
    // ==========================================
    (function setupMobileNav(){
      const toggle=document.getElementById('navToggle');
      if(!toggle)return;
      let panel=document.getElementById('navMobile');
      if(!panel){
        const links=document.querySelector('.nav-links');
        const cta=document.querySelector('.nav-cta');
        panel=document.createElement('div');
        panel.className='nav-mobile';
        panel.id='navMobile';
        if(links){
          links.querySelectorAll('a').forEach(a=>panel.appendChild(a.cloneNode(true)));
        }
        if(cta){
          const ctaClone=cta.cloneNode(true);
          ctaClone.classList.add('btn','btn--gold','btn--full');
          panel.appendChild(ctaClone);
        }
        document.body.appendChild(panel);
      }
      function closeNav(){
        panel.classList.remove('is-open');
        toggle.classList.remove('is-open');
        toggle.setAttribute('aria-expanded','false');
        document.body.style.overflow='';
      }
      toggle.addEventListener('click',()=>{
        const open=panel.classList.toggle('is-open');
        toggle.classList.toggle('is-open',open);
        toggle.setAttribute('aria-expanded',String(open));
        document.body.style.overflow=open?'hidden':'';
      });
      panel.querySelectorAll('a').forEach(a=>a.addEventListener('click',closeNav));
      window.addEventListener('keydown',e=>{if(e.key==='Escape')closeNav()});
    })();

    // ==========================================
    // SIGNATURE AMBER LIGHT — soft glow, follows cursor with lag.
    // Desktop, fine-pointer, motion-safe only.
    // ==========================================
    const amberLight=document.getElementById('amberLight');
    if(amberLight && window.gsap && !reduceMotion && window.matchMedia('(hover:hover) and (pointer:fine)').matches){
      const moveX=gsap.quickTo(amberLight,'x',{duration:1.1,ease:'power3.out'});
      const moveY=gsap.quickTo(amberLight,'y',{duration:1.1,ease:'power3.out'});
      let active=false;
      window.addEventListener('mousemove',e=>{
        moveX(e.clientX);moveY(e.clientY);
        if(!active){amberLight.classList.add('is-active');active=true;}
      },{passive:true});
      document.addEventListener('mouseleave',()=>amberLight.classList.remove('is-active'));
    }

    // ==========================================
    // SCROLL REVEALS
    // ==========================================
    if(window.gsap && window.ScrollTrigger && !reduceMotion){
      gsap.to('.hero-bg img',{y:80,ease:'none',scrollTrigger:{trigger:'.hero',start:'top top',end:'bottom top',scrub:2}});

      const revealUp=(sel,opts={})=>{
        document.querySelectorAll(sel).forEach(el=>{
          gsap.from(el,Object.assign({y:26,opacity:0,duration:.8,ease:'power3.out',scrollTrigger:{trigger:el,start:'top 88%'}},opts));
        });
      };

      revealUp('.section-title,.dash-label,.stmt');
      revealUp('.kitchen-text p,.kitchen-stats,.kitchen-img');
      revealUp('.bar-text p,.bar-detail-strip');
      revealUp('.jazz-eyebrow,.jazz-eq,.jazz-meta,.jazz-content p,.jazz-content .btn');
      revealUp('.afterdark-sub,.afterdark-content p');
      revealUp('.bree-info>p,.bree-details,.bree-map');

      gsap.from('.menu-row',{y:20,opacity:0,stagger:.08,duration:.6,ease:'power2.out',scrollTrigger:{trigger:'.menu-rows',start:'top 85%'}});
      gsap.from('.wo-card',{y:30,opacity:0,stagger:.1,duration:.6,ease:'power2.out',scrollTrigger:{trigger:'.whatson-grid',start:'top 85%'}});
      gsap.from('.m-img',{scale:.94,opacity:0,stagger:.05,duration:.6,ease:'power2.out',scrollTrigger:{trigger:'.masonry',start:'top 88%'}});
      gsap.from('.dn-col',{opacity:0,duration:1,stagger:.12,ease:'power2.out',scrollTrigger:{trigger:'.dn-strip',start:'top 85%'}});

      document.querySelectorAll('.about-text p,.exp-text p,.g-img,.loc-item,.ed-text-block,.ed-img,.event-details').forEach(el=>{
        gsap.from(el,{y:24,opacity:0,duration:.6,ease:'power2.out',scrollTrigger:{trigger:el,start:'top 88%'}});
      });
    }

    // ==========================================
    // HAPPY HOUR COUNTDOWN
    // ==========================================
    const hh=document.getElementById('happyHour');
    const hhCount=document.getElementById('hhCountdown');
    function updateHH(){
      if(!hh||!hhCount)return;
      const now=new Date();const h=now.getHours();const m=now.getMinutes();
      if(h>=16&&h<18){
        hh.classList.add('is-visible');
        hhCount.textContent='Happening Now!';
      }else if(h<16){
        hh.classList.add('is-visible');
        const mins=((16-h-1)*60)+(60-m);
        const hrs=Math.floor(mins/60);const rm=mins%60;
        hhCount.textContent='Starts in '+hrs+'h '+rm+'m';
      }else{
        hh.classList.remove('is-visible');
      }
    }
    updateHH();setInterval(updateHH,60000);

    // ==========================================
    // STICKY BOOK BUTTON (mobile) — show after scrolling past hero.
    // On mobile, CSS already force-shows it regardless of this JS
    // (see @media(max-width:700px) in styles.css), so this only
    // needs to handle the desktop scroll-linked reveal.
    // ==========================================
    const bookFloat=document.getElementById('bookFloat');
    if(bookFloat && window.ScrollTrigger){
      const trigger=document.getElementById('about')||document.querySelector('.kitchen')||document.querySelector('main');
      if(trigger){
        ScrollTrigger.create({trigger,start:'top center',
          onEnter:()=>bookFloat.classList.add('is-visible'),
          onLeaveBack:()=>bookFloat.classList.remove('is-visible')
        });
      }
    }

    // ==========================================
    // EXIT INTENT POPUP — only after 30s on page, only on real exit
    // ==========================================
    const exitPopup=document.getElementById('exitPopup');
    const exitClose=document.getElementById('exitClose');
    let exitShown=false;
    let exitReady=false;
    setTimeout(()=>{exitReady=true},30000);
    if(exitPopup){
      document.addEventListener('mouseleave',e=>{
        if(exitShown||!exitReady)return;
        if(e.clientY<=0){exitPopup.classList.add('is-visible');exitShown=true}
      });
      if(exitClose)exitClose.addEventListener('click',()=>exitPopup.classList.remove('is-visible'));
      exitPopup.addEventListener('click',e=>{if(e.target===exitPopup)exitPopup.classList.remove('is-visible')});
    }

    // ==========================================
    // GA4 CONVERSION EVENTS
    // ==========================================
    document.querySelectorAll('a[href*="dineplan"],a[href*="wa.me"]').forEach(link=>{
      link.addEventListener('click',()=>{
        if(typeof gtag!=='undefined'){
          const label=link.href.includes('dineplan')?'dineplan_click':'whatsapp_click';
          gtag('event',label,{event_category:'conversion'});
        }
      });
    });
    document.querySelectorAll('a[href^="tel:"]').forEach(link=>{
      link.addEventListener('click',()=>{if(typeof gtag!=='undefined')gtag('event','phone_click',{event_category:'conversion'})});
    });

    // ==========================================
    // SMOOTH SCROLL FOR ANCHOR LINKS
    // ==========================================
    document.querySelectorAll('a[href^="#"]').forEach(a=>{
      a.addEventListener('click',e=>{
        const href=a.getAttribute('href');
        if(href==='#'||href==='')return;
        const target=document.querySelector(href);
        if(target){e.preventDefault();target.scrollIntoView({behavior:reduceMotion?'auto':'smooth',block:'start'})}
      });
    });
  });
})();
