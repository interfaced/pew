# PEW

## Cloning repository

```
git clone --recurse-submodules https://github.com/interfaced/pew.git
```

## Requirments

### Broker setup example

1. You have to configure mqtt-broker with support of websockets, for example mosquitto config:

```
pid_file /var/run/mosquitto/mosquitto.pid

max_connections -1

listener 9001
protocol websockets

listener 1883 0.0.0.0
allow_anonymous true

log_dest stdout

log_type error
log_type warning
log_type notice
log_type information

connection_messages true
log_timestamp true
```

2. Run mosquitto server

```sh
mosquitto -c /etc/mosquitto/mosquitto.conf
```

### Firmware

First make sure that you have the environment installed as described at: https://github.com/esp8266/Arduino

You can change location of esp8266 toolchain via `ESP_ROOT` in Makefile

```Makefile
ESP_ROOT = $(HOME)/Arduino/hardware/esp8266com/esp8266
```

#### Dependencies

Clone dependent libraries into `~/Arduino/libraries` folder

* [IRremoteESP8266](https://github.com/crankyoldgit/IRremoteESP8266)
* [ArduinoJson](https://github.com/bblanchon/ArduinoJson)
* [ESP_EEPROM](https://github.com/jwrw/ESP_EEPROM)
* [pubsubclient](https://github.com/knolleary/pubsubclient)

#### Building

```
make web
make flash_fs
make flash
```

#### Configuration

At first boot board will act as AP `pew-config-ap` and host web-page at `192.168.4.22:1337`.

Via configuration stage you can change next options:

* Network SSID - target AP to connect to
* Network password - target AP pass
* Device name - friendly device name which will be used in topic names (example: `webos18`)
* MQTT broker address
* MQTT broker port
