#!/bin/bash

# Redis Keyspace Notifications Setup Script
# This script enables Redis keyspace notifications for expired keys
# Required for the redis:listen-expired command to work

set -e

echo "=== Redis Keyspace Notifications Setup ==="
echo ""

# Check if redis-cli is available
if ! command -v redis-cli &> /dev/null; then
    echo "ERROR: redis-cli not found. Please install Redis tools first."
    exit 1
fi

echo "Step 1: Checking current Redis configuration..."
CURRENT_CONFIG=$(redis-cli CONFIG GET notify-keyspace-events 2>/dev/null | tail -1)

if [ -z "$CURRENT_CONFIG" ]; then
    echo "ERROR: Could not connect to Redis. Make sure Redis is running."
    exit 1
fi

echo "Current notify-keyspace-events: $CURRENT_CONFIG"

# Check if expired key notifications are already enabled
if [[ "$CURRENT_CONFIG" == *"E"* ]] && [[ "$CURRENT_CONFIG" == *"x"* ]]; then
    echo ""
    echo "✓ Keyspace notifications for expired keys are already enabled!"
else
    echo ""
    echo "Step 2: Enabling keyspace notifications for expired keys..."
    
    # Enable expired key notifications
    redis-cli CONFIG SET notify-keyspace-events Ex
    
    if [ $? -eq 0 ]; then
        echo "✓ Successfully enabled notify-keyspace-events Ex"
        
        # Persist the configuration (optional - may require write permissions)
        echo ""
        echo "Step 3: Persisting configuration..."
        if redis-cli CONFIG REWRITE 2>/dev/null; then
            echo "✓ Configuration persisted to redis.conf"
        else
            echo "⚠ Could not persist configuration (permission issue or no redis.conf)"
            echo "  You may need to manually add to your redis.conf:"
            echo "  notify-keyspace-events Ex"
        fi
    else
        echo "ERROR: Failed to enable keyspace notifications"
        exit 1
    fi
fi

echo ""
echo "Step 4: Verifying configuration..."
NEW_CONFIG=$(redis-cli CONFIG GET notify-keyspace-events | tail -1)
echo "New notify-keyspace-events: $NEW_CONFIG"

echo ""
echo "=== Setup Complete ==="
echo ""
echo "You can now start the expiry listener with:"
echo "  php artisan redis:listen-expired"
echo ""
echo "Test with:"
echo "  redis-cli SETEX session:test 5 \"hello\""

