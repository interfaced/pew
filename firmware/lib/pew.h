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

#ifndef PEW_NET_PIN
#define PEW_NET_PIN 14
#endif

#ifndef PEW_POWER_PIN
#define PEW_POWER_PIN 4
#endif

extern const char* capabilities;

typedef enum {
	MODE_WALL = 0,
	MODE_TRANSPARENT,
	MODE_MAX
} Mode;

typedef enum {
	STATUS_IDLE = 0,
	STATUS_BUSY,
	STATUS_PAUSED
} IRStatus;

typedef enum {
	NET_OFFLINE = 0,
	NET_ONLINE,
	NET_MAX
} NetStatus;

typedef struct {
	Mode mode;
	IRStatus ir;
	NetStatus net;
} DeviceState;

#define DEVICE_ZERO DeviceState{Mode::MODE_TRANSPARENT,IRStatus::STATUS_IDLE,NetStatus::NET_ONLINE}

void PEW_apply_net_status(NetStatus status);
void PEW_init();
void PEW_loop();
void PEW_send_single_signal(EventSignal* signal);
void PEW_send_events(Event* events, uint32_t size);
bool PEW_stop();
bool PEW_pause();
bool PEW_resume();
