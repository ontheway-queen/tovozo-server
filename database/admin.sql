--Create Schema----------------------------------------------------------------------------------
CREATE SCHEMA IF NOT EXISTS admin;
-------------------------------------------------------------------------------------------------


--Create Types-----------------------------------------------------------------------------------

-------------------------------------------------------------------------------------------------

--Create Tables ---------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS admin.audit_trail
(
    id serial NOT NULL,
    created_by integer NOT NULL,
    type dbo.type_audit_trail NOT NULL,
    endpoint character varying,
    details text NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    payload json,
    CONSTRAINT admin_audit_trail_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS admin.admin
(
    user_id integer NOT NULL,
    role_id integer NOT NULL,
    is_main boolean NOT NULL DEFAULT false,
    created_by integer
);
-------------------------------------------------------------------------------------------------

