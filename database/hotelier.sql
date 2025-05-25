--Create Schema----------------------------------------------------------------------------------
CREATE SCHEMA IF NOT EXISTS hotelier;
-------------------------------------------------------------------------------------------------


--Create Types-----------------------------------------------------------------------------------

-------------------------------------------------------------------------------------------------

--Create Tables ---------------------------------------------------------------------------------

-- Main organization table
CREATE TABLE hotelier.organization (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    address VARCHAR(500),
    user_id INTEGER NOT NULL,
    details TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(42) NOT NULL DEFAULT 'Pending',  -- e.g. Pending, Approved, Blocked
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
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
CREATE OR REPLACE VIEW hotelier.vw_hotelier_auth AS
SELECT
    u.id AS user_id,
    u.username,
    u.email,
    u.password_hash,
    u.phone_number,
    u.name,
    u.photo,
    u.status AS user_status,
    u.is_deleted AS user_deleted,
    u.type AS user_type,
    o.id AS organization_id,
    o.name AS organization_name,
    o.address,
    o.details,
    o.status AS organization_status,
    o.is_deleted AS organization_deleted,
    o.created_at AS organization_created_at,
    o.is_2fa_on
FROM dbo."user" u
JOIN hotelier.organization o ON u.id = o.user_id
WHERE u.is_deleted = FALSE;

-------------------------------------------------------------------------------------------------

