/* ============================================================
   MEDICORE – app.js
   All Auth Logic + 10 Dashboard Modules + BACKEND API
   ============================================================ */

const API_BASE = 'http://localhost:8080/api';

/* ============================================================
   SEED DATA
   ============================================================ */
const WARDS     = ['ICU','General','Pediatric','Maternity','Emergency'];
const WARD_CAP  = { ICU:20, General:40, Pediatric:20, Maternity:20, Emergency:20 };
const WARD_CLR  = { ICU:'#ff5252', General:'#00c8ff', Pediatric:'#ffab40', Maternity:'#b388ff', Emergency:'#00e676' };

const rndName = () => {
  const f=['Arjun','Priya','Rahul','Ananya','Vikram','Divya','Amit','Sneha','Ravi','Pooja','Suresh','Meera','Kiran','Deepak','Lavanya'];
  const l=['Sharma','Verma','Patel','Kumar','Singh','Gupta','Nair','Reddy','Iyer','Joshi'];
  return f[~~(Math.random()*f.length)]+' '+l[~~(Math.random()*l.length)];
};
const rndDoc  = () => ['Dr. Anil Mehta','Dr. Priya Sharma','Dr. Suresh Nair','Dr. Kavita Reddy','Dr. Rajesh Kumar','Dr. Meena Iyer'][~~(Math.random()*6)];
const rndDiag = () => ['Hypertension','Fracture','Appendicitis','Diabetes','Pneumonia','Post-surgery','Cardiac Arrest','Fever','Burns','COVID-19'][~~(Math.random()*10)];
const rndIssue= () => ['Broken frame','Faulty IV stand','Mattress replacement','Electrical fault','Oxygen outlet issue','Side rail broken'][~~(Math.random()*6)];
const rndDate = (d) => { const dt=new Date(); dt.setDate(dt.getDate()-~~(Math.random()*d)); return dt.toISOString().split('T')[0]; };
const todayStr= () => new Date().toISOString().split('T')[0];
const nowStr  = () => new Date().toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'});

// USERS (array mutated by register/reset)
const USERS = [
  { name:'Admin User',        username:'admin',  password:'password123', role:'admin',  email:'admin@medicore.com',  status:'Active' },
  { name:'Dr. Priya Sharma',  username:'doctor', password:'password123', role:'doctor', email:'doctor@medicore.com', status:'Active' },
  { name:'Nurse Kavya',       username:'nurse',  password:'password123', role:'nurse',  email:'nurse@medicore.com',  status:'Active' },
];

// BEDS
const beds = [];
(function seedBeds(){
  let id=1;
  WARDS.forEach(w => {
    for(let i=1;i<=WARD_CAP[w];i++){
      const r=Math.random();
      const st = r<.55?'occupied':r<.65?'maint':r<.70?'reserved':'avail';
      beds.push({ id:id++, bedNo:`${w[0]}${String(i).padStart(2,'0')}`, ward:w, status:st,
        patient:st==='occupied'?rndName():null, patientId:st==='occupied'?`P${100+id}`:null,
        admitDate:st==='occupied'?rndDate(30):null, doctor:st==='occupied'?rndDoc():null });
    }
  });
})();

// PATIENTS (seed from occupied beds)
const patients = [];
beds.filter(b=>b.status==='occupied').forEach(b => {
  patients.push({ id:b.patientId, name:b.patient, age:20+~~(Math.random()*60),
    gender:Math.random()>.5?'Male':'Female', ward:b.ward, bedNo:b.bedNo,
    bedId:b.id, doctor:b.doctor, diagnosis:rndDiag(),
    admitDate:b.admitDate, contact:`+91 98${~~(Math.random()*90000000+10000000)}`, status:'admitted' });
});

// MAINTENANCE LOG
const maintLog = [];
beds.filter(b=>b.status==='maint').slice(0,8).forEach((b,i) => {
  maintLog.push({ id:`M${i+1}`, bedNo:b.bedNo, ward:b.ward, bedId:b.id,
    issue:rndIssue(), priority:['High','Medium','Low'][~~(Math.random()*3)],
    status:['Open','In Progress','Resolved'][~~(Math.random()*3)], date:rndDate(14) });
});

// TRANSFER LOG
const transferLog = [];

// HISTORY LOG
const historyLog = [];
beds.filter(b=>b.status==='occupied').slice(0,10).forEach((b,i) => {
  historyLog.push({ id:`H${i+1}`, patientId:b.patientId, name:b.patient,
    ward:b.ward, bed:b.bedNo, admitDate:b.admitDate, dischargeDate:null,
    doctor:b.doctor, status:'Admitted' });
});
for(let i=0;i<10;i++){
  const w=WARDS[~~(Math.random()*5)];
  historyLog.push({ id:`H${i+20}`, patientId:`P${300+i}`, name:rndName(), ward:w,
    bed:`${w[0]}${String(~~(Math.random()*20)+1).padStart(2,'0')}`,
    admitDate:rndDate(60), dischargeDate:rndDate(10), doctor:rndDoc(), status:'Discharged' });
}

// ALERTS
const alertsList = [
  { id:'A1', type:'critical', title:'ICU at 90% Capacity',         msg:'Only 2 ICU beds remaining. Consider transfers.',        time:'2 min ago',  icon:'fa-exclamation-triangle' },
  { id:'A2', type:'warning',  title:'Emergency Ward Near Full',     msg:'Emergency ward at 85% occupancy.',                      time:'15 min ago', icon:'fa-bolt' },
  { id:'A3', type:'warning',  title:'3 Beds Under Maintenance',     msg:'General ward beds G07, G12, G18 flagged.',              time:'1 hr ago',   icon:'fa-tools' },
  { id:'A4', type:'info',     title:'Patient Transfer Completed',   msg:'Patient P108 transferred from ICU to General.',         time:'2 hr ago',   icon:'fa-exchange-alt' },
  { id:'A5', type:'info',     title:'Scheduled Maintenance Done',   msg:'Bed P06 maintenance resolved by team.',                 time:'3 hr ago',   icon:'fa-check-circle' },
];

let alertFilter = 'all';
let currentUser = null;
let otpCode     = '';

/* ============================================================
   HELPERS
   ============================================================ */
function nextPid(){ return `P${1000+patients.length+1}`; }

function updateStats(){
  const tot  = beds.length;
  const avail= beds.filter(b=>b.status==='avail').length;
  const occ  = beds.filter(b=>b.status==='occupied').length;
  const maint= beds.filter(b=>b.status==='maint').length;
  document.getElementById('sTot').textContent  = tot;
  document.getElementById('sAvail').textContent= avail;
  document.getElementById('sOcc').textContent  = occ;
  document.getElementById('sMaint').textContent= maint;
  document.getElementById('sRate').textContent = Math.round(occ/tot*100)+'%';
}

function showToast(msg, isErr){
  const t=document.getElementById('toast');
  document.getElementById('toastTxt').textContent = msg;
  t.className = 'toast'+(isErr?' err':'');
  t.querySelector('i').className = isErr?'fas fa-times-circle':'fas fa-check-circle';
  t.classList.remove('hidden');
  clearTimeout(showToast._t);
  showToast._t = setTimeout(()=>t.classList.add('hidden'),3400);
}

function addAlert(type,title,msg,icon){
  alertsList.unshift({ id:`A${Date.now()}`, type, title, msg, time:'just now', icon:`fa-${icon}` });
  document.getElementById('alertBadge').textContent = alertsList.filter(a=>a.type!=='info').length;
}

/* ============================================================
   AUTH – VIEW SWITCHING
   ============================================================ */
function showView(v){
  ['viewLogin','viewRegister','viewForgot'].forEach(id => document.getElementById(id).classList.add('hidden'));
  document.getElementById('view'+v.charAt(0).toUpperCase()+v.slice(1)).classList.remove('hidden');

  const tabs  = document.getElementById('authTabs');
  const tLogin= document.getElementById('tabLogin');
  const tReg  = document.getElementById('tabRegister');
  const icon  = document.getElementById('brandIcon').querySelector('i');
  const title = document.getElementById('brandTitle');
  const sub   = document.getElementById('brandSub');

  if(v==='login'){
    tabs.style.display=''; tLogin.classList.add('active'); tReg.classList.remove('active');
    icon.className='fas fa-hospital-user'; title.textContent='MediCore'; sub.textContent='Hospital Bed Management System';
    document.getElementById('loginMsg').classList.add('hidden');
  } else if(v==='register'){
    tabs.style.display=''; tReg.classList.add('active'); tLogin.classList.remove('active');
    icon.className='fas fa-user-plus'; title.textContent='Create Account'; sub.textContent='Fill in your details to register';
    document.getElementById('registerMsg').classList.add('hidden');
    document.getElementById('strengthBar').style.width='0%';
    document.getElementById('strengthTxt').textContent='—';
  } else if(v==='forgot'){
    tabs.style.display='none';
    icon.className='fas fa-key'; title.textContent='Reset Password'; sub.textContent='Recover access to your account';
    document.getElementById('fStep1').classList.remove('hidden');
    document.getElementById('fStep2').classList.add('hidden');
    document.getElementById('forgotMsg').classList.add('hidden');
  }
}

/* Tab clicks (already wired via onclick in HTML) */

/* ============================================================
   LOGIN
   ============================================================ */
document.getElementById('loginForm').addEventListener('submit', async function(e){
  e.preventDefault();
  const u = document.getElementById('lUser').value.trim();
  const p = document.getElementById('lPass').value;
  const r = document.getElementById('lRole').value;
  
  // Validate against known users first (authoritative & always available);
  // the backend is treated as optional enrichment, not a hard dependency.
  let match = USERS.find(x=>x.username===u && x.password===p && x.role===r);
  if(!match){
    const apiUser = await apiLogin(u, p, r);
    if(apiUser){ match = { name: apiUser.name || u, role: apiUser.role || r, username: u }; }
  }

  const msg = document.getElementById('loginMsg');
  if(match){
    currentUser = match;
    document.getElementById('authPage').classList.add('hidden');
    document.getElementById('dashboard').classList.remove('hidden');
    document.getElementById('sbName').textContent   = match.name;
    document.getElementById('sbRole').textContent   = match.role.charAt(0).toUpperCase()+match.role.slice(1);
    document.getElementById('sbAvatar').textContent = match.name[0];
    updateStats();
    openMod('bedMap');
    startClock();
    renderAdminPanel();
    populateTransferPatients();
    showToast('Login successful!', false);
  } else {
    msg.textContent='Invalid credentials. Please try again.';
    msg.className='msg error';
    msg.classList.remove('hidden');
    setTimeout(()=>msg.classList.add('hidden'),3500);
  }
});

function doLogout(){
  document.getElementById('dashboard').classList.add('hidden');
  document.getElementById('authPage').classList.remove('hidden');
  document.getElementById('lUser').value='';
  document.getElementById('lPass').value='';
  showView('login');
}

/* ============================================================
   BACKEND API FUNCTIONS
   ============================================================ */
async function apiLogin(username, password, role) {
  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password, role })
    });
    if(!res.ok) return null;
    const data = await res.json();
    // Backend wraps the user as {success, user:{...}} — unwrap it.
    return data && data.success ? (data.user || null) : null;
  } catch (e) { console.log('API Login Error:', e); return null; }
}

async function getBedsFromAPI() {
  try {
    const res = await fetch(`${API_BASE}/beds`);
    return res.ok ? res.json() : beds;
  } catch (e) { console.log('Beds API Error, using local'); return beds; }
}

async function getPatientsFromAPI() {
  try {
    const res = await fetch(`${API_BASE}/patients`);
    return res.ok ? res.json() : patients;
  } catch (e) { console.log('Patients API Error, using local'); return patients; }
}

async function getStatsFromAPI() {
  try {
    const res = await fetch(`${API_BASE}/beds/stats`);
    return res.ok ? res.json() : null;
  } catch (e) { console.log('Stats API Error'); return null; }
}

async function submitAdmit(patient) {
  try {
    const res = await fetch(`${API_BASE}/patients/admit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patient)
    });
    return res.ok;
  } catch (e) { console.log('Admit API Error'); return false; }
}

/* ============================================================
   REGISTER
   ============================================================ */
function strengthCheck(val){
  let s=0;
  if(val.length>=8) s++;
  if(/[A-Z]/.test(val)) s++;
  if(/[0-9]/.test(val)) s++;
  if(/[^A-Za-z0-9]/.test(val)) s++;
  const lvl=[{w:'0%',c:'#ff5252',t:'—'},{w:'25%',c:'#ff5252',t:'Weak'},{w:'50%',c:'#ffab40',t:'Fair'},{w:'75%',c:'#00c8ff',t:'Good'},{w:'100%',c:'#00e676',t:'Strong'}];
  const l=lvl[s];
  const bar=document.getElementById('strengthBar');
  bar.style.width=l.w; bar.style.background=l.c;
  const txt=document.getElementById('strengthTxt');
  txt.textContent=l.t; txt.style.color=l.c;
}

document.getElementById('registerForm').addEventListener('submit', function(e){
  e.preventDefault();
  const name    = document.getElementById('rName').value.trim();
  const email   = document.getElementById('rEmail').value.trim();
  const user    = document.getElementById('rUser').value.trim();
  const pass    = document.getElementById('rPass').value;
  const confirm = document.getElementById('rConfirm').value;
  const role    = document.getElementById('rRole').value;
  const dept    = document.getElementById('rDept').value.trim();
  const msg     = document.getElementById('registerMsg');

  function setMsg(txt,type){ msg.textContent=txt; msg.className='msg '+type; msg.classList.remove('hidden'); }

  if(!name||!email||!user||!pass){ setMsg('Please fill in all required fields.','error'); return; }
  if(!/\S+@\S+\.\S+/.test(email)){ setMsg('Enter a valid email address.','error'); return; }
  if(pass.length<8){ setMsg('Password must be at least 8 characters.','error'); return; }
  if(pass!==confirm){ setMsg('Passwords do not match.','error'); return; }
  if(USERS.find(x=>x.username===user)){ setMsg('Username already taken. Please choose another.','error'); return; }

  USERS.push({ name, email, username:user, password:pass, role, dept, status:'Active' });
  setMsg('Account created successfully! Redirecting to Sign In…','success');
  setTimeout(()=>{ showView('login'); document.getElementById('lUser').value=user; },2000);
});

/* ============================================================
   FORGOT PASSWORD
   ============================================================ */
document.getElementById('forgotForm').addEventListener('submit', function(e){
  e.preventDefault();
  const email = document.getElementById('fEmail').value.trim();
  const msg   = document.getElementById('forgotMsg');

  function setMsg(txt,type){ msg.textContent=txt; msg.className='msg '+type; msg.classList.remove('hidden'); }

  if(!email||!/\S+@\S+\.\S+/.test(email)){ setMsg('Enter a valid email address.','error'); return; }

  otpCode = String(~~(Math.random()*900000)+100000);
  setMsg(`OTP sent! (Demo code: ${otpCode})`, 'info');

  setTimeout(()=>{
    document.getElementById('fStep1').classList.add('hidden');
    document.getElementById('fStep2').classList.remove('hidden');
    document.getElementById('otpNotice').innerHTML = `<i class="fas fa-circle-check"></i> Code sent to ${email}. Demo OTP: <strong style="font-family:'Space Mono',monospace">${otpCode}</strong>`;
    initOtpBoxes();
  }, 1600);
});

function initOtpBoxes(){
  const boxes = document.querySelectorAll('.otp-box');
  boxes.forEach((box,i)=>{
    box.value='';
    box.oninput = function(){
      this.value = this.value.replace(/\D/g,'').slice(0,1);
      if(this.value && i<boxes.length-1) boxes[i+1].focus();
    };
    box.onkeydown = function(ev){
      if(ev.key==='Backspace' && !this.value && i>0) boxes[i-1].focus();
    };
  });
  boxes[0].focus();
}

document.getElementById('resetForm').addEventListener('submit', function(e){
  e.preventDefault();
  const entered = Array.from(document.querySelectorAll('.otp-box')).map(b=>b.value).join('');
  const np  = document.getElementById('nPass').value;
  const nc  = document.getElementById('nConfirm').value;
  const msg = document.getElementById('resetMsg');

  function setMsg(txt,type){ msg.textContent=txt; msg.className='msg '+type; msg.classList.remove('hidden'); }

  if(entered.length<6){ setMsg('Enter the complete 6-digit OTP.','error'); return; }
  if(entered!==otpCode){ setMsg('Incorrect OTP. Please check and try again.','error'); return; }
  if(np.length<8){ setMsg('Password must be at least 8 characters.','error'); return; }
  if(np!==nc){ setMsg('Passwords do not match.','error'); return; }

  const email = document.getElementById('fEmail').value.trim();
  const found = USERS.find(u=>u.email===email);
  if(found) found.password=np;

  setMsg('Password reset successfully! Redirecting…','success');
  setTimeout(()=>{ showView('login'); otpCode=''; },2200);
});

/* ============================================================
   TOGGLE EYE (password show/hide)
   ============================================================ */
function toggleEye(inputId, btn){
  const el = document.getElementById(inputId);
  if(!el) return;
  const show = el.type==='password';
  el.type = show?'text':'password';
  btn.querySelector('i').className = show?'fas fa-eye-slash':'fas fa-eye';
}

/* ============================================================
   CLOCK
   ============================================================ */
function startClock(){
  function tick(){
    document.getElementById('clock').textContent =
      new Date().toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit',second:'2-digit'});
  }
  tick(); setInterval(tick,1000);
}

/* ============================================================
   MODULE SWITCHING
   ============================================================ */
const MOD_TITLES = {
  bedMap:'Bed Map', wardFilter:'Ward Filter', admitDis:'Admit / Discharge',
  transfer:'Transfer Flow', maintenance:'Maintenance', capacity:'Capacity Chart',
  alerts:'Alert System', history:'Patient History', export:'Export Data', admin:'Admin Panel'
};

function openMod(key){
  document.querySelectorAll('.mod').forEach(m=>{m.classList.add('hidden'); m.classList.remove('active');});
  const el = document.getElementById('mod-'+key);
  if(el){ el.classList.remove('hidden'); el.classList.add('active'); }
  document.querySelectorAll('.nav-item').forEach(n=>n.classList.toggle('active', n.dataset.mod===key));
  document.getElementById('tbTitle').textContent = MOD_TITLES[key]||key;
  const init={bedMap:renderBedMap, wardFilter:renderWardFilter, capacity:renderCapacity,
    alerts:renderAlerts, history:renderHistory, maintenance:renderMaintenance,
    admin:renderAdminPanel, transfer:populateTransferPatients};
  if(init[key]) init[key]();
}

document.querySelectorAll('.nav-item').forEach(item=>{
  item.addEventListener('click',function(e){
    e.preventDefault();
    openMod(this.dataset.mod);
    if(window.innerWidth<900) document.getElementById('sidebar').classList.remove('open');
  });
});

function toggleSidebar(){
  const sb = document.getElementById('sidebar');
  if(window.innerWidth<900){ sb.classList.toggle('open'); }
  else { sb.classList.toggle('collapsed'); document.querySelector('.main').classList.toggle('expanded', sb.classList.contains('collapsed')); }
}

/* ============================================================
   MODULE 1 – BED MAP
   ============================================================ */
function renderBedMap(){
  const filter = document.getElementById('bmWard').value;
  const grid   = document.getElementById('bedGrid');
  grid.innerHTML='';
  const wards = filter==='all'?WARDS:[filter];
  wards.forEach(ward=>{
    const lbl=document.createElement('div');
    lbl.className='bed-ward-lbl'; lbl.textContent=ward+' Ward';
    grid.appendChild(lbl);
    beds.filter(b=>b.ward===ward).forEach(bed=>{
      const cell=document.createElement('div');
      const statusClass={avail:'avail',occupied:'occupied',maint:'maint',reserved:'reserved'};
      const icons={avail:'fa-bed',occupied:'fa-user',maint:'fa-wrench',reserved:'fa-bookmark'};
      cell.className='bed-cell '+(statusClass[bed.status]||'avail');
      cell.innerHTML=`<i class="fas ${icons[bed.status]||'fa-bed'}"></i>${bed.bedNo}`;
      cell.addEventListener('mouseenter',ev=>showBedTip(ev,bed));
      cell.addEventListener('mouseleave',()=>document.getElementById('bedTip').classList.add('hidden'));
      cell.addEventListener('click',()=>handleBedClick(bed));
      grid.appendChild(cell);
    });
  });
}

function showBedTip(ev,bed){
  const t=document.getElementById('bedTip');
  const sl={avail:'Available',occupied:'Occupied',maint:'Maintenance',reserved:'Reserved'};
  t.innerHTML=`<strong>${bed.bedNo} – ${bed.ward}</strong>Status: ${sl[bed.status]}<br>${bed.patient?`Patient: ${bed.patient}<br>Admit: ${bed.admitDate}<br>Doctor: ${bed.doctor}`:''}`;
  t.style.left=(ev.clientX+14)+'px'; t.style.top=(ev.clientY-10)+'px';
  t.classList.remove('hidden');
}

function handleBedClick(bed){
  if(bed.status==='avail') showToast(`Bed ${bed.bedNo} is available. Use Admit form.`);
  else if(bed.status==='occupied') showToast(`${bed.bedNo}: ${bed.patient} – ${bed.doctor}`);
  else if(bed.status==='maint') showToast(`Bed ${bed.bedNo} is under maintenance.`,true);
  else showToast(`Bed ${bed.bedNo} is reserved.`);
}

/* ============================================================
   MODULE 2 – WARD FILTER
   ============================================================ */
function renderWardFilter(){
  const cont=document.getElementById('wardCards');
  cont.innerHTML='';
  WARDS.forEach(ward=>{
    const wb=beds.filter(b=>b.ward===ward);
    const occ=wb.filter(b=>b.status==='occupied').length;
    const avail=wb.filter(b=>b.status==='avail').length;
    const maint=wb.filter(b=>b.status==='maint').length;
    const pct=Math.round(occ/wb.length*100);
    const c=document.createElement('div');
    c.className='ward-card';
    c.innerHTML=`<div class="wc-name" style="color:${WARD_CLR[ward]}">${ward}</div>
      <div class="wc-track"><div class="wc-fill" style="width:${pct}%;background:${WARD_CLR[ward]}"></div></div>
      <div style="font-size:.72rem;color:var(--muted);margin-bottom:.35rem">${pct}% Occupied</div>
      <div class="wc-stats"><span><b style="color:var(--green)">${avail}</b> Avail</span><span><b style="color:var(--orange)">${occ}</b> Occ</span><span><b style="color:var(--red)">${maint}</b> Maint</span></div>`;
    c.addEventListener('click',()=>showWardDetail(ward));
    cont.appendChild(c);
  });
  showWardDetail(WARDS[0]);
}

function showWardDetail(ward){
  document.querySelectorAll('.ward-card').forEach((c,i)=>c.classList.toggle('sel',WARDS[i]===ward));
  const wb=beds.filter(b=>b.ward===ward);
  document.getElementById('wardDetail').innerHTML=`
    <h3 style="margin-bottom:.75rem;font-size:.95rem;">${ward} Ward – Bed Details</h3>
    <table class="dtable"><thead><tr><th>Bed</th><th>Status</th><th>Patient</th><th>Admit Date</th><th>Doctor</th></tr></thead>
    <tbody>${wb.map(b=>`<tr><td>${b.bedNo}</td><td><span class="badge-s bs-${b.status==='maint'?'maint':b.status}">${b.status.charAt(0).toUpperCase()+b.status.slice(1)}</span></td><td>${b.patient||'—'}</td><td>${b.admitDate||'—'}</td><td>${b.doctor||'—'}</td></tr>`).join('')}</tbody></table>`;
}

/* ============================================================
   MODULE 3 – ADMIT / DISCHARGE
   ============================================================ */
function switchTab(tab,btn){
  document.querySelectorAll('.ftab').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById('admitForm').classList.toggle('hidden',tab!=='admit');
  document.getElementById('dischargeForm').classList.toggle('hidden',tab!=='discharge');
  if(tab==='discharge') renderDischargeList();
}

function fillAdmitBeds(){
  const ward=document.getElementById('aWard').value;
  const sel=document.getElementById('aBed');
  sel.innerHTML='';
  const avail=beds.filter(b=>b.ward===ward&&b.status==='avail');
  avail.forEach(b=>{ const o=document.createElement('option'); o.value=b.id; o.textContent=b.bedNo; sel.appendChild(o); });
  if(!sel.options.length) sel.innerHTML='<option disabled>No available beds</option>';
}

function admitPatient(){
  const name=document.getElementById('aName').value.trim();
  const age=document.getElementById('aAge').value;
  const gender=document.getElementById('aGender').value;
  const ward=document.getElementById('aWard').value;
  const bedId=parseInt(document.getElementById('aBed').value);
  const doctor=document.getElementById('aDoc').value.trim();
  const diag=document.getElementById('aDiag').value.trim();
  const admitDate=document.getElementById('aDate').value||todayStr();
  const contact=document.getElementById('aContact').value.trim();
  if(!name||!age||!bedId){ showToast('Fill required fields.',true); return; }
  const bed=beds.find(b=>b.id===bedId);
  if(!bed||bed.status!=='avail'){ showToast('Bed not available.',true); return; }
  const pid=nextPid();
  bed.status='occupied'; bed.patient=name; bed.patientId=pid; bed.admitDate=admitDate; bed.doctor=doctor;
  patients.push({id:pid,name,age,gender,ward,bedNo:bed.bedNo,bedId,doctor,diagnosis:diag,admitDate,contact,status:'admitted'});
  historyLog.unshift({id:`H${historyLog.length+1}`,patientId:pid,name,ward,bed:bed.bedNo,admitDate,dischargeDate:null,doctor,status:'Admitted'});
  addAlert('info',`Admitted: ${name}`,`${ward} ward – Bed ${bed.bedNo}`,'user-plus');
  updateStats(); fillAdmitBeds(); populateTransferPatients();
  showToast(`${name} admitted to bed ${bed.bedNo}`);
  ['aName','aAge','aDoc','aDiag','aContact'].forEach(id=>{ const el=document.getElementById(id); if(el) el.value=''; });
}

function renderDischargeList(){
  const q=(document.getElementById('disSearch').value||'').toLowerCase();
  const list=document.getElementById('disList');
  const src=patients.filter(p=>p.status==='admitted');
  const res=q?src.filter(p=>p.name.toLowerCase().includes(q)||p.id.toLowerCase().includes(q)):src;
  list.innerHTML='';
  if(!res.length){list.innerHTML='<p style="color:var(--muted);font-size:.84rem;">No patients found.</p>';return;}
  res.slice(0,12).forEach(p=>{
    const d=document.createElement('div'); d.className='dis-item';
    d.innerHTML=`<div class="dis-item-info"><strong>${p.name} <span style="font-weight:400;color:var(--muted);font-size:.78rem">(${p.id})</span></strong><small>${p.ward} • Bed ${p.bedNo} • Admitted: ${p.admitDate} • ${p.doctor}</small></div><button class="btn-p btn-sm" onclick="dischargePatient('${p.id}')"><i class="fas fa-sign-out-alt"></i> Discharge</button>`;
    list.appendChild(d);
  });
}

function dischargePatient(pid){
  const pat=patients.find(p=>p.id===pid); if(!pat) return;
  const bed=beds.find(b=>b.id===pat.bedId);
  if(bed){bed.status='avail';bed.patient=null;bed.patientId=null;bed.admitDate=null;bed.doctor=null;}
  pat.status='discharged'; pat.dischargeDate=todayStr();
  const h=historyLog.find(x=>x.patientId===pid&&!x.dischargeDate);
  if(h){h.dischargeDate=todayStr();h.status='Discharged';}
  addAlert('info',`Discharged: ${pat.name}`,`Released from ${pat.ward} – Bed ${pat.bedNo}`,'sign-out-alt');
  updateStats(); populateTransferPatients(); renderDischargeList();
  showToast(`${pat.name} discharged successfully.`);
}

/* ============================================================
   MODULE 4 – TRANSFER
   ============================================================ */
function populateTransferPatients(){
  const sel=document.getElementById('trPat'); if(!sel) return;
  sel.innerHTML='<option value="">Select patient</option>';
  patients.filter(p=>p.status==='admitted').forEach(p=>{
    const o=document.createElement('option'); o.value=p.id; o.textContent=`${p.name} (${p.bedNo})`; sel.appendChild(o);
  });
  renderTransferTable();
}

function fillTransferFrom(){
  const pid=document.getElementById('trPat').value;
  const pat=patients.find(p=>p.id===pid);
  document.getElementById('trFrom').value = pat?`${pat.ward} – ${pat.bedNo}`:'';
}

function fillTransferBeds(){
  const ward=document.getElementById('trWard').value;
  const sel=document.getElementById('trBed');
  sel.innerHTML='';
  beds.filter(b=>b.ward===ward&&b.status==='avail').forEach(b=>{
    const o=document.createElement('option'); o.value=b.id; o.textContent=b.bedNo; sel.appendChild(o);
  });
  if(!sel.options.length) sel.innerHTML='<option disabled>No available beds</option>';
}

function doTransfer(){
  const pid=document.getElementById('trPat').value;
  const toWard=document.getElementById('trWard').value;
  const toBedId=parseInt(document.getElementById('trBed').value);
  const reason=document.getElementById('trReason').value.trim();
  if(!pid||!toWard||!toBedId){showToast('Fill all transfer fields.',true);return;}
  const pat=patients.find(p=>p.id===pid);
  const toBed=beds.find(b=>b.id===toBedId);
  const fromBed=beds.find(b=>b.id===pat.bedId);
  if(!toBed||toBed.status!=='avail'){showToast('Target bed not available.',true);return;}
  const fromLabel=`${pat.ward} – ${pat.bedNo}`;
  if(fromBed){fromBed.status='avail';fromBed.patient=null;fromBed.patientId=null;fromBed.admitDate=null;fromBed.doctor=null;}
  toBed.status='occupied';toBed.patient=pat.name;toBed.patientId=pat.id;toBed.admitDate=pat.admitDate;toBed.doctor=pat.doctor;
  pat.ward=toWard;pat.bedNo=toBed.bedNo;pat.bedId=toBedId;
  transferLog.unshift({patient:pat.name,from:fromLabel,to:`${toWard} – ${toBed.bedNo}`,reason:reason||'N/A',time:nowStr()});
  addAlert('info',`Transfer: ${pat.name}`,`${fromLabel} → ${toWard}–${toBed.bedNo}`,'exchange-alt');
  updateStats();populateTransferPatients();
  document.getElementById('trReason').value='';
  document.getElementById('trPat').value='';
  document.getElementById('trFrom').value='';
  showToast(`${pat.name} transferred to ${toWard} – ${toBed.bedNo}`);
}

function renderTransferTable(){
  const tbody=document.getElementById('trBody'); if(!tbody) return;
  tbody.innerHTML=transferLog.length
    ?transferLog.map(t=>`<tr><td>${t.patient}</td><td>${t.from}</td><td>${t.to}</td><td>${t.reason}</td><td>${t.time}</td></tr>`).join('')
    :'<tr><td colspan="5" style="text-align:center;color:var(--muted)">No transfers yet.</td></tr>';
}

/* ============================================================
   MODULE 5 – MAINTENANCE
   ============================================================ */
function renderMaintenance(){
  updateMaintStats();
  const tbody=document.getElementById('maintBody');
  tbody.innerHTML=maintLog.length
    ?maintLog.map(m=>`<tr>
        <td>${m.bedNo}</td><td>${m.ward}</td><td>${m.issue}</td>
        <td><span class="badge-s bs-${m.priority.toLowerCase()}">${m.priority}</span></td>
        <td><span class="badge-s bs-${m.status==='Open'?'maint':m.status==='In Progress'?'inprog':'resolved'}">${m.status}</span></td>
        <td>${m.date}</td>
        <td>
          <button class="icon-btn" title="In Progress" onclick="setMaintStatus('${m.id}','In Progress')"><i class="fas fa-spinner"></i></button>
          <button class="icon-btn" title="Resolve"     onclick="setMaintStatus('${m.id}','Resolved')"><i class="fas fa-check"></i></button>
          <button class="icon-btn del" title="Delete"  onclick="delMaint('${m.id}')"><i class="fas fa-trash"></i></button>
        </td>
      </tr>`).join('')
    :'<tr><td colspan="7" style="text-align:center;color:var(--muted)">No maintenance records.</td></tr>';
}

function updateMaintStats(){
  document.getElementById('mOpen').textContent   = maintLog.filter(m=>m.status==='Open').length;
  document.getElementById('mInProg').textContent = maintLog.filter(m=>m.status==='In Progress').length;
  document.getElementById('mDone').textContent   = maintLog.filter(m=>m.status==='Resolved').length;
}

function setMaintStatus(id,status){
  const m=maintLog.find(x=>x.id===id); if(!m) return;
  m.status=status;
  if(status==='Resolved'){ const bed=beds.find(b=>b.bedNo===m.bedNo&&b.ward===m.ward); if(bed) bed.status='avail'; updateStats(); }
  renderMaintenance(); showToast(`Maintenance ${id} → ${status}`);
}

function delMaint(id){
  const idx=maintLog.findIndex(m=>m.id===id);
  if(idx>=0){maintLog.splice(idx,1);renderMaintenance();showToast('Record deleted.');}
}

function openMaintModal(){
  fillMaintBeds();
  document.getElementById('maintModal').classList.remove('hidden');
}

function closeMaintModal(){ document.getElementById('maintModal').classList.add('hidden'); }

document.getElementById('mWard').addEventListener('change', fillMaintBeds);

function fillMaintBeds(){
  const ward=document.getElementById('mWard').value;
  const sel=document.getElementById('mBed');
  sel.innerHTML='';
  beds.filter(b=>b.ward===ward).forEach(b=>{
    const o=document.createElement('option'); o.value=b.id; o.dataset.no=b.bedNo;
    o.textContent=`${b.bedNo} (${b.status})`; sel.appendChild(o);
  });
}

function submitMaint(){
  const ward=document.getElementById('mWard').value;
  const sel=document.getElementById('mBed');
  const bedId=parseInt(sel.value);
  const bedNo=sel.options[sel.selectedIndex]?.dataset.no;
  const issue=document.getElementById('mIssue').value.trim();
  const pri=document.getElementById('mPri').value;
  if(!issue){showToast('Describe the issue.',true);return;}
  const bed=beds.find(b=>b.id===bedId); if(bed) bed.status='maint';
  maintLog.unshift({id:`M${maintLog.length+1}`,bedNo,ward,bedId,issue,priority:pri,status:'Open',date:todayStr()});
  addAlert('warning',`Maintenance: ${bedNo}`,issue,'tools');
  updateStats(); renderMaintenance(); closeMaintModal();
  showToast(`Bed ${bedNo} flagged for maintenance.`);
}

/* ============================================================
   MODULE 6 – CAPACITY CHART
   ============================================================ */
function renderCapacity(){ renderOccBars(); renderDonut(); renderLine(); }

function renderOccBars(){
  const cont=document.getElementById('occBars'); cont.innerHTML='';
  WARDS.forEach(ward=>{
    const wb=beds.filter(b=>b.ward===ward);
    const occ=wb.filter(b=>b.status==='occupied').length;
    const pct=Math.round(occ/wb.length*100);
    const clr=pct>=85?'var(--red)':pct>=60?'var(--orange)':'var(--green)';
    cont.innerHTML+=`<div class="bar-row"><div class="bar-lbl">${ward}</div><div class="bar-track"><div class="bar-fill" style="width:0%;background:${clr}" data-w="${pct}"></div></div><div class="bar-pct">${pct}%</div></div>`;
  });
  setTimeout(()=>document.querySelectorAll('.bar-fill[data-w]').forEach(el=>el.style.width=el.dataset.w+'%'),80);
}

function renderDonut(){
  const vals={
    avail:   beds.filter(b=>b.status==='avail').length,
    occupied:beds.filter(b=>b.status==='occupied').length,
    maint:   beds.filter(b=>b.status==='maint').length,
    reserved:beds.filter(b=>b.status==='reserved').length,
  };
  const total=beds.length;
  const data=[
    {label:'Available', val:vals.avail,    clr:'#00e676'},
    {label:'Occupied',  val:vals.occupied, clr:'#ffab40'},
    {label:'Maint',     val:vals.maint,    clr:'#ff5252'},
    {label:'Reserved',  val:vals.reserved, clr:'#b388ff'},
  ];
  const cx=100,cy=100,r=70,sw=26,circ=2*Math.PI*r;
  let cum=0; let paths='';
  data.forEach(d=>{
    const pct=d.val/total;
    const off=circ*(1-cum);
    const dash=circ*pct;
    paths+=`<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${d.clr}" stroke-width="${sw}" stroke-dasharray="${dash} ${circ}" stroke-dashoffset="${off}" transform="rotate(-90 ${cx} ${cy})" opacity=".85"/>`;
    cum+=pct;
  });
  document.getElementById('donutSvg').innerHTML=paths+
    `<text x="${cx}" y="${cy-5}" text-anchor="middle" font-size="22" font-weight="700" fill="#ddeaf5">${total}</text>
     <text x="${cx}" y="${cy+14}" text-anchor="middle" font-size="11" fill="#7a9ab8">Total</text>`;
  document.getElementById('donutLegend').innerHTML=data.map(d=>`
    <div class="dl-item"><div class="dl-dot" style="background:${d.clr}"></div><span style="color:var(--muted)">${d.label}:</span><strong style="margin-left:4px">${d.val}</strong></div>`).join('');
}

function renderLine(){
  const svg=document.getElementById('lineSvg');
  const days=['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  const admData=[8,12,7,15,11,9,13];
  const disData=[5,9,6,11,8,7,10];
  const W=680,H=160,pL=45,pB=28,pT=18;
  const maxV=Math.max(...admData,...disData)+4;
  const xStep=(W-pL)/(days.length-1);
  const px=(i,v)=>({x:pL+i*xStep, y:pT+(H-pB-pT)*(1-v/maxV)});
  const aPts=admData.map((v,i)=>px(i,v));
  const dPts=disData.map((v,i)=>px(i,v));
  const poly=pts=>pts.map(p=>`${p.x},${p.y}`).join(' ');
  const area=pts=>`M${pts[0].x},${H-pB} `+pts.map(p=>`L${p.x},${p.y}`).join(' ')+` L${pts[pts.length-1].x},${H-pB} Z`;
  let c=`<defs>
    <linearGradient id="gA" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#00c8ff" stop-opacity=".22"/><stop offset="100%" stop-color="#00c8ff" stop-opacity="0"/></linearGradient>
    <linearGradient id="gD" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#ffab40" stop-opacity=".18"/><stop offset="100%" stop-color="#ffab40" stop-opacity="0"/></linearGradient>
  </defs>`;
  [0,5,10,15].forEach(v=>{
    const y=pT+(H-pB-pT)*(1-v/maxV);
    c+=`<line x1="${pL}" y1="${y}" x2="${W}" y2="${y}" stroke="#1e2e48" stroke-width="1"/>`;
    c+=`<text x="${pL-6}" y="${y+4}" fill="#7a9ab8" font-size="9" text-anchor="end">${v}</text>`;
  });
  c+=`<path d="${area(aPts)}" fill="url(#gA)"/><path d="${area(dPts)}" fill="url(#gD)"/>`;
  c+=`<polyline points="${poly(aPts)}" fill="none" stroke="#00c8ff" stroke-width="2" stroke-linejoin="round"/>`;
  c+=`<polyline points="${poly(dPts)}" fill="none" stroke="#ffab40" stroke-width="2" stroke-linejoin="round"/>`;
  aPts.forEach((p,i)=>{
    c+=`<circle cx="${p.x}" cy="${p.y}" r="4" fill="#00c8ff" stroke="#080e1a" stroke-width="2"/>`;
    c+=`<text x="${p.x}" y="${p.y-8}" fill="#00c8ff" font-size="9" text-anchor="middle">${admData[i]}</text>`;
  });
  dPts.forEach(p=>{ c+=`<circle cx="${p.x}" cy="${p.y}" r="4" fill="#ffab40" stroke="#080e1a" stroke-width="2"/>`; });
  days.forEach((d,i)=>{ c+=`<text x="${pL+i*xStep}" y="${H-6}" fill="#7a9ab8" font-size="10" text-anchor="middle">${d}</text>`; });
  c+=`<rect x="${W-125}" y="${pT}" width="10" height="10" fill="#00c8ff" rx="2"/><text x="${W-111}" y="${pT+9}" fill="#ddeaf5" font-size="10">Admissions</text>`;
  c+=`<rect x="${W-125}" y="${pT+16}" width="10" height="10" fill="#ffab40" rx="2"/><text x="${W-111}" y="${pT+25}" fill="#ddeaf5" font-size="10">Discharges</text>`;
  svg.innerHTML=c;
}

/* ============================================================
   MODULE 7 – ALERTS
   ============================================================ */
function renderAlerts(){
  const list=document.getElementById('alertList');
  const src=alertFilter==='all'?alertsList:alertsList.filter(a=>a.type===alertFilter);
  list.innerHTML=src.length
    ?src.map(a=>`
      <div class="alert-item ${a.type}">
        <div class="al-icon"><i class="fas ${a.icon}"></i></div>
        <div class="al-body"><strong>${a.title}</strong><p>${a.msg}</p></div>
        <span class="al-time">${a.time}</span>
      </div>`).join('')
    :'<p style="text-align:center;color:var(--muted);padding:2rem">No alerts.</p>';
  document.getElementById('alertBadge').textContent=alertsList.filter(a=>a.type!=='info').length;
}

function setAlertFilter(type,btn){
  alertFilter=type;
  document.querySelectorAll('.af-btn').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  renderAlerts();
}

function clearAlerts(){ alertsList.length=0; renderAlerts(); showToast('All alerts cleared.'); }

/* ============================================================
   MODULE 8 – HISTORY
   ============================================================ */
function renderHistory(){
  const q=(document.getElementById('histSearch').value||'').toLowerCase();
  const src=q?historyLog.filter(h=>h.name.toLowerCase().includes(q)||h.patientId.toLowerCase().includes(q)||h.ward.toLowerCase().includes(q)):historyLog;
  document.getElementById('histBody').innerHTML=src.length
    ?src.map(h=>`<tr>
        <td style="font-family:'Space Mono',monospace;font-size:.76rem">${h.patientId}</td>
        <td>${h.name}</td><td>${h.ward}</td><td>${h.bed}</td>
        <td>${h.admitDate}</td><td>${h.dischargeDate||'—'}</td><td>${h.doctor}</td>
        <td><span class="badge-s bs-${h.status.toLowerCase()}">${h.status}</span></td>
      </tr>`).join('')
    :'<tr><td colspan="8" style="text-align:center;color:var(--muted)">No records found.</td></tr>';
}

/* ============================================================
   MODULE 9 – EXPORT
   ============================================================ */
function doExport(type){
  let csv=''; let filename=type+'.csv';
  if(type==='beds'){
    csv='BedNo,Ward,Status,Patient,AdmitDate,Doctor\n'+beds.map(b=>`${b.bedNo},${b.ward},${b.status},${b.patient||''},${b.admitDate||''},${b.doctor||''}`).join('\n');
  } else if(type==='patients'){
    csv='ID,Name,Age,Gender,Ward,Bed,Doctor,Diagnosis,AdmitDate,Status\n'+patients.map(p=>`${p.id},${p.name},${p.age},${p.gender},${p.ward},${p.bedNo},${p.doctor},${p.diagnosis},${p.admitDate},${p.status}`).join('\n');
  } else if(type==='history'){
    csv='ID,Patient,Ward,Bed,AdmitDate,DischargeDate,Doctor,Status\n'+historyLog.map(h=>`${h.patientId},${h.name},${h.ward},${h.bed},${h.admitDate},${h.dischargeDate||''},${h.doctor},${h.status}`).join('\n');
  } else if(type==='alerts'){
    csv='Type,Title,Message,Time\n'+alertsList.map(a=>`${a.type},"${a.title}","${a.msg}",${a.time}`).join('\n');
  }
  document.getElementById('expContent').textContent=csv.slice(0,600)+(csv.length>600?'\n…(truncated)':'');
  const blob=new Blob([csv],{type:'text/csv'});
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a'); a.href=url; a.download=filename; a.click();
  URL.revokeObjectURL(url);
  showToast(`${filename} downloaded.`);
}

/* ============================================================
   MODULE 10 – ADMIN PANEL
   ============================================================ */
function renderAdminPanel(){
  const ub=document.getElementById('userBody'); if(!ub) return;
  ub.innerHTML=USERS.map(u=>`<tr>
    <td>${u.name}</td><td>${u.role.charAt(0).toUpperCase()+u.role.slice(1)}</td>
    <td><span class="badge-s bs-${(u.status||'Active').toLowerCase()}">${u.status||'Active'}</span></td>
    <td><button class="icon-btn"><i class="fas fa-edit"></i></button><button class="icon-btn del"><i class="fas fa-trash"></i></button></td>
  </tr>`).join('');

  const wb=document.getElementById('wardBody'); if(!wb) return;
  const wtypes={ICU:'Intensive Care',General:'General',Pediatric:'Pediatric',Maternity:'Maternity',Emergency:'Emergency'};
  wb.innerHTML=WARDS.map(w=>`<tr>
    <td style="color:${WARD_CLR[w]};font-weight:700">${w}</td>
    <td>${WARD_CAP[w]}</td>
    <td>${wtypes[w]}</td>
    <td>${rndDoc()}</td>
  </tr>`).join('');
}

function addUserDemo(){ showToast('Connect to backend to add users.'); }

/* ============================================================
   INIT
   ============================================================ */
document.addEventListener('DOMContentLoaded',()=>{
  // default admit date
  const ad=document.getElementById('aDate'); if(ad) ad.value=todayStr();
  // fill admit beds
  fillAdmitBeds();
  // wire trPat change
  const trPat=document.getElementById('trPat');
  if(trPat) trPat.addEventListener('change',fillTransferFrom);
});
