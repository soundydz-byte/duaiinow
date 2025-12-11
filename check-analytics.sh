#!/bin/bash

echo "🔍 Checking if analytics_events table has data..."
echo ""

# Run SQL query to count events
psql -h $SUPABASE_HOST -U postgres -d postgres -c "
  SELECT 
    COUNT(*) as total_events,
    COUNT(DISTINCT user_id) as unique_users,
    COUNT(CASE WHEN timestamp >= NOW() - INTERVAL '7 days' THEN 1 END) as events_last_week
  FROM analytics_events;
"
