//default libraries
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

//custom libraries
#include <mosquitto.h>
#include <rtl-sdr.h>


//define constants
//RTL SDR constants
#define APRS_FREQ 144800000 //144,800MHz (European APRS Frequency)
#define SDR_SAMPLE_RATE 2048000 //2.048MSPS (Good for APRS)

//MQTT constants
#define MQTT_HOST "localhost"
#define MQTT_PORT 1883
#define MQTT_TOPIC "RTL_SDR/APRS"


int main()
{
    

    return 0;
}