// Small interactions for the portfolio — no libraries required.
const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];

// Living wallpaper: slow orbital ribbons, fine particles and a responsive pointer field.
(() => {
  const canvas = $('#liveWallpaper');
  if (!canvas || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  let w=0,h=0,dpr=1,t=0,mouse={x:-999,y:-999},dots=[];
  const dark=[['180,243,106'],['157,140,255'],['111,220,205']];
  const light=[['91,145,57'],['119,103,190'],['49,145,143']];
  function resize(){
    dpr=Math.min(devicePixelRatio||1,1.6);w=innerWidth;h=innerHeight;
    canvas.width=w*dpr;canvas.height=h*dpr;canvas.style.width=w+'px';canvas.style.height=h+'px';
    ctx.setTransform(dpr,0,0,dpr,0,0);
    const n=Math.min(90,Math.max(34,Math.floor(w*h/18000)));
    dots=Array.from({length:n},(_,i)=>({x:Math.random()*w,y:Math.random()*h,
      vx:(Math.random()-.5)*.2,vy:(Math.random()-.5)*.2,r:.5+Math.random()*1.2,p:Math.random()*6.28,c:i%3}));
  }
  function draw(){
    t+=.003;ctx.clearRect(0,0,w,h);
    const colors=document.body.classList.contains('light')?light:dark;
    // Three slow, flowing orbital lines.
    for(let b=0;b<3;b++){
      ctx.beginPath();
      for(let x=-20;x<w+20;x+=12){
        const y=h*(.2+b*.27)+Math.sin(x*.002+t*(1+b*.2)+b)* (62+b*15)+Math.cos(x*.004+t+b)*20;
        if(x===-20)ctx.moveTo(x,y);else ctx.lineTo(x,y);
      }
      ctx.strokeStyle=`rgba(${colors[b][0]},${document.body.classList.contains('light')?.12:.09})`;
      ctx.lineWidth=1;ctx.shadowBlur=18;ctx.shadowColor=`rgba(${colors[b][0]},.18)`;ctx.stroke();
    }
    ctx.shadowBlur=0;
    dots.forEach((p,i)=>{
      p.x+=p.vx+Math.sin(t*2+p.p)*.1;p.y+=p.vy+Math.cos(t*1.7+p.p)*.1;
      if(p.x<0)p.x=w;if(p.x>w)p.x=0;if(p.y<0)p.y=h;if(p.y>h)p.y=0;
      const dx=mouse.x-p.x,dy=mouse.y-p.y,d0=Math.hypot(dx,dy);
      if(d0<135&&d0>0){p.x-=dx/d0*(135-d0)*.002;p.y-=dy/d0*(135-d0)*.002;}
      for(let j=i+1;j<dots.length;j++){
        const q=dots[j],d=Math.hypot(p.x-q.x,p.y-q.y);
        if(d<105){ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(q.x,q.y);
          ctx.strokeStyle=`rgba(${colors[p.c][0]},${(1-d/105)*.17})`;ctx.lineWidth=.6;ctx.stroke();}
      }
      ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
      ctx.fillStyle=`rgba(${colors[p.c][0]},${document.body.classList.contains('light')?.32:.48})`;
      ctx.shadowBlur=8;ctx.shadowColor=`rgba(${colors[p.c][0]},.4)`;ctx.fill();ctx.shadowBlur=0;
    });
    requestAnimationFrame(draw);
  }
  addEventListener('resize',resize,{passive:true});
  addEventListener('pointermove',e=>{mouse.x=e.clientX;mouse.y=e.clientY},{passive:true});
  addEventListener('pointerleave',()=>{mouse.x=-999;mouse.y=-999});
  resize();draw();
})();


// Mobile navigation
const navLinks = $('#navLinks');
$('#menuToggle').addEventListener('click', () => navLinks.classList.toggle('open'));
$$('#navLinks a').forEach(link => link.addEventListener('click', () => navLinks.classList.remove('open')));

// Theme switch — remembers the visitor's choice and syncs the browser theme colour.
const themeToggle = $('#themeToggle');
const savedTheme = localStorage.getItem('gokul-portfolio-theme');
if (savedTheme === 'light') document.body.classList.add('light');
function syncThemeButton() {
  const light = document.body.classList.contains('light');
  themeToggle.textContent = light ? '☾' : '☼';
  themeToggle.setAttribute('aria-label', light ? 'Switch to dark mode' : 'Switch to light mode');
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', light ? '#f4f5f0' : '#090b12');
}
syncThemeButton();
themeToggle.addEventListener('click', () => {
  document.body.classList.toggle('light');
  localStorage.setItem('gokul-portfolio-theme', document.body.classList.contains('light') ? 'light' : 'dark');
  syncThemeButton();
});

// Filter projects
$$('.filter').forEach(button => button.addEventListener('click', () => {
  $$('.filter').forEach(item => item.classList.remove('active'));
  button.classList.add('active');
  const filter = button.dataset.filter;
  $$('.project-card').forEach(card => {
    card.classList.toggle('hidden', filter !== 'all' && card.dataset.category !== filter);
  });
}));

// Project detail popups — update these descriptions as projects progress.
const projectDetails = {
  mango: { type: 'SOFTWARE · WEB CONCEPT', title: 'MANGO — Local marketplace', description: 'A local-first marketplace concept intended to connect neighbourhood businesses with customers. The exploration includes storefront discovery, business onboarding and a commission model. This is a developing concept, not a launched marketplace.', status: 'STATUS: CONCEPT / EARLY DEVELOPMENT' },
  haptibraille: { type: 'HARDWARE · ACCESSIBILITY', title: 'HaptiBraille', description: 'An affordable communication-device concept focused on two-way interaction: Braille input translated into speech, with speech represented in a tactile-friendly format. The project explores accessible interaction and compact electronics.', status: 'STATUS: PROTOTYPING / EXPLORATION' },
  airmouse: { type: 'HARDWARE · EMBEDDED', title: "Goku's Air Mouse", description: 'An ESP32-based air-mouse experiment exploring Bluetooth device control, physical buttons and motion-based interaction. The build is being developed step by step, starting with reliable button input and connectivity.', status: 'STATUS: EXPERIMENT / IN PROGRESS' },
  atomberg: { type: 'PRODUCT CONCEPT · IOT', title: 'Adaptive wall fan', description: 'A smart wall-mounted fan concept that detects where people are positioned and directs airflow towards them. The broader idea also explores adjusting fan speed based on temperature and comfort.', status: 'STATUS: PRODUCT CONCEPT' },
  chargealarm: { type: 'PRODUCT CONCEPT · ELECTRONICS', title: 'Charge Alert', description: 'A compact charging-monitor concept intended to detect when a device reaches full charge and notify the user. The key design challenge is measuring charging behaviour safely and reliably.', status: 'STATUS: EARLY CONCEPT' }
};
const modal = $('#projectModal');
function openProject(key) {
  const item = projectDetails[key]; if (!item) return;
  $('#modalType').textContent = item.type;
  $('#modalTitle').textContent = item.title;
  $('#modalDescription').textContent = item.description;
  $('#modalStatus').textContent = item.status;
  modal.classList.add('open'); modal.setAttribute('aria-hidden', 'false'); document.body.style.overflow = 'hidden';
}
function closeProject() { modal.classList.remove('open'); modal.setAttribute('aria-hidden', 'true'); document.body.style.overflow = ''; }
$$('.project-card').forEach(card => card.addEventListener('click', () => openProject(card.dataset.project)));
$$('[data-close]').forEach(el => el.addEventListener('click', closeProject));
document.addEventListener('keydown', event => { if (event.key === 'Escape') closeProject(); });
$('#modalContact').addEventListener('click', closeProject);

// Reveal elements as they enter the viewport
const revealTargets = $$('.about-layout, .stats-row, .section-heading, .project-card, .skills-heading, .skill-group, .contact > *');
revealTargets.forEach(el => el.classList.add('reveal'));
const revealObserver = new IntersectionObserver(entries => entries.forEach(entry => {
  if (entry.isIntersecting) { entry.target.classList.add('visible'); revealObserver.unobserve(entry.target); }
}), { threshold: 0.12 });
revealTargets.forEach(el => revealObserver.observe(el));

// Animated pointer on devices with a mouse
const dot = $('.cursor-dot'), ring = $('.cursor-ring');
if (window.matchMedia('(pointer:fine)').matches) {
  let mouseX = 0, mouseY = 0, ringX = 0, ringY = 0;
  window.addEventListener('mousemove', event => { mouseX = event.clientX; mouseY = event.clientY; dot.style.left = mouseX + 'px'; dot.style.top = mouseY + 'px'; });
  function animateRing() { ringX += (mouseX - ringX) * .16; ringY += (mouseY - ringY) * .16; ring.style.left = ringX + 'px'; ring.style.top = ringY + 'px'; requestAnimationFrame(animateRing); }
  animateRing();
  $$('a, button, .project-card').forEach(el => { el.addEventListener('mouseenter', () => ring.classList.add('hover')); el.addEventListener('mouseleave', () => ring.classList.remove('hover')); });
}

// Contact email
const emailAddress = 'offc.gokul@gmail.com';
$('#copyEmail').addEventListener('click', async () => {
  try { await navigator.clipboard.writeText(emailAddress); $('#toast').textContent = 'Email copied!'; }
  catch { window.location.href = `mailto:${emailAddress}`; $('#toast').textContent = 'Opening your email app…'; }
  $('#toast').classList.add('show'); setTimeout(() => $('#toast').classList.remove('show'), 2200);
});

// Gentle magnetic hover effect on the main call-to-action
$$('.magnetic').forEach(button => {
  button.addEventListener('mousemove', event => { const r = button.getBoundingClientRect(); const x = (event.clientX - r.left - r.width / 2) * .12; const y = (event.clientY - r.top - r.height / 2) * .18; button.style.transform = `translate(${x}px, ${y}px)`; });
  button.addEventListener('mouseleave', () => button.style.transform = '');
});
