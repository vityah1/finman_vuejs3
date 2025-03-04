import https from "../http-common";
import authHeader from './auth-header';

class GroupService {
  getGroups() {
    return https.get("/groups", { headers: authHeader() });
  }

  getGroupUsers(groupId) {
    return https.get(`/groups/${groupId}/users?include_current=true`, { headers: authHeader() });
  }

  createGroup(data) {
    return https.post("/groups", data, { headers: authHeader() });
  }
  updateGroup(groupId, data) {
    return https.patch(`/groups/${groupId}`, data, { headers: authHeader() });
  }

  deleteGroup(groupId) {
    return https.delete(`/groups/${groupId}`, { headers: authHeader() });
  }

  // Методи для учасників групи
  addUserToGroup(groupId, userId) {
    return https.post(`/groups/${groupId}/users`, { user_id: userId }, { headers: authHeader() });
  }

  updateGroupUser(groupId, userId, data) {
    return https.patch(`/groups/${groupId}/users/${userId}`, data, { headers: authHeader() });
  }

  removeUserFromGroup(groupId, userId) {
    return https.delete(`/groups/${groupId}/users/${userId}`, { headers: authHeader() });
  }

  leaveGroup(groupId) {
    const user = JSON.parse(localStorage.getItem('user'));
    return https.delete(`/groups/${groupId}/users/${user.id}`, { headers: authHeader() });
  }

  // Методи для запрошень
  getGroupInvitations(groupId) {
    return https.get(`/groups/${groupId}/invitations`, { headers: authHeader() });
  }

  createGroupInvitation(groupId, data) {
    return https.post(`/groups/${groupId}/invitations`, data, { headers: authHeader() });
  }

  cancelInvitation(invitationId) {
    return https.delete(`/invitations/${invitationId}`, { headers: authHeader() });
  }

  checkInvitation(code) {
    return https.get(`/invitations/${code}`, { headers: authHeader() });
  }

  acceptInvitation(code) {
    return https.post(`/invitations/${code}/accept`, {}, { headers: authHeader() });
  }
}

export default new GroupService();