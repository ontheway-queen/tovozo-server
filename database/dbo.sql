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

CREATE TYPE dbo.payout_status_type AS ENUM (
	'Pending',
	'Approved',
	'Rejected'
);

CREATE TYPE dbo.payment_entry_type AS ENUM (
	'Invoice',
	'Withdraw'
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

-- CREATE TYPE dbo.notification_type AS ENUM (
--     'JOB_MATCH',
--     'REMINDER',
--     'APPLICATION_UPDATE',
--     'PAYMENT',
--     'CANCELLATION',
--     'VERIFICATION',
--     'SECURITY_ALERT',
--     'SYSTEM_UPDATE'
-- );

DROP TYPE if EXISTS dbo.notification_type CASCADE;
CREATE TYPE dbo.notification_type AS ENUM
    ('JOB_MATCH', 'REMINDER', 'APPLICATION_UPDATE', 'PAYMENT', 'CANCELLATION', 'VERIFICATION', 'SECURITY_ALERT', 'SYSTEM_UPDATE','JOB_SEEKER_VERIFICATION',
'HOTELIER_VERIFICATION');
-- Notification system
DROP TYPE if EXISTS dbo.notification;
CREATE TABLE IF NOT EXISTS dbo.notification (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES dbo."user"(id),
    title CHARACTER VARCHAR(255),
    content TEXT NOT NULL,
    type dbo.notification_type NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    related_id INT
);


CREATE TABLE IF NOT EXISTS dbo.notification_seen
(
    notification_id integer NOT NULL,
    user_id integer NOT NULL,
    CONSTRAINT notification_seen_pkey PRIMARY KEY (notification_id, user_id)
)
CREATE TABLE IF NOT EXISTS dbo.notification_delete
(
    notification_id integer NOT NULL,
    user_id integer NOT NULL,
    CONSTRAINT notification_delete_pkey PRIMARY KEY (notification_id, user_id)
)



--Jobs
CREATE TABLE IF NOT EXISTS dbo.jobs
(
    id SERIAL NOT NULL,
    title character varying(255) NOT NULL,
    details text NOT NULL,
    hourly_rate DECIMAL(8,2) NOT NULL,
    job_seeker_pay DECIMAL(8,2) NOT NULL,
    platform_fee DECIMAL(8,2) NOT NULL,
    status boolean NOT NULL DEFAULT 'true',
    is_deleted boolean NOT NULL DEFAULT 'false',
    CONSTRAINT jobs_pkey PRIMARY KEY (id)
);

-- Organization
CREATE TYPE dbo.job_post_status AS ENUM('Live','Cancelled', 'Expired');

-- Job post
CREATE TABLE IF NOT EXISTS dbo.job_post
(
    id SERIAL NOT NULL,
    organization_id integer NOT NULL,
    status dbo.job_post_status DEFAULT 'Live',
    expire_time TIMESTAMP,
    created_time timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT job_post_pkey PRIMARY KEY (id)
);

CREATE TYPE dbo.job_post_details_status AS ENUM('Pending','Applied','In Progress' ,'Expired', 'Completed','Work Finished', 'Cancelled');

CREATE TABLE IF NOT EXISTS dbo.job_post_details
(
    id SERIAL NOT NULL,
    job_post_id integer NOT NULL REFERENCES dbo.job_post(id),
    job_id INTEGER NOT NULL REFERENCES dbo.jobs(id),
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    hourly_rate DECIMAL(8,2) NOT NULL,
    job_seeker_pay DECIMAL(8,2) NOT NULL,
    platform_fee DECIMAL(8,2) NOT NULL,
    status dbo.job_post_details_status DEFAULT 'Pending',
    CONSTRAINT job_post_details_pkey PRIMARY KEY (id)
);


CREATE TABLE IF NOT EXISTS dbo.countries
(
    id bigint NOT NULL,
    name character varying(100) COLLATE pg_catalog."default" NOT NULL,
    iso3 character(3) COLLATE pg_catalog."default",
    numeric_code character(3) COLLATE pg_catalog."default",
    iso2 character(2) COLLATE pg_catalog."default",
    phonecode character varying(255) COLLATE pg_catalog."default",
    currency character varying(255) COLLATE pg_catalog."default",
    currency_name character varying(255) COLLATE pg_catalog."default",
    timezones text COLLATE pg_catalog."default",
    translations text COLLATE pg_catalog."default",
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP
)


CREATE TABLE IF NOT EXISTS dbo.states
(
    id bigint NOT NULL,
    name character varying(255) COLLATE pg_catalog."default" NOT NULL,
    country_id bigint NOT NULL,
    iso2 character varying(255) COLLATE pg_catalog."default",
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS dbo.cities
(
    id bigint NOT NULL,
    name character varying(255) COLLATE pg_catalog."default" NOT NULL,
    state_id bigint NOT NULL,
    country_id bigint NOT NULL,
    created_at timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP
)


CREATE TABLE dbo.location (
    id SERIAL PRIMARY KEY,
    city_id INTEGER,
    name VARCHAR(100),
    address TEXT,
    longitude DECIMAL(9,6),
    latitude DECIMAL(9,6),
    type VARCHAR(50),
    postal_code VARCHAR(20),
    status BOOLEAN DEFAULT TRUE,
    is_home_address boolean DEFAULT false
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);



-- job seeker view
CREATE OR REPLACE VIEW jobseeker.vw_job_seeker_auth AS
SELECT
    u.id AS user_id,
    u.username,
    u.email,
    u.password_hash,
    u.name,
    u.phone_number,
    u.photo,
    u.status AS user_status,
    u.is_deleted AS user_deleted,
    u.type AS user_type,

    js.date_of_birth,
    js.gender,
    js.nationality,
    js.address,
    js.work_permit,
    js.account_status,
    js.criminal_convictions,
    js.is_2fa_on,

    -- Home address fields
    loc.id AS location_id,
    loc.city_id,
    loc.name AS location_name,
    loc.address AS location_address,
    loc.longitude,
    loc.latitude,
    loc.type AS location_type,
    loc.postal_code,
    loc.status AS location_status,
    loc.is_home_address,
    loc.created_at AS location_created_at,
    loc.updated_at AS location_updated_at

FROM dbo."user" u
JOIN jobseeker.job_seeker js ON u.id = js.user_id
LEFT JOIN dbo.location loc
    ON js.location_id = loc.id AND loc.is_home_address = true
WHERE u.is_deleted = false;

--------------------------------------------------------------------------------------------------

--  location view
CREATE OR REPLACE VIEW dbo.vw_location AS
SELECT
    loc.id AS location_id,
    loc.city_id,
    loc.name AS location_name,
    loc.address AS location_address,
    loc.longitude,
    loc.latitude,
    loc.type AS location_type,
    loc.postal_code,
    loc.status AS location_status,
    loc.is_home_address,
    loc.created_at AS location_created_at,
    loc.updated_at AS location_updated_at,
    ci.name AS city_name,
    st.name AS state_name,
    st.id AS state_id,
    c.name AS country_name,
    c.id AS country_id
FROM dbo."location" loc
JOIN dbo.cities ci ON loc.city_id = ci.id
JOIN dbo."states" st ON st.id = ci.state_id
JOIN dbo."countries" c ON c.id = st.country_id
WHERE loc.status = true;


-- cancel report
CREATE TYPE dbo.cancellation_report_type AS ENUM
    ('CANCEL_APPLICATION', 'CANCEL_JOB_POST');

-- Cancellation report status
CREATE TYPE dbo.cancellation_report_status AS ENUM
    ('Pending', 'Approved', 'Rejected', "Cancelled");

CREATE TABLE dbo.cancellation_logs (
    id SERIAL PRIMARY KEY,
    reporter_id INT NOT NULL REFERENCES dbo.user(id) ON DELETE CASCADE,
    report_type dbo.cancellation_report_type NOT NULL,
    related_id INT NOT NULL,
    reason TEXT,
    status dbo.cancellation_report_status DEFAULT 'Pending',
    reviewed_by INT REFERENCES dbo.user(id),
    reviewed_at TIMESTAMP,
    reject_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- job status
CREATE TYPE dbo.job_application_status AS ENUM ('Pending', 'Assigned', 'In Progress','Ended', 'Cancelled', 'Completed');

CREATE TABLE IF NOT EXISTS dbo.job_applications (
    id SERIAL PRIMARY KEY,
    job_post_details_id INTEGER NOT NULL REFERENCES dbo.job_post_details(id),
    job_post_id INTEGER NOT NULL REFERENCES dbo.job_post(id),
    job_seeker_id INTEGER NOT NULL REFERENCES jobseeker.job_seeker(user_id),
    status dbo.job_application_status DEFAULT 'Pending',
    cancelled_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    created_by INTEGER
);


CREATE TABLE IF NOT EXISTS dbo.job_task_activities (
    id SERIAL PRIMARY KEY,
    job_application_id INTEGER NOT NULL REFERENCES dbo.job_applications(id),
    job_post_details_id INTEGER NOT NULL REFERENCES dbo.job_post_details(id),
    start_time TIMESTAMP,
    end_time TIMESTAMP,
    total_working_hours NUMERIC(6, 2),
    start_approved_at TIMESTAMP,
    end_approved_at TIMESTAMP,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE IF NOT EXISTS dbo.job_task_list(
    id SERIAL PRIMARY KEY,
    job_task_activity_id INTEGER NOT NULL REFERENCES dbo.job_task_activities(id),
    message TEXT,
    is_completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- report
CREATE TYPE dbo.report_status AS ENUM (
  'Pending',
  'Acknowledge'
);

CREATE TYPE dbo.report_type as ENUM (
    'TaskActivity', -- for hotelier
    'JobPost' -- for job seeker
)

CREATE TABLE IF NOT EXISTS dbo.reports (
  id SERIAL PRIMARY KEY,
  job_post_details_id INTEGER NOT NULL REFERENCES dbo.job_post_details(id),
  related_id INTEGER NOT NULL REFERENCES dbo.job_applications(id),
  report_type dbo.report_type NOT NULL,
  reason TEXT NOT NULL,
  status dbo.report_status DEFAULT 'Pending',
  resolution TEXT,
  resolved_by INTEGER,
  resolved_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);


-- Payment and ledger Not completed because of changing project
-- Payment status
CREATE TYPE dbo.payment_status AS ENUM ('Unpaid', 'Paid', 'Failed', 'Partial Paid', 'Not Paid');

create type dbo.payment_type AS ENUM (
    'Card',
    'Cash',
    'Bank Transfer',
    'Online Payment',
    'Mobile Payment'
);

CREATE TABLE IF NOT EXISTS dbo.payment (
    id SERIAL PRIMARY KEY,
    application_id INTEGER NOT NULL REFERENCES dbo.job_applications(id),
    job_seeker_pay NUMERIC(10, 2) NOT NULL,
    platform_fee NUMERIC(10, 2) NOT NULL,
    total_amount NUMERIC(10, 2) NOT NULL,
    payment_type dbo.payment_type,
    status dbo.payment_status NOT NULL DEFAULT 'Unpaid',
    trx_id VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    paid_by INTEGER REFERENCES hotelier.organization(id),
    paid_at TIMESTAMP WITH TIME ZONE,
    is_deleted BOOLEAN DEFAULT FALSE,
    payment_no VARCHAR(255) UNIQUE
    trx_fee NUMERIC(10, 2),
)

create type dbo.pay_ledger_trx_type AS ENUM (
    'In',
    'Out'
);

-- job seeker ledger
CREATE TABLE IF NOT EXISTS dbo.payment_ledger (
    id SERIAL PRIMARY KEY,
    voucher_no VARCHAR(50) NOT NULL,
    trx_type dbo.pay_ledger_trx_type NOT NULL,
    entry_type dbo.payment_entry_type NOT NULL,
    user_id INTEGER REFERENCES dbo.user(id),
    user_type dbo.user_type NOT NULL,
    amount NUMERIC(18,2) NOT NULL,
    details TEXT NOT NULL,
    ledger_date TIMESTAMP,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
)
-- Payment and ledger Not completed because of changing project



CREATE TABLE IF NOT EXISTS dbo.chat_sessions (
    id SERIAL PRIMARY KEY,
    last_message TEXT,
    last_message_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    enable_chat BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS dbo.chat_session_participants (
    id SERIAL PRIMARY KEY,
    chat_session_id INTEGER NOT NULL REFERENCES dbo.chat_sessions(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES dbo."user"(id) ON DELETE CASCADE,
    type dbo.user_type NOT NULL,
    joined_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(chat_session_id, user_id)
);

CREATE TABLE IF NOT EXISTS dbo.chat_messages (
    id SERIAL PRIMARY KEY,
    chat_session_id INTEGER NOT NULL REFERENCES dbo.chat_sessions(id) ON DELETE CASCADE,
    sender_id INTEGER NOT NULL REFERENCES dbo."user"(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    file TEXT,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS dbo.chat_message_reads (
  id SERIAL PRIMARY KEY,
  message_id INTEGER NOT NULL REFERENCES dbo.chat_messages(id),
  user_id INTEGER NOT NULL REFERENCES dbo.user(id),
  seen_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS dbo.saved_job_post_details(
  id SERIAL PRIMARY KEY,
  job_post_details_id INTEGER NOT NULL REFERENCES dbo.job_post_details(id),
  job_seeker_id INTEGER NOT NULL REFERENCES dbo.user(id),
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT unique_saved_job
   UNIQUE (job_post_details_id, job_seeker_id)
)





CREATE SEQUENCE states_id_seq;

ALTER TABLE dbo.states
ALTER COLUMN id SET DEFAULT nextval('states_id_seq');

SELECT setval('states_id_seq', COALESCE((SELECT MAX(id) FROM dbo.states), 0));

ALTER TABLE dbo.states
ADD PRIMARY KEY (id);


CREATE SEQUENCE cities_id_seq;

ALTER TABLE dbo.cities
ALTER COLUMN id SET DEFAULT nextval('cities_id_seq');

SELECT setval('cities_id_seq', COALESCE((SELECT MAX(id) FROM dbo.cities), 0));

ALTER TABLE dbo.cities
ADD PRIMARY KEY (id);


CREATE TABLE IF NOT EXISTS dbo.payout
(
    id SERIAL PRIMARY KEY,
    job_seeker_id integer NOT NULL references dbo."user"(id),
    amount numeric(12,2) NOT NULL,
    status dbo.payout_status_type NOT NULL DEFAULT 'Pending',
    requested_at timestamp without time zone NOT NULL DEFAULT now(),
    approved_by integer,
    approved_at timestamp without time zone,
    paid_at timestamp without time zone,
    transaction_reference character varying(255),
    job_seeker_note text,
    admin_note text, 
    bank_account_name varchar(255),
    bank_account_number varchar(50),
    bank_code varchar(50),
    is_deleted boolean NOT NULL DEFAULT false
)

