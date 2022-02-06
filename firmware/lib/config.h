#pragma once

#include <stdint.h>

#define CONFIG_EEPROM_ADDR 0

#define CFG_SIG0 0x13
#define CFG_SIG1 0x38

typedef struct {
	uint8_t sig0;
	uint8_t sig1;
	char id[32];
	char dev_id[32];
	char ssid[64];
	char pass[64];
	char mqtt_host[64];
	uint32_t mqtt_port;
	bool configured;
} Config __attribute__((aligned(4)));

#define CFG_ZERO Config{CFG_SIG0, CFG_SIG1, {0}, {0}, {0}, 0, false}
#define CFG_CHECK_SIG(CFG) ((CFG).sig0 != CFG_SIG0 || (CFG).sig1 != CFG_SIG1)

bool config_read(Config& cfg);
bool config_write(Config& cfg);
