#include <PubSubClient.h>
#include <cstring>
#include <cstdio>
#include <ArduinoJson.h>
#include <inttypes.h>
#include "./pewmqtt.h"
#include "./config.h"
#include "./pew.h"

extern PubSubClient mqttClient;
extern Config cfg;
extern DeviceState deviceState;

static void state_as_json_str(char *buffer);
static void mqtt_recv(char* topic, uint8_t* payload, unsigned int length);
static void publish_device_state(char* topic, char* msg);
static Event events_buffer[INPUT_EVENTS_MAX_COUNT];
static uint32_t events_buffer_len = 0;

void PEWMQTT_init()
{
	mqttClient.setCallback(mqtt_recv);
	char topic[256];
	mqttClient.subscribe("/" TOPIC_ROOT "/" TOPIC_PING, 1);

	memset(topic, 0, 256);
	sprintf(topic, "/" TOPIC_ROOT "/%s/" TOPIC_GET, cfg.id);
	mqttClient.subscribe(topic, 1);

	memset(topic, 0, 256);
	sprintf(topic, "/" TOPIC_ROOT "/%s/" TOPIC_SET, cfg.id);
	mqttClient.subscribe(topic, 1);

	memset(topic, 0, 256);
	sprintf(topic, "/" TOPIC_ROOT "/%s/" TOPIC_INPUT, cfg.id);
	mqttClient.subscribe(topic, 1);

	memset(topic, 0, 256);
	sprintf(topic, "/" TOPIC_ROOT "/%s", cfg.id);

	char msg[256];
	memset(msg, 0, 256);
	publish_device_state(topic, msg);
}

static void publish_device_state(char* topic, char* msg)
{
	state_as_json_str(msg);
	mqttClient.publish(topic, (uint8_t*)msg, strlen(msg), false);
}

static void mqtt_recv(char* topic, uint8_t* payload, unsigned int length)
{
	char* topic_last = strrchr(topic, '/') + 1;
	char pub_topic[256];
	char msg[256];
	memset(pub_topic, 0, 256);
	memset(msg, 0, 256);

	// /ping -
	// /%FRIENDLY_NAME%/get -
	// если сюда пишут любое сообщение, то в irblaster/%FRIENDLY_NAME% пишется STATUS
	if (strcmp(topic_last, TOPIC_PING) == 0 || strcmp(topic_last, TOPIC_GET) == 0)
	{
		sprintf(pub_topic, "/" TOPIC_ROOT "/%s", cfg.id);
		publish_device_state(pub_topic, msg);
		return;
	}

	// /%FRIENDLY_NAME%/set - пишется STATUS или его часть
	if (strcmp(topic_last, TOPIC_SET) == 0)
	{
		const int capacity = JSON_OBJECT_SIZE(1);
		StaticJsonDocument<capacity> doc;
		DeserializationError err = deserializeJson(doc, payload);

		if (err != DeserializationError::Ok)
		{
			Serial.printf("[JSON] JSON serialization err: %d\n", err.f_str());
			return;
		}

		int mode = doc["mode"].as<int>();
		if (mode >= Mode::MODE_WALL && mode < Mode::MODE_MAX)
		{
			deviceState.mode = static_cast<Mode>(mode);
		}

		sprintf(pub_topic, "/" TOPIC_ROOT "/%s", cfg.id);
		publish_device_state(pub_topic, msg);
		return;
	}

	if (strcmp(topic_last, TOPIC_INPUT) == 0)
	{
		if (deviceState.status == Status::STATUS_BUSY)
		{
			return;
		}

		StaticJsonDocument<MQTT_BUFFER_CAPACITY> doc;
		DeserializationError err = deserializeJson(doc, payload);

		if (err != DeserializationError::Ok)
		{
			Serial.printf("[JSON] JSON serialization err: %d\n", err.f_str());
			return;
		}

		events_buffer_len = 0;
		Event* eventp = 0;

		JsonArray array = doc.as<JsonArray>();
		for (JsonVariant item : array)
		{
			if (!item.is<JsonObject>())
			{
				continue;
			}
			JsonObject item_obj = item.as<JsonObject>();
			int type = item_obj["type"].as<int>();
			if (type >= EventType::EVENT_SIGNAL && type < EventType::EVENT_TYPE_MAX)
			{
				events_buffer_len += 1;
				eventp = &(events_buffer[events_buffer_len - 1]);
				eventp->type = static_cast<EventType>(type);

				if (eventp->type == EventType::EVENT_SIGNAL)
				{
					eventp->data.signal.protocol = decode_type_t::UNKNOWN;
					int protocol = item_obj["protocol"].as<int>();
					if (protocol > decode_type_t::UNUSED && protocol <= kLastDecodeType)
					{
						eventp->data.signal.protocol = static_cast<decode_type_t>(protocol);
					}

					eventp->data.signal.code = 0;
					const char* code_str = item_obj["code"].as<const char*>();
					if (code_str != nullptr)
					{
						eventp->data.signal.code = strtoull(code_str, NULL, 16);
					}
					
					eventp->data.signal.nbits = 32;
					int nbits = item_obj["nbits"].as<int>();
					if (nbits > 0)
					{
						eventp->data.signal.nbits = nbits;
					}
				}
				else if (eventp->type == EventType::EVENT_SLEEP)
				{
					eventp->data.sleep.ms = 0;
					int ms = item_obj["ms"].as<int>();
					if (ms > 0)
					{
						eventp->data.sleep.ms = ms;
					}
				}
			}
		}

		if (events_buffer_len > 0)
		{
			PEW_send_events(events_buffer, events_buffer_len);
		}
	}
}

void PEWMQTT_publish_event(const Event* event)
{
	char topic[256];
	memset(topic, 0, 256);
	sprintf(topic, "/" TOPIC_ROOT "/%s/" TOPIC_OUTPUT, cfg.id);

	char msg[256];
	memset(msg, 0, 256);
	if (event->type == EventType::EVENT_SIGNAL)
	{
		sprintf(msg, "["
				"{"
				"\"type\": %d,"
				"\"protocol\": %d,"
				"\"code\": \"0x%" PRIX64 "\","
				"\"nbits\": %d"
				"}"
				"]",
				event->type,
				event->data.signal.protocol,
				event->data.signal.code,
				event->data.signal.nbits
				);
	}
	else if (event->type == EventType::EVENT_SLEEP)
	{
		sprintf(msg, "["
				"{"
				"\"type\": %d,"
				"\"ms\": %d"
				"}"
				"]",
				event->type,
				event->data.sleep.ms
			   );
	}
	mqttClient.publish(topic, (uint8_t*)msg, strlen(msg), false);
}

static void state_as_json_str(char *buffer)
{
  sprintf(buffer, "{"
      "\"mode\": %d,"
	  "\"status\": %d,"
	  "\"capabilities\": %s"
      "}", deviceState.mode, deviceState.status, capabilities);
}
