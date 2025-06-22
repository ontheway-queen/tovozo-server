--Create Schema----------------------------------------------------------------------------------
CREATE SCHEMA IF NOT EXISTS jobSeeker;
-------------------------------------------------------------------------------------------------


--Create Types-----------------------------------------------------------------------------------

-------------------------------------------------------------------------------------------------

--Create Tables ---------------------------------------------------------------------------------

-- Job Seeker basic info
CREATE TABLE IF NOT EXISTS jobSeeker.job_seeker (
    user_id INTEGER PRIMARY KEY,
    date_of_birth DATE,
    gender dbo.gender_type,
    nationality VARCHAR(255),
    address TEXT,
    location_id INT,
    work_permit BOOLEAN,
    account_status VARCHAR(42) DEFAULT 'Pending',
    criminal_convictions BOOLEAN,
    FOREIGN KEY (user_id) REFERENCES dbo."user" (id) ON DELETE CASCADE
);

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

CREATE TYPE dbo.payment_status AS ENUM ('PENDING', 'PAID', 'FAILED', "PARTIAL_PAID");
CREATE TYPE dbo.job_status AS ENUM ('PENDING', 'ASSIGNED', 'CANCELLED', 'COMPLETED');
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
    u.username,
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
    js.address,
    js.work_permit,
    js.account_status,
    js.criminal_convictions,
    js.is_2fa_on
FROM dbo."user" u
JOIN jobSeeker.job_seeker js ON u.id = js.user_id
WHERE u.type = 'JOB_SEEKER' AND u.is_deleted = false;


 SELECT u.id AS user_id,
    u.username,
    u.email,
    u.name,
    u.phone_number,
    u.photo,
    u.status AS user_status,
    u.type AS user_type,
    u.created_at AS user_created_at,
    u.socket_id,
    js.date_of_birth,
    js.gender,
    js.nationality,
    js.work_permit,
    js.account_status,
    js.criminal_convictions,
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
    jsi.hospitality_exp,
    jsi.languages,
    jsi.hospitality_certifications,
    jsi.medical_condition,
    jsi.dietary_restrictions,
    jsi.work_start,
    jsi.certifications,
    jsi.reference,
    jsi.resume,
    jsi.training_program_interested,
    jsi.start_working,
    jsi.hours_available,
    jsi.comment,
    jsi.passport_copy,
    jsi.visa_copy,
    jsi.id_copy,
    ( SELECT COALESCE(json_agg(json_build_object('id', j.id, 'title', j.title, 'details', j.details)), '[]'::json) AS "coalesce"
           FROM jobseeker.job_preferences jp
             JOIN dbo.jobs j ON jp.job_id = j.id
          WHERE jp.job_seeker_id = js.user_id) AS job_preferences,
    ( SELECT COALESCE(json_agg(json_build_object('location_id', jl.location_id, 'city_id', l.city_id, 'name', l.name, 'address', l.address, 'longitude', l.longitude, 'latitude', l.latitude, 'type', l.type, 'postal_code', l.postal_code, 'status', l.status, 'is_home_address', l.is_home_address, 'created_at', l.created_at, 'updated_at', l.updated_at)), '[]'::json) AS "coalesce"
           FROM jobseeker.job_locations jl
             JOIN dbo.location l ON jl.location_id = l.id
          WHERE jl.job_seeker_id = js.user_id) AS job_locations,
    ( SELECT COALESCE(json_agg(jsf.shift), '[]'::json) AS "coalesce"
           FROM jobseeker.job_shifting jsf
          WHERE jsf.job_seeker_id = js.user_id) AS job_shifts
   FROM dbo."user" u
     JOIN jobseeker.job_seeker js ON u.id = js.user_id
     LEFT JOIN dbo.location loc ON js.location_id = loc.id AND loc.is_home_address = true
     LEFT JOIN jobseeker.job_seeker_info jsi ON js.user_id = jsi.job_seeker_id
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
CREATE TABLE IF NOT EXISTS dbo.job_applications (
    id SERIAL PRIMARY KEY,
    job_post_details_id INTEGER NOT NULL REFERENCES dbo.job_post_details(id),
    job_seeker_id INTEGER NOT NULL REFERENCES jobseeker.job_seeker(user_id),
    status dbo.job_status DEFAULT 'PENDING',
    payment_status dbo.job_status DEFAULT 'PENDING',
    cancelled_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE
);


CREATE TYPE dbo.job_task_activities_status AS ENUM (
  'Requested',
  'Rejected',
  'InProgress',
  'Completed'
);
CREATE TABLE IF NOT EXISTS dbo.job_task_activities (
    id SERIAL PRIMARY KEY,
    job_application_id INTEGER NOT NULL REFERENCES dbo.job_applications(id),
    job_post_details_id INTEGER NOT NULL REFERENCES dbo.job_post_details(id),
    job_seeker_id INTEGER NOT NULL REFERENCES jobseeker.job_seeker(user_id),
    organization_id integer NOT NULL,
    status dbo.job_task_activities_status DEFAULT 'Requested',
    start_time TIMESTAMP,
    end_time TIMESTAMP,
    start_approved_time TIMESTAMP,
    end_approved_time TIMESTAMP,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);