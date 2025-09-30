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
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO sap_user;[root@fake-sap sql]# cat 02-sap-hcm-schema.sql
-- Function
CREATE OR REPLACE FUNCTION update_updated_at_char_column()
RETURNS TRIGGER AS $$
BEGIN
          NEW.updated_at_char := to_char(now(), 'YYYY-MM-DD HH24:MI:SS.MS');
          RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Table
CREATE TABLE IF NOT EXISTS pa0000 (
          id SERIAL PRIMARY KEY,
          mandt VARCHAR(3) DEFAULT '100',
          pernr VARCHAR(8) NOT NULL,
          subty VARCHAR(4) DEFAULT '0000',
          objps VARCHAR(2) DEFAULT '00',
          sprps VARCHAR(1) DEFAULT 'A',
          endda DATE NOT NULL,
          begda DATE NOT NULL,
          seqnr VARCHAR(3) DEFAULT '000',
          actio VARCHAR(2),
          massn VARCHAR(2),
          massg VARCHAR(2),
          stat2 VARCHAR(1),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at_char VARCHAR(25)
        );

        GRANT ALL ON TABLE pa0000 TO sap_user;

        -- Drop+create trigger (no OR REPLACE in Postgres)
DROP TRIGGER IF EXISTS update_pa0000_updated_at_char_trigger ON pa0000;

CREATE TRIGGER update_pa0000_updated_at_char_trigger
BEFORE INSERT OR UPDATE ON pa0000
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_char_column();

-- (Optional) backfill after initial INSERTs if needed
-- UPDATE pa0000 SET updated_at_char = to_char(now(),'YYYY-MM-DD HH24:MI:SS.MS')
-- WHERE updated_at_char IS NULL;

-- Sample data
INSERT INTO pa0000 (pernr, endda, begda, actio, massn, massg) VALUES
('10000001', '9999-12-31', '2020-01-01', '01', '01', '01'),
('10000002', '9999-12-31', '2020-02-15', '01', '01', '01'),
('10000003', '9999-12-31', '2020-03-10', '01', '01', '01'),
('10000004', '9999-12-31', '2020-04-20', '01', '01', '01');