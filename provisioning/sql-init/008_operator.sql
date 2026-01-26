CREATE TABLE IF NOT EXISTS public.operator
(
    id bigint NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 9223372036854775807 CACHE 1 ),
    loginid text COLLATE pg_catalog."default" NOT NULL,
    first_name text COLLATE pg_catalog."default",
    last_name text COLLATE pg_catalog."default",
    external_id text COLLATE pg_catalog."default",
    is_active boolean NOT NULL DEFAULT true,
    create_timestamp timestamp with time zone NOT NULL,
    update_timestamp timestamp with time zone NOT NULL,
    updated_by text COLLATE pg_catalog."default" NOT NULL,
    CONSTRAINT operator_pkey PRIMARY KEY (id)
);

CREATE INDEX IF NOT EXISTS operator_loginid_idx ON public.operator (loginid);