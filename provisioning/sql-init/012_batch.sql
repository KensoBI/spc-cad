CREATE TABLE IF NOT EXISTS public.batch
(
    id bigint NOT NULL GENERATED ALWAYS AS IDENTITY,
    part_id bigint NOT NULL,
    lot_number text COLLATE pg_catalog."default" NOT NULL,
    quantity integer,
    start_time timestamp with time zone,
    end_time timestamp with time zone,
    supplier_id bigint,
    create_timestamp timestamp with time zone NOT NULL DEFAULT NOW(),
    CONSTRAINT batch_pkey PRIMARY KEY (id),
    CONSTRAINT batch_part_id_fkey FOREIGN KEY (part_id) REFERENCES public.part (id),
    CONSTRAINT batch_lot_number_unique UNIQUE (lot_number)
);