<template>
  <div v-if="currentUser" class="container">
    <alert-component ref="myAlert"></alert-component>

    <!-- Компонент запрошень користувача -->
    <user-invitations 
      :user-invitations="userInvitations"
      @invitation-accepted="handleInvitationAccepted"
      @show-alert="showAlert"
    />

    <header class="jumbotron">
      <h3>
        Профіль: <strong>{{ currentUser.login }}</strong> [{{ currentUser.id }}]
      </h3>
    </header>

    <!-- Компонент секції груп -->
    <user-group-section
      :user-group="userGroup"
      :is-group-owner="isGroupOwner"
      @group-created="handleGroupCreated"
      @group-updated="handleGroupUpdated"
      @group-left="handleGroupLeft"
      @show-alert="showAlert"
    />

    <!-- Компонент учасників групи -->
    <user-group-members
      v-if="userGroup"
      :user-group="userGroup"
      :group-users="filteredGroupUsers"
      :is-group-owner="isGroupOwner"
      :loading="loadingGroupUsers"
      :current-user-id="currentUser.id"
      @member-removed="handleMemberRemoved"
      @relation-updated="handleRelationUpdated"
      @show-alert="showAlert"
    />

    <!-- Компонент активних запрошень -->
    <user-active-invitations
      v-if="userGroup && isGroupOwner"
      :user-group="userGroup"
      :active-invitations="activeInvitations"
      :loading="loadingInvitations"
      @invitation-created="handleInvitationCreated"
      @invitation-revoked="handleInvitationRevoked"
      @show-alert="showAlert"
    />

    <!-- Компонент особистої інформації -->
    <user-personal-info
      :current-user="currentUser"
      :loading="loading"
      @user-updated="handleUserUpdated"
      @show-alert="showAlert"
    />

    <!-- Модальні вікна -->
    <group-modals
      :show-join-modal="showJoinGroupModal"
      @join-group="handleJoinGroup"
      @close-join-modal="showJoinGroupModal = false"
      @show-alert="showAlert"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import moment from "moment";

// Імпортуємо хуки Orval для роботи з групами
import {
  useGetGroupsApiGroupsGet,
  useGetGroupUsersApiGroupsGroupIdUsersGet,
  useGetGroupInvitationsApiGroupsGroupIdInvitationsGet
} from "@/api/groups/groups";

// Імпортуємо хуки Orval для роботи з запрошеннями
import {
  useCheckUserInvitationsApiUsersInvitationsGet,
  useAcceptInvitationApiInvitationsInvitationCodeAcceptPost
} from "@/api/invitations/invitations";

// Імпортуємо компоненти
import UserInvitations from './UserProfile/UserInvitations.vue';
import UserGroupSection from './UserProfile/UserGroupSection.vue';
import UserGroupMembers from './UserProfile/UserGroupMembers.vue';
import UserActiveInvitations from './UserProfile/UserActiveInvitations.vue';
import UserPersonalInfo from './UserProfile/UserPersonalInfo.vue';
import GroupModals from './UserProfile/GroupModals.vue';

// Типи
interface Group {
  id: number;
  name: string;
  description?: string;
  owner_id: number;
  [key: string]: any;
}

interface GroupUser {
  id: number;
  login: string;
  fullname?: string;
  email?: string;
  phone?: string;
  role?: string;
  relation_type?: string;
  [key: string]: any;
}

interface Invitation {
  id: number;
  invitation_code: string;
  email?: string;
  expires?: string;
  created: string;
  is_active: boolean;
  group?: any;
  creator?: any;
  [key: string]: any;
}

export default defineComponent({
  name: "UserProfile",
  components: {
    UserInvitations,
    UserGroupSection,
    UserGroupMembers,
    UserActiveInvitations,
    UserPersonalInfo,
    GroupModals
  },
  setup() {
    // Хуки для роботи з групами
    const { data: groupsData, refetch: refetchGroups } = useGetGroupsApiGroupsGet();
    
    // Хуки для запрошень користувача
    const { data: userInvitationsData, refetch: refetchUserInvitations } = useCheckUserInvitationsApiUsersInvitationsGet();
    const acceptInvitationMutation = useAcceptInvitationApiInvitationsInvitationCodeAcceptPost();
    
    return {
      groupsData,
      refetchGroups,
      userInvitationsData,
      refetchUserInvitations,
      acceptInvitationMutation
    };
  },
  data() {
    return {
      loading: false,
      
      // Дані для груп
      userGroup: null as Group | null,
      loadingGroupUsers: false,
      groupUsers: [] as GroupUser[],
      
      // Запрошення
      loadingInvitations: false,
      activeInvitations: [] as Invitation[],
      
      // Модальні вікна
      showJoinGroupModal: false,
      invitationCode: ""
    };
  },
  computed: {
    currentUser() {
      return this.$store.state.auth.user;
    },
    userInvitations() {
      return (this.userInvitationsData as any)?.data || [];
    },
    isGroupOwner() {
      if (!this.userGroup) return false;
      return this.userGroup.owner_id === this.currentUser.id;
    },
    filteredGroupUsers() {
      if (!this.userGroup || !this.groupUsers || !this.groupUsers.length) return [];
      return this.groupUsers.filter(user => user.id !== this.currentUser.id);
    }
  },
  watch: {
    groupsData: {
      handler(newData) {
        if (newData?.data && Array.isArray(newData.data) && newData.data.length > 0) {
          this.userGroup = newData.data[0];
          this.fetchGroupUsers();
          if (this.isGroupOwner) {
            this.fetchActiveInvitations();
          }
        } else {
          this.userGroup = null;
          this.groupUsers = [];
          this.activeInvitations = [];
        }
      },
      immediate: true
    }
  },
  methods: {
    // Utility методи
    showAlert(type: string, message: string) {
      this.$refs.myAlert.showAlert(type, message);
    },

    // Методи для завантаження даних
    async fetchGroupUsers() {
      if (!this.userGroup) return;

      this.loadingGroupUsers = true;
      try {
        const { data } = useGetGroupUsersApiGroupsGroupIdUsersGet(this.userGroup.id);
        await this.$nextTick();
        
        if (data.value && Array.isArray((data.value as any).data)) {
          this.groupUsers = (data.value as any).data.map((user: GroupUser) => ({
            ...user,
            role: user.id === this.userGroup!.owner_id ? "owner" : "member",
          }));
        } else {
          this.groupUsers = [];
        }
      } catch (error) {
        console.error("Помилка при отриманні користувачів групи:", error);
        this.groupUsers = [];
      } finally {
        this.loadingGroupUsers = false;
      }
    },

    async fetchActiveInvitations() {
      if (!this.userGroup) return;

      this.loadingInvitations = true;
      try {
        const { data } = useGetGroupInvitationsApiGroupsGroupIdInvitationsGet(this.userGroup.id);
        await this.$nextTick();
        
        if (data.value && Array.isArray((data.value as any).data)) {
          this.activeInvitations = (data.value as any).data.filter((inv: Invitation) => inv.is_active);
        } else {
          this.activeInvitations = [];
        }
      } catch (error) {
        console.error("Помилка при отриманні запрошень:", error);
        this.activeInvitations = [];
      } finally {
        this.loadingInvitations = false;
      }
    },

    // Обробники подій від дочірніх компонентів
    handleInvitationAccepted() {
      this.refetchGroups();
      this.refetchUserInvitations();
    },

    handleGroupCreated() {
      this.refetchGroups();
    },

    handleGroupUpdated(updatedGroup: Group) {
      this.userGroup = updatedGroup;
    },

    handleGroupLeft() {
      this.userGroup = null;
      this.groupUsers = [];
      this.refetchGroups();
    },

    handleMemberRemoved() {
      this.fetchGroupUsers();
    },

    handleRelationUpdated() {
      this.fetchGroupUsers();
    },

    handleInvitationCreated() {
      this.fetchActiveInvitations();
    },

    handleInvitationRevoked() {
      this.fetchActiveInvitations();
    },

    handleUserUpdated() {
      // Оновлення користувача через Vuex
    },

    async handleJoinGroup() {
      try {
        await this.acceptInvitationMutation.mutateAsync({
          invitationCode: this.invitationCode,
          data: {}
        });
        this.showAlert("success", "Ви успішно приєднались до групи");
        this.refetchGroups();
        this.invitationCode = "";
        this.showJoinGroupModal = false;
      } catch (error) {
        console.error("Помилка при приєднанні до групи:", error);
        this.showAlert("danger", "Помилка при приєднанні до групи");
      }
    }
  },
  mounted() {
    if (!this.currentUser) {
      this.$router.push({ name: "login" });
      return;
    }

    this.refetchUserInvitations();
  }
});
</script>

<style scoped>
/* Загальні стилі для профілю */
</style>
