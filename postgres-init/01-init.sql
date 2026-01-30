-- Create extensions if not exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create tables if not exists in migrations
-- This ensures database is ready even if migrations fail