CREATE TABLE IF NOT EXISTS public.part (
    id bigint NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 9223372036854775807 CACHE 1 ),
    "number" text COLLATE pg_catalog."default" NOT NULL,
    name text COLLATE pg_catalog."default",
    description text COLLATE pg_catalog."default",
    external_id text COLLATE pg_catalog."default",
    supplier_id bigint,
    is_active boolean NOT NULL DEFAULT true,
    create_timestamp timestamp with time zone NOT NULL,
    update_timestamp timestamp with time zone NOT NULL,
    updated_by text COLLATE pg_catalog."default" NOT NULL,
    CONSTRAINT part_pkey PRIMARY KEY (id),
    CONSTRAINT part_number_key UNIQUE ("number")
) TABLESPACE pg_default;