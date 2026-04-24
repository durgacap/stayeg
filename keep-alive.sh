#!/bin/bash
cd /home/z/my-project
while true; do
    if ! ss -tlnp 2>/dev/null | grep -q ":3000 "; then
        echo "$(date): Server not running, starting..." >> keep-alive.log
        NODE_OPTIONS='--max-old-space-size=2048' node node_modules/.bin/next start --port 3000 -H 0.0.0.0 >> keep-alive.log 2>&1 &
        echo "$(date): Started with PID $!" >> keep-alive.log
    fi
    sleep 5
done
