/**
 * Generated by orval v7.7.0 🍺
 * Do not edit manually.
 * FinMan API
 * OpenAPI spec version: 1.0.0
 */
import type { UtilityTariffResponseId } from "./utilityTariffResponseId";
import type { UtilityTariffResponseServiceId } from "./utilityTariffResponseServiceId";
import type { UtilityTariffResponseName } from "./utilityTariffResponseName";
import type { UtilityTariffResponseRate } from "./utilityTariffResponseRate";
import type { UtilityTariffResponseCurrency } from "./utilityTariffResponseCurrency";
import type { UtilityTariffResponseValidFrom } from "./utilityTariffResponseValidFrom";
import type { UtilityTariffResponseValidTo } from "./utilityTariffResponseValidTo";
import type { UtilityTariffResponseIsActive } from "./utilityTariffResponseIsActive";
import type { UtilityTariffResponseCreated } from "./utilityTariffResponseCreated";
import type { UtilityTariffResponseUpdated } from "./utilityTariffResponseUpdated";
import type { UtilityTariffResponseService } from "./utilityTariffResponseService";
import type { UtilityTariffResponseTariffType } from "./utilityTariffResponseTariffType";
import type { UtilityTariffResponseGroupCode } from "./utilityTariffResponseGroupCode";
import type { UtilityTariffResponseCalculationMethod } from "./utilityTariffResponseCalculationMethod";
import type { UtilityTariffResponsePercentageOf } from "./utilityTariffResponsePercentageOf";
import type { UtilityTariffResponseSource } from "./utilityTariffResponseSource";

/**
 * Схема для відповіді з даними тарифу комунальної служби
 */
export interface UtilityTariffResponse {
  id?: UtilityTariffResponseId;
  service_id?: UtilityTariffResponseServiceId;
  name?: UtilityTariffResponseName;
  rate?: UtilityTariffResponseRate;
  currency?: UtilityTariffResponseCurrency;
  valid_from?: UtilityTariffResponseValidFrom;
  valid_to?: UtilityTariffResponseValidTo;
  is_active?: UtilityTariffResponseIsActive;
  created?: UtilityTariffResponseCreated;
  updated?: UtilityTariffResponseUpdated;
  service?: UtilityTariffResponseService;
  tariff_type?: UtilityTariffResponseTariffType;
  group_code?: UtilityTariffResponseGroupCode;
  calculation_method?: UtilityTariffResponseCalculationMethod;
  percentage_of?: UtilityTariffResponsePercentageOf;
  source?: UtilityTariffResponseSource;
}
