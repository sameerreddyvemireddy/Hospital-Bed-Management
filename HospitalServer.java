import java.io.*;
import java.net.*;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import com.sun.net.httpserver.*;

public class HospitalServer {
    static class Bed {
        int id; String bedNo, ward, status, patient, patientId, admitDate, doctor;
    }

    static class Patient {
        String id, name, gender, ward, bedNo, doctor, diagnosis, admitDate, contact, status;
        int age, bedId;
    }

    static List<Bed> beds = new ArrayList<>();
    static List<Patient> patients = new ArrayList<>();
    static List<Map<String, String>> transfers = new ArrayList<>();
    static List<Map<String, String>> maintenance = new ArrayList<>();

    static String[] WARDS = {"ICU", "General", "Pediatric", "Maternity", "Emergency"};
    static int[] CAPS = {20, 40, 20, 20, 20};
    static String[] DOCTORS = {"Dr. Anil Mehta", "Dr. Priya Sharma", "Dr. Suresh Nair"};
    static String[] DIAGNOSES = {"Hypertension", "Fracture", "Diabetes", "Pneumonia"};

    static {
        initBeds();
    }

    static void initBeds() {
        Random r = new Random();
        int id = 1;
        for (int w = 0; w < WARDS.length; w++) {
            for (int i = 1; i <= CAPS[w]; i++, id++) {
                Bed bed = new Bed();
                bed.id = id;
                bed.bedNo = WARDS[w].charAt(0) + String.format("%02d", i);
                bed.ward = WARDS[w];
                double x = r.nextDouble();
                bed.status = x < 0.55 ? "occupied" : (x < 0.65 ? "maint" : "avail");

                if ("occupied".equals(bed.status)) {
                    bed.patient = "Patient " + (100 + id);
                    bed.patientId = "P" + (100 + id);
                    bed.admitDate = LocalDate.now().minusDays(r.nextInt(30)).toString();
                    bed.doctor = DOCTORS[r.nextInt(DOCTORS.length)];

                    Patient p = new Patient();
                    p.id = bed.patientId;
                    p.name = bed.patient;
                    p.age = 20 + r.nextInt(60);
                    p.gender = r.nextBoolean() ? "M" : "F";
                    p.ward = bed.ward;
                    p.bedNo = bed.bedNo;
                    p.bedId = id;
                    p.doctor = bed.doctor;
                    p.diagnosis = DIAGNOSES[r.nextInt(DIAGNOSES.length)];
                    p.admitDate = bed.admitDate;
                    p.contact = "+91 98XXXXXX";
                    p.status = "admitted";
                    patients.add(p);
                }
                beds.add(bed);
            }
        }
    }

    public static void main(String[] args) throws Exception {
        HttpServer server = HttpServer.create(new InetSocketAddress(8080), 0);

        // Auth
        server.createContext("/api/auth/login", exchange -> handleLogin(exchange));
        server.createContext("/api/auth/register", exchange -> handleRegister(exchange));

        // Beds
        server.createContext("/api/beds", exchange -> handleBeds(exchange));
        server.createContext("/api/beds/stats", exchange -> handleStats(exchange));

        // Patients
        server.createContext("/api/patients", exchange -> handlePatients(exchange));
        server.createContext("/api/patients/admit", exchange -> handleAdmit(exchange));

        // Transfers
        server.createContext("/api/transfers", exchange -> handleTransfers(exchange));

        // Maintenance
        server.createContext("/api/maintenance", exchange -> handleMaintenance(exchange));

        server.setExecutor(null);
        server.start();
        System.out.println("✅ Backend running on http://localhost:8080/api");
    }

    static void handleLogin(HttpExchange ex) throws IOException {
        // Answer the CORS preflight so browser fetches aren't blocked.
        if ("OPTIONS".equals(ex.getRequestMethod())) {
            enableCORS(ex);
            ex.sendResponseHeaders(204, -1);
            ex.close();
            return;
        }
        if ("POST".equals(ex.getRequestMethod())) {
            String body = new String(ex.getRequestBody().readAllBytes());
            String username = jsonValue(body, "username");
            String password = jsonValue(body, "password");
            String role     = jsonValue(body, "role");
            String name = authenticate(username, password, role);
            if (name != null) {
                String json = "{\"success\":true,\"user\":{\"name\":\"" + name + "\",\"role\":\"" + role + "\"}}";
                sendResponse(ex, 200, json);
            } else {
                sendResponse(ex, 401, "{\"success\":false,\"message\":\"Invalid credentials\"}");
            }
        }
    }

    // Known demo users (username|password|role -> display name).
    static String authenticate(String username, String password, String role) {
        if (!"password123".equals(password)) return null;
        if ("admin".equals(username)  && "admin".equals(role))  return "Admin User";
        if ("doctor".equals(username) && "doctor".equals(role)) return "Dr. Priya Sharma";
        if ("nurse".equals(username)  && "nurse".equals(role))  return "Nurse Kavya";
        return null;
    }

    // Minimal string-value extractor for flat JSON like {"key":"value"}.
    static String jsonValue(String json, String key) {
        String needle = "\"" + key + "\"";
        int k = json.indexOf(needle);
        if (k < 0) return "";
        int colon = json.indexOf(':', k + needle.length());
        if (colon < 0) return "";
        int start = json.indexOf('"', colon + 1);
        if (start < 0) return "";
        int end = json.indexOf('"', start + 1);
        if (end < 0) return "";
        return json.substring(start + 1, end);
    }

    static void handleRegister(HttpExchange ex) throws IOException {
        if ("POST".equals(ex.getRequestMethod())) {
            sendResponse(ex, 200, "{\"success\":true}");
        }
    }

    static void handleBeds(HttpExchange ex) throws IOException {
        enableCORS(ex);
        if ("GET".equals(ex.getRequestMethod())) {
            StringBuilder json = new StringBuilder("[");
            for (int i = 0; i < beds.size(); i++) {
                Bed b = beds.get(i);
                if (i > 0) json.append(",");
                json.append("{\"id\":").append(b.id).append(",\"bedNo\":\"").append(b.bedNo)
                    .append("\",\"ward\":\"").append(b.ward).append("\",\"status\":\"").append(b.status).append("\"}");
            }
            json.append("]");
            sendResponse(ex, 200, json.toString());
        }
    }

    static void handleStats(HttpExchange ex) throws IOException {
        enableCORS(ex);
        long occupied = beds.stream().filter(b -> "occupied".equals(b.status)).count();
        long avail = beds.stream().filter(b -> "avail".equals(b.status)).count();
        String json = "{\"total\":" + beds.size() + ",\"occupied\":" + occupied + ",\"available\":" + avail + "}";
        sendResponse(ex, 200, json);
    }

    static void handlePatients(HttpExchange ex) throws IOException {
        enableCORS(ex);
        StringBuilder json = new StringBuilder("[");
        for (int i = 0; i < patients.size(); i++) {
            Patient p = patients.get(i);
            if (i > 0) json.append(",");
            json.append("{\"id\":\"").append(p.id).append("\",\"name\":\"").append(p.name)
                .append("\",\"ward\":\"").append(p.ward).append("\",\"status\":\"").append(p.status).append("\"}");
        }
        json.append("]");
        sendResponse(ex, 200, json.toString());
    }

    static void handleAdmit(HttpExchange ex) throws IOException {
        enableCORS(ex);
        if ("POST".equals(ex.getRequestMethod())) {
            sendResponse(ex, 200, "{\"success\":true}");
        }
    }

    static void handleTransfers(HttpExchange ex) throws IOException {
        enableCORS(ex);
        sendResponse(ex, 200, "[]");
    }

    static void handleMaintenance(HttpExchange ex) throws IOException {
        enableCORS(ex);
        sendResponse(ex, 200, "[]");
    }

    static void enableCORS(HttpExchange ex) {
        ex.getResponseHeaders().add("Access-Control-Allow-Origin", "*");
        ex.getResponseHeaders().add("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE");
        ex.getResponseHeaders().add("Access-Control-Allow-Headers", "Content-Type");
    }

    static void sendResponse(HttpExchange ex, int code, String response) throws IOException {
        enableCORS(ex);
        ex.getResponseHeaders().set("Content-Type", "application/json");
        ex.sendResponseHeaders(code, response.getBytes().length);
        ex.getResponseBody().write(response.getBytes());
        ex.close();
    }
}
