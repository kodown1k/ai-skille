(function(){var k='ustroj-motyw',h=document.documentElement,b=document.getElementById('motyw');
function cur(){return h.getAttribute('data-motyw')||(matchMedia('(prefers-color-scheme: dark)').matches?'sen':'jawa');}
function lab(){b.textContent=(cur()==='sen'?'☾ sen':'☼ jawa')+' · przełącz';}
try{var s=localStorage.getItem(k);if(s==='sen'||s==='jawa')h.setAttribute('data-motyw',s);}catch(e){}
lab();b.addEventListener('click',function(){var n=cur()==='sen'?'jawa':'sen';h.setAttribute('data-motyw',n);try{localStorage.setItem(k,n);}catch(e){}lab();});})();
