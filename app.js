const $=s=>document.querySelector(s);
const get=n=>fetch('data/'+n+'.json').then(r=>{if(!r.ok)throw 0;return r.json()});
const el=(t,c,x)=>{const e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e};
// Photos are served through Netlify's Image CDN, which resizes them for each screen
// and converts them to a lighter format. The uploaded originals are never changed.
// pic(path,'big') = full-screen size, pic(path) = gallery thumbnail size.
const CDN=!/^(localhost|127\.0\.0\.1|)$/.test(location.hostname);
const STEPS=[400,800,1200,1600,2000,2400],DPR=Math.min(devicePixelRatio||1,3);
const fit=px=>STEPS.find(w=>w>=px)||2400;
const pic=(p,big)=>{if(!p)return'';if(!CDN||/^(https?:|data:)/.test(p))return encodeURI(p);
  const w=big?fit(Math.max(screen.width,screen.height)*DPR):fit(Math.min(innerWidth,600)*DPR);
  return '/.netlify/images?url='+encodeURIComponent('/'+p.replace(/^\/+/,''))+'&w='+w+'&q='+(big?85:75)};
const url=s=>'url("'+s+'")';
const book=(s,p)=>'index.html?session='+encodeURIComponent(s||'')+'&package='+encodeURIComponent(p||'')+'#contact';
function prefill(s,p){const f=$('form');if(!f)return;
  if(s)[...f.session.options].forEach(o=>{if(o.text===s)f.session.value=o.value});
  if(p)f.package.value=p}
const loads=[];// content that changes page height; see 'Land on #anchor' below
document.getElementById('yr').textContent=new Date().getFullYear();

// Business info, About, Instagram
loads.push(get('settings').then(s=>{
  document.querySelectorAll('.logo,.biz').forEach(e=>e.textContent=s.business_name);
  document.title=s.business_name+' | '+document.body.dataset.title;
  document.querySelectorAll('[data-t]').forEach(e=>{if(s[e.dataset.t])e.textContent=s[e.dataset.t]});
  if(s.inquiry_email&&$('form'))$('form').action='https://formsubmit.co/'+s.inquiry_email;
  const h=(s.instagram_handle||'').replace('@','');
  document.querySelectorAll('[data-ig]').forEach(a=>{a.href='https://instagram.com/'+h;a.target='_blank';a.rel='noopener';if(a.dataset.ig==='handle')a.textContent='@'+h});
  if($('#about')){
    $('#about-title').textContent=s.about_title;
    const box=$('#about-text');box.replaceChildren(...s.about_text.split(/\n\s*\n/).map(t=>el('p','',t)));
    $('#about-note').textContent=s.about_note;
    if(s.about_photo)$('.portrait').style.backgroundImage=url(pic(s.about_photo))+',linear-gradient(160deg,#B9C2BA,#8E9B94)';
  }
}).catch(()=>{}));

// Carousel
if($('#hero'))loads.push(get('carousel').then(d=>{
  const hero=$('#hero'),box=hero.querySelector('.dots'),at=hero.querySelector('.hero-text');
  const slides=d.slides.map(s=>{const e=el('div','slide');e.style.backgroundImage=url(pic(s.image,'big'))+',linear-gradient(135deg,#6F7F78,#2C3A3A)';if(s.position)e.style.backgroundPosition=s.position;e.setAttribute('role','img');e.setAttribute('aria-label',s.alt||'Photo');hero.insertBefore(e,at);return e});
  if(!slides.length)return;
  let i=0,timer;
  const dots=slides.map((_,n)=>{const b=el('button');b.setAttribute('aria-label','Photo '+(n+1));b.onclick=()=>go(n);box.append(b);return b});
  function go(n){i=(n+slides.length)%slides.length;slides.forEach((s,k)=>s.classList.toggle('on',k===i));dots.forEach((x,k)=>x.classList.toggle('on',k===i));clearInterval(timer);if(!matchMedia('(prefers-reduced-motion:reduce)').matches)timer=setInterval(()=>go(i+1),5000)}
  hero.querySelector('.prev').onclick=()=>go(i-1);hero.querySelector('.next').onclick=()=>go(i+1);go(0);
}).catch(()=>{}));

// Pop-up photo viewer: returns show(n), which opens photo n over the page
function lightbox(ps,title){
  const box=el('dialog','lightbox'),fig=el('figure'),img=el('img'),cap=el('figcaption');
  const x=el('button','lb-close','\u00d7'),pv=el('button','lb-prev','\u2039'),nx=el('button','lb-next','\u203a');
  x.setAttribute('aria-label','Close');pv.setAttribute('aria-label','Previous photo');nx.setAttribute('aria-label','Next photo');
  pv.hidden=nx.hidden=ps.length<2;fig.append(img,cap);box.append(x,fig,pv,nx);document.body.append(box);
  let k=0;
  const show=n=>{k=(n+ps.length)%ps.length;const p=ps[k];img.onerror=()=>{img.onerror=null;img.src=encodeURI(p.image)};img.src=pic(p.image,'big');img.alt=p.alt||p.caption||title;cap.textContent=p.caption||'';cap.hidden=!p.caption;if(!box.open)box.showModal()};
  pv.onclick=()=>show(k-1);nx.onclick=()=>show(k+1);x.onclick=()=>box.close();
  box.onclick=e=>{if(e.target===box||e.target===fig)box.close()};
  box.addEventListener('keydown',e=>{if(e.key==='ArrowLeft')show(k-1);if(e.key==='ArrowRight')show(k+1)});
  let sx=null;
  box.addEventListener('touchstart',e=>{sx=e.touches[0].clientX},{passive:true});
  box.addEventListener('touchend',e=>{if(sx===null)return;const dx=e.changedTouches[0].clientX-sx;if(Math.abs(dx)>50&&ps.length>1)show(k+(dx<0?1:-1));sx=null});
  return show;
}

// Gallery: album covers on gallery.html, one album's photos on gallery.html?album=<name>
if($('#gallery'))loads.push(get('portfolio').then(d=>{
  const slug=t=>(t||'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
  const g=$('.grid'),h=$('#gallery-title'),back=$('.back');
  const want=new URLSearchParams(location.search).get('album');
  const a=want&&d.albums.find(x=>slug(x.title)===want);
  if(a){
    h.textContent=a.title;document.title=a.title+' | '+document.title;back.hidden=false;
    const ps=a.photos||[],lb=lightbox(ps,a.title);
    ps.forEach((p,k)=>{const t=el('button','tile'+(p.wide?' wide':''));t.type='button';t.style.backgroundImage=url(pic(p.image));t.setAttribute('aria-label','View larger: '+(p.alt||p.caption||a.title));if(p.caption)t.append(el('span','cap',p.caption));t.onclick=()=>lb(k);g.append(t)});
  }else{
    g.className='albums';
    d.albums.forEach(x=>{const cover=x.cover||(x.photos&&x.photos[0]&&x.photos[0].image);
      const c=el('a','album');c.href='gallery.html?album='+slug(x.title);
      const i=el('div','cover');if(cover)i.style.backgroundImage=url(pic(cover));
      const n=(x.photos||[]).length;
      c.append(i,el('h3','',x.title),el('span','count',n+(n===1?' photo':' photos')));g.append(c)});
  }
}).catch(()=>{}));

// Services: specials + pricing, each linked to the inquiry form
if($('#specials'))get('services').then(d=>{
  const sp=$('#specials');
  (d.specials||[]).forEach(x=>{const c=el('div','special');
    c.append(el('h3','',x.title),el('p','price',x.price),el('p','',x.description));
    if(x.dates){const s=el('p');s.append(el('small','',x.dates));c.append(s)}
    const a=el('a','btn book','Inquire about this');a.href=book(x.session,x.title);a.dataset.session=x.session;a.dataset.pkg=x.title;
    const w=el('p');w.style.marginTop='1rem';w.append(a);c.append(w);sp.append(c)});
  if(!(d.specials||[]).length)$('#specials-wrap').hidden=true;
  $('#travel').textContent=d.travel_note||'';
});

// Arrive from a services link: preselect session and package
const q=new URLSearchParams(location.search);prefill(q.get('session'),q.get('package'));

// Theme: colours and fonts from admin
const FONTS={'Classic serif':['Fraunces','Karla','Fraunces:opsz,wght@9..144,300;9..144,400','Karla:wght@400;700'],
'Modern clean':['Montserrat','Open Sans','Montserrat:wght@400;600','Open Sans:wght@400;700'],
'Elegant':['Cormorant Garamond','Lato','Cormorant+Garamond:wght@400;600','Lato:wght@400;700'],
'Editorial':['Playfair Display','Source Sans 3','Playfair+Display:wght@400;600','Source+Sans+3:wght@400;700'],
'Friendly':['DM Serif Display','DM Sans','DM+Serif+Display','DM+Sans:wght@400;700']};
// The pages load no fonts of their own: only the font style picked in the Theme is downloaded
// (Classic serif if none is set or the theme can't be read).
function useFonts(name){const f=FONTS[name]||FONTS['Classic serif'],r=document.documentElement.style;
  const l=document.createElement('link');l.rel='stylesheet';
  l.href='https://fonts.googleapis.com/css2?family='+f[2]+'&family='+f[3]+'&display=swap';loads.push(new Promise(ok=>{l.onload=l.onerror=ok}));document.head.append(l);
  r.setProperty('--head',"'"+f[0]+"'");r.setProperty('--body',"'"+f[1]+"'")}
loads.push(get('theme').then(t=>{
  const r=document.documentElement.style,hex=/^#[0-9a-f]{6}$/i;
  if(hex.test(t.background))r.setProperty('--paper',t.background);
  if(hex.test(t.text))r.setProperty('--ink',t.text);
  if(hex.test(t.accent)){r.setProperty('--accent',t.accent);
    const n=parseInt(t.accent.slice(1),16),L=(0.299*(n>>16)+0.587*(n>>8&255)+0.114*(n&255))/255;
    r.setProperty('--on-accent',L>0.6?'#111':'#fff')}
  useFonts(t.fonts);
}).catch(()=>useFonts()));

// Land on #anchor: the browser jumps to e.g. #contact before the albums and
// text above it have loaded, so it ends up in the gallery once they push it down.
// Re-scroll once everything has rendered, unless the visitor has scrolled meanwhile.
if(location.hash){
  let moved=false;const stop=()=>moved=true;
  ['wheel','touchmove','keydown'].forEach(e=>addEventListener(e,stop,{once:true,passive:true}));
  Promise.allSettled(loads).then(()=>Promise.allSettled(loads)).then(()=>document.fonts.ready).then(()=>{
    const t=document.getElementById(decodeURIComponent(location.hash.slice(1)));
    if(t&&!moved)t.scrollIntoView({behavior:'instant'})});
}
