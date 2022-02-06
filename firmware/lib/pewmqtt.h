#pragma once

#include <IRremoteESP8266.h>
#include <ArduinoJson.h>
#include <cstdint>

#define TOPIC_ROOT "irblaster"
#define TOPIC_PING "ping"
#define TOPIC_INPUT "input"
#define TOPIC_OUTPUT "output"
#define TOPIC_GET "get"
#define TOPIC_SET "set"
#define TOPIC_CONTROL "control"
#define TOPIC_DISCONNECT "disconnect"
#define INPUT_EVENTS_MAX_COUNT 256

const uint32_t MQTT_BUFFER_CAPACITY = JSON_ARRAY_SIZE(INPUT_EVENTS_MAX_COUNT)
	+ INPUT_EVENTS_MAX_COUNT * JSON_OBJECT_SIZE(5);

typedef enum {
	CMD_TX_PAUSE,
	CMD_TX_RESUME,
	CMD_TX_STOP,
	CMD_MAX
} CommandType;

typedef struct {
	CommandType type;
} Command;

typedef enum {
	EVENT_NULL = -1,
	EVENT_SIGNAL = 0,
	EVENT_SLEEP,
	EVENT_TYPE_MAX
} EventType;

typedef struct {
	decode_type_t protocol;
	uint64_t code;
	uint16_t nbits;
} EventSignal;

typedef struct {
	int32_t ms;
} EventSleep;

// json [{type: EventType, ...(EventSignal|EventSleep)}]
typedef struct {
	EventType type;
	union {
		EventSignal signal;
		EventSleep sleep;
	} data;
} Event;

void PEWMQTT_init();
void PEWMQTT_publish_event(const Event* event);
