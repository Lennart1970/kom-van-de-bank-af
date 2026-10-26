/* Kom van de bank af: taalschakelaar, scroll-reveal, grafiek en video. Geen trackers, geen netwerk. */
(function(){
  var d=document.documentElement, shot=d.classList.contains('shot');
  var reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function applyLang(l,save){
    d.lang=l;
    try{ if(save) localStorage.setItem('kvdb-lang',l); }catch(e){}
    document.querySelectorAll('[data-set-lang]').forEach(function(b){b.setAttribute('aria-pressed',b.getAttribute('data-set-lang')===l?'true':'false');});
    var t=d.getAttribute('data-t-'+l); if(t) document.title=t;
    var m=document.querySelector('meta[name=description]'); var ds=d.getAttribute('data-d-'+l); if(m&&ds) m.setAttribute('content',ds);
    document.querySelectorAll('[data-alt-nl]').forEach(function(el){
      var a=el.getAttribute('data-alt-'+l);
      if(el.tagName==='IMG') el.setAttribute('alt',a); else el.setAttribute('aria-label',a);
    });
    try{ var u=new URL(location.href); if(u.searchParams.has('lang')){u.searchParams.set('lang',l); history.replaceState(null,'',u);} }catch(e){}
    document.dispatchEvent(new CustomEvent('langchange',{detail:l}));
  }
  document.querySelectorAll('[data-set-lang]').forEach(function(b){
    b.addEventListener('click',function(){applyLang(b.getAttribute('data-set-lang'),true);});
  });
  applyLang(d.lang==='en'?'en':'nl',false);

  // scroll-reveal en grafiek
  var targets=document.querySelectorAll('.card,li.step,li.field,ul.nots li,ul.statuslist li,.tile,.kern-big,.hero-art,.intl,.band h2');
  targets.forEach(function(el){ if(!el.closest('.hero')) el.classList.add('rv'); });
  var charts=document.querySelectorAll('.chart');
  if(shot||reduce||!('IntersectionObserver' in window)){
    document.querySelectorAll('.rv').forEach(function(el){el.classList.add('in');});
    charts.forEach(function(c){c.classList.add('in');});
  }else{
    var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){var t=e.target;t.classList.add('in');io.unobserve(t);if(t.classList.contains('rv'))setTimeout(function(){t.classList.remove('rv','in');},900);}});},{threshold:.12});
    document.querySelectorAll('.rv').forEach(function(el){io.observe(el);});
    charts.forEach(function(c){io.observe(c);});
  }

  // video: alleen afspelen zonder voorkeur voor minder beweging en zonder ?shot=1
  var v=document.querySelector('.hero-video'), btn=document.querySelector('.vidtoggle');
  if(v&&!shot&&!reduce){
    var p=v.play(); if(p&&p.catch) p.catch(function(){});
    if(btn){
      btn.hidden=false;
      btn.addEventListener('click',function(){
        var paused=btn.getAttribute('aria-pressed')==='true';
        if(paused){v.play();btn.setAttribute('aria-pressed','false');}else{v.pause();btn.setAttribute('aria-pressed','true');}
      });
    }
  }
  if(reduce){var tr=document.querySelector('.ticker .track'); if(tr) tr.style.animation='none';}

  // meetpunt voor verify.py (alleen met ?probe=1)
  if(/[?&]probe=1/.test(location.search)){
    var w=function(){document.body.setAttribute('data-sw',document.documentElement.scrollWidth);document.body.setAttribute('data-iw',window.innerWidth);document.body.setAttribute('data-sh',document.documentElement.scrollHeight);};
    window.addEventListener('load',function(){setTimeout(w,300);});
  }
})();
