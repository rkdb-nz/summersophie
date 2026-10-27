(() => {
'use strict';
const puzzles=window.SOPHIE_PUZZLES;
const params=new URLSearchParams(location.search);
const showAnswers=params.get('answers')==='1';
const preview=params.get('preview')==='1'||showAnswers;
const key=preview?'summerSophiePreview2026':'summerSophie2026';
let state={opened:[],solved:[]},activeDay=0,lastDoor;
try{const saved=JSON.parse(localStorage.getItem(key));if(saved&&Array.isArray(saved.opened)&&Array.isArray(saved.solved))state={opened:saved.opened.filter(n=>Number.isInteger(n)&&n>=1&&n<=25),solved:saved.solved.filter(n=>Number.isInteger(n)&&n>=1&&n<=25)};}catch{}
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
 document.getElementById('progress').textContent=`${new Set(state.solved).size} / 25 solved`;
 document.getElementById('status').textContent=preview?'Preview mode · try any available door below.':available===0?'Your first little mystery arrives on 1 December.':available===25?'All twenty-five doors are ready. Merry Christmas, Sophie.':`It’s ${available} December. A new little mystery awaits.`;
 for(let day=1;day<=25;day++){
  const solved=state.solved.includes(day),opened=state.opened.includes(day)&&day<=available,locked=day>available;
  const cell=document.createElement('div');cell.className=`door${locked?' locked':''}${opened?' opened':''}${day===available?' today':''}`;
  const btn=document.createElement('button');btn.type='button';btn.setAttribute('aria-label',`${day} December — ${locked?'locked':solved?'solved':'open puzzle'}`);btn.setAttribute('aria-disabled',String(locked));
  btn.innerHTML=`<span class="inside"><strong>${solved?'✓':'✧'}</strong><span>${solved?'SOLVED':'A LITTLE MYSTERY'}</span></span><span class="door-face"><span class="ornament" aria-hidden="true">${day===25?'✦':day%3===0?'❋':'✧'}</span><span class="number">${day}</span><span class="door-label">${locked?'DECEMBER':solved?'SOLVED':'OPEN ME'}</span></span>`;
  btn.addEventListener('click',()=>{if(day>unlockedDay()){document.getElementById('status').textContent=`Door ${day} opens on ${day} December 2026.`;return;}lastDoor=day;cell.classList.add('opened');if(!state.opened.includes(day)){state.opened.push(day);save();}setTimeout(()=>show(day),matchMedia('(prefers-reduced-motion: reduce)').matches?0:450);});
  cell.append(btn);calendar.append(cell);
 }
}
function show(day){if(day>unlockedDay())return;activeDay=day;const p=puzzles[day-1];document.getElementById('day-label').textContent=`${day} DECEMBER · ${day===25?'THE FINALE':'YOUR DAILY MYSTERY'}`;document.getElementById('puzzle-title').textContent=p.title;const q=document.getElementById('question');q.textContent=p.question;if(p.image){const img=document.createElement('img');img.src='assets/'+p.image;img.alt=p.alt;q.append(img);}document.getElementById('answer').value='';const done=state.solved.includes(day);document.getElementById('feedback').textContent=done?'Already solved. Nicely done, Sophie.':'';document.getElementById('feedback').className='success';document.getElementById('answer-form').hidden=done;modal.showModal();if(!done)document.getElementById('answer').focus();}
function close(){modal.close();}
document.getElementById('close').addEventListener('click',close);document.getElementById('back').addEventListener('click',close);
modal.addEventListener('close',()=>{draw();calendar.children[lastDoor-1]?.querySelector('button').focus();});
document.getElementById('answer-form').addEventListener('submit',event=>{event.preventDefault();if(activeDay>unlockedDay())return;const norm=s=>s.toLowerCase().trim().replace(/\s+/g,' ');const correct=puzzles[activeDay-1].answers.some(a=>norm(a)===norm(document.getElementById('answer').value));const feedback=document.getElementById('feedback');feedback.className=correct?'success':'wrong';feedback.textContent=correct?(activeDay===25?'Correct! Merry Christmas, Sophie. You found the treasure.':'Correct! Another little mystery unwrapped.'):'Not quite. Have another look — spelling counts.';if(correct){if(!state.solved.includes(activeDay))state.solved.push(activeDay);save();document.getElementById('answer-form').hidden=true;}});
if(preview){const bar=document.createElement('div');bar.className='preview';const label=document.createElement('label');label.textContent='Calendar preview · simulate date:';label.style.display='inline';const select=document.createElement('select');select.setAttribute('aria-label','Simulated December date');for(let d=0;d<=25;d++){const o=document.createElement('option');o.value=d;o.textContent=d===0?'Before December':`${d} December`;o.selected=d===25;select.append(o);}select.addEventListener('change',()=>{previewDay=Number(select.value);draw();});label.append(select);bar.append(label);document.body.prepend(bar);}
if(showAnswers){
 const list=document.createElement('details');list.className='answer-list';list.style.cssText='max-width:1144px;margin:24px auto;padding:22px;background:#fffdf5;border:2px solid #aa492e;border-radius:4px;';
 const summary=document.createElement('summary');summary.textContent='Host answer list — all 25 puzzles';summary.style.cssText='font-size:20px;font-weight:700;cursor:pointer;';list.append(summary);
 const note=document.createElement('p');note.textContent='Host review copy. This list contains spoilers. Preview progress is separate from the normal calendar.';list.append(note);
 const ol=document.createElement('ol');ol.style.cssText='line-height:1.8;padding-left:28px;';puzzles.forEach((p,i)=>{const li=document.createElement('li');const title=document.createElement('strong');title.textContent=p.title+': ';li.append(title,document.createTextNode(p.answers.join(' / ')));ol.append(li);});list.append(ol);list.open=true;document.querySelector('main').prepend(list);
}
draw();setInterval(draw,60000);
window.SophieCalendar={unlockedDay};
})();
