# KensoBI CAD Panel

Welcome to KensoBI CAD Panel! This plugin lets you add CAD objects to your dashboards and enhance them with features and annotations.

## Features
- **Import CAD Objects:** Add STL and 3MF files to your dashboards.
- **Point Cloud Support:** Use point clouds with CAD data sources.
- **Custom Annotations:** Add characters, tables, and grids to your CAD objects.
- **Custom Views:** Create unique views for each feature.
- **Color Coding:** Apply different colors to features for easy identification.
- **Feature Templates:** Customize feature annotations based on feature types.

## Prerequisites
Before using KensoBI CAD Panel, make sure you have:

- **Kenso Admin App:**  Install and enable the KensoBI Admin App in your KensoBI instance.
- **Valid License:** Enter a valid license in the KensoBI Admin App.

## Building the plugin


### Frontend

1. Install dependencies

   ```bash
   yarn install
   ```

2. Build plugin in development mode and run in watch mode

   ```bash
   yarn run dev
   ```

3. Build plugin in production mode

   ```bash
   yarn run build
   ```

4. Run the tests (using Jest)

   ```bash
   # Runs the tests and watches for changes, requires git init first
   yarn run test

   # Exits after running all the tests
   yarn run test:ci
   ```

5. Spin up a Grafana instance and run the plugin inside it (using Docker)

   ```bash
   yarn run server
   ```

6. Run the E2E tests (using Cypress)

   ```bash
   # Spins up a Grafana instance first that we tests against
   yarn run server

   # Starts the tests
   yarn run e2e
   ```

7. Run the linter

   ```bash
   yarn run lint

   # or

   yarn run lint:fix
   ```

## Getting Help

If you have any questions or feedback, you can:

- Ask a question on the [KensoBI Discord channel](https://discord.gg/cVKKh7trXU).
- [Send an email](mailto:support@kensobi.com)  to report bugs, issues, and feature suggestions.

Your feedback is always welcome!

## License

This software is distributed under the [End-User License Agreement (EULA)](./LICENSE).

## Notes

Copyright (c) 2023 [Kenso Software](https://kensobi.com)
