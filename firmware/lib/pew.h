#pragma once

#include <cstdint>
#include "./pewmqtt.h"

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
