-- SAP HCM Employee Data Schema
-- Main employee information table

CREATE TABLE public.sap_hcm (
	pernr varchar NOT NULL, -- Personal number
	birthdate varchar NULL, -- Date of birth
	gender varchar NULL, -- Gender
	natio varchar NULL, -- Nationality
	begda varchar NULL, -- Valid from
	endda varchar NULL, -- Valid to
	orgeh varchar NULL, -- Organizational unit
	"plans" varchar NULL, -- Job title ID
	job varchar NULL, -- Job title
	persg varchar NULL, -- Employee group
	persk varchar NULL, -- Employee subgroup
	workschedule varchar NULL, -- Work schedule
	contract_type varchar NULL, -- Contract type
	email varchar NULL, -- E-mail
	phone varchar NULL, -- Phone number
	"location" varchar NULL, -- Location
	firstname varchar NULL, -- First name
	lastname varchar NULL, -- Last name
	title varchar NULL, -- Title
	updated_at_char varchar NULL, -- Last update timestamp
	parent_pernr varchar NULL, -- Parent contract ID
	CONSTRAINT sap_hcm_pk PRIMARY KEY (pernr)
);

GRANT ALL ON TABLE sap_hcm TO sap_user;

-- Create trigger for updated_at_char
CREATE OR REPLACE TRIGGER update_sap_hcm_updated_at_char_trigger
BEFORE UPDATE ON sap_hcm
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_char_column();

-- Insert sample employee data
INSERT INTO public.sap_hcm (pernr,birthdate,gender,natio,begda,endda,orgeh,"plans",job,persg,persk,workschedule,contract_type,email,phone,"location",firstname,lastname,title,updated_at_char,parent_pernr) VALUES
	 ('10001','15.06.1985','M','DE','01.01.2020','31.12.2099','1001','PL1001','Geschäftsführer','Führungskräfte','Vollzeit','Vollzeit','unbefristet','max.mueller@hochschule.de','+49 30 12345678','Campus West','Max','Mueller','Prof. Dr.',NULL,'10001'),
	 ('10002','22.03.1982','F','DE','01.02.2020','31.12.2099','1002','PL1002','Verwaltungsleiterin','Führungskräfte','Vollzeit','Vollzeit','unbefristet','anna.schmidt@hochschule.de','+49 30 12345679','Campus West','Anna','Schmidt','Dr.',NULL,'10002'),
	 ('10003','10.09.1978','M','DE','01.03.2020','31.12.2099','1003','PL1003','Personalleiter','Führungskräfte','Vollzeit','Vollzeit','unbefristet','peter.wagner@hochschule.de','+49 30 12345680','Campus Mitte','Peter','Wagner','',NULL,'10003'),
	 ('10004','05.12.1990','F','DE','01.04.2020','31.12.2025','1003','PL1004','HR Specialist','Angestellte','Vollzeit','Vollzeit','befristet','sarah.becker@hochschule.de','+49 30 12345681','Campus Mitte','Sarah','Becker','',NULL,'10004'),
	 ('10005','18.07.1988','M','DE','01.05.2020','31.12.2099','1005','PL1005','Finanzcontroller','Angestellte','Vollzeit','Vollzeit','unbefristet','thomas.hoffmann@hochschule.de','+49 30 12345682','Campus Mitte','Thomas','Hoffmann','',NULL,'10005'),
	 ('10006','30.11.1992','F','DE','01.06.2020','31.12.2099','1006','PL1006','IT-Administratorin','Angestellte','Vollzeit','Vollzeit','unbefristet','julia.fischer@hochschule.de','+49 30 12345683','Campus West','Julia','Fischer','',NULL,'10006'),
	 ('10007','14.04.1987','M','DE','01.07.2020','31.12.2099','1007','PL1007','Marketing Manager','Angestellte','Vollzeit','Vollzeit','unbefristet','michael.weber@hochschule.de','+49 30 12345684','Campus Süd','Michael','Weber','',NULL,'10007'),
	 ('10008','25.08.1975','M','DE','01.08.2020','31.12.2099','1008','PL1008','Forschungsleiter','Professoren','Vollzeit','Vollzeit','unbefristet','frank.schulz@hochschule.de','+49 30 12345685','Campus Nord','Frank','Schulz','Prof. Dr.',NULL,'10008'),
	 ('10009','12.01.1980','F','DE','01.09.2020','31.12.2099','1009','PL1009','Studiendirektorin','Professoren','Vollzeit','Vollzeit','unbefristet','petra.klein@hochschule.de','+49 30 12345686','Campus Ost','Petra','Klein','Prof. Dr.',NULL,'10009'),
	 ('10010','08.06.1983','M','DE','01.10.2020','31.12.2099','1010','PL1010','Institutsleiter Informatik','Professoren','Vollzeit','Vollzeit','unbefristet','martin.wolf@hochschule.de','+49 30 12345687','Campus Nord','Martin','Wolf','Prof. Dr.',NULL,'10010'),
	 ('10011','17.03.1981','F','DE','01.11.2020','31.12.2099','1011','PL1011','Institutsleiterin Mathematik','Professoren','Vollzeit','Vollzeit','unbefristet','claudia.zimmermann@hochschule.de','+49 30 12345688','Campus Süd','Claudia','Zimmermann','Prof. Dr.',NULL,'10011'),
	 ('10012','29.09.1985','M','DE','01.12.2020','31.12.2099','1012','PL1012','Professor Softwaretechnik','Professoren','Vollzeit','Vollzeit','unbefristet','alexander.braun@hochschule.de','+49 30 12345689','Campus Nord','Alexander','Braun','Prof. Dr.',NULL,'10012'),
	 ('10013','21.05.1986','F','DE','01.01.2021','31.12.2099','1013','PL1013','Professorin Datenbanken','Professoren','Vollzeit','Vollzeit','unbefristet','sabine.hartmann@hochschule.de','+49 30 12345690','Campus Nord','Sabine','Hartmann','Prof. Dr.',NULL,'10013'),
	 ('10014','13.10.1995','M','DE','01.02.2021','31.07.2024','1014','PL1014','Studentische Hilfskraft','Hilfskräfte','Teilzeit','Teilzeit','befristet','tim.neumann@student.hochschule.de','+49 30 12345691','Campus Nord','Tim','Neumann','',NULL,'10014'),
	 ('10015','07.12.1993','F','DE','01.03.2021','31.12.2099','1015','PL1015','Sekretärin','Angestellte','Vollzeit','Vollzeit','unbefristet','lisa.krueger@hochschule.de','+49 30 12345692','Campus Mitte','Lisa','Krueger','',NULL,'10015');

-- Update parent_pernr where null
UPDATE public.sap_hcm
SET parent_pernr = pernr
WHERE parent_pernr IS NULL;