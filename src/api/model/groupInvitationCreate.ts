/**
 * Generated by orval v7.7.0 🍺
 * Do not edit manually.
 * FinMan API
 * OpenAPI spec version: 1.0.0
 */
import type { GroupInvitationCreateEmail } from "./groupInvitationCreateEmail";
import type { GroupInvitationCreateExpires } from "./groupInvitationCreateExpires";

/**
 * Схема для створення запрошення до групи
 */
export interface GroupInvitationCreate {
  email?: GroupInvitationCreateEmail;
  expires?: GroupInvitationCreateExpires;
}
