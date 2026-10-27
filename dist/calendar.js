(() => {
'use strict';
const puzzles=window.SOPHIE_PUZZLES;
const params=new URLSearchParams(location.search);
const showAnswers=params.get('answers')==='1';
const preview=params.get('preview')==='1'||showAnswers;
const key=preview?'summerSophiePreview2026':'summerSophie2026';
let state={opened:[],solved:[]},activeDay=0,lastDoor;
try{const saved=JSON.parse(localStorage.getItem(key));if(saved&&Array.isArray(saved.opened)&&Array.isArray(saved.solved))state={opened:saved.opened.filter(n=>Number.isInteger(n)&&n>=1&&n<=25),solved:saved.solved.filter(n=>Number.isInteger(n)&&n>=1&&n<=25)};}catch{}
const preparationKey='summerSophiePreparation2026';
let ready=[];
try { const saved=JSON.parse(localStorage.getItem(preparationKey)); if(Array.isArray(saved)) ready=[...new Set(saved.filter(n=>Number.isInteger(n)&&n>=1&&n<=25))]; } catch {}
let previewDay=25;
const calendar=document.getElementById('calendar'),modal=document.getElementById('puzzle');
function unlockedDay(now=new Date()){
 if(preview)return previewDay;
 const parts=Object.fromEntries(new Intl.DateTimeFormat('en-NZ',{timeZone:'Pacific/Auckland',year:'numeric',month:'numeric',day:'numeric'}).formatToParts(now).filter(p=>p.type!=='literal').map(p=>[p.type,Number(p.value)]));
 if(parts.year<2026||(parts.year===2026&&parts.month<12))return 0;
 if(parts.year>2026)return 25;
 return Math.min(parts.day,25);
}
function save(){try{localStorage.setItem(key,JSON.stringify(state));}catch{document.getElementById('status').textContent='Progress is kept for this visit. Your browser could not save it.';}}
function draw(){
 const available=unlockedDay();calendar.replaceChildren();
 if(showAnswers)drawPreparation();
 document.getElementById('progress').textContent=`${new Set(state.solved).size} / 25 solved`;
 document.getElementById('status').textContent=preview?'Preview mode · try any available door below.':available===0?'Your first little mystery arrives on 1 December.':available===25?'All twenty-five doors are ready. Merry Christmas, Sophie.':`It’s ${available} December. A new little mystery awaits.`;
 for(let day=1;day<=25;day++){
  const solved=state.solved.includes(day),opened=state.opened.includes(day)&&day<=available,locked=day>available;
  const cell=document.createElement('div');cell.className=`door${locked?' locked':''}${opened?' opened':''}${day===available?' today':''}`;
  const btn=document.createElement('button');btn.type='button';btn.setAttribute('aria-label',`${day} December — ${locked?'locked':solved?'solved':'open puzzle'}`);btn.setAttribute('aria-disabled',String(locked));
  btn.innerHTML=`<span class="inside"><strong>${solved?'✓':'✧'}</strong><span>${solved?'SOLVED':'A LITTLE MYSTERY'}</span></span><span class="door-face"><span class="ornament" aria-hidden="true">${day===25?'✦':day%3===0?'❋':'✧'}</span><span class="number">${day}</span><span class="door-label">${locked?'DECEMBER':solved?'SOLVED':'OPEN ME'}</span></span>`;
  btn.addEventListener('click',()=>{if(day>unlockedDay()){document.getElementById('status').textContent=`Door ${day} opens on ${day} December 2026.`;return;}lastDoor=day;cell.classList.add('opened');if(!state.opened.includes(day)){state.opened.push(day);save();}setTimeout(()=>show(day),matchMedia('(prefers-reduced-motion: reduce)').matches?0:450);});
  if(showAnswers){
   const caption=document.createElement('span');caption.className='host-door-answer';
   const number=document.createElement('span');number.textContent=day+'. ';
   const answer=document.createElement('span');answer.textContent=puzzles[day-1].answers[0];
   caption.append(number,answer);btn.append(caption);
  }
  cell.append(btn);calendar.append(cell);
 }
}
function show(day){if(day>unlockedDay())return;activeDay=day;const p=puzzles[day-1];document.getElementById('day-label').textContent=`${day} DECEMBER · ${day===25?'THE FINALE':'YOUR DAILY MYSTERY'}`;document.getElementById('puzzle-title').textContent=p.title;const q=document.getElementById('question');q.textContent=p.question;if(p.image){const img=document.createElement('img');img.src='assets/'+p.image;img.alt=p.alt;q.append(img);}document.getElementById('answer').value='';const done=state.solved.includes(day);document.getElementById('feedback').textContent=done?'Already solved. Nicely done, Sophie.':'';document.getElementById('feedback').className='success';document.getElementById('answer-form').hidden=done;if(showAnswers){const hint=document.createElement('span');hint.className='host-inline-answer';hint.textContent=' — '+p.answers[0];document.getElementById('day-label').append(hint);updateReadyButton();}modal.showModal();if(!done)document.getElementById('answer').focus();}
function close(){modal.close();}
document.getElementById('close').addEventListener('click',close);document.getElementById('back').addEventListener('click',close);
modal.addEventListener('close',()=>{draw();calendar.children[lastDoor-1]?.querySelector('button').focus();});
document.getElementById('answer-form').addEventListener('submit',event=>{event.preventDefault();if(activeDay>unlockedDay())return;const norm=s=>s.toLowerCase().trim().replace(/\s+/g,' ');const correct=puzzles[activeDay-1].answers.some(a=>norm(a)===norm(document.getElementById('answer').value));const feedback=document.getElementById('feedback');feedback.className=correct?'success':'wrong';feedback.textContent=correct?(activeDay===25?'Correct! Merry Christmas, Sophie. You found the treasure.':'Correct! Another little mystery unwrapped.'):'Not quite. Have another look — spelling counts.';if(correct){if(!state.solved.includes(activeDay))state.solved.push(activeDay);save();document.getElementById('answer-form').hidden=true;}});
if(preview){const bar=document.createElement('div');bar.className='preview';const label=document.createElement('label');label.textContent='Calendar preview · simulate date:';label.style.display='inline';const select=document.createElement('select');select.setAttribute('aria-label','Simulated December date');for(let d=0;d<=25;d++){const o=document.createElement('option');o.value=d;o.textContent=d===0?'Before December':`${d} December`;o.selected=d===25;select.append(o);}select.addEventListener('change',()=>{previewDay=Number(select.value);draw();});label.append(select);bar.append(label);document.body.prepend(bar);}
function drawPreparation(){
 const rail=document.getElementById('preparation-rail');if(!rail)return;
 const finished=ready.length===25;rail.hidden=finished;
 document.body.classList.toggle('has-preparation-rail',!finished);
 rail.replaceChildren();
 const heading=document.createElement('span');heading.className='preparation-label';heading.textContent='TO DO';rail.append(heading);
 for(let day=1;day<=25;day++){
  const done=ready.includes(day),button=document.createElement('button');button.type='button';button.className=done?'is-ready':'';
  button.textContent=String(day);button.setAttribute('aria-label','Puzzle '+day+(done?' — ready':' — needs preparation'));
  button.title='Puzzle '+day+(done?' — ready':' — needs preparation');button.addEventListener('click',()=>{lastDoor=day;show(day);});rail.append(button);
 }
}
function updateReadyButton(){
 const button=document.getElementById('mark-ready');if(!button)return;
 const done=ready.includes(activeDay);button.textContent=done?'✓ Ready — mark unfinished':'Mark puzzle ready';button.setAttribute('aria-pressed',String(done));
}
if(showAnswers){
 document.body.classList.add('host-review');
 const rail=document.createElement('aside');rail.id='preparation-rail';rail.className='preparation-rail';rail.setAttribute('aria-label','Puzzle preparation checklist');document.body.append(rail);
 const button=document.createElement('button');button.id='mark-ready';button.type='button';button.className='mark-ready';
 button.addEventListener('click',()=>{
  ready=ready.includes(activeDay)?ready.filter(n=>n!==activeDay):[...ready,activeDay];
  try{localStorage.setItem(preparationKey,JSON.stringify(ready));}catch{}
  updateReadyButton();drawPreparation();
 });document.getElementById('back').before(button);
}

draw();setInterval(draw,60000);
window.SophieCalendar={unlockedDay};
})();
