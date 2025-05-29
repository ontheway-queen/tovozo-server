--Create Schema----------------------------------------------------------------------------------
CREATE SCHEMA IF NOT EXISTS dbo;
-------------------------------------------------------------------------------------------------


--Create Types-----------------------------------------------------------------------------------
CREATE TYPE dbo.user_type AS ENUM
    ('ADMIN', 'HOTELIER','JOB_SEEKER');

CREATE TYPE dbo.gender_type AS ENUM
    ('Male', 'Female','Other');

CREATE TYPE dbo.shift_type AS ENUM
    ('Morning', 'Afternoon','Night','Flexible');



DROP TYPE IF EXISTS dbo.type_email_otp;

CREATE TYPE dbo.type_email_otp AS ENUM (
  'reset_admin',
  'reset_job_seeker',
  'verify_job_seeker',
  'verify_hotelier',
  'verify_admin',
  'reset_hotelier',
  '2fa_job_seeker',
  '2fa_admin',
  '2fa_hotelier'
);
-------------------------------------------------------------------------------------------------


--Create Tables ---------------------------------------------------------------------------------
-- Main user table (generic for all user types)

CREATE TABLE IF NOT EXISTS dbo."user"
(
    id integer NOT NULL DEFAULT nextval('dbo.user_id_seq'::regclass),
    username character varying(255) COLLATE pg_catalog."default",
    name character varying(255) COLLATE pg_catalog."default",
    email character varying(255) COLLATE pg_catalog."default",
    password_hash character varying(255) COLLATE pg_catalog."default" NOT NULL,
    phone_number character varying(20) COLLATE pg_catalog."default",
    photo character varying(255) COLLATE pg_catalog."default",
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    socket_id character varying(255) COLLATE pg_catalog."default",
    type dbo.user_type NOT NULL,
    status boolean NOT NULL DEFAULT true,
    is_deleted boolean NOT NULL DEFAULT false,
    CONSTRAINT user_pkey PRIMARY KEY (id)
)

DROP TABLE IF EXISTS dbo.email_otp;

CREATE TABLE IF NOT EXISTS dbo.email_otp (
  id SERIAL NOT NULL,
  create_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  hashed_otp character varying(255) COLLATE pg_catalog."default" NOT NULL,
  email character varying(255) COLLATE pg_catalog."default" NOT NULL,
  tried integer DEFAULT 0,
  type dbo.type_email_otp NOT NULL,
  matched boolean DEFAULT false,
  CONSTRAINT email_otp_pkey PRIMARY KEY (id)
);

CREATE TYPE dbo.notification_type AS ENUM (
    'JOB_MATCH',         
    'REMINDER',         
    'APPLICATION_UPDATE',
    'PAYMENT',          
    'CANCELLATION',      
    'VERIFICATION',      
    'SECURITY_ALERT',    
    'SYSTEM_UPDATE'   
);
-- Notification system
CREATE TABLE IF NOT EXISTS dbo.notification (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES dbo."user"(id),
    content TEXT NOT NULL,
    type dbo.notification_type NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    related_id INT 
);


CREATE TABLE IF NOT EXISTS b2b.notification_seen
(
    notification_id integer NOT NULL,
    user_id integer NOT NULL,
    CONSTRAINT notification_seen_pkey PRIMARY KEY (notification_id, user_id)
)



--Jobs
CREATE TABLE IF NOT EXISTS dbo.jobs
(
    id SERIAL NOT NULL,
    title character varying(255) NOT NULL,
    details text NOT NULL,
    status boolean NOT NULL DEFAULT 'true',
    is_deleted boolean NOT NULL DEFAULT 'false',
    CONSTRAINT jobs_pkey PRIMARY KEY (id)
);


-- Organization

-- Job post
CREATE TABLE IF NOT EXISTS dbo.job_post
(
    id SERIAL NOT NULL,
    organization_id integer NOT NULL,
    title character varying(255) NOT NULL,
    details text,
    created_time timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    expire_time TIMESTAMP,
    status character varying(42) DEFAULT 'Live',
    hourly_rate DECIMAL(8,2) NOT NULL 
    CONSTRAINT job_post_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS dbo.job_post_details
(
    id SERIAL NOT NULL,
    job_post_id integer NOT NULL,
    job_id integer NOT NULL,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    status character varying(42) DEFAULT 'Pending',
    CONSTRAINT job_post_details_pkey PRIMARY KEY (id)
);




-- job seeker view
CREATE OR REPLACE VIEW jobSeeker.job_seeker_auth_view AS
SELECT
    u.id AS user_id,
    u.username,
    u.name,
    u.email,
    u.password_hash,
    u.phone_number,
    u.photo,
    u.type,
    u.status AS user_active,
    u.is_deleted,
    js.date_of_birth,
    js.gender,
    js.nationality,
    js.account_status,
    js.work_permit,
    js.criminal_convictions
FROM
    dbo."user" u
JOIN
    jobSeeker.job_seeker js ON js.user_id = u.id
WHERE
    u.is_deleted = FALSE;




--------------------------------------------------------------------------------------------------