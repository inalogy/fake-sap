-- SAP HCM (Human Capital Management) Schema
-- Employee data tables based on SAP PA infotypes

CREATE OR REPLACE FUNCTION update_updated_at_char_column()
RETURNS TRIGGER AS $$
BEGIN
 NEW.updated_at_char = to_char(now(),'YYYY-MM-DD HH24:MI:SS.MS');
 RETURN NEW;
END;
$$ language 'plpgsql';

-- PA0000 - Personnel Actions table
CREATE TABLE pa0000 (
    id SERIAL PRIMARY KEY,
    mandt CHARACTER VARYING(3) DEFAULT '100',
    pernr CHARACTER VARYING(8) NOT NULL,
    subty CHARACTER VARYING(4) DEFAULT '0000',
    objps CHARACTER VARYING(2) DEFAULT '00',
    sprps CHARACTER VARYING(1) DEFAULT 'A',
    endda DATE NOT NULL,
    begda DATE NOT NULL,
    seqnr CHARACTER VARYING(3) DEFAULT '000',
    actio CHARACTER VARYING(2),
    massn CHARACTER VARYING(2),
    massg CHARACTER VARYING(2),
    stat2 CHARACTER VARYING(1),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at_char CHARACTER VARYING(25)
);

GRANT ALL ON TABLE pa0000 TO sap_user;

-- Create trigger for updated_at_char
CREATE OR REPLACE TRIGGER update_pa0000_updated_at_char_trigger
BEFORE UPDATE ON pa0000
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_char_column();

-- Update the updated_at_char column for new records
UPDATE pa0000 SET updated_at_char = to_char(now(),'YYYY-MM-DD HH24:MI:SS.MS') WHERE updated_at_char IS NULL;

-- Insert sample data
INSERT INTO pa0000 (pernr, endda, begda, actio, massn, massg) VALUES
('10000001', '9999-12-31', '2020-01-01', '01', '01', '01'),
('10000002', '9999-12-31', '2020-02-15', '01', '01', '01'),
('10000003', '9999-12-31', '2020-03-10', '01', '01', '01'),
('10000004', '9999-12-31', '2020-04-20', '01', '01', '01');