(function(){
  var $=function(id){return document.getElementById(id)};
  var ready=!!(window.firebase&&window.FIREBASE_CONFIG&&String(FIREBASE_CONFIG.apiKey).indexOf('PASTE')<0);
  var auth=null;
  if(ready){firebase.initializeApp(FIREBASE_CONFIG);auth=firebase.auth();window.MM={auth:auth,db:firebase.firestore()}}
  var SETUP='Firebase is not set up yet. Open firebase-config.js and paste your keys.';
  function msg(el,t,type){el.textContent=t;el.className='msg '+(type||'err')}
  function digits(e){e.target.value=e.target.value.replace(/\D/g,'').slice(0,10)}
  function validPhone(p){return /^[6-9]\d{9}$/.test(p)}
  function mail(p){return p+'@moimoi.app'}
  function why(e){
    var c=(e&&e.code)||'';
    if(c==='auth/email-already-in-use')return 'This number already has an account. Log in instead.';
    if(c==='auth/invalid-credential'||c==='auth/user-not-found'||c==='auth/wrong-password'||c==='auth/invalid-login-credentials')return 'Wrong mobile number or password. New here? Sign up first.';
    if(c==='auth/too-many-requests')return 'Too many tries. Wait a few minutes.';
    if(c==='auth/network-request-failed')return 'No internet connection.';
    if(c==='auth/operation-not-allowed')return 'Turn on Email/Password sign-in in the Firebase console.';
    return 'Something went wrong. Try again.';
  }
  $('lPhone').addEventListener('input',digits);$('sPhone').addEventListener('input',digits);

  function tab(t){
    var login=t==='login';
    $('login').hidden=!login;$('signup').hidden=login;
    $('tabLogin').setAttribute('aria-selected',login);$('tabSignup').setAttribute('aria-selected',!login);
    msg($('lMsg'),'');msg($('sMsg'),'');
  }
  $('tabLogin').onclick=$('toLogin').onclick=function(){tab('login')};
  $('tabSignup').onclick=$('toSignup').onclick=function(){tab('signup')};
  document.querySelectorAll('[data-show]').forEach(function(b){
    b.onclick=function(){var i=$(b.dataset.show),s=i.type==='password';i.type=s?'text':'password';b.textContent=s?'Hide':'Show'};
  });

  $('signup').addEventListener('submit',function(e){
    e.preventDefault();
    var p=$('sPhone').value,a=$('sPass').value,c=$('sConf').value,m=$('sMsg');
    if(!validPhone(p))return msg(m,'Enter a valid 10-digit mobile number.');
    if(a.length<8)return msg(m,'Password must be at least 8 characters.');
    if(a!==c)return msg(m,'Passwords don’t match. Type the same password in both fields.');
    if(!ready)return msg(m,SETUP);
    msg(m,'Creating your account…','ok');
    auth.createUserWithEmailAndPassword(mail(p),a).then(function(){$('signup').reset();msg(m,'')}).catch(function(x){msg(m,why(x))});
  });

  $('login').addEventListener('submit',function(e){
    e.preventDefault();
    var p=$('lPhone').value,a=$('lPass').value,m=$('lMsg');
    if(!validPhone(p))return msg(m,'Enter a valid 10-digit mobile number.');
    if(!a)return msg(m,'Enter your password.');
    if(!ready)return msg(m,SETUP);
    msg(m,'Logging in…','ok');
    auth.signInWithEmailAndPassword(mail(p),a).then(function(){$('login').reset();msg(m,'')}).catch(function(x){msg(m,why(x))});
  });

  function enter(phone){document.querySelector('.app').hidden=true;Dash.open(phone)}
  window.doLogout=function(){if(auth)auth.signOut()};
  if(auth){
    auth.onAuthStateChanged(function(u){
      if(u&&u.email){enter(u.email.split('@')[0])}
      else{$('dash').hidden=true;document.querySelector('.app').hidden=false;tab('login')}
    });
  }
})();
