#pragma once

#include <cstdint>
#include "./pewmqtt.h"

#define CAPABILITY_MODE_WALL        "mode:wall"
#define CAPABILITY_MODE_TRANSPARENT "mode:transparent"
#define CAPABILITY_POWER_TOGGLE     "power:toggle"
#define CAPABILITY_NETWORK_TOGGLE   "network:toggle"
#define CAPABILITIES_BEGIN          "[\""
#define CAPABILITIES_JOIN           "\",\""
#define CAPABILITIES_END            "\"]"

#ifndef PEW_RX_PIN
#define PEW_RX_PIN 2
#endif

#ifndef PEW_TX_PIN
#define PEW_TX_PIN 13
#endif

extern const char* capabilities;

typedef enum {
	MODE_WALL = 0,
	MODE_TRANSPARENT,
	MODE_MAX
} Mode;

typedef enum {
	STATUS_IDLE = 0,
	STATUS_BUSY
} Status;

typedef struct {
	Mode mode;
	Status status;
} DeviceState;

void PEW_loop();
void PEW_send_single_signal(EventSignal* signal);
void PEW_send_events(Event* events, uint32_t size);
