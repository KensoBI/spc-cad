CREATE TABLE IF NOT EXISTS public.feature
(
    id bigint NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 9223372036854775807 CACHE 1 ),
    part_id bigint NOT NULL,
    name text COLLATE pg_catalog."default" NOT NULL,
    description text COLLATE pg_catalog."default",
    type numeric,
    reference bigint,  -- Reference to another feature ID, e.g., for datum references in GD&T (e.g., linking a tolerance to a baseline datum plane or axis)
    gd_t text COLLATE pg_catalog."default",
    comment text COLLATE pg_catalog."default",
    external_id text COLLATE pg_catalog."default",
    is_active boolean NOT NULL DEFAULT true,
    create_timestamp timestamp with time zone NOT NULL,
    update_timestamp timestamp with time zone NOT NULL,
    updated_by text COLLATE pg_catalog."default",
    CONSTRAINT feature_pkey PRIMARY KEY (id),
    CONSTRAINT feature_part_id_name_key UNIQUE (part_id, name),
    CONSTRAINT feature_part_id_fkey FOREIGN KEY (part_id)
        REFERENCES public.part (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT feature_ref_fkey FOREIGN KEY (reference)
        REFERENCES public.feature (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
)
TABLESPACE pg_default;