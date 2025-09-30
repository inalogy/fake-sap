-- SAP OM (Organizational Management) Schema (improved)

CREATE TABLE IF NOT EXISTS sap_om (
          objid           VARCHAR(10) PRIMARY KEY,     -- Organization unit ID
          otype           VARCHAR(2),                  -- Object type (e.g. 'O')
          short           VARCHAR(40),                 -- Short name
          stext           VARCHAR(200),                -- Display name
          parent_objid    VARCHAR(10),                 -- Parent org unit ID
          begda           DATE,                        -- Valid from
          endda           DATE,                        -- Valid to
          responsible_objid VARCHAR(8),                -- Manager personal number
          costcenter      VARCHAR(20),                 -- Cost center
          location_name   VARCHAR(100),                -- Location
          org_level       VARCHAR(40),                 -- Organizational level
          CONSTRAINT sap_om_date_valid CHECK (begda IS NULL OR endda IS NULL OR begda <= endda)
        );

        -- Optional FK to self (parent-child). Comment out if you load parents after children.
-- ALTER TABLE sap_om
--   ADD CONSTRAINT sap_om_parent_fk
--   FOREIGN KEY (parent_objid) REFERENCES sap_om(objid);

GRANT ALL ON TABLE sap_om TO sap_user;

-- If you truly want a separate index for parent lookups:
CREATE INDEX IF NOT EXISTS sap_om_parent_idx ON sap_om (parent_objid);

-- Sample data (typed dates, conflict-safe)
INSERT INTO public.sap_om
  (objid, otype, short, stext, parent_objid, begda, endda, responsible_objid, costcenter, location_name, org_level)
VALUES
  ('1001','O','HOCHSCHU','IAM Factory Hochschule',NULL,'2020-01-01','9999-12-31','00818','CC1001','Campus West','Hochschule'),
  ('1002','O','ZENTRALE','Zentrale Verwaltung','1001','2020-01-01','9999-12-31','00818','CC1002','Campus West','Verwaltung'),
  ('1003','O','PERSONAL','Personalabteilung','1002','2020-01-01','9999-12-31','00818','CC1003','Campus Mitte','Abteilung'),
  ('1004','O','PERSONAL','Personalabteilung Team 1','1003','2020-01-01','9999-12-31','00818','CC1004','Campus Ost','Team'),
  ('1005','O','FINANCE','Finanzabteilung','1002','2020-01-01','9999-12-31','00819','CC1005','Campus Mitte','Abteilung'),
  ('1006','O','IT','IT-Abteilung','1002','2020-01-01','9999-12-31','00820','CC1006','Campus West','Abteilung'),
  ('1007','O','MARKETING','Marketing & Communications','1002','2020-01-01','9999-12-31','00821','CC1007','Campus Süd','Abteilung'),
  ('1008','O','RESEARCH','Forschung & Entwicklung','1001','2020-01-01','9999-12-31','00822','CC1008','Campus Nord','Fakultät'),
  ('1009','O','TEACHING','Lehre & Bildung','1001','2020-01-01','9999-12-31','00823','CC1009','Campus Ost','Fakultät'),
  ('1010','O','INSTITUT1','Institut für Informatik','1008','2020-01-01','9999-12-31','00824','CC1010','Campus Nord','Institut'),
  ('1011','O','INSTITUT2','Institut für Mathematik','1008','2020-01-01','9999-12-31','00825','CC1011','Campus Süd','Institut'),
  ('1012','O','LEHRSTUHL1','Lehrstuhl Softwaretechnik','1010','2020-01-01','9999-12-31','00826','CC1012','Campus Nord','Lehrstuhl'),
  ('1013','O','LEHRSTUHL2','Lehrstuhl Datenbanken','1010','2020-01-01','9999-12-31','00827','CC1013','Campus Nord','Lehrstuhl'),
  ('1014','O','STUDENTEN','Studentische Hilfskräfte','1012','2020-01-01','9999-12-31','00828','CC1014','Campus Nord','Team'),
  ('1015','O','SEKRETARIAT','Sekretariat','1003','2020-01-01','9999-12-31','00829','CC1015','Campus Mitte','Team')
ON CONFLICT (objid) DO NOTHING;