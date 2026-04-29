/* =============================================
   MEDICORE – Hospital Bed Management Dashboard
   app.js  –  All 10 Modules + Login Logic
   ============================================= */

/* ==========================================
   DATA STORE
   ========================================== */
const WARDS = ['ICU', 'General', 'Pediatric', 'Maternity', 'Emergency'];
const WARD_CAPACITY = { ICU: 20, General: 40, Pediatric: 20, Maternity: 20, Emergency: 20 };
const WARD_COLORS = { ICU: '#ff5252', General: '#00c8ff', Pediatric: '#ffab40', Maternity: '#b388ff', Emergency: '#00e676' };

// Build initial bed data
let beds = [];
(function initBeds() {
  let id = 1;
  WARDS.forEach(ward => {
    const cap = WARD_CAPACITY[ward];
    for (let i = 1; i <= cap; i++) {
      const r = Math.random();
      let status = 'avail';
      if (r < 0.55) status = 'occupied';
      else if (r < 0.65) status = 'maintenance';
      else if (r < 0.70) status = 'reserved';
      beds.push({
        id: id++,
        bedNo: `${ward[0]}${String(i).padStart(2,'0')}`,
        ward,
        status,
        patient: status === 'occupied' ? samplePatientName() : null,
        patientId: status === 'occupied' ? `P${100+id}` : null,
        admitDate: status === 'occupied' ? randomPastDate(30) : null,
        doctor: status === 'occupied' ? sampleDoctor() : null,
      });
    }
  });
})();

let patients = [];
let transferLog = [];
let maintenanceLog = [];
let historyLog = [];
let alertsList = [];
let currentUser = null;

const USERS = [
  { name: 'Admin User', username: 'admin', password: 'password123', role: 'admin' },
  { name: 'Dr. Priya Sharma', username: 'doctor', password: 'password123', role: 'doctor' },
  { name: 'Nurse Kavya', username: 'nurse', password: 'password123', role: 'nurse' },
];

// Seed admitted patients from occupied beds
beds.filter(b => b.status === 'occupied').forEach(b => {
  patients.push({
    id: b.patientId,
    name: b.patient,
    age: 20 + Math.floor(Math.random() * 60),
    gender: Math.random() > 0.5 ? 'Male' : 'Female',
    ward: b.ward,
    bedNo: b.bedNo,
    bedId: b.id,
    doctor: b.doctor,
    diagnosis: sampleDiagnosis(),
    admitDate: b.admitDate,
    contact: `+91 98${Math.floor(Math.random()*90000000+10000000)}`,
    status: 'admitted',
  });
});

// Seed maintenance log
beds.filter(b => b.status === 'maintenance').slice(0, 8).forEach((b, i) => {
  maintenanceLog.push({
    id: `M${i+1}`,
    bedNo: b.bedNo,
    ward: b.ward,
    bedId: b.id,
    issue: sampleIssue(),
    priority: ['High','Medium','Low'][Math.floor(Math.random()*3)],
    status: ['Open','In Progress','Resolved'][Math.floor(Math.random()*3)],
    date: randomPastDate(14),
  });
});

// Seed alerts
alertsList = [
  { id: 'A1', type: 'critical', title: 'ICU at 90% Capacity', msg: 'Only 2 ICU beds remaining. Consider transfers.', time: '2 min ago', icon: 'fa-exclamation-triangle' },
  { id: 'A2', type: 'warning', title: 'Emergency Ward Near Full', msg: 'Emergency ward at 85% occupancy.', time: '15 min ago', icon: 'fa-bolt' },
  { id: 'A3', type: 'warning', title: '3 Beds Under Maintenance', msg: 'General ward beds G07, G12, G18 flagged.', time: '1 hr ago', icon: 'fa-tools' },
  { id: 'A4', type: 'info', title: 'Patient Transfer Completed', msg: 'Patient P108 transferred from ICU to General ward.', time: '2 hr ago', icon: 'fa-exchange-alt' },
  { id: 'A5', type: 'info', title: 'Scheduled Maintenance Done', msg: 'Bed P06 maintenance resolved by team.', time: '3 hr ago', icon: 'fa-check-circle' },
];

// Seed history
for (let i = 0; i < 15; i++) {
  const ward = WARDS[Math.floor(Math.random()*WARDS.length)];
  const admit = randomPastDate(60);
  const disc = Math.random() > 0.4 ? randomPastDate(10) : null;
  historyLog.push({
    id: `H${i+1}`,
    patientId: `P${200+i}`,
    name: samplePatientName(),
    ward, bed: `${ward[0]}${String(Math.floor(Math.random()*20)+1).padStart(2,'0')}`,
    admitDate: admit,
    dischargeDate: disc,
    doctor: sampleDoctor(),
    status: disc ? 'Discharged' : 'Admitted',
  });
}

// Seed ward admin table
const wardAdminData = WARDS.map(w => ({
  name: w,
  capacity: WARD_CAPACITY[w],
  type: w === 'ICU' ? 'Intensive Care' : w === 'Emergency' ? 'Emergency' : 'General',
  head: sampleDoctor(),
}));

/* ==========================================
   HELPERS
   ========================================== */
function samplePatientName() {
  const f = ['Arjun','Priya','Rahul','Ananya','Vikram','Divya','Amit','Sneha','Ravi','Pooja','Suresh','Meera','Kiran','Lavanya','Deepak'];
  const l = ['Sharma','Verma','Patel','Kumar','Singh','Gupta','Nair','Reddy','Iyer','Joshi'];
  return `${f[Math.floor(Math.random()*f.length)]} ${l[Math.floor(Math.random()*l.length)]}`;
}
function sampleDoctor() {
  const docs = ['Dr. Anil Mehta','Dr. Priya Sharma','Dr. Suresh Nair','Dr. Kavita Reddy','Dr. Rajesh Kumar','Dr. Meena Iyer'];
  return docs[Math.floor(Math.random()*docs.length)];
}
function sampleDiagnosis() {
  const d = ['Hypertension','Fracture','Appendicitis','Diabetes','Pneumonia','Post-surgery','Cardiac Arrest','Fever','COVID-19','Burns'];
  return d[Math.floor(Math.random()*d.length)];
}
function sampleIssue() {
  const issues = ['Broken adjustable frame','Faulty IV stand','Mattress replacement needed','Electrical fault','Oxygen outlet issue','Side rail broken'];
  return issues[Math.floor(Math.random()*issues.length)];
}
function randomPastDate(maxDays) {
  const d = new Date();
  d.setDate(d.getDate() - Math.floor(Math.random() * maxDays));
  return d.toISOString().split('T')[0];
}
function now() {
  return new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}
function today() { return new Date().toISOString().split('T')[0]; }
function nextPatientId() { return `P${1000 + patients.length + 1}`; }
function showToast(msg, type='success') {
  const t = document.getElementById('toast');
  const icon = t.querySelector('i');
  t.querySelector('#toastMsg').textContent = msg;
  icon.className = type === 'error' ? 'fas fa-times-circle' : 'fas fa-check-circle';
  t.style.borderColor = type === 'error' ? 'var(--danger)' : 'var(--success)';
  t.style.color = type === 'error' ? 'var(--danger)' : 'var(--success)';
  t.classList.remove('hidden');
  setTimeout(() => t.classList.add('hidden'), 3500);
}
function updateStatCards() {
  const total = beds.length;
  const avail = beds.filter(b => b.status === 'avail').length;
  const occ = beds.filter(b => b.status === 'occupied').length;
  const maint = beds.filter(b => b.status === 'maintenance').length;
  document.getElementById('statTotal').textContent = total;
  document.getElementById('statAvail').textContent = avail;
  document.getElementById('statOcc').textContent = occ;
  document.getElementById('statMaint').textContent = maint;
  document.getElementById('statRate').textContent = Math.round(occ/total*100) + '%';
}

/* ==========================================
   LOGIN
   ========================================== */
document.getElementById('loginForm').addEventListener('submit', function(e) {
  e.preventDefault();
  const user = document.getElementById('loginUser').value.trim();
  const pass = document.getElementById('loginPass').value.trim();
  const role = document.getElementById('loginRole').value;
  const match = USERS.find(u => u.username === user && u.password === pass && u.role === role);
  if (match) {
    currentUser = match;
    document.getElementById('loginPage').classList.add('hidden');
    document.getElementById('dashboard').classList.remove('hidden');
    document.getElementById('sidebarName').textContent = match.name;
    document.getElementById('sidebarRole').textContent = match.role.charAt(0).toUpperCase() + match.role.slice(1);
    document.getElementById('sidebarAvatar').textContent = match.name[0];
    updateStatCards();
    switchModule('bedMap');
    startClock();
    populateAdminPanel();
    populateTransferPatients();
  } else {
    document.getElementById('loginError').classList.remove('hidden');
    setTimeout(() => document.getElementById('loginError').classList.add('hidden'), 3000);
  }
});

function logout() {
  document.getElementById('dashboard').classList.add('hidden');
  document.getElementById('loginPage').classList.remove('hidden');
  document.getElementById('loginUser').value = '';
  document.getElementById('loginPass').value = '';
}

function togglePass() {
  const ip = document.getElementById('loginPass');
  ip.type = ip.type === 'password' ? 'text' : 'password';
}

/* ==========================================
   CLOCK
   ========================================== */
function startClock() {
  function tick() {
    const now = new Date();
    document.getElementById('topbarClock').textContent =
      now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  }
  tick(); setInterval(tick, 1000);
}

/* ==========================================
   MODULE SWITCHING
   ========================================== */
const MODULE_TITLES = {
  bedMap: 'Bed Map',
  wardFilter: 'Ward Filter',
  admitDischarge: 'Admit / Discharge',
  transfer: 'Transfer Flow',
  maintenance: 'Maintenance',
  capacity: 'Capacity Chart',
  alerts: 'Alert System',
  history: 'Patient History',
  export: 'Export Data',
  admin: 'Admin Panel',
};

function switchModule(key) {
  document.querySelectorAll('.module').forEach(m => m.classList.add('hidden'));
  const target = document.getElementById(`mod-${key}`);
  if (target) { target.classList.remove('hidden'); target.classList.add('active'); }
  document.querySelectorAll('.nav-item').forEach(n => {
    n.classList.toggle('active', n.dataset.module === key);
  });
  document.getElementById('topbarTitle').textContent = MODULE_TITLES[key] || key;
  // Init module
  const init = { bedMap: renderBedMap, wardFilter: renderWardFilter, capacity: renderCapacityChart, alerts: renderAlerts, history: renderHistory, maintenance: renderMaintenance, admin: populateAdminPanel, transfer: populateTransferPatients };
  if (init[key]) init[key]();
}

document.querySelectorAll('.nav-item').forEach(item => {
  item.addEventListener('click', function(e) {
    e.preventDefault();
    switchModule(this.dataset.module);
    if (window.innerWidth < 900) document.getElementById('sidebar').classList.remove('open');
  });
});

function toggleSidebar() {
  const sb = document.getElementById('sidebar');
  if (window.innerWidth < 900) sb.classList.toggle('open');
  else sb.classList.toggle('collapsed');
  document.querySelector('.main-content').classList.toggle('full', sb.classList.contains('collapsed'));
}

/* ==========================================
   MODULE 1: BED MAP
   ========================================== */
function renderBedMap() {
  const filter = document.getElementById('bedMapWardFilter').value;
  const grid = document.getElementById('bedGrid');
  grid.innerHTML = '';
  const wards = filter === 'all' ? WARDS : [filter];
  wards.forEach(ward => {
    const label = document.createElement('div');
    label.className = 'bed-ward-label';
    label.textContent = ward + ' Ward';
    grid.appendChild(label);
    beds.filter(b => b.ward === ward).forEach(bed => {
      const cell = document.createElement('div');
      cell.className = `bed-cell ${bed.status}`;
      const icons = { avail: 'fa-bed', occupied: 'fa-user', maintenance: 'fa-wrench', reserved: 'fa-bookmark' };
      cell.innerHTML = `<i class="fas ${icons[bed.status] || 'fa-bed'}"></i>${bed.bedNo}`;
      cell.addEventListener('mouseenter', e => showBedTooltip(e, bed));
      cell.addEventListener('mouseleave', () => document.getElementById('bedTooltip').classList.add('hidden'));
      cell.addEventListener('click', () => handleBedClick(bed));
      grid.appendChild(cell);
    });
  });
}

function showBedTooltip(e, bed) {
  const t = document.getElementById('bedTooltip');
  const statusLabels = { avail: 'Available', occupied: 'Occupied', maintenance: 'Under Maintenance', reserved: 'Reserved' };
  t.innerHTML = `
    <strong>${bed.bedNo} – ${bed.ward}</strong>
    <span>Status: ${statusLabels[bed.status]}</span><br>
    ${bed.patient ? `<span>Patient: ${bed.patient}</span><br><span>Admit: ${bed.admitDate}</span><br><span>Doctor: ${bed.doctor}</span>` : ''}
  `;
  t.style.left = (e.clientX + 14) + 'px';
  t.style.top = (e.clientY - 10) + 'px';
  t.classList.remove('hidden');
}

function handleBedClick(bed) {
  if (bed.status === 'avail') showToast(`Bed ${bed.bedNo} is available. Use Admit form to assign a patient.`);
  else if (bed.status === 'occupied') showToast(`Bed ${bed.bedNo}: ${bed.patient} (${bed.doctor})`);
  else if (bed.status === 'maintenance') showToast(`Bed ${bed.bedNo} is under maintenance.`, 'error');
}

/* ==========================================
   MODULE 2: WARD FILTER
   ========================================== */
function renderWardFilter() {
  const container = document.getElementById('wardCards');
  container.innerHTML = '';
  WARDS.forEach(ward => {
    const wardBeds = beds.filter(b => b.ward === ward);
    const occ = wardBeds.filter(b => b.status === 'occupied').length;
    const avail = wardBeds.filter(b => b.status === 'avail').length;
    const maint = wardBeds.filter(b => b.status === 'maintenance').length;
    const pct = Math.round(occ / wardBeds.length * 100);
    const card = document.createElement('div');
    card.className = 'ward-card';
    card.innerHTML = `
      <div class="ward-card-name" style="color:${WARD_COLORS[ward]}">${ward}</div>
      <div class="ward-progress"><div class="ward-progress-fill" style="width:${pct}%;background:${WARD_COLORS[ward]}"></div></div>
      <div style="font-size:0.72rem;color:var(--muted);margin-bottom:0.4rem">${pct}% Occupied</div>
      <div class="ward-card-stats">
        <span><b style="color:var(--success)">${avail}</b> Avail</span>
        <span><b style="color:var(--warning)">${occ}</b> Occ</span>
        <span><b style="color:var(--danger)">${maint}</b> Maint</span>
      </div>
    `;
    card.addEventListener('click', () => showWardDetail(ward));
    container.appendChild(card);
  });
  showWardDetail(WARDS[0]);
}

function showWardDetail(ward) {
  document.querySelectorAll('.ward-card').forEach((c, i) => c.classList.toggle('selected', WARDS[i] === ward));
  const wardBeds = beds.filter(b => b.ward === ward);
  const detail = document.getElementById('wardDetail');
  detail.innerHTML = `
    <h3 style="margin-bottom:0.75rem;font-size:0.95rem;">${ward} Ward – Bed Details</h3>
    <table class="data-table">
      <thead><tr><th>Bed</th><th>Status</th><th>Patient</th><th>Admit Date</th><th>Doctor</th></tr></thead>
      <tbody>
        ${wardBeds.map(b => `
          <tr>
            <td>${b.bedNo}</td>
            <td><span class="status-badge ${b.status}">${b.status.charAt(0).toUpperCase()+b.status.slice(1)}</span></td>
            <td>${b.patient || '—'}</td>
            <td>${b.admitDate || '—'}</td>
            <td>${b.doctor || '—'}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

/* ==========================================
   MODULE 3: ADMIT / DISCHARGE
   ========================================== */
function switchFormTab(tab, btn) {
  document.querySelectorAll('.form-tab').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById('admitForm').classList.toggle('hidden', tab !== 'admit');
  document.getElementById('dischargeForm').classList.toggle('hidden', tab !== 'discharge');
  if (tab === 'discharge') searchDischarge();
}

// Populate available beds for admit
document.getElementById('admitWard').addEventListener('change', function() {
  populateAdmitBeds(this.value);
});
function populateAdmitBeds(ward) {
  const sel = document.getElementById('admitBed');
  sel.innerHTML = '';
  beds.filter(b => b.ward === ward && b.status === 'avail').forEach(b => {
    sel.innerHTML += `<option value="${b.id}">${b.bedNo}</option>`;
  });
  if (!sel.options.length) sel.innerHTML = '<option disabled>No available beds</option>';
}
// init on load (deferred)
setTimeout(() => populateAdmitBeds('ICU'), 200);

function admitPatient() {
  const name = document.getElementById('admitName').value.trim();
  const age = document.getElementById('admitAge').value;
  const gender = document.getElementById('admitGender').value;
  const ward = document.getElementById('admitWard').value;
  const bedId = parseInt(document.getElementById('admitBed').value);
  const doctor = document.getElementById('admitDoctor').value.trim();
  const diag = document.getElementById('admitDiag').value.trim();
  const admitDate = document.getElementById('admitDate').value || today();
  const contact = document.getElementById('admitContact').value.trim();
  if (!name || !age || !bedId) { showToast('Please fill required fields.', 'error'); return; }
  const bed = beds.find(b => b.id === bedId);
  if (!bed || bed.status !== 'avail') { showToast('Bed not available.', 'error'); return; }
  const pid = nextPatientId();
  bed.status = 'occupied'; bed.patient = name; bed.patientId = pid; bed.admitDate = admitDate; bed.doctor = doctor;
  patients.push({ id: pid, name, age, gender, ward, bedNo: bed.bedNo, bedId, doctor, diagnosis: diag, admitDate, contact, status: 'admitted' });
  historyLog.unshift({ id: `H${historyLog.length+1}`, patientId: pid, name, ward, bed: bed.bedNo, admitDate, dischargeDate: null, doctor, status: 'Admitted' });
  addAlert('info', `Patient Admitted: ${name}`, `Admitted to ${ward} ward, bed ${bed.bedNo}`, 'fa-user-plus');
  updateStatCards();
  populateAdmitBeds(ward);
  populateTransferPatients();
  showToast(`Patient ${name} admitted to bed ${bed.bedNo}`);
  document.getElementById('admitName').value = '';
  document.getElementById('admitAge').value = '';
  document.getElementById('admitDoctor').value = '';
  document.getElementById('admitDiag').value = '';
  document.getElementById('admitContact').value = '';
}

function searchDischarge() {
  const q = document.getElementById('dischargeSearch').value.toLowerCase();
  const admittedPats = patients.filter(p => p.status === 'admitted');
  const filtered = q ? admittedPats.filter(p => p.name.toLowerCase().includes(q) || p.id.toLowerCase().includes(q)) : admittedPats;
  const list = document.getElementById('dischargeList');
  list.innerHTML = '';
  if (!filtered.length) { list.innerHTML = '<p style="color:var(--muted);font-size:0.85rem;">No patients found.</p>'; return; }
  filtered.slice(0, 10).forEach(p => {
    const item = document.createElement('div');
    item.className = 'discharge-item';
    item.innerHTML = `
      <div class="discharge-item-info">
        <strong>${p.name} <span style="color:var(--muted);font-weight:400;font-size:0.8rem;">(${p.id})</span></strong>
        <small>${p.ward} Ward • Bed ${p.bedNo} • Admitted: ${p.admitDate} • ${p.doctor}</small>
      </div>
      <button class="btn-primary btn-sm" onclick="dischargePatient('${p.id}')"><i class="fas fa-sign-out-alt"></i> Discharge</button>
    `;
    list.appendChild(item);
  });
}

function dischargePatient(pid) {
  const pat = patients.find(p => p.id === pid);
  if (!pat) return;
  const bed = beds.find(b => b.id === pat.bedId);
  if (bed) { bed.status = 'avail'; bed.patient = null; bed.patientId = null; bed.admitDate = null; bed.doctor = null; }
  pat.status = 'discharged';
  pat.dischargeDate = today();
  const hist = historyLog.find(h => h.patientId === pid && !h.dischargeDate);
  if (hist) { hist.dischargeDate = today(); hist.status = 'Discharged'; }
  addAlert('info', `Patient Discharged: ${pat.name}`, `Released from ${pat.ward} ward, bed ${pat.bedNo}`, 'fa-sign-out-alt');
  updateStatCards();
  populateTransferPatients();
  searchDischarge();
  showToast(`${pat.name} discharged successfully.`);
}

/* ==========================================
   MODULE 4: TRANSFER FLOW
   ========================================== */
function populateTransferPatients() {
  const sel = document.getElementById('transferPatient');
  if (!sel) return;
  sel.innerHTML = '<option value="">Select Patient</option>';
  patients.filter(p => p.status === 'admitted').forEach(p => {
    sel.innerHTML += `<option value="${p.id}">${p.name} (${p.bedNo})</option>`;
  });
}

document.getElementById('transferPatient') && document.getElementById('transferPatient').addEventListener('change', function() {
  const pat = patients.find(p => p.id === this.value);
  document.getElementById('transferFrom').value = pat ? `${pat.ward} – ${pat.bedNo}` : '';
});

function populateTargetBeds() {
  const ward = document.getElementById('transferToWard').value;
  const sel = document.getElementById('transferToBed');
  sel.innerHTML = '';
  beds.filter(b => b.ward === ward && b.status === 'avail').forEach(b => {
    sel.innerHTML += `<option value="${b.id}">${b.bedNo}</option>`;
  });
  if (!sel.options.length) sel.innerHTML = '<option disabled>No available beds</option>';
}

function transferPatient() {
  const pid = document.getElementById('transferPatient').value;
  const toWard = document.getElementById('transferToWard').value;
  const toBedId = parseInt(document.getElementById('transferToBed').value);
  const reason = document.getElementById('transferReason').value.trim();
  if (!pid || !toWard || !toBedId) { showToast('Please fill all transfer fields.', 'error'); return; }
  const pat = patients.find(p => p.id === pid);
  const toBed = beds.find(b => b.id === toBedId);
  const fromBed = beds.find(b => b.id === pat.bedId);
  if (!toBed || toBed.status !== 'avail') { showToast('Target bed not available.', 'error'); return; }
  const fromLabel = `${pat.ward} – ${pat.bedNo}`;
  if (fromBed) { fromBed.status = 'avail'; fromBed.patient = null; fromBed.patientId = null; fromBed.admitDate = null; fromBed.doctor = null; }
  toBed.status = 'occupied'; toBed.patient = pat.name; toBed.patientId = pat.id; toBed.admitDate = pat.admitDate; toBed.doctor = pat.doctor;
  const oldWard = pat.ward; const oldBedNo = pat.bedNo;
  pat.ward = toWard; pat.bedNo = toBed.bedNo; pat.bedId = toBedId;
  transferLog.unshift({ patient: pat.name, from: fromLabel, to: `${toWard} – ${toBed.bedNo}`, reason: reason || 'N/A', time: now() });
  addAlert('info', `Transfer: ${pat.name}`, `Moved from ${fromLabel} to ${toWard}–${toBed.bedNo}`, 'fa-exchange-alt');
  updateStatCards();
  populateTransferPatients();
  renderTransferTable();
  document.getElementById('transferReason').value = '';
  document.getElementById('transferPatient').value = '';
  document.getElementById('transferFrom').value = '';
  showToast(`Patient ${pat.name} transferred to ${toWard} – ${toBed.bedNo}`);
}

function renderTransferTable() {
  const tbody = document.getElementById('transferBody');
  if (!tbody) return;
  tbody.innerHTML = transferLog.length ? transferLog.map(t => `
    <tr><td>${t.patient}</td><td>${t.from}</td><td>${t.to}</td><td>${t.reason}</td><td>${t.time}</td></tr>
  `).join('') : '<tr><td colspan="5" style="color:var(--muted);text-align:center">No transfers yet.</td></tr>';
}

/* ==========================================
   MODULE 5: MAINTENANCE
   ========================================== */
function renderMaintenance() {
  updateMaintStats();
  const tbody = document.getElementById('maintBody');
  tbody.innerHTML = maintenanceLog.map(m => `
    <tr>
      <td>${m.bedNo}</td>
      <td>${m.ward}</td>
      <td>${m.issue}</td>
      <td><span class="status-badge ${m.status === 'Open' ? 'maint' : m.status === 'In Progress' ? 'inprog' : 'resolved'}">${m.status}</span></td>
      <td>${m.date}</td>
      <td>
        <button class="btn-icon" onclick="changeMaintStatus('${m.id}','In Progress')" title="Mark In Progress"><i class="fas fa-spinner"></i></button>
        <button class="btn-icon" onclick="changeMaintStatus('${m.id}','Resolved')" title="Resolve"><i class="fas fa-check"></i></button>
        <button class="btn-icon danger" onclick="deleteMaint('${m.id}')" title="Delete"><i class="fas fa-trash"></i></button>
      </td>
    </tr>
  `).join('') || '<tr><td colspan="6" style="color:var(--muted);text-align:center">No maintenance records.</td></tr>';
}

function updateMaintStats() {
  document.getElementById('maintOpen').textContent = maintenanceLog.filter(m => m.status === 'Open').length;
  document.getElementById('maintInProg').textContent = maintenanceLog.filter(m => m.status === 'In Progress').length;
  document.getElementById('maintDone').textContent = maintenanceLog.filter(m => m.status === 'Resolved').length;
}

function changeMaintStatus(id, status) {
  const m = maintenanceLog.find(x => x.id === id);
  if (m) {
    m.status = status;
    if (status === 'Resolved') {
      const bed = beds.find(b => b.bedNo === m.bedNo);
      if (bed) bed.status = 'avail';
      updateStatCards();
    }
    renderMaintenance();
    showToast(`Maintenance ${id} updated to ${status}`);
  }
}

function deleteMaint(id) {
  const idx = maintenanceLog.findIndex(m => m.id === id);
  if (idx >= 0) { maintenanceLog.splice(idx, 1); renderMaintenance(); showToast('Record deleted.'); }
}

function openMaintenanceModal() {
  populateMaintBeds('ICU');
  document.getElementById('maintModal').classList.remove('hidden');
}

document.getElementById('maintWard') && document.getElementById('maintWard').addEventListener('change', function() {
  populateMaintBeds(this.value);
});

function populateMaintBeds(ward) {
  const sel = document.getElementById('maintBed');
  sel.innerHTML = '';
  beds.filter(b => b.ward === ward).forEach(b => {
    sel.innerHTML += `<option value="${b.id}" data-bedNo="${b.bedNo}">${b.bedNo} (${b.status})</option>`;
  });
}

function submitMaintenance() {
  const ward = document.getElementById('maintWard').value;
  const bedSel = document.getElementById('maintBed');
  const bedId = parseInt(bedSel.value);
  const bedNo = bedSel.options[bedSel.selectedIndex]?.dataset?.bedNo;
  const issue = document.getElementById('maintIssue').value.trim();
  const priority = document.getElementById('maintPriority').value;
  if (!issue) { showToast('Please describe the issue.', 'error'); return; }
  const bed = beds.find(b => b.id === bedId);
  if (bed) bed.status = 'maintenance';
  maintenanceLog.unshift({ id: `M${maintenanceLog.length+1}`, bedNo, ward, bedId, issue, priority, status: 'Open', date: today() });
  addAlert('warning', `Maintenance Flag: ${bedNo}`, issue, 'fa-tools');
  updateStatCards();
  renderMaintenance();
  closeModal('maintModal');
  showToast(`Bed ${bedNo} flagged for maintenance.`);
}

function closeModal(id) { document.getElementById(id).classList.add('hidden'); }

/* ==========================================
   MODULE 6: CAPACITY CHART
   ========================================== */
function renderCapacityChart() {
  renderOccupancyBars();
  renderDonutChart();
  renderLineChart();
}

function renderOccupancyBars() {
  const container = document.getElementById('occupancyBars');
  container.innerHTML = '';
  WARDS.forEach(ward => {
    const wardBeds = beds.filter(b => b.ward === ward);
    const occ = wardBeds.filter(b => b.status === 'occupied').length;
    const pct = Math.round(occ / wardBeds.length * 100);
    const color = pct >= 85 ? 'var(--danger)' : pct >= 60 ? 'var(--warning)' : 'var(--success)';
    container.innerHTML += `
      <div class="bar-row">
        <div class="bar-label">${ward}</div>
        <div class="bar-track"><div class="bar-fill" style="width:0%;background:${color}" data-target="${pct}"></div></div>
        <div class="bar-pct">${pct}%</div>
      </div>
    `;
  });
  setTimeout(() => {
    document.querySelectorAll('.bar-fill[data-target]').forEach(el => {
      el.style.width = el.dataset.target + '%';
    });
  }, 100);
}

function renderDonutChart() {
  const avail = beds.filter(b => b.status === 'avail').length;
  const occ = beds.filter(b => b.status === 'occupied').length;
  const maint = beds.filter(b => b.status === 'maintenance').length;
  const res = beds.filter(b => b.status === 'reserved').length;
  const total = beds.length;
  const data = [
    { label: 'Available', val: avail, color: '#00e676' },
    { label: 'Occupied', val: occ, color: '#ffab40' },
    { label: 'Maintenance', val: maint, color: '#ff5252' },
    { label: 'Reserved', val: res, color: '#b388ff' },
  ];
  const cx = 100, cy = 100, r = 70, strokeW = 28;
  let cumulPct = 0;
  const circumference = 2 * Math.PI * r;
  let paths = '';
  data.forEach(d => {
    const pct = d.val / total;
    const offset = circumference * (1 - cumulPct);
    const dash = circumference * pct;
    paths += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${d.color}" stroke-width="${strokeW}" stroke-dasharray="${dash} ${circumference}" stroke-dashoffset="${offset}" transform="rotate(-90 ${cx} ${cy})" opacity="0.85"/>`;
    cumulPct += pct;
  });
  document.getElementById('donutChart').innerHTML = paths + `<text x="${cx}" y="${cy-6}" text-anchor="middle" font-size="22" font-weight="700" fill="#e2eaf5">${total}</text><text x="${cx}" y="${cy+16}" text-anchor="middle" font-size="11" fill="#8fa4c0">Total</text>`;
  document.getElementById('donutLegend').innerHTML = data.map(d => `
    <div class="donut-legend-item">
      <div class="donut-legend-dot" style="background:${d.color}"></div>
      <span style="color:var(--muted)">${d.label}: </span><strong style="color:var(--text);margin-left:4px">${d.val}</strong>
    </div>
  `).join('');
}

function renderLineChart() {
  const svg = document.getElementById('lineChart');
  const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  const admitData = [8, 12, 7, 15, 11, 9, 13];
  const dischargeData = [5, 9, 6, 11, 8, 7, 10];
  const W = 680, H = 160, padL = 40, padB = 30, padT = 20;
  const maxVal = Math.max(...admitData, ...dischargeData) + 3;
  const xStep = (W - padL) / (days.length - 1);
  function px(i, val) { return { x: padL + i * xStep, y: padT + (H - padB - padT) * (1 - val / maxVal) }; }
  const admitPts = admitData.map((v, i) => px(i, v));
  const dischPts = dischargeData.map((v, i) => px(i, v));
  const polyline = pts => pts.map(p => `${p.x},${p.y}`).join(' ');
  const areaPath = pts => {
    const base = H - padB;
    return `M${pts[0].x},${base} ` + pts.map(p => `L${p.x},${p.y}`).join(' ') + ` L${pts[pts.length-1].x},${base} Z`;
  };
  let content = `<defs>
    <linearGradient id="gA" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#00c8ff" stop-opacity="0.25"/><stop offset="100%" stop-color="#00c8ff" stop-opacity="0"/></linearGradient>
    <linearGradient id="gD" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#ffab40" stop-opacity="0.2"/><stop offset="100%" stop-color="#ffab40" stop-opacity="0"/></linearGradient>
  </defs>`;
  // gridlines
  [0,5,10,15].forEach(v => {
    const y = padT + (H - padB - padT) * (1 - v / maxVal);
    content += `<line x1="${padL}" y1="${y}" x2="${W}" y2="${y}" stroke="#253048" stroke-width="1"/>`;
    content += `<text x="${padL - 6}" y="${y+4}" fill="#8fa4c0" font-size="9" text-anchor="end">${v}</text>`;
  });
  // areas
  content += `<path d="${areaPath(admitPts)}" fill="url(#gA)"/>`;
  content += `<path d="${areaPath(dischPts)}" fill="url(#gD)"/>`;
  // lines
  content += `<polyline points="${polyline(admitPts)}" fill="none" stroke="#00c8ff" stroke-width="2" stroke-linejoin="round"/>`;
  content += `<polyline points="${polyline(dischPts)}" fill="none" stroke="#ffab40" stroke-width="2" stroke-linejoin="round"/>`;
  // dots
  admitPts.forEach((p, i) => {
    content += `<circle cx="${p.x}" cy="${p.y}" r="4" fill="#00c8ff" stroke="#0a0f1e" stroke-width="2"/>`;
    content += `<text x="${p.x}" y="${p.y - 8}" fill="#00c8ff" font-size="9" text-anchor="middle">${admitData[i]}</text>`;
  });
  dischPts.forEach((p, i) => {
    content += `<circle cx="${p.x}" cy="${p.y}" r="4" fill="#ffab40" stroke="#0a0f1e" stroke-width="2"/>`;
  });
  // x labels
  days.forEach((d, i) => {
    const x = padL + i * xStep;
    content += `<text x="${x}" y="${H - 6}" fill="#8fa4c0" font-size="10" text-anchor="middle">${d}</text>`;
  });
  // legend
  content += `<rect x="${W-130}" y="${padT}" width="10" height="10" fill="#00c8ff" rx="2"/><text x="${W-116}" y="${padT+9}" fill="#e2eaf5" font-size="10">Admissions</text>`;
  content += `<rect x="${W-130}" y="${padT+16}" width="10" height="10" fill="#ffab40" rx="2"/><text x="${W-116}" y="${padT+25}" fill="#e2eaf5" font-size="10">Discharges</text>`;
  svg.innerHTML = content;
}

/* ==========================================
   MODULE 7: ALERTS
   ========================================== */
let alertFilter = 'all';

function renderAlerts() {
  const list = document.getElementById('alertList');
  const filtered = alertFilter === 'all' ? alertsList : alertsList.filter(a => a.type === alertFilter);
  list.innerHTML = filtered.length ? filtered.map(a => `
    <div class="alert-item ${a.type}">
      <div class="alert-icon"><i class="fas ${a.icon}"></i></div>
      <div class="alert-body">
        <strong>${a.title}</strong>
        <p>${a.msg}</p>
      </div>
      <span class="alert-time">${a.time}</span>
    </div>
  `).join('') : '<p style="color:var(--muted);text-align:center;padding:2rem">No alerts.</p>';
  document.getElementById('alertBadge').textContent = alertsList.filter(a => a.type === 'critical' || a.type === 'warning').length;
}

function filterAlerts(type, btn) {
  alertFilter = type;
  document.querySelectorAll('.alert-filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderAlerts();
}

function clearAlerts() { alertsList = []; renderAlerts(); showToast('All alerts cleared.'); }

function addAlert(type, title, msg, icon) {
  alertsList.unshift({ id: `A${Date.now()}`, type, title, msg, time: 'just now', icon: `fa-${icon.replace('fa-','')}` });
  document.getElementById('alertBadge').textContent = alertsList.filter(a => a.type === 'critical' || a.type === 'warning').length;
}

/* ==========================================
   MODULE 8: HISTORY
   ========================================== */
function renderHistory() {
  const tbody = document.getElementById('historyBody');
  const q = document.getElementById('historySearch').value.toLowerCase();
  const filtered = q ? historyLog.filter(h => h.name.toLowerCase().includes(q) || h.patientId.toLowerCase().includes(q) || h.ward.toLowerCase().includes(q)) : historyLog;
  tbody.innerHTML = filtered.map(h => `
    <tr>
      <td style="font-family:var(--font-mono);font-size:0.8rem">${h.patientId}</td>
      <td>${h.name}</td>
      <td>${h.ward}</td>
      <td>${h.bed}</td>
      <td>${h.admitDate}</td>
      <td>${h.dischargeDate || '—'}</td>
      <td>${h.doctor}</td>
      <td><span class="status-badge ${h.status.toLowerCase()}">${h.status}</span></td>
    </tr>
  `).join('') || '<tr><td colspan="8" style="text-align:center;color:var(--muted)">No history found.</td></tr>';
}

function searchHistory() { renderHistory(); }

/* ==========================================
   MODULE 9: EXPORT
   ========================================== */
function exportData(type) {
  let csv = '';
  let filename = type + '.csv';
  if (type === 'beds-csv') {
    csv = 'BedNo,Ward,Status,Patient,AdmitDate,Doctor\n';
    csv += beds.map(b => `${b.bedNo},${b.ward},${b.status},${b.patient||''},${b.admitDate||''},${b.doctor||''}`).join('\n');
  } else if (type === 'patients-csv') {
    csv = 'ID,Name,Age,Gender,Ward,Bed,Doctor,Diagnosis,AdmitDate,Status\n';
    csv += patients.map(p => `${p.id},${p.name},${p.age},${p.gender},${p.ward},${p.bedNo},${p.doctor},${p.diagnosis},${p.admitDate},${p.status}`).join('\n');
  } else if (type === 'history-csv') {
    csv = 'ID,Patient,Ward,Bed,AdmitDate,DischargeDate,Doctor,Status\n';
    csv += historyLog.map(h => `${h.patientId},${h.name},${h.ward},${h.bed},${h.admitDate},${h.dischargeDate||''},${h.doctor},${h.status}`).join('\n');
  } else if (type === 'alerts-csv') {
    csv = 'Type,Title,Message,Time\n';
    csv += alertsList.map(a => `${a.type},"${a.title}","${a.msg}",${a.time}`).join('\n');
  }
  document.getElementById('exportContent').textContent = csv.slice(0, 600) + (csv.length > 600 ? '\n...(truncated)' : '');
  // Download
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
  showToast(`${filename} downloaded.`);
}

/* ==========================================
   MODULE 10: ADMIN PANEL
   ========================================== */
function populateAdminPanel() {
  // User table
  const tbody = document.getElementById('userTable');
  if (!tbody) return;
  const sysUsers = [
    { name: 'Admin User', role: 'Admin', status: 'Active' },
    { name: 'Dr. Priya Sharma', role: 'Doctor', status: 'Active' },
    { name: 'Nurse Kavya', role: 'Nurse', status: 'Active' },
    { name: 'Dr. Anil Mehta', role: 'Doctor', status: 'Inactive' },
  ];
  tbody.innerHTML = sysUsers.map(u => `
    <tr>
      <td>${u.name}</td>
      <td>${u.role}</td>
      <td><span class="status-badge ${u.status.toLowerCase()}">${u.status}</span></td>
      <td>
        <button class="btn-icon" title="Edit"><i class="fas fa-edit"></i></button>
        <button class="btn-icon danger" title="Delete"><i class="fas fa-trash"></i></button>
      </td>
    </tr>
  `).join('');
  // Ward config
  const wtbody = document.getElementById('wardConfigTable');
  if (!wtbody) return;
  wtbody.innerHTML = wardAdminData.map(w => `
    <tr>
      <td style="color:${WARD_COLORS[w.name]};font-weight:600">${w.name}</td>
      <td>${w.capacity}</td>
      <td>${w.type}</td>
      <td>${w.head}</td>
    </tr>
  `).join('');
}

function addUser() { showToast('User management: Connect to backend to add users.'); }

function saveSettings() {
  const threshold = document.getElementById('critThresh').value;
  const interval = document.getElementById('refreshInterval').value;
  const hospitalName = document.getElementById('hospitalName').value;
  showToast(`Settings saved. Threshold: ${threshold}%, Interval: ${interval}s`);
}

/* ==========================================
   INIT
   ========================================== */
document.addEventListener('DOMContentLoaded', () => {
  // Set default admit date
  const admitDateEl = document.getElementById('admitDate');
  if (admitDateEl) admitDateEl.value = today();
  // Transfer table render
  renderTransferTable();
});
