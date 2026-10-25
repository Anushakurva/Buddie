(function(){
  var $=function(i){return document.getElementById(i)};
  var PLANS=[{id:'free',n:'Free',p:0,c:2},{id:'plus',n:'Plus',p:49,c:5},{id:'pro',n:'Pro',p:99,c:10}];
  var COL=['#c9f7a8','#ffc2e2','#ffb5ab','#a9d3ff','#ffe29a','#ffcfa8','#d9c8ff'];
  var me=null,tab='tags',peer=null,plan=PLANS[0],cs=[],msgs=[],un=[],unM=null;
  var tagFab=$('fab').onclick,logout=$('dLogout').onclick;
  function db(){return MM.db}
  function esc(x){return String(x).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
  function err(el,t){el.textContent=t}
  function uref(p){return db().collection('users').doc(p)}
  function pid(o){return [me,o].sort().join('_')}
  function mref(o){return db().collection('chats').doc(pid(o)).collection('messages')}
  function none(){}

  function start(p){
    stop();me=p;
    var r=uref(p);
    r.get().then(function(d){if(!d.exists)return r.set({plan:'free',created:Date.now()})}).catch(none);
    un.push(r.onSnapshot(function(d){
      var id=d.exists?d.data().plan:'free';
      plan=PLANS.filter(function(x){return x.id===id})[0]||PLANS[0];refresh();
    },none));
    un.push(r.collection('contacts').onSnapshot(function(q){
      cs=q.docs.map(function(d){return{phone:d.id,name:d.data().name||d.id}});refresh();
    },none));
  }
  function stop(){un.forEach(function(f){f()});un=[];if(unM){unM();unM=null}cs=[];msgs=[];plan=PLANS[0];me=null;peer=null}
  function refresh(){if(tab==='chats'&&!peer&&!$('dPlan').open&&!$('dAdd').open)renderChats()}

  function renderChats(){
    var h='<div class="plan"><span><b>'+plan.n+'</b> plan \u00b7 '+cs.length+' of '+plan.c+' contacts</span>'+(plan.id==='pro'?'':'<button class="ghost" id="upg">Upgrade</button>')+'</div><div class="clist">';
    h+=cs.length?cs.map(function(c){return '<button class="crow" data-p="'+c.phone+'"><span class="av" style="background:'+COL[+c.phone.slice(-1)%7]+'">'+esc(Array.from(c.name)[0].toUpperCase())+'</span><span class="mid"><b>'+esc(c.name)+'</b><small>+91 '+c.phone+'</small></span></button>'}).join(''):'<div class="empty">No contacts yet. Tap + to add someone by mobile number.</div>';
    $('pChats').innerHTML=h+'</div>';
  }
  function show(t){
    tab=t;$('pTags').hidden=t!=='tags';$('pChats').hidden=t!=='chats';
    $('tabTags').setAttribute('aria-selected',t==='tags');$('tabChats').setAttribute('aria-selected',t==='chats');
    document.querySelector('.dtitle').textContent=t==='tags'?'Your tags':'Chats';
    document.querySelector('.dsub').textContent=t==='tags'?'Private spaces for notes, to-dos and photos. Each tag opens only with its own passcode.':'Message your contacts by mobile number. They only see your messages after adding your number too.';
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
    var ph=$('aPhone').value,nm=$('aName').value.trim(),m=$('aMsg');
    if(!/^[6-9]\d{9}$/.test(ph))return err(m,'Enter a valid 10-digit mobile number.');
    if(ph===me)return err(m,'That\u2019s your own number.');
    if(cs.some(function(c){return c.phone===ph}))return err(m,'This number is already in your contacts.');
    if(cs.length>=plan.c){$('dAdd').close();return openPlans(plan.id==='pro'?'You\u2019ve reached the 10 contact limit.':'You\u2019ve used all '+plan.c+' contacts on the '+plan.n+' plan. Upgrade to add more.')}
    err(m,'Checking\u2026');
    uref(ph).get().then(function(d){
      if(!d.exists)return err(m,'This number isn\u2019t on moimoi yet. Ask them to sign up first.');
      return uref(me).collection('contacts').doc(ph).set({name:nm||ph}).then(function(){$('dAdd').close()});
    }).catch(function(){err(m,'Could not add. Check your internet and try again.')});
  };

  function openPlans(note){
    err($('plNote'),note||'');
    $('plans').innerHTML=PLANS.map(function(p){var cu=p.id===plan.id,off=cu||p.c<plan.c;return '<div class="pl"><div><b>'+p.n+'</b><small>'+p.c+' contacts \u00b7 '+(p.p?'\u20b9'+p.p+' per month':'Free')+'</small></div><button class="'+(off?'ghost':'cta')+'" style="width:auto;height:44px;padding:0 20px" data-pl="'+p.id+'"'+(off?' disabled':'')+'>'+(cu?'Current':'Choose')+'</button></div>'}).join('');
    $('dPlan').showModal();
  }
  $('plans').onclick=function(e){var id=e.target.getAttribute('data-pl');if(!id)return;uref(me).set({plan:id},{merge:true}).catch(none);$('dPlan').close()};
  $('plClose').onclick=function(){$('dPlan').close()};
  $('dPlan').onclose=refresh;$('dAdd').onclose=refresh;

  function openChat(ph){
    peer=cs.filter(function(c){return c.phone===ph})[0];if(!peer)return;
    msgs=[];$('cName').textContent=peer.name;$('cNum').textContent='+91 '+ph;draw(true);
    $('dChat').showModal();$('cIn').focus();
    unM=mref(ph).orderBy('ts').limitToLast(200).onSnapshot(function(q){
      msgs=q.docs.map(function(d){var x=d.data();x.p=d.metadata.hasPendingWrites;return x});draw(true);
    },none);
  }
  function draw(force){
    var t=$('cMsgs'),bot=force||t.scrollHeight-t.scrollTop-t.clientHeight<40;
    t.innerHTML=msgs.map(function(m){return '<div class="b '+(m.from===me?'me':'them')+'">'+esc(m.t)+'<small>'+new Date(m.ts).toLocaleTimeString([],{hour:'numeric',minute:'2-digit'})+(m.p?' \u00b7 sending\u2026':'')+'</small></div>'}).join('')||'<div class="empty" style="padding:20px 0">Say hi~</div>';
    if(bot)t.scrollTop=t.scrollHeight;
  }
  $('fChat').onsubmit=function(e){
    e.preventDefault();var v=$('cIn').value.trim();if(!v||!peer)return;
    mref(peer.phone).add({from:me,to:peer.phone,t:v,ts:Date.now()}).catch(none);$('cIn').value='';
  };
  $('cClose').onclick=function(){$('dChat').close()};
  $('dChat').onclose=function(){if(unM){unM();unM=null}peer=null;msgs=[];refresh()};

  function net(){$('offb').hidden=navigator.onLine}
  window.addEventListener('offline',net);window.addEventListener('online',net);

  var op=Dash.open;Dash.open=function(p){op(p);start(p);show('tags');net()};
  $('dLogout').onclick=function(){stop();logout()};
})();
