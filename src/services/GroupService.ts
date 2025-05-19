import axios from "../axios-config";
import {
  getGroupsApiGroupsGet,
  getGroupUsersApiGroupsGroupIdUsersGet,
  createGroupApiGroupsPost,
  updateGroupApiGroupsGroupIdPatch,
  deleteGroupApiGroupsGroupIdDelete,
  addUserToGroupApiGroupsGroupIdUsersPost,
  updateUserRelationApiGroupsGroupIdUsersUserIdPatch,
  removeUserFromGroupApiGroupsGroupIdUsersUserIdToRemoveDelete,
  getGroupInvitationsApiGroupsGroupIdInvitationsGet,
  createGroupInvitationApiGroupsGroupIdInvitationsPost,
  leaveGroupApiGroupsGroupIdLeavePost
} from '../api/groups/groups';

// Імпортуємо API хуки для роботи з запрошеннями
import {
  checkInvitationApiInvitationsInvitationCodeGet,
  acceptInvitationApiInvitationsInvitationCodeAcceptPost,
  checkUserInvitationsApiUsersInvitationsGet,
  ignoreInvitationApiInvitationsInvitationIdIgnorePost,
  deleteInvitationApiInvitationsInvitationIdDelete
} from '../api/invitations/invitations';

import type { GroupUserUpdate, GroupInvitationCreate } from '../api/model';

// Інтерфейси для типізації
interface GroupData {
  name: string;
  description?: string;
  [key: string]: any;
}

interface GroupUserData {
  user_id: number;
  role?: string;
  relation_type?: string;
  [key: string]: any;
}

// Адаптуємо інтерфейс до нової схеми API
interface GroupInvitationData {
  email?: string | null;
  expires?: string | null;
  [key: string]: any;
}

class GroupService {
  getGroups() {
    return getGroupsApiGroupsGet()
      .catch(error => {
        console.error('Помилка отримання груп:', error.response?.data || error.message);
        throw error;
      });
  }

  getGroupUsers(groupId: number | string) {
    // Перетворюємо groupId на number для API функції
    const numericGroupId = typeof groupId === 'string' ? parseInt(groupId, 10) : groupId;
    return getGroupUsersApiGroupsGroupIdUsersGet(numericGroupId, { 
      
      params: { include_current: true }
    }).catch(error => {
      console.error(`Помилка отримання користувачів групи ${groupId}:`, error.response?.data || error.message);
      throw error;
    });
  }

  createGroup(data: GroupData) {
    return createGroupApiGroupsPost(data)
      .catch(error => {
        console.error('Помилка створення групи:', error.response?.data || error.message);
        throw error;
      });
  }

  updateGroup(groupId: number | string, data: GroupData) {
    // Перетворюємо groupId на number для API функції
    const numericGroupId = typeof groupId === 'string' ? parseInt(groupId, 10) : groupId;
    return updateGroupApiGroupsGroupIdPatch(numericGroupId, data)
      .catch(error => {
        console.error(`Помилка оновлення групи ${groupId}:`, error.response?.data || error.message);
        throw error;
      });
  }

  deleteGroup(groupId: number | string) {
    // Перетворюємо groupId на number для API функції
    const numericGroupId = typeof groupId === 'string' ? parseInt(groupId, 10) : groupId;
    return deleteGroupApiGroupsGroupIdDelete(numericGroupId)
      .catch(error => {
        console.error(`Помилка видалення групи ${groupId}:`, error.response?.data || error.message);
        throw error;
      });
  }

  // Методи для учасників групи
  addUserToGroup(groupId: number | string, userId: number | string) {
    const data: GroupUserData = {
      user_id: typeof userId === 'string' ? parseInt(userId, 10) : userId
    };
    // Перетворюємо groupId на number для API функції
    const numericGroupId = typeof groupId === 'string' ? parseInt(groupId, 10) : groupId;
    return addUserToGroupApiGroupsGroupIdUsersPost(numericGroupId, data)
      .catch(error => {
        console.error(`Помилка додавання користувача до групи ${groupId}:`, error.response?.data || error.message);
        throw error;
      });
  }

  updateGroupUser(groupId: number | string, userId: number | string, data: Omit<GroupUserData, 'user_id'>) {
    // Перетворюємо groupId та userId на number для API функції
    const numericGroupId = typeof groupId === 'string' ? parseInt(groupId, 10) : groupId;
    const numericUserId = typeof userId === 'string' ? parseInt(userId, 10) : userId;
    
    // Використовуємо relation_type з даних, що передаються
    const relationType = data.relation_type || data.role || '';
    
    // Не викидаємо помилку, якщо поле не заповнене, бо на бекенді воно необов'язкове
    
    // Перетворюємо дані у відповідний формат API
    // Бекенд очікує relation_type
    const apiData = {
      relation_type: relationType
    };
    
    return updateUserRelationApiGroupsGroupIdUsersUserIdPatch(numericGroupId, numericUserId, apiData as any)
      .catch(error => {
        console.error(`Помилка оновлення зв'язку користувача ${userId} в групі ${groupId}:`, error.response?.data || error.message);
        throw error;
      });
  }

  removeUserFromGroup(groupId: number | string, userId: number | string) {
    // Перетворюємо groupId та userId на number для API функції
    const numericGroupId = typeof groupId === 'string' ? parseInt(groupId, 10) : groupId;
    const numericUserId = typeof userId === 'string' ? parseInt(userId, 10) : userId;
    return removeUserFromGroupApiGroupsGroupIdUsersUserIdToRemoveDelete(numericGroupId, numericUserId)
      .catch(error => {
        console.error(`Помилка видалення користувача ${userId} з групи ${groupId}:`, error.response?.data || error.message);
        throw error;
      });
  }

  leaveGroup(groupId: number | string) {
    // Перетворюємо groupId на number для API функції
    const numericGroupId = typeof groupId === 'string' ? parseInt(groupId, 10) : groupId;
    return leaveGroupApiGroupsGroupIdLeavePost(numericGroupId)
      .catch(error => {
        console.error(`Помилка виходу з групи ${groupId}:`, error.response?.data || error.message);
        throw error;
      });
  }

  // Методи для запрошень
  getGroupInvitations(groupId: number | string) {
    // Перетворюємо groupId на number для API функції
    const numericGroupId = typeof groupId === 'string' ? parseInt(groupId, 10) : groupId;
    return getGroupInvitationsApiGroupsGroupIdInvitationsGet(numericGroupId)
      .catch(error => {
        console.error(`Помилка отримання запрошень групи ${groupId}:`, error.response?.data || error.message);
        throw error;
      });
  }

  createGroupInvitation(groupId: number | string, data: GroupInvitationData) {
    // Перетворюємо groupId на number для API функції
    const numericGroupId = typeof groupId === 'string' ? parseInt(groupId, 10) : groupId;
    
    // Форматуємо дані відповідно до нової схеми API
    const invitationData: GroupInvitationCreate = {
      email: data.email,
      expires: data.expires
    };
    
    return createGroupInvitationApiGroupsGroupIdInvitationsPost(numericGroupId, invitationData)
      .catch(error => {
        console.error(`Помилка створення запрошення до групи ${groupId}:`, error.response?.data || error.message);
        throw error;
      });
  }

  cancelInvitation(invitationId: number | string) {
    // Перетворюємо invitationId на number, як очікує API функція
    const numericInvitationId = typeof invitationId === 'string' ? parseInt(invitationId, 10) : invitationId;
    return deleteInvitationApiInvitationsInvitationIdDelete(numericInvitationId)
      .catch(error => {
        console.error(`Помилка скасування запрошення ${invitationId}:`, error.response?.data || error.message);
        throw error;
      });
  }

  checkInvitation(code: string) {
    return checkInvitationApiInvitationsInvitationCodeGet(code)
      .catch(error => {
        console.error(`Помилка перевірки запрошення ${code}:`, error.response?.data || error.message);
        throw error;
      });
  }

  acceptInvitation(code: string) {
    // API очікує порожній об'єкт для цього запиту
    return acceptInvitationApiInvitationsInvitationCodeAcceptPost(code, {})
      .catch(error => {
        console.error(`Помилка прийняття запрошення ${code}:`, error.response?.data || error.message);
        throw error;
      });
  }

  getUserInvitations() {
    return checkUserInvitationsApiUsersInvitationsGet()
      .catch(error => {
        console.error('Помилка отримання запрошень користувача:', error.response?.data || error.message);
        throw error;
      });
  }

  ignoreInvitation(invitationId: number | string) {
    // Перетворюємо invitationId на number, як очікує API функція
    const numericInvitationId = typeof invitationId === 'string' ? parseInt(invitationId, 10) : invitationId;
    // API очікує порожній об'єкт для цього запиту
    return ignoreInvitationApiInvitationsInvitationIdIgnorePost(numericInvitationId, {})
      .catch(error => {
        console.error(`Помилка ігнорування запрошення ${invitationId}:`, error.response?.data || error.message);
        throw error;
      });
  }
}

export default new GroupService();
