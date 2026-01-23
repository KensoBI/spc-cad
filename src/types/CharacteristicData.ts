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

  // Timeseries data - direct Field references with lazy filtering
  timeseries?: {
    timeField: Field<number>;
    valueField: Field<any>;
    validIndices?: number[]; // Computed lazily, cached
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

    const { timeField, valueField } = this.data.timeseries;

    // Lazy computation of valid indices (nulls filtered out)
    if (!this.data.timeseries.validIndices) {
      const indices: number[] = [];
      for (let i = 0; i < timeField.values.length; i++) {
        if (timeField.values[i] != null && valueField.values[i] != null) {
          indices.push(i);
        }
      }
      this.data.timeseries.validIndices = indices;
    }

    const indices = this.data.timeseries.validIndices;

    // Create filtered Fields preserving metadata
    return {
      time: {
        ...timeField,
        values: indices.map((i) => timeField.values[i]),
      },
      values: {
        ...valueField,
        values: indices.map((i) => valueField.values[i]),
      },
    };
  }
}
