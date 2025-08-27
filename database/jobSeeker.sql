--Create Schema----------------------------------------------------------------------------------
CREATE SCHEMA IF NOT EXISTS jobSeeker;
-------------------------------------------------------------------------------------------------


--Create Types-----------------------------------------------------------------------------------

-------------------------------------------------------------------------------------------------

--Create Tables ---------------------------------------------------------------------------------

-- Job Seeker basic info
CREATE TYPE jobSeeker.job_seeker_account_status AS ENUM (
	'Active',
	'Inactive',
	'Pending',
	'Blocked',
	'Under Review'
);

CREATE TABLE IF NOT EXISTS jobSeeker.job_seeker (
    user_id INTEGER PRIMARY KEY,
    date_of_birth DATE,
    gender dbo.gender_type,
    nationality VARCHAR(255),
    address TEXT,
    location_id INT,
    work_permit VARCHAR(255),
    passport_copy VARCHAR(255),
    visa_copy VARCHAR(255),
    id_copy VARCHAR(255),
    is_2fa_on BOOLEAN DEFAULT false,
    account_status jobSeeker.job_seeker_account_status DEFAULT 'Pending',
    FOREIGN KEY (user_id) REFERENCES dbo."user" (id)
);

ALTER TABLE jobSeeker.job_seeker ADD is_completed BOOLEAN DEFAULT false;
ALTER TABLE jobSeeker.job_seeker ADD completed_at TIMESTAMP;
ALTER TABLE jobSeeker.job_seeker ADD final_completed BOOLEAN DEFAULT false;
ALTER TABLE jobSeeker.job_seeker ADD final_completed_by INTEGER references dbo."user"(id);
ALTER TABLE jobSeeker.job_seeker ADD final_completed_at TIMESTAMP;

-- Job preferences (many-to-many)
CREATE TABLE IF NOT EXISTS jobSeeker.job_preferences (
    job_seeker_id INTEGER NOT NULL,
    job_id INTEGER NOT NULL,
    PRIMARY KEY (job_seeker_id, job_id),
    FOREIGN KEY (job_seeker_id) REFERENCES jobSeeker.job_seeker(user_id) ON DELETE CASCADE
);

-- Preferred job locations (many-to-many)
CREATE TABLE IF NOT EXISTS jobSeeker.job_locations (
    job_seeker_id INTEGER NOT NULL,
    location_id INTEGER NOT NULL,
    PRIMARY KEY (job_seeker_id, location_id),
    FOREIGN KEY (job_seeker_id) REFERENCES jobSeeker.job_seeker(user_id) ON DELETE CASCADE
);

-- Job shift preferences
CREATE TABLE IF NOT EXISTS jobSeeker.job_shifting (
    job_seeker_id INTEGER NOT NULL,
    shift dbo.shift_type NOT NULL,
    PRIMARY KEY (job_seeker_id, shift),
    FOREIGN KEY (job_seeker_id) REFERENCES jobSeeker.job_seeker(user_id) ON DELETE CASCADE
);

-- Additional job seeker information
CREATE TABLE IF NOT EXISTS jobSeeker.job_seeker_info (
    job_seeker_id INTEGER PRIMARY KEY,
    hospitality_exp BOOLEAN,
    languages TEXT,
    hospitality_certifications TEXT,
    medical_condition TEXT,
    dietary_restrictions TEXT,
    work_start VARCHAR(42),
    certifications TEXT,
    reference TEXT,
    resume VARCHAR(255),
    training_program_interested BOOLEAN,
    start_working VARCHAR(42),
    hours_available VARCHAR(42),
    comment TEXT,
     passport_copy VARCHAR(255),
 visa_copy VARCHAR(255);
    FOREIGN KEY (job_seeker_id) REFERENCES jobSeeker.job_seeker(user_id) ON DELETE CASCADE
);




-- CREATE TABLE IF NOT EXISTS jobSeeker.job_application (
--     id SERIAL PRIMARY KEY,
--     job_post_id INT NOT NULL REFERENCES dbo.job_post(id),
--     job_seeker_id INT NOT NULL REFERENCES jobSeeker.job_seeker(user_id),
--     applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     cancelled_at TIMESTAMP,
--     start_time TIMESTAMP NOT NULL,
--     end_time TIMESTAMP,
--     status dbo.job_status NOT NULL DEFAULT 'PENDING',
--     hotelier_approved BOOLEAN DEFAULT false,
--     payment_status dbo.payment_status DEFAULT 'PENDING',
-- );


-- Job Seeker Auth View
CREATE OR REPLACE VIEW jobSeeker.job_seeker_auth_view AS
SELECT
    u.id AS user_id,
    u.name,
    u.email,
    u.password_hash,
    u.phone_number,
    u.photo,
    u.status,
    u.is_deleted,
    u.created_at,
    js.date_of_birth,
    js.gender,
    js.nationality,
    js.work_permit,
    js.account_status,
    js.is_2fa_on
FROM dbo."user" u
JOIN jobSeeker.job_seeker js ON u.id = js.user_id
WHERE u.type = 'JOB_SEEKER' AND u.is_deleted = false;


-- JOb seeker profile
CREATE OR REPLACE VIEW jobseeker.vw_full_job_seeker_profile
 AS
 SELECT u.id AS user_id,
    u.email,
    u.name,
    u.phone_number,
    u.photo,
    u.status AS user_status,
    u.type AS user_type,
    u.created_at AS user_created_at,
    js.date_of_birth,
    js.gender,
    js.nationality,
    js.work_permit,
    js.account_status,
    js.is_completed,
    js.completed_at,
    js.final_completed,
    js.final_completed_at,
    js.final_completed_by,
    js.id_copy,
    loc.id AS home_location_id,
    loc.city_id AS home_city_id,
    loc.name AS home_location_name,
    loc.address AS home_address,
    loc.longitude AS home_longitude,
    loc.latitude AS home_latitude,
    loc.type AS home_location_type,
    loc.postal_code AS home_postal_code,
    loc.status AS home_status,
    loc.is_home_address,
    loc.created_at AS home_created_at,
    loc.updated_at AS home_updated_at,
    bd.id AS bank_id,
    bd.account_name,
    bd.account_number,
    bd.is_primary AS bank_is_primary,
    bd.created_at AS bank_created_at,
    bd.updated_at AS bank_updated_at
   FROM dbo."user" u
     JOIN jobseeker.job_seeker js ON u.id = js.user_id
     LEFT JOIN dbo.location loc ON js.location_id = loc.id AND loc.is_home_address = true
     LEFT JOIN jobSeeker.job_seeker_bank_details bd 
    ON js.user_id = bd.job_seeker_id AND bd.is_primary = true
  WHERE u.is_deleted = false;

-------------------------------------------------------------------------------------------------

ALTER TABLE jobseeker.job_seeker_info ADD COLUMN id_copy VARCHAR(255);


CREATE TABLE IF EXISTS NOT dbo.nationality(
    id serial PRIMARY key,
    name VARCHAR(255) not null UNIQUE,
    status BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


INSERT INTO dbo.nationality (name)
VALUES
('Afghan'),
('Albanian'),
('Algerian'),
('Andorran'),
('Angolan'),
('Antiguans'),
('Argentinean'),
('Armenian'),
('Australian'),
('Austrian'),
('Azerbaijani'),
('Bahamian'),
('Bahraini'),
('Bangladeshi'),
('Barbadian'),
('Barbudans'),
('Batswana'),
('Belarusian'),
('Belgian'),
('Belizean'),
('Beninese'),
('Bhutanese'),
('Bolivian'),
('Bosnian'),
('Brazilian'),
('British'),
('Bruneian'),
('Bulgarian'),
('Burkinabe'),
('Burmese'),
('Burundian'),
('Cambodian'),
('Cameroonian'),
('Canadian'),
('Cape Verdean'),
('Central African'),
('Chadian'),
('Chilean'),
('Chinese'),
('Colombian'),
('Comoran'),
('Congolese'),
('Costa Rican'),
('Croatian'),
('Cuban'),
('Cypriot'),
('Czech'),
('Danish'),
('Djibouti'),
('Dominican'),
('Dutch'),
('East Timorese'),
('Ecuadorean'),
('Egyptian'),
('Emirati'),
('Equatorial Guinean'),
('Eritrean'),
('Estonian'),
('Ethiopian'),
('Fijian'),
('Filipino'),
('Finnish'),
('French'),
('Gabonese'),
('Gambian'),
('Georgian'),
('German'),
('Ghanaian'),
('Greek'),
('Grenadian'),
('Guatemalan'),
('Guinea-Bissauan'),
('Guinean'),
('Guyanese'),
('Haitian'),
('Herzegovinian'),
('Honduran'),
('Hungarian'),
('I-Kiribati'),
('Icelander'),
('Indian'),
('Indonesian'),
('Iranian'),
('Iraqi'),
('Irish'),
('Israeli'),
('Italian'),
('Ivorian'),
('Jamaican'),
('Japanese'),
('Jordanian'),
('Kazakhstani'),
('Kenyan'),
('Kittian and Nevisian'),
('Kuwaiti'),
('Kyrgyz'),
('Laotian'),
('Latvian'),
('Lebanese'),
('Liberian'),
('Libyan'),
('Liechtensteiner'),
('Lithuanian'),
('Luxembourger'),
('Macedonian'),
('Malagasy'),
('Malawian'),
('Malaysian'),
('Maldivan'),
('Malian'),
('Maltese'),
('Marshallese'),
('Mauritanian'),
('Mauritian'),
('Mexican'),
('Micronesian'),
('Moldovan'),
('Monacan'),
('Mongolian'),
('Moroccan'),
('Mosotho'),
('Motswana'),
('Mozambican'),
('Namibian'),
('Nauruan'),
('Nepalese'),
('New Zealander'),
('Nicaraguan'),
('Nigerian'),
('Nigerien'),
('North Korean'),
('Northern Irish'),
('Norwegian'),
('Omani'),
('Pakistani'),
('Palauan'),
('Panamanian'),
('Papua New Guinean'),
('Paraguayan'),
('Peruvian'),
('Polish'),
('Portuguese'),
('Qatari'),
('Romanian'),
('Russian'),
('Rwandan'),
('Saint Lucian'),
('Salvadoran'),
('Samoan'),
('San Marinese'),
('Sao Tomean'),
('Saudi'),
('Scottish'),
('Senegalese'),
('Serbian'),
('Seychellois'),
('Sierra Leonean'),
('Singaporean'),
('Slovakian'),
('Slovenian'),
('Solomon Islander'),
('Somali'),
('South African'),
('South Korean'),
('Spanish'),
('Sri Lankan'),
('Sudanese'),
('Surinamer'),
('Swazi'),
('Swedish'),
('Swiss'),
('Syrian'),
('Taiwanese'),
('Tajik'),
('Tanzanian'),
('Thai'),
('Togolese'),
('Tongan'),
('Trinidadian or Tobagonian'),
('Tunisian'),
('Turkish'),
('Tuvaluan'),
('Ugandan'),
('Ukrainian'),
('Uruguayan'),
('Uzbekistani'),
('Venezuelan'),
('Vietnamese'),
('Welsh'),
('Yemenite'),
('Zambian'),
('Zimbabwean');


DROP TABLE IF EXISTS jobseeker.job_application;
