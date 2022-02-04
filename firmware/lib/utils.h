#pragma once

extern "C" {
#include "user_interface.h"
}

#define FUNC_T(FN) ((os_timer_func_t*)FN)

// system related
void delay_fn(uint32_t ms, os_timer_func_t* fn);
