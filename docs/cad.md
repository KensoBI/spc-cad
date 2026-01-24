---
sidebar_position: 1
---

# CAD Panel

CAD panel is a visualization feature in KensoBI that allows you to embed 3D CAD models into your dashboards. This can be useful for visualizing complex products or assemblies, or for providing a more interactive way for users to explore data.

To use the CAD panel, you first need to have a CAD file in STL or 3MF file format. You can upload your CAD model to KensoBI via [CAD datasource](../data-sources/cad.md) or provide a link to a model in your cloud storage.

- [CAD Panel](#cad-panel)
  - [Adding CAD Models](#adding-cad-models)
    - [From URL](#from-url)
    - [Upload File](#upload-file)
    - [From CAD Data Source](#from-cad-data-source)
  - [Supported File Formats](#supported-file-formats)
  - [Features and Characteristics](#features-and-characteristics)
    - [Feature Data Structure](#feature-data-structure)
    - [Position from Characteristics](#position-from-characteristics)
    - [Additional Columns](#additional-columns)
  - [Measurement Time Series](#measurement-time-series)
    - [Time Series Data Structure](#time-series-data-structure)
    - [Linking to Features](#linking-to-features)
  - [Annotations](#annotations)
    - [Display Modes](#display-modes)
    - [Annotation Windows](#annotation-windows)
  - [Annotation Editor](#annotation-editor)
    - [General Settings](#general-settings)
    - [Header Colors](#header-colors)
    - [Views Configuration](#views-configuration)
  - [Templates](#templates)
    - [Built-in Templates](#built-in-templates)
    - [Template Matching](#template-matching)
  - [Point Clouds](#point-clouds)
    - [Gradient Coloring](#gradient-coloring)
    - [Scan Timeline](#scan-timeline)
  - [3D Navigation](#3d-navigation)
  - [Panel Options](#panel-options)
    - [CAD Settings](#cad-settings)
    - [Feature Settings](#feature-settings)

## Adding CAD Models

There are three ways to add CAD models to the panel:

### From URL

1. Create new dashboard by clicking on the `+` sign in the top header and `New Dashboard`.
2. Press `Add a new panel`.
3. Select CAD panel from `Visualizations` menu.
4. Click on `Add URL` to add a link to your CAD object.

![New CAD panel with CAD URL](./img/add-cad-panel.gif)

### Upload File

You can upload CAD files directly from your computer:

1. Select CAD panel from `Visualizations` menu.
2. In the panel options under **CAD**, click `Upload`.
3. Select a CAD file from your computer (STL, 3MF, PLY, or ASC format).
4. The file will be embedded in the dashboard and can be shared with other users.

**Note:** Maximum upload size is 5MB. For larger files, use URL or CAD Data Source options.

### From CAD Data Source

1. Select CAD panel from `Visualizations` menu.
2. In `Query` section, change `Data source` to `--Mixed--`.
3. Press `+ Query` button and select `CAD Datasource`.
4. Upload your model and select it by pressing green arrow.

![New CAD panel with CAD URL](./img/upload-a-file.gif)

In the CAD panel, you can adjust the size and position of your model, as well as the way it is rendered. You can also add annotations to your model with a mix of visualizations such as charts, labels, grids, tables, and hyperlinks.

## Supported File Formats

| Format | Extension | Description |
|--------|-----------|-------------|
| STL | `.stl` | Stereolithography format (binary or ASCII) |
| 3MF | `.3mf` | 3D Manufacturing Format with metadata support |
| PLY | `.ply` | Polygon File Format for point clouds and meshes |
| ASC | `.asc` | ASCII Point Cloud format |

**Recommendations:**
- Maximum file size: 200 MB
- All formats support gzip compression (`.gz` extension)
- For web delivery, compress large files to reduce load times

## Features and Characteristics

In dimensional metrology, a `feature` refers to a specific attribute of an object or component that is being measured or evaluated. Features can be physical characteristics such as dimensions, geometrical shapes, angles, contours, or surface finish. A feature consists of one or many `characteristics`. In KensoBI, a feature needs to have at minimum `x`, `y`, and `z` characteristics in order to display it in the `CAD Panel`.

There are two ways to add features to CAD panel:
- Using [Feature data source](../data-sources/feature-datasource/README.mdx)
- SQL code in [SQL data source](../data-sources/sql.md)

When `features` are loaded, they will be displayed in the 3D space along with your CAD object. Note, you can build CAD reports with just features (without a CAD model).

### Feature Data Structure

Your query should return a table with these columns:

| Column | Type | Required | Description |
|--------|------|----------|-------------|
| `feature` | string | Yes | Unique feature identifier (e.g., "CIRCLE_01") |
| `characteristic_id` | string/number | Yes | Unique identifier for the characteristic (e.g., "1", "2", "3") |
| `nominal` | number | Yes | Nominal value for the characteristic |
| `characteristic_name` | string | No | Display name for the characteristic (e.g., "Diameter", "x", "y", "z") |

### Position from Characteristics

Feature positions are determined by characteristics with **display names** `x`, `y`, and `z` (case-insensitive). The `nominal` value of each characteristic becomes the coordinate. A feature must have all three characteristics (`x`, `y`, `z`) with valid numeric `nominal` values to be positioned on the CAD model.

**Example: Feature with position and measurement**

```sql
-- Position characteristics (x, y, z) - matched by characteristic_name
SELECT 'HOLE_01' as feature, '1' as characteristic_id, 'x' as characteristic_name, 100.0 as nominal
UNION ALL
SELECT 'HOLE_01' as feature, '2' as characteristic_id, 'y' as characteristic_name, 50.0 as nominal
UNION ALL
SELECT 'HOLE_01' as feature, '3' as characteristic_id, 'z' as characteristic_name, 25.0 as nominal
UNION ALL
-- Measurement characteristic
SELECT 'HOLE_01' as feature, '4' as characteristic_id, 'Diameter' as characteristic_name, 10.0 as nominal
```

**Important:** Position characteristics are matched by their `characteristic_name` field (x, y, z), not by `characteristic_id`. The `characteristic_id` can be any unique value.

Features without valid `x`, `y`, `z` characteristics are listed separately as unpositioned features.

### Additional Columns

You can include additional columns in your query. All columns (except `feature`, `characteristic_id`, `characteristic_name`, `partid`, `featuretype`) become part of the characteristic data and are available in annotation views:

| Column | Type | Description |
|--------|------|-------------|
| `actual` | number | Measured value |
| `deviation` | number | Difference from nominal |
| `usl` | number | Upper specification limit |
| `lsl` | number | Lower specification limit |
| `featuretype` | string | Feature type for template matching (point, circle, cylinder, etc.) |
| `partid` | string | Part identifier for grouping |

**Example SQL Query:**

```sql
SELECT
  f.name as feature,
  c.id as characteristic_id,
  c.name as characteristic_name,
  c.nominal_value as nominal,
  m.measured_value as actual,
  m.measured_value - c.nominal_value as deviation,
  f.type as featuretype
FROM measurements m
JOIN characteristics c ON m.characteristic_id = c.id
JOIN features f ON c.feature_id = f.id
WHERE m.inspection_id = '${inspection}'
```

## Measurement Time Series

To display measurement history charts in annotation windows, you need a separate data source query that provides time series data. This query runs independently from the features query and provides historical measurement values for the TimeSeries view component.

### Time Series Data Structure

The time series query must return data in **long format** with these required columns:

| Column | Type | Required | Description |
|--------|------|----------|-------------|
| `time` | time | Yes | Timestamp of the measurement |
| `characteristic_id` | string/number | Yes | Characteristic identifier (must match `characteristic_id` from features query) |
| `value` | number | Yes | Measured value at this timestamp |

**Example SQL Query:**

```sql
SELECT
  measurement_time as time,
  characteristic_id,
  measured_value as value
FROM measurement_history
WHERE inspection_id = '${inspection}'
  AND measurement_time > NOW() - INTERVAL '30 days'
ORDER BY time ASC
```

### Linking to Features

Time series data is linked to feature characteristics using the `characteristic_id` column:

1. The `characteristic_id` in the time series query must match the `characteristic_id` from the features query
2. When a characteristic is selected in the TimeSeries view component, the panel filters time series data by that `characteristic_id`
3. Multiple measurements over time for the same characteristic are automatically grouped

**Example: Complete data setup for HOLE_01 with time series**

Features query returns:
```sql
SELECT 'HOLE_01' as feature, '4' as characteristic_id, 'Diameter' as characteristic_name, 10.0 as nominal
```

Time series query returns:
```sql
SELECT '2024-01-15 10:00:00' as time, '4' as characteristic_id, 10.02 as value
UNION ALL
SELECT '2024-01-15 11:00:00' as time, '4' as characteristic_id, 10.01 as value
UNION ALL
SELECT '2024-01-15 12:00:00' as time, '4' as characteristic_id, 10.03 as value
```

When configured correctly, the TimeSeries view in annotations will display the measurement history chart for the selected characteristic.

:::info
Time series data is optional. If not provided, the TimeSeries view in annotations will be empty. The features query alone is sufficient to display features on the CAD model with Table and Grid views.
:::

## Annotations

Annotations are little boxes that show up when you click on a feature. Annotations have two stages - one is just a label that follows the moving 3D object and another one is a box that has a fixed position and contains different types of visualizations - chart, grid, and table.

![Annotations](./img/annotations.gif)

The content of a fixed box is fully customizable. Users can have multiple views defined for each box. Views can be set for individual boxes or you can utilize the templating system and set views for different types of features. For example, you can have a separate view for point features and different one for sphere features. The system will pick the visualization based on the type of feature selected.

### Display Modes

Each annotation can be set to one of three display modes:

| Mode | Description |
|------|-------------|
| **Hide** | Feature sphere only, no annotation visible |
| **Label** | Floating text label attached to the feature |
| **Window** | Full information window with tabs and data |

### Annotation Windows

Windows contain detailed information about the feature:

```
┌─────────────────────────────────────────┐
│ Feature Name                    ⚙️ 📌 ✕ │  ← Header
├─────────────────────────────────────────┤
│ [Table] [Grid] [TimeSeries]             │  ← View Tabs
├─────────────────────────────────────────┤
│         View Content                    │  ← Active View
└─────────────────────────────────────────┘
```

**Header Controls:**
- ⚙️ Open annotation settings
- 📌 Pin/unpin window position
- ✕ Close (hide) annotation

## Annotation Editor

You can access `Annotation Editor` by double clicking on the annotation view or by pressing the gear icon in the annotation's header.

![Annotations](./img/annotations-editor-access.gif)

### General Settings

| Setting | Description |
|---------|-------------|
| **Display** | Hide, Label, or Window |
| **Title Column** | Column to use for annotation title |
| **Template** | Template to apply for this feature |

### Header Colors

Configure conditional coloring for the annotation header based on data values:

1. Click **Add Condition**
2. Select a column (e.g., "deviation")
3. Choose an operator (e.g., ">")
4. Enter a threshold value
5. Pick a color

**Available Operators:** `>`, `>=`, `<`, `<=`, `==`, `!=`

**Example: Traffic Light Coloring**

| Condition | Color | Meaning |
|-----------|-------|---------|
| deviation > 0.1 | Red | Out of tolerance (high) |
| deviation < -0.1 | Red | Out of tolerance (low) |
| deviation > 0.05 | Yellow | Warning |
| (default) | Green | OK |

### Views Configuration

Each annotation can have multiple views (tabs):

**Table View** - Displays characteristics in rows and columns with configurable column selection and ordering.

**Grid View** - Compact grid layout for quick data overview with customizable cell mappings.

**TimeSeries View** - Time-series chart showing measurement trends over time with optional control limits.

## Templates

Templates define how features of a specific type should be displayed. They allow you to create consistent, reusable configurations.

### Built-in Templates

The CAD Panel includes 13 pre-defined templates:

| Template | Feature Type | Description |
|----------|--------------|-------------|
| Generic | generic | Default template with Table and TimeSeries views |
| Point | point | Single point measurements |
| Circle | circle | Circular features (holes, bosses) |
| Cylinder | cylinder | Cylindrical features |
| Sphere | sphere | Spherical features |
| Ellipse | ellipse | Elliptical features |
| Line | line | Linear features |
| Rectangle | rectangle | Rectangular features |
| Slot | slot | Slot features |
| Plane | plane | Planar surfaces |
| Slab | slab | Slab features |
| Cone | cone | Conical features |
| Comparison Point | comparison point | Point comparison measurements |

### Template Matching

Templates are matched to features based on the `type` column in your data:

1. If feature has a `type` value matching a template's type, that template is applied
2. If no match is found, the Generic template is used
3. Individual features can override their template in the annotation editor

## Point Clouds

The CAD Panel supports visualization of point cloud data from 3D scanners and metrology equipment.

**Supported Formats:**
- PLY (`.ply`) - Polygon File Format with vertex properties
- ASC (`.asc`) - Simple ASCII point cloud format

### Gradient Coloring

When point cloud files include deviation data, the panel applies gradient coloring:

| Color | Meaning |
|-------|---------|
| Blue | Negative deviation (below nominal) |
| Green | Zero deviation (on nominal) |
| Red | Positive deviation (above nominal) |

A gradient legend appears showing the color scale with min/max deviation values.

### Scan Timeline

For time-series scan data, create a query named `scans` that returns:

| Column | Type | Description |
|--------|------|-------------|
| `links` | string | Path to point cloud file |
| `times` | datetime | Timestamp of the scan |

A timeline slider appears allowing playback through scan sequences.

## 3D Navigation

Navigate the 3D view using mouse controls:

| Action | Control |
|--------|---------|
| Rotate | Left-click + drag |
| Pan | Right-click + drag |
| Zoom | Mouse wheel |

Camera position is automatically saved with the dashboard.

## Panel Options

### CAD Settings

Located in panel options under **CAD**:

| Setting | Description |
|---------|-------------|
| **Add URL** | Add a CAD model from a URL |
| **Upload** | Upload a CAD file directly (max 5MB, embedded in dashboard) |
| **Model Color** | Color picker for each model |

### Feature Settings

| Setting | Description | Default |
|---------|-------------|---------|
| **Size** | Feature sphere radius in model units | 5 |
| **Color** | Default feature color | Green |
