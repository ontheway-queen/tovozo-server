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
CREATE TABLE IF NOT EXISTS jobSeeker.job_application (
    id SERIAL PRIMARY KEY,
    job_post_id INT NOT NULL REFERENCES dbo.job_post(id),
    job_seeker_id INT NOT NULL REFERENCES jobSeeker.job_seeker(user_id),
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    cancelled_at TIMESTAMP,
    start_time TIMESTAMP NOT NULL, 
    end_time TIMESTAMP,            
    status dbo.job_status NOT NULL DEFAULT 'PENDING',
    hotelier_approved BOOLEAN DEFAULT false,
    payment_status dbo.payment_status DEFAULT 'PENDING',     
);

    
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

-------------------------------------------------------------------------------------------------

