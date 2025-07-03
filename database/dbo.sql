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
    details text,
    status boolean NOT NULL DEFAULT 'true',
    is_deleted boolean NOT NULL DEFAULT 'false',
    CONSTRAINT jobs_pkey PRIMARY KEY (id)
);


-- Organization
CREATE TYPE dbo.job_post_status AS ENUM('Live','Cancelled');

-- Job post
CREATE TABLE IF NOT EXISTS dbo.job_post
(
    id SERIAL NOT NULL,
    organization_id integer NOT NULL,
    title character varying(255) NOT NULL,
    details text,
    requirements text,
    hourly_rate DECIMAL(8,2) NOT NULL
    expire_time TIMESTAMP,
    prefer_gender varying(42) not null,
    status dbo.job_post_status DEFAULT 'Live',
    created_time timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT job_post_pkey PRIMARY KEY (id)
);

CREATE TYPE dbo.job_post_details_status AS ENUM('Pending','Applied','Expired', 'Completed','Work Finished', 'Cancelled');

CREATE TABLE IF NOT EXISTS dbo.job_post_details
(
    id SERIAL NOT NULL,
    job_post_id integer NOT NULL,
    job_id integer NOT NULL,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
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
    name VARCHAR(100) NOT NULL,
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
    ('PENDING', 'APPROVED', 'REJECTED', "CANCELLED");

CREATE TABLE dbo.cancellation_reports (
    id SERIAL PRIMARY KEY,
    reporter_id INT NOT NULL REFERENCES dbo.user(id) ON DELETE CASCADE,
    report_type dbo.cancellation_report_type NOT NULL,
    related_id INT NOT NULL,
    reason TEXT,
    status dbo.cancellation_report_status DEFAULT 'PENDING',
    reviewed_by INT REFERENCES dbo.user(id),
    reviewed_at TIMESTAMP,
    reject_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- job status
CREATE TYPE dbo.job_status AS ENUM ('PENDING', 'ASSIGNED', 'IN_PROGRESS','ENDED', 'CANCELLED', 'COMPLETED');

CREATE TABLE IF NOT EXISTS dbo.job_applications (
    id SERIAL PRIMARY KEY,
    job_post_details_id INTEGER NOT NULL REFERENCES dbo.job_post_details(id),
    job_post_id INTEGER NOT NULL REFERENCES dbo.job_post(id),
    job_seeker_id INTEGER NOT NULL REFERENCES jobseeker.job_seeker(user_id),
    status dbo.job_status DEFAULT 'PENDING',
    payment_status dbo.payment_status DEFAULT 'UNPAID',
    cancelled_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE
);


CREATE TABLE IF NOT EXISTS dbo.job_task_activities (
    id SERIAL PRIMARY KEY,
    job_application_id INTEGER NOT NULL REFERENCES dbo.job_applications(id),
    job_post_details_id INTEGER NOT NULL REFERENCES dbo.job_post_details(id),
    -- job_seeker_id INTEGER NOT NULL REFERENCES jobseeker.job_seeker(user_id),
    -- organization_id integer NOT NULL REFERENCES hotelier.organization(id),
    start_time TIMESTAMP,
    end_time TIMESTAMP,
    total_working_hours NUMERIC(6, 2),
    approved_at TIMESTAMP,
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
CREATE TYPE dbo.payment_status AS ENUM ('UNPAID', 'PAID', 'FAILED', "PARTIAL_PAID");

CREATE TABLE IF NOT EXISTS dbo.payment (
    id SERIAL PRIMARY KEY,
    application_id INTEGER NOT NULL REFERENCES dbo.job_applications(id),
    job_seeker_pay NUMERIC(10, 2) NOT NULL,
    platform_fee NUMERIC(10, 2) NOT NULL,
    total_amount NUMERIC(10, 2),
    status dbo.payment_status NOT NULL DEFAULT 'UNPAID',
    trx_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    paid_at TIMESTAMP WITH TIME ZONE,
    is_deleted BOOLEAN DEFAULT FALSE
);

-- job seeker ledger
CREATE TABLE IF NOT EXISTS jobseeker.job_seeker_ledger (
    id SERIAL PRIMARY KEY,
    job_seeker_id INTEGER NOT NULL REFERENCES dbo.user(id),
    hotelier_id INTEGER NOT NULL REFERENCES dbo.user(id),
    voucher_no VARCHAR(50) NOT NULL,
    amount NUMERIC(18,2) NOT NULL,
    details TEXT NOT NULL,
    ledger_date TIMESTAMP,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
)
-- Payment and ledger Not completed because of changing project 


-- 
CREATE TABLE `employee` (
  `id` int NOT NULL AUTO_INCREMENT,
  `hotel_id` int NOT NULL,
  `name` varchar(255) NOT NULL,
  `photo` varchar(255) DEFAULT NULL,
  `department_id` int NOT NULL,
  `designation_id` int NOT NULL,
  `blood_group` enum('a+','a-','b+','b-','ab+','ab-','o+','o-') DEFAULT NULL,
  `salary` decimal(10,0) NOT NULL,
  `email` varchar(45) DEFAULT NULL,
  `mobile_no` varchar(45) NOT NULL,
  `birth_date` date DEFAULT NULL,
  `appointment_date` date DEFAULT NULL,
  `joining_date` date DEFAULT NULL,
  `address` text,
  `status` int NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `created_by` int NOT NULL,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `category` enum('restaurant','hotel','management') DEFAULT 'hotel',
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_UNIQUE` (`id`),
  KEY `designation_id_idx` (`designation_id`),
  KEY `department_id_idx` (`department_id`),
  KEY `res_ids_e_idx` (`res_id`),
  CONSTRAINT `department_id` FOREIGN KEY (`department_id`) REFERENCES `department` (`id`),
  CONSTRAINT `designation_id` FOREIGN KEY (`designation_id`) REFERENCES `designation` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=38 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
4:25
CREATE TABLE `designation` (
  `id` int NOT NULL AUTO_INCREMENT,
  `hotel_id` int DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `status` tinyint NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_UNIQUE` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=37 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
4:25
CREATE TABLE `department` (
  `id` int NOT NULL AUTO_INCREMENT,
  `hotel_id` int DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `status` tinyint NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_UNIQUE` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci



CREATE TABLE hotel_reservation.department (
    id SERIAL PRIMARY KEY,
    hotel_code INTEGER NOT NULL REFERENCES hotel_reservation.hotels(hotel_code),
    name VARCHAR(255) NOT NULL,
    status VARCHAR(10) DEFAULT 'active'
    created_by INTEGER NOT NULL REFERENCES hotel_reservation.user_admin(id)
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    is_deleted BOOLEAN DEFAULT false
);

CREATE TABLE hotel_reservation.designation (
    id SERIAL PRIMARY KEY,
    hotel_code INTEGER NOT NULL REFERENCES hotel_reservation.hotels(hotel_code),
    name VARCHAR(255) NOT NULL,
    status VARCHAR(10) DEFAULT 'active'
    created_by INTEGER NOT NULL REFERENCES hotel_reservation.user_admin(id)
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    is_deleted BOOLEAN DEFAULT false
)

CREATE TABLE hotel_reservation.employee (
    id SERIAL PRIMARY KEY,
    hotel_code INTEGER NOT NULL REFERENCES hotel_reservation.hotels(hotel_code),
    name VARCHAR(255) NOT NULL,
    photo VARCHAR(255) NOT NULL,
    department_id INTEGER NOT NULL REFERENCES hotel_reservation.department(id),
    designation_id INTEGER NOT NULL REFERENCES hotel_reservation.designation(id),
    salary NUMERIC(10,0) NOT NULL,
    email VARCHAR(255),
    mobile_no VARCHAR(45) NOT NULL,
    birth_date DATE,
    appointment_date DATE,
    joining_date DATE,
    address TEXT,
    status VARCHAR(10) DEFAULT 'active'
    created_by INTEGER NOT NULL REFERENCES hotel_reservation.user_admin(id)
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    is_deleted BOOLEAN DEFAULT false
)