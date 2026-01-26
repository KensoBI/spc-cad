-- Updated measurement table with requested changes and improvements for quality control
CREATE TABLE IF NOT EXISTS public.measurement
(
    id bigint NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 9223372036854775807 CACHE 1 ),
    characteristic_id bigint NOT NULL,
    value numeric NOT NULL,                     -- REQUIRED: the actual measured value
    deviation numeric,                          -- can be computed as value - nominal if needed
    nominal numeric,                            -- snapshot of nominal at time of measurement 
    "time" timestamp with time zone NOT NULL DEFAULT NOW(),
    operator_id bigint,
    asset_id bigint,
    part_serial text COLLATE pg_catalog."default",         -- serial number of the part being measured
    measurement_plan_id bigint,
    batch_id bigint,                            -- FK to batch/lot table for grouping measurements by production run
    report_url text COLLATE pg_catalog."default",           --  link to exported report (Polyworks/GOM PDF/XML/etc.)
    tag jsonb,                                  -- flexible metadata (e.g., environmental conditions, tool version)
    created_by text COLLATE pg_catalog."default" NOT NULL,
    create_timestamp timestamp with time zone NOT NULL DEFAULT NOW(),

    CONSTRAINT measurement_pkey PRIMARY KEY (id),
    CONSTRAINT measurement_characteristic_id_time UNIQUE (characteristic_id, "time"),
    CONSTRAINT measurement_characteristic_id FOREIGN KEY (characteristic_id)
        REFERENCES public.characteristic (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT measurement_operator_fk FOREIGN KEY (operator_id)
        REFERENCES public.operator (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT measurement_asset_fk FOREIGN KEY (asset_id)
        REFERENCES public.asset (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT measurement_measurement_plan_fk FOREIGN KEY (measurement_plan_id)
        REFERENCES public.measurement_plan (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT measurement_batch_fk FOREIGN KEY (batch_id)          -- assuming a batch table exists
        REFERENCES public.batch (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
)
TABLESPACE pg_default;


CREATE INDEX IF NOT EXISTS measurement_time_idx ON public.measurement ("time");
CREATE INDEX IF NOT EXISTS measurement_characteristic_id_idx ON public.measurement (characteristic_id);
CREATE INDEX IF NOT EXISTS measurement_batch_id_idx ON public.measurement (batch_id);
CREATE INDEX IF NOT EXISTS measurement_part_serial_idx ON public.measurement (part_serial);