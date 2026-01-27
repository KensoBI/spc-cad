# SPC CAD Panel

A Grafana panel plugin for visualizing 3D CAD models, point clouds, and metrology data within Grafana dashboards. Designed for quality control, manufacturing inspection, and metrology data visualization workflows.

![SPC CAD Panel](https://raw.githubusercontent.com/KensoBI/spc-cad/refs/heads/main/src/img/pointcloud.png)

## Features

- **Import CAD Models** - Load STL, 3MF, and PLY files directly into dashboards
- **Feature Annotations** - Add labels, tables, and time-series charts to geometric features
- **Template System** - 13 built-in templates for different feature types (point, circle, cylinder, etc.)
- **Color Coding** - Apply conditional colors to features based on measurement data
- **Interactive 3D View** - Rotate, pan, and zoom with trackball camera controls

## Quick Start

1. Install the plugin in your Grafana instance
2. Create a new panel and select "CAD" visualization
3. Add a CAD model path in panel options
4. Configure your data query with feature positions
5. Click features to create annotations

## Supported File Formats

| Format | Extension | Description |
|--------|-----------|-------------|
| STL | `.stl` | Stereolithography (binary/ASCII) |
| 3MF | `.3mf` | 3D Manufacturing Format |
| PLY | `.ply` | Polygon File Format |
| ASC | `.asc` | ASCII Point Cloud |

### ASC Deviation File Format

The application requires deviation data in ASC format, where each line represents a single measurement point with space-separated values. The format for each line is: `Name X Y Z Nx Ny Nz DevX DevY DevZ DevTotal`, where `Name` is a string identifier for the surface comparison, `X Y Z` are the coordinates of the measurement point, `Nx Ny Nz` are the components of the surface normal vector at that point, `DevX DevY DevZ` are the deviation components along each axis, and `DevTotal` is the absolute magnitude of the total deviation. All numeric values should be floating-point numbers with six decimal places. The file should contain no header row - each line contains point data only.

```
Surface_comparison_cube 5.000000 5.000000 0.000000 0.000000 0.000000 -1.000000 -0.000000 -0.000000 0.080942 0.080942
```

## Documentation

- Adding CAD models (from URL or data source)
- Supported file formats (STL, 3MF, PLY, ASC)
- Features and characteristics configuration
- Annotations and the annotation editor
- Built-in templates (13 feature types)
- Point clouds and scan timelines
- 3D navigation and panel options

## Getting Help

- [KensoBI Discord](https://discord.gg/cVKKh7trXU) - Community support
- Create an [issue](https://github.com/KensoBI/spc-cad/issues) to report bugs, issues, and feature suggestions
- [KensoBI docs](https://docs.kensobi.com) - Documentation and resources

## License

This software is distributed under the [GNU Affero General Public License v3.0](../LICENSE).

## Copyright

Copyright (c) 2026 [Kenso Software](https://kensobi.com)

