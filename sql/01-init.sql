-- Database initialization script for SAP simulation
-- This script is run automatically by Docker PostgreSQL container

-- The database 'sap' and user 'sap_user' are already created by Docker environment variables
-- We just need to set up the schema and grant permissions

-- Grant all privileges to sap_user on the database
GRANT ALL PRIVILEGES ON DATABASE sap TO sap_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO sap_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO sap_user;

-- Set default privileges for future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO sap_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO sap_user;