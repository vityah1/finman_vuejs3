/**
 * Generated by orval v7.7.0 🍺
 * Do not edit manually.
 * FinMan API
 * OpenAPI spec version: 1.0.0
 */
import type { ConfigCreateJsonData } from "./configCreateJsonData";
import type { ConfigCreateAddValue } from "./configCreateAddValue";

/**
 * Схема для створення конфігурації
 */
export interface ConfigCreate {
  type_data: string;
  value_data: string;
  json_data?: ConfigCreateJsonData;
  add_value?: ConfigCreateAddValue;
}
