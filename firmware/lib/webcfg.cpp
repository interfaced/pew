#include <cstring>
#include <cstdio>
#include <FS.h>
#include <ESP8266WebServer.h>
#include "./webcfg.h"
#include "./config.h"
#include "./utils.h"

extern ESP8266WebServer server;
extern Config cfg;

static void handleRoot();
static void handleLoad();
static void handleSubmit();
static void handleNotFound();

void WEBCFG_bindHandlers()
{
	server.on("/", HTTP_GET, handleRoot);
	server.on("/load", HTTP_GET, handleLoad);
	server.on("/submit", HTTP_POST, handleSubmit);
	server.onNotFound(handleNotFound);
}

static void handleRoot()
{
	static char path[] = "/main.min.html";
	if (SPIFFS.exists(path))
	{
		File file = SPIFFS.open(path, "r");
		size_t sent = server.streamFile(file, "text/html");
		file.close();
	}
	else
	{
		server.send(404, "text/plain", "404: Not found");
	}
}

static void handleLoad()
{
	char body[256];
	memset(body, 0, 256);
	sprintf(body, "{"
			"\"id\":\"%s\","
			"\"ssid\":\"%s\","
			"\"pass\":\"%s\","
			"\"mqtt_host\":\"%s\","
			"\"mqtt_port\":\"%d\""
			"}",
			cfg.id,
			cfg.ssid,
			cfg.pass,
			cfg.mqtt_host,
			cfg.mqtt_port
			);
	server.send(200, "application/json", body);
}

static void handleSubmit()
{
	char *msg = "Blaster will reset and try connect to provided AP (in case of error previous page will be available)";
	server.send(200, "text/plain", msg);

	if (server.hasArg("plain")) {
		char str[512];
		strcpy(str, server.arg("plain").c_str());
		char* tokens = str;
		char* pair = tokens;

		while ((pair = strsep(&tokens, "&"))) {
			char* var = strtok(pair, "=");
			char* val = 0;
			if (var && (val = strtok(NULL, "=")))
			{
				if (strcmp(var, "id") == 0)
				{
					strcpy(cfg.id, val);
					continue;
				}

				if (strcmp(var, "ssid") == 0)
				{
					strcpy(cfg.ssid, val);
					continue;
				}

				if (strcmp(var, "pass") == 0)
				{
					strcpy(cfg.pass, val);
					continue;
				}

				if (strcmp(var, "mqtt_host") == 0)
				{
					strcpy(cfg.mqtt_host, val);
					continue;
				}

				if (strcmp(var, "mqtt_port") == 0)
				{
					cfg.mqtt_port = (uint32_t)atoi(val);
					continue;
				}
			}
		}

		cfg.configured = strlen(cfg.id) &&
			strlen(cfg.ssid) &&
			strlen(cfg.pass) &&
			cfg.mqtt_port > 0 &&
			strlen(cfg.mqtt_host);

		if (config_write(cfg))
		{
			if (cfg.configured)
			{
				Serial.printf("[CFG] System configured -> reboot\n");
				delay_fn(2000, FUNC_T(system_restart));
			}
		}
	}
}

static void handleNotFound()
{
	server.send(404, "text/plain", "404: Not found");
}
