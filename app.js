'use strict';
const $ = id => document.getElementById(id);
const STORE = 'encrypted_vault';
let sessionKey=null, sessionSalt=null, decryptedVault=[], source='', fileRawData=null, busy=false, dirty=false;
let lastActivity=Date.now(), lockMinutes=Number(localStorage.getItem('vault_lock_minutes')||15);
let editingIndex=null, revealed=new Set(), clipboardTimer=null;
const groups={upper:'ABCDEFGHIJKLMNOPQRSTUVWXYZ',lower:'abcdefghijklmnopqrstuvwxyz',numbers:'0123456789',symbols:'!@#$%^&*()_+-=[]{}|;:,.<>?'};
function message(text){$('status').textContent=text;}
function show(id){for(const name of ['sourceSelect','passwordPrompt','vaultView']) $(name).classList.toggle('hidden',name!==id);}
function active(){return !!sessionKey;}
function touch(){if(active())lastActivity=Date.now();}
function randomIndex(max){const b=new Uint32Array(1),limit=Math.floor(4294967296/max)*max;do{crypto.getRandomValues(b);}while(b[0]>=limit);return b[0]%max;}
// Das Auge gehört zum Passwortfeld und bleibt unabhängig von der allgemeinen Icon-Option sichtbar.
function setEditorPasswordVisible(visible){
    $('password').type=visible?'text':'password';
    const button=$('togglePassword');
    button.setAttribute('aria-pressed',String(visible));
    button.setAttribute('aria-label',visible?'Passwort verbergen':'Passwort anzeigen');
    button.title=visible?'Passwort verbergen':'Passwort anzeigen';
}
$('togglePassword').addEventListener('click',()=>{
    setEditorPasswordVisible($('password').type==='password');
});

function clearEditor(){setEditorPasswordVisible(false);editingIndex=null;$('entryForm').reset();$('entryTitle').textContent='Passwort hinzufügen';$('entryForm').classList.add('hidden');$('strength').textContent='';}
function lockVault(reason='manual'){closeSync();sessionKey=null;sessionSalt=null;decryptedVault=[];fileRawData=null;source='';dirty=false;revealed.clear();$('masterPassword').value='';$('importFile').value='';$('passwordsContainer').replaceChildren();$('search').value='';$('changeForm').reset();$('changeForm').classList.add('hidden');clearEditor();show('sourceSelect');if(reason==='automatic'){$('autoLockText').textContent=`Dein Tresor wurde nach ${lockMinutes} ${lockMinutes===1?'Minute':'Minuten'} Inaktivität automatisch gesperrt.`;$('autoLockNotice').classList.remove('hidden');message('');}else{$('autoLockNotice').classList.add('hidden');message('Tresor gesperrt.');}}
function handleSourceSelection(type){if(busy)return;$('autoLockNotice').classList.add('hidden');source=type;if(type==='file'){const file=$('importFile').files[0];if(!file)return;if(file.size>10*1024*1024){message('Datei zu groß (max. 10 MB).');return;}const reader=new FileReader();reader.onload=()=>{fileRawData=reader.result;$('promptTitle').textContent='Datei-Tresor öffnen';show('passwordPrompt');$('masterPassword').focus();};reader.onerror=()=>message('Datei konnte nicht gelesen werden.');reader.readAsText(file);}else{$('promptTitle').textContent=localStorage.getItem(STORE)===null?'Neuen Browser-Tresor anlegen':'Browser-Tresor öffnen';show('passwordPrompt');$('masterPassword').focus();}}
async function submitMasterPassword(){if(busy)return;const password=$('masterPassword').value;if(!password){message('Master-Passwort eingeben.');return;}busy=true;try{const raw=source==='file'?fileRawData:localStorage.getItem(STORE);let opened,entries;if(raw!==null){opened=await PasswordCrypto.open(JSON.parse(raw),password);entries=JSON.parse(opened.plaintext);if(!Array.isArray(entries)||!entries.every(e=>e&&typeof e.url==='string'&&typeof e.username==='string'&&typeof e.password==='string'))throw Error('Ungültige Einträge');}else{if(source!=='browser')throw Error('Datei fehlt');opened=await PasswordCrypto.create(password);entries=[];const encrypted=await PasswordCrypto.encrypt('[]',opened.key,opened.salt);localStorage.setItem(STORE,JSON.stringify(encrypted));}sessionKey=opened.key;sessionSalt=opened.salt;decryptedVault=entries;dirty=false;lastActivity=Date.now();$('deleteBrowserVault').classList.toggle('hidden',source!=='browser');show('vaultView');updateSyncButton();$('autoLockNotice').classList.add('hidden');renderPasswords();message(source==='file'?'Datei-Tresor geöffnet. Änderungen müssen exportiert werden.':'Browser-Tresor geöffnet.');}catch(e){console.error('Tresor öffnen:',e.name);message('Öffnen fehlgeschlagen: Passwort, Datei oder Speicher prüfen.');}finally{$('masterPassword').value='';busy=false;}}
async function persist(entries,key=sessionKey,salt=sessionSalt){const serialized=JSON.stringify(await PasswordCrypto.encrypt(JSON.stringify(entries),key,salt));if(source==='browser')localStorage.setItem(STORE,serialized);return serialized;}
async function commit(next){if(!active()||busy)return false;busy=true;try{await persist(next);decryptedVault=next;if(source==='file'){dirty=true;message('Änderung nur im Arbeitsspeicher: aktualisierte .enc-Datei exportieren!');}else message('Änderung verschlüsselt gespeichert.');renderPasswords();return true;}catch(e){console.error('Speichern:',e.name);message('Speichern fehlgeschlagen. Bestehende Daten wurden nicht überschrieben.');return false;}finally{busy=false;}}
function openEditor(i=null){if(!active())return;setEditorPasswordVisible(false);editingIndex=i;const entry=i===null?null:decryptedVault[i];$('entryTitle').textContent=entry?'Eintrag bearbeiten':'Passwort hinzufügen';$('websiteUrl').value=entry?.url||'';$('username').value=entry?.username||'';$('password').value=entry?.password||'';$('entryForm').classList.remove('hidden');updateStrength();$('websiteUrl').focus();}
async function saveEntry(){if(!active()||busy)return;const url=$('websiteUrl').value.trim(),username=$('username').value.trim(),password=$('password').value;if(!url||!username||!password){message('Bitte alle Felder ausfüllen.');return;}const next=decryptedVault.slice(),entry={...(editingIndex===null?{}:next[editingIndex]),url,username,password,updatedAt:new Date().toISOString()};if(editingIndex===null)next.push(entry);else next[editingIndex]=entry;if(await commit(next))clearEditor();}
async function deleteEntry(i){if(!active()||busy||!confirm('Diesen Eintrag wirklich löschen?'))return;const next=decryptedVault.slice();next.splice(i,1);await commit(next);}
function strength(p){if(!p)return 'Noch kein Passwort';let score=0;if(p.length>=12)score++;if(p.length>=16)score++;if(p.length>=24)score++;if(/[a-z]/.test(p)&&/[A-Z]/.test(p))score++;if(/\d/.test(p)&&/[^\w]/.test(p))score++;if(/(.)\1{3,}/.test(p)||/^(password|passwort|123456|qwerty)/i.test(p))score=Math.min(score,1);return ['Sehr schwach','Schwach','Mittel','Gut','Stark','Sehr stark'][score]+' (grobe Schätzung)';}
function updateStrength(){$('strength').textContent='Passwortstärke: '+strength($('password').value);}
function generateRandomPassword(){const sets=Object.entries(groups).filter(([k])=>$(k).checked).map(([,v])=>v);const length=Number($('passwordLength').value);if(!sets.length||length<sets.length){message('Mindestens eine Zeichengruppe auswählen.');return;}const all=sets.join(''),chars=sets.map(s=>s[randomIndex(s.length)]);while(chars.length<length)chars.push(all[randomIndex(all.length)]);for(let i=chars.length-1;i>0;i--){const j=randomIndex(i+1);[chars[i],chars[j]]=[chars[j],chars[i]];}$('password').value=chars.join('');setEditorPasswordVisible(true);updateStrength();}
async function copyPassword(i){if(!active())return;const password=decryptedVault[i]?.password;if(!password)return;try{await navigator.clipboard.writeText(password);message('Passwort kopiert. Zwischenablage nach 30 Sekunden, sofern möglich, bereinigen.');if(clipboardTimer)clearTimeout(clipboardTimer);clipboardTimer=setTimeout(async()=>{try{if(await navigator.clipboard.readText()===password)await navigator.clipboard.writeText('');}catch{}},30000);}catch{message('Kopieren nicht erlaubt. Bitte HTTPS oder localhost verwenden.');}}
// Icons bestehen nur aus lokal erzeugten SVG-Elementen: keine externen Logo-Anfragen.
const iconPaths={eye:['M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7','M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6'],copy:['M8 4h11a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2','M4 17H3a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1h13a1 1 0 0 1 1 1v1'],edit:['M12 20h9','M16.5 3.5a2.12 2.12 0 0 1 3 3L9 17l-4 1 1-4Z'],trash:['M3 6h18','M8 6V4h8v2','M6 6l1 15h10l1-15','M10 10v7','M14 10v7'],hide:['M3 3l18 18','M10.6 10.6a2 2 0 0 0 2.8 2.8','M9.9 5.2A10.5 10.5 0 0 1 12 5c6.4 0 10 7 10 7a16 16 0 0 1-3.1 3.9','M6.2 6.2C3.5 8.1 2 12 2 12s3.6 7 10 7a10 10 0 0 0 4-.8']};
let showIcons=localStorage.getItem('vault_show_icons')!=='false';
$('showIcons').checked=showIcons;
$('showIcons').addEventListener('change',()=>{showIcons=$('showIcons').checked;localStorage.setItem('vault_show_icons',String(showIcons));renderPasswords();});
function makeIcon(name){const ns='http://www.w3.org/2000/svg',svg=document.createElementNS(ns,'svg');svg.setAttribute('viewBox','0 0 24 24');svg.setAttribute('aria-hidden','true');svg.classList.add('action-icon');for(const d of iconPaths[name]||[]){const path=document.createElementNS(ns,'path');path.setAttribute('d',d);svg.append(path);}return svg;}
function makeButton(text,fn,cls='btn-secondary',iconName=''){const b=document.createElement('button');b.type='button';b.className=cls;if(showIcons&&iconName)b.append(makeIcon(iconName));b.append(document.createTextNode(text));b.addEventListener('click',fn);return b;}
function siteInitial(url){let name=url.trim();try{name=new URL(/^https?:\/\//i.test(name)?name:'https://'+name).hostname.replace(/^www\./i,'');}catch{}return (name.replace(/[^\p{L}\p{N}]/gu,'').charAt(0)||'?').toLocaleUpperCase('de');}
function renderPasswords(){const c=$('passwordsContainer');c.replaceChildren();if(!active())return;const q=$('search').value.toLocaleLowerCase('de'),sort=$('sort').value;const found=decryptedVault.map((e,i)=>({e,i})).filter(({e})=>(e.url+' '+e.username).toLocaleLowerCase('de').includes(q));found.sort((a,b)=>{if(sort==='newest')return (b.e.updatedAt||'').localeCompare(a.e.updatedAt||'');if(sort==='oldest')return (a.e.updatedAt||'').localeCompare(b.e.updatedAt||'');return String(a.e[sort]||'').localeCompare(String(b.e[sort]||''),'de');});if(!found.length){const p=document.createElement('p');p.textContent='Keine passenden Einträge.';c.append(p);return;}for(const {e,i} of found){const card=document.createElement('article');card.className='password-card';const main=document.createElement('div');main.className='entry-main';const h=document.createElement('h3');h.textContent=e.url;const u=document.createElement('p');u.textContent='Benutzername: '+e.username;const p=document.createElement('p'),v=document.createElement('span');v.textContent=revealed.has(i)?e.password:'••••••••';p.append('Passwort: ',v);main.append(h,u,p);const actions=document.createElement('div');actions.className='actions';actions.append(makeButton(revealed.has(i)?'Verbergen':'Anzeigen',()=>{if(revealed.has(i))revealed.delete(i);else revealed.add(i);renderPasswords();},'btn-secondary',revealed.has(i)?'hide':'eye'),makeButton('Kopieren',()=>copyPassword(i),'btn-secondary','copy'),makeButton('Bearbeiten',()=>openEditor(i),'btn-secondary','edit'),makeButton('Löschen',()=>deleteEntry(i),'btn-danger','trash'));if(showIcons){const mark=document.createElement('div');mark.className='site-mark';mark.setAttribute('aria-hidden','true');mark.textContent=siteInitial(e.url);card.append(mark);}card.append(main,actions);c.append(card);}}
async function exportVaultFile(){if(!active()||busy)return;busy=true;try{const serialized=await persist(decryptedVault);const url=URL.createObjectURL(new Blob([serialized],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='passwort_tresor.enc';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);if(source==='file')message('Export gestartet. Bitte sicherstellen, dass die Datei gespeichert wurde.');else message('Export gestartet.');}catch(e){console.error('Export:',e.name);message('Export fehlgeschlagen.');}finally{busy=false;}}
async function changeMasterPassword(){if(!active()||busy)return;const old=$('oldMaster').value,next=$('newMaster').value,repeat=$('repeatMaster').value;if(!old||next.length<12||next!==repeat){message('Altes Passwort eingeben; neues mindestens 12 Zeichen und zweimal identisch.');return;}busy=true;try{const raw=source==='browser'?localStorage.getItem(STORE):fileRawData;if(!raw){message('Kein ursprünglicher Tresor für die Passwortprüfung vorhanden.');return;}await PasswordCrypto.open(JSON.parse(raw),old);const replacement=await PasswordCrypto.create(next);const serialized=JSON.stringify(await PasswordCrypto.encrypt(JSON.stringify(decryptedVault),replacement.key,replacement.salt));if(source==='browser'){localStorage.setItem(STORE,serialized);sessionKey=replacement.key;sessionSalt=replacement.salt;message('Master-Passwort geändert. Bitte sofort eine neue Sicherung exportieren.');}else{const url=URL.createObjectURL(new Blob([serialized],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='passwort_tresor_neues_masterpasswort.enc';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);message('Neue Datei heruntergeladen: Prüfe, ob sie mit dem neuen Master-Passwort geöffnet werden kann. Der ursprüngliche Datei-Tresor bleibt unverändert.');lockVault();} $('changeForm').reset();$('changeForm').classList.add('hidden');}catch(e){console.error('Master-Passwort ändern:',e.name);message('Änderung fehlgeschlagen: altes Passwort prüfen oder Speicherproblem. Ursprünglicher Tresor bleibt erhalten.');}finally{busy=false;}}
function deleteAllData(){if(source!=='browser'||!active()||busy)return;if(confirm('Browser-Tresor endgültig löschen? Vorher .enc-Sicherung anlegen!')){localStorage.removeItem(STORE);lockVault();}}
$('browserButton').addEventListener('click',()=>handleSourceSelection('browser'));
$('importFile').addEventListener('change',()=>handleSourceSelection('file'));
$('unlockForm').addEventListener('submit',e=>{e.preventDefault();submitMasterPassword();});
$('backButton').addEventListener('click',()=>{fileRawData=null;$('importFile').value='';$('masterPassword').value='';show('sourceSelect');});
$('entryForm').addEventListener('submit',e=>{e.preventDefault();saveEntry();});
$('entryCancel').addEventListener('click',clearEditor);
$('newEntry').addEventListener('click',()=>openEditor());
$('generate').addEventListener('click',generateRandomPassword);
$('password').addEventListener('input',updateStrength);
$('passwordLength').addEventListener('input',()=>$('lengthVal').textContent=$('passwordLength').value);
$('search').addEventListener('input',renderPasswords);$('sort').addEventListener('change',renderPasswords);
$('lockButton').addEventListener('click',lockVault);$('exportButton').addEventListener('click',exportVaultFile);$('deleteBrowserVault').addEventListener('click',deleteAllData);
$('changeToggle').addEventListener('click',()=>$('changeForm').classList.toggle('hidden'));
$('changeForm').addEventListener('submit',e=>{e.preventDefault();changeMasterPassword();});
$('lockMinutes').value=String([1,5,10,15,30].includes(lockMinutes)?lockMinutes:15);lockMinutes=Number($('lockMinutes').value);
$('lockMinutes').addEventListener('change',()=>{lockMinutes=Number($('lockMinutes').value);localStorage.setItem('vault_lock_minutes',String(lockMinutes));touch();message('Sperrzeit gespeichert.');});
for(const event of ['pointerdown','keydown'])document.addEventListener(event,touch,{passive:true});
setInterval(()=>{if(active()&&!busy&&Date.now()-lastActivity>=lockMinutes*60000){lockVault('automatic');}},10000);
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&active()&&!busy&&Date.now()-lastActivity>=lockMinutes*60000){lockVault('automatic');}});


// Zwei Tresore vergleichen. Der zweite Tresor wird ausschließlich im Arbeitsspeicher geöffnet.
let syncState=null;
function updateSyncButton(){
    $('importVault').classList.toggle('hidden',!active()||source!=='browser');
    $('syncToggle').classList.toggle('hidden',!active()||(source==='file'&&localStorage.getItem(STORE)===null));
}
function closeSync(){
    $('syncPanelTitle').textContent='⇄ Tresore synchronisieren';
    $('syncApply').textContent='Auswahl prüfen und synchronisieren';
    syncState=null;
    $('syncPanel').classList.add('hidden');
    $('syncDiff').classList.add('hidden');
    $('syncMasterStep').classList.add('hidden');
    $('syncMasterPassword').value='';
    $('syncMasterChoice').value='both';
    $('syncSetup').classList.remove('hidden');
    $('syncRows').replaceChildren();
    $('syncPassword').value='';
    $('syncFile').value='';
}
function syncKey(e){return JSON.stringify([e.url.trim().toLocaleLowerCase('de'),e.username.trim().toLocaleLowerCase('de')]);}
function validSyncEntries(entries){
    if(!Array.isArray(entries)||!entries.every(e=>e&&typeof e.url==='string'&&typeof e.username==='string'&&typeof e.password==='string'))throw Error('Ungültige Einträge');
    const keys=entries.map(syncKey);
    if(new Set(keys).size!==keys.length)throw Error('Doppelte Website-/Benutzername-Kombinationen im Tresor. Bitte vor dem Synchronisieren bereinigen.');
    return entries;
}
function syncText(tag,text,cls=''){
    const node=document.createElement(tag);node.textContent=text;if(cls)node.className=cls;return node;
}
function syncDownload(raw,name){
    const url=URL.createObjectURL(new Blob([raw],{type:'application/json'}));
    const a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();
    setTimeout(()=>URL.revokeObjectURL(url),60000);
}
function syncOpenPanel(){
    if(!active()||busy)return;
    closeSync();
    $('syncPanel').dataset.mode='sync';
    $('syncPanel').classList.remove('hidden');
    $('syncFileLabel').classList.toggle('hidden',source==='file');
    $('syncIntro').textContent=source==='file'
        ? 'Externer Tresor ist geöffnet. Gib das Master-Passwort des vorhandenen Browser-Tresors ein. Beide Passwörter dürfen unterschiedlich sein.'
        : 'Browser-Tresor ist geöffnet. Wähle die externe .enc-Datei und gib deren Master-Passwort ein.';
    $('syncPasswordLabel').firstChild.textContent=source==='file'?'Master-Passwort des Browser-Tresors':'Master-Passwort der externen Datei';
    $('syncPanel').scrollIntoView({behavior:'smooth',block:'nearest'});
}
function importOpenPanel(){
    if(!active()||busy||source!=='browser')return;
    syncOpenPanel();
    $('syncPanelTitle').textContent='📥 Tresor importieren';
    $('syncIntro').textContent='Wähle die externe .enc-Datei und gib ihr Master-Passwort ein. Nur der Browser-Tresor wird verändert; die externe Datei bleibt unverändert.';
    $('syncApply').textContent='Import prüfen';
    $('syncPanel').dataset.mode='import';
}
async function syncCompare(){
    if(!active()||busy)return;
    const password=$('syncPassword').value;
    if(!password){message('Master-Passwort des zweiten Tresors eingeben.');return;}
    busy=true;
    try{
        let browser,external,browserKey,browserSalt,externalKey,externalSalt,originalBrowserRaw,originalExternalRaw;
        if(source==='browser'){
            const file=$('syncFile').files[0];
            if(!file||file.size>10*1024*1024)throw Error('Bitte eine .enc-Datei bis 10 MB auswählen.');
            const raw=await file.text();
            originalExternalRaw=raw;
            const opened=await PasswordCrypto.open(JSON.parse(raw),password);
            external=validSyncEntries(JSON.parse(opened.plaintext));
            externalKey=opened.key;externalSalt=opened.salt;
            browser=validSyncEntries(decryptedVault);
            browserKey=sessionKey;browserSalt=sessionSalt;
            originalBrowserRaw=localStorage.getItem(STORE);
        }else{
            originalBrowserRaw=localStorage.getItem(STORE);
            if(originalBrowserRaw===null)throw Error('Kein Browser-Tresor vorhanden.');
            const opened=await PasswordCrypto.open(JSON.parse(originalBrowserRaw),password);
            browser=validSyncEntries(JSON.parse(opened.plaintext));
            browserKey=opened.key;browserSalt=opened.salt;
            external=validSyncEntries(decryptedVault);
            originalExternalRaw=fileRawData;
            externalKey=sessionKey;externalSalt=sessionSalt;
        }
        const bm=new Map(browser.map(e=>[syncKey(e),e]));
        const em=new Map(external.map(e=>[syncKey(e),e]));
        const differences=[];
        for(const key of new Set([...bm.keys(),...em.keys()])){
            const b=bm.get(key),e=em.get(key);
            if(b&&e&&JSON.stringify(b)===JSON.stringify(e))continue;
            // Nur ein abweichendes Änderungsdatum zählt nicht als Passwortkonflikt.
            if(b&&e&&b.url===e.url&&b.username===e.username&&b.password===e.password)continue;
            differences.push({key,b,e,choice:b&&!e?'browser':e&&!b?'external':null});
        }
        syncState={browser,external,browserKey,browserSalt,externalKey,externalSalt,originalBrowserRaw,originalExternalRaw,differences,mode:$('syncPanel').dataset.mode};
        $('syncPassword').value='';
        renderSyncDiff();
        $('syncSetup').classList.add('hidden');$('syncDiff').classList.remove('hidden');
        message('Unterschiede geladen. Es wurde noch nichts gespeichert.');
    }catch(e){message('Vergleich fehlgeschlagen: '+(e.message==='OperationError'?'Master-Passwort prüfen.':e.message));}
    finally{busy=false;}
}
function renderSyncDiff(){
    const rows=$('syncRows');rows.replaceChildren();
    const differences=syncState.differences;
    $('syncSummary').textContent=differences.length?`${differences.length} Unterschied(e). Links: Browser-Tresor · Rechts: externe .enc-Datei. Passwörter sind zunächst verborgen.`:'Keine inhaltlichen Unterschiede gefunden. Es wird nichts verändert.';
    $('syncApply').disabled=!differences.length;
    if(syncState.mode==='import')$('syncSummary').textContent+=' Beim Import wird ausschließlich der Browser-Tresor aktualisiert.';
    differences.forEach((item,index)=>{
        const wrapper=syncText('article','', 'sync-item');
        wrapper.append(syncText('strong',item.b?.url||item.e.url));
        wrapper.append(syncText('p',item.b?.username||item.e.username,'sync-note'));
        const sides=syncText('div','', 'sync-diff');
        for(const [entry,label] of [[item.b,'Browser-Tresor'],[item.e,'Externe .enc-Datei']]){
            const side=syncText('div','', 'sync-side '+(!entry?'':'changed'));
            side.append(syncText('strong',label));
            if(!entry){side.append(syncText('p','− Eintrag fehlt'));}
            else{
                side.append(syncText('p','Website: '+entry.url));
                side.append(syncText('p','Benutzername: '+entry.username));
                const secret=syncText('span','••••••••','sync-secret');
                const line=syncText('p','Passwort: ');line.append(secret);
                const eye=syncText('button','👁 Anzeigen');eye.type='button';eye.className='btn-secondary';
                eye.setAttribute('aria-label','Passwort in '+label+' anzeigen');
                eye.addEventListener('click',()=>{const visible=secret.textContent==='••••••••';secret.textContent=visible?entry.password:'••••••••';eye.textContent=visible?'Verbergen':'👁 Anzeigen';});
                side.append(line,eye);
                if(entry.updatedAt)side.append(syncText('p','Geändert: '+entry.updatedAt,'sync-note'));
            }
            sides.append(side);
        }
        wrapper.append(sides);
        const options=syncText('div','', 'sync-choice');
        const choices=item.b&&item.e?[['browser','Browser-Version übernehmen'],['external','Externe Version übernehmen'],['both','Beide Einträge behalten']]:[[item.b?'browser':'external','Fehlenden Eintrag ergänzen'],['skip','Nicht übernehmen']];
        for(const [value,label] of choices){
            const radio=document.createElement('input');radio.type='radio';radio.name='syncChoice'+index;radio.value=value;radio.checked=item.choice===value;
            radio.addEventListener('change',()=>{item.choice=value;});
            const option=syncText('label',label);option.prepend(radio);options.append(option);
        }
        wrapper.append(options);rows.append(wrapper);
    });
}
function syncChooseMaster(){
    if(!active()||busy||!syncState)return;
    if(syncState.differences.some(d=>d.choice===null)){
        message('Bitte für jeden Konflikt eine Auswahl treffen.');return;
    }
    if(localStorage.getItem(STORE)!==syncState.originalBrowserRaw){
        message('Browser-Tresor zwischenzeitlich verändert. Vergleich bitte neu starten.');closeSync();return;
    }
    if(syncState.mode==='import'){importApply();return;}
    $('syncDiff').classList.add('hidden');
    $('syncMasterStep').classList.remove('hidden');
    $('syncMasterChoice').value='both';
    $('syncMasterPassword').value='';
    syncMasterChoiceChanged();
    $('syncMasterStep').scrollIntoView({behavior:'smooth',block:'nearest'});
}
async function importApply(){
    if(!active()||busy||source!=='browser'||!syncState||syncState.mode!=='import')return;
    const state=syncState;
    if(state.differences.some(d=>d.choice===null)){
        message('Bitte für jeden Konflikt eine Auswahl treffen.');return;
    }
    if(localStorage.getItem(STORE)!==state.originalBrowserRaw){
        message('Browser-Tresor zwischenzeitlich verändert. Import bitte neu starten.');closeSync();return;
    }
    const merged=new Map(state.browser.map(e=>[syncKey(e),e])),extra=[];
    for(const d of state.differences){
        if(d.choice==='skip'||d.choice==='browser')continue;
        if(d.choice==='external')merged.set(d.key,d.e);
        if(d.choice==='both'){
            let copy={...d.e,username:d.e.username+' (extern)'},n=2;
            while(merged.has(syncKey(copy))||extra.some(e=>syncKey(e)===syncKey(copy)))
                copy={...d.e,username:d.e.username+' (extern '+n+++')'};
            extra.push(copy);
        }
    }
    const result=[...merged.values(),...extra];
    if(!confirm(`Import vorbereiten? Der Browser-Tresor wird ${result.length} Einträge enthalten. Die externe Datei bleibt unverändert.`))return;
    busy=true;
    try{
        const encrypted=JSON.stringify(await PasswordCrypto.encrypt(JSON.stringify(result),state.browserKey,state.browserSalt));
        syncDownload(state.originalBrowserRaw,'browser_tresor_sicherung_vor_import.enc');
        if(!confirm('Sicherung des bisherigen Browser-Tresors wurde zum Download angeboten. Bitte prüfe, ob sie gespeichert ist. Jetzt den Browser-Tresor aktualisieren?')){
            message('Import abgebrochen: Browser-Tresor unverändert.');return;
        }
        if(localStorage.getItem(STORE)!==state.originalBrowserRaw)throw Error('Browser-Tresor zwischenzeitlich verändert.');
        localStorage.setItem(STORE,encrypted);
        decryptedVault=result;
        revealed.clear();clearEditor();renderPasswords();closeSync();
        message('Import abgeschlossen. Browser-Tresor aktualisiert; externe Datei unverändert.');
    }catch(e){message('Import fehlgeschlagen: '+e.message);}
    finally{busy=false;}
}
function syncMasterChoiceChanged(){
    const choice=$('syncMasterChoice').value;
    $('syncMasterPasswordLabel').classList.toggle('hidden',choice==='both');
    $('syncMasterPasswordLabelText').textContent=choice==='browser'
        ? 'Browser-Master-Passwort zur Bestätigung'
        : 'Externes Master-Passwort zur Bestätigung';
    $('syncMasterPassword').value='';
    $('syncMasterExplanation').textContent=choice==='both'
        ? 'Jeder Tresor behält sein eigenes Master-Passwort. Die Einträge werden angeglichen.'
        : 'Beide Tresore werden mit dem ausgewählten Master-Passwort neu verschlüsselt. Die bisherige externe Datei bleibt unverändert, bis du sie selbst ersetzt.';
}
async function syncApply(){
    if(!active()||busy||!syncState)return;
    const s=syncState,choice=$('syncMasterChoice').value;
    if(!['both','browser','external'].includes(choice))return;
    if(s.differences.some(d=>d.choice===null)){
        message('Bitte für jeden Konflikt eine Auswahl treffen.');return;
    }
    if(localStorage.getItem(STORE)!==s.originalBrowserRaw){
        message('Browser-Tresor zwischenzeitlich verändert. Vergleich bitte neu starten.');closeSync();return;
    }
    const password=$('syncMasterPassword').value;
    if(choice!=='both'&&!password){message('Bitte das ausgewählte Master-Passwort bestätigen.');return;}
    const merged=new Map(s.browser.map(e=>[syncKey(e),e])),extra=[];
    for(const d of s.differences){
        if(d.choice==='skip')continue;
        if(d.choice==='browser')merged.set(d.key,d.b);
        if(d.choice==='external')merged.set(d.key,d.e);
        if(d.choice==='both'){
            merged.set(d.key,d.b);
            let copy={...d.e,username:d.e.username+' (extern)'},n=2;
            while(merged.has(syncKey(copy))||extra.some(e=>syncKey(e)===syncKey(copy)))
                copy={...d.e,username:d.e.username+' (extern '+n+++')'};
            extra.push(copy);
        }
    }
    const result=[...merged.values(),...extra];
    if(!confirm(`Synchronisierung vorbereiten? ${result.length} Einträge werden in beide Tresore übernommen. Der Browser-Tresor wird erst nach einer weiteren Bestätigung überschrieben.`))return;
    busy=true;
    try{
        let browserKey=s.browserKey,browserSalt=s.browserSalt;
        let externalKey=s.externalKey,externalSalt=s.externalSalt;
        if(choice!=='both'){
            const raw=choice==='browser'?s.originalBrowserRaw:s.originalExternalRaw;
            // Das ausgewählte Master-Passwort gegen den ORIGINAL-Tresor prüfen.
            await PasswordCrypto.open(JSON.parse(raw),password);
            // Neue Salze und Schlüssel: beide Ausgaben mit demselben Master-Passwort.
            const browserReplacement=await PasswordCrypto.create(password);
            const externalReplacement=await PasswordCrypto.create(password);
            browserKey=browserReplacement.key;browserSalt=browserReplacement.salt;
            externalKey=externalReplacement.key;externalSalt=externalReplacement.salt;
        }
        const browserNew=JSON.stringify(await PasswordCrypto.encrypt(JSON.stringify(result),browserKey,browserSalt));
        const externalNew=JSON.stringify(await PasswordCrypto.encrypt(JSON.stringify(result),externalKey,externalSalt));
        syncDownload(s.originalBrowserRaw,'browser_tresor_sicherung_vor_sync.enc');
        syncDownload(externalNew,'passwort_tresor_synchronisiert.enc');
        if(!confirm('Downloads für Browser-Sicherung und neue externe .enc-Datei wurden gestartet. Prüfe, ob BEIDE Dateien gespeichert wurden. Erst dann den Browser-Tresor überschreiben?')){
            message('Abgebrochen: Browser-Tresor unverändert. Die heruntergeladenen Dateien bitte prüfen.');return;
        }
        if(localStorage.getItem(STORE)!==s.originalBrowserRaw)throw Error('Browser-Tresor zwischenzeitlich verändert.');
        localStorage.setItem(STORE,browserNew);
        decryptedVault=result;
        if(source==='browser'){
            sessionKey=browserKey;sessionSalt=browserSalt;
        }else{
            sessionKey=externalKey;sessionSalt=externalSalt;
            fileRawData=externalNew;
            dirty=true;
        }
        revealed.clear();clearEditor();renderPasswords();closeSync();
        message('Browser-Tresor aktualisiert. Neue externe .enc-Datei prüfen und die alte Datei erst danach ersetzen.');
    }catch(e){
        message('Synchronisierung fehlgeschlagen: Master-Passwort prüfen oder '+e.message);
    }finally{
        $('syncMasterPassword').value='';
        busy=false;
    }
}
$('syncToggle').addEventListener('click',syncOpenPanel);
$('importVault').addEventListener('click',importOpenPanel);
$('syncCancel').addEventListener('click',closeSync);
$('syncBack').addEventListener('click',closeSync);
$('syncCompare').addEventListener('click',syncCompare);
$('syncApply').addEventListener('click',syncChooseMaster);
$('syncMasterChoice').addEventListener('change',syncMasterChoiceChanged);
$('syncMasterBack').addEventListener('click',()=>{$('syncMasterPassword').value='';$('syncMasterStep').classList.add('hidden');$('syncDiff').classList.remove('hidden');});
$('syncProceed').addEventListener('click',syncApply);
updateSyncButton();
