#!/bin/bash

# ==========================================
# Configuration
# This code is generated with AI, use with caution!
# ==========================================
MQTT_HOST="localhost"
MQTT_TOPIC="RTL_SDR/RAW/APRS"
TOTAL_STEPS=15
DELAY=2

# Starting Coordinates & Movement
LAT=50.961333
LON=3.972333
LAT_STEP=0.000500 
LON_STEP=0.000500 

# Base Telemetry (will fluctuate around these values)
BASE_ALT=52
BASE_COURSE=32

# ==========================================
# Execution Loop
# ==========================================
echo "Starting dynamic APRS path simulation..."

for (( i=1; i<=$TOTAL_STEPS; i++ ))
do
    # 1. Sporadic Comment: ~10% chance to be "1", otherwise "0"
    if [ $(( RANDOM % 10 )) -eq 0 ]; then
        COMMENT="1"
    else
        COMMENT="0"
    fi

    # 2. Altitude: Base value +/- 5 meters
    ALT_JITTER=$(( (RANDOM % 11) - 5 ))
    ALT=$(( BASE_ALT + ALT_JITTER ))

    # 3. Speed: Random float between 40.0 and 55.0
    SPEED=$(awk -v seed=$RANDOM 'BEGIN {srand(seed); printf "%.1f", 40.0 + (rand() * 15)}')

    # 4. Course: Base value +/- 4 degrees
    COURSE_JITTER=$(( (RANDOM % 9) - 4 ))
    COURSE=$(( BASE_COURSE + COURSE_JITTER ))

    # Console output to track the generated variables
    echo "Publishing Step $i | Lat: $LAT, Lon: $LON | Alt: $ALT, Speed: $SPEED, Course: $COURSE, Comment: $COMMENT"

    # Construct the JSON payload with injected variables.
    # CRITICAL: The EOF tag below MUST remain completely flush with the left margin!
    PAYLOAD=$(cat <<EOF
{"source": "ON3RBU", "destination": "UPUWV8", "path": ["ON7DE*", "ON0ANT-10*", "WIDE2*"], "raw": "AAA0AAAEAC70609E9C6E8EA4406E9E9C6E888A40E09E9C60829CA8F4AE92888A6440E103F06079563E6C203C5B2F22344B7D4F4E3747522F50", "fix": true, "lat": $LAT, "lon": $LON, "comment": "$COMMENT", "altitude": $ALT, "speed": $SPEED, "course": $COURSE, "device": null, "type": "Mic-E", "symbol": {"symbol": "[", "table": "/", "index": 58, "tableindex": 14}, "mode": "APRS", "freq": 144800000}
EOF
)

    # Publish to MQTT
    mosquitto_pub -h "$MQTT_HOST" -t "$MQTT_TOPIC" -m "$PAYLOAD"

    # Advance coordinates safely using awk -v to avoid quoting errors
    LAT=$(awk -v lat="$LAT" -v step="$LAT_STEP" 'BEGIN {printf "%.6f", lat + step}')
    LON=$(awk -v lon="$LON" -v step="$LON_STEP" 'BEGIN {printf "%.6f", lon + step}')

    sleep "$DELAY"
done

echo "Path simulation complete."