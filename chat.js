(function(){
  var $=function(i){return document.getElementById(i)};
  var PLANS=[{id:'free',n:'Free',p:0,c:2},{id:'plus',n:'Plus',p:49,c:5},{id:'pro',n:'Pro',p:99,c:10}];
  var COL=['#c9f7a8','#ffc2e2','#ffb5ab','#a9d3ff','#ffe29a','#ffcfa8','#d9c8ff'];
  var me=null,tab='tags',peer=null,tagFab=$('fab').onclick,logout=$('dLogout').onclick;
  function g(k,d){try{var v=JSON.parse(localStorage.getItem(k));return v==null?d:v}catch(e){return d}}
  function s(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}
  function esc(x){return String(x).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
  function err(el,t){el.textContent=t}
  function plan(){var id=g('moimoi_plan_'+me,'free');return PLANS.filter(function(p){return p.id===id})[0]||PLANS[0]}
  function contacts(){return g('moimoi_contacts_'+me,[])}
  function ck(o){return 'moimoi_chat_'+[me,o].sort().join('_')}
  function vis(o){return g(ck(o),[]).filter(function(m){return m.from===me||!m.q})}

  function renderChats(){
    var p=plan(),cs=contacts();
    var h='<div class="plan"><span><b>'+p.n+'</b> plan · '+cs.length+' of '+p.c+' contacts</span>'+(p.id==='pro'?'':'<button class="ghost" id="upg">Upgrade</button>')+'</div><div class="clist">';
    h+=cs.length?cs.map(function(c){var l=vis(c.phone).slice(-1)[0];return '<button class="crow" data-p="'+c.phone+'"><span class="av" style="background:'+COL[+c.phone.slice(-1)%7]+'">'+esc(Array.from(c.name)[0].toUpperCase())+'</span><span class="mid"><b>'+esc(c.name)+'</b><small>'+(l?esc(l.t):'+91 '+c.phone)+'</small></span></button>'}).join(''):'<div class="empty">No contacts yet. Tap + to add someone by mobile number.</div>';
    $('pChats').innerHTML=h+'</div>';
  }
  function show(t){
    tab=t;$('pTags').hidden=t!=='tags';$('pChats').hidden=t!=='chats';
    $('tabTags').setAttribute('aria-selected',t==='tags');$('tabChats').setAttribute('aria-selected',t==='chats');
    document.querySelector('.dtitle').textContent=t==='tags'?'Your tags':'Chats';
    document.querySelector('.dsub').textContent=t==='tags'?'Private spaces for notes, to-dos and photos. Each tag opens only with its own passcode.':'Message your contacts by mobile number. Offline messages send when you’re back online.';
    $('fab').setAttribute('aria-label',t==='tags'?'Create a tag':'Add a contact');
    if(t==='chats')renderChats();
  }
  $('tabTags').onclick=function(){show('tags')};$('tabChats').onclick=function(){show('chats')};
  $('pChats').onclick=function(e){var r=e.target.closest('.crow');if(r)return openChat(r.dataset.p);if(e.target.id==='upg')openPlans('')};
  $('fab').onclick=function(){if(tab==='tags')return tagFab();$('fAdd').reset();err($('aMsg'),'');$('dAdd').showModal();$('aPhone').focus()};
  $('aPhone').oninput=function(e){e.target.value=e.target.value.replace(/\D/g,'')};
  $('aCancel').onclick=function(){$('dAdd').close()};
  $('fAdd').onsubmit=function(e){
    e.preventDefault();
    var ph=$('aPhone').value,nm=$('aName').value.trim(),m=$('aMsg'),cs=contacts(),p=plan();
    if(!/^[6-9]\d{9}$/.test(ph))return err(m,'Enter a valid 10-digit mobile number.');
    if(ph===me)return err(m,'That’s your own number.');
    if(cs.some(function(c){return c.phone===ph}))return err(m,'This number is already in your contacts.');
    if(!g('moimoi_users',{})[ph])return err(m,'This number isn’t on moimoi yet. Ask them to sign up first.');
    if(cs.length>=p.c){$('dAdd').close();return openPlans(p.id==='pro'?'You’ve reached the 10 contact limit.':'You’ve used all '+p.c+' contacts on the '+p.n+' plan. Upgrade to add more.')}
    cs.push({phone:ph,name:nm||ph});s('moimoi_contacts_'+me,cs);$('dAdd').close();renderChats();
  };

  function openPlans(note){
    var cur=plan();err($('plNote'),note||'');
    $('plans').innerHTML=PLANS.map(function(p){var cu=p.id===cur.id,off=cu||p.c<cur.c;return '<div class="pl"><div><b>'+p.n+'</b><small>'+p.c+' contacts · '+(p.p?'₹'+p.p+' per month':'Free')+'</small></div><button class="'+(off?'ghost':'cta')+'" style="width:auto;height:44px;padding:0 20px" data-pl="'+p.id+'"'+(off?' disabled':'')+'>'+(cu?'Current':'Choose')+'</button></div>'}).join('');
    $('dPlan').showModal();
  }
  $('plans').onclick=function(e){var id=e.target.getAttribute('data-pl');if(!id)return;s('moimoi_plan_'+me,id);$('dPlan').close();renderChats()};
  $('plClose').onclick=function(){$('dPlan').close()};

  function openChat(ph){
    peer=contacts().filter(function(c){return c.phone===ph})[0];if(!peer)return;
    $('cName').textContent=peer.name;$('cNum').textContent='+91 '+peer.phone;drawThread();$('dChat').showModal();$('cMsgs').scrollTop=1e9;$('cIn').focus();
  }
  function drawThread(){
    var t=$('cMsgs'),bot=t.scrollHeight-t.scrollTop-t.clientHeight<40;
    t.innerHTML=vis(peer.phone).map(function(m){return '<div class="b '+(m.from===me?'me':'them')+'">'+esc(m.t)+'<small>'+new Date(m.ts).toLocaleTimeString([],{hour:'numeric',minute:'2-digit'})+(m.q?' · waiting for network':'')+'</small></div>'}).join('')||'<div class="empty" style="padding:20px 0">Say hi~</div>';
    if(bot)t.scrollTop=t.scrollHeight;
  }
  $('fChat').onsubmit=function(e){
    e.preventDefault();var v=$('cIn').value.trim();if(!v||!peer)return;
    var a=g(ck(peer.phone),[]);a.push({from:me,t:v,ts:Date.now(),q:!navigator.onLine});s(ck(peer.phone),a);
    $('cIn').value='';drawThread();$('cMsgs').scrollTop=1e9;
  };
  $('cClose').onclick=function(){$('dChat').close()};
  $('vBack').onclick=function(){$('dTag').close()};
  $('dChat').onclose=function(){peer=null;if(tab==='chats')renderChats()};

  function net(){$('offb').hidden=navigator.onLine}
  window.addEventListener('offline',net);
  window.addEventListener('online',function(){
    try{for(var i=0;i<localStorage.length;i++){var k=localStorage.key(i);if(k&&k.indexOf('moimoi_chat_')===0){var a=g(k,[]);a.forEach(function(m){m.q=false});s(k,a)}}}catch(e){}
    net();
  });
  setInterval(function(){
    if(!me||$('dash').hidden)return;
    if(peer)drawThread();else if(tab==='chats'&&!$('dPlan').open&&!$('dAdd').open)renderChats();
  },1500);

  var op=Dash.open;Dash.open=function(p){me=p;op(p);show('tags');net()};
  $('dLogout').onclick=function(){me=null;peer=null;logout()};
})();
