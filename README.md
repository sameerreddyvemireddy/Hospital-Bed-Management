# Backend Server

## Files
- `HospitalServer.java` - Source code (6.8 KB)
- `HospitalServer.class` - Compiled Java class

## Run Backend

```bash
java -cp . HospitalServer
```

Server runs on: `http://localhost:8080/api`

## API Endpoints

```
POST   /auth/login              - Login user
POST   /auth/register           - Register user
GET    /beds                    - Get all beds
GET    /beds/stats              - Get statistics
GET    /patients                - Get all patients
POST   /patients/admit          - Admit patient
POST   /patients/{id}/discharge - Discharge patient
GET    /transfers               - Get transfer logs
POST   /transfers               - Transfer patient
GET    /maintenance             - Get maintenance logs
POST   /maintenance             - Add maintenance
GET    /alerts                  - Get alerts
```

## Demo Credentials

| Role | Username | Password |
|------|----------|----------|
| Admin | admin | password123 |
| Doctor | doctor | password123 |
| Nurse | nurse | password123 |

## Data

- **No Database Required** - All data in memory
- **120+ Beds** across 5 wards (ICU, General, Pediatric, Maternity, Emergency)
- **55+ Patients** with realistic medical data
- **Real-time Statistics** - Occupancy, availability, maintenance tracking

## Compile (if needed)

```bash
javac HospitalServer.java
```
