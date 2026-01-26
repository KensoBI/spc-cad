-- Sample measurement data for a 100mm cube
-- This script creates a complete measurement dataset including:
-- - Model and Part definitions
-- - Features (geometric elements to inspect)
-- - Characteristics (measurable properties with tolerances)
-- - 30 days of measurements (~5 per day = 150 total measurements)

-- 1. Create the model
INSERT INTO public.model (name, description, external_id, revision, is_active, create_timestamp, update_timestamp, created_by, updated_by)
VALUES (
    'Cube 100x100x100',
    'Reference 100mm cube for calibration and quality control',
    'MODEL-CUBE-001',
    1,
    true,
    NOW() - INTERVAL '90 days',
    NOW() - INTERVAL '90 days',
    'system',
    'system'
) ON CONFLICT (name) DO NOTHING;

-- 2. Create the part
INSERT INTO public.part (number, name, description, external_id, supplier_id, is_active, create_timestamp, update_timestamp, updated_by)
VALUES (
    'CUBE-100-001',
    'Precision Cube 100mm',
    'High precision reference cube with 100mm nominal dimensions',
    'PART-CUBE-100-001',
    NULL,
    true,
    NOW() - INTERVAL '90 days',
    NOW() - INTERVAL '90 days',
    'system'
) ON CONFLICT (number) DO NOTHING;

-- 3. Link model to part
INSERT INTO public.model_part (model_id, part_id, create_timestamp, update_timestamp, created_by, updated_by)
SELECT
    m.id,
    p.id,
    NOW() - INTERVAL '90 days',
    NOW() - INTERVAL '90 days',
    'system',
    'system'
FROM public.model m
CROSS JOIN public.part p
WHERE m.name = 'Cube 100x100x100'
  AND p.number = 'CUBE-100-001'
ON CONFLICT (model_id, part_id) DO NOTHING;

-- 4. Create features for the cube
-- Feature 1: Bottom Face (Z=0)
INSERT INTO public.feature (part_id, name, description, type, reference, gd_t, comment, external_id, is_active, create_timestamp, update_timestamp, updated_by)
SELECT
    p.id,
    'Bottom Face',
    'Bottom surface of cube (Z=0 plane)',
    1,
    NULL,
    'Flatness 0.01',
    'Primary datum A',
    'FEAT-CUBE-BOTTOM',
    true,
    NOW() - INTERVAL '90 days',
    NOW() - INTERVAL '90 days',
    'system'
FROM public.part p
WHERE p.number = 'CUBE-100-001'
ON CONFLICT (part_id, name) DO NOTHING;

-- Feature 2: Top Face (Z=10)
INSERT INTO public.feature (part_id, name, description, type, reference, gd_t, comment, external_id, is_active, create_timestamp, update_timestamp, updated_by)
SELECT
    p.id,
    'Top Face',
    'Top surface of cube (Z=100 plane)',
    1,
    NULL,
    'Flatness 0.01 | Parallelism 0.02 [A]',
    'Referenced to datum A',
    'FEAT-CUBE-TOP',
    true,
    NOW() - INTERVAL '90 days',
    NOW() - INTERVAL '90 days',
    'system'
FROM public.part p
WHERE p.number = 'CUBE-100-001'
ON CONFLICT (part_id, name) DO NOTHING;

-- Feature 3: Front Face (Y=0)
INSERT INTO public.feature (part_id, name, description, type, reference, gd_t, comment, external_id, is_active, create_timestamp, update_timestamp, updated_by)
SELECT
    p.id,
    'Front Face',
    'Front surface of cube (Y=0 plane)',
    1,
    NULL,
    'Flatness 0.01',
    'Secondary datum B',
    'FEAT-CUBE-FRONT',
    true,
    NOW() - INTERVAL '90 days',
    NOW() - INTERVAL '90 days',
    'system'
FROM public.part p
WHERE p.number = 'CUBE-100-001'
ON CONFLICT (part_id, name) DO NOTHING;

-- Feature 4: Left Edge
INSERT INTO public.feature (part_id, name, description, type, reference, gd_t, comment, external_id, is_active, create_timestamp, update_timestamp, updated_by)
SELECT
    p.id,
    'Left Edge',
    'Edge formed by intersection of front and left faces',
    2,
    NULL,
    'Straightness 0.015',
    'Critical edge for assembly',
    'FEAT-CUBE-EDGE-LEFT',
    true,
    NOW() - INTERVAL '90 days',
    NOW() - INTERVAL '90 days',
    'system'
FROM public.part p
WHERE p.number = 'CUBE-100-001'
ON CONFLICT (part_id, name) DO NOTHING;

-- Feature 5: Overall Cube
INSERT INTO public.feature (part_id, name, description, type, reference, gd_t, comment, external_id, is_active, create_timestamp, update_timestamp, updated_by)
SELECT
    p.id,
    'Overall Cube',
    'Overall cube geometry for dimensional measurements (100mm sides)',
    3,
    NULL,
    NULL,
    'Overall dimensions',
    'FEAT-CUBE-OVERALL',
    true,
    NOW() - INTERVAL '90 days',
    NOW() - INTERVAL '90 days',
    'system'
FROM public.part p
WHERE p.number = 'CUBE-100-001'
ON CONFLICT (part_id, name) DO NOTHING;

-- Corner Point Features (for CAD overlay visualization)
-- Feature 6: Corner 1 (0, 0, 0)
INSERT INTO public.feature (part_id, name, description, type, reference, gd_t, comment, external_id, is_active, create_timestamp, update_timestamp, updated_by)
SELECT
    p.id,
    'Corner 1',
    'Bottom-front-left corner at origin (0,0,0)',
    0,
    NULL,
    'Position 0.02',
    'Origin corner',
    'FEAT-CUBE-CORNER-1',
    true,
    NOW() - INTERVAL '90 days',
    NOW() - INTERVAL '90 days',
    'system'
FROM public.part p
WHERE p.number = 'CUBE-100-001'
ON CONFLICT (part_id, name) DO NOTHING;

-- Feature 7: Corner 2 (10, 0, 0)
INSERT INTO public.feature (part_id, name, description, type, reference, gd_t, comment, external_id, is_active, create_timestamp, update_timestamp, updated_by)
SELECT
    p.id,
    'Corner 2',
    'Bottom-front-right corner (100,0,0)',
    0,
    NULL,
    'Position 0.02',
    'X-axis corner',
    'FEAT-CUBE-CORNER-2',
    true,
    NOW() - INTERVAL '90 days',
    NOW() - INTERVAL '90 days',
    'system'
FROM public.part p
WHERE p.number = 'CUBE-100-001'
ON CONFLICT (part_id, name) DO NOTHING;

-- Feature 8: Corner 3 (10, 10, 0)
INSERT INTO public.feature (part_id, name, description, type, reference, gd_t, comment, external_id, is_active, create_timestamp, update_timestamp, updated_by)
SELECT
    p.id,
    'Corner 3',
    'Bottom-back-right corner (100,100,0)',
    0,
    NULL,
    'Position 0.02',
    'XY-plane corner',
    'FEAT-CUBE-CORNER-3',
    true,
    NOW() - INTERVAL '90 days',
    NOW() - INTERVAL '90 days',
    'system'
FROM public.part p
WHERE p.number = 'CUBE-100-001'
ON CONFLICT (part_id, name) DO NOTHING;

-- Feature 9: Corner 4 (0, 10, 0)
INSERT INTO public.feature (part_id, name, description, type, reference, gd_t, comment, external_id, is_active, create_timestamp, update_timestamp, updated_by)
SELECT
    p.id,
    'Corner 4',
    'Bottom-back-left corner (0,100,0)',
    0,
    NULL,
    'Position 0.02',
    'Y-axis corner',
    'FEAT-CUBE-CORNER-4',
    true,
    NOW() - INTERVAL '90 days',
    NOW() - INTERVAL '90 days',
    'system'
FROM public.part p
WHERE p.number = 'CUBE-100-001'
ON CONFLICT (part_id, name) DO NOTHING;

-- Feature 10: Corner 5 (0, 0, 10)
INSERT INTO public.feature (part_id, name, description, type, reference, gd_t, comment, external_id, is_active, create_timestamp, update_timestamp, updated_by)
SELECT
    p.id,
    'Corner 5',
    'Top-front-left corner (0,0,100)',
    0,
    NULL,
    'Position 0.02',
    'Z-axis corner',
    'FEAT-CUBE-CORNER-5',
    true,
    NOW() - INTERVAL '90 days',
    NOW() - INTERVAL '90 days',
    'system'
FROM public.part p
WHERE p.number = 'CUBE-100-001'
ON CONFLICT (part_id, name) DO NOTHING;

-- Feature 11: Corner 6 (10, 0, 10)
INSERT INTO public.feature (part_id, name, description, type, reference, gd_t, comment, external_id, is_active, create_timestamp, update_timestamp, updated_by)
SELECT
    p.id,
    'Corner 6',
    'Top-front-right corner (100,0,100)',
    0,
    NULL,
    'Position 0.02',
    'XZ-plane corner',
    'FEAT-CUBE-CORNER-6',
    true,
    NOW() - INTERVAL '90 days',
    NOW() - INTERVAL '90 days',
    'system'
FROM public.part p
WHERE p.number = 'CUBE-100-001'
ON CONFLICT (part_id, name) DO NOTHING;

-- Feature 12: Corner 7 (10, 10, 10)
INSERT INTO public.feature (part_id, name, description, type, reference, gd_t, comment, external_id, is_active, create_timestamp, update_timestamp, updated_by)
SELECT
    p.id,
    'Corner 7',
    'Top-back-right corner (100,100,100)',
    0,
    NULL,
    'Position 0.02',
    'Opposite corner from origin',
    'FEAT-CUBE-CORNER-7',
    true,
    NOW() - INTERVAL '90 days',
    NOW() - INTERVAL '90 days',
    'system'
FROM public.part p
WHERE p.number = 'CUBE-100-001'
ON CONFLICT (part_id, name) DO NOTHING;

-- Feature 13: Corner 8 (0, 10, 10)
INSERT INTO public.feature (part_id, name, description, type, reference, gd_t, comment, external_id, is_active, create_timestamp, update_timestamp, updated_by)
SELECT
    p.id,
    'Corner 8',
    'Top-back-left corner (0,100,100)',
    0,
    NULL,
    'Position 0.02',
    'YZ-plane corner',
    'FEAT-CUBE-CORNER-8',
    true,
    NOW() - INTERVAL '90 days',
    NOW() - INTERVAL '90 days',
    'system'
FROM public.part p
WHERE p.number = 'CUBE-100-001'
ON CONFLICT (part_id, name) DO NOTHING;

-- 5. Create characteristics for each feature

-- Characteristics for Bottom Face
INSERT INTO public.characteristic (feature_id, name, description, nominal, usl, lsl, usl_warn, lsl_warn, unit, external_id, tolerance_type, is_active, create_timestamp, update_timestamp, updated_by)
SELECT
    f.id,
    'Flatness',
    'Flatness deviation of bottom face',
    0.000,
    0.010,
    -0.010,
    0.007,
    -0.007,
    'mm',
    'CHAR-CUBE-BOTTOM-FLAT',
    'GD&T',
    true,
    NOW() - INTERVAL '90 days',
    NOW() - INTERVAL '90 days',
    'system'
FROM public.feature f
JOIN public.part p ON f.part_id = p.id
WHERE p.number = 'CUBE-100-001' AND f.name = 'Bottom Face'
ON CONFLICT (name, feature_id) DO NOTHING;

-- Characteristics for Top Face
INSERT INTO public.characteristic (feature_id, name, description, nominal, usl, lsl, usl_warn, lsl_warn, unit, external_id, tolerance_type, is_active, create_timestamp, update_timestamp, updated_by)
SELECT
    f.id,
    'Flatness',
    'Flatness deviation of top face',
    0.000,
    0.010,
    -0.010,
    0.007,
    -0.007,
    'mm',
    'CHAR-CUBE-TOP-FLAT',
    'GD&T',
    true,
    NOW() - INTERVAL '90 days',
    NOW() - INTERVAL '90 days',
    'system'
FROM public.feature f
JOIN public.part p ON f.part_id = p.id
WHERE p.number = 'CUBE-100-001' AND f.name = 'Top Face'
ON CONFLICT (name, feature_id) DO NOTHING;

INSERT INTO public.characteristic (feature_id, name, description, nominal, usl, lsl, usl_warn, lsl_warn, unit, external_id, tolerance_type, is_active, create_timestamp, update_timestamp, updated_by)
SELECT
    f.id,
    'Parallelism to Datum A',
    'Parallelism of top face relative to bottom face (datum A)',
    0.000,
    0.020,
    -0.020,
    0.015,
    -0.015,
    'mm',
    'CHAR-CUBE-TOP-PARA',
    'GD&T',
    true,
    NOW() - INTERVAL '90 days',
    NOW() - INTERVAL '90 days',
    'system'
FROM public.feature f
JOIN public.part p ON f.part_id = p.id
WHERE p.number = 'CUBE-100-001' AND f.name = 'Top Face'
ON CONFLICT (name, feature_id) DO NOTHING;

-- Characteristics for Front Face
INSERT INTO public.characteristic (feature_id, name, description, nominal, usl, lsl, usl_warn, lsl_warn, unit, external_id, tolerance_type, is_active, create_timestamp, update_timestamp, updated_by)
SELECT
    f.id,
    'Flatness',
    'Flatness deviation of front face',
    0.000,
    0.010,
    -0.010,
    0.007,
    -0.007,
    'mm',
    'CHAR-CUBE-FRONT-FLAT',
    'GD&T',
    true,
    NOW() - INTERVAL '90 days',
    NOW() - INTERVAL '90 days',
    'system'
FROM public.feature f
JOIN public.part p ON f.part_id = p.id
WHERE p.number = 'CUBE-100-001' AND f.name = 'Front Face'
ON CONFLICT (name, feature_id) DO NOTHING;

-- Characteristics for Left Edge
INSERT INTO public.characteristic (feature_id, name, description, nominal, usl, lsl, usl_warn, lsl_warn, unit, external_id, tolerance_type, is_active, create_timestamp, update_timestamp, updated_by)
SELECT
    f.id,
    'Straightness',
    'Straightness deviation of left edge',
    0.000,
    0.015,
    -0.015,
    0.010,
    -0.010,
    'mm',
    'CHAR-CUBE-EDGE-STRAIGHT',
    'GD&T',
    true,
    NOW() - INTERVAL '90 days',
    NOW() - INTERVAL '90 days',
    'system'
FROM public.feature f
JOIN public.part p ON f.part_id = p.id
WHERE p.number = 'CUBE-100-001' AND f.name = 'Left Edge'
ON CONFLICT (name, feature_id) DO NOTHING;

-- Characteristics for Overall Cube - X Dimension
INSERT INTO public.characteristic (feature_id, name, description, nominal, usl, lsl, usl_warn, lsl_warn, unit, external_id, tolerance_type, is_active, create_timestamp, update_timestamp, updated_by)
SELECT
    f.id,
    'X Dimension',
    'Overall length in X direction',
    100.000,
    100.500,
    99.500,
    100.350,
    99.650,
    'mm',
    'CHAR-CUBE-DIM-X',
    'Bilateral',
    true,
    NOW() - INTERVAL '90 days',
    NOW() - INTERVAL '90 days',
    'system'
FROM public.feature f
JOIN public.part p ON f.part_id = p.id
WHERE p.number = 'CUBE-100-001' AND f.name = 'Overall Cube'
ON CONFLICT (name, feature_id) DO NOTHING;

-- Characteristics for Overall Cube - Y Dimension
INSERT INTO public.characteristic (feature_id, name, description, nominal, usl, lsl, usl_warn, lsl_warn, unit, external_id, tolerance_type, is_active, create_timestamp, update_timestamp, updated_by)
SELECT
    f.id,
    'Y Dimension',
    'Overall length in Y direction',
    100.000,
    100.500,
    99.500,
    100.350,
    99.650,
    'mm',
    'CHAR-CUBE-DIM-Y',
    'Bilateral',
    true,
    NOW() - INTERVAL '90 days',
    NOW() - INTERVAL '90 days',
    'system'
FROM public.feature f
JOIN public.part p ON f.part_id = p.id
WHERE p.number = 'CUBE-100-001' AND f.name = 'Overall Cube'
ON CONFLICT (name, feature_id) DO NOTHING;

-- Characteristics for Overall Cube - Z Dimension (Height)
INSERT INTO public.characteristic (feature_id, name, description, nominal, usl, lsl, usl_warn, lsl_warn, unit, external_id, tolerance_type, is_active, create_timestamp, update_timestamp, updated_by)
SELECT
    f.id,
    'Z Dimension',
    'Overall height in Z direction',
    100.000,
    100.500,
    99.500,
    100.350,
    99.650,
    'mm',
    'CHAR-CUBE-DIM-Z',
    'Bilateral',
    true,
    NOW() - INTERVAL '90 days',
    NOW() - INTERVAL '90 days',
    'system'
FROM public.feature f
JOIN public.part p ON f.part_id = p.id
WHERE p.number = 'CUBE-100-001' AND f.name = 'Overall Cube'
ON CONFLICT (name, feature_id) DO NOTHING;

-- Characteristics for Overall Cube - Diagonal
INSERT INTO public.characteristic (feature_id, name, description, nominal, usl, lsl, usl_warn, lsl_warn, unit, external_id, tolerance_type, is_active, create_timestamp, update_timestamp, updated_by)
SELECT
    f.id,
    'Body Diagonal',
    'Space diagonal from (0,0,0) to (100,100,100)',
    173.205081,  -- sqrt(100^2 + 100^2 + 100^2)
    174.205,
    172.205,
    173.905,
    172.505,
    'mm',
    'CHAR-CUBE-DIAG',
    'Bilateral',
    true,
    NOW() - INTERVAL '90 days',
    NOW() - INTERVAL '90 days',
    'system'
FROM public.feature f
JOIN public.part p ON f.part_id = p.id
WHERE p.number = 'CUBE-100-001' AND f.name = 'Overall Cube'
ON CONFLICT (name, feature_id) DO NOTHING;

-- Characteristics for Corner Points (x, y, z coordinates for CAD overlay)
-- Corner 1: (0, 0, 0)
INSERT INTO public.characteristic (feature_id, name, description, nominal, usl, lsl, usl_warn, lsl_warn, unit, external_id, tolerance_type, is_active, create_timestamp, update_timestamp, updated_by)
SELECT f.id, 'x', 'X coordinate of corner 1', 0.000, 0.200, -0.200, 0.150, -0.150, 'mm', 'CHAR-CUBE-CORNER1-X', 'Bilateral', true, NOW() - INTERVAL '90 days', NOW() - INTERVAL '90 days', 'system'
FROM public.feature f JOIN public.part p ON f.part_id = p.id WHERE p.number = 'CUBE-100-001' AND f.name = 'Corner 1'
ON CONFLICT (name, feature_id) DO NOTHING;

INSERT INTO public.characteristic (feature_id, name, description, nominal, usl, lsl, usl_warn, lsl_warn, unit, external_id, tolerance_type, is_active, create_timestamp, update_timestamp, updated_by)
SELECT f.id, 'y', 'Y coordinate of corner 1', 0.000, 0.200, -0.200, 0.150, -0.150, 'mm', 'CHAR-CUBE-CORNER1-Y', 'Bilateral', true, NOW() - INTERVAL '90 days', NOW() - INTERVAL '90 days', 'system'
FROM public.feature f JOIN public.part p ON f.part_id = p.id WHERE p.number = 'CUBE-100-001' AND f.name = 'Corner 1'
ON CONFLICT (name, feature_id) DO NOTHING;

INSERT INTO public.characteristic (feature_id, name, description, nominal, usl, lsl, usl_warn, lsl_warn, unit, external_id, tolerance_type, is_active, create_timestamp, update_timestamp, updated_by)
SELECT f.id, 'z', 'Z coordinate of corner 1', 0.000, 0.200, -0.200, 0.150, -0.150, 'mm', 'CHAR-CUBE-CORNER1-Z', 'Bilateral', true, NOW() - INTERVAL '90 days', NOW() - INTERVAL '90 days', 'system'
FROM public.feature f JOIN public.part p ON f.part_id = p.id WHERE p.number = 'CUBE-100-001' AND f.name = 'Corner 1'
ON CONFLICT (name, feature_id) DO NOTHING;

-- Corner 2: (100, 0, 0)
INSERT INTO public.characteristic (feature_id, name, description, nominal, usl, lsl, usl_warn, lsl_warn, unit, external_id, tolerance_type, is_active, create_timestamp, update_timestamp, updated_by)
SELECT f.id, 'x', 'X coordinate of corner 2', 100.000, 100.200, 99.800, 100.150, 99.850, 'mm', 'CHAR-CUBE-CORNER2-X', 'Bilateral', true, NOW() - INTERVAL '90 days', NOW() - INTERVAL '90 days', 'system'
FROM public.feature f JOIN public.part p ON f.part_id = p.id WHERE p.number = 'CUBE-100-001' AND f.name = 'Corner 2'
ON CONFLICT (name, feature_id) DO NOTHING;

INSERT INTO public.characteristic (feature_id, name, description, nominal, usl, lsl, usl_warn, lsl_warn, unit, external_id, tolerance_type, is_active, create_timestamp, update_timestamp, updated_by)
SELECT f.id, 'y', 'Y coordinate of corner 2', 0.000, 0.200, -0.200, 0.150, -0.150, 'mm', 'CHAR-CUBE-CORNER2-Y', 'Bilateral', true, NOW() - INTERVAL '90 days', NOW() - INTERVAL '90 days', 'system'
FROM public.feature f JOIN public.part p ON f.part_id = p.id WHERE p.number = 'CUBE-100-001' AND f.name = 'Corner 2'
ON CONFLICT (name, feature_id) DO NOTHING;

INSERT INTO public.characteristic (feature_id, name, description, nominal, usl, lsl, usl_warn, lsl_warn, unit, external_id, tolerance_type, is_active, create_timestamp, update_timestamp, updated_by)
SELECT f.id, 'z', 'Z coordinate of corner 2', 0.000, 0.200, -0.200, 0.150, -0.150, 'mm', 'CHAR-CUBE-CORNER2-Z', 'Bilateral', true, NOW() - INTERVAL '90 days', NOW() - INTERVAL '90 days', 'system'
FROM public.feature f JOIN public.part p ON f.part_id = p.id WHERE p.number = 'CUBE-100-001' AND f.name = 'Corner 2'
ON CONFLICT (name, feature_id) DO NOTHING;

-- Corner 3: (100, 100, 0)
INSERT INTO public.characteristic (feature_id, name, description, nominal, usl, lsl, usl_warn, lsl_warn, unit, external_id, tolerance_type, is_active, create_timestamp, update_timestamp, updated_by)
SELECT f.id, 'x', 'X coordinate of corner 3', 100.000, 100.200, 99.800, 100.150, 99.850, 'mm', 'CHAR-CUBE-CORNER3-X', 'Bilateral', true, NOW() - INTERVAL '90 days', NOW() - INTERVAL '90 days', 'system'
FROM public.feature f JOIN public.part p ON f.part_id = p.id WHERE p.number = 'CUBE-100-001' AND f.name = 'Corner 3'
ON CONFLICT (name, feature_id) DO NOTHING;

INSERT INTO public.characteristic (feature_id, name, description, nominal, usl, lsl, usl_warn, lsl_warn, unit, external_id, tolerance_type, is_active, create_timestamp, update_timestamp, updated_by)
SELECT f.id, 'y', 'Y coordinate of corner 3', 100.000, 100.200, 99.800, 100.150, 99.850, 'mm', 'CHAR-CUBE-CORNER3-Y', 'Bilateral', true, NOW() - INTERVAL '90 days', NOW() - INTERVAL '90 days', 'system'
FROM public.feature f JOIN public.part p ON f.part_id = p.id WHERE p.number = 'CUBE-100-001' AND f.name = 'Corner 3'
ON CONFLICT (name, feature_id) DO NOTHING;

INSERT INTO public.characteristic (feature_id, name, description, nominal, usl, lsl, usl_warn, lsl_warn, unit, external_id, tolerance_type, is_active, create_timestamp, update_timestamp, updated_by)
SELECT f.id, 'z', 'Z coordinate of corner 3', 0.000, 0.200, -0.200, 0.150, -0.150, 'mm', 'CHAR-CUBE-CORNER3-Z', 'Bilateral', true, NOW() - INTERVAL '90 days', NOW() - INTERVAL '90 days', 'system'
FROM public.feature f JOIN public.part p ON f.part_id = p.id WHERE p.number = 'CUBE-100-001' AND f.name = 'Corner 3'
ON CONFLICT (name, feature_id) DO NOTHING;

-- Corner 4: (0, 100, 0)
INSERT INTO public.characteristic (feature_id, name, description, nominal, usl, lsl, usl_warn, lsl_warn, unit, external_id, tolerance_type, is_active, create_timestamp, update_timestamp, updated_by)
SELECT f.id, 'x', 'X coordinate of corner 4', 0.000, 0.200, -0.200, 0.150, -0.150, 'mm', 'CHAR-CUBE-CORNER4-X', 'Bilateral', true, NOW() - INTERVAL '90 days', NOW() - INTERVAL '90 days', 'system'
FROM public.feature f JOIN public.part p ON f.part_id = p.id WHERE p.number = 'CUBE-100-001' AND f.name = 'Corner 4'
ON CONFLICT (name, feature_id) DO NOTHING;

INSERT INTO public.characteristic (feature_id, name, description, nominal, usl, lsl, usl_warn, lsl_warn, unit, external_id, tolerance_type, is_active, create_timestamp, update_timestamp, updated_by)
SELECT f.id, 'y', 'Y coordinate of corner 4', 100.000, 100.200, 99.800, 100.150, 99.850, 'mm', 'CHAR-CUBE-CORNER4-Y', 'Bilateral', true, NOW() - INTERVAL '90 days', NOW() - INTERVAL '90 days', 'system'
FROM public.feature f JOIN public.part p ON f.part_id = p.id WHERE p.number = 'CUBE-100-001' AND f.name = 'Corner 4'
ON CONFLICT (name, feature_id) DO NOTHING;

INSERT INTO public.characteristic (feature_id, name, description, nominal, usl, lsl, usl_warn, lsl_warn, unit, external_id, tolerance_type, is_active, create_timestamp, update_timestamp, updated_by)
SELECT f.id, 'z', 'Z coordinate of corner 4', 0.000, 0.200, -0.200, 0.150, -0.150, 'mm', 'CHAR-CUBE-CORNER4-Z', 'Bilateral', true, NOW() - INTERVAL '90 days', NOW() - INTERVAL '90 days', 'system'
FROM public.feature f JOIN public.part p ON f.part_id = p.id WHERE p.number = 'CUBE-100-001' AND f.name = 'Corner 4'
ON CONFLICT (name, feature_id) DO NOTHING;

-- Corner 5: (0, 0, 100)
INSERT INTO public.characteristic (feature_id, name, description, nominal, usl, lsl, usl_warn, lsl_warn, unit, external_id, tolerance_type, is_active, create_timestamp, update_timestamp, updated_by)
SELECT f.id, 'x', 'X coordinate of corner 5', 0.000, 0.200, -0.200, 0.150, -0.150, 'mm', 'CHAR-CUBE-CORNER5-X', 'Bilateral', true, NOW() - INTERVAL '90 days', NOW() - INTERVAL '90 days', 'system'
FROM public.feature f JOIN public.part p ON f.part_id = p.id WHERE p.number = 'CUBE-100-001' AND f.name = 'Corner 5'
ON CONFLICT (name, feature_id) DO NOTHING;

INSERT INTO public.characteristic (feature_id, name, description, nominal, usl, lsl, usl_warn, lsl_warn, unit, external_id, tolerance_type, is_active, create_timestamp, update_timestamp, updated_by)
SELECT f.id, 'y', 'Y coordinate of corner 5', 0.000, 0.200, -0.200, 0.150, -0.150, 'mm', 'CHAR-CUBE-CORNER5-Y', 'Bilateral', true, NOW() - INTERVAL '90 days', NOW() - INTERVAL '90 days', 'system'
FROM public.feature f JOIN public.part p ON f.part_id = p.id WHERE p.number = 'CUBE-100-001' AND f.name = 'Corner 5'
ON CONFLICT (name, feature_id) DO NOTHING;

INSERT INTO public.characteristic (feature_id, name, description, nominal, usl, lsl, usl_warn, lsl_warn, unit, external_id, tolerance_type, is_active, create_timestamp, update_timestamp, updated_by)
SELECT f.id, 'z', 'Z coordinate of corner 5', 100.000, 100.200, 99.800, 100.150, 99.850, 'mm', 'CHAR-CUBE-CORNER5-Z', 'Bilateral', true, NOW() - INTERVAL '90 days', NOW() - INTERVAL '90 days', 'system'
FROM public.feature f JOIN public.part p ON f.part_id = p.id WHERE p.number = 'CUBE-100-001' AND f.name = 'Corner 5'
ON CONFLICT (name, feature_id) DO NOTHING;

-- Corner 6: (100, 0, 100)
INSERT INTO public.characteristic (feature_id, name, description, nominal, usl, lsl, usl_warn, lsl_warn, unit, external_id, tolerance_type, is_active, create_timestamp, update_timestamp, updated_by)
SELECT f.id, 'x', 'X coordinate of corner 6', 100.000, 100.200, 99.800, 100.150, 99.850, 'mm', 'CHAR-CUBE-CORNER6-X', 'Bilateral', true, NOW() - INTERVAL '90 days', NOW() - INTERVAL '90 days', 'system'
FROM public.feature f JOIN public.part p ON f.part_id = p.id WHERE p.number = 'CUBE-100-001' AND f.name = 'Corner 6'
ON CONFLICT (name, feature_id) DO NOTHING;

INSERT INTO public.characteristic (feature_id, name, description, nominal, usl, lsl, usl_warn, lsl_warn, unit, external_id, tolerance_type, is_active, create_timestamp, update_timestamp, updated_by)
SELECT f.id, 'y', 'Y coordinate of corner 6', 0.000, 0.200, -0.200, 0.150, -0.150, 'mm', 'CHAR-CUBE-CORNER6-Y', 'Bilateral', true, NOW() - INTERVAL '90 days', NOW() - INTERVAL '90 days', 'system'
FROM public.feature f JOIN public.part p ON f.part_id = p.id WHERE p.number = 'CUBE-100-001' AND f.name = 'Corner 6'
ON CONFLICT (name, feature_id) DO NOTHING;

INSERT INTO public.characteristic (feature_id, name, description, nominal, usl, lsl, usl_warn, lsl_warn, unit, external_id, tolerance_type, is_active, create_timestamp, update_timestamp, updated_by)
SELECT f.id, 'z', 'Z coordinate of corner 6', 100.000, 100.200, 99.800, 100.150, 99.850, 'mm', 'CHAR-CUBE-CORNER6-Z', 'Bilateral', true, NOW() - INTERVAL '90 days', NOW() - INTERVAL '90 days', 'system'
FROM public.feature f JOIN public.part p ON f.part_id = p.id WHERE p.number = 'CUBE-100-001' AND f.name = 'Corner 6'
ON CONFLICT (name, feature_id) DO NOTHING;

-- Corner 7: (100, 100, 100)
INSERT INTO public.characteristic (feature_id, name, description, nominal, usl, lsl, usl_warn, lsl_warn, unit, external_id, tolerance_type, is_active, create_timestamp, update_timestamp, updated_by)
SELECT f.id, 'x', 'X coordinate of corner 7', 100.000, 100.200, 99.800, 100.150, 99.850, 'mm', 'CHAR-CUBE-CORNER7-X', 'Bilateral', true, NOW() - INTERVAL '90 days', NOW() - INTERVAL '90 days', 'system'
FROM public.feature f JOIN public.part p ON f.part_id = p.id WHERE p.number = 'CUBE-100-001' AND f.name = 'Corner 7'
ON CONFLICT (name, feature_id) DO NOTHING;

INSERT INTO public.characteristic (feature_id, name, description, nominal, usl, lsl, usl_warn, lsl_warn, unit, external_id, tolerance_type, is_active, create_timestamp, update_timestamp, updated_by)
SELECT f.id, 'y', 'Y coordinate of corner 7', 100.000, 100.200, 99.800, 100.150, 99.850, 'mm', 'CHAR-CUBE-CORNER7-Y', 'Bilateral', true, NOW() - INTERVAL '90 days', NOW() - INTERVAL '90 days', 'system'
FROM public.feature f JOIN public.part p ON f.part_id = p.id WHERE p.number = 'CUBE-100-001' AND f.name = 'Corner 7'
ON CONFLICT (name, feature_id) DO NOTHING;

INSERT INTO public.characteristic (feature_id, name, description, nominal, usl, lsl, usl_warn, lsl_warn, unit, external_id, tolerance_type, is_active, create_timestamp, update_timestamp, updated_by)
SELECT f.id, 'z', 'Z coordinate of corner 7', 100.000, 100.200, 99.800, 100.150, 99.850, 'mm', 'CHAR-CUBE-CORNER7-Z', 'Bilateral', true, NOW() - INTERVAL '90 days', NOW() - INTERVAL '90 days', 'system'
FROM public.feature f JOIN public.part p ON f.part_id = p.id WHERE p.number = 'CUBE-100-001' AND f.name = 'Corner 7'
ON CONFLICT (name, feature_id) DO NOTHING;

-- Corner 8: (0, 100, 100)
INSERT INTO public.characteristic (feature_id, name, description, nominal, usl, lsl, usl_warn, lsl_warn, unit, external_id, tolerance_type, is_active, create_timestamp, update_timestamp, updated_by)
SELECT f.id, 'x', 'X coordinate of corner 8', 0.000, 0.200, -0.200, 0.150, -0.150, 'mm', 'CHAR-CUBE-CORNER8-X', 'Bilateral', true, NOW() - INTERVAL '90 days', NOW() - INTERVAL '90 days', 'system'
FROM public.feature f JOIN public.part p ON f.part_id = p.id WHERE p.number = 'CUBE-100-001' AND f.name = 'Corner 8'
ON CONFLICT (name, feature_id) DO NOTHING;

INSERT INTO public.characteristic (feature_id, name, description, nominal, usl, lsl, usl_warn, lsl_warn, unit, external_id, tolerance_type, is_active, create_timestamp, update_timestamp, updated_by)
SELECT f.id, 'y', 'Y coordinate of corner 8', 100.000, 100.200, 99.800, 100.150, 99.850, 'mm', 'CHAR-CUBE-CORNER8-Y', 'Bilateral', true, NOW() - INTERVAL '90 days', NOW() - INTERVAL '90 days', 'system'
FROM public.feature f JOIN public.part p ON f.part_id = p.id WHERE p.number = 'CUBE-100-001' AND f.name = 'Corner 8'
ON CONFLICT (name, feature_id) DO NOTHING;

INSERT INTO public.characteristic (feature_id, name, description, nominal, usl, lsl, usl_warn, lsl_warn, unit, external_id, tolerance_type, is_active, create_timestamp, update_timestamp, updated_by)
SELECT f.id, 'z', 'Z coordinate of corner 8', 100.000, 100.200, 99.800, 100.150, 99.850, 'mm', 'CHAR-CUBE-CORNER8-Z', 'Bilateral', true, NOW() - INTERVAL '90 days', NOW() - INTERVAL '90 days', 'system'
FROM public.feature f JOIN public.part p ON f.part_id = p.id WHERE p.number = 'CUBE-100-001' AND f.name = 'Corner 8'
ON CONFLICT (name, feature_id) DO NOTHING;

-- 6. Generate 30 days of measurements (5 measurements per day = 150 total)
-- Using a function to generate realistic measurement data with normal distribution

DO $$
DECLARE
    v_char_id bigint;
    v_char_name text;
    v_nominal numeric;
    v_usl numeric;
    v_lsl numeric;
    v_day_offset integer;
    v_measurement_time timestamp with time zone;
    v_part_serial text;
    v_measurement_value numeric;
    v_deviation numeric;
    v_std_dev numeric;
    v_measurement_num integer;
BEGIN
    -- Loop through each day for the last 30 days
    FOR v_day_offset IN 0..29 LOOP
        -- Generate 5 measurements per day at different times
        FOR v_measurement_num IN 1..5 LOOP
            -- Calculate measurement timestamp (spread throughout the work day: 8am-5pm)
            v_measurement_time := (NOW() - INTERVAL '29 days') + (v_day_offset * INTERVAL '1 day') +
                                  (INTERVAL '8 hours') + (v_measurement_num * INTERVAL '1.5 hours') +
                                  (random() * INTERVAL '30 minutes');

            -- Generate a unique part serial number for each day
            v_part_serial := 'CUBE-' || TO_CHAR((NOW() - INTERVAL '29 days') + (v_day_offset * INTERVAL '1 day'), 'YYYYMMDD') ||
                            '-' || LPAD(v_measurement_num::text, 3, '0');

            -- Loop through all characteristics and create measurements
            FOR v_char_id, v_char_name, v_nominal, v_usl, v_lsl IN
                SELECT c.id, c.name, c.nominal, c.usl, c.lsl
                FROM public.characteristic c
                JOIN public.feature f ON c.feature_id = f.id
                JOIN public.part p ON f.part_id = p.id
                WHERE p.number = 'CUBE-100-001'
            LOOP
                -- Calculate standard deviation (assume 6-sigma process: total tolerance range = 6*sigma)
                v_std_dev := (v_usl - v_lsl) / 6.0;

                -- Generate measurement value using Box-Muller transform for normal distribution
                v_measurement_value := v_nominal + v_std_dev * sqrt(-2 * ln(random())) * cos(2 * pi() * random());

                -- Add some process drift over time (slight upward trend)
                v_measurement_value := v_measurement_value + (v_day_offset * 0.0001);

                -- Add some daily variation
                v_measurement_value := v_measurement_value + ((random() - 0.5) * v_std_dev * 0.3);

                -- Calculate deviation
                v_deviation := v_measurement_value - v_nominal;

                -- Insert measurement with unique constraint handling
                BEGIN
                    INSERT INTO public.measurement (
                        characteristic_id,
                        value,
                        deviation,
                        nominal,
                        time,
                        operator_id,
                        asset_id,
                        part_serial,
                        measurement_plan_id,
                        batch_id,
                        report_url,
                        tag,
                        created_by,
                        create_timestamp
                    ) VALUES (
                        v_char_id,
                        ROUND(v_measurement_value::numeric, 6),
                        ROUND(v_deviation::numeric, 6),
                        v_nominal,
                        v_measurement_time,
                        NULL,  -- operator_id (FK may not exist)
                        NULL,  -- asset_id (FK may not exist)
                        v_part_serial,
                        NULL,  -- measurement_plan_id (FK may not exist)
                        NULL,  -- batch_id (FK may not exist)
                        'https://example.com/reports/' || v_part_serial || '_' || v_char_name || '.pdf',
                        jsonb_build_object(
                            'temperature', ROUND((20 + (random() - 0.5) * 2)::numeric, 2),
                            'humidity', ROUND((45 + (random() - 0.5) * 10)::numeric, 2),
                            'software_version', '2024.1.5',
                            'inspector', CASE (random() * 3)::integer
                                WHEN 0 THEN 'John Smith'
                                WHEN 1 THEN 'Jane Doe'
                                ELSE 'Bob Johnson'
                            END
                        ),
                        'system',
                        v_measurement_time
                    );
                EXCEPTION
                    WHEN unique_violation THEN
                        -- Skip if this exact time already exists for this characteristic
                        -- (Should not happen with our time generation, but just in case)
                        CONTINUE;
                END;
            END LOOP;
        END LOOP;
    END LOOP;
END $$;

-- Summary query to verify data
DO $$
DECLARE
    v_total_measurements bigint;
    v_date_range text;
BEGIN
    SELECT COUNT(*),
           TO_CHAR(MIN(time), 'YYYY-MM-DD') || ' to ' || TO_CHAR(MAX(time), 'YYYY-MM-DD')
    INTO v_total_measurements, v_date_range
    FROM public.measurement m
    JOIN public.characteristic c ON m.characteristic_id = c.id
    JOIN public.feature f ON c.feature_id = f.id
    JOIN public.part p ON f.part_id = p.id
    WHERE p.number = 'CUBE-100-001';

    RAISE NOTICE 'Created % measurements for cube CUBE-10-001', v_total_measurements;
    RAISE NOTICE 'Date range: %', v_date_range;
END $$;
