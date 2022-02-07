#include <Arduino.h>
#include <IRremoteESP8266.h>
#include <ESP8266WiFi.h>
#include <IRrecv.h>
#include <IRsend.h>
#include <IRutils.h>
#include <ESP8266WebServer.h>
#include <FS.h>
#include <ESP_EEPROM.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>
#include "./lib/config.h"
#include "./lib/webcfg.h"
#include "./lib/pewmqtt.h"
#include "./lib/pew.h"
#include "./lib/utils.h"

#define WIFI_CONNECT_TIMEOUT_MS 10000
#define MQTT_CONNECT_TIMEOUT_MS 15000

const IPAddress local_IP(192,168,4,22);
const IPAddress gateway(192,168,4,9);
const IPAddress subnet(255,255,255,0);

// glabals
decode_results results;
ESP8266WebServer server(CFG_WEB_PORT);
IRrecv irrecv(PEW_RX_PIN);
IRsend irsend(PEW_TX_PIN);
Config cfg = CFG_ZERO;
WiFiClient wifiClient;
PubSubClient mqttClient(wifiClient);
DeviceState deviceState = DEVICE_ZERO;

bool wifi_connect();
bool mqtt_connect();

void setup()
{
	Serial.begin(115200);
	Serial.println();

	EEPROM.begin(sizeof(Config));
	config_read(cfg);

	if (CFG_CHECK_SIG(cfg))
	{
		cfg = CFG_ZERO;
		uint32_t dev_id = os_random();
		sprintf(cfg.dev_id, "%" PRIX32, dev_id);
		config_write(cfg);
	}

	if (cfg.configured)
	{
		WiFi.mode(WIFI_STA);
		WiFi.begin(cfg.ssid, cfg.pass);

		if (!wifi_connect())
			return;

		mqttClient.setServer(cfg.mqtt_host, cfg.mqtt_port);

		if (!mqtt_connect())
			return;

		PEW_init();
		PEWMQTT_init();
#ifdef PEW_ENABLE_RX
		irrecv.enableIRIn();
#endif
#ifdef PEW_ENABLE_TX
		irsend.begin();
#endif
	}
	else
	{
		WiFi.softAPConfig(local_IP, gateway, subnet);
		WiFi.softAP(CFG_AP_NAME);
		Serial.printf("[CFG] Access Point: %s\n", CFG_AP_NAME);
		Serial.printf("[CFG] Host config page at %s:%d\n", WiFi.softAPIP().toString().c_str(), CFG_WEB_PORT);

		SPIFFS.begin();

		WEBCFG_bindHandlers();
		server.begin();
	}
}

void loop()
{
	if (cfg.configured)
	{
		if (!mqttClient.connected())
			mqtt_connect();

		mqttClient.loop();
#ifdef PEW_ENABLE_RX
		PEW_loop();
#endif
	}
	else
	{
		server.handleClient();
	}
}

bool wifi_connect()
{
	uint32_t start = millis();
	Serial.printf("[WIFI] Connecting to [%s]\n", cfg.ssid);
	while (WiFi.status() != WL_CONNECTED) {
		if (millis() - start < WIFI_CONNECT_TIMEOUT_MS)
		{
			delay(500);
			Serial.print(".");
		}
		else
		{
			Serial.printf("\n[WIFI] Connection timeout -> reboot in config mode\n");
			cfg.configured = false;
			config_write(cfg);
			delay_fn(500, FUNC_T(system_restart));
			return false;
		}
	}
	Serial.printf("\n[WIFI] Successfully connected to [%s]\n", cfg.ssid);
	return true;
}

bool mqtt_connect()
{
	uint32_t start = millis();
	Serial.printf("[MQTT] Connecting to [%s:%d] as %s::%s\n", cfg.mqtt_host, cfg.mqtt_port, cfg.id, cfg.dev_id);
	char topic[256];
	memset(topic, 0, 256);
	sprintf(topic, "/" TOPIC_ROOT "/%s::%s/" TOPIC_DISCONNECT, cfg.id, cfg.dev_id);

	while (!mqttClient.connected())
	{
		if (millis() - start < MQTT_CONNECT_TIMEOUT_MS)
		{
			if (!mqttClient.connect(cfg.dev_id, cfg.id, NULL, topic, 1, false, "1"))
			{
				delay(2000);
				Serial.printf("[MQTT] State = %d\n", mqttClient.state());
			}
		}
		else
		{
			Serial.printf("\n[MQTT] Connection timeout -> reboot in config mode\n");
			cfg.configured = false;
			config_write(cfg);
			delay_fn(500, FUNC_T(system_restart));
			return false;
		}
	}
	Serial.printf("[MQTT] Successfully connected to [%s:%d]\n", cfg.mqtt_host, cfg.mqtt_port);

	Serial.printf("[MQTT] Trying to set buffer capacity = %d\n", MQTT_BUFFER_CAPACITY);
	mqttClient.setBufferSize(MQTT_BUFFER_CAPACITY);
	Serial.printf("[MQTT] Buffer capacity = %d bytes\n", mqttClient.getBufferSize());

	return true;
}
