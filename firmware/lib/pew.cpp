#include <Arduino.h>
#include <PubSubClient.h>
#include <IRutils.h>
#include <IRremoteESP8266.h>
#include <IRrecv.h>
#include <IRsend.h>
#include "./pew.h"
#include "./pewmqtt.h"
#include "./utils.h"

extern DeviceState deviceState;
extern IRrecv irrecv;
extern IRsend irsend;
extern decode_results results;
extern PubSubClient mqttClient;

const char* capabilities = CAPABILITIES_BEGIN
#ifdef ENABLE_CAPABILITY_MODE_WALL
	CAPABILITY_MODE_WALL
#endif
#ifdef ENABLE_CAPABILITY_MODE_TRANSPARENT
	CAPABILITIES_JOIN
	CAPABILITY_MODE_TRANSPARENT
#endif
#ifdef ENABLE_CAPABILITY_POWER_TOGGLE
	CAPABILITIES_JOIN
	CAPABILITY_POWER_TOGGLE
#endif
#ifdef ENABLE_CAPABILITY_NETWORK_TOGGLE
	CAPABILITIES_JOIN
	CAPABILITY_NETWORK_TOGGLE
#endif
CAPABILITIES_END;

namespace _IRrecv
{
	extern volatile irparams_t params;
}

#define RAW_BUF_FULL (_IRrecv::params.rcvstate == kStopState)

static void enable_irrecv();
static void send_signal(EventSignal* signal);

void PEW_loop()
{
	if (RAW_BUF_FULL)
	{
		bool decode_status = irrecv.decode(&results);
		if (decode_status && results.decode_type != decode_type_t::UNKNOWN && results.bits)
		{
			irrecv.disableIRIn();
			Event event = Event{EventType::EVENT_SIGNAL};
			event.data.signal.protocol = results.decode_type;
			event.data.signal.code = results.value;
			event.data.signal.nbits = results.bits;
			PEWMQTT_publish_event(&event);
			if (deviceState.mode == Mode::MODE_TRANSPARENT)
			{
				PEW_send_single_signal(&(event.data.signal));
			}
		}
		irrecv.resume();
		delay_fn(100, FUNC_T(enable_irrecv));
	}
}

void PEW_send_single_signal(EventSignal* signal)
{
	if (deviceState.status == Status::STATUS_BUSY)
	{
		return;
	}

	deviceState.status = Status::STATUS_BUSY;
	send_signal(signal);
	deviceState.status = Status::STATUS_IDLE;
}

static void send_signal(EventSignal* signal)
{
	irsend.send(signal->protocol, signal->code, signal->nbits);
}

static os_timer_t send_events_timer;
static Event* events_buffer = 0;
static uint32_t events_buffer_len = 0;

static void send_events()
{
	static int i = 0;

	os_timer_disarm(&send_events_timer);
	if (i < events_buffer_len)
	{
		Event* eventp = &(events_buffer[i]);
		uint32_t sleep_ms = 100;
		if (eventp->type == EventType::EVENT_SIGNAL)
		{
			send_signal(&(eventp->data.signal));
		}
		else if (eventp->type == EventType::EVENT_SLEEP)
		{
			sleep_ms = eventp->data.sleep.ms;
		}
		PEWMQTT_publish_event(eventp);
		i++;

		os_timer_arm(&send_events_timer, sleep_ms, 1);
		return;
	}

	i = 0;
	events_buffer = 0;
	events_buffer_len = 0;
	deviceState.status = Status::STATUS_IDLE;
}

void PEW_send_events(Event* events, uint32_t size)
{
	if (deviceState.status == Status::STATUS_BUSY)
	{
		return;
	}

	deviceState.status = Status::STATUS_BUSY;
	events_buffer = events;
	events_buffer_len = size;
	os_timer_setfn(&send_events_timer, FUNC_T(send_events), (void*)0);
	send_events();
}

static void enable_irrecv()
{
	irrecv.enableIRIn();
}
