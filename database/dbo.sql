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
-------------------------------------------------------------------------------------------------


--Create Tables ---------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS dbo.user
(
    id SERIAL NOT NULL,
    username character varying(255) COLLATE pg_catalog."default",
    name character varying(255) COLLATE pg_catalog."default",
    email character varying(255) COLLATE pg_catalog."default",
    password_hash character varying(255) COLLATE pg_catalog."default" NOT NULL,
    phone_number character varying(20) COLLATE pg_catalog."default",
    photo character varying(255) COLLATE pg_catalog."default",
    created_at timestamp without time zone DEFAULT 'CURRENT_TIMESTAMP',
    socket_id character varying(255),
    type dbo.user_type NOT NULL,
    status boolean NOT NULL DEFAULT 'true',
    is_deleted boolean NOT NULL DEFAULT 'false',
    CONSTRAINT user_pkey PRIMARY KEY (id)
);


CREATE TABLE IF NOT EXISTS dbo.email_otp
(
    id SERIAL NOT NULL,
    create_date timestamp without time zone DEFAULT 'CURRENT_TIMESTAMP',
    hashed_otp character varying(255) COLLATE pg_catalog."default" NOT NULL,
    email character varying(255) COLLATE pg_catalog."default" NOT NULL,
    tried integer DEFAULT 0,
    type dbo.type_email_otp NOT NULL,
    matched boolean DEFAULT 'false',
    CONSTRAINT email_otp_pkey PRIMARY KEY (id)
);




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
    created_time TIMESTAMP DEFAULT 'CURRENT_TIMESTAMP',
    expire_time TIMESTAMP,
    status character varying(42) DEFAULT 'Live',
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


--------------------------------------------------------------------------------------------------