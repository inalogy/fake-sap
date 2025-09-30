-- SAP HCM Employee Data Schema (improved)

CREATE TABLE IF NOT EXISTS public.sap_hcm (
            pernr           varchar(8) PRIMARY KEY,   -- Personnel number
            birthdate       date,                     -- Date of birth
            gender          varchar(1),               -- Gender
            natio           varchar(2),               -- Nationality code
            begda           date,                     -- Valid from
            endda           date,                     -- Valid to
            orgeh           varchar(10),              -- Organizational unit (sap_om.objid)
            plans_id        varchar(20),              -- Job/position ID
            job             varchar(100),             -- Job title
            persg           varchar(40),              -- Employee group
            persk           varchar(40),              -- Employee subgroup
            workschedule    varchar(40),              -- Work schedule
            contract_type   varchar(40),              -- Contract type
            email           varchar(200),
            phone           varchar(40),
            location_name   varchar(100),
            firstname       varchar(100),
            lastname        varchar(100),
            title           varchar(50),
            updated_at_char varchar(25),              -- Last update timestamp (text)
            parent_pernr    varchar(8),               -- Parent contract ID
            CONSTRAINT sap_hcm_date_valid CHECK (begda IS NULL OR endda IS NULL OR begda <= endda)
        );

        GRANT ALL ON TABLE public.sap_hcm TO sap_user;

        -- Optional FK: only enable if sap_om is loaded first and objids match your data
-- ALTER TABLE public.sap_hcm
--   ADD CONSTRAINT sap_hcm_orgeh_fk
--   FOREIGN KEY (orgeh) REFERENCES public.sap_om(objid);

-- Optional FK: self-parent exists
-- ALTER TABLE public.sap_hcm
--   ADD CONSTRAINT sap_hcm_parent_fk
--   FOREIGN KEY (parent_pernr) REFERENCES public.sap_hcm(pernr);

-- Trigger: drop if exists (Postgres has no OR REPLACE for triggers)
DROP TRIGGER IF EXISTS update_sap_hcm_updated_at_char_trigger ON public.sap_hcm;

CREATE TRIGGER update_sap_hcm_updated_at_char_trigger
BEFORE INSERT OR UPDATE ON public.sap_hcm
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_char_column();

-- Sample data (dates in ISO format)
INSERT INTO public.sap_hcm
(pernr, birthdate, gender, natio, begda, endda, orgeh, plans_id, job, persg, persk, workschedule, contract_type,
         email, phone, location_name, firstname, lastname, title, updated_at_char, parent_pernr)
VALUES
('10001','1985-06-15','M','DE','2020-01-01','2099-12-31','1001','PL1001','Geschäftsführer','Führungskräfte','Vollzeit','Vollzeit','unbefristet','max.mueller@hochschule.de','+49 30 12345678','Campus West','Max','Mueller','Prof. Dr.',NULL,'10001'),
('10002','1982-03-22','F','DE','2020-02-01','2099-12-31','1002','PL1002','Verwaltungsleiterin','Führungskräfte','Vollzeit','Vollzeit','unbefristet','anna.schmidt@hochschule.de','+49 30 12345679','Campus West','Anna','Schmidt','Dr.',NULL,'10002'),
('10003','1978-09-10','M','DE','2020-03-01','2099-12-31','1003','PL1003','Personalleiter','Führungskräfte','Vollzeit','Vollzeit','unbefristet','peter.wagner@hochschule.de','+49 30 12345680','Campus Mitte','Peter','Wagner','',NULL,'10003'),
('10004','1990-12-05','F','DE','2020-04-01','2025-12-31','1003','PL1004','HR Specialist','Angestellte','Vollzeit','Vollzeit','befristet','sarah.becker@hochschule.de','+49 30 12345681','Campus Mitte','Sarah','Becker','',NULL,'10004'),
('10005','1988-07-18','M','DE','2020-05-01','2099-12-31','1005','PL1005','Finanzcontroller','Angestellte','Vollzeit','Vollzeit','unbefristet','thomas.hoffmann@hochschule.de','+49 30 12345682','Campus Mitte','Thomas','Hoffmann','',NULL,'10005'),
('10006','1992-11-30','F','DE','2020-06-01','2099-12-31','1006','PL1006','IT-Administratorin','Angestellte','Vollzeit','Vollzeit','unbefristet','julia.fischer@hochschule.de','+49 30 12345683','Campus West','Julia','Fischer','',NULL,'10006'),
('10007','1987-04-14','M','DE','2020-07-01','2099-12-31','1007','PL1007','Marketing Manager','Angestellte','Vollzeit','Vollzeit','unbefristet','michael.weber@hochschule.de','+49 30 12345684','Campus Süd','Michael','Weber','',NULL,'10007'),
('10008','1975-08-25','M','DE','2020-08-01','2099-12-31','1008','PL1008','Forschungsleiter','Professoren','Vollzeit','Vollzeit','unbefristet','frank.schulz@hochschule.de','+49 30 12345685','Campus Nord','Frank','Schulz','Prof. Dr.',NULL,'10008'),
('10009','1980-01-12','F','DE','2020-09-01','2099-12-31','1009','PL1009','Studiendirektorin','Professoren','Vollzeit','Vollzeit','unbefristet','petra.klein@hochschule.de','+49 30 12345686','Campus Ost','Petra','Klein','Prof. Dr.',NULL,'10009'),
('10010','1983-06-08','M','DE','2020-10-01','2099-12-31','1010','PL1010','Institutsleiter Informatik','Professoren','Vollzeit','Vollzeit','unbefristet','martin.wolf@hochschule.de','+49 30 12345687','Campus Nord','Martin','Wolf','Prof. Dr.',NULL,'10010'),
('10011','1981-03-17','F','DE','2020-11-01','2099-12-31','1011','PL1011','Institutsleiterin Mathematik','Professoren','Vollzeit','Vollzeit','unbefristet','claudia.zimmermann@hochschule.de','+49 30 12345688','Campus Süd','Claudia','Zimmermann','Prof. Dr.',NULL,'10011'),
('10012','1985-09-29','M','DE','2020-12-01','2099-12-31','1012','PL1012','Professor Softwaretechnik','Professoren','Vollzeit','Vollzeit','unbefristet','alexander.braun@hochschule.de','+49 30 12345689','Campus Nord','Alexander','Braun','Prof. Dr.',NULL,'10012'),
('10013','1986-05-21','F','DE','2021-01-01','2099-12-31','1013','PL1013','Professorin Datenbanken','Professoren','Vollzeit','Vollzeit','unbefristet','sabine.hartmann@hochschule.de','+49 30 12345690','Campus Nord','Sabine','Hartmann','Prof. Dr.',NULL,'10013'),
('10014','1995-10-13','M','DE','2021-02-01','2024-07-31','1014','PL1014','Studentische Hilfskraft','Hilfskräfte','Teilzeit','Teilzeit','befristet','tim.neumann@student.hochschule.de','+49 30 12345691','Campus Nord','Tim','Neumann','',NULL,'10014'),
('10015','1993-12-07','F','DE','2021-03-01','2099-12-31','1015','PL1015','Sekretärin','Angestellte','Vollzeit','Vollzeit','unbefristet','lisa.krueger@hochschule.de','+49 30 12345692','Campus Mitte','Lisa','Krueger','',NULL,'10015')
ON CONFLICT (pernr) DO NOTHING;

-- Ensure parent_pernr defaults to self when NULL
UPDATE public.sap_hcm SET parent_pernr = pernr WHERE parent_pernr IS NULL;