#!/bin/bash

# Redis Expired Key Test Script
# This script tests the Redis expiry listener by creating test keys with short TTLs

set -e

# Configuration
TEST_PREFIX="session:test"
TTL_SECONDS=5
NUM_KEYS=3

echo "=== Redis Expiry Listener Test ==="
echo ""

# Check if redis-cli is available
if ! command -v redis-cli &> /dev/null; then
    echo "ERROR: redis-cli not found. Please install Redis tools first."
    exit 1
fi

# Check if Redis is running
if ! redis-cli PING &> /dev/null; then
    echo "ERROR: Redis is not running. Make sure Redis is started first."
    exit 1
fi

echo "✓ Redis is running"
echo ""

# Get Redis info
echo "Redis Server Info:"
redis-cli INFO server | grep -E "redis_version|os" | head -2
echo ""

# Check keyspace notifications
echo "Checking keyspace notifications..."
NOTIFY_CONFIG=$(redis-cli CONFIG GET notify-keyspace-events | tail -1)
echo "Current notify-keyspace-events: $NOTIFY_CONFIG"

if [[ "$NOTIFY_CONFIG" != *"E"* ]] || [[ "$NOTIFY_CONFIG" != *"x"* ]]; then
    echo ""
    echo "⚠ Keyspace notifications for expired keys are NOT enabled!"
    echo "  Run: redis-cli CONFIG SET notify-keyspace-events Ex"
    echo ""
    read -p "Do you want to enable them now? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        redis-cli CONFIG SET notify-keyspace-events Ex
        echo "✓ Enabled keyspace notifications"
    else
        echo "⚠ Continuing without keyspace notifications - the listener may not work!"
    fi
fi

echo ""
echo "Creating $NUM_KEYS test keys with ${TTL_SECONDS}s TTL..."
echo ""

# Generate UUIDs for test sessions
for i in $(seq 1 $NUM_KEYS); do
    UUID=$(cat /proc/sys/kernel/random/uuid)
    KEY="${TEST_PREFIX}:${UUID}"
    
    # Create the key with session data
    redis-cli SETEX "$KEY" $TTL_SECONDS "$(cat <<EOF
{
    "id": "$UUID",
    "voucher": "TEST-VOUCHER-$i",
    "user_agent": "Test Client $i",
    "created_at": $(date +%s),
    "expires_at": $(($(date +%s) + $TTL_SECONDS))
}
EOF
)"
    
    echo "✓ Created key: $KEY (TTL: ${TTL_SECONDS}s)"
done

echo ""
echo "Keys created. Now run the listener in another terminal:"
echo "  php artisan redis:listen-expired"
echo ""
echo "You should see the keys expire and be processed in the listener."
echo ""
echo "Current keys:"
redis-cli KEYS "${TEST_PREFIX}:*"
echo ""
echo "Test keys will expire in ${TTL_SECONDS} seconds..."
echo ""

# Wait for keys to expire
echo "Waiting for keys to expire..."
sleep $((TTL_SECONDS + 2))

echo ""
echo "After expiration:"
redis-cli KEYS "${TEST_PREFIX}:*" || echo "✓ All test keys have expired and were cleaned up"

echo ""
echo "=== Test Complete ==="

