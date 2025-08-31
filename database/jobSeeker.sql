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
    address TEXT,
    location_id INT,
    work_permit VARCHAR(255),
    id_copy VARCHAR(255),
    is_2fa_on BOOLEAN DEFAULT false,
    account_status jobSeeker.job_seeker_account_status DEFAULT 'Pending',
    is_completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMP,
    final_completed BOOLEAN DEFAULT false,
    final_completed_by INTEGER references dbo."user"(id),
    final_completed_at TIMESTAMP
    FOREIGN KEY (user_id) REFERENCES dbo."user" (id)
);

CREATE TABLE IF NOT EXISTS jobSeeker.bank_details (
    id SERIAL PRIMARY KEY,
    job_seeker_id INTEGER NOT NULL references dbo."user"(id),
    bank_name VARCHAR(255),
    account_name VARCHAR(255) NOT NULL,
    account_number VARCHAR(50) NOT NULL,
    bank_code VARCHAR(50) NOT NULL,
    is_verified BOOLEAN DEFAULT false,
    swift_code VARCHAR(50),
    is_primary boolean,
    is_deleted BOOLEAN DEFAULT false,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);


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
    bd.is_verified,
    bd.is_primary AS bank_is_primary,
    bd.created_at AS bank_created_at,
    bd.updated_at AS bank_updated_at
   FROM dbo."user" u
     JOIN jobseeker.job_seeker js ON u.id = js.user_id
     LEFT JOIN dbo.location loc ON js.location_id = loc.id AND loc.is_home_address = true
     LEFT JOIN jobSeeker.bank_details bd 
    ON js.user_id = bd.job_seeker_id AND bd.is_primary = true
  WHERE u.is_deleted = false;

-------------------------------------------------------------------------------------------------