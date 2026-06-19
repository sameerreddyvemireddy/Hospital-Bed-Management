# Frontend Application

## Files
- `index.html` - Main HTML interface
- `app.js` - Application logic + API calls
- `style.css` - Styling and layout

## Run Frontend

Open `index.html` in your browser:

```bash
open index.html
```

Or use file path:
```
file:///Users/vsameerreddy/Desktop/hospital-dashboard/frontend/index.html
```

## Features

✅ **10 Dashboard Modules**
1. Bed Map - Visual bed layout
2. Ward Filter - Ward overview
3. Admit/Discharge - Patient management
4. Transfer Flow - Patient transfers
5. Maintenance - Bed maintenance tracking
6. Capacity Chart - Analytics & charts
7. Alert System - Real-time alerts
8. Patient History - Medical records
9. Export Data - CSV downloads
10. Admin Panel - User management

✅ **Authentication**
- Login with 3 user roles
- Password reset with OTP
- User registration
- Session management

## API Configuration

Backend URL is configured in `app.js`:
```javascript
const API_BASE = 'http://localhost:8080/api';
```

**Make sure backend is running before opening frontend!**

## Login Credentials

| Role | Username | Password |
|------|----------|----------|
| Admin | admin | password123 |
| Doctor | doctor | password123 |
| Nurse | nurse | password123 |

## Technology

- HTML5
- CSS3
- Vanilla JavaScript (ES6+)
- Fetch API for backend communication
- FontAwesome icons
- Chart.js for analytics
