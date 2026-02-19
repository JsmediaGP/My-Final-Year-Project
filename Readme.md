DESIGN AND IMPLEMENTATION OF AN INTELLIGENT RFID-DRIVEN ATTENDANCE SYSTEM USING ESP32 AND IOT INTEGRATION
BY
ADEDOYIN, ADEEDAYO JOSHUA



Deployment: LAN-only (The frontend % backend can be hosted)
Hardware: ESP32 (Reader Node & Camera Node)
Backend: Laravel 12 (`backend/` folder)
Frontend: Static HTML + JS (`frontend/` folder)
Hardware Code: ESP32 INO files (`hardware/` folder)




1. System Requirements

Hardware
ESP32 DevKit / NodeMCU (Reader Node)
ESP32-CAM (Camera Node, AI-Thinker)
MFRC522 RFID reader
16×2 I2C LCD (0x27 or 0x3F)
LEDs (Green, Red) and Buzzer

Software
Arduino IDE (for ESP32 hardware code in `hardware/`)
PHP 8.2+ (for Laravel backend in `backend/`)
Composer (to install Laravel dependencies)
XAMPP / WAMP / Laragon (optional for backend)
Web browser (Chrome, Firefox, Edge)

> All devices (ESP32s and backend computer) must be on the same LAN network.



2. Required Arduino Libraries (for `hardware/` INO files)

Install these libraries in Arduino IDE:
`WiFi.h` (comes with ESP32 board package)
`SPI.h` (comes with ESP32 board package)
`MFRC522` → [Install via Library Manager]
`HTTPClient` (comes with ESP32 board package)
`Wire.h` (comes with ESP32 board package)
`LiquidCrystal_I2C` → [Install via Library Manager]
`esp_camera.h` (comes with ESP32 board package)
`WebServer.h` (comes with ESP32 board package)



3. Clone the Project

git clone https://github.com/JsmediaGP/My-Final-Year-Project.git
cd My-Final-Year-Project


Folder Overview

My-Final-Year-Project/
├── backend/        → Laravel 12 API
├── frontend/       → Static HTML/CSS/JS dashboard
├── hardware/
│   ├── controller1esp32rfid.ino → Reader Node code
│   └── controller2esp32camera.ino → Camera Node code
└── docs/           → Documentation / README


> References in the README will explicitly point to these folders so nothing is ambiguous.



4. Backend Setup (`backend/` folder)

4.1 Install Dependencies

cd backend
composer install


4.2 Configure Environment

1. Copy `.env.example` to `.env`

cp .env.example .env


2. Open `.env` and update database credentials:

env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=attendance_db
DB_USERNAME=root
DB_PASSWORD=


4.3 Face++ API Setup

Sign up for a free Face++ account: [https://www.faceplusplus.com/](https://www.faceplusplus.com/)
Add your API Key & Secret in `.env`:

env
FACEPP_API_KEY=your_api_key_here
FACEPP_API_SECRET=your_api_secret_here
FACEPP_COMPARE_URL=https://api-us.faceplusplus.com/facepp/v3/compare


> Backend uses this for facial verification.

4.4 Create Database & Admin User

1. Open phpMyAdmin (`http://localhost/phpmyadmin`).
2. Create database: `attendance_db`.
3. Run migrations:


php artisan migrate


4. Add an admin manually in `admins` table (optional):

| name       | email  | password (hashed)      || - | - | - |
| Admin User | [admin@school.com](mailto:admin@school.com) | Hash('yourpassword') |

> Use Laravel Tinker in `backend/`:


php artisan tinker
Hash::make('yourpassword')


4.5 Start Backend Server

From `backend/` folder:


php artisan serve --host=0.0.0.0 --port=8000


Or copy `backend/` to XAMPP `htdocs/attendance` and access via browser:


http://YOUR_PC_IP/attendance/public




5. Frontend Setup (`frontend/` folder)

1. Open the `frontend/` folder.
2. Open `.html` files directly in a browser.

> No additional server needed for static files.



6. ESP32 Hardware Setup (`hardware/` folder)

6.1 Reader Node (`controller1esp32rfid.ino`)

Update Wi-Fi credentials:

```
const charssid = "YOUR_WIFI_SSID";
const charpassword = "YOUR_WIFI_PASSWORD";
```

Update Camera Node IP:

```
String cameraIP = "http://CAMERA_NODE_IP/trigger";
```

6.2 Camera Node (`controller2esp32camera.ino`)

Update Wi-Fi credentials:

```
const charssid = "YOUR_WIFI_SSID";
const charpassword = "YOUR_WIFI_PASSWORD";
```

Update Laravel API endpoint:

```
const charlaravel_endpoint = "http://BACKEND_PC_IP:8000/api/rfid-scan";
```

6.3 Upload INO Files

1. Connect ESP32 via USB.
2. Open the corresponding `.ino` file from `hardware/` in Arduino IDE.
3. Select the correct Board and COM port.
4. Click Upload.
5. Repeat for ESP32-CAM.



7. Power-On Sequence

1. Turn on router → ensure all devices get LAN IPs.
2. Start Laravel backend server from `backend/`.
3. Power Camera Node → verify IP matches Reader Node INO settings.
4. Power Reader Node → serial monitor shows:


WiFi connected. Scan Your Card


5. Open frontend dashboard.



8. Troubleshooting

| Problem       | Fix       | | - |  |
| “Connecting WiFi…”           | Check SSID/password and Wi-Fi signal                                           |
| No response from Camera Node | Verify ESP32-CAM IP, power, ping from PC                                       |
| HTTP timeout                 | Laravel server running? Firewall open?                                         |
| Facial recognition failed    | Check `.env` Face++ keys & backend logs in `backend/storage/logs/laravel.log`  |
| LCD result never clears      | Confirm `RESULT_DISPLAY_TIME = 10000UL` in `hardware/controller1esp32rfid.ino` |

