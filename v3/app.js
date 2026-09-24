'use strict';
const $=id=>document.getElementById(id), DB='pm3_emergency_v1';
// Asynchronous in-app confirmation. Escape and closing the dialog always cancel.
function askConfirmation(message,{title='Bitte bestätigen',ok='Bestätigen',danger=false}={}){
 return new Promise(resolve=>{
  const dialog=$('confirmDialog'),yes=$('confirmDialogOk'),no=$('confirmDialogCancel');
  $('confirmDialogTitle').textContent=title;$('confirmDialogText').textContent=message;
  yes.textContent=ok;yes.classList.toggle('danger',danger);yes.classList.toggle('secondary',!danger);
  const finish=()=>{dialog.removeEventListener('close',finish);yes.onclick=null;no.onclick=null;resolve(dialog.returnValue==='ok');};
  dialog.addEventListener('close',finish,{once:true});dialog.returnValue='cancel';
  yes.onclick=()=>dialog.close('ok');no.onclick=()=>dialog.close('cancel');
  dialog.showModal();no.focus();
 });
}
// Shared masked master-password dialog for verification, import and synchronization.
function askMasterPassword(title){
 return new Promise(resolve=>{
  const dialog=$('passwordDialog'),form=$('passwordDialogForm'),input=$('passwordDialogInput'),eye=$('passwordDialogEye');
  $('passwordDialogTitle').textContent=title;input.value='';input.type='password';eye.setAttribute('aria-pressed','false');eye.setAttribute('aria-label','Passwort anzeigen');eye.title='Passwort anzeigen';
  const finish=()=>{const answer=dialog.returnValue==='ok'?input.value:null;input.value='';input.type='password';eye.setAttribute('aria-pressed','false');eye.setAttribute('aria-label','Passwort anzeigen');eye.title='Passwort anzeigen';dialog.removeEventListener('close',finish);resolve(answer);};
  dialog.addEventListener('close',finish,{once:true});dialog.returnValue='cancel';dialog.showModal();input.focus();
 });
}
$('passwordDialogCancel').onclick=()=>{$('passwordDialog').close('cancel');};
$('passwordDialogEye').onclick=()=>{const input=$('passwordDialogInput'),eye=$('passwordDialogEye'),show=input.type==='password';input.type=show?'text':'password';eye.setAttribute('aria-pressed',String(show));eye.setAttribute('aria-label',show?'Passwort verbergen':'Passwort anzeigen');eye.title=show?'Passwort verbergen':'Passwort anzeigen';};
$('passwordDialogForm').addEventListener('submit',e=>{e.preventDefault();$('passwordDialog').close('ok');});

let s=null,pending=null,mode='',busy=false,edit=-1,lockedSession=null,locking=false,lastActivity=Date.now(),pendingMaster=null;
const lockOptions=new Set([0,1,5,10,15,30]);
let lockMinutes=Number(localStorage.getItem('vault_lock_minutes'));if(!lockOptions.has(lockMinutes))lockMinutes=5;
let noticeTimer=null;
function note(message,kind){
 const box=$('notice');
 clearTimeout(noticeTimer);
 const value=String(message||'');
 if(!value){box.classList.add('hidden');$('noticeText').textContent='';return;}
 // Existing calls use note(text); classify clear failures and warnings without changing vault logic.
 if(!kind){
   kind=/fehlgeschlagen|fehler|nicht möglich|nicht verfügbar|ungültig|falsch|ACHTUNG|WARNUNG|NICHT gespeichert|Nicht bestätigt:|konnte nicht|fehlt\.|bitte mindestens|bitte ein anderes|nicht automatisch übernommen|nicht bestätigt:|nicht ausgewählt/i.test(value)?'error':
        /erfolgreich|entsperrt\.|kopiert\.|geprüft\.|übernommen\.|aktiviert\.|deaktiviert\.|erzeugt\.|gesichert\./i.test(value)?'success':'info';
 }
 box.className='toast-'+kind;
 box.setAttribute('role',kind==='error'?'alert':'status');
 box.setAttribute('aria-live',kind==='error'?'assertive':'polite');
 $('noticeText').textContent=value;
 noticeTimer=setTimeout(()=>{box.classList.add('hidden');$('noticeText').textContent='';},kind==='error'?7000:kind==='success'?3000:4000);
}
$('noticeClose').onclick=()=>{clearTimeout(noticeTimer);$('notice').classList.add('hidden');$('noticeText').textContent='';};
function view(id){if(id!=='vault'&&typeof syncClose==='function')syncClose();for(const n of ['home','unlock','vault','locked'])$(n).classList.toggle('hidden',n!==id);}
function uuid(){return crypto.randomUUID();}
function parseEntries(v){if(!Array.isArray(v)||!v.every(e=>e&&['url','username','password'].every(k=>typeof e[k]==='string')))throw Error('Ungültiges Tresorformat');return v.map(e=>({...e}));}
function parsePayload(t){const v=JSON.parse(t);if(Array.isArray(v))return {id:null,entries:parseEntries(v)};if(v&&v.schema===3&&typeof v.id==='string'&&v.id.length>15)return {id:v.id,entries:parseEntries(v.entries)};throw Error('Unbekanntes Tresorformat');}
// Older vault entries have no reliable historical timestamps; leave them unknown.
function entryTime(value){return Number.isSafeInteger(value)&&value>0&&value<=Date.now()+86400000?value:null;}
function normalizedEntry(entry){const e={...entry};if(!entryTime(e.createdAt))delete e.createdAt;if(!entryTime(e.updatedAt))delete e.updatedAt;return e;}
function comparableEntry(entry){const {createdAt,updatedAt,...data}=entry;return JSON.stringify(data);}
function payload(){return JSON.stringify({schema:3,id:s.id,entries:s.entries});}
function openDb(){return new Promise((ok,no)=>{const r=indexedDB.open(DB,1);r.onupgradeneeded=()=>r.result.createObjectStore('drafts',{keyPath:'id'});r.onsuccess=()=>ok(r.result);r.onerror=()=>no(r.error);});}
async function dbCall(mode,fn){const db=await openDb();try{return await new Promise((ok,no)=>{const tx=db.transaction('drafts',mode),req=fn(tx.objectStore('drafts'));req.onsuccess=()=>ok(req.result);req.onerror=()=>no(req.error);tx.onabort=()=>no(tx.error);});}finally{db.close();}}
const getDraft=id=>dbCall('readonly',s=>s.get(id));
const allDrafts=()=>dbCall('readonly',s=>s.getAll());
const putDraft=d=>dbCall('readwrite',s=>s.put(d));
const delDraft=id=>dbCall('readwrite',s=>s.delete(id));
async function hash(raw){const h=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(raw));return Array.from(new Uint8Array(h),b=>b.toString(16).padStart(2,'0')).join('');}
async function encrypted(){return JSON.stringify(await PasswordCrypto.encrypt(payload(),s.key,s.salt));}
async function draftNow(){if(!s.dirty)return;const raw=await encrypted();await putDraft({id:s.id,raw,baseHash:s.baseHash,baseRaw:s.baseRaw,created:Date.now()});s.recovery=true;}
function status(){if(!s)return;const badge=$('saveBadge'),pendingExport=!!s.exportPending&&s.dirty;badge.classList.toggle('hidden',!s.dirty&&!s.confirmedSave);badge.classList.toggle('saved',!s.dirty&&!!s.confirmedSave);badge.classList.toggle('unsaved',s.dirty&&!pendingExport);badge.classList.toggle('pending',pendingExport);badge.textContent=s.dirty?(pendingExport?'Nicht bestätigt':'Nicht gespeichert'):'Gespeichert';$('entryCount').textContent=s.entries.length+' '+(s.entries.length===1?'Eintrag':'Einträge');$('state').textContent=pendingMaster?'Neuer Master-Schlüssel: .enc-Datei zum Download angeboten. Bitte die heruntergeladene Datei mit „.enc prüfen“ und dem NEUEN Master-Passwort bestätigen. Bis dahin bleibt das bisherige Master-Passwort für diese Sitzung gültig und der gespeicherte Sitzung erhalten.':pendingExport?'Aktualisierte .enc-Datei exportiert. Bitte die heruntergeladene Datei mit „.enc prüfen“ auswählen. '+(s.recovery?'gespeicherte Sitzung bleibt bis zur Prüfung erhalten.':'gespeicherte Sitzung nicht verfügbar.'):(s.dirty?'Änderungen noch nicht in der .enc-Datei gespeichert. '+(s.recovery?'gespeicherte Sitzung vorhanden.':'Keine Sitzungswiederherstellung verfügbar.'):(s.confirmedSave?'Aktueller Tresorstand in einer geprüften .enc-Datei bestätigt.':'Keine ungespeicherten Änderungen.'));$('verifyExport').classList.remove('hidden');$('save').classList.toggle('hidden',!s.handle);$('changeMaster').disabled=false;$('changeMaster').title='Master-Passwortänderung öffnen (direkt speichern oder exportieren und prüfen)';const confirmed=!s.dirty&&!!s.confirmedSave&&!pendingMaster;const closeButton=$('discard');closeButton.textContent=confirmed?'Tresor schließen':'🗑 Ohne Speichern schließen';closeButton.classList.toggle('secondary',confirmed);closeButton.classList.toggle('danger',!confirmed);}
function clearEdit(){edit=-1;for(const k of ['username','password','url'])$(k).value='';setFormPasswordVisible(false);$('entryForm').classList.add('hidden');}
const icons={copy:'<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/>',eye:'<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>',eyeOff:'<path d="m3 3 18 18M10.6 5.1A11 11 0 0 1 12 5c6.5 0 10 7 10 7a15 15 0 0 1-3.3 4.2M6.3 6.3C3.5 8.2 2 12 2 12s3.5 7 10 7c1.8 0 3.4-.5 4.7-1.3"/>',more:'<circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/>'};
function svg(name){return '<svg class="action-icon" viewBox="0 0 24 24" aria-hidden="true">'+icons[name]+'</svg>';}
function iconButton(name,title,action){const b=document.createElement('button');b.type='button';b.className='icon-button';b.title=title;b.setAttribute('aria-label',title);b.innerHTML=svg(name);b.onclick=action;return b;}
async function copyValue(value,label){try{await navigator.clipboard.writeText(value);note(label+' kopiert.');}catch(e){note('Kopieren nicht möglich: '+e.message);}}
function siteMark(e){let name=e.url||e.title||'';try{if(e.url)name=new URL(e.url.includes('://')?e.url:'https://'+e.url).hostname.replace(/^www\./,'');}catch{}return (name.split('.')[0]||'?').slice(0,2).toUpperCase();}
function render(){if(!s)return;const root=$('entries');root.replaceChildren();const query=$('search').value.trim().toLocaleLowerCase();const sorted=s.entries.map((e,i)=>({e,i})).filter(({e})=>(e.title+' '+e.url+' '+e.username).toLocaleLowerCase().includes(query)).sort((a,b)=>{const mode=$('sort').value;if(mode==='recentAdded'||mode==='recentChanged'){const field=mode==='recentAdded'?'createdAt':'updatedAt',x=entryTime(a.e[field]),y=entryTime(b.e[field]);if(x!==null&&y!==null&&x!==y)return y-x;if(x!==null&&y===null)return -1;if(x===null&&y!==null)return 1;return a.i-b.i;}const x=a.e.title||a.e.url||'',y=b.e.title||b.e.url||'';return x.localeCompare(y,'de')*(mode==='za'?-1:1);});for(const {e,i} of sorted){const row=document.createElement('article');row.className='entry';if($('showIcons').checked){const mark=document.createElement('span');mark.className='site-mark';mark.textContent=siteMark(e);mark.setAttribute('aria-hidden','true');row.append(mark);}const main=document.createElement('div');main.className='entry-main';const header=document.createElement('div');header.className='entry-header';const name=document.createElement('h3');name.textContent=e.title||e.url||'(Ohne Bezeichnung)';header.append(name);const menu=document.createElement('details');menu.className='entry-menu';const summary=document.createElement('summary');summary.title='Weitere Aktionen';summary.setAttribute('aria-label','Weitere Aktionen für '+name.textContent);summary.innerHTML=svg('more');const menuContent=document.createElement('div');menuContent.className='entry-menu-content';const change=document.createElement('button');change.type='button';change.textContent='✎ Bearbeiten';change.onclick=()=>{edit=i;$('username').value=e.username;$('password').value=e.password;$('url').value=e.url;$('formTitle').textContent='Eintrag bearbeiten';setFormPasswordVisible(false);$('entryForm').classList.remove('hidden');menu.open=false;$('entryForm').scrollIntoView({block:'nearest'});};const remove=document.createElement('button');remove.type='button';remove.className='danger';remove.textContent='🗑 Löschen';remove.onclick=async()=>{menu.open=false;if(!await askConfirmation('Eintrag „'+name.textContent+'“ löschen?',{title:'Eintrag löschen',ok:'Eintrag löschen',danger:true}))return;const old=s.entries;s.entries=old.filter((_,j)=>j!==i);clearEdit();await changed(old);};menuContent.append(change,remove);menu.append(summary,menuContent);menu.addEventListener('toggle',()=>{if(!menu.open)return;document.querySelectorAll('.entry-menu[open]').forEach(other=>{if(other!==menu)other.open=false;});const anchor=summary.getBoundingClientRect();const width=menuContent.offsetWidth;const height=menuContent.offsetHeight;const left=Math.max(8,Math.min(anchor.right-width,window.innerWidth-width-8));const below=anchor.bottom+4;const above=anchor.top-height-4;menuContent.style.left=left+'px';menuContent.style.top=(below+height<=window.innerHeight-8||above<8?Math.min(below,window.innerHeight-height-8):above)+'px';});header.append(menu);main.append(header);const user=document.createElement('div');user.className='detail-row';const userText=document.createElement('span');userText.className='detail-text';userText.textContent='Benutzername: '+e.username;user.append(userText,iconButton('copy','Benutzername kopieren',()=>copyValue(e.username,'Benutzername')));main.append(user);const pass=document.createElement('div');pass.className='detail-row';const passText=document.createElement('span');passText.className='detail-text';let visible=false;passText.textContent='Passwort: ••••••••';const eye=iconButton('eye','Passwort anzeigen',()=>{visible=!visible;passText.textContent='Passwort: '+(visible?e.password:'••••••••');eye.innerHTML=svg(visible?'eyeOff':'eye');eye.title=visible?'Passwort verbergen':'Passwort anzeigen';eye.setAttribute('aria-label',eye.title);eye.setAttribute('aria-pressed',String(visible));});eye.setAttribute('aria-pressed','false');const passwordWithEye=document.createElement('span');passwordWithEye.className='password-with-eye';passwordWithEye.append(passText,eye);pass.append(passwordWithEye,iconButton('copy','Passwort kopieren',()=>copyValue(e.password,'Passwort')));main.append(pass);row.append(main);root.append(row);}status();}
$('search').oninput=()=>{if(s)render();};$('sort').onchange=()=>{if(s)render();};$('showIcons').onchange=()=>{if(s)render();};$('newEntry').onclick=()=>{clearEdit();$('formTitle').textContent='Neues Passwort';$('entryForm').classList.remove('hidden');$('entryForm').scrollIntoView({block:'nearest'});};
async function changed(old){if(!syncApplying)syncClose();pendingMaster=null;s.dirty=true;s.recovery=false;s.exportPending=false;try{await draftNow();note('Änderung verschlüsselt für die Sitzungswiederherstellung gesichert. Bitte .enc-Datei speichern.');}catch(e){note('ACHTUNG: gespeicherte Sitzung konnte nicht gespeichert werden: '+e.message+' · Änderungen existieren nur in dieser Sitzung.');}render();}
// The home page only lists structurally usable encrypted recovery records.
// Decryption and matching the selected vault are checked when opening a draft/file.
function usableDraft(d){
 if(!d||typeof d.id!=='string'||d.id.length<=15||typeof d.raw!=='string'||!d.raw||!Number.isFinite(d.created))return false;
 try{const encrypted=JSON.parse(d.raw);return encrypted&&typeof encrypted==='object'&&!Array.isArray(encrypted);}catch{return false;}
}
function closeDraftUnlock(){
 document.querySelectorAll('#drafts .draft-unlock').forEach(form=>{
  form.classList.add('hidden');const input=form.querySelector('input');if(input){input.value='';input.type='password';}
  const eye=form.querySelector('.master-eye');if(eye){eye.setAttribute('aria-pressed','false');eye.setAttribute('aria-label','Passwort anzeigen');eye.title='Passwort anzeigen';eye.querySelector('svg').innerHTML=icons.eye;}
 });
 document.querySelectorAll('#drafts .draft-resume').forEach(button=>button.setAttribute('aria-expanded','false'));
 if(mode==='draft'){pending=null;mode='';}
}
async function listDrafts(){
 const root=$('drafts'),panel=$('homeRecovery');root.replaceChildren();panel.classList.add('hidden');
 try{
  const drafts=(await allDrafts()).filter(usableDraft);
  if(!drafts.length)return;
  for(const d of drafts){
   const row=document.createElement('div');row.className='draft-row';
   const title=document.createElement('span');title.textContent='Nicht gespeicherte Sitzung '+d.id.slice(0,8)+' · '+new Date(d.created).toLocaleString();
   const resume=document.createElement('button');resume.textContent='Sitzung fortsetzen';
   resume.className='draft-resume';resume.type='button';resume.setAttribute('aria-expanded','false');
   const form=document.createElement('div');form.className='draft-unlock hidden';form.id='draftUnlock-'+d.id.replace(/[^a-zA-Z0-9_-]/g,'');resume.setAttribute('aria-controls',form.id);
   const label=document.createElement('label');label.textContent='Master-Passwort für diese Sitzung';
   const wrap=document.createElement('div');wrap.className='master-password-wrap';
   const input=document.createElement('input');input.type='password';input.autocomplete='off';input.id='draftMaster-'+d.id.replace(/[^a-zA-Z0-9_-]/g,'');label.htmlFor=input.id;
   const eye=document.createElement('button');eye.type='button';eye.className='master-eye';eye.setAttribute('aria-label','Passwort anzeigen');eye.setAttribute('aria-pressed','false');eye.title='Passwort anzeigen';eye.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true">'+icons.eye+'</svg>';
   eye.onclick=()=>{const visible=input.type==='password';input.type=visible?'text':'password';eye.setAttribute('aria-pressed',String(visible));eye.setAttribute('aria-label',visible?'Passwort verbergen':'Passwort anzeigen');eye.title=visible?'Passwort verbergen':'Passwort anzeigen';eye.querySelector('svg').innerHTML=icons[visible?'eyeOff':'eye'];};
   wrap.append(input,eye);
   const actions=document.createElement('div');actions.className='action-row';
   const go=document.createElement('button');go.type='button';go.textContent='Sitzung fortsetzen';
   go.onclick=()=>{pending={kind:'draft',draft:d};mode='draft';$('unlockGo').click();};
   const cancel=document.createElement('button');cancel.type='button';cancel.className='secondary';cancel.textContent='Abbrechen';cancel.onclick=closeDraftUnlock;
   input.addEventListener('keydown',e=>{if(e.key==='Enter')go.click();});
   actions.append(go,cancel);form.append(label,wrap,actions);
   resume.onclick=()=>{const opening=form.classList.contains('hidden');closeDraftUnlock();if(!opening)return;closeOpen();closeCreate();pending={kind:'draft',draft:d};mode='draft';form.classList.remove('hidden');resume.setAttribute('aria-expanded','true');input.focus();};
   const del=document.createElement('button');del.className='secondary';del.textContent='Sitzung verwerfen';
   del.onclick=async()=>{if(!await askConfirmation('Diese verschlüsselt gespeicherte Sitzung wird endgültig verworfen. Nicht in einer .enc-Datei gespeicherte Passwörter können unwiederbringlich verloren gehen.',{title:'Sitzung verwerfen',ok:'Sitzung verwerfen',danger:true}))return;await delDraft(d.id);await listDrafts();};
   const rowActions=document.createElement('div');rowActions.className='draft-row-actions';rowActions.append(resume,del);
   row.append(title,rowActions,form);root.append(row);
  }
  panel.classList.remove('hidden');
 }catch(e){note('Gespeicherte Sitzungen konnten nicht geladen werden: '+e.message,'error');}
}
function closeOpen(){const panel=$('homeOpen');panel.classList.add('hidden');$('open').setAttribute('aria-expanded','false');$('openMaster').value='';$('openMaster').type='password';const eye=panel.querySelector('.master-eye');eye.setAttribute('aria-pressed','false');eye.setAttribute('aria-label','Passwort anzeigen');eye.title='Passwort anzeigen';eye.querySelector('svg').innerHTML=icons.eye;if(mode==='file'){pending=null;mode='';}}
function showOpen(){closeCreate();closeDraftUnlock();$('homeOpen').classList.remove('hidden');$('open').setAttribute('aria-expanded','true');$('openMaster').focus();}
function closeCreate(){ $('homeCreate').classList.add('hidden');$('new').setAttribute('aria-expanded','false');for(const id of ['createMaster','createRepeat']){$(id).value='';$(id).type='password';}document.querySelectorAll('#homeCreate .master-eye').forEach(b=>{b.setAttribute('aria-pressed','false');b.setAttribute('aria-label','Passwort anzeigen');b.title='Passwort anzeigen';b.querySelector('svg').innerHTML=icons.eye;});}
function reset(){closeOpen();closeDraftUnlock();pendingMaster=null;lockedSession=null;compareClose();s=null;pending=null;mode='';$('master').value='';$('repeat').value='';closeCreate();clearEdit();view('home');listDrafts();}
$('new').setAttribute('aria-controls','homeCreate');$('new').setAttribute('aria-expanded','false');
$('new').onclick=()=>{const panel=$('homeCreate'),opening=panel.classList.contains('hidden');if(!opening){closeCreate();pending=null;mode='';return;}closeOpen();closeDraftUnlock();pending={kind:'new'};mode='new';panel.classList.remove('hidden');$('new').setAttribute('aria-expanded','true');$('createMaster').focus();};
$('createCancel').onclick=()=>{closeCreate();pending=null;mode='';};
$('createGo').onclick=()=>{$('unlockGo').click();};
for(const id of ['createMaster','createRepeat'])$(id).addEventListener('keydown',e=>{if(e.key==='Enter'){$('createGo').click();}});
$('open').setAttribute('aria-controls','homeOpen');$('open').setAttribute('aria-expanded','false');
$('openCancel').onclick=closeOpen;
$('openGo').onclick=()=>{$('unlockGo').click();};
$('openMaster').addEventListener('keydown',e=>{if(e.key==='Enter')$('openGo').click();});
$('open').onclick=async()=>{closeOpen();closeCreate();closeDraftUnlock();if('showOpenFilePicker'in window){try{const [handle]=await showOpenFilePicker({types:[{description:'Verschlüsselter Tresor',accept:{'application/octet-stream':['.enc']}}]});const raw=await (await handle.getFile()).text();pending={kind:'file',raw,handle};mode='file';showOpen();return;}catch(e){if(e.name==='AbortError')return;note('Direkter Dateizugriff nicht verfügbar: '+e.message);}}$('file').click();};
$('file').onchange=async()=>{closeOpen();closeCreate();closeDraftUnlock();const f=$('file').files[0];if(!f)return;pending={kind:'file',raw:await f.text(),handle:null};mode='file';showOpen();$('file').value='';};
$('unlockCancel').onclick=reset;
$('unlockGo').onclick=async()=>{if(busy)return;busy=true;try{const draftInput=mode==='draft'?document.querySelector('#drafts .draft-unlock:not(.hidden) input'):null;const pass=mode==='new'?$('createMaster').value:mode==='draft'?(draftInput?draftInput.value:''):mode==='file'?$('openMaster').value:$('master').value;if(!pass)throw Error('Master-Passwort fehlt.');let opened,entries,id,baseRaw=null,baseHash=null,handle=null,dirty=false,recovery=false,confirmedSave=false;const openingMode=mode;if(openingMode==='new'){if(pass!==$('createRepeat').value)throw Error('Master-Passwort und Wiederholung müssen übereinstimmen.');opened=await PasswordCrypto.create(pass);entries=[];id=uuid();dirty=true;}else if(openingMode==='file'){opened=await PasswordCrypto.open(JSON.parse(pending.raw),pass);const p=parsePayload(opened.plaintext);entries=p.entries;id=p.id||uuid();baseRaw=pending.raw;baseHash=await hash(baseRaw);handle=pending.handle;
// Never create a recovery draft merely because an older 2.0 file lacks a vault ID.
// Inspect an existing draft before modifying any session or recovery state.
if(p.id){const d=await getDraft(id);if(d){if(d.baseHash!==baseHash){note('Eine gespeicherte Sitzung stammt von einem anderen Dateistand. Sie wurde NICHT automatisch übernommen.');}else{let candidate=null;try{const r=await PasswordCrypto.open(JSON.parse(d.raw),pass);const dp=parsePayload(r.plaintext);if(dp.id===id&&JSON.stringify(dp.entries)!==JSON.stringify(entries))candidate=dp.entries;}catch(e){note('gespeicherte Sitzung konnte nicht geprüft werden: '+e.message);}if(candidate&&await askConfirmation('Für diesen Tresor gibt es ungespeicherte Änderungen. Statt des Dateistands die gespeicherte Sitzung wiederherstellen?',{title:'Sitzung wiederherstellen',ok:'Sitzung fortsetzen'})){entries=candidate;dirty=true;recovery=true;}}}}
}else if(openingMode==='draft'){opened=await PasswordCrypto.open(JSON.parse(pending.draft.raw),pass);const p=parsePayload(opened.plaintext);if(p.id!==pending.draft.id)throw Error('Tresor-ID stimmt nicht überein.');entries=p.entries;id=p.id;baseRaw=pending.draft.baseRaw;baseHash=pending.draft.baseHash;dirty=true;recovery=true;}else throw Error('Kein Tresor ausgewählt.');
s={id,entries,key:opened.key,salt:opened.salt,baseRaw,baseHash,handle,dirty,recovery,confirmedSave,exportPending:false};$('repeat').value='';$('search').value='';if(openingMode==='new')closeCreate();if(openingMode==='draft')closeDraftUnlock();if(openingMode==='file')closeOpen();view('vault');lastActivity=Date.now();render();if(openingMode==='new'){try{await draftNow();}catch(e){note('Sitzungswiederherstellung nicht verfügbar: '+e.message);}}$('master').value='';if(openingMode==='new')note('Neuer Tresor: zuerst als .enc-Datei exportieren oder direkt speichern. Noch keine Datei vorhanden.');else if(openingMode==='draft')note('gespeicherte Sitzung wiederhergestellt. Änderungen sind NICHT in der .enc-Datei gespeichert.');}catch(e){note('Öffnen fehlgeschlagen: '+e.message);}finally{busy=false;}};
// Cryptographically secure password generator; unbiased character selection and Fisher–Yates shuffle.
function secureIndex(limit){const range=0x100000000,cutoff=range-(range%limit),word=new Uint32Array(1);let n;do{crypto.getRandomValues(word);n=word[0];}while(n>=cutoff);return n%limit;}
function setFormPasswordVisible(show){$('password').type=show?'text':'password';$('toggleFormPassword').innerHTML=svg(show?'eyeOff':'eye');$('toggleFormPassword').setAttribute('aria-pressed',String(show));$('toggleFormPassword').setAttribute('aria-label',show?'Passwort verbergen':'Passwort anzeigen');$('toggleFormPassword').title=show?'Passwort verbergen':'Passwort anzeigen';}
$('toggleFormPassword').onclick=()=>setFormPasswordVisible($('password').type==='password');
$('passwordLength').oninput=()=>{$('passwordLengthValue').textContent=$('passwordLength').value+' Zeichen';};
$('generatePassword').onclick=()=>{const groups=[['genLower','abcdefghijklmnopqrstuvwxyz'],['genUpper','ABCDEFGHIJKLMNOPQRSTUVWXYZ'],['genNumbers','0123456789'],['genSpecial','!@#$%&*+-=?_']].filter(([id])=>$(id).checked).map(([,chars])=>chars);if(!groups.length){note('Bitte mindestens eine Zeichengruppe auswählen.');return;}const length=Number($('passwordLength').value);if(!Number.isInteger(length)||length<8||length>64||length<groups.length){note('Ungültige Passwortlänge.');return;}const pool=groups.join('');const chars=groups.map(g=>g[secureIndex(g.length)]);while(chars.length<length)chars.push(pool[secureIndex(pool.length)]);for(let i=chars.length-1;i>0;i--){const k=secureIndex(i+1);[chars[i],chars[k]]=[chars[k],chars[i]];}$('password').value=chars.join('');setFormPasswordVisible(true);note('Neues Passwort erzeugt. Bitte den Eintrag übernehmen und anschließend die .enc-Datei speichern.');};
$('add').onclick=async()=>{if(!s||busy)return;const website=$('url').value.trim();const now=Date.now(),previous=edit>=0?s.entries[edit]:null;const e={title:website,url:website,username:$('username').value,password:$('password').value,createdAt:previous?entryTime(previous.createdAt)??undefined:now,updatedAt:now};if(!website){note('Website / URL fehlt.');return;}if(!e.password){note('Passwort fehlt.');return;}const old=s.entries;s.entries=old.map(x=>({...x}));if(edit<0)s.entries.push(e);else s.entries[edit]=e;clearEdit();await changed(old);};
$('cancelEdit').onclick=clearEdit;

// The second vault is read-only. No entries or passwords are persisted for comparison.
let compareMode='',compareRows=[],compareBusy=false;
function compareClose(){compareMode='';compareRows=[];$('comparePanel').classList.add('hidden');$('compareFile').value='';}
function entryKey(e){const url=(e.url||e.title||'').trim().toLocaleLowerCase();return JSON.stringify([url,(e.username||'').trim().toLocaleLowerCase()]);}
function entrySame(a,b){return comparableEntry(a)===comparableEntry(b);}
function compareRender(){const root=$('compareList');root.replaceChildren();for(const row of compareRows){const label=document.createElement('label');label.className='compare-item';const check=document.createElement('input');check.type='checkbox';check.checked=row.selected;check.onchange=()=>{row.selected=check.checked;};const info=document.createElement('span');const title=document.createElement('strong');title.textContent=row.source.title||row.source.url||'(Ohne Bezeichnung)';const user=document.createElement('small');user.textContent='Benutzername: '+row.source.username;const state=document.createElement('small');state.className=row.targetIndex<0?'new':'diff';state.textContent=row.targetIndex<0?'Neu – wird hinzugefügt':'Unterschied – ausgewählte Fassung ersetzt den vorhandenen Eintrag';info.append(title,user,state);if(row.targetIndex>=0){const before=document.createElement('small');before.textContent='Aktuell: '+(s.entries[row.targetIndex].title||s.entries[row.targetIndex].url||'')+' · '+s.entries[row.targetIndex].username;info.append(before);}label.append(check,info);root.append(label);}if(!compareRows.length)root.textContent='Keine neuen oder abweichenden Einträge gefunden.';}

// Bidirectional synchronization: compare both vaults, resolve conflicts, prepare two independently encrypted downloads.
let syncState=null,syncApplying=false;
function syncClose(){syncState=null;$('syncConflictBulk').value='';$('syncPanel').classList.add('hidden');$('syncDownloads').classList.add('hidden');$('syncChoices').classList.remove('hidden');$('syncList').replaceChildren();$('syncFile').value='';}
function syncText(tag,value,cls){const el=document.createElement(tag);if(cls)el.className=cls;if(value!==undefined)el.textContent=value;return el;}
function syncStart(){if(!s||busy||pendingMaster){note('Bitte zuerst eine laufende Master-Passwortänderung abschließen.');return;}compareClose();syncClose();$('syncFile').click();}
function syncDownload(raw,filename){const url=URL.createObjectURL(new Blob([raw],{type:'application/octet-stream'}));const link=document.createElement('a');link.href=url;link.download=filename;document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);}
function syncSide(entry,label){const box=syncText('div',undefined,'sync-side');box.append(syncText('strong',label));if(!entry){box.append(syncText('p','Eintrag fehlt'));return box;}box.append(syncText('p','Website: '+(entry.url||entry.title||'')),syncText('p','Benutzername: '+entry.username));const line=syncText('p','Passwort: '),secret=syncText('span','••••••••');line.append(secret);const eye=syncText('button','👁 Anzeigen','secondary');eye.type='button';eye.onclick=()=>{const visible=secret.textContent==='••••••••';secret.textContent=visible?entry.password:'••••••••';eye.textContent=visible?'Verbergen':'👁 Anzeigen';};box.append(line,eye);return box;}
function syncCompactEntry(row){
 const entry=row.current||row.external,card=syncText('article',undefined,'sync-item sync-missing-card');
 const heading=syncText('div',undefined,'sync-compact-heading');
 heading.append(syncText('strong',entry.url||entry.title||'(Ohne Bezeichnung)'));
 card.append(heading,syncText('p','Benutzername: '+entry.username,'sync-compact-user'));
 const sides=syncText('div',undefined,'sync-sides');
 for(const [value,label] of [[row.current,'Geöffneter Tresor'],[row.external,'Zweiter Tresor']]){
  const side=syncText('div',undefined,'sync-side');side.append(syncText('strong',label));
  if(!value){side.append(syncText('p','Eintrag nicht vorhanden','sync-side-absent'));}
  else{
   const line=syncText('p','Passwort: '),secret=syncText('span','••••••••'),eye=syncText('button','👁 Anzeigen','secondary');
   eye.type='button';eye.setAttribute('aria-label','Passwort anzeigen');
   eye.onclick=()=>{const visible=secret.textContent==='••••••••';secret.textContent=visible?value.password:'••••••••';eye.textContent=visible?'Verbergen':'👁 Anzeigen';eye.setAttribute('aria-label',visible?'Passwort verbergen':'Passwort anzeigen');};
   line.append(secret);side.append(line,eye);
  }
  sides.append(side);
 }
 card.append(sides);
 const label=syncText('label',undefined,'sync-missing-choice'),checkbox=document.createElement('input');checkbox.type='checkbox';checkbox.checked=row.include;
 const description=syncText('span','In beide Tresore übernehmen');
 const warning=syncText('p','Nicht übernehmen – fehlt anschließend in beiden neuen Tresoren.','sync-omit-warning');
 warning.classList.toggle('hidden',row.include);
 checkbox.onchange=()=>{row.include=checkbox.checked;warning.classList.toggle('hidden',row.include);};
 label.append(checkbox,description);card.append(label,warning);return card;
}
function syncRender(){
 const list=$('syncList');list.replaceChildren();if(!syncState)return;
 const rows=syncState.rows,conflicts=rows.filter(r=>r.current&&r.external),missing=rows.filter(r=>!r.current||!r.external);
 const byWebsite=(a,b)=>{const x=a.current||a.external,y=b.current||b.external;return (x.url||x.title||'').localeCompare(y.url||y.title||'','de')||x.username.localeCompare(y.username,'de');};
 conflicts.sort(byWebsite);missing.sort(byWebsite);
 $('syncInfo').textContent=rows.length?rows.length+' Unterschied(e): '+conflicts.length+' Konflikt(e), '+missing.length+' nur in einem Tresor. Entscheide, welche Einträge in beide neuen Tresore gelangen.':'Beide Tresore haben denselben Eintragsbestand. Du kannst trotzdem beide .enc-Dateien neu sichern.';
 $('syncBulk').classList.toggle('hidden',!rows.length);$('syncMissingActions').classList.toggle('hidden',!missing.length);$('syncConflictActions').classList.toggle('hidden',!conflicts.length);
 if(conflicts.length){const section=syncText('section',undefined,'sync-section');section.append(syncText('h4','Konflikte ('+conflicts.length+')'));
 for(const [index,row] of conflicts.entries()){
  const card=syncText('article',undefined,'sync-item sync-conflict'),entry=row.current;
  card.append(syncText('strong',entry.url||entry.title||'(Ohne Bezeichnung)'));
  card.append(syncText('span','Konflikt','sync-tag sync-tag-conflict'));
  if(row.current.username===row.external.username)card.append(syncText('p','Benutzername: '+row.current.username,'sync-compact-user'));
  const sides=syncText('div',undefined,'sync-sides');
  const sameSite=(row.current.url||row.current.title)===(row.external.url||row.external.title);
  const sameUser=row.current.username===row.external.username;
  for(const [value,label] of [[row.current,'Geöffneter Tresor'],[row.external,'Zweiter Tresor']]){
   const side=syncText('div',undefined,'sync-side');side.append(syncText('strong',label));
   if(!sameSite)side.append(syncText('p','Website: '+(value.url||value.title||'')));
   if(!sameUser)side.append(syncText('p','Benutzername: '+value.username));
   const line=syncText('p','Passwort: '),secret=syncText('span','••••••••'),eye=syncText('button','👁 Anzeigen','secondary');
   eye.type='button';eye.onclick=()=>{const visible=secret.textContent==='••••••••';secret.textContent=visible?value.password:'••••••••';eye.textContent=visible?'Verbergen':'👁 Anzeigen';};
   line.append(secret);side.append(line,eye);sides.append(side);
  }
  card.append(sides);
  const options=syncText('div',undefined,'sync-choice');for(const [value,label] of [['current','Geöffnete Version übernehmen'],['external','Zweite Version übernehmen'],['both','Beide Einträge behalten']]){
   const option=syncText('label'),radio=document.createElement('input');radio.type='radio';radio.name='syncChoice'+index;radio.value=value;radio.checked=row.choice===value;radio.onchange=()=>{row.choice=value;};option.append(radio,document.createTextNode(label));options.append(option);
  }card.append(options);section.append(card);
 }list.append(section);}
 if(missing.length){const section=syncText('section',undefined,'sync-section');section.append(syncText('h4','Einträge ohne Konflikt ('+missing.length+')'));
 for(const row of missing)section.append(syncCompactEntry(row));list.append(section);}
}
function syncSetMissing(include){if(!syncState)return;syncState.rows.filter(r=>!r.current||!r.external).forEach(r=>r.include=include);syncRender();}
$('syncMissingAll').onclick=()=>syncSetMissing(true);
$('syncMissingNone').onclick=()=>syncSetMissing(false);
$('syncConflictBulk').onchange=()=>{const choice=$('syncConflictBulk').value;if(!choice||!syncState)return;syncState.rows.filter(r=>r.current&&r.external).forEach(r=>r.choice=choice);syncRender();};
$('syncFile').onchange=async()=>{const file=$('syncFile').files[0];if(!file||!s)return;const session=s;try{const raw=await file.text();const pass=await askMasterPassword('Master-Passwort des zweiten Tresors');if(pass===null)return;if(!pass)throw Error('Master-Passwort fehlt.');const opened=await PasswordCrypto.open(JSON.parse(raw),pass);const external=parsePayload(opened.plaintext);if(external.id&&external.id===session.id)throw Error('Dieselbe Tresor-ID: Bitte eine andere Tresordatei wählen.');if(session!==s)throw Error('Geöffneter Tresor wurde gewechselt.');const original=JSON.stringify(session.entries),current=session.entries.map(e=>({...e})),other=external.entries.map(e=>({...e}));const used=new Set(),rows=[];for(const entry of current){const idx=other.findIndex((e,i)=>!used.has(i)&&entryKey(e)===entryKey(entry));if(idx>=0)used.add(idx);if(idx<0)rows.push({current:entry,external:null,choice:'current',include:true});else if(!entrySame(entry,other[idx]))rows.push({current:entry,external:other[idx],choice:null});}for(const [i,entry] of other.entries())if(!used.has(i))rows.push({current:null,external:entry,choice:'external',include:true});syncState={session,original,current,other,rows,externalId:external.id||uuid(),externalKey:opened.key,externalSalt:opened.salt,rawCurrent:null,rawExternal:null};syncRender();$('syncPanel').classList.remove('hidden');$('syncPanel').scrollIntoView({block:'nearest'});}catch(e){syncClose();note('Synchronisierung fehlgeschlagen: '+e.message);}finally{$('syncFile').value='';}};
$('syncCancel').onclick=syncClose;$('syncDone').onclick=syncClose;
$('syncPrepare').onclick=async()=>{const state=syncState;if(!state||busy||syncApplying)return;if(s!==state.session||JSON.stringify(s.entries)!==state.original){syncClose();note('Tresor wurde seit dem Vergleich verändert. Bitte erneut vergleichen.');return;}if(state.rows.some(row=>row.choice===null)){note('Bitte für jeden abweichenden Eintrag eine Version auswählen.');return;}
 const merged=state.current.map(e=>({...e}));for(const row of state.rows){if(!row.current){if(row.include)merged.push({...row.external});continue;}if(!row.external){if(!row.include){const index=merged.findIndex(e=>entryKey(e)===entryKey(row.current));if(index>=0)merged.splice(index,1);}continue;}const index=merged.findIndex(e=>entryKey(e)===entryKey(row.current));if(index<0)throw Error('Eintrag nicht gefunden.');if(row.choice==='external')merged[index]={...row.external};if(row.choice==='both'){const copy={...row.external},base=copy.username;let suffix=2;while(merged.some(e=>entryKey(e)===entryKey(copy))){copy.username=base+' (zweite Version '+suffix+++')';}merged.push(copy);}}
 if(!await askConfirmation('Synchronisierte Tresore mit '+merged.length+' Einträgen erstellen? Der geöffnete Tresor erhält diesen Stand als ungespeicherte Änderung. Die zweite Datei wird nicht automatisch überschrieben.',{title:'Synchronisierte Tresore erstellen',ok:'Tresore erstellen'}))return;
 busy=true;syncApplying=true;try{const currentRaw=JSON.stringify(await PasswordCrypto.encrypt(JSON.stringify({schema:3,id:state.session.id,entries:merged}),state.session.key,state.session.salt));const externalRaw=JSON.stringify(await PasswordCrypto.encrypt(JSON.stringify({schema:3,id:state.externalId,entries:merged}),state.externalKey,state.externalSalt));if(s!==state.session||JSON.stringify(s.entries)!==state.original)throw Error('Tresor wurde während des Abgleichs verändert.');const old=s.entries;s.entries=merged;await changed(old);state.rawCurrent=currentRaw;state.rawExternal=externalRaw;state.snapshot=JSON.stringify(merged);$('syncChoices').classList.add('hidden');$('syncDownloads').classList.remove('hidden');$('syncInfo').textContent='Tresore zum Sichern bereit: '+merged.length+' Einträge. Beide .enc-Dateien separat sichern.';note('Tresore zum Sichern bereit. Bitte beide .enc-Dateien herunterladen. Der geöffnete Tresor bleibt bis zur normalen Speicherung oder Prüfung als nicht gespeichert markiert.','warning');}catch(e){note('Synchronisierung konnte nicht vorbereitet werden: '+e.message);}finally{syncApplying=false;busy=false;}};
$('syncDownloadCurrent').onclick=()=>{if(!syncState?.rawCurrent||s!==syncState.session||JSON.stringify(s.entries)!==syncState.snapshot){note('Tresorstand verändert. Bitte Synchronisierung erneut starten.');syncClose();return;}syncDownload(syncState.rawCurrent,'passwort_tresor_synchronisiert_geoeffnet.enc');};
$('syncDownloadExternal').onclick=()=>{if(!syncState?.rawExternal||s!==syncState.session||JSON.stringify(s.entries)!==syncState.snapshot){note('Tresorstand verändert. Bitte Synchronisierung erneut starten.');syncClose();return;}syncDownload(syncState.rawExternal,'passwort_tresor_synchronisiert_zweiter.enc');};

$('importEntries').onclick=()=>compareStart('import');
$('syncVaults').onclick=()=>syncStart();
function compareStart(kind){if(!s||busy)return;syncClose();compareClose();compareMode=kind;$('compareFile').click();}
$('compareFile').onchange=async()=>{const file=$('compareFile').files[0];if(!file||!s)return;const kind=compareMode;try{const raw=await file.text();const pass=await askMasterPassword('Master-Passwort des zweiten Tresors');if(pass===null){compareClose();return;}if(!pass)throw Error('Master-Passwort fehlt.');const opened=await PasswordCrypto.open(JSON.parse(raw),pass);const source=parsePayload(opened.plaintext);if(source.id&&source.id===s.id)throw Error('Dieselbe Tresor-ID: Bitte eine andere Tresordatei wählen.');const used=new Set();compareRows=[];for(const entry of source.entries){const key=entryKey(entry);const targetIndex=s.entries.findIndex((e,i)=>!used.has(i)&&entryKey(e)===key);if(targetIndex>=0)used.add(targetIndex);if(targetIndex<0||!entrySame(entry,s.entries[targetIndex]))compareRows.push({source:{...entry},targetIndex,selected:false});}if(kind!==compareMode)return;$('compareTitle').textContent=kind==='sync'?'Tresore synchronisieren · Diff':'Einträge aus Tresor importieren';$('compareInfo').textContent=kind==='sync'?'Unterschiede zum zweiten Tresor. Wähle für jede Abweichung, ob die Fassung aus der zweiten Datei übernommen werden soll. Nicht ausgewählte Einträge bleiben unverändert. Die zweite Datei wird nicht verändert.':'Wähle Einträge aus der zweiten Datei. Bei gleicher Website/URL und gleichem Benutzernamen wird ein abweichender Eintrag nur nach Auswahl ersetzt. Die zweite Datei bleibt unverändert.';compareRender();$('comparePanel').classList.remove('hidden');$('comparePanel').scrollIntoView({block:'nearest'});}catch(e){compareClose();note('Vergleich/Import fehlgeschlagen: '+e.message);}finally{$('compareFile').value='';}};
$('compareAll').onclick=()=>{compareRows.forEach(r=>r.selected=true);compareRender();};
$('compareNone').onclick=()=>{compareRows.forEach(r=>r.selected=false);compareRender();};
$('compareCancel').onclick=compareClose;
$('compareApply').onclick=async()=>{if(!s||busy||compareBusy)return;const chosen=compareRows.filter(r=>r.selected);if(!chosen.length){note('Keine Einträge ausgewählt.');return;}if(!await askConfirmation(chosen.length+' Einträge übernehmen? Abweichende Einträge im geöffneten Tresor werden ersetzt. Die zweite Datei bleibt unverändert.',{title:'Einträge übernehmen',ok:'Einträge übernehmen'}))return;compareBusy=true;try{const old=s.entries;const next=old.map(e=>({...e}));for(const row of chosen){if(row.targetIndex<0){const now=Date.now();next.push({...normalizedEntry(row.source),createdAt:now,updatedAt:now});}else{const oldEntry=next[row.targetIndex],now=Date.now();next[row.targetIndex]={...normalizedEntry(row.source),createdAt:entryTime(oldEntry.createdAt)??undefined,updatedAt:now};}}s.entries=next;compareClose();await changed(old);note(chosen.length+' Einträge übernommen. Nicht gespeichert: Bitte die .enc-Datei speichern oder exportieren. '+(s.recovery?'gespeicherte Sitzung vorhanden.':'gespeicherte Sitzung nicht verfügbar.'),'warning');}finally{compareBusy=false;}};

async function checkConflict(){if(!s.handle||!s.baseHash)return;const now=await (await s.handle.getFile()).text();if(await hash(now)!==s.baseHash)throw Error('Datei wurde außerhalb dieser Sitzung geändert. Nicht überschrieben; bitte Konflikt manuell klären.');}
$('save').onclick=async()=>{if(!s||busy||!s.handle)return;busy=true;try{await checkConflict();const raw=await encrypted();const w=await s.handle.createWritable();try{await w.write(raw);await w.close();}catch(e){try{await w.abort();}catch{}throw e;}const verified=await (await s.handle.getFile()).text();if(await hash(verified)!==await hash(raw))throw Error('Datei konnte nicht verifiziert werden.');s.baseRaw=raw;s.baseHash=await hash(raw);s.dirty=false;s.confirmedSave=true;s.exportPending=false;await delDraft(s.id);s.recovery=false;note('Datei erfolgreich geschrieben und geprüft.');status();}catch(e){note('NICHT gespeichert: '+e.message+' · gespeicherte Sitzung bleibt erhalten.');}finally{busy=false;}};
$('export').onclick=async()=>{if(!s||busy)return;if(pendingMaster){note('Zuerst die neu verschlüsselte Datei mit „.enc prüfen“ bestätigen oder die Master-Passwortänderung erneut starten.');return;}busy=true;try{const raw=await encrypted();const a=document.createElement('a'),u=URL.createObjectURL(new Blob([raw],{type:'application/octet-stream'}));a.href=u;a.download='passwort_tresor.enc';a.click();setTimeout(()=>URL.revokeObjectURL(u),60000);if(s.dirty){s.exportPending=true;status();}note('Export angeboten. Bitte heruntergeladene .enc-Datei mit „.enc prüfen“ auswählen. Die bisherige Datei wird nicht automatisch ersetzt.');}catch(e){note('Export fehlgeschlagen: '+e.message);}finally{busy=false;}};
$('verifyExport').onclick=()=>{if(!s||busy)return;$('verifyFile').value='';$('verifyFile').click();};
$('verifyFile').onchange=async e=>{const file=e.target.files&&e.target.files[0];if(!file||!s||busy)return;const session=s;busy=true;try{const raw=await file.text();const pass=await askMasterPassword('Master-Passwort der zu prüfenden .enc-Datei');if(pass===null)return;const opened=await PasswordCrypto.open(JSON.parse(raw),pass);const p=parsePayload(opened.plaintext);if(pendingMaster&&session===s){if(await hash(raw)!==pendingMaster.rawHash)throw Error('Dies ist nicht die bei der Master-Passwortänderung exportierte Datei.');if(p.id!==session.id||JSON.stringify(p.entries)!==pendingMaster.entriesJson)throw Error('Die Datei enthält nicht den vollständigen aktuellen Tresorstand.');if(JSON.stringify(session.entries)!==pendingMaster.entriesJson)throw Error('Der Tresor wurde seit dem Export verändert.');const rotated=pendingMaster;session.key=rotated.key;session.salt=rotated.salt;pendingMaster=null;session.dirty=false;session.confirmedSave=true;session.exportPending=false;session.recovery=false;session.baseRaw=raw;session.baseHash=await hash(raw);session.handle=null;try{await delDraft(session.id);}catch(err){note('Neue Datei geprüft, aber die alte gespeicherte Sitzung konnte nicht gelöscht werden: '+err.message);status();return;}status();note('Master-Passwort geändert und heruntergeladene .enc-Datei geprüft. Ab jetzt das NEUE Master-Passwort verwenden. Eine ältere Datei wurde nicht automatisch ersetzt.');return;}if(p.id!==session.id||JSON.stringify(p.entries)!==JSON.stringify(session.entries))throw Error('Die ausgewählte Datei enthält nicht den aktuellen Tresorstand. Bitte erneut exportieren und die richtige Datei auswählen.');if(s!==session||JSON.stringify(session.entries)!==JSON.stringify(p.entries))throw Error('Tresorstand hat sich während der Prüfung geändert.');s.dirty=false;s.confirmedSave=true;s.exportPending=false;s.recovery=false;s.baseRaw=raw;s.baseHash=await hash(raw);s.handle=null;try{await delDraft(s.id);}catch(err){note('Datei geprüft, aber gespeicherte Sitzung konnte nicht entfernt werden: '+err.message);status();return;}status();note('Gespeichert: Die ausgewählte .enc-Datei enthält den aktuellen Tresorstand. Die bisherige Datei wurde nicht automatisch ersetzt.');}catch(err){note('Nicht bestätigt: '+err.message+' · gespeicherte Sitzung bleibt erhalten.');status();}finally{busy=false;$('verifyFile').value='';}};
async function lockVault(automatic=false){
 if(!s||locking||busy||compareBusy)return;
 locking=true;
 try{
  // A dirty vault must have a durable encrypted draft before its plaintext is discarded.
  if(pendingMaster){pendingMaster=null;s.exportPending=false;note('Noch nicht geprüfte Master-Passwortänderung verworfen. Nach dem Entsperren gilt weiterhin das bisherige Master-Passwort.');}
  if(s.dirty){try{await draftNow();}catch(e){note('Sperre nicht möglich: gespeicherte Sitzung konnte nicht gesichert werden: '+e.message);return;}}
  const snapshot=await encrypted();
  lockedSession={snapshot,handle:s.handle,baseRaw:s.baseRaw,baseHash:s.baseHash,dirty:s.dirty,recovery:s.recovery,confirmedSave:s.confirmedSave,exportPending:s.exportPending};
  compareClose();clearEdit();$('entries').replaceChildren();$('resumeMaster').value='';$('master').value='';s=null;
  note('');view('locked');
 }catch(e){note('Sperren fehlgeschlagen: '+e.message);}finally{locking=false;}
}
$('lock').onclick=()=>lockVault(false);
$('resumeGo').onclick=async()=>{
 if(!lockedSession||busy)return;busy=true;
 try{const pass=$('resumeMaster').value;if(!pass)throw Error('Master-Passwort fehlt.');const l=lockedSession;const opened=await PasswordCrypto.open(JSON.parse(l.snapshot),pass);const p=parsePayload(opened.plaintext);s={id:p.id,entries:p.entries,key:opened.key,salt:opened.salt,handle:l.handle,baseRaw:l.baseRaw,baseHash:l.baseHash,dirty:l.dirty,recovery:l.recovery,confirmedSave:l.confirmedSave,exportPending:l.exportPending};lockedSession=null;$('resumeMaster').value='';lastActivity=Date.now();view('vault');render();note('Tresor entsperrt.');}catch(e){note('Entsperren fehlgeschlagen: '+e.message);}finally{busy=false;}
};
$('resumeMaster').addEventListener('keydown',e=>{if(e.key==='Enter')$('resumeGo').click();});
$('resumeClose').onclick=()=>{lockedSession=null;$('resumeMaster').value='';reset();};
function closeMasterChange(){for(const id of ['oldMaster','newMaster','newMasterRepeat']){const input=$(id);input.value='';input.type='password';}document.querySelectorAll('.master-eye').forEach(b=>{b.setAttribute('aria-pressed','false');b.setAttribute('aria-label','Passwort anzeigen');b.title='Passwort anzeigen';b.querySelector('svg').innerHTML=icons.eye;});$('masterChange').classList.add('hidden');}
document.querySelectorAll('.master-eye').forEach(button=>button.addEventListener('click',()=>{const input=$(button.dataset.passwordTarget);const show=input.type==='password';input.type=show?'text':'password';button.setAttribute('aria-pressed',String(show));button.setAttribute('aria-label',show?'Passwort verbergen':'Passwort anzeigen');button.title=show?'Passwort verbergen':'Passwort anzeigen';button.querySelector('svg').innerHTML=icons[show?'eyeOff':'eye'];}));
$('changeMaster').onclick=()=>{if(!$('masterChange').classList.contains('hidden')){closeMasterChange();return;}$('masterChange').classList.remove('hidden');if(!s?.handle)note('Ohne direkten Dateizugriff wird die neu verschlüsselte .enc-Datei zum Download angeboten. Anschließend bitte mit „.enc prüfen“ bestätigen.');$('oldMaster').focus();};
$('cancelMaster').onclick=closeMasterChange;
$('applyMaster').onclick=async()=>{if(!s||busy)return;const oldPass=$('oldMaster').value,newPass=$('newMaster').value,repeat=$('newMasterRepeat').value;if(!newPass){note('Neues Master-Passwort darf nicht leer sein.');return;}if(newPass!==repeat){note('Neues Master-Passwort und Wiederholung müssen übereinstimmen.');return;}if(newPass.length<12&&!await askConfirmation('Das neue Master-Passwort ist kurz und kann leichter erraten werden. Trotzdem verwenden?',{title:'Kurzes Master-Passwort',ok:'Trotzdem verwenden',danger:true}))return;if(newPass===oldPass){note('Bitte ein anderes neues Master-Passwort wählen.');return;}busy=true;let writeAttempted=false;try{
 pendingMaster=null;const current=await encrypted();await PasswordCrypto.open(JSON.parse(current),oldPass);
 if(s.handle)await checkConflict();const fresh=await PasswordCrypto.create(newPass);const raw=JSON.stringify(await PasswordCrypto.encrypt(payload(),fresh.key,fresh.salt));
 // Verify encryption and decryption before touching the authoritative file.
 const proof=await PasswordCrypto.open(JSON.parse(raw),newPass);if(proof.plaintext!==payload())throw Error('Prüfung der neuen Verschlüsselung fehlgeschlagen.');
 if(!s.handle){
  if(!await askConfirmation('Neu verschlüsselte .enc-Datei herunterladen? Die bisherige Datei bleibt unverändert. Bitte die neue Datei danach mit „.enc prüfen“ und dem NEUEN Master-Passwort bestätigen.',{title:'Master-Passwort ändern',ok:'.enc-Datei herunterladen'}))return;
  // Keep the old session key until the exported file has been read back and verified.
  // An encrypted recovery draft using the old key is retained during the handover.
  const wasDirty=s.dirty;s.dirty=true;
  try{await draftNow();}catch(err){s.dirty=wasDirty;throw Error('Sicherer Export abgebrochen: gespeicherte Sitzung konnte nicht erstellt werden: '+err.message);}
  const a=document.createElement('a'),u=URL.createObjectURL(new Blob([raw],{type:'application/octet-stream'}));
  try{a.href=u;a.download='passwort_tresor_neues_masterpasswort.enc';a.click();}finally{setTimeout(()=>URL.revokeObjectURL(u),60000);}
  pendingMaster={key:fresh.key,salt:fresh.salt,rawHash:await hash(raw),entriesJson:JSON.stringify(s.entries)};
  s.exportPending=true;closeMasterChange();status();note('Neue .enc-Datei zum Download angeboten. Speichere sie und wähle sie unter „.enc prüfen“ aus; dort das NEUE Master-Passwort eingeben. Die bisherige Datei bleibt unverändert.');return;
 }
 if(!await askConfirmation('Master-Passwort ändern und die geöffnete .enc-Datei direkt überschreiben? Bewahre zuvor eine externe Sicherungskopie auf.',{title:'Datei überschreiben',ok:'Datei überschreiben',danger:true}))return;
 // A failed write must not silently replace the current session key.
 const w=await s.handle.createWritable();writeAttempted=true;try{await w.write(raw);await w.close();}catch(e){try{await w.abort();}catch{}throw e;}
 const verified=await(await s.handle.getFile()).text();if(await hash(verified)!==await hash(raw))throw Error('Die neu verschlüsselte Datei konnte nicht verifiziert werden.');
 s.key=fresh.key;s.salt=fresh.salt;s.baseRaw=raw;s.baseHash=await hash(raw);s.dirty=false;s.confirmedSave=true;s.exportPending=false;try{await delDraft(s.id);s.recovery=false;}catch(e){note('Passwort geändert und Datei geprüft, aber alte gespeicherte Sitzung konnte nicht gelöscht werden: '+e.message);closeMasterChange();status();return;}
 closeMasterChange();status();note('Master-Passwort geändert: .enc-Datei geschrieben und geprüft. Ab jetzt das neue Passwort verwenden.');
 }catch(e){note('Master-Passwort nicht bestätigt: '+e.message+(writeAttempted?' · ACHTUNG: Schreibvorgang wurde begonnen. Prüfe die .enc-Datei mit dem neuen und bisherigen Passwort anhand einer Sicherungskopie, bevor du weitere Änderungen vornimmst.':''));}finally{busy=false;}};
$('lockMinutes').value=String(lockMinutes);
$('lockMinutes').onchange=()=>{lockMinutes=Number($('lockMinutes').value);localStorage.setItem('vault_lock_minutes',String(lockMinutes));lastActivity=Date.now();note(lockMinutes?'Automatische Sperre nach '+lockMinutes+' Minuten Inaktivität aktiviert.':'Automatische Sperre deaktiviert.');};
for(const event of ['pointerdown','keydown','touchstart','input','scroll'])document.addEventListener(event,()=>{if(s)lastActivity=Date.now();},{passive:true,capture:true});
setInterval(()=>{if(s&&lockMinutes&&!busy&&!compareBusy&&!locking&&Date.now()-lastActivity>=lockMinutes*60000)lockVault(true);},10000);
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&s&&lockMinutes&&Date.now()-lastActivity>=lockMinutes*60000)lockVault(true);});
$('discard').onclick=async()=>{if(!s||busy||compareBusy)return;if(!s.dirty&&s.confirmedSave&&!pendingMaster){reset();return;}if(!await askConfirmation('Tresor ohne Speichern schließen? Nicht gespeicherte Änderungen und die zugehörige gespeicherte Sitzung werden verworfen. Vorhandene .enc-Dateien bleiben unverändert.',{title:'Ohne Speichern schließen',ok:'Ohne Speichern schließen',danger:true}))return;try{await delDraft(s.id);reset();}catch(e){note('Zwischenstand konnte nicht gelöscht werden: '+e.message);}};
view('home');listDrafts();

// Close floating entry menus when the list scrolls or the viewport changes.
$('entries').addEventListener('scroll',()=>document.querySelectorAll('.entry-menu[open]').forEach(menu=>menu.open=false),{passive:true});
window.addEventListener('resize',()=>document.querySelectorAll('.entry-menu[open]').forEach(menu=>menu.open=false));
