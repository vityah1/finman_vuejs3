import https from "../http-common";
import authHeader from './auth-header';

class GroupService {
  getGroups() {
    return https.get("/groups", { headers: authHeader() });
  }

  getGroupUsers(groupId) {
    return https.get(`/groups/${groupId}/users`, { headers: authHeader() });
  }
}

export default new GroupService();