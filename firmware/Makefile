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

# CAPABILITIES (comment/uncomment = disable/enable)
pew.cpp_CFLAGS += -DENABLE_CAPABILITY_MODE_WALL
pew.cpp_CFLAGS += -DENABLE_CAPABILITY_MODE_TRANSPARENT
pew.cpp_CFLAGS += -DENABLE_CAPABILITY_NETWORK_TOGGLE
#pew.cpp_CFLAGS += -DENABLE_CAPABILITY_POWER_TOGGLE

# CONFIGURATION
BUILD_EXTRA_FLAGS += -DPEW_ENABLE_RX
# (default: disabled)
BUILD_EXTRA_FLAGS += -DPEW_ENABLE_TX
# (default: disabled)
#BUILD_EXTRA_FLAGS += -DPEW_RX_PIN=2
# (default: 2)
#BUILD_EXTRA_FLAGS += -DPEW_TX_PIN=4
# (default: 13)
#BUILD_EXTRA_FLAGS += -DPEW_NET_PIN=4
# (default: 14)
#BUILD_EXTRA_FLAGS += -DPEW_POWER_PIN=4
# (default: 4)

web: $(WEB_MIN_SRC)
	@echo "WEB_SIZE="$(shell du -b $(WEB_MIN_SRC) | awk '{ print $$1; }')

$(WEB_MIN_SRC): $(WEB_SRC)
	$(Q) awk '{ gsub(/^[ \t]+|[ \t]+$$/, ""); printf("%s", $$0) } END { print "" }' $(WEB_SRC) > $(WEB_MIN_SRC)

include ./makeEspArduino/makeEspArduino.mk
