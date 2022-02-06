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
#ifdef PEW_ENABLE_TX
	if (deviceState.status == Status::STATUS_BUSY)
	{
		return;
	}

	deviceState.status = Status::STATUS_BUSY;
	send_signal(signal);
	deviceState.status = Status::STATUS_IDLE;
#endif
}

static void send_signal(EventSignal* signal)
{
#ifdef PEW_ENABLE_TX
	irsend.send(signal->protocol, signal->code, signal->nbits);
#endif
}

static os_timer_t send_events_timer;
static Event* events_buffer = 0;
static uint32_t events_buffer_len = 0;
static int current_event_idx = 0;

static void send_events()
{
	os_timer_disarm(&send_events_timer);

	if (deviceState.status != Status::STATUS_BUSY)
	{
		return;
	}

	if (current_event_idx < events_buffer_len)
	{
		Event* eventp = &(events_buffer[current_event_idx]);
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
		current_event_idx++;

		os_timer_arm(&send_events_timer, sleep_ms, 1);
		return;
	}

	PEW_stop();
	PEWMQTT_notify_state_change();
}

bool PEW_pause()
{
	if (deviceState.status == Status::STATUS_BUSY)
	{
		os_timer_disarm(&send_events_timer);
		deviceState.status = Status::STATUS_PAUSED;
	}

	return deviceState.status == Status::STATUS_PAUSED;
}

bool PEW_resume()
{
	if (deviceState.status == Status::STATUS_PAUSED)
	{
		os_timer_arm(&send_events_timer, 100, 1);
		deviceState.status = Status::STATUS_BUSY;
	}

	return deviceState.status == Status::STATUS_BUSY;
}

bool PEW_stop()
{
	if (deviceState.status != Status::STATUS_IDLE)
	{
		os_timer_disarm(&send_events_timer);
		current_event_idx = 0;
		events_buffer = 0;
		events_buffer_len = 0;
		deviceState.status = Status::STATUS_IDLE;
	}

	return deviceState.status == Status::STATUS_IDLE;
}

void PEW_send_events(Event* events, uint32_t size)
{
#ifdef PEW_ENABLE_TX
	if (deviceState.status != Status::STATUS_IDLE)
	{
		return;
	}

	deviceState.status = Status::STATUS_BUSY;
	PEWMQTT_notify_state_change();
	events_buffer = events;
	events_buffer_len = size;
	os_timer_setfn(&send_events_timer, FUNC_T(send_events), (void*)0);
	send_events();
#endif
}

static void enable_irrecv()
{
	irrecv.enableIRIn();
}
