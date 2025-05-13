--Create Schema----------------------------------------------------------------------------------
CREATE SCHEMA IF NOT EXISTS jobSeeker;
-------------------------------------------------------------------------------------------------


--Create Types-----------------------------------------------------------------------------------

-------------------------------------------------------------------------------------------------

--Create Tables ---------------------------------------------------------------------------------


CREATE TABLE IF NOT EXISTS jobSeeker.job_seeker
(
    user_id integer NOT NULL,
    date_of_birth date,
    gender dbo.gender_type,
    nationality character varying,
    address character varying,
    work_permit boolean,
    account_status character varying(42) DEFAULT 'Pending',
    criminal_convictions boolean
);

CREATE TABLE IF NOT EXISTS jobSeeker.job_preferences{
    job_seeker_id integer NOT NULL,
    job_id integer NOT NULL
};

CREATE TABLE IF NOT EXISTS jobSeeker.job_locations{
    job_seeker_id integer NOT NULL,
    location_id integer NOT NULL
};


CREATE TABLE IF NOT EXISTS jobSeeker.job_shifting{
    job_seeker_id integer NOT NULL,
    shift dbo.shift_type
};


CREATE TABLE IF NOT EXISTS dbo.job_seeker_info{
    job_seeker_id integer NOT NULL,
    hospitality_exp boolean,
    languages character varying(255),
    hospitality_certifications character varying(255),
    medical_condition character varying(255),
    dietary_restrictions character varying(255),
    work_start character varying(42),
    certifications character varying(255),
    reference text,
    resume character varying(255),
    training_program_interested boolean,
    start_working character varying(42),
    hours_available character varying(42),
    comment text
};

-------------------------------------------------------------------------------------------------

