CREATE TABLE IF NOT EXISTS public.model_part
(
    model_id bigint NOT NULL,
    part_id bigint NOT NULL,
    create_timestamp timestamp with time zone NOT NULL,
    update_timestamp timestamp with time zone NOT NULL,
    created_by text COLLATE pg_catalog."default" NOT NULL,
    updated_by text COLLATE pg_catalog."default" NOT NULL,
    CONSTRAINT model_part_pk PRIMARY KEY (model_id, part_id),
    CONSTRAINT model_part_model_id FOREIGN KEY (model_id)
        REFERENCES public.model (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE,
    CONSTRAINT model_part_part_id FOREIGN KEY (part_id)
        REFERENCES public.part (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE
)
TABLESPACE pg_default;