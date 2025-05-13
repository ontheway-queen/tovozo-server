--Create Schema----------------------------------------------------------------------------------
CREATE SCHEMA IF NOT EXISTS hotelier;
-------------------------------------------------------------------------------------------------


--Create Types-----------------------------------------------------------------------------------

-------------------------------------------------------------------------------------------------

--Create Tables ---------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS hotelier.organization
(
    id SERIAL NOT NULL,
    name character varying(255) COLLATE pg_catalog."default",
    address character varying(500) COLLATE pg_catalog."default",
    user_id integer NOT NULL,
    details text,
    created_at timestamp without time zone DEFAULT 'CURRENT_TIMESTAMP',
    status character varying(42) NOT NULL DEFAULT 'Pending',
    is_deleted boolean NOT NULL DEFAULT 'false',
    CONSTRAINT organization_pkey PRIMARY KEY (id)
);


CREATE TABLE IF NOT EXISTS hotelier.organization_photos
(
    id SERIAL NOT NULL,
    organization_id integer NOT NULL,
    file character varying(255) NOT NULL,
    is_deleted boolean NOT NULL DEFAULT 'false',
    CONSTRAINT organization_photos_pkey PRIMARY KEY (id)
);



CREATE TABLE IF NOT EXISTS hotelier.organization_amenities
(
    id SERIAL NOT NULL,
    organization_id integer NOT NULL,
    amenity character varying(255) NOT NULL,
    CONSTRAINT organization_amenities_pkey PRIMARY KEY (id)
);


-------------------------------------------------------------------------------------------------

