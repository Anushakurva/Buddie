(function(){
  var $=function(i){return document.getElementById(i)};
  var ICONS={Faces:'😀 😎 🥰 🤓 😴 🤖 👻 🦄 💀 🤠 😇 🥳 🤩 😺',Nature:'🌸 🌿 🌞 🌙 ⭐ 🔥 🌈 ⚡ 🌊 🍀 🐶 🐱 🦋 🐼 🌵 🍁',Food:'🍕 🍔 🍜 🍣 🍩 🍎 ☕ 🍰 🥑 🍿 🧋 🍫',Play:'🎮 🎵 🎬 📚 🎨 ⚽ 🏀 🎸 🚴 🏋️ 🧘 🎯',Places:'🏠 ✈️ 🚗 🏖️ 🏔️ 🗺️ 🚀 🏫 🏥 🛒 ⛺ 🚆',Things:'💼 💡 🔑 📷 💻 📱 🎁 💰 🛠️ 📌 ✏️ 🧸',Symbols:'❤️ ✅ 🔒 🚩 💎 🎉 ✨ 💬 🔔 📅 💊 🌍'};
  var COLORS=['#c9f7a8','#ffc2e2','#ffb5ab','#a9d3ff','#ffe29a','#ffcfa8','#d9c8ff'];
  var phone,tags=[],cur=null,pend=null,mem={},icon='😀',cat='Faces',color=COLORS[0],delArm=false,t1;
  function esc(s){return String(s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
  function K(){return 'moimoi_tags_'+phone}
  function load(){try{tags=JSON.parse(localStorage.getItem(K())||'null')||mem[phone]||[]}catch(e){tags=mem[phone]||[]}}
  function save(){mem[phone]=tags;try{localStorage.setItem(K(),JSON.stringify(tags));return true}catch(e){return false}}
  function hash(s){
    if(window.crypto&&crypto.subtle){return crypto.subtle.digest('SHA-256',new TextEncoder().encode(s)).then(function(b){return Array.from(new Uint8Array(b)).map(function(x){return x.toString(16).padStart(2,'0')}).join('')})}
    return Promise.resolve(btoa(unescape(encodeURIComponent(s))));
  }
  function msg(el,t,ok){el.textContent=t;el.className='msg '+(ok?'ok':'err')}
  function first(v){v=v.trim();if(!v)return '';if(window.Intl&&Intl.Segmenter){return new Intl.Segmenter().segment(v)[Symbol.iterator]().next().value.segment}return Array.from(v)[0]}

  function render(){
    $('grid').innerHTML=tags.length?tags.map(function(t){return '<button class="card" data-id="'+t.id+'" style="background:'+t.color+'"><span class="ci">'+esc(t.icon)+'</span><span><span class="cn">'+esc(t.name)+'</span><br><span class="cl">Locked</span></span></button>'}).join(''):'<div class="empty">No tags yet. Tap + to make your first one.</div>';
  }
  $('grid').onclick=function(e){
    var b=e.target.closest('.card');if(!b)return;
    pend=tags.filter(function(t){return t.id===b.dataset.id})[0];if(!pend)return;
    $('pTitle').textContent='Open “'+pend.name+'”';$('pInput').value='';msg($('pMsg'),'');
    $('dPass').showModal();$('pInput').focus();
  };

  function pickers(){
    $('cats').innerHTML=Object.keys(ICONS).map(function(c){return '<button type="button" data-c="'+c+'" aria-pressed="'+(c===cat)+'">'+c+'</button>'}).join('');
    $('icons').innerHTML=ICONS[cat].split(' ').map(function(i){return '<button type="button" data-i="'+i+'" aria-pressed="'+(i===icon)+'">'+i+'</button>'}).join('');
    $('colors').innerHTML=COLORS.map(function(c){return '<button type="button" data-k="'+c+'" aria-label="Colour" aria-pressed="'+(c===color)+'" style="background:'+c+'"></button>'}).join('');
    $('prev').textContent=icon;$('prev').style.background=color;
  }
  $('cats').onclick=function(e){var b=e.target.closest('button');if(b){cat=b.dataset.c;pickers()}};
  $('icons').onclick=function(e){var b=e.target.closest('button');if(b){icon=b.dataset.i;$('tCustom').value='';pickers()}};
  $('colors').onclick=function(e){var b=e.target.closest('button');if(b){color=b.dataset.k;pickers()}};
  $('tCustom').oninput=function(e){var f=first(e.target.value);if(f){icon=f;pickers()}};
  $('tPass').oninput=$('tConf').oninput=$('pInput').oninput=function(e){e.target.value=e.target.value.replace(/\D/g,'')};

  $('fab').onclick=function(){$('fCreate').reset();icon='😀';cat='Faces';color=COLORS[0];msg($('tMsg'),'');pickers();$('dCreate').showModal();$('tName').focus()};
  $('cCancel').onclick=function(){$('dCreate').close()};
  $('fCreate').onsubmit=function(e){
    e.preventDefault();
    var n=$('tName').value.trim(),p=$('tPass').value,c=$('tConf').value,m=$('tMsg');
    if(!n)return msg(m,'Give your tag a name.');
    if(!/^\d{4,8}$/.test(p))return msg(m,'Passcode must be 4 to 8 digits.');
    if(p!==c)return msg(m,'Passcodes don’t match. Type the same passcode in both fields.');
    var id=Date.now().toString(36)+Math.random().toString(36).slice(2,6);
    hash(id+':'+p).then(function(h){
      tags.unshift({id:id,name:n,icon:icon,color:color,pass:h,notes:'',todos:[],images:[]});
      save();render();$('dCreate').close();
    });
  };

  $('pCancel').onclick=function(){$('dPass').close()};
  $('fPass').onsubmit=function(e){
    e.preventDefault();
    if(!pend)return;
    hash(pend.id+':'+$('pInput').value).then(function(h){
      if(h!==pend.pass){$('pInput').value='';return msg($('pMsg'),'Wrong passcode. Try again.')}
      $('dPass').close();openTag(pend);
    });
  };

  function openTag(t){
    cur=t;delArm=false;$('vDel').textContent='Delete tag';msg($('vMsg'),'');
    $('vIcon').textContent=t.icon;$('vIcon').style.background=t.color;$('vName').textContent=t.name;
    if(!Array.isArray(t.notes)){t.notes=(t.notes||(t.stickers&&t.stickers.length))?[{text:t.notes||'',stickers:t.stickers||[]}]:[];delete t.stickers}
    if(!t.notes.length)t.notes.push({text:'',stickers:[]});
    t.images=t.images.map(function(m){return typeof m==='string'?{src:m,stk:''}:m});shown={};
    act=0;drawNotes();drawTodos();drawImgs();$('dTag').showModal();
  }
  var act=-1;
  function drawNotes(){
    $('notes').innerHTML=cur.notes.length?cur.notes.map(function(n,i){return '<div class="note" data-n="'+i+'"><div class="stk">'+n.stickers.map(function(x,j){return '<button type="button" data-d="'+j+'" aria-label="Remove sticker">'+x+'</button>'}).join('')+'</div><textarea class="ta'+(i===act?' on':'')+'" data-t="'+i+'" placeholder="Write anything here">'+esc(n.text)+'</textarea><button type="button" class="ghost" data-rm="'+i+'">Remove note</button></div>'}).join(''):'<div class="empty" style="padding:10px 4px">No notes yet. Tap + to add one.</div>';
  }
  $('notes').oninput=function(e){var i=e.target.getAttribute('data-t');if(i===null)return;cur.notes[+i].text=e.target.value;clearTimeout(t1);t1=setTimeout(function(){if(!save())msg($('vMsg'),'Storage is full. Remove a photo to save more.')},400)};
  $('notes').onfocusin=function(e){var i=e.target.getAttribute('data-t');if(i===null)return;act=+i;[].forEach.call($('notes').querySelectorAll('.ta'),function(c){c.classList.toggle('on',c.getAttribute('data-t')==act)})};
  $('notes').onclick=function(e){
    var d=e.target.closest('[data-d]'),r=e.target.getAttribute('data-rm');
    if(d){cur.notes[+d.closest('.note').dataset.n].stickers.splice(+d.dataset.d,1);save();drawNotes()}
    else if(r!==null){cur.notes.splice(+r,1);act=cur.notes.length?0:-1;save();drawNotes()}
  };
  $('addNote').onclick=function(){cur.notes.push({text:'',stickers:[]});act=cur.notes.length-1;save();drawNotes();var t=$('notes').querySelector('[data-t="'+act+'"]');if(t)t.focus()};
  var STK='🌟 💖 🔥 🎉 ✅ ⭐ 🌈 🦄 🍀 📌 💡 😍 🥳 🐱 ☀️ 🌸 🎈 💯 ❗ 🧸'.split(' ');
  $('tray').innerHTML=STK.map(function(x){return '<button type="button" data-s="'+x+'" aria-label="Add sticker">'+x+'</button>'}).join('');
  $('tray').onclick=function(e){var b=e.target.closest('button');if(!b||act<0||!cur.notes[act])return;var n=cur.notes[act];if(n.stickers.length>=12)return;n.stickers.push(b.dataset.s);save();drawNotes()};
  function drawTodos(){
    $('todos').innerHTML=cur.todos.map(function(d,i){return '<div class="todo'+(d.done?' done':'')+'"><input type="checkbox" data-i="'+i+'"'+(d.done?' checked':'')+'><span>'+esc(d.t)+'</span><button data-r="'+i+'">Remove</button></div>'}).join('');
  }
  $('todos').onclick=function(e){
    var r=e.target.getAttribute('data-r'),i=e.target.getAttribute('data-i');
    if(r!==null){cur.todos.splice(+r,1)}else if(i!==null){cur.todos[+i].done=e.target.checked}else return;
    save();drawTodos();
  };
  $('fTodo').onsubmit=function(e){e.preventDefault();var v=$('todoIn').value.trim();if(!v)return;cur.todos.push({t:v,done:false});$('todoIn').value='';save();drawTodos()};
  function drawImgs(){
    $('imgs').innerHTML=cur.images.map(function(m,i){var cov=m.stk&&!shown[i];return '<div>'+(cov?'<button class="stkc" data-v="'+i+'" aria-label="Show photo">'+m.stk+'</button>':'<img src="'+m.src+'" alt="Saved image"'+(m.stk?' data-v="'+i+'"':'')+'>')+'<span class="ib"><button data-x="'+i+'" aria-label="Remove photo"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" style="pointer-events:none"><path d="M5 12h14"/></svg></button></span></div>'}).join('');
  }
  var shown={},pickFor='',pickIdx=0,pickCat='Anime',fresh=false,pq=[];
  function flip(i,el){
    var tile=el.closest('.imgs>div');
    var calm=window.matchMedia&&matchMedia('(prefers-reduced-motion:reduce)').matches;
    if(!window.gsap||calm||!tile){shown[i]=!shown[i];drawImgs();return}
    if(tile._b)return;tile._b=1;
    gsap.to(tile,{rotationY:90,scale:.92,duration:.25,ease:'power2.in',onComplete:function(){
      shown[i]=!shown[i];drawImgs();
      var t=$('imgs').children[i];
      if(t)gsap.fromTo(t,{rotationY:-90,scale:.92},{rotationY:0,scale:1,duration:.5,ease:'back.out(1.7)'});
    }});
  }
  function nextPick(){
    while(pq.length&&!(cur&&cur.images[pq[0]]))pq.shift();
    if(!pq.length||$('dPick').open)return;
    pickIdx=pq.shift();pickFor='img';fresh=true;openPick();
  }
  $('imgs').onclick=function(e){
    var b=e.target.closest('button,img');if(!b)return;
    var x=b.getAttribute('data-x'),st=b.getAttribute('data-s'),v=b.getAttribute('data-v');
    if(x!==null){cur.images.splice(+x,1);shown={};save();drawImgs()}
    else if(st!==null){pickFor='img';pickIdx=+st;openPick()}
    else if(v!==null)flip(+v,b)
  };
  $('imgIn').onchange=function(e){
    Array.from(e.target.files).forEach(function(f){
      var r=new FileReader();
      r.onload=function(){
        var im=new Image();
        im.onload=function(){
          var s=Math.min(1,700/Math.max(im.width,im.height)),c=document.createElement('canvas');
          c.width=Math.round(im.width*s);c.height=Math.round(im.height*s);
          c.getContext('2d').drawImage(im,0,0,c.width,c.height);
          cur.images.push({src:c.toDataURL('image/jpeg',.75),stk:''});pq.push(cur.images.length-1);setTimeout(nextPick,0);
          if(!save()){cur.images.pop();msg($('vMsg'),'Storage is full. Remove a photo to add more.')}
          drawImgs();
        };
        im.src=r.result;
      };
      r.readAsDataURL(f);
    });
    e.target.value='';
  };
  var LIB={
    Anime:'⛩️ 🎌 🍙 🍥 🍜 🍡 🌸 🗾 🎎 🏮 🎴 🐉 🦊 🥷 🗡️ 💢 💥 💫 🌀 ⚡ 🔮 🧿 🌐 🌙 ⭐ 🍵 🎋 🐾',
    Cartoon:'🤡 👾 👽 🤖 👻 💩 🧸 🐸 🐵 🙈 🙉 🙊 🦄 🐲 🧞 🧚 🦸 🦹 🎃 😈 👹 👺 🐷 🐼 🐨 🦁 🐯',
    Cute:'🥰 😍 🥺 😳 😆 🤭 😋 😎 🤩 🥳 😴 🤗 😇 😜 🤓 😭 😡 🥶 🤯 😏',
    Animals:'🐶 🐱 🐭 🐹 🐰 🦊 🐻 🐼 🐨 🐯 🦁 🐮 🐷 🐸 🐵 🐔 🐧 🐦 🦆 🦉 🦋 🐝 🐞 🐢 🐙 🐬 🐳 🦈',
    Love:'❤️ 🧡 💛 💚 💙 💜 🖤 🤍 💖 💗 💘 💝 💞 💕 💌 💋 🌹 🎀 💍 💐',
    Food:'🍕 🍔 🍟 🌮 🍜 🍣 🍩 🍪 🎂 🍰 🍦 🍫 🍿 🧋 ☕ 🍎 🍓 🍉 🍑 🥑',
    Fun:'🎮 🎵 🎬 📚 🎨 ⚽ 🏀 🎸 🎤 🎧 🎯 🎲 🧩 🎁 🎈 🎉 🏆 🚀 🛹 🎡',
    Nature:'🌸 🌺 🌻 🌿 🍀 🍁 🌞 🌙 ⭐ 🌈 ☁️ ❄️ 🔥 ⚡ 🌊 🌵 🍄 🌴 🌍 ✨',
    Things:'💼 💡 🔑 📷 💻 📱 📌 ✏️ 📒 🛒 🛠️ 🧳 ⏰ 🔔 💰 💎 🪄 🧪 📦 🕯️',
    Places:'🏠 🏫 🏥 🏖️ 🏔️ 🗺️ ✈️ 🚗 🚆 ⛺ 🏰 🗼 🎡 🌆 🌃 🛕 ⛩️ 🗽',
    Symbols:'✅ ❌ ❗ ❓ 💯 🔒 🚩 🎯 💬 📅 💊 ♻️ ➕ 🔰 🆒 🆕 🆗'
  };
  function openPick(){
    $('pkTitle').textContent=pickFor==='icon'?'Choose an icon':'Choose a sticker';
    $('pkNone').hidden=pickFor!=='img'||!cur.images[pickIdx].stk;
    drawPick();$('dPick').showModal();
  }
  function drawPick(){
    $('pkCats').innerHTML=Object.keys(LIB).map(function(c){return '<button type="button" data-c="'+c+'" aria-pressed="'+(c===pickCat)+'">'+c+'</button>'}).join('');
    $('pkGrid').innerHTML=LIB[pickCat].split(' ').map(function(x){return '<button type="button" data-e="'+x+'">'+x+'</button>'}).join('');
  }
  $('pkCats').onclick=function(e){var b=e.target.closest('button');if(b){pickCat=b.dataset.c;drawPick()}};
  $('pkGrid').onclick=function(e){var b=e.target.closest('button');if(b)choose(b.dataset.e)};
  $('pkNone').onclick=function(){choose('')};
  $('pkBack').onclick=function(){$('dPick').close()};
  $('dPick').onclose=function(){
    if(fresh&&pickFor==='img'&&cur&&cur.images[pickIdx]&&!cur.images[pickIdx].stk){cur.images[pickIdx].stk='✨';save();drawImgs()}
    fresh=false;nextPick();
  };
  function choose(x){
    if(pickFor==='icon'){icon=x;$('tCustom').value='';pickers()}
    else if(pickFor==='note'){var n=cur.notes[act];if(n&&n.stickers.length<12){n.stickers.push(x);save();drawNotes()}}
    else if(pickFor==='img'){cur.images[pickIdx].stk=x;shown={};save();drawImgs()}
    $('dPick').close();
  }
  $('pickIcon').onclick=function(){pickFor='icon';openPick()};
  $('moreStk').onclick=function(){if(act<0||!cur.notes[act])return;pickFor='note';openPick()};
  $('vLock').onclick=function(){$('dTag').close()};
  $('dTag').onclose=function(){cur=null};
  $('vDel').onclick=function(){
    if(!delArm){delArm=true;this.textContent='Tap again to delete';return}
    tags=tags.filter(function(t){return t!==cur});save();render();$('dTag').close();
  };
  $('dLogout').onclick=function(){$('dash').hidden=true;tags=[];window.doLogout()};
  window.Dash={open:function(p){phone=p;load();$('dash').hidden=false;render()}};
})();
