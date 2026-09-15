(function(){
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasGSAP = !!(window.gsap && window.ScrollTrigger);
  if(hasGSAP) gsap.registerPlugin(ScrollTrigger);
  var finePointer = window.matchMedia('(hover:hover) and (pointer:fine)').matches;

  // Safety net: the CSS "from" states for hero/heading reveals only make sense
  // if GSAP is actually available to animate them to visible. If the GSAP CDN
  // fails to load for any reason, drop .js immediately so CSS falls back to
  // its fully-visible default — content must never be gated behind JS.
  if(!hasGSAP) document.documentElement.classList.remove('js');

  var MASK_SELECTORS = ['.hero-title','.kitchen-title','.whatson-title','.jazz-title','.afterdark-title','.inside-title','.bree-title','.book-cta-title','.bar-title'];

  // ==========================================
  // LINE / MASK MARKUP — runs immediately (not gated on load) so the
  // CSS-driven hidden state (.js .line-mask .line-inner) never flashes
  // visible content before the reveal timeline runs.
  // ==========================================
  function wrapLines(el){
    if(!el || el.dataset.masked) return;
    el.dataset.masked = '1';
    var nodes = Array.prototype.slice.call(el.childNodes);
    var lines = [[]];
    nodes.forEach(function(n){
      if(n.nodeName === 'BR'){ lines.push([]); }
      else lines[lines.length - 1].push(n);
    });
    el.innerHTML = '';
    lines.forEach(function(lineNodes){
      var hasContent = lineNodes.some(function(n){ return n.nodeType !== 3 || n.textContent.trim(); });
      if(!hasContent) return;
      var mask = document.createElement('span'); mask.className = 'line-mask';
      var inner = document.createElement('span'); inner.className = 'line-inner';
      lineNodes.forEach(function(n){ inner.appendChild(n); });
      mask.appendChild(inner);
      el.appendChild(mask);
    });
  }
  if(!reduceMotion){
    MASK_SELECTORS.forEach(function(sel){
      document.querySelectorAll(sel).forEach(wrapLines);
    });
  }

  window.addEventListener('load', function(){
    initLenis();
    initNav();
    initMobileNav();
    initAmberLight();
    initMagnetic();

    if(hasGSAP && !reduceMotion){
      initHero();
      initPageHero();
      initHeadingReveals();
      initGenericReveals();
      initFiveMoods();
      initMoodScrub();
      initKitchen();
      initMenu();
      initBar();
      initWhatsOn();
      initJazz();
      initAfterDark();
      initGallerySection();
      initEditorialGrid();
      initLocation();
      initFinalCTA();
      initCursorLabel();
      ScrollTrigger.refresh();
      if(document.fonts && document.fonts.ready){
        document.fonts.ready.then(function(){ ScrollTrigger.refresh(); });
      }
    } else if(hasGSAP){
      initReducedMotionReveals();
    }

    initHappyHour();
    initStickyBook();
    initExitPopup();
    initAnalytics();
    initAnchorScroll();
    initLightbox();
  });

  // ==========================================
  // LENIS — smooth scroll, driven by the GSAP ticker so it and
  // ScrollTrigger share a single update cycle (no double rAF loop).
  // ==========================================
  function initLenis(){
    if(reduceMotion || !window.Lenis) return;
    var lenis = new Lenis({
      duration: 1.15,
      easing: function(t){ return 1 - Math.pow(1 - t, 4); },
      smoothWheel: true,
      touchMultiplier: 1.1,
      autoRaf: false
    });
    if(hasGSAP){
      gsap.ticker.add(function(time){ lenis.raf(time * 1000); });
      gsap.ticker.lagSmoothing(0);
    } else {
      requestAnimationFrame(function raf(time){ lenis.raf(time); requestAnimationFrame(raf); });
    }
    if(hasGSAP) lenis.on('scroll', ScrollTrigger.update);
    window.__lenis = lenis;
  }

  // ==========================================
  // NAV — blurred bg past hero, hide on scroll down / return on scroll up
  // ==========================================
  function initNav(){
    var nav = document.getElementById('nav');
    if(!nav) return;
    var lastY = window.scrollY || 0;
    var accum = 0;
    var THRESH = 10;
    function handle(y){
      nav.classList.toggle('is-scrolled', y > 80);
      if(y < 140){ nav.classList.remove('is-hidden'); lastY = y; accum = 0; return; }
      var delta = y - lastY;
      if((delta > 0 && accum < 0) || (delta < 0 && accum > 0)) accum = 0;
      accum += delta;
      if(accum > THRESH){ nav.classList.add('is-hidden'); accum = 0; }
      else if(accum < -THRESH){ nav.classList.remove('is-hidden'); accum = 0; }
      lastY = y;
    }
    if(window.__lenis){
      window.__lenis.on('scroll', function(e){ handle(e.scroll); });
    } else {
      window.addEventListener('scroll', function(){ handle(window.scrollY); }, {passive:true});
    }
  }

  // ==========================================
  // MOBILE NAV — builds a full-screen panel if the page doesn't already
  // ship one (#navMobile), so the hamburger works on every page.
  // ==========================================
  function initMobileNav(){
    var toggle = document.getElementById('navToggle');
    if(!toggle) return;
    var panel = document.getElementById('navMobile');
    if(!panel){
      var links = document.querySelector('.nav-links');
      var cta = document.querySelector('.nav-cta');
      panel = document.createElement('div');
      panel.className = 'nav-mobile';
      panel.id = 'navMobile';
      if(links) links.querySelectorAll('a').forEach(function(a){ panel.appendChild(a.cloneNode(true)); });
      if(cta){
        var ctaClone = cta.cloneNode(true);
        ctaClone.classList.add('btn','btn--gold','btn--full');
        ctaClone.classList.remove('magnetic');
        panel.appendChild(ctaClone);
      }
      document.body.appendChild(panel);
    }
    function closeNav(){
      panel.classList.remove('is-open');
      toggle.classList.remove('is-open');
      toggle.setAttribute('aria-expanded','false');
      document.body.style.overflow = '';
    }
    toggle.addEventListener('click', function(){
      var open = panel.classList.toggle('is-open');
      toggle.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', String(open));
      document.body.style.overflow = open ? 'hidden' : '';
    });
    panel.querySelectorAll('a').forEach(function(a){ a.addEventListener('click', closeNav); });
    window.addEventListener('keydown', function(e){ if(e.key === 'Escape') closeNav(); });
  }

  // ==========================================
  // SIGNATURE AMBER LIGHT — soft glow, follows cursor with lag.
  // ==========================================
  function initAmberLight(){
    var amberLight = document.getElementById('amberLight');
    if(!amberLight || !hasGSAP || reduceMotion || !finePointer) return;
    var moveX = gsap.quickTo(amberLight, 'x', {duration:1.1, ease:'power3.out'});
    var moveY = gsap.quickTo(amberLight, 'y', {duration:1.1, ease:'power3.out'});
    var active = false;
    window.addEventListener('mousemove', function(e){
      moveX(e.clientX); moveY(e.clientY);
      if(!active){ amberLight.classList.add('is-active'); active = true; }
    }, {passive:true});
    document.addEventListener('mouseleave', function(){ amberLight.classList.remove('is-active'); });
  }

  // ==========================================
  // MAGNETIC BUTTONS — primary booking CTAs, desktop fine-pointer only
  // ==========================================
  function initMagnetic(){
    if(reduceMotion || !finePointer || !hasGSAP) return;
    document.querySelectorAll('.magnetic').forEach(function(btn){
      var rect = null;
      btn.addEventListener('mouseenter', function(){ rect = btn.getBoundingClientRect(); });
      btn.addEventListener('mousemove', function(e){
        if(!rect) rect = btn.getBoundingClientRect();
        var x = e.clientX - rect.left - rect.width / 2;
        var y = e.clientY - rect.top - rect.height / 2;
        gsap.to(btn, {x: x * 0.3, y: y * 0.35, duration:.5, ease:'power3.out'});
      });
      btn.addEventListener('mouseleave', function(){
        gsap.to(btn, {x:0, y:0, duration:.6, ease:'power3.out'});
      });
    });
  }

  // ==========================================
  // HERO — cinematic entrance + scroll-out
  // ==========================================
  function initHero(){
    var hero = document.querySelector('.hero');
    if(!hero) return;

    var tl = gsap.timeline({defaults:{ease:'power3.out'}});
    tl.to('.hero-bg img', {opacity:1, duration:1.1}, 0)
      .to('.hero-eyebrow', {opacity:1, y:0, duration:.7}, .15)
      .fromTo('.hero-title .line-inner', {yPercent:100, y:0}, {yPercent:0, y:0, duration:1, ease:'power4.out', stagger:.1}, .25)
      .to('.hero-tagline', {opacity:1, y:0, duration:.7}, .7)
      .to('.hero-sub', {opacity:1, y:0, duration:.7}, .8)
      .to('.hero-actions', {opacity:1, y:0, duration:.6}, .95)
      .to('.hero-scroll', {opacity:1, y:0, duration:.6}, 1.15);

    gsap.timeline({scrollTrigger:{trigger:hero, start:'top top', end:'bottom top', scrub:1}})
      .to('.hero-bg img', {scale:1.09, yPercent:8, ease:'none'}, 0)
      .to('.hero-scroll', {opacity:0, ease:'none'}, 0)
      .to('.hero-content', {yPercent:-14, opacity:0, ease:'none'}, 0)
      .to('.hero-scrim', {opacity:.5, ease:'none'}, 0);
  }

  // ==========================================
  // PAGE HERO — gallery.html / events.html
  // ==========================================
  function initPageHero(){
    var ph = document.querySelector('.page-hero');
    if(!ph) return;
    gsap.timeline({defaults:{ease:'power3.out'}})
      .to('.page-hero .hero-eyebrow', {opacity:1, y:0, duration:.7}, 0)
      .to('.page-title', {opacity:1, y:0, duration:.8}, .15)
      .to('.page-sub', {opacity:1, y:0, duration:.7}, .35);
  }

  // ==========================================
  // SIGNATURE HEADING MASK REVEALS (everything except hero-title,
  // which is handled in the entrance timeline above)
  // ==========================================
  function initHeadingReveals(){
    MASK_SELECTORS.filter(function(s){ return s !== '.hero-title'; }).forEach(function(sel){
      document.querySelectorAll(sel).forEach(function(h){
        var lines = h.querySelectorAll('.line-inner');
        if(!lines.length) return;
        gsap.fromTo(lines, {yPercent:100, y:0}, {yPercent:0, y:0, duration:1.1, ease:'power4.out', stagger:.08, scrollTrigger:{trigger:h, start:'top 85%'}});
      });
    });
  }

  // ==========================================
  // GENERIC FADE-UP REVEALS — restrained, everywhere else
  // ==========================================
  function initGenericReveals(){
    var revealUp = function(sel, opts){
      document.querySelectorAll(sel).forEach(function(el){
        gsap.from(el, Object.assign({y:26, opacity:0, duration:.85, ease:'power3.out', scrollTrigger:{trigger:el, start:'top 88%'}}, opts || {}));
      });
    };
    revealUp('.section-title,.dash-label,.stmt');
    revealUp('.ed-text-block,.event-details,.about-text p,.exp-text p,.g-img,.loc-item');
    gsap.utils.toArray('.reveal-img').forEach(initRevealImage);
  }

  // Intentional repeating 3-way reveal pattern (vertical clip / scale+opacity /
  // horizontal clip), reused by any editorial image grid.
  function applyAlternatingReveal(elements){
    elements.forEach(function(el, i){
      var pattern = i % 3;
      if(pattern === 0){
        gsap.fromTo(el, {clipPath:'inset(100% 0% 0% 0%)'}, {clipPath:'inset(0% 0% 0% 0%)', duration:1.1, ease:'power3.out', scrollTrigger:{trigger:el, start:'top 88%'}});
      } else if(pattern === 1){
        gsap.from(el, {opacity:0, scale:.92, duration:.9, ease:'power3.out', scrollTrigger:{trigger:el, start:'top 88%'}});
      } else {
        gsap.fromTo(el, {clipPath:'inset(0% 100% 0% 0%)'}, {clipPath:'inset(0% 0% 0% 0%)', duration:1.1, ease:'power3.out', scrollTrigger:{trigger:el, start:'top 88%'}});
      }
    });
  }

  // ==========================================
  // GALLERY.HTML — editorial grid, same alternating pattern as the
  // index.html masonry teaser
  // ==========================================
  function initEditorialGrid(){
    applyAlternatingReveal(document.querySelectorAll('.editorial .ed-img'));
  }

  function initRevealImage(wrap){
    var img = wrap.querySelector('img');
    if(!img) return;
    var veil = document.createElement('span');
    veil.className = 'reveal-img-veil';
    veil.setAttribute('aria-hidden', 'true');
    wrap.appendChild(veil);
    gsap.timeline({scrollTrigger:{trigger:wrap, start:'top 82%'}})
      .to(veil, {scaleX:0, duration:1.1, ease:'power3.out'}, 0)
      .to(img, {scale:1, duration:1.3, ease:'power3.out'}, 0);
  }

  // ==========================================
  // FIVE MOODS — pinned desktop sequence / stacked mobile reveal
  // ==========================================
  function initFiveMoods(){
    var seq = document.getElementById('fiveMoods');
    if(!seq) return;
    var cols = gsap.utils.toArray('.dn-col', seq);
    if(!cols.length) return;
    var progressCurrent = document.querySelector('.dn-progress-current');
    var progressFill = document.querySelector('.dn-progress-fill');

    var mm = gsap.matchMedia();

    mm.add('(min-width: 1024px)', function(){
      gsap.set(cols, {opacity:0});
      gsap.set(cols[0], {opacity:1});
      var tl = gsap.timeline({
        scrollTrigger:{
          trigger: seq, start:'top top', end:'+=280%',
          scrub:1, pin:true, anticipatePin:1,
          onUpdate: function(self){
            var idx = Math.min(cols.length - 1, Math.round(self.progress * (cols.length - 1)));
            if(progressCurrent) progressCurrent.textContent = String(idx + 1).padStart(2, '0');
            if(progressFill) progressFill.style.height = (self.progress * 100) + '%';
          }
        }
      });
      for(var i = 0; i < cols.length - 1; i++){
        tl.to(cols[i], {opacity:0, duration:1}, i)
          .to(cols[i + 1], {opacity:1, duration:1}, i);
      }
      return function(){ gsap.set(cols, {clearProps:'opacity'}); };
    });

    mm.add('(max-width: 1023px)', function(){
      gsap.set(cols, {clearProps:'opacity'});
      gsap.from(cols, {opacity:0, y:36, duration:.9, stagger:.15, ease:'power3.out', scrollTrigger:{trigger:seq, start:'top 80%'}});
    });
  }

  // ==========================================
  // GLOBAL DAY → NIGHT AMBIENT COLOUR TRANSITION
  // ==========================================
  function initMoodScrub(){
    var amber = document.getElementById('moodAmber');
    var dark = document.getElementById('moodDark');
    var start = document.querySelector('.hero');
    var end = document.querySelector('.afterdark');
    if(!amber || !dark || !start || !end) return;
    ScrollTrigger.create({
      trigger: start, start:'top top',
      endTrigger: end, end:'bottom center',
      scrub: 1,
      onUpdate: function(self){
        var p = self.progress;
        dark.style.opacity = p * 0.4;
        amber.style.opacity = Math.sin(p * Math.PI) * 0.6;
      }
    });
  }

  // ==========================================
  // THE KITCHEN
  // ==========================================
  function initKitchen(){
    var sub = document.querySelector('.kitchen-sub');
    if(sub && !sub.dataset.split){
      sub.dataset.split = '1';
      var words = sub.innerHTML.split('<br>').map(function(t){ return t.trim(); }).filter(Boolean);
      sub.innerHTML = words.map(function(w){ return '<span class="k-word" style="display:inline-block">' + w + '</span>'; }).join('<br>');
      gsap.from('.k-word', {opacity:0, y:16, duration:.7, ease:'power3.out', stagger:.12, scrollTrigger:{trigger:sub, start:'top 85%'}});
    }
    gsap.from('.kitchen-text p', {opacity:0, y:24, duration:.85, ease:'power3.out', scrollTrigger:{trigger:'.kitchen-text', start:'top 85%'}});
    gsap.from('.kitchen-stats', {opacity:0, y:24, duration:.85, ease:'power3.out', delay:.1, scrollTrigger:{trigger:'.kitchen-text', start:'top 80%'}});
    var img = document.querySelector('.kitchen-img');
    if(img){
      gsap.to(img, {yPercent:-6, ease:'none', scrollTrigger:{trigger:'.kitchen', start:'top bottom', end:'bottom top', scrub:1}});
    }
  }

  // ==========================================
  // MENU
  // ==========================================
  function initMenu(){
    gsap.from('.menu-row', {y:24, opacity:0, duration:.8, stagger:.1, ease:'power3.out', scrollTrigger:{trigger:'.menu-rows', start:'top 85%'}});
  }

  // ==========================================
  // THE BAR — parallax layers + cursor-reactive light
  // ==========================================
  function initBar(){
    var bar = document.querySelector('.bar');
    if(!bar) return;
    gsap.to('.bar-img img', {yPercent:8, ease:'none', scrollTrigger:{trigger:bar, start:'top bottom', end:'bottom top', scrub:1}});
    gsap.to('.bar-detail-strip img', {yPercent:3, ease:'none', stagger:.02, scrollTrigger:{trigger:bar, start:'top bottom', end:'bottom top', scrub:1}});
    gsap.from('.bar-text p,.bar-detail-strip', {opacity:0, y:24, duration:.8, stagger:.1, ease:'power3.out', scrollTrigger:{trigger:'.bar-text', start:'top 80%'}});

    if(finePointer && !reduceMotion){
      var img = document.querySelector('.bar-img');
      var light = document.getElementById('barLight');
      if(img && light){
        img.addEventListener('mousemove', function(e){
          var r = img.getBoundingClientRect();
          var px = ((e.clientX - r.left) / r.width) * 100;
          var py = ((e.clientY - r.top) / r.height) * 100;
          var ox = 50 + (px - 50) * 0.16;
          var oy = 50 + (py - 50) * 0.16;
          light.style.background = 'radial-gradient(circle at ' + ox + '% ' + oy + '%, rgba(224,138,60,.30) 0%, rgba(224,138,60,0) 40%)';
          light.classList.add('is-active');
        });
        img.addEventListener('mouseleave', function(){ light.classList.remove('is-active'); });
      }
    }
  }

  // ==========================================
  // WHAT'S ON
  // ==========================================
  function initWhatsOn(){
    gsap.from('.wo-card', {y:30, opacity:0, duration:.8, stagger:.1, ease:'power3.out', scrollTrigger:{trigger:'.whatson-grid', start:'top 85%'}});
  }

  // ==========================================
  // LIVE JAZZ — signature cinematic section
  // ==========================================
  function initJazz(){
    var jazz = document.querySelector('.jazz');
    if(!jazz) return;
    gsap.to('.jazz-bg img', {yPercent:-6, ease:'none', scrollTrigger:{trigger:jazz, start:'top bottom', end:'bottom top', scrub:1}});
    gsap.from('.jazz-eyebrow,.jazz-meta,.jazz-content p,.jazz-content .btn', {opacity:0, y:22, duration:.8, stagger:.1, ease:'power3.out', scrollTrigger:{trigger:'.jazz-content', start:'top 80%'}});

    var wave = document.querySelector('.jazz-wave path');
    if(wave){
      var len = wave.getTotalLength();
      gsap.set(wave, {strokeDasharray:len, strokeDashoffset:len});
      gsap.to(wave, {strokeDashoffset:0, duration:1.6, ease:'power2.inOut', scrollTrigger:{trigger:'.jazz-wave', start:'top 85%'}});
    }

    ScrollTrigger.create({
      trigger: jazz, start:'top 60%', end:'bottom 40%',
      onEnter: function(){ jazz.classList.add('is-active'); },
      onLeaveBack: function(){ jazz.classList.remove('is-active'); }
    });

    var spotlight = document.querySelector('.jazz-spotlight');
    if(spotlight){
      ScrollTrigger.create({
        trigger: jazz, start:'top bottom', end:'bottom top', scrub:true,
        onUpdate: function(self){
          var x = 25 + self.progress * 40;
          spotlight.style.background = 'radial-gradient(circle at ' + x + '% 50%, rgba(224,138,60,.18) 0%, rgba(224,138,60,0) 45%)';
        }
      });
    }
  }

  // ==========================================
  // AFTER DARK
  // ==========================================
  function initAfterDark(){
    var ad = document.querySelector('.afterdark');
    if(!ad) return;
    gsap.to('.afterdark-bg img', {scale:1, ease:'none', scrollTrigger:{trigger:ad, start:'top bottom', end:'bottom top', scrub:1.5}});
    gsap.from('.afterdark-sub,.afterdark-content p', {opacity:0, y:20, duration:.8, stagger:.12, ease:'power3.out', scrollTrigger:{trigger:'.afterdark-content', start:'top 78%'}});
  }

  // ==========================================
  // INSIDE AMBER — masonry teaser, alternating reveal pattern
  // ==========================================
  function initGallerySection(){
    applyAlternatingReveal(document.querySelectorAll('.masonry .m-img:not(.reveal-img)'));
  }

  // ==========================================
  // LOCATION
  // ==========================================
  function initLocation(){
    gsap.from('.bree-info>p', {opacity:0, y:22, duration:.8, ease:'power3.out', scrollTrigger:{trigger:'.bree-info', start:'top 80%'}});
    gsap.from('.bree-item', {opacity:0, y:20, duration:.7, stagger:.08, ease:'power3.out', scrollTrigger:{trigger:'.bree-details', start:'top 85%'}});
    gsap.from('.bree-socials,.bree-map', {opacity:0, y:20, duration:.8, stagger:.1, ease:'power3.out', scrollTrigger:{trigger:'.bree-info', start:'top 60%'}});
  }

  // ==========================================
  // FINAL CTA — calm closing frame
  // ==========================================
  function initFinalCTA(){
    var cta = document.querySelector('.book-cta');
    if(!cta) return;
    gsap.from('.book-cta-bg img', {scale:1.12, opacity:.5, duration:1.6, ease:'power2.out', scrollTrigger:{trigger:cta, start:'top 75%'}});
    gsap.timeline({scrollTrigger:{trigger:cta, start:'top 70%'}})
      .from('.book-cta-rule', {scaleX:0, duration:.8, ease:'power3.out'}, .3)
      .from('.book-cta-inner p', {opacity:0, y:16, duration:.7, ease:'power3.out'}, .5)
      .from('.book-cta-actions .btn', {opacity:0, y:16, duration:.6, stagger:.1, ease:'power3.out'}, .7);
  }

  // ==========================================
  // CURSOR LABEL — "View" over gallery images, desktop only
  // ==========================================
  function initCursorLabel(){
    if(!finePointer || reduceMotion) return;
    var triggers = document.querySelectorAll('.gallery-trigger');
    if(!triggers.length) return;
    var label = document.createElement('div');
    label.className = 'cursor-label';
    label.textContent = 'View';
    label.setAttribute('aria-hidden', 'true');
    document.body.appendChild(label);
    var moveX = gsap.quickTo(label, 'x', {duration:.35, ease:'power3.out'});
    var moveY = gsap.quickTo(label, 'y', {duration:.35, ease:'power3.out'});
    triggers.forEach(function(el){
      el.addEventListener('mouseenter', function(){ label.classList.add('is-active'); });
      el.addEventListener('mouseleave', function(){ label.classList.remove('is-active'); });
      el.addEventListener('mousemove', function(e){ moveX(e.clientX); moveY(e.clientY); });
    });
  }

  // ==========================================
  // REDUCED MOTION — simple opacity/translate entrances only
  // ==========================================
  function initReducedMotionReveals(){
    var sel = '.dash-label,.section-title,.stmt,.kitchen-text p,.kitchen-stats,.bar-text p,.bree-info>p,.bree-details,.jazz-content p,.afterdark-content p,.ed-text-block,.ed-img,.event-details';
    gsap.utils.toArray(sel).forEach(function(el){
      gsap.from(el, {opacity:0, y:14, duration:.5, ease:'power2.out', scrollTrigger:{trigger:el, start:'top 92%'}});
    });
    gsap.from('.menu-row', {opacity:0, y:14, stagger:.05, duration:.5, ease:'power2.out', scrollTrigger:{trigger:'.menu-rows', start:'top 90%'}});
    gsap.from('.wo-card', {opacity:0, y:14, stagger:.05, duration:.5, ease:'power2.out', scrollTrigger:{trigger:'.whatson-grid', start:'top 90%'}});
    gsap.from('.dn-col', {opacity:0, y:14, stagger:.05, duration:.5, ease:'power2.out', scrollTrigger:{trigger:'.dn-strip', start:'top 90%'}});
  }

  // ==========================================
  // HAPPY HOUR COUNTDOWN
  // ==========================================
  function initHappyHour(){
    var hh = document.getElementById('happyHour');
    var hhCount = document.getElementById('hhCountdown');
    function updateHH(){
      if(!hh || !hhCount) return;
      var now = new Date(); var h = now.getHours(); var m = now.getMinutes();
      if(h >= 16 && h < 18){
        hh.classList.add('is-visible');
        hhCount.textContent = 'Happening Now!';
      } else if(h < 16){
        hh.classList.add('is-visible');
        var mins = ((16 - h - 1) * 60) + (60 - m);
        var hrs = Math.floor(mins / 60); var rm = mins % 60;
        hhCount.textContent = 'Starts in ' + hrs + 'h ' + rm + 'm';
      } else {
        hh.classList.remove('is-visible');
      }
    }
    updateHH(); setInterval(updateHH, 60000);
  }

  // ==========================================
  // STICKY BOOK BUTTON (mobile / scroll-linked desktop reveal)
  // ==========================================
  function initStickyBook(){
    var bookFloat = document.getElementById('bookFloat');
    if(!bookFloat || !window.ScrollTrigger) return;
    var trigger = document.getElementById('about') || document.querySelector('.kitchen') || document.querySelector('main');
    if(!trigger) return;
    ScrollTrigger.create({
      trigger: trigger, start:'top center',
      onEnter: function(){ bookFloat.classList.add('is-visible'); },
      onLeaveBack: function(){ bookFloat.classList.remove('is-visible'); }
    });
  }

  // ==========================================
  // EXIT INTENT POPUP — only after 30s on page, only on real exit
  // ==========================================
  function initExitPopup(){
    var exitPopup = document.getElementById('exitPopup');
    var exitClose = document.getElementById('exitClose');
    if(!exitPopup) return;
    var exitShown = false;
    var exitReady = false;
    setTimeout(function(){ exitReady = true; }, 30000);
    document.addEventListener('mouseleave', function(e){
      if(exitShown || !exitReady) return;
      if(e.clientY <= 0){ exitPopup.classList.add('is-visible'); exitShown = true; }
    });
    if(exitClose) exitClose.addEventListener('click', function(){ exitPopup.classList.remove('is-visible'); });
    exitPopup.addEventListener('click', function(e){ if(e.target === exitPopup) exitPopup.classList.remove('is-visible'); });
  }

  // ==========================================
  // GA4 CONVERSION EVENTS
  // ==========================================
  function initAnalytics(){
    document.querySelectorAll('a[href*="dineplan"],a[href*="wa.me"]').forEach(function(link){
      link.addEventListener('click', function(){
        if(typeof gtag !== 'undefined'){
          var label = link.href.indexOf('dineplan') > -1 ? 'dineplan_click' : 'whatsapp_click';
          gtag('event', label, {event_category:'conversion'});
        }
      });
    });
    document.querySelectorAll('a[href^="tel:"]').forEach(function(link){
      link.addEventListener('click', function(){ if(typeof gtag !== 'undefined') gtag('event', 'phone_click', {event_category:'conversion'}); });
    });
  }

  // ==========================================
  // ANCHOR SCROLL — routes through Lenis when active, offset for fixed nav
  // ==========================================
  function initAnchorScroll(){
    document.querySelectorAll('a[href^="#"]').forEach(function(a){
      a.addEventListener('click', function(e){
        var href = a.getAttribute('href');
        if(href === '#' || href === '') return;
        var target = document.querySelector(href);
        if(!target) return;
        e.preventDefault();
        if(window.__lenis){
          window.__lenis.scrollTo(target, {offset:-88, duration: reduceMotion ? 0 : 1.2});
        } else {
          target.scrollIntoView({behavior: reduceMotion ? 'auto' : 'smooth', block:'start'});
        }
      });
    });
  }

  // ==========================================
  // LIGHTBOX — gallery.html editorial grid + index.html masonry teaser
  // Accessible: ESC, arrow keys, click-outside, focus trap, swipe.
  // ==========================================
  function initLightbox(){
    var lb = document.getElementById('lightbox');
    if(!lb) return;
    var triggerEls = Array.prototype.slice.call(document.querySelectorAll('.gallery-trigger'));
    var triggers = triggerEls.map(function(el){ return el.tagName === 'IMG' ? el : el.querySelector('img'); }).filter(Boolean);
    if(!triggers.length) return;

    var imgEl = document.getElementById('lightboxImg');
    var captionEl = document.getElementById('lightboxCaption');
    var closeBtn = document.getElementById('lightboxClose');
    var prevBtn = document.getElementById('lightboxPrev');
    var nextBtn = document.getElementById('lightboxNext');
    var current = -1;
    var lastFocused = null;
    var focusable = [prevBtn, nextBtn, closeBtn];

    function render(i){
      var im = triggers[i];
      var src = im.currentSrc || im.src;
      imgEl.src = src;
      imgEl.alt = im.alt || '';
      captionEl.textContent = im.alt || '';
    }
    function open(i){
      current = i;
      render(i);
      lb.classList.add('is-visible');
      lastFocused = document.activeElement;
      closeBtn.focus();
      document.body.style.overflow = 'hidden';
      document.addEventListener('keydown', onKey);
    }
    function close(){
      lb.classList.remove('is-visible');
      document.body.style.overflow = '';
      document.removeEventListener('keydown', onKey);
      if(lastFocused && lastFocused.focus) lastFocused.focus();
    }
    function show(delta){
      current = (current + delta + triggers.length) % triggers.length;
      render(current);
    }
    function onKey(e){
      if(e.key === 'Escape'){ close(); }
      else if(e.key === 'ArrowRight'){ show(1); }
      else if(e.key === 'ArrowLeft'){ show(-1); }
      else if(e.key === 'Tab'){
        var idx = focusable.indexOf(document.activeElement);
        e.preventDefault();
        var next = e.shiftKey ? (idx <= 0 ? focusable.length - 1 : idx - 1) : (idx === focusable.length - 1 ? 0 : idx + 1);
        focusable[next].focus();
      }
    }

    triggers.forEach(function(im, i){
      var host = im.closest('.gallery-trigger') || im;
      host.classList.add('gallery-trigger');
      host.addEventListener('click', function(){ open(i); });
    });
    closeBtn.addEventListener('click', close);
    prevBtn.addEventListener('click', function(){ show(-1); });
    nextBtn.addEventListener('click', function(){ show(1); });
    lb.addEventListener('click', function(e){ if(e.target === lb) close(); });

    var touchX = null;
    lb.addEventListener('touchstart', function(e){ touchX = e.touches[0].clientX; }, {passive:true});
    lb.addEventListener('touchend', function(e){
      if(touchX === null) return;
      var dx = e.changedTouches[0].clientX - touchX;
      if(Math.abs(dx) > 40) show(dx > 0 ? -1 : 1);
      touchX = null;
    }, {passive:true});
  }
})();
