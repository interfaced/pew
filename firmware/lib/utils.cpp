#include "./utils.h"

static os_timer_t timer;

void delay_fn(uint32_t ms, os_timer_func_t* fn)
{
  os_timer_disarm(&timer);
  os_timer_setfn(&timer, fn, (void*)0);
  os_timer_arm(&timer , ms, /* repeat */0);
}
