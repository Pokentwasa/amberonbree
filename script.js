(function(){
  'use strict';
  window.addEventListener('load',()=>{
    gsap.registerPlugin(ScrollTrigger);

    // Nav background on scroll
    const nav=document.getElementById('nav');
    window.addEventListener('scroll',()=>{nav.classList.toggle('is-scrolled',window.scrollY>80)},{passive:true});

    // Hero parallax
    gsap.to('.hero-bg img',{y:80,ease:'none',scrollTrigger:{trigger:'.hero',start:'top top',end:'bottom top',scrub:2}});

    // Section reveals
    document.querySelectorAll('.section-title,.dash-label').forEach(el=>{
      gsap.from(el,{opacity:0,y:28,duration:.8,ease:'power3.out',scrollTrigger:{trigger:el,start:'top 90%'}});
    });
    document.querySelectorAll('.about-text p,.exp-text p,.menu-cat,.g-img,.loc-item').forEach(el=>{
      gsap.from(el,{opacity:0,y:24,duration:.6,ease:'power2.out',scrollTrigger:{trigger:el,start:'top 88%'}});
    });

    // Menu cards stagger
    gsap.from('.menu-cat',{opacity:0,y:40,stagger:.1,duration:.6,ease:'power2.out',scrollTrigger:{trigger:'.menu-grid',start:'top 85%'}});

    // Experience blocks
    document.querySelectorAll('.exp-block').forEach(block=>{
      gsap.from(block.querySelector('.exp-img'),{opacity:0,x:block.classList.contains('exp-block--flip')?40:-40,duration:.8,ease:'power2.out',scrollTrigger:{trigger:block,start:'top 80%'}});
    });

    // Gallery reveal
    gsap.from('.g-img',{opacity:0,scale:.95,stagger:.06,duration:.5,ease:'power2.out',scrollTrigger:{trigger:'.gallery-grid',start:'top 85%'}});

    // Happy Hour countdown
    const hh=document.getElementById('happyHour');
    const hhCount=document.getElementById('hhCountdown');
    function updateHH(){
      const now=new Date();const h=now.getHours();const m=now.getMinutes();
      if(h>=16&&h<18){
        // During happy hour
        hh.classList.add('is-visible');
        hhCount.textContent='Happening Now!';
      }else if(h<16){
        // Before happy hour — show countdown
        hh.classList.add('is-visible');
        const mins=((16-h-1)*60)+(60-m);
        const hrs=Math.floor(mins/60);const rm=mins%60;
        hhCount.textContent='Starts in '+hrs+'h '+rm+'m';
      }else{
        // After happy hour
        hh.classList.remove('is-visible');
      }
    }
    updateHH();setInterval(updateHH,60000);

    // Book float on mobile (show after scrolling past hero)
    const bookFloat=document.getElementById('bookFloat');
    if(bookFloat){
      ScrollTrigger.create({trigger:'.about',start:'top center',
        onEnter:()=>bookFloat.classList.add('is-visible'),
        onLeaveBack:()=>bookFloat.classList.remove('is-visible')
      });
    }

    // Exit intent popup — only after 30s on page, only on real exit
    const exitPopup=document.getElementById('exitPopup');
    const exitClose=document.getElementById('exitClose');
    let exitShown=false;
    let exitReady=false;
    setTimeout(()=>{exitReady=true},30000); // 30 seconds before it can trigger
    if(exitPopup){
      document.addEventListener('mouseleave',e=>{
        if(exitShown||!exitReady)return;
        if(e.clientY<=0){exitPopup.classList.add('is-visible');exitShown=true}
      });
      if(exitClose)exitClose.addEventListener('click',()=>exitPopup.classList.remove('is-visible'));
      exitPopup.addEventListener('click',e=>{if(e.target===exitPopup)exitPopup.classList.remove('is-visible')});
    }

    // ==========================================
    // CURSOR TRAIL + CLICK SUNBURST
    // ==========================================
    const canvas=document.getElementById('cursorCanvas');
    if(canvas&&window.matchMedia('(hover:hover) and (pointer:fine)').matches){
      const ctx=canvas.getContext('2d');
      let w,h;
      function resize(){w=canvas.width=window.innerWidth;h=canvas.height=window.innerHeight}
      resize();window.addEventListener('resize',resize);

      let mx=0,my=0;
      const trail=[];


      document.addEventListener('mousemove',e=>{mx=e.clientX;my=e.clientY;trail.push({x:mx,y:my,life:1})});


      function draw(){
        ctx.clearRect(0,0,w,h);

        // Trail
        for(let i=trail.length-1;i>=0;i--){
          const p=trail[i];
          p.life-=0.04;
          if(p.life<=0){trail.splice(i,1);continue}
          ctx.beginPath();
          ctx.arc(p.x,p.y,2*p.life,0,Math.PI*2);
          ctx.fillStyle='rgba(212,165,116,'+p.life*0.5+')';
          ctx.fill();
        }


        requestAnimationFrame(draw);
      }
      draw();
    }

    // GA4 conversion events
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

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(a=>{
      a.addEventListener('click',e=>{
        const target=document.querySelector(a.getAttribute('href'));
        if(target){e.preventDefault();target.scrollIntoView({behavior:'smooth',block:'start'})}
      });
    });
  });
})();
