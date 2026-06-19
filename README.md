# 🏥 Hospital Bed Management Dashboard

Complete healthcare management system with **Java backend** and **JavaScript frontend**.

---

## 📁 Folder Structure

```
hospital-dashboard/
│
├── backend/
│   ├── HospitalServer.java      (Source code)
│   ├── HospitalServer.class     (Compiled)
│   ├── *.class                  (Other compiled classes)
│   └── README.md                (Backend instructions)
│
├── frontend/
│   ├── index.html               (Main UI)
│   ├── app.js                   (Logic + API calls)
│   ├── style.css                (Styling)
│   └── README.md                (Frontend instructions)
│
└── README.md                    (This file)
```

---

## 🚀 Quick Start

### Step 1: Start Backend Server

Open **Terminal**:
```bash
cd /Users/vsameerreddy/Desktop/hospital-dashboard/backend
java -cp . HospitalServer
```

You should see: **✅ Backend running on http://localhost:8080/api**

### Step 2: Open Frontend

In **Browser**, open:
```
file:///Users/vsameerreddy/Desktop/hospital-dashboard/frontend/index.html
```

Or use terminal:
```bash
open /Users/vsameerreddy/Desktop/hospital-dashboard/frontend/index.html
```

### Step 3: Login

| Role | Username | Password |
|------|----------|----------|
| **Admin** | admin | password123 |
| **Doctor** | doctor | password123 |
| **Nurse** | nurse | password123 |

---

## ✨ Key Features

✅ Java Backend (no database required)
✅ 120+ Hospital Beds
✅ 55+ Patients with medical data
✅ 10 Dashboard Modules
✅ Real-time Statistics
✅ Patient Management
✅ Bed Tracking
✅ Maintenance Requests
✅ Alert System
✅ CSV Export

---

## 📡 Backend API

Server runs on: `http://localhost:8080/api`

Main endpoints:
- `/auth/login` - Login
- `/beds` - Get beds
- `/beds/stats` - Statistics
- `/patients` - Get patients
- `/patients/admit` - Admit patient
- `/patients/{id}/discharge` - Discharge patient
- `/transfers` - Transfer logs
- `/maintenance` - Maintenance requests

---

## 🔧 Technology

- **Backend**: Java (Pure HTTP server)
- **Frontend**: HTML5 + CSS3 + JavaScript
- **Data**: In-memory (no database)
- **Icons**: FontAwesome
- **Charts**: Chart.js

---

## �� Data

- **Beds**: 120 total across 5 wards
- **Patients**: 55+ active patients
- **Doctors**: 6 healthcare providers
- **Data**: Real-time statistics and tracking

---

## ⚠️ Important

1. Start **backend first** before opening frontend
2. Backend runs on **port 8080**
3. Data resets when backend restarts
4. No database needed - all in-memory

---

## 📂 File Locations

- Backend: `/Users/vsameerreddy/Desktop/hospital-dashboard/backend/`
- Frontend: `/Users/vsameerreddy/Desktop/hospital-dashboard/frontend/`

---

## ✅ Status

✅ Backend: Compiled & Ready
✅ Frontend: Ready to Use
✅ No Database Required
✅ Ready for Production

---

**Everything is organized in one folder!** 🎉
