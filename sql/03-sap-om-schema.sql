-- SAP OM (Organizational Management) Schema
-- Organization structure tables

CREATE TABLE sap_om (
	objid varchar NOT NULL, -- Organization unit ID
	otype varchar NULL, -- Object type
	short varchar NULL, -- Short name
	stext varchar NULL, -- Display Name
	parent_objid varchar NULL, -- Parent organization unit ID
	begda varchar NULL, -- Valid from
	endda varchar NULL, -- Valid to
	responsible_objid varchar NULL, -- Manager personal number
	costcenter varchar NULL, -- Costcenter
	"location" varchar NULL, -- Location
	org_level varchar NULL, -- Organizational level
	CONSTRAINT sap_om_pk PRIMARY KEY (objid)
);

CREATE UNIQUE INDEX sap_om_objid_idx ON sap_om USING btree (objid);

GRANT ALL ON TABLE sap_om TO sap_user;

-- Insert sample organizational data
INSERT INTO public.sap_om (objid,otype,short,stext,parent_objid,begda,endda,responsible_objid,costcenter,"location",org_level) VALUES
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
	 ('1015','O','SEKRETARIAT','Sekretariat','1003','2020-01-01','9999-12-31','00829','CC1015','Campus Mitte','Team');