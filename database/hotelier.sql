--Create Schema----------------------------------------------------------------------------------
CREATE SCHEMA IF NOT EXISTS hotelier;
-------------------------------------------------------------------------------------------------


--Create Types-----------------------------------------------------------------------------------
CREATE TYPE hotelier.organization_status AS ENUM ('Pending', 'Approved', 'Blocked');

-------------------------------------------------------------------------------------------------

--Create Tables ---------------------------------------------------------------------------------

-- Main organization table
CREATE TABLE hotelier.organization (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    user_id INTEGER NOT NULL,
    details TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status hotelier.organization_status NOT NULL DEFAULT 'Pending',  -- e.g. Pending, Approved, Blocked
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    location_id INT REFERENCES dbo.location(id),
    CONSTRAINT fk_org_user FOREIGN KEY (user_id) REFERENCES dbo."user" (id) ON DELETE CASCADE
);

-- Organization photos
CREATE TABLE hotelier.organization_photos (
    id SERIAL PRIMARY KEY,
    organization_id INTEGER NOT NULL,
    file VARCHAR(255) NOT NULL,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT fk_org_photo FOREIGN KEY (organization_id) REFERENCES hotelier.organization(id) ON DELETE CASCADE
);

-- Organization amenities
CREATE TABLE hotelier.organization_amenities (
    id SERIAL PRIMARY KEY,
    organization_id INTEGER NOT NULL,
    amenity VARCHAR(255) NOT NULL,
    CONSTRAINT fk_org_amenity FOREIGN KEY (organization_id) REFERENCES hotelier.organization(id) ON DELETE CASCADE
);



--  hotelier auth view
-- DROP VIEW hotelier.vw_hotelier_auth;

CREATE OR REPLACE VIEW hotelier.vw_hotelier_auth AS
SELECT
    u.id AS user_id,
    u.email,
    u.password_hash,
    u.phone_number,
    u.name,
    u.photo,
    u.status AS user_status,
    u.is_deleted AS user_deleted,
    u.type AS user_type,
    md.designation,
    o.id AS organization_id,
    o.name AS organization_name,
    o.details,
    o.status AS organization_status,
    o.is_deleted AS organization_deleted,
    o.created_at AS organization_created_at,
    o.is_2fa_on,
    l.id AS location_id,
    l.city_id,
    l.name AS location_name,
    l.address,
    l.longitude,
    l.latitude,
    l.type AS location_type,
    l.postal_code,
    l.status AS location_status,
    l.is_home_address,
    l.created_at AS location_created_at,
    l.updated_at AS location_updated_at

FROM dbo."user" u
INNER JOIN hotelier.organization o ON o.user_id = u.id
LEFT JOIN hotelier.maintenance_designation md ON md.user_id = u.id
LEFT JOIN dbo.location l ON l.id = o.location_id
WHERE u.is_deleted = false;


ALTER TABLE hotelier.vw_hotelier_auth
    OWNER TO postgres;


CREATE TABLE IF NOT EXISTS hotelier.maintenance_designation(
    id serial PRIMARY key,
    designation VARCHAR(500) not null,
    user_id integer not null,
    CONSTRAINT fk_hotelier_maintenance FOREIGN KEY(user_id) REFERENCES dbo.user(id)
);