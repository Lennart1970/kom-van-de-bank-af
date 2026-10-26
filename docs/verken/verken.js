/* SDG probleemradar: alles gebeurt in je browser. Geen opslag van keuzes, geen trackers.
   Enige netwerkverzoek: data.json van deze eigen site. */
(function(){
'use strict';
var SDG_COL=["#E5243B","#DDA63A","#4C9F38","#C5192D","#FF3A21","#26BDE2","#FCC30B","#A21942","#FD6925","#DD1367","#FD9D24","#BF8B2E","#3F7E44","#0A97D9","#56C02B","#00689D","#19486A"];
var SDG_NL=["Geen armoede","Geen honger","Goede gezondheid en welzijn","Kwaliteitsonderwijs","Gendergelijkheid","Schoon water en sanitair","Betaalbare en duurzame energie","Waardig werk en economische groei","Industrie, innovatie en infrastructuur","Ongelijkheid verminderen","Duurzame steden en gemeenschappen","Verantwoorde consumptie en productie","Klimaatactie","Leven in het water","Leven op het land","Vrede, justitie en sterke publieke diensten","Partnerschap om doelstellingen te bereiken"];
var SDG_EN=["No poverty","Zero hunger","Good health and well-being","Quality education","Gender equality","Clean water and sanitation","Affordable and clean energy","Decent work and economic growth","Industry, innovation and infrastructure","Reduced inequalities","Sustainable cities and communities","Responsible consumption and production","Climate action","Life below water","Life on land","Peace, justice and strong institutions","Partnerships for the goals"];
var SKILL_ORDER=["camera","filmen","schrijven","vertalen","audio","coachen","ontwerpen","techniek/IT","bouwen/solderen","sensoren/meten","kaarten/mappen","data","netwerken","betalen"];
var SKILL_EN={"camera":"camera","filmen":"filming","schrijven":"writing","vertalen":"translating","audio":"audio","coachen":"coaching","ontwerpen":"design","techniek/IT":"tech/IT","bouwen/solderen":"building/soldering","sensoren/meten":"sensors/measuring","kaarten/mappen":"maps/mapping","data":"data","netwerken":"networking","betalen":"payments"};
var TOPICS={"local-production":["Lokale productie","Local production"],"regeneratieve-landbouw":["Regeneratieve landbouw","Regenerative agriculture"]};
var HOURS=[["",["Maakt niet uit","No preference"]],["1",["1 uur","1 hour"]],["3",["2 tot 3 uur","2 to 3 hours"]],["6",["4 tot 6 uur","4 to 6 hours"]],["99",["7 uur of meer","7 or more hours"]]];
var BUDGET=[["",["Maakt niet uit","No preference"]],["0",["0 euro","0 euros"]],["100",["Hooguit 100 euro","At most 100 euros"]],["500",["Hooguit 500 euro","At most 500 euros"]]];
var PER=25, MAXSKILLS=4;
var qs=new URLSearchParams(location.search);
var shot=document.documentElement.classList.contains('shot');

function lang(){return document.documentElement.lang==='en'?'en':'nl';}
function esc(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
function L(nl,en){return '<span class="l-nl">'+nl+'</span><span class="l-en">'+en+'</span>';}
function LE(nl,en){return L(esc(nl),esc(en));}
function safeUrl(u){return /^https?:\/\//i.test(u)?u:'';}
function host(u){try{return new URL(u).hostname.replace(/^www\./,'');}catch(e){return u;}}
function sdgName(n,l){return (l==='en'?SDG_EN:SDG_NL)[n-1];}
function skillLabel(s,l){return l==='en'?(SKILL_EN[s]||s):s;}

var DATA, P, GROUPS, SKILLS=[], MAXH=0, MAXPRICE=0;
var root=document.querySelector('.vtool .wrap');
var panelVJ=document.getElementById('panel-voor-jou'), panelOV=document.getElementById('panel-overzicht');

fetch('data.json').then(function(r){return r.json();}).then(init).catch(function(){
  panelVJ.innerHTML='<p class="empty">'+L('De data kon niet geladen worden. Open deze pagina via een webserver.','The data could not be loaded. Open this page through a web server.')+'</p>';
});

function init(d){
  DATA=d; P=d.p; GROUPS=d.groups;
  var cnt={};
  P.forEach(function(p,i){
    p._i=i;
    p._b=(p.t+' '+p.w+' '+p.a+' '+p.o+' '+p.p+' '+p.n).toLowerCase();
    p.c.forEach(function(c){c.sk.forEach(function(s){cnt[s]=(cnt[s]||0)+1;});if(c.h>MAXH)MAXH=c.h;if(c.pr>MAXPRICE)MAXPRICE=c.pr;});
  });
  SKILLS=SKILL_ORDER.filter(function(s){return cnt[s];}).concat(Object.keys(cnt).filter(function(s){return SKILL_ORDER.indexOf(s)<0;}));
  buildVJ(); buildOV(); wireTabs();
  document.addEventListener('langchange',onLang);
  applyParams();
  updateVJ(true); updateOV(true);
  onLang();
}

/* ---------- gemeenschappelijk ---------- */
function chip(type,name,val,inner,extra){
  return '<label class="chip"><input type="'+type+'" name="'+name+'" value="'+esc(val)+'"'+(extra||'')+'><span class="c">'+inner+'</span></label>';
}
function sdgChipInner(n,count){
  return '<span class="dot" style="--c:'+SDG_COL[n-1]+'" aria-hidden="true">'+n+'</span><span>'+L(esc(SDG_NL[n-1]),esc(SDG_EN[n-1]))+'</span>'+(count!=null?'<span class="cnt">'+count+'</span>':'');
}
function contribHtml(c,l){
  var idea=c.l==='i';
  var lab=idea?'<span class="lab lab-i">'+L('idee','idea')+'</span>':'<span class="lab lab-b">'+L('bewezen','proven')+'</span>';
  var note=idea?'<span class="ideanote">'+L('Dit is een idee.','This is an idea.')+'</span>':'';
  var meta='<li>'+c.h+' '+L(c.h===1?'uur':'uur','hour'+(c.h===1?'':'s'))+' '+L('per week','per week')+'</li>'+
           '<li>'+c.pr+' '+L('euro','euros')+'</li>';
  if(c.hw) meta+='<li>'+esc(c.hw)+'</li>';
  c.sk.forEach(function(s){meta+='<li>'+L(esc(s),esc(skillLabel(s,'en')))+'</li>';});
  var u=safeUrl(c.ou);
  if(u) meta+='<li><a href="'+esc(u)+'" target="_blank" rel="noopener">'+esc(c.on||host(u))+'</a></li>';
  else if(c.on) meta+='<li>'+esc(c.on)+'</li>';
  return '<li class="'+(idea?'is-idee':'is-bewezen')+'">'+lab+note+'<p class="ctext">'+esc(c.x)+'</p><ul class="cmeta">'+meta+'</ul></li>';
}
function cardHtml(p,cs,showNone){
  var col=SDG_COL[p.s-1];
  var stat='<span class="stat'+(p.st==='vervallen'?' expired':'')+'">'+L('Status','Status')+': '+esc(p.st)+(p.st==='vervallen'?' '+L('','(expired)'):(p.st==='gecheckt'?' '+L('','(checked)'):''))+'</span>';
  var h='<article class="pcard" style="--c:'+col+'"><div class="phead"><span class="sdgbadge" style="--c:'+col+'"><b>'+p.s+'</b>'+L(esc(SDG_NL[p.s-1]),esc(SDG_EN[p.s-1]))+'</span>'+stat+'</div>';
  h+='<h3>'+esc(p.t)+'</h3><p class="who">'+esc(p.w)+'</p>';
  if(cs.length) h+='<ul class="contribs" aria-label="">'+cs.map(function(c){return contribHtml(c,'nl');}).join('')+'</ul>';
  else if(showNone) h+='<p class="nocontrib">'+L('Bij dit probleem staat nog geen bijdrage-idee in de database.','This problem has no contribution idea in the database yet.')+'</p>';
  var dl='';
  function row(nl,en,v){if(v)dl+='<dt>'+L(nl,en)+'</dt><dd>'+esc(v)+'</dd>';}
  row('Omvang en context','Scale and context',p.a); row('Mogelijke oplossing (volgens de bron)','Possible solution (according to the source)',p.o); row('Wie kan dit oppakken','Who can pick this up',p.p);
  if(dl) h+='<details><summary>'+L('Meer over dit probleem','More about this problem')+'</summary><dl>'+dl+'</dl></details>';
  var su=safeUrl(p.u);
  h+='<p class="pmeta"><span>'+L('Bron','Source')+': '+(su?'<a href="'+esc(su)+'" target="_blank" rel="noopener">'+esc(p.n)+'</a>':esc(p.n))+'</span><span>'+L('Laatst gecheckt','Last checked')+': '+esc(p.d)+'</span></p></article>';
  return h;
}
function pagerHtml(total,page){
  var pages=Math.max(1,Math.ceil(total/PER));
  if(pages<=1) return '';
  var h='<button type="button" data-p="'+(page-1)+'"'+(page<=1?' disabled':'')+' aria-label="">'+L('Vorige','Previous')+'</button>';
  var show={};[1,pages,page-1,page,page+1].forEach(function(x){if(x>=1&&x<=pages)show[x]=1;});
  var last=0;
  Object.keys(show).map(Number).sort(function(a,b){return a-b;}).forEach(function(x){
    if(last&&x>last+1) h+='<span class="gap" aria-hidden="true">...</span>';
    h+='<button type="button" data-p="'+x+'"'+(x===page?' aria-current="page"':'')+'>'+x+'</button>';
    last=x;
  });
  h+='<button type="button" data-p="'+(page+1)+'"'+(page>=pages?' disabled':'')+'>'+L('Volgende','Next')+'</button>';
  return h;
}
function view(prefix){
  var el=document.getElementById(prefix);
  return {top:el.querySelector('.results-top'),count:el.querySelector('.count'),list:el.querySelector('.plist'),pager:el.querySelector('.pager'),page:1};
}
function render(v,items,page,showNone,countHtml,n,m){
  var pages=Math.max(1,Math.ceil(items.length/PER)); if(page>pages)page=pages; v.page=page;
  v.count.innerHTML=countHtml; v.count.setAttribute('data-n',n); if(m!=null)v.count.setAttribute('data-m',m);
  var slice=items.slice((page-1)*PER,page*PER);
  v.list.innerHTML=slice.length?slice.map(function(it){return '<li>'+cardHtml(it.p,it.cs,showNone)+'</li>';}).join(''):
    '<li><p class="empty">'+L('Niets gevonden met deze keuzes. Haal een filter weg om meer te zien.','Nothing found with these choices. Remove a filter to see more.')+'</p></li>';
  v.pager.innerHTML=pagerHtml(items.length,page);
  v.pager.setAttribute('data-page',page); v.pager.setAttribute('data-pages',pages);
  v.list.setAttribute('data-shown',slice.length);
}
function goTop(v){ if(shot)return; v.top.scrollIntoView({block:'start'}); v.top.focus({preventScroll:true}); }

/* ---------- Voor jou ---------- */
var VJ={ints:{},skills:{},hours:'',budget:''}, vjv, ovv;
function buildVJ(){
  var h='<div class="filters">';
  h+='<fieldset><legend>'+L('Interesses','Interests')+'</legend><p class="hint">'+L('Kies de thema\'s en SDG\'s die je aanspreken. Er zijn maar twee thema\'s in de data, daarom staan de SDG\'s er ook bij.','Pick the themes and SDGs that appeal to you. The data has only two themes, so the SDGs are listed too.')+'</p>';
  h+='<p class="sub">'+L('Thema','Theme')+'</p><div class="chips">';
  Object.keys(TOPICS).forEach(function(k){h+=chip('checkbox','int','topic:'+k,'<span>'+L(esc(TOPICS[k][0]),esc(TOPICS[k][1]))+'</span>');});
  h+='</div><p class="sub">SDG</p><div class="chips">';
  for(var n=1;n<=17;n++) h+=chip('checkbox','int','sdg:'+n,sdgChipInner(n));
  h+='</div></fieldset>';
  h+='<fieldset><legend>Skills</legend><p class="hint">'+L('Kies maximaal 4. Je ziet bijdragen waar minstens een van je skills bij hoort.','Pick up to 4. You see contributions that need at least one of your skills.')+' <span id="skillcount" aria-live="polite">0/4</span></p><div class="chips">';
  SKILLS.forEach(function(s){h+=chip('checkbox','skill',s,'<span>'+L(esc(s),esc(skillLabel(s,'en')))+'</span>');});
  h+='</div></fieldset>';
  h+='<div class="grid2"><fieldset><legend>'+L('Tijd per week','Time per week')+'</legend><div class="chips">';
  HOURS.forEach(function(x,i){h+=chip('radio','hours',x[0],'<span>'+L(esc(x[1][0]),esc(x[1][1]))+'</span>',i===0?' checked':'');});
  h+='</div><p class="hint" id="hinth"></p></fieldset><fieldset><legend>'+L('Budget voor spullen','Budget for equipment')+'</legend><div class="chips">';
  BUDGET.forEach(function(x,i){h+=chip('radio','budget',x[0],'<span>'+L(esc(x[1][0]),esc(x[1][1]))+'</span>',i===0?' checked':'');});
  h+='</div><p class="hint" id="hintb"></p></fieldset></div>';
  h+='<div class="rowbtn"><button type="button" class="small" id="vj-reset">'+L('Alles wissen','Clear all')+'</button></div></div>';
  h+='<h2 class="sr">'+L('Resultaten','Results')+'</h2><p class="results-top" tabindex="-1"></p><p class="count" role="status" aria-live="polite"></p><ul class="plist"></ul><nav class="pager" aria-label="Pagina\'s / Pages"></nav>';
  panelVJ.innerHTML=h;
  panelVJ.querySelector('.results-top').setAttribute('id','vj-top');
  vjv=view('panel-voor-jou');
  panelVJ.addEventListener('change',function(e){
    var t=e.target; if(t.name==='int'){if(t.checked)VJ.ints[t.value]=1;else delete VJ.ints[t.value];}
    else if(t.name==='skill'){if(t.checked)VJ.skills[t.value]=1;else delete VJ.skills[t.value];syncSkills();}
    else if(t.name==='hours')VJ.hours=t.value; else if(t.name==='budget')VJ.budget=t.value; else return;
    vjv.page=1; updateVJ(false);
  });
  panelVJ.querySelector('#vj-reset').addEventListener('click',function(){
    VJ={ints:{},skills:{},hours:'',budget:''};
    panelVJ.querySelectorAll('input[type=checkbox]').forEach(function(i){i.checked=false;});
    panelVJ.querySelectorAll('input[type=radio]').forEach(function(i){i.checked=(i.value==='');});
    syncSkills(); vjv.page=1; updateVJ(false);
  });
  vjv.pager.addEventListener('click',function(e){var b=e.target.closest('button[data-p]');if(!b||b.disabled)return;vjv.page=+b.getAttribute('data-p');updateVJ(false);goTop(vjv);});
  document.getElementById('hinth').innerHTML=L('Hoogste in de data: '+MAXH+' uur per week.','Highest in the data: '+MAXH+' hours per week.');
  document.getElementById('hintb').innerHTML=L('Duurste spullen in de data: '+MAXPRICE+' euro.','Most expensive equipment in the data: '+MAXPRICE+' euros.');
}
function syncSkills(){
  var n=Object.keys(VJ.skills).length;
  panelVJ.querySelectorAll('input[name=skill]').forEach(function(i){i.disabled=(n>=MAXSKILLS&&!i.checked);});
  document.getElementById('skillcount').textContent=n+'/'+MAXSKILLS;
}
function computeVJ(st){
  var ints=Object.keys(st.ints), sdgs={},tops={};
  ints.forEach(function(k){var a=k.split(':');if(a[0]==='sdg')sdgs[a[1]]=1;else tops[a[1]]=1;});
  var sk=Object.keys(st.skills), hmax=st.hours===''?Infinity:+st.hours, bmax=st.budget===''?Infinity:+st.budget;
  var out=[];
  P.forEach(function(p){
    if(!p.c.length)return;
    if(ints.length&&!(sdgs[p.s]||(p.tp&&tops[p.tp])))return;
    var cs=[];
    p.c.forEach(function(c){
      if(c.h>hmax||c.pr>bmax)return;
      var ov=0; if(sk.length){c.sk.forEach(function(s){if(st.skills[s])ov++;});if(!ov)return;}
      cs.push({c:c,score:ov*100+(c.l==='b'?10:0)});
    });
    if(!cs.length)return;
    cs.sort(function(a,b){return b.score-a.score;});
    out.push({p:p,cs:cs.map(function(x){return x.c;}),score:cs[0].score,n:cs.length});
  });
  out.sort(function(a,b){return b.score-a.score||a.p._i-b.p._i;});
  return out;
}
function updateVJ(){
  var items=computeVJ(VJ), m=0; items.forEach(function(i){m+=i.n;});
  render(vjv,items,vjv.page,false,
    L(items.length+' problemen met passende bijdragen ('+m+' ideeën)',items.length+' problems with matching contributions ('+m+' ideas)'),items.length,m);
}

/* ---------- Overzicht ---------- */
var OV={sdg:{},src:'',q:'',idea:false};
function buildOV(){
  var sc={},gc={};P.forEach(function(p){sc[p.s]=(sc[p.s]||0)+1;gc[p.g]=(gc[p.g]||0)+1;});
  var h='<div class="filters"><fieldset><legend>SDG</legend><div class="chips">';
  for(var n=1;n<=17;n++) h+=chip('checkbox','osdg',n,sdgChipInner(n,sc[n]||0));
  h+='</div></fieldset><div class="grid2"><div><label class="fl" for="ov-src">'+L('Bron','Source')+'</label><select class="select" id="ov-src"></select></div>';
  h+='<div><label class="fl" for="ov-q">'+L('Zoeken','Search')+'</label><input class="search" id="ov-q" type="search" autocomplete="off"></div></div>';
  h+='<div class="chips">'+chip('checkbox','oidea','1','<span>'+L('Alleen met bijdrage-idee','Only with contribution idea')+'</span>')+'</div>';
  h+='<div class="rowbtn"><button type="button" class="small" id="ov-reset">'+L('Alles wissen','Clear all')+'</button></div></div>';
  h+='<h2 class="sr">'+L('Resultaten','Results')+'</h2><p class="results-top" tabindex="-1"></p><p class="count" role="status" aria-live="polite"></p><ul class="plist"></ul><nav class="pager" aria-label="Pagina\'s / Pages"></nav>';
  panelOV.innerHTML=h;
  panelOV.querySelector('.results-top').setAttribute('id','ov-top');
  ovv=view('panel-overzicht'); ovv.gc=gc;
  var timer;
  panelOV.addEventListener('change',function(e){
    var t=e.target;
    if(t.name==='osdg'){if(t.checked)OV.sdg[t.value]=1;else delete OV.sdg[t.value];}
    else if(t.name==='oidea')OV.idea=t.checked; else if(t.id==='ov-src')OV.src=t.value; else return;
    ovv.page=1; updateOV(false);
  });
  panelOV.querySelector('#ov-q').addEventListener('input',function(e){
    clearTimeout(timer); var v=e.target.value;
    timer=setTimeout(function(){OV.q=v.trim().toLowerCase();ovv.page=1;updateOV(false);},250);
  });
  panelOV.querySelector('#ov-reset').addEventListener('click',function(){
    OV={sdg:{},src:'',q:'',idea:false};
    panelOV.querySelectorAll('input[type=checkbox]').forEach(function(i){i.checked=false;});
    panelOV.querySelector('#ov-q').value=''; panelOV.querySelector('#ov-src').value='';
    ovv.page=1; updateOV(false);
  });
  ovv.pager.addEventListener('click',function(e){var b=e.target.closest('button[data-p]');if(!b||b.disabled)return;ovv.page=+b.getAttribute('data-p');updateOV(false);goTop(ovv);});
}
function computeOV(st){
  var sd=Object.keys(st.sdg), terms=st.q?st.q.split(/\s+/):[], out=[];
  P.forEach(function(p){
    if(sd.length&&!st.sdg[p.s])return;
    if(st.src&&p.g!==st.src)return;
    if(st.idea&&!p.c.length)return;
    for(var i=0;i<terms.length;i++) if(p._b.indexOf(terms[i])<0)return;
    out.push({p:p,cs:p.c});
  });
  return out;
}
function updateOV(){
  var items=computeOV(OV);
  render(ovv,items,ovv.page,true,
    L(items.length+' van '+P.length+' problemen',items.length+' of '+P.length+' problems'),items.length,null);
}
function fillSource(){
  var sel=document.getElementById('ov-src'); if(!sel)return; var l=lang(), cur=sel.value||OV.src;
  var h='<option value="">'+(l==='en'?'All sources':'Alle bronnen')+' ('+P.length+')</option>';
  GROUPS.forEach(function(g){h+='<option value="'+esc(g.id)+'">'+esc(g[l])+' ('+(ovv.gc[g.id]||0)+')</option>';});
  sel.innerHTML=h; sel.value=cur;
}
function onLang(){
  var l=lang();
  fillSource();
  var q=document.getElementById('ov-q'); if(q) q.setAttribute('placeholder',l==='en'?'Search title, who is affected, source':'Zoek in titel, wie het raakt, bron');
  document.querySelectorAll('.pager').forEach(function(p){p.setAttribute('aria-label',l==='en'?'Pages':'Pagina\'s');});
  document.querySelectorAll('.tabs').forEach(function(p){p.setAttribute('aria-label',l==='en'?'View':'Weergave');});
  document.querySelectorAll('.contribs').forEach(function(u){u.setAttribute('aria-label',l==='en'?'Contributions':'Bijdragen');});
}

/* ---------- tabs en parameters ---------- */
var tabs;
function wireTabs(){
  tabs=[].slice.call(document.querySelectorAll('.tabs [role=tab]'));
  tabs.forEach(function(t,i){
    t.addEventListener('click',function(){selectTab(i,false);});
    t.addEventListener('keydown',function(e){
      var n=-1; if(e.key==='ArrowRight')n=(i+1)%tabs.length; else if(e.key==='ArrowLeft')n=(i+tabs.length-1)%tabs.length; else if(e.key==='Home')n=0; else if(e.key==='End')n=tabs.length-1;
      if(n>=0){e.preventDefault();selectTab(n,true);}
    });
  });
}
function selectTab(i,focus){
  tabs.forEach(function(t,j){t.setAttribute('aria-selected',j===i?'true':'false');t.setAttribute('tabindex',j===i?'0':'-1');document.getElementById(t.getAttribute('aria-controls')).hidden=(j!==i);});
  if(focus)tabs[i].focus();
  try{var u=new URL(location.href);u.searchParams.set('tab',i===0?'voor-jou':'overzicht');history.replaceState(null,'',u);}catch(e){}
}
function applyParams(){
  // alleen lezen uit de adresbalk; wordt nergens bewaard
  var tab=qs.get('tab')||location.hash.slice(1);
  selectTab(tab==='overzicht'?1:0,false);
  function setChecks(name,vals){vals.forEach(function(v){var i=panelVJ.querySelector('input[name='+name+'][value="'+v+'"]');if(i&&!i.disabled){i.checked=true;}});}
  var ints=(qs.get('ints')||'').split(',').filter(Boolean); ints.forEach(function(k){VJ.ints[k]=1;}); setChecks('int',ints);
  var sk=(qs.get('skills')||'').split(',').filter(Boolean).slice(0,MAXSKILLS); sk.forEach(function(k){VJ.skills[k]=1;}); setChecks('skill',sk); syncSkills();
  if(qs.has('hours')){VJ.hours=qs.get('hours');var r=panelVJ.querySelector('input[name=hours][value="'+VJ.hours+'"]');if(r)r.checked=true;}
  if(qs.has('budget')){VJ.budget=qs.get('budget');var b=panelVJ.querySelector('input[name=budget][value="'+VJ.budget+'"]');if(b)b.checked=true;}
  var sd=(qs.get('sdg')||'').split(',').filter(Boolean); sd.forEach(function(k){OV.sdg[k]=1;var i=panelOV.querySelector('input[name=osdg][value="'+k+'"]');if(i)i.checked=true;});
  if(qs.has('src')){OV.src=qs.get('src');}
  if(qs.has('q')){OV.q=qs.get('q').trim().toLowerCase();panelOV.querySelector('#ov-q').value=qs.get('q');}
  if(qs.get('idea')==='1'){OV.idea=true;panelOV.querySelector('input[name=oidea]').checked=true;}
  if(qs.has('page')){vjv.page=ovv.page=Math.max(1,parseInt(qs.get('page'),10)||1);}
}
})();
