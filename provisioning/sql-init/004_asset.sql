CREATE TABLE IF NOT EXISTS public.asset
(
    id bigint NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 9223372036854775807 CACHE 1 ),
    name text COLLATE pg_catalog."default" NOT NULL,
    type text COLLATE pg_catalog."default",
    is_active boolean NOT NULL DEFAULT true,
    create_timestamp timestamp with time zone NOT NULL,
    update_timestamp timestamp with time zone NOT NULL,
    created_by text COLLATE pg_catalog."default" NOT NULL,
    updated_by text COLLATE pg_catalog."default",
    CONSTRAINT asset_pkey PRIMARY KEY (id),
    CONSTRAINT asset_name_unique UNIQUE (name)
);

CREATE INDEX IF NOT EXISTS asset_name_idx ON public.asset (name);