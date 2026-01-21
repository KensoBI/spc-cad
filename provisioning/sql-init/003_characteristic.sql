CREATE TABLE IF NOT EXISTS public.characteristic
(
    id bigint NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 9223372036854775807 CACHE 1 ),
    feature_id bigint NOT NULL,
    name text COLLATE pg_catalog."default" NOT NULL,
    description text COLLATE pg_catalog."default",
    nominal numeric NOT NULL,
    usl numeric,
    lsl numeric,
    usl_warn numeric,
    lsl_warn numeric,
    unit character varying(30) COLLATE pg_catalog."default",
    external_id text COLLATE pg_catalog."default",
    tolerance_type text COLLATE pg_catalog."default",
    is_active boolean NOT NULL DEFAULT true,
    create_timestamp timestamp with time zone NOT NULL,
    update_timestamp timestamp with time zone NOT NULL,
    updated_by text COLLATE pg_catalog."default",
    CONSTRAINT characteristic_pkey PRIMARY KEY (id),
    CONSTRAINT characteristic_name_feature_id_key UNIQUE (name, feature_id),
    CONSTRAINT characteristic_feature_id FOREIGN KEY (feature_id)
        REFERENCES public.feature (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
)

TABLESPACE pg_default;