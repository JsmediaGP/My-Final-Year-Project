// // ===================WORKING FINE STREAM SEND TO LARAVEL API WITH CAMERA ANGLE========================================
// #include "esp_camera.h"
// #include <WiFi.h>
// #include <WebServer.h>

// #include <WiFiClient.h>   // For streaming
// #include <HTTPClient.h>

// const char* ssid = "Js'Media";
// const char* password = "password";

// WebServer server(80);

// // Camera pin configuration (ESP32-CAM)
// #define PWDN_GPIO_NUM  -1
// #define RESET_GPIO_NUM -1
// #define XCLK_GPIO_NUM  15
// #define SIOD_GPIO_NUM  4
// #define SIOC_GPIO_NUM  5
// #define Y2_GPIO_NUM   11
// #define Y3_GPIO_NUM    9
// #define Y4_GPIO_NUM    8
// #define Y5_GPIO_NUM   10
// #define Y6_GPIO_NUM   12
// #define Y7_GPIO_NUM   18
// #define Y8_GPIO_NUM   17
// #define Y9_GPIO_NUM   16
// #define VSYNC_GPIO_NUM 6
// #define HREF_GPIO_NUM  7
// #define PCLK_GPIO_NUM 13

// #define FLASH_LED LED_BUILTIN


// String response = "";
// String lastLaravelResponse = "";

// // Laravel API endpoint
// const char* laravel_endpoint = "http://10.186.237.52:8000/api/rfid-scan";

// // ---------- Streaming Function ----------
// void sendDataToLaravel(String uid, String hall, camera_fb_t *fb) {
//   if (WiFi.status() != WL_CONNECTED) {
//     Serial.println("WiFi not connected.");
//     return;
//   }

//   WiFiClient client;

//   if (!client.connect("10.186.237.52", 8000)) {
//     Serial.println("Connection to Laravel failed.");
//     return;
//   }

//   String boundary = "----ESP32Boundary";
//   String header = "";
  
//   header += "--" + boundary + "\r\n";
//   header += "Content-Disposition: form-data; name=\"uid\"\r\n\r\n";
//   header += uid + "\r\n";
  
//   header += "--" + boundary + "\r\n";
//   header += "Content-Disposition: form-data; name=\"hall_name\"\r\n\r\n";
//   header += hall + "\r\n";
  
//   header += "--" + boundary + "\r\n";
//   header += "Content-Disposition: form-data; name=\"image\"; filename=\"" + uid + ".jpg\"\r\n";
//   header += "Content-Type: image/jpeg\r\n\r\n";

//   String footer = "\r\n--" + boundary + "--\r\n";

//   // Send HTTP POST headers
//   client.printf("POST /api/rfid-scan HTTP/1.1\r\n");
//   client.printf("Host: 10.186.237.52:8000\r\n");
//   client.printf("Content-Type: multipart/form-data; boundary=%s\r\n", boundary.c_str());
//   client.printf("Content-Length: %d\r\n", header.length() + fb->len + footer.length());
//   client.print("\r\n");

//   // Send text + image stream
//   client.print(header);           // UID + Hall text fields
//   client.write(fb->buf, fb->len); // Image bytes
//   client.print(footer);           // Closing boundary

//   Serial.println("Data streamed to Laravel.");

//   // Properly wait for response

//   // ✅ Read response
//   String response = "";
//   long timeout = millis() + 20000; // allow 20s max for Laravel
//   while (client.connected() && millis() < timeout) {
//     while (client.available()) {
//       response += client.readString();
//     }
//     delay(10);
//   }

//   // ✅ Extract JSON body (after headers)
//   int bodyIndex = response.indexOf("\r\n\r\n");
//   if (bodyIndex != -1) {
//     lastLaravelResponse = response.substring(bodyIndex + 4);  
//   } else {
//     lastLaravelResponse = response;  // fallback
//   }

//   if (lastLaravelResponse.length() > 0) {
//     Serial.println("=== Laravel JSON ===");
//     Serial.println(lastLaravelResponse);
//   } else {
//     Serial.println("No JSON from Laravel.");
//   }

//   client.stop();
// }

// // ---------- Trigger Handler ----------
// void handleTrigger() {
//   String uid  = server.arg("uid");
//   String hall = server.arg("hall");

//   Serial.println("=== TRIGGER RECEIVED ===");
//   Serial.print("UID: "); Serial.println(uid);
//   Serial.print("Hall: "); Serial.println(hall);

//   digitalWrite(FLASH_LED, HIGH);
//   delay(100);

//   camera_fb_t *fb = esp_camera_fb_get();
//   if (!fb) {
//     Serial.println("Camera capture failed!");
//     digitalWrite(FLASH_LED, LOW);
//     server.send(500, "text/plain", "Camera capture failed");
//     return;
//   }

//   Serial.print("Image Size: "); Serial.println(fb->len);


//   // Stream to Laravel API
//   sendDataToLaravel(uid, hall, fb);

//   esp_camera_fb_return(fb);
//   digitalWrite(FLASH_LED, LOW);

  
// // ✅ Send Laravel JSON back to Controller 1
//   if (lastLaravelResponse.length() > 0) {
//     server.send(200, "application/json", lastLaravelResponse);
//   } else {
//     server.send(504, "application/json", "{\"message\":\"Timeout waiting for Laravel\"}");
//   }
// }

// // ---------- Camera Server ----------
// void startCameraServer() {
//   server.on("/trigger", HTTP_POST, handleTrigger);
//   server.begin();
// }

// // ---------- Setup ----------
// void setup() {
//   Serial.begin(115200);

//   pinMode(FLASH_LED, OUTPUT);
//   digitalWrite(FLASH_LED, LOW);

//   // WiFi
//   WiFi.begin(ssid, password);
//   Serial.println("Connecting to WiFi...");
//   while (WiFi.status() != WL_CONNECTED) {
//     delay(500);
//     Serial.print(".");
//   }
//   Serial.println("\nWiFi connected. IP: " + WiFi.localIP().toString());

//   // Camera config
//   camera_config_t config;
//   config.ledc_channel = LEDC_CHANNEL_0;
//   config.ledc_timer = LEDC_TIMER_0;
//   config.pin_d0 = Y2_GPIO_NUM;
//   config.pin_d1 = Y3_GPIO_NUM;
//   config.pin_d2 = Y4_GPIO_NUM;
//   config.pin_d3 = Y5_GPIO_NUM;
//   config.pin_d4 = Y6_GPIO_NUM;
//   config.pin_d5 = Y7_GPIO_NUM;
//   config.pin_d6 = Y8_GPIO_NUM;
//   config.pin_d7 = Y9_GPIO_NUM;
//   config.pin_xclk = XCLK_GPIO_NUM;
//   config.pin_pclk = PCLK_GPIO_NUM;
//   config.pin_vsync = VSYNC_GPIO_NUM;
//   config.pin_href = HREF_GPIO_NUM;
//   config.pin_sscb_sda = SIOD_GPIO_NUM;
//   config.pin_sscb_scl = SIOC_GPIO_NUM;
//   config.pin_pwdn = PWDN_GPIO_NUM;
//   config.pin_reset = RESET_GPIO_NUM;
//   config.xclk_freq_hz = 20000000;
//   config.pixel_format = PIXFORMAT_JPEG;
//   config.frame_size = FRAMESIZE_QVGA;
//   config.jpeg_quality = 15;
//   config.fb_count = 1;

//   if (esp_camera_init(&config) != ESP_OK) {
//     Serial.println("Camera init failed!");
//     return;
//   }

//   // === FIX ORIENTATION HERE ===
//   sensor_t *s = esp_camera_sensor_get();
//   if (s) {
//     s->set_vflip(s, 1);    // Flip vertically if upside down
//     s->set_hmirror(s, 0);  // Change to 1 if mirrored left/right
//   }

//   startCameraServer();
//   Serial.println("Server started, waiting for trigger from Controller 1...");
// }

// void loop() {
//   server.handleClient();
// }

// =================== new setting the timeout response ======================
// =================== CAMERA CONTROLLER 2 ===================
#include "esp_camera.h"
#include <WiFi.h>
#include <WebServer.h>

#include <WiFiClient.h>   // For streaming
#include <HTTPClient.h>

const char* ssid = "Js'Media";
const char* password = "password";

WebServer server(80);

// Camera pin configuration (ESP32-CAM)
#define PWDN_GPIO_NUM  -1
#define RESET_GPIO_NUM -1
#define XCLK_GPIO_NUM  15
#define SIOD_GPIO_NUM  4
#define SIOC_GPIO_NUM  5
#define Y2_GPIO_NUM   11
#define Y3_GPIO_NUM    9
#define Y4_GPIO_NUM    8
#define Y5_GPIO_NUM   10
#define Y6_GPIO_NUM   12
#define Y7_GPIO_NUM   18
#define Y8_GPIO_NUM   17
#define Y9_GPIO_NUM   16
#define VSYNC_GPIO_NUM 6
#define HREF_GPIO_NUM  7
#define PCLK_GPIO_NUM 13

#define FLASH_LED LED_BUILTIN 
// #define FLASH_LED 4


String lastLaravelResponse = "";

// Laravel API endpoint
const char* laravel_endpoint = "http://10.178.210.52:8000/api/rfid-scan";
// 10.106.87.52
// ---------- Streaming Function ----------
void sendDataToLaravel(String uid, String hall, camera_fb_t *fb) {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("WiFi not connected.");
    return;
  }

  WiFiClient client;
//change me if changes occur 10.106.87.52
  if (!client.connect("10.178.210.52", 8000)) {
    Serial.println("Connection to Laravel failed.");
    return;
  }

  String boundary = "----ESP32Boundary";
  String header = "";
  
  header += "--" + boundary + "\r\n";
  header += "Content-Disposition: form-data; name=\"uid\"\r\n\r\n";
  header += uid + "\r\n";
  
  header += "--" + boundary + "\r\n";
  header += "Content-Disposition: form-data; name=\"hall_name\"\r\n\r\n";
  header += hall + "\r\n";
  
  header += "--" + boundary + "\r\n";
  header += "Content-Disposition: form-data; name=\"image\"; filename=\"" + uid + ".jpg\"\r\n";
  header += "Content-Type: image/jpeg\r\n\r\n";

  String footer = "\r\n--" + boundary + "--\r\n";

  // Send HTTP POST headers
  client.printf("POST /api/rfid-scan HTTP/1.1\r\n");
  client.printf("Host: 10.178.210.52:8000\r\n"); //change me if changes occur
  client.printf("Content-Type: multipart/form-data; boundary=%s\r\n", boundary.c_str());
  client.printf("Content-Length: %d\r\n", header.length() + fb->len + footer.length());
  client.print("\r\n");

  // Send text + image stream
  client.print(header);           // UID + Hall text fields
  client.write(fb->buf, fb->len); // Image bytes
  client.print(footer);           // Closing boundary

  Serial.println("Data streamed to Laravel. Waiting for response...");

  // ✅ Read response with 30s timeout
  String response = "";
  long timeout = millis() + 30000; // allow 30s max
  while (client.connected() && millis() < timeout) {
    while (client.available()) {
      response += client.readString();
    }
    delay(10);
  }

  // ✅ Extract JSON body (after headers)
  int bodyIndex = response.indexOf("\r\n\r\n");
  if (bodyIndex != -1) {
    lastLaravelResponse = response.substring(bodyIndex + 4);  
  } else {
    lastLaravelResponse = response;  // fallback
  }

  if (lastLaravelResponse.length() > 0) {
    Serial.println("=== Laravel JSON ===");
    Serial.println(lastLaravelResponse);
  } else {
    Serial.println("No JSON from Laravel.");
  }

  client.stop();
}

// ---------- Trigger Handler ----------
void handleTrigger() {
  String uid  = server.arg("uid");
  String hall = server.arg("hall");

  Serial.println("=== TRIGGER RECEIVED ===");
  Serial.print("UID: "); Serial.println(uid);
  Serial.print("Hall: "); Serial.println(hall);

  digitalWrite(FLASH_LED, HIGH);
  delay(100);

  camera_fb_t *fb = esp_camera_fb_get();
  if (!fb) {
    Serial.println("Camera capture failed!");
    digitalWrite(FLASH_LED, LOW);
    server.send(500, "text/plain", "Camera capture failed");
    return;
  }

  Serial.print("Image Size: "); Serial.println(fb->len);

  // Stream to Laravel API
  sendDataToLaravel(uid, hall, fb);

  esp_camera_fb_return(fb);
  digitalWrite(FLASH_LED, LOW);

  // ✅ Send Laravel JSON back to Controller 1
  if (lastLaravelResponse.length() > 0) {
    server.send(200, "application/json", lastLaravelResponse);
  } else {
    server.send(504, "application/json", "{\"message\":\"Timeout waiting for Laravel\"}");
  }
}

// ---------- Camera Server ----------
void startCameraServer() {
  server.on("/trigger", HTTP_POST, handleTrigger);
  server.begin();
}

// ---------- Setup ----------
void setup() {
  Serial.begin(115200);

  pinMode(FLASH_LED, OUTPUT);
  digitalWrite(FLASH_LED, LOW);

  // WiFi
  WiFi.begin(ssid, password);
  Serial.println("Connecting to WiFi...");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi connected. IP: " + WiFi.localIP().toString());

  // Camera config
  camera_config_t config;
  config.ledc_channel = LEDC_CHANNEL_0;
  config.ledc_timer = LEDC_TIMER_0;
  config.pin_d0 = Y2_GPIO_NUM;
  config.pin_d1 = Y3_GPIO_NUM;
  config.pin_d2 = Y4_GPIO_NUM;
  config.pin_d3 = Y5_GPIO_NUM;
  config.pin_d4 = Y6_GPIO_NUM;
  config.pin_d5 = Y7_GPIO_NUM;
  config.pin_d6 = Y8_GPIO_NUM;
  config.pin_d7 = Y9_GPIO_NUM;
  config.pin_xclk = XCLK_GPIO_NUM;
  config.pin_pclk = PCLK_GPIO_NUM;
  config.pin_vsync = VSYNC_GPIO_NUM;
  config.pin_href = HREF_GPIO_NUM;
  config.pin_sscb_sda = SIOD_GPIO_NUM;
  config.pin_sscb_scl = SIOC_GPIO_NUM;
  config.pin_pwdn = PWDN_GPIO_NUM;
  config.pin_reset = RESET_GPIO_NUM;
  config.xclk_freq_hz = 20000000;
  config.pixel_format = PIXFORMAT_JPEG;
  // config.frame_size = FRAMESIZE_QVGA; //this is the real one
  config.frame_size = FRAMESIZE_VGA;
  config.jpeg_quality = 15;
  config.fb_count = 1;

  if (esp_camera_init(&config) != ESP_OK) {
    Serial.println("Camera init failed!");
    return;
  }

  // === FIX ORIENTATION HERE ===
  sensor_t *s = esp_camera_sensor_get();
  if (s) {
    s->set_vflip(s, 1);    // Flip vertically if upside down
    s->set_hmirror(s, 0);  // Change to 1 if mirrored left/right
  }

  startCameraServer();
  Serial.println("Server started, waiting for trigger from Controller 1...");
}

void loop() {
  server.handleClient();
}
