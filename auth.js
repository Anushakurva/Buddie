(function(){
  var $=function(id){return document.getElementById(id)};
  var KEY='moimoi_users',SESS='moimoi_session';
  function load(k){try{return JSON.parse(localStorage.getItem(k)||'null')}catch(e){return null}}
  function save(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}
  var mem={users:{},session:null};
  function users(){return load(KEY)||mem.users}
  function setUsers(u){mem.users=u;save(KEY,u)}
  function hash(s){
    if(window.crypto&&crypto.subtle){
      return crypto.subtle.digest('SHA-256',new TextEncoder().encode(s)).then(function(b){
        return Array.from(new Uint8Array(b)).map(function(x){return x.toString(16).padStart(2,'0')}).join('')});
    }
    return Promise.resolve(btoa(unescape(encodeURIComponent(s))));
  }
  function validPhone(p){return /^[6-9]\d{9}$/.test(p)}
  function msg(el,t,type){el.textContent=t;el.className='msg '+(type||'err')}
  function digits(e){e.target.value=e.target.value.replace(/\D/g,'').slice(0,10)}
  $('lPhone').addEventListener('input',digits);$('sPhone').addEventListener('input',digits);

  function tab(t){
    var login=t==='login';
    $('login').hidden=!login;$('signup').hidden=login;
    $('tabLogin').setAttribute('aria-selected',login);$('tabSignup').setAttribute('aria-selected',!login);
    msg($('lMsg',''),'');msg($('sMsg'),'');
  }
  $('tabLogin').onclick=$('toLogin').onclick=function(){tab('login')};
  $('tabSignup').onclick=$('toSignup').onclick=function(){tab('signup')};

  document.querySelectorAll('[data-show]').forEach(function(b){
    b.onclick=function(){var i=$(b.dataset.show),s=i.type==='password';i.type=s?'text':'password';b.textContent=s?'Hide':'Show'};
  });

  function enter(phone){
    mem.session=phone;save(SESS,phone);
    document.querySelector('.app').hidden=true;Dash.open(phone);
  }

  $('signup').addEventListener('submit',function(e){
    e.preventDefault();
    var p=$('sPhone').value,a=$('sPass').value,c=$('sConf').value,m=$('sMsg');
    if(!validPhone(p))return msg(m,'Enter a valid 10-digit mobile number.');
    if(a.length<8)return msg(m,'Password must be at least 8 characters.');
    if(a!==c)return msg(m,'Passwords don’t match. Type the same password in both fields.');
    var u=users();
    if(u[p])return msg(m,'This number already has an account. Log in instead.');
    hash(p+':'+a).then(function(h){
      u[p]=h;setUsers(u);
      $('signup').reset();tab('login');
      $('lPhone').value=p;
      msg($('lMsg'),'Account created. Enter your password to log in.','ok');
      $('lPass').focus();
    });
  });

  $('login').addEventListener('submit',function(e){
    e.preventDefault();
    var p=$('lPhone').value,a=$('lPass').value,m=$('lMsg');
    if(!validPhone(p))return msg(m,'Enter a valid 10-digit mobile number.');
    if(!a)return msg(m,'Enter your password.');
    var u=users();
    if(!u[p])return msg(m,'No account found for this number. Sign up first.');
    hash(p+':'+a).then(function(h){
      if(u[p]!==h)return msg(m,'Wrong password. Try again.');
      $('login').reset();msg(m,'');enter(p);
    });
  });

  window.doLogout=function(){
    mem.session=null;try{localStorage.removeItem(SESS)}catch(e){}
    document.querySelector('.app').hidden=false;tab('login');
  };

  var s=load(SESS);if(s&&users()[s])enter(s);
})();
