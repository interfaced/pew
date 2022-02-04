# My makefile
ESP_ROOT = $(HOME)/Arduino/hardware/esp8266com/esp8266
LIBS = $(HOME)/Arduino/libraries/IRremoteESP8266/src \
	   $(HOME)/Arduino/libraries/pubsubclient/src \
	   $(HOME)/Arduino/hardware/esp8266com/esp8266/libraries \
	   $(HOME)/Arduino/libraries/ESP_EEPROM/src \
	   $(HOME)/Arduino/libraries/ArduinoJson/src \
	   lib
SKETCH = main.ino

UPLOAD_PORT = /dev/ttyUSB0
BOARD = d1_mini

WEB_SRC = web/main.html
WEB_MIN_SRC = data/main.min.html

web: $(WEB_MIN_SRC)
	@echo "WEB_SIZE="$(shell du -b $(WEB_MIN_SRC) | awk '{ print $$1; }')

$(WEB_MIN_SRC): $(WEB_SRC)
	$(Q) awk '{ gsub(/^[ \t]+|[ \t]+$$/, ""); printf("%s", $$0) } END { print "" }' $(WEB_SRC) > $(WEB_MIN_SRC)

include ./makeEspArduino/makeEspArduino.mk
