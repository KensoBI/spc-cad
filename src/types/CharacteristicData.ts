import { DataFrame, Field } from '@grafana/data';

/**
 * CharacteristicData stores references to DataFrame data instead of copying values.
 * This eliminates memory overhead and preserves Field metadata.
 */
export type CharacteristicData = {
  // Table data - direct DataFrame reference
  dataFrame?: DataFrame;
  rowIndex?: number;
  fieldMap?: Map<string, number>; // column name → field index

  // Display name for UI labels (fallback to characteristic_id if not provided)
  displayName?: string;

  // Timeseries data - DataFrame references with lazy filtering
  timeseries?: {
    dataFrame: DataFrame;       // Reference to source DataFrame
    timeFieldIndex: number;     // Index of time column in dataFrame.fields
    valueFieldIndex: number;    // Index of value column in dataFrame.fields
    rowIndices: number[];       // Which rows in DataFrame belong to this characteristic
    validIndices?: number[];    // Lazy cache for null-filtered indices
  };
};

/**
 * CharacteristicAccessor provides efficient access methods for CharacteristicData.
 * Replaces direct .table property access with DataFrame-backed reads.
 */
export class CharacteristicAccessor {
  constructor(private data: CharacteristicData) {}

  /**
   * Get a single table value by column name.
   * Returns undefined if the column or data doesn't exist.
   */
  get(column: string): any {
    if (!this.data.dataFrame || this.data.rowIndex == null || !this.data.fieldMap) {
      return undefined;
    }
    const fieldIndex = this.data.fieldMap.get(column);
    if (fieldIndex == null) {
      return undefined;
    }

    const field = this.data.dataFrame.fields[fieldIndex];
    return field.values[this.data.rowIndex];
  }

  /**
   * Get Field reference for a specific column.
   * Preserves Field metadata (config, labels, type).
   */
  getField(column: string): Field | undefined {
    if (!this.data.dataFrame || !this.data.fieldMap) {
      return undefined;
    }
    const fieldIndex = this.data.fieldMap.get(column);
    if (fieldIndex == null) {
      return undefined;
    }
    return this.data.dataFrame.fields[fieldIndex];
  }

  /**
   * Get all available table column names.
   */
  getColumns(): string[] {
    return this.data.fieldMap ? Array.from(this.data.fieldMap.keys()) : [];
  }

  /**
   * Get the display name for this characteristic.
   * Returns displayName if set, otherwise returns undefined.
   */
  getDisplayName(): string | undefined {
    return this.data.displayName;
  }

  /**
   * Get timeseries fields with lazy null filtering.
   * Computes valid indices once on first access, then caches.
   * Returns filtered Field objects with nulls removed.
   */
  getTimeseriesFields(): { time: Field<number>; values: Field<any> } | undefined {
    if (!this.data.timeseries) {
      return undefined;
    }

    const { dataFrame, timeFieldIndex, valueFieldIndex, rowIndices } = this.data.timeseries;

    // Get Field references from DataFrame
    const timeField = dataFrame.fields[timeFieldIndex];
    const valueField = dataFrame.fields[valueFieldIndex];

    // Lazy computation of valid indices (nulls filtered out from rowIndices)
    if (!this.data.timeseries.validIndices) {
      const indices: number[] = [];
      for (const rowIdx of rowIndices) {
        if (timeField.values[rowIdx] != null && valueField.values[rowIdx] != null) {
          indices.push(rowIdx);
        }
      }
      this.data.timeseries.validIndices = indices;
    }

    const validIndices = this.data.timeseries.validIndices;

    // Create new Field objects with filtered values
    // We need to properly clone the Field structure including config
    const filteredTimeValues = validIndices.map((rowIdx) => timeField.values[rowIdx]);
    const filteredValueValues = validIndices.map((rowIdx) => valueField.values[rowIdx]);

    return {
      time: {
        ...timeField,
        config: timeField.config ? { ...timeField.config } : {},
        values: filteredTimeValues,
      } as Field<number>,
      values: {
        ...valueField,
        config: valueField.config ? { ...valueField.config } : {},
        values: filteredValueValues,
      } as Field<any>,
    };
  }
}
