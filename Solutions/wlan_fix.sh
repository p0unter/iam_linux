#!/bin/bash

# Description: Script to fix WLAN issues on Kali Linux by restarting interfaces and services.
# Logs all actions with timestamps to wlan_fix.log.

LOGFILE="wlan_fix.log"

# Function to log messages with timestamp
log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOGFILE"
}

# Function to run a command and check for errors
run_cmd() {
    log "Running: $*"
    if "$@"; then
        log "Success: $*"
    else
        log "Error: Command failed -> $*"
        echo "Error encountered. Check $LOGFILE for details."
        exit 1
    fi
}

log "=== WLAN Fix Script Started ==="

# Kill processes that might interfere with airmon-ng
run_cmd sudo airmon-ng check kill

# Start monitor mode on wlan0
run_cmd sudo airmon-ng start wlan0

# Start monitor mode on wlan0mon (sometimes airmon-ng creates wlan0mon)
run_cmd sudo airmon-ng start wlan0mon

# Start airodump-ng on wlan0mon (run in background and log output)
log "Starting airodump-ng on wlan0mon (will run for 10 seconds)..."
sudo timeout 10 airodump-ng wlan0mon | tee -a "$LOGFILE"

# Stop monitor mode on wlan0mon
run_cmd sudo airmon-ng stop wlan0mon

# Restart networking services
run_cmd sudo service networking restart
run_cmd sudo service NetworkManager restart

log "=== WLAN Fix Script Completed Successfully ==="
