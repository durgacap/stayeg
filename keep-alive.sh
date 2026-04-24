#!/bin/bash
cd /home/z/my-project
while true; do
  NODE_OPTIONS="--max-old-space-size=4096" npx next dev -p 3000 2>&1
  echo "Server exited at $(date). Restarting in 5s..."
  sleep 5
done
