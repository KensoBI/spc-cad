# Changelog

## 3.0.0

### Features

- Added file upload support for CAD models (STL, 3MF, PLY, ASC) directly from the panel options
- Uploaded files are embedded in the dashboard JSON and can be shared with other users
- Maximum upload size: 5MB
- Added interactive view helper that visualizes camera transformation with clickable X, Y, Z axes to animate camera view
- Refactored data loading to use DataFrame-centric architecture
  - 60-80% memory reduction by eliminating data duplication
  - 30-50% faster initial load by removing data copying during parse
- Refactored data queries to use `characteristic_id` instead of characteristic names
  - Minimum required columns: `feature`, `characteristic_id`, `nominal`


### Bug Fixes

- Fixed close button (X) not appearing on annotation windows for unpositioned features
- Fixed unpositioned features not returning to the Unpositioned Features list when their annotation window is closed

