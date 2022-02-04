#include <cstring>
#include <ESP_EEPROM.h>
#include "./config.h"

bool config_read(Config& cfg)
{
	EEPROM.get(CONFIG_EEPROM_ADDR, cfg);
	return true;
}

bool config_write(Config& cfg)
{
	EEPROM.put(CONFIG_EEPROM_ADDR, cfg);
	return EEPROM.commit();
}
