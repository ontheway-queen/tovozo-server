--Create Schema----------------------------------------------------------------------------------
CREATE SCHEMA IF NOT EXISTS admin;
-------------------------------------------------------------------------------------------------


--Create Types-----------------------------------------------------------------------------------

CREATE TYPE IF NOT EXISTS admin.type_audit_trail AS ENUM (
    'CREATE',
    'UPDATE',
    'DELETE',
    'GET'
);

--Create Tables ---------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS admin.audit_trail
(
    id serial NOT NULL,
    created_by integer NOT NULL,
    type admin.type_audit_trail NOT NULL,
    endpoint character varying,
    details text NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    payload json,
    CONSTRAINT admin_audit_trail_pkey PRIMARY KEY (id)
);

CREATE TABLE admin.admin (
    user_id INTEGER PRIMARY KEY,
    role_id INTEGER NOT NULL,
    is_main BOOLEAN NOT NULL DEFAULT FALSE,
    created_by INTEGER,
    CONSTRAINT fk_admin_user FOREIGN KEY (user_id) REFERENCES dbo."user"(id) ON DELETE CASCADE,
    CONSTRAINT fk_admin_creator FOREIGN KEY (created_by) REFERENCES dbo."user"(id) ON DELETE SET NULL
);

-- admin auth view
CREATE OR REPLACE VIEW admin.vw_admin_auth AS
SELECT
    u.id AS user_id,
    u.username,
    u.email,
    u.password_hash,
    u.name,
    u.photo,
    u.phone_number,
    u.status AS user_status,
    u.is_deleted AS user_deleted,
    u.type AS user_type,
    a.role_id,
    a.is_main,
    a.created_by,
    a.is_2fa_on
FROM dbo."user" u
JOIN admin.admin a ON u.id = a.user_id
WHERE u.is_deleted = FALSE;


-- Admin
ALTER TABLE admin.admin
ADD COLUMN IF NOT EXISTS is_2fa_on BOOLEAN DEFAULT FALSE;

-- Hotelier
ALTER TABLE hotelier.organization
ADD COLUMN IF NOT EXISTS is_2fa_on BOOLEAN DEFAULT FALSE;

-- Job Seeker
ALTER TABLE jobSeeker.job_seeker
ADD COLUMN IF NOT EXISTS is_2fa_on BOOLEAN DEFAULT FALSE;

ALTER TABLE admin.role_permissions 
ALTER COLUMN role_id DROP IDENTITY IF EXISTS;

-------------------------------------------------------------------------------------------------

