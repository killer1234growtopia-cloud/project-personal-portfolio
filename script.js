/* Fritz Gerard Mallari portfolio: behavior (theme, menu, stats tool, certificates, skills filter, Project 2 tabs, contact form). */
(function(){
'use strict';
var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
function load(k){ try{ return localStorage.getItem(k); }catch(e){ return null; } }
function save(k,v){ try{ localStorage.setItem(k,v); return true; }catch(e){ return false; } }
var root = document.documentElement;

// Theme
var t = load('gm_theme'); if(t === 'light' || t === 'dark'){ root.setAttribute('data-theme', t); }
document.getElementById('themeBtn').addEventListener('click', function(){
  var n = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  root.setAttribute('data-theme', n); save('gm_theme', n);
});

// Mobile menu
var menu = document.getElementById('menu'), mb = document.getElementById('menuBtn');
mb.addEventListener('click', function(){ var o = menu.classList.toggle('open'); mb.setAttribute('aria-expanded', o); });
menu.addEventListener('click', function(e){ if(e.target.tagName === 'A'){ menu.classList.remove('open'); mb.setAttribute('aria-expanded','false'); } });

// Typing line (never shows an empty line)
var phrases = ['Data analysis','Cleaning messy data','Finding patterns','Building clean web pages','Explaining numbers in plain words'];
var el = document.getElementById('typing'), pi = 0, ci = phrases[0].length, del = false;
if(!reduce){ (function tick(){
  var p = phrases[pi];
  if(!del){ ci++; if(ci >= p.length){ ci = p.length; del = true; el.textContent = p; return setTimeout(tick, 1600); } }
  else { ci--; if(ci <= 1){ del = false; pi = (pi + 1) % phrases.length; ci = 1; } }
  el.textContent = phrases[pi].slice(0, Math.max(ci,1));
  setTimeout(tick, del ? 35 : 70);
})(); }

// Reveal on scroll
var rv = document.querySelectorAll('.reveal');
if('IntersectionObserver' in window){
  var io = new IntersectionObserver(function(es){ es.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } }); }, {threshold:.12});
  rv.forEach(function(r){ io.observe(r); });
} else { rv.forEach(function(r){ r.classList.add('in'); }); }

// 3D tilt on cards
if(!reduce && window.matchMedia('(hover:hover)').matches){
  document.querySelectorAll('.tilt').forEach(function(c){
    c.addEventListener('pointermove', function(e){
      var r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      c.style.transform = 'perspective(800px) rotateY(' + (x * 10) + 'deg) rotateX(' + (-y * 10) + 'deg)';
    });
    c.addEventListener('pointerleave', function(){ c.style.transform = ''; });
  });
}

// Resize an image file to a small data URL
function shrink(file, max, cb){
  var fr = new FileReader();
  fr.onload = function(){
    var im = new Image();
    im.onload = function(){
      var s = Math.min(1, max / Math.max(im.width, im.height)), c = document.createElement('canvas');
      c.width = Math.round(im.width * s); c.height = Math.round(im.height * s);
      c.getContext('2d').drawImage(im, 0, 0, c.width, c.height);
      cb(c.toDataURL('image/jpeg', .82));
    };
    im.onerror = function(){ cb(null); };
    im.src = fr.result;
  };
  fr.onerror = function(){ cb(null); };
  fr.readAsDataURL(file);
}

// Photo
var photo = document.getElementById('photo'), saved = load('gm_photo');
if(saved){ photo.src = saved; photo.style.display = ''; }
document.getElementById('photoFile').addEventListener('change', function(e){
  var f = e.target.files[0]; if(!f) return;
  shrink(f, 500, function(d){ if(!d) return; photo.src = d; photo.style.display = ''; save('gm_photo', d); });
});

// Stats tool
var nums = document.getElementById('nums'), msg = document.getElementById('toolMsg'), out = document.getElementById('stats');
function drawChart(v){
  var d = v.slice(0, 20), mx = Math.max.apply(null, d.concat([0])), mn = Math.min.apply(null, d.concat([0])), W = 600, H = 200, pad = 22, bw = (W - 20) / d.length, span = (mx - mn) || 1, zero = pad + (H - 2 * pad) * (mx / span), g = '';
  d.forEach(function(x, i){ var h = Math.abs(x) / span * (H - 2 * pad), y = x >= 0 ? zero - h : zero; g += '<rect x="' + (10 + i * bw + bw * 0.12) + '" y="' + y + '" width="' + (bw * 0.76) + '" height="' + Math.max(h, 1) + '" rx="3"><title>' + fmt(x) + '</title></rect>'; if(d.length <= 12){ g += '<text x="' + (10 + i * bw + bw / 2) + '" y="' + (H - 4) + '" text-anchor="middle">' + fmt(x) + '</text>'; } });
  document.getElementById('chart').innerHTML = '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Bar chart of the first ' + d.length + ' numbers">' + g + '<line x1="10" x2="' + (W - 10) + '" y1="' + zero + '" y2="' + zero + '" stroke="currentColor" opacity=".3"/></svg>' + (v.length > 20 ? '<p class="small">Chart shows the first 20 numbers.</p>' : '');
}
function fmt(n){ return (Math.round(n * 100) / 100).toString(); }
document.getElementById('calc').addEventListener('click', function(){
  var parts = nums.value.split(/[\s,;]+/).filter(Boolean), v = parts.map(Number);
  if(!parts.length){ msg.textContent = 'Please type some numbers first.'; out.innerHTML = ''; return; }
  if(v.some(isNaN)){ msg.textContent = 'Only numbers are allowed. Check: ' + parts.filter(function(p){ return isNaN(Number(p)); }).slice(0,3).join(', '); out.innerHTML = ''; return; }
  var s = v.slice().sort(function(a,b){ return a - b; }), n = s.length, sum = s.reduce(function(a,b){ return a + b; }, 0);
  var med = n % 2 ? s[(n-1)/2] : (s[n/2-1] + s[n/2]) / 2;
  var mean = sum / n, sd = Math.sqrt(s.reduce(function(a,x){ return a + (x - mean) * (x - mean); }, 0) / n);
  var cnt = {}, mode = s[0], best = 0; s.forEach(function(x){ cnt[x] = (cnt[x] || 0) + 1; if(cnt[x] > best){ best = cnt[x]; mode = x; } });
  var items = [['Count', n], ['Sum', fmt(sum)], ['Mean', fmt(mean)], ['Median', fmt(med)], ['Mode', best > 1 ? fmt(mode) : 'none'], ['Std dev', fmt(sd)], ['Min', fmt(s[0])], ['Max', fmt(s[n-1])], ['Range', fmt(s[n-1] - s[0])]];
  drawChart(v);
  out.innerHTML = items.map(function(i){ return '<div><dt>' + i[0] + '</dt><dd>' + i[1] + '</dd></div>'; }).join('');
  msg.textContent = '';
});
document.getElementById('clr').addEventListener('click', function(){ document.getElementById('chart').innerHTML = ''; nums.value = ''; out.innerHTML = ''; msg.textContent = ''; });

// Certificates
var grid = document.getElementById('certGrid'), cm = document.getElementById('certMsg'), certs = [];
try{ certs = JSON.parse(load('gm_certs') || '[]'); }catch(e){ certs = []; }
function esc(s){ return s.replace(/[&<>"']/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }
function render(){
  if(!certs.length){ grid.innerHTML = '<div class="empty">No certificates yet. Add your first one above.</div>'; return; }
  grid.innerHTML = certs.map(function(c, i){
    return '<figure class="cert" style="margin:0"><img src="' + c.img + '" alt="Certificate: ' + esc(c.title) + '"><div><b>' + esc(c.title) + '</b><button class="del" data-i="' + i + '" aria-label="Delete ' + esc(c.title) + '" title="Delete">&#128465;</button></div></figure>';
  }).join('');
}
grid.addEventListener('click', function(e){
  var b = e.target.closest('.del');
  if(b){ var i = +b.dataset.i; if(confirm('Delete "' + certs[i].title + '"?')){ certs.splice(i, 1); save('gm_certs', JSON.stringify(certs)); render(); cm.textContent = 'Certificate deleted.'; } return; }
  if(e.target.tagName === 'IMG'){
    var lb = document.createElement('div'); lb.className = 'lightbox'; lb.innerHTML = '<img alt="">'; lb.firstChild.src = e.target.src;
    lb.addEventListener('click', function(){ lb.remove(); }); document.body.appendChild(lb);
  }
});
document.getElementById('certForm').addEventListener('submit', function(e){
  e.preventDefault();
  var title = document.getElementById('certTitle').value.trim(), f = document.getElementById('certFile').files[0];
  if(!title || !f) return;
  shrink(f, 900, function(d){
    if(!d){ cm.textContent = 'That file could not be read as a picture. Try a JPG or PNG.'; return; }
    certs.push({title: title, img: d});
    if(!save('gm_certs', JSON.stringify(certs))){ certs.pop(); cm.textContent = 'The browser has no more space to save pictures. Delete one first.'; return; }
    render(); cm.textContent = 'Certificate added.'; e.target.reset();
  });
});

// Progress bar and back-to-top
var bar = document.getElementById('bar'), tt = document.getElementById('toTop'), toast = document.getElementById('toast');
function onScroll(){ var h = document.documentElement, m = h.scrollHeight - h.clientHeight; bar.style.width = (m > 0 ? h.scrollTop / m * 100 : 0) + '%'; tt.classList.toggle('show', h.scrollTop > 600); }
window.addEventListener('scroll', onScroll, {passive:true}); onScroll();
tt.addEventListener('click', function(){ window.scrollTo({top:0, behavior: reduce ? 'auto' : 'smooth'}); });
function say(t){ toast.textContent = t; toast.classList.add('show'); setTimeout(function(){ toast.classList.remove('show'); }, 2200); }

// Skill filter
var fb = document.querySelectorAll('.filter button');
fb.forEach(function(b){ b.addEventListener('click', function(){
  fb.forEach(function(x){ x.classList.remove('on'); }); b.classList.add('on');
  document.querySelectorAll('#skillTable tbody tr').forEach(function(r){ r.style.display = (b.dataset.f === 'all' || r.dataset.c === b.dataset.f) ? '' : 'none'; });
}); });

// Contact form (replace MAIL with your real address)
var MAIL = 'killer1234growtopia@gmail.com';
document.getElementById('send').addEventListener('click', function(){
  var n = document.getElementById('cn').value.trim(), m = document.getElementById('cm').value.trim(), e = document.getElementById('err');
  if(!n || !m){ e.textContent = 'Enter your name and a message before sending.'; return; }
  e.textContent = '';
  location.href = 'mailto:' + MAIL + '?subject=' + encodeURIComponent('Portfolio message from ' + n) + '&body=' + encodeURIComponent(m);
});
document.getElementById('copyMail').addEventListener('click', function(){
  if(navigator.clipboard){ navigator.clipboard.writeText(MAIL).then(function(){ say('Email copied'); }, function(){ say(MAIL); }); } else { say(MAIL); }
});

// Resume picture (reuses the download link's image) and enlarge on click
var ri = document.getElementById('resImg'); ri.src = document.getElementById('resDl').href;
function openRes(){ var lb = document.createElement('div'); lb.className = 'lightbox'; lb.innerHTML = '<img alt="Resume of Fritz Gerard Mallari">'; lb.firstChild.src = ri.src; lb.addEventListener('click', function(){ lb.remove(); }); document.body.appendChild(lb); }
ri.addEventListener('click', openRes); ri.addEventListener('keydown', function(e){ if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); openRes(); } });

// Project 2 tabs
document.querySelectorAll('.tabs button').forEach(function(b){ b.addEventListener('click', function(){
  document.querySelectorAll('.tabs button').forEach(function(x){ x.classList.remove('on'); }); b.classList.add('on');
  document.querySelectorAll('#project2 .pane').forEach(function(p){ p.classList.toggle('on', p.id === b.dataset.t); });
}); });

// Counters
function countTo(el, end){ var t0 = null; function step(t){ if(t0 === null) t0 = t; var k = reduce ? 1 : Math.min((t - t0) / 900, 1); el.textContent = Math.round(end * k); if(k < 1) requestAnimationFrame(step); } requestAnimationFrame(step); }
var totals = { projects: document.querySelectorAll('.proj').length, cases: document.querySelectorAll('details.case').length, skills: document.querySelectorAll('#skillTable tbody tr').length, certs: certs.length };
var gl = document.querySelector('.glance');
function runCounts(){ gl.querySelectorAll('[data-count]').forEach(function(b){ countTo(b, totals[b.dataset.count] || 0); }); }
if('IntersectionObserver' in window){ var go = new IntersectionObserver(function(en){ if(en[0].isIntersecting){ runCounts(); go.disconnect(); } }, {threshold:.4}); go.observe(gl); } else { runCounts(); }

// Reflection draft with word counter
var rf = document.getElementById('refl'), wc = document.getElementById('wc');
try{ rf.value = load('gm_refl') || ''; }catch(e){}
function words(){ var n = (rf.value.trim().match(/\S+/g) || []).length; wc.textContent = n + ' words (target 500 to 800)'; wc.className = 'wc ' + (n < 500 ? 'low' : n > 800 ? 'high' : 'ok'); return n; }
rf.addEventListener('input', function(){ words(); save('gm_refl', rf.value); }); words();
render();
})();
