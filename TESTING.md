# SPC CAD Plugin - Functional Testing Guide

This guide provides step-by-step instructions for testing the SPC CAD Grafana plugin using the provided sample dashboards and data.

## Overview

The provisioned dashboards serve as a comprehensive functional test suite, demonstrating all major plugin capabilities including 3D CAD visualization, feature annotations, time series charts, grid components, and templating systems.

## Prerequisites

- Docker and Docker Compose
- SPC CAD plugin installed in Grafana

## Getting Started

Start the demo environment with Docker Compose:

```bash
docker-compose up -d
```

This automatically provisions:
- PostgreSQL database with complete schema and sample data
- Grafana with the SPC CAD plugin
- PostgreSQL datasource configuration
- Four pre-configured test dashboards

**Access the demo:**
- URL: `http://localhost:3000`
- Default credentials: `admin` / `admin`

## What Gets Provisioned Automatically

### Database Schema and Data
All SQL scripts in `provisioning/sql-init/` run automatically on first startup:
- Schema tables (model, part, feature, characteristic, measurement, etc.)
- Sample cube data with 8 corner features
- 24 characteristics (x, y, z coordinates for each corner)
- Sample measurement data with LSL/USL limits

### Datasource
PostgreSQL datasource configured as:
- **Name:** PostgreSQL - SPC CAD Demo
- **UID:** `postgres-spc-demo`
- **Database:** `kensobi`
- Auto-configured connection to PostgreSQL container

### Dashboards
Four test dashboards are provisioned:
1. Cube and features
2. Annotations
3. Color mapping
4. Custom templates

## Dashboard Testing Guide

### Dashboard 1: "Cube and features"

**Purpose:** Tests core CAD visualization and feature annotation functionality

**What to verify:**
- [ ] 3D cube model renders correctly in the viewport
- [ ] Eight corner features are visible as colored spheres
- [ ] Feature labels display correctly
- [ ] Camera controls work (rotate, pan, zoom)
- [ ] Multiple panels show different annotation display modes:
  - Panel 1: No annotations (clean model view)
  - Panel 2: Label annotations only
  - Panel 3: Window annotations with measurements
  - Panel 4: Mixed label and window annotations

**Expected behavior:**
- Features should be positioned at cube corners (0,0,0), (100,0,0), etc.
- Window annotations should display characteristic data

### Dashboard 2: "Annotations"

**Purpose:** Tests advanced annotation features, templates, and data visualization

**What to verify:**
- [ ] Box template system works correctly
- [ ] Annotation windows can be opened/closed
- [ ] Windows display multiple view tabs (X, Y, Z)
- [ ] Grid components show characteristic data:
  - Nominal values
  - LSL (Lower Specification Limit)
  - USL (Upper Specification Limit)
- [ ] Time series charts render with:
  - Measurement data points
  - Limit lines (LSL/USL)
  - Nominal value line
  - Proper axis scaling
- [ ] Window positions are saved and restored
- [ ] Link to "Cube and features" dashboard works (from Corner 2 annotation)

### Dashboard 3: "Color mapping"

**Purpose:** Tests conditional formatting and dynamic styling

**What to verify:**
- [ ] Grid cells change colors based on value conditions
- [ ] Header colors apply based on characteristic values
- [ ] Multiple color mapping rules work:
  - Background color changes
  - Text color changes
  - Conditional operators (>, <, =, etc.)
- [ ] Static color rules apply correctly
- [ ] Dynamic rules reference correct characteristic data

**Example color rules to test:**
- Nominal > 99 → Green background (#56A64B)
- LSL values → Blue background (#1F60C4)
- Custom rules on headers (e.g., orange #FF9830 when nominal > 0)

### Dashboard 4: "Custom templates"

**Purpose:** Tests template system and feature-specific configurations

**What to verify:**
- [ ] Generic template applies to most features
- [ ] Custom "Corner 8" template displays differently:
  - Shows all three charts in first view
  - Different component layout
- [ ] Template selection persists
- [ ] Templates can be assigned per annotation
- [ ] View switching works within templates

**Template differences:**
- **Generic template:** Separate views for Main, X, Y, Z
- **Corner 8 template:** Combined X/Y/Z charts in first view

## Common Issues


### CAD model not rendering
- Check browser console for errors (F12)
- Verify STL data is embedded in dashboard JSON (base64 encoded)
- Try clearing browser cache
- Check if WebGL is enabled in browser

### No data in charts
- Check datasource connection in Grafana UI
- Verify measurements loaded: `docker-compose exec postgres psql -U kensobi -d kensobi -c "SELECT COUNT(*) FROM measurement;"`
- Check panel queries in edit mode

### Features not visible
- Verify characteristics loaded correctly in database
- Check browser console for coordinate parsing errors
- Adjust camera position using mouse controls (rotate, pan, zoom)

### Container startup issues
- Ensure ports 3000 (Grafana) and 5432 (PostgreSQL) are available
- Check Docker daemon is running
- Review logs: `docker-compose logs`
- Rebuild containers: `docker-compose up -d --build`

## Test Checklist Summary

Complete plugin functionality test:

- [ ] **3D Rendering:** CAD models display correctly
- [ ] **Annotations:** Labels and windows appear on features
- [ ] **Interaction:** Click annotations to open/close windows
- [ ] **Data Display:** Grids show database values
- [ ] **Charts:** Time series render with measurements
- [ ] **Limits:** LSL/USL/Nominal lines display correctly
- [ ] **Templates:** Different templates apply different layouts
- [ ] **Colors:** Conditional formatting works
- [ ] **Navigation:** Dashboard links function
- [ ] **Persistence:** Settings save and restore correctly


