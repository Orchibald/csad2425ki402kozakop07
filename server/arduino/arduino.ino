void setup() {
  Serial.begin(9600); 
}

void loop() {
  if (Serial.available() > 0) {
    String command = Serial.readStringUntil('\n'); 
    Serial.println("Received: " + command); 
  }
}
