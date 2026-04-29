# MediCore – Hospital Bed Management Dashboard
## Frontend-Only (HTML + CSS + JavaScript)

---

## 📁 Folder Structure

```
hospital-dashboard/
│
├── index.html      ← Main HTML (Login + Dashboard + All 10 Modules)
├── style.css       ← All styling (dark theme, responsive)
├── app.js          ← All JavaScript logic (data + modules)
└── README.md       ← This file
```

---

## 🚀 Steps to Run

### Option 1 – Open Directly (Easiest)
1. Download all 3 files into ONE folder: `hospital-dashboard/`
2. Double-click `index.html` to open in your browser
   - Works in: Chrome, Edge, Firefox, Brave

### Option 2 – VS Code Live Server (Recommended for dev)
1. Install VS Code: https://code.visualstudio.com
2. Install the **Live Server** extension (by Ritwick Dey)
3. Right-click `index.html` → **Open with Live Server**
4. Dashboard opens at: `http://127.0.0.1:5500`

### Option 3 – Python HTTP Server
```bash
cd hospital-dashboard
python -m http.server 8080
# Open http://localhost:8080
```

### Option 4 – Node.js (npx serve)
```bash
cd hospital-dashboard
npx serve .
# Open the URL shown in terminal
```

---

## 🔐 Login Credentials

| Username | Password    | Role   |
|----------|-------------|--------|
| admin    | password123 | Admin  |
| doctor   | password123 | Doctor |
| nurse    | password123 | Nurse  |

---

## 📦 10 Modules Implemented

| # | Module          | Description                                      |
|---|-----------------|--------------------------------------------------|
| 1 | Bed Map         | Visual grid of all beds by ward with status     |
| 2 | Ward Filter     | Per-ward occupancy cards + detailed bed table   |
| 3 | Admit/Discharge | Patient admission + discharge forms             |
| 4 | Transfer Flow   | Move patients between beds/wards                |
| 5 | Maintenance     | Flag beds for repair, track status              |
| 6 | Capacity Chart  | Bar chart, donut chart, 7-day trend line        |
| 7 | Alert System    | Filterable real-time alerts (critical/warning)  |
| 8 | History         | Full patient admit/discharge history log        |
| 9 | Export          | Download data as CSV files                      |
|10 | Admin Panel     | Users, ward config, system settings             |

---

## 🛠️ Technologies Used
- HTML5, CSS3, Vanilla JavaScript (ES6+)
- Google Fonts (DM Sans, Space Mono)
- Font Awesome 6 (icons via CDN)
- No frameworks, no build tools, no npm needed

---

## 📱 Responsive
- Works on desktop, tablet, and mobile
- Sidebar collapses on mobile (hamburger menu)
