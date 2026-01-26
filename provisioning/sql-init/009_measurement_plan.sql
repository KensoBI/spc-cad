CREATE TABLE IF NOT EXISTS public.measurement_plan
(
    id bigint NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 9223372036854775807 CACHE 1 ),
    name text COLLATE pg_catalog."default" NOT NULL,
    description text COLLATE pg_catalog."default",
    version integer NOT NULL DEFAULT 1,                  -- For tracking revisions of the measurement plan
    is_active boolean NOT NULL DEFAULT true,             -- Allows soft-deletion / deactivation of old plans
    created_by text COLLATE pg_catalog."default" NOT NULL,
    updated_by text COLLATE pg_catalog."default" NOT NULL,
    create_timestamp timestamp with time zone NOT NULL,
    update_timestamp timestamp with time zone NOT NULL,
    CONSTRAINT measurement_plan_pkey PRIMARY KEY (id),
    CONSTRAINT measurement_plan_name_version_unique UNIQUE (name, version)  -- Prevents duplicate active versions with same name
)

TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS measurement_plan_name_idx ON public.measurement_plan (name);