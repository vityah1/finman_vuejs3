/**
 * Generated by orval v7.7.0 🍺
 * Do not edit manually.
 * FinMan API
 * OpenAPI spec version: 1.0.0
 */
import type { GroupUserAddRole } from "./groupUserAddRole";

export interface GroupUserAdd {
  /** ID користувача для додавання */
  user_id: number;
  /** Роль користувача в групі */
  role?: GroupUserAddRole;
}
