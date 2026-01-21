CREATE TABLE IF NOT EXISTS public.model (
    id bigint NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 9223372036854775807 CACHE 1 ),
    name text COLLATE pg_catalog."default" NOT NULL,
    description text COLLATE pg_catalog."default",
    external_id text COLLATE pg_catalog."default",
    revision integer DEFAULT 1,
    is_active boolean NOT NULL DEFAULT true,
    create_timestamp timestamp with time zone NOT NULL,
    update_timestamp timestamp with time zone NOT NULL,
    created_by text COLLATE pg_catalog."default" NOT NULL,
    updated_by text COLLATE pg_catalog."default" NOT NULL,
    CONSTRAINT model_pkey PRIMARY KEY (id),
    CONSTRAINT model_name_key UNIQUE (name)
) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS model_name_idx ON public.model (name);