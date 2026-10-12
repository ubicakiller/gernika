(() => {
  const $ = (s) => document.querySelector(s), scene = $('#scene'), canvas = $('#fallback'), ctx = canvas.getContext('2d');
  let stage = 0, eventIndex = 0, angle = -.35, dragging = false, lastX = 0, paused = matchMedia('(prefers-reduced-motion: reduce)').matches, clock = 0, previous = performance.now();
  const scenes = ['Улицы, дома, повседневная жизнь. Город до катастрофы.', 'Самолёты, дым и огонь. Условное изображение налёта.', 'Разрушенные кварталы. Люди пережили налёт, но потеряли свой дом.'];
  const events = [
    ['26 АПРЕЛЯ · ДО НАЛЁТА', 'Обычный понедельник', 'Рыночный день в городе, рядом с которым шла война. Люди ещё не знали, что через несколько часов привычные улицы будут разрушены.', 0],
    ['26 АПРЕЛЯ · 16:20', 'Первые бомбы', 'По хронологии Музея мира, первые бомбы падают около 16:20. Звучит тревога. Жители спешат в укрытия.', 1],
    ['26 АПРЕЛЯ · ДНЕВНЫЕ ЧАСЫ', 'Атаки идут волнами', 'Бомбардировщики сбрасывают фугасные и зажигательные бомбы. Истребители обстреливают город. Возникают пожары; улицы становятся опасными.', 1],
    ['26 АПРЕЛЯ · 19:40', 'Самолёты уходят. Огонь остаётся.', 'Музей мира указывает 19:40 как время окончания бомбардировки. Налёт продолжался более трёх часов. Пожары не удавалось потушить несколько дней.', 2],
    ['ПОСЛЕ 26 АПРЕЛЯ', 'Герника становится свидетельством', 'Разрушения меняют жизнь города. Сообщения о катастрофе распространяются за пределы Испании. Вскоре Пикассо начнёт работу над картиной, которая сохранит название Герники в мировой памяти.', 2]
  ];
  canvas.hidden = false;
  function polygon(points, color) { ctx.beginPath(); points.forEach(([x,y],i) => i ? ctx.lineTo(x,y) : ctx.moveTo(x,y)); ctx.closePath(); ctx.fillStyle=color; ctx.fill(); }
  function project(x,z,y=0) { const c=Math.cos(angle), s=Math.sin(angle), rx=x*c-z*s, rz=x*s+z*c; return [rx-rz,(rx+rz)*.49-y]; }
  function render() {
    const w=scene.clientWidth,h=scene.clientHeight;if(!w||!h)return;const r=Math.min(devicePixelRatio||1,2);
    if(canvas.width!==Math.round(w*r)||canvas.height!==Math.round(h*r)){canvas.width=Math.round(w*r);canvas.height=Math.round(h*r)}
    ctx.setTransform(r,0,0,r,0,0);ctx.clearRect(0,0,w,h);const scale=Math.min(w/26,h/14.8);ctx.save();ctx.translate(w/2,h/2+4);ctx.scale(scale,scale);
    polygon([[-9,-6],[9,-6],[9,6],[-9,6]].map(([x,z])=>project(x,z)),'#c8c5b8');
    ctx.strokeStyle='#a9aa9c';ctx.lineWidth=.035;for(let v=-5;v<=5;v+=2.5){ctx.beginPath();ctx.moveTo(...project(v,-6));ctx.lineTo(...project(v,6));ctx.moveTo(...project(-9,v));ctx.lineTo(...project(9,v));ctx.stroke()}
    const houses=[];for(let z=-5;z<=4;z+=2.5)for(let x=-7;x<=6;x+=2.7){if(Math.abs(x)<1.7&&Math.abs(z)<1.5)continue;const seed=Math.abs(Math.round(x*7+z*11));houses.push({x,z,seed,h:1.1+(seed%4)*.22})}houses.sort((a,b)=>a.x+a.z-b.x-b.z);
    houses.forEach(({x,z,seed,h})=>{const ruined=stage===2&&seed%4!==0,bw=1.65,bd=1.55,height=ruined?.34:h,cs=[[x,z],[x+bw,z],[x+bw,z+bd],[x,z+bd]],base=cs.map(([a,b])=>project(a,b)),top=cs.map(([a,b])=>project(a,b,height));
      polygon([base[1],base[2],top[2],top[1]],ruined?'#70736a':'#bbb9aa');polygon([base[2],base[3],top[3],top[2]],ruined?'#88897e':'#d8d3c3');
      if(!ruined){const ra=project(x+.25,z+.75,height+.48),rb=project(x+1.4,z+.75,height+.48);polygon([top[0],top[1],rb,ra],'#986f59');polygon([top[2],top[3],ra,rb],'#ac8065');for(let j=0;j<2;j++){const p=project(x+.42+j*.76,z+bd,height*.55);polygon([[p[0]-.11,p[1]],[p[0]+.11,p[1]],[p[0]+.11,p[1]+.2],[p[0]-.11,p[1]+.2]],'#777b70')}}
      if(stage===1&&seed%3===0){const [fx,fy]=project(x+.7,z+.7,height+.45+Math.sin(clock*5+seed)*.13);polygon([[fx,fy-.6],[fx+.2,fy],[fx,fy+.13],[fx-.2,fy]],'#b74d2c')}
      if(stage!==0&&seed%4===1){const [sx,sy]=project(x+.8,z+.7,height+.9+(clock*.3+seed%5)%1.2);ctx.globalAlpha=stage===1?.3:.14;ctx.fillStyle='#66685f';ctx.beginPath();ctx.arc(sx,sy,.3,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1}
    });
    const [tx,ty]=project(5.2,-4.2,.65);ctx.strokeStyle='#756d54';ctx.lineWidth=.17;ctx.beginPath();ctx.moveTo(tx,ty);ctx.lineTo(tx,ty-1.1);ctx.stroke();ctx.fillStyle='#78836b';ctx.beginPath();ctx.arc(tx,ty-1.34,.5,0,Math.PI*2);ctx.fill();
    if(stage===1){ctx.strokeStyle='#484a43';ctx.lineWidth=.12;const x=-2+(clock*1.5%4),y=-4.1;ctx.beginPath();ctx.moveTo(x-.35,y);ctx.lineTo(x,y-.13);ctx.lineTo(x+.35,y);ctx.stroke()}
    ctx.restore();
  }
  function setStage(value){stage=value;document.querySelectorAll('[data-stage]').forEach(b=>{const on=Number(b.dataset.stage)===value;b.classList.toggle('active',on);b.setAttribute('aria-pressed',String(on))});$('#scene-state').textContent=['01 / ДО НАЛЁТА','02 / НАЛЁТ','03 / ПОСЛЕ'][value];$('#scene-caption').textContent=scenes[value];render()}
  function setEvent(index){eventIndex=index;const [time,title,body,which]=events[index];$('#event-number').textContent=String(index+1).padStart(2,'0');$('#event-time').textContent=time;$('#event-title').textContent=title;$('#event-body').textContent=body;$('#next').textContent=index===4?'К первому эпизоду ↺':'Следующий эпизод →';document.querySelectorAll('[data-event]').forEach(b=>{const on=Number(b.dataset.event)===index;b.classList.toggle('selected',on);b.setAttribute('aria-pressed',String(on))});setStage(which)}
  document.querySelectorAll('[data-stage]').forEach(b=>b.addEventListener('click',()=>setStage(Number(b.dataset.stage))));document.querySelectorAll('[data-event]').forEach(b=>b.addEventListener('click',()=>setEvent(Number(b.dataset.event))));$('#next').addEventListener('click',()=>setEvent((eventIndex+1)%events.length));
  $('#motion').addEventListener('click',()=>{paused=!paused;document.body.classList.toggle('motion-off',paused);$('#motion').textContent=paused?'Анимация: выкл.':'Анимация: вкл.';$('#motion').setAttribute('aria-pressed',String(paused))});
  $('#left').addEventListener('click',()=>{angle-=.35;render()});$('#right').addEventListener('click',()=>{angle+=.35;render()});$('#reset').addEventListener('click',()=>{angle=-.35;render()});
  scene.addEventListener('pointerdown',e=>{dragging=true;lastX=e.clientX;scene.setPointerCapture(e.pointerId)});scene.addEventListener('pointermove',e=>{if(dragging){angle+=(e.clientX-lastX)*.008;lastX=e.clientX;render()}});scene.addEventListener('pointerup',()=>dragging=false);scene.addEventListener('pointercancel',()=>dragging=false);
  addEventListener('scroll',()=>{const n=document.documentElement.scrollHeight-innerHeight;$('#progress').style.width=`${n>0?scrollY/n*100:0}%`},{passive:true});
  if(!paused&&'IntersectionObserver'in window){const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');observer.unobserve(e.target)}}),{threshold:.12});document.querySelectorAll('.reveal').forEach(e=>observer.observe(e));document.body.classList.add('js-motion')}
  new ResizeObserver(render).observe(scene);render();
  function animate(now){const dt=Math.min((now-previous)/1000,.05);previous=now;if(!paused&&document.visibilityState==='visible'){clock+=dt;render()}requestAnimationFrame(animate)}requestAnimationFrame(animate);
})();
