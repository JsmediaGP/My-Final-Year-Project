// #include <Wire.h>

// //=========================================new setting response timeout===========

// // =================== RFID CONTROLLER 1 ===================
// #include <WiFi.h>
// #include <SPI.h>
// #include <MFRC522.h>
// #include <HTTPClient.h>
// #include <Wire.h>
// #include <LiquidCrystal_I2C.h>

// // RFID Pins
// #define SS_PIN 21
// #define RST_PIN 22

// // Output Pins
// #define GREEN_LED 32
// #define RED_LED 33
// #define BUZZER 25

// // I2C LCD Pins
// #define SDA_PIN 26
// #define SCL_PIN 27

// // WiFi & Camera
// const char* ssid = "Js'Media";
// const char* password = "password";
// String cameraIP = "http://10.149.27.254/trigger"; // Camera ESP32 IP

// // Objects
// MFRC522 rfid(SS_PIN, RST_PIN);
// LiquidCrystal_I2C lcd(0x27, 16, 2); // Most I2C LCDs use 0x27 or 0x3F

// void setup() {
//   Serial.begin(115200);

//   // RFID
//   SPI.begin();
//   rfid.PCD_Init();

//   // Outputs
//   pinMode(GREEN_LED, OUTPUT);
//   pinMode(RED_LED, OUTPUT);
//   pinMode(BUZZER, OUTPUT);
//   digitalWrite(GREEN_LED, LOW);
//   digitalWrite(RED_LED, LOW);
//   digitalWrite(BUZZER, LOW);

//   // LCD
//   Wire.begin(SDA_PIN, SCL_PIN);
//   lcd.init();
//   lcd.backlight();
//   lcd.setCursor(0, 0);
//   lcd.print("RFID System");
//   lcd.setCursor(0, 1);
//   lcd.print("Connecting WiFi");

//   // WiFi
//   WiFi.begin(ssid, password);
//   while (WiFi.status() != WL_CONNECTED) {
//     delay(500);
//     Serial.print(".");
//   }
//   Serial.println("\nWiFi connected");
//   lcd.clear();
//   lcd.setCursor(0, 0);
//   lcd.print("WiFi Connected");

//   delay(2000); // Display "WiFi Connected" for 2 seconds
//   lcd.clear();
//   lcd.setCursor(0, 0);
//   lcd.print("Scan Your Card");
//   lcd.setCursor(0, 1);
//   lcd.print("To Mark Attendance");
// }

// void loop() {
//   // Check for card
//   if (!rfid.PICC_IsNewCardPresent() || !rfid.PICC_ReadCardSerial()) {
//     delay(50);
//     return;
//   }

//   // Read UID without colons
//   String uid = "";
//   for (byte i = 0; i < rfid.uid.size; i++) {
//     if (rfid.uid.uidByte[i] < 0x10) {
//       uid += "0"; // leading zero
//     }
//     uid += String(rfid.uid.uidByte[i], HEX);
//   }
//   uid.toUpperCase(); // Optional: keep it uppercase

//   String hall = "KDLT";

//   Serial.println("=== SENDING TO CAMERA ===");
//   Serial.print("UID: "); Serial.println(uid);
//   Serial.print("Hall: "); Serial.println(hall);

//   // LCD Display
//   lcd.clear();
//   lcd.setCursor(0, 0);
//   lcd.print("UID: " + uid);
//   lcd.setCursor(0, 1);
//   lcd.print("Hall: " + hall);

//   // Send to Camera Controller
//   HTTPClient http;
//   http.begin(cameraIP);
//   http.addHeader("Content-Type", "application/x-www-form-urlencoded");

//   // ✅ FIX: Set 30s timeout
//   http.setTimeout(30000);
//   Serial.println("[INFO] Waiting up to 30s for Camera + Laravel response...");

//   String postData = "uid=" + uid + "&hall=" + hall;
//   int httpResponseCode = http.POST(postData);

//   Serial.print("Response Code: "); 
//   Serial.println(httpResponseCode);

//   String response = "";
//   if (httpResponseCode > 0) {
//     response = http.getString();  // ✅ JSON from Laravel via Controller 2
//     Serial.println("=== Laravel Response ===");
//     Serial.println(response);
//   } else {
//     Serial.println("No response from Controller 2");
//   }
//   http.end(); // ✅ Close connection

//   // Check for Laravel messages
//   if (response.indexOf("Attendance marked successfully") >= 0) {
//     lcd.clear();
//     lcd.setCursor(0, 0);
//     lcd.print("Marked Success");
//     lcd.setCursor(0, 1);
//     lcd.print("Hall: " + hall);

//     digitalWrite(GREEN_LED, HIGH);
//     tone(BUZZER, 2000, 200);
//     delay(500);
//     digitalWrite(GREEN_LED, LOW);

//   } else if (response.indexOf("already marked") >= 0) {
//     lcd.clear();
//     lcd.setCursor(0, 0);
//     lcd.print("Already Marked");
//     lcd.setCursor(0, 1);
//     lcd.print("Hall: " + hall);

//     digitalWrite(GREEN_LED, HIGH);
//     tone(BUZZER, 1500, 200);
//     delay(500);
//     digitalWrite(GREEN_LED, LOW);

//   } else if (response.indexOf("Facial recognition failed") >= 0) {
//     lcd.clear();
//     lcd.setCursor(0, 0);
//     lcd.print("Face Failed!");
//     lcd.setCursor(0, 1);
//     lcd.print("Try Again");

//     digitalWrite(RED_LED, HIGH);
//     tone(BUZZER, 1000, 600);
//     delay(500);
//     digitalWrite(RED_LED, LOW);

//   } else if (response.indexOf("Invalid lecture hall") >= 0) {
//     lcd.clear();
//     lcd.setCursor(0, 0);
//     lcd.print("Invalid Hall!");
//     lcd.setCursor(0, 1);
//     lcd.print("Check Config");

//     digitalWrite(RED_LED, HIGH);
//     tone(BUZZER, 1200, 600);
//     delay(500);
//     digitalWrite(RED_LED, LOW);

//   } else if (response.indexOf("No class is holding") >= 0) {
//     lcd.clear();
//     lcd.setCursor(0, 0);
//     lcd.print("No Class Now");
//     lcd.setCursor(0, 1);
//     lcd.print(hall);

//     digitalWrite(RED_LED, HIGH);
//     tone(BUZZER, 800, 400);
//     delay(500);
//     digitalWrite(RED_LED, LOW);

//   } else {
//     lcd.clear();
//     lcd.setCursor(0, 0);
//     lcd.print("Unknown Error");
//     lcd.setCursor(0, 1);
//     lcd.print("Check Server");

//     digitalWrite(RED_LED, HIGH);
//     tone(BUZZER, 500, 800);
//     delay(800);
//     digitalWrite(RED_LED, LOW);
//   }

//   delay(1000);
// }












#include <Wire.h>

//=========================================new setting response timeout===========

// =================== RFID CONTROLLER 1 ===================
#include <WiFi.h>
#include <SPI.h>
#include <MFRC522.h>
#include <HTTPClient.h>
#include <Wire.h>
#include <LiquidCrystal_I2C.h>

// RFID Pins
#define SS_PIN 21
#define RST_PIN 22

// Output Pins
#define GREEN_LED 32
#define RED_LED 33
#define BUZZER 25

// I2C LCD Pins
#define SDA_PIN 26
#define SCL_PIN 27

// WiFi & Camera
const char* ssid = "Js'Media";
const char* password = "password";
String cameraIP = "http://10.178.210.254/trigger"; // Camera ESP32 IP

// Objects
MFRC522 rfid(SS_PIN, RST_PIN);
LiquidCrystal_I2C lcd(0x27, 16, 2); // Most I2C LCDs use 0x27 or 0x3F

// =================== NEW ADDITIONS FOR TIMING ===================
const unsigned long RESULT_DISPLAY_TIME = 10000;  // 10 seconds
const unsigned long SCAN_MESSAGE_TIME   = 5000;  // 5 seconds

unsigned long displayStartTime = 0;
bool showingResult = false;
// ==============================================================

void setup() {
  Serial.begin(115200);

  // RFID
  SPI.begin();
  rfid.PCD_Init();

  // Outputs
  pinMode(GREEN_LED, OUTPUT);
  pinMode(RED_LED, OUTPUT);
  pinMode(BUZZER, OUTPUT);
  digitalWrite(GREEN_LED, LOW);
  digitalWrite(RED_LED, LOW);
  digitalWrite(BUZZER, LOW);

  // LCD
  Wire.begin(SDA_PIN, SCL_PIN);
  lcd.init();
  lcd.backlight();
  lcd.setCursor(0, 0);
  lcd.print("RFID System");
  lcd.setCursor(0, 1);
  lcd.print("Connecting WiFi");

  // WiFi
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi connected");
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("WiFi Connected");

  delay(2000); // Display "WiFi Connected" for 2 seconds
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("Scan Your Card");
  lcd.setCursor(0, 1);
  lcd.print("To Mark Attendance");

  // Initialize timer
  displayStartTime = millis();
  showingResult = false;
}

// =================== NEW HELPER FUNCTION ===================
void showScanCardMessage() {
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("Scan Your Card");
  lcd.setCursor(0, 1);
  lcd.print("To Mark Attendance");
}
// ===========================================================

void loop() {
  // =================== NEW TIMING LOGIC ===================
  // If we are currently showing a result, check if 3 seconds passed
  if (showingResult && (millis() - displayStartTime >= RESULT_DISPLAY_TIME)) {
    showScanCardMessage();
    showingResult = false;
    displayStartTime = millis();  // Start the 5-second idle timer (though we don't strictly need it)
  }

  // If no card is present, do nothing more (message already shown)
  if (!rfid.PICC_IsNewCardPresent() || !rfid.PICC_ReadCardSerial()) {
    delay(50);
    return;
  }
  // ========================================================

  // A new card is detected → start processing
  showingResult = true;
  displayStartTime = millis();

  // Read UID without colons
  String uid = "";
  for (byte i = 0; i < rfid.uid.size; i++) {
    if (rfid.uid.uidByte[i] < 0x10) {
      uid += "0"; // leading zero
    }
    uid += String(rfid.uid.uidByte[i], HEX);
  }
  uid.toUpperCase(); // Optional: keep it uppercase

  String hall = "KDLT";

  Serial.println("=== SENDING TO CAMERA ===");
  Serial.print("UID: "); Serial.println(uid);
  Serial.print("Hall: "); Serial.println(hall);

  // LCD Display
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("UID: " + uid);
  lcd.setCursor(0, 1);
  lcd.print("Hall: " + hall);

  // Send to Camera Controller
  HTTPClient http;
  http.begin(cameraIP);
  http.addHeader("Content-Type", "application/x-www-form-urlencoded");

  // ✅ FIX: Set 30s timeout
  http.setTimeout(30000);
  Serial.println("[INFO] Waiting up to 30s for Camera + Laravel response...");

  String postData = "uid=" + uid + "&hall=" + hall;
  int httpResponseCode = http.POST(postData);

  Serial.print("Response Code: "); 
  Serial.println(httpResponseCode);

  String response = "";
  if (httpResponseCode > 0) {
    response = http.getString();  // ✅ JSON from Laravel via Controller 2
    Serial.println("=== Laravel Response ===");
    Serial.println(response);
  } else {
    Serial.println("No response from Controller 2");
  }
  http.end(); // ✅ Close connection

  // Check for Laravel messages
  if (response.indexOf("Attendance marked successfully") >= 0) {
    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print("Marked Success");
    lcd.setCursor(0, 1);
    lcd.print("Hall: " + hall);

    digitalWrite(GREEN_LED, HIGH);
    tone(BUZZER, 2000, 200);
    delay(500);
    digitalWrite(GREEN_LED, LOW);

  } else if (response.indexOf("already marked") >= 0) {
    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print("Already Marked");
    lcd.setCursor(0, 1);
    lcd.print("Hall: " + hall);

    digitalWrite(GREEN_LED, HIGH);
    tone(BUZZER, 1500, 200);
    delay(500);
    digitalWrite(GREEN_LED, LOW);

  } else if (response.indexOf("Facial recognition failed") >= 0) {
    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print("Face Failed!");
    lcd.setCursor(0, 1);
    lcd.print("Try Again");

    digitalWrite(RED_LED, HIGH);
    tone(BUZZER, 1000, 600);
    delay(500);
    digitalWrite(RED_LED, LOW);

  } else if (response.indexOf("Invalid lecture hall") >= 0) {
    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print("Invalid Hall!");
    lcd.setCursor(0, 1);
    lcd.print("Check Config");

    digitalWrite(RED_LED, HIGH);
    tone(BUZZER, 1200, 600);
    delay(500);
    digitalWrite(RED_LED, LOW);

  } else if (response.indexOf("No class is holding") >= 0) {
    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print("No Class Now");
    lcd.setCursor(0, 1);
    lcd.print(hall);

    digitalWrite(RED_LED, HIGH);
    tone(BUZZER, 800, 400);
    delay(500);
    digitalWrite(RED_LED, LOW);

  } else {
    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print("Unknown Error");
    lcd.setCursor(0, 1);
    lcd.print("Check Server");

    digitalWrite(RED_LED, HIGH);
    tone(BUZZER, 500, 800);
    delay(800);
    digitalWrite(RED_LED, LOW);
  }

  // After showing result, the new timing logic at the top of loop()
  // will automatically switch back to "Scan Your Card" after 3 seconds
  // No delay(1000) needed here anymore — timing is handled non-blockingly
}