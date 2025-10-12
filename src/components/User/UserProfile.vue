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
      @show-invite-modal="handleShowInviteModal"
      @show-alert="showAlert"
    />

    <!-- Компонент активних запрошень -->
    <user-active-invitations
      ref="activeInvitationsComponent"
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
import { defineComponent, ref, computed as vueComputed } from 'vue';

// Імпортуємо хуки Orval для роботи з групами
import {
  useGetGroupsApiGroupsGet,
  useGetGroupUsersApiGroupsGroupIdUsersGet,
  useGetGroupInvitationsApiGroupsGroupIdInvitationsGet
} from "@/api/groups/groups";

// Імпортуємо хуки Orval для роботи з запрошеннями
import {
  useCheckUserInvitationsApiInvitationsGet,
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
    const { data: userInvitationsData, refetch: refetchUserInvitations } = useCheckUserInvitationsApiInvitationsGet();
    const acceptInvitationMutation = useAcceptInvitationApiInvitationsInvitationCodeAcceptPost();

    // Reactive group ID for fetching users and invitations
    const groupId = ref<number | null>(null);

    // Setup queries for group users and invitations
    const groupUsersQuery = useGetGroupUsersApiGroupsGroupIdUsersGet(
      vueComputed(() => groupId.value as number),
      {
        query: {
          enabled: vueComputed(() => groupId.value !== null)
        }
      }
    );

    const groupInvitationsQuery = useGetGroupInvitationsApiGroupsGroupIdInvitationsGet(
      vueComputed(() => groupId.value as number),
      {
        query: {
          enabled: vueComputed(() => groupId.value !== null)
        }
      }
    );

    return {
      groupsData,
      refetchGroups,
      userInvitationsData,
      refetchUserInvitations,
      acceptInvitationMutation,
      groupId,
      groupUsersQuery,
      groupInvitationsQuery
    };
  },
  data() {
    return {
      loading: false,

      // Дані для груп
      userGroup: null as Group | null,

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
      return this.userInvitationsData?.data || [];
    },
    isGroupOwner() {
      if (!this.userGroup) return false;
      return this.userGroup.owner_id === this.currentUser.id;
    },
    groupUsers(): GroupUser[] {
      const response = this.groupUsersQuery?.data;
      console.log('🔍 groupUsers computed:', {
        hasQuery: !!this.groupUsersQuery,
        hasData: !!response,
        responseType: typeof response,
        responseKeys: response ? Object.keys(response) : [],
        dataValue: response,
        isLoading: this.groupUsersQuery?.isLoading,
        error: this.groupUsersQuery?.error
      });

      if (!response) {
        console.log('⚠️ No response');
        return [];
      }

      // TanStack Query returns AxiosResponse, so data is in response.data
      const data = (response as any)?.data;
      console.log('📦 Extracted data:', data, 'isArray:', Array.isArray(data));

      if (!data || !Array.isArray(data)) {
        console.log('⚠️ No array data');
        return [];
      }

      // Response.data is GroupUserResponse[] from Orval
      const users = data.map((user: any) => ({
        ...user,
        // role is already set by backend, but we can override if needed
        role: user.id === this.userGroup?.owner_id ? "owner" : (user.role || "member"),
      } as GroupUser));

      console.log('✅ Mapped users:', users);
      return users;
    },
    filteredGroupUsers() {
      if (!this.userGroup || !this.groupUsers || !this.groupUsers.length) return [];
      return this.groupUsers.filter(user => user.id !== this.currentUser.id);
    },
    activeInvitations(): Invitation[] {
      const response = this.groupInvitationsQuery?.data;
      console.log('🔍 activeInvitations computed:', {
        hasQuery: !!this.groupInvitationsQuery,
        hasData: !!response,
        responseType: typeof response,
        responseKeys: response ? Object.keys(response) : [],
        dataValue: response,
        isLoading: this.groupInvitationsQuery?.isLoading,
        error: this.groupInvitationsQuery?.error
      });

      if (!response) {
        console.log('⚠️ No response');
        return [];
      }

      // TanStack Query returns AxiosResponse, so data is in response.data
      const data = (response as any)?.data;
      console.log('📦 Extracted invitations data:', data, 'isArray:', Array.isArray(data));

      if (!data || !Array.isArray(data)) {
        console.log('⚠️ No array data');
        return [];
      }

      // Response.data is GroupInvitationResponse[] from Orval
      const invitations = data.filter((inv: any) => inv.is_active) as Invitation[];
      console.log('✅ Filtered invitations:', invitations);
      return invitations;
    },
    loadingGroupUsers() {
      return this.groupUsersQuery?.isLoading || false;
    },
    loadingInvitations() {
      return this.groupInvitationsQuery?.isLoading || false;
    }
  },
  watch: {
    groupsData: {
      handler(newData) {
        console.log('📊 groupsData changed:', newData);
        // groupsData is AxiosResponse<GroupResponse[]> from Orval
        if (newData?.data && Array.isArray(newData.data) && newData.data.length > 0) {
          this.userGroup = newData.data[0] as Group;
          // Set groupId to trigger queries
          this.groupId = this.userGroup.id;
          console.log('✅ Set groupId:', this.groupId);
        } else {
          this.userGroup = null;
          this.groupId = null;
          console.log('⚠️ No group data, groupId set to null');
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
      this.refetchGroups();
    },

    handleMemberRemoved() {
      if (this.groupUsersQuery?.refetch) {
        this.groupUsersQuery.refetch();
      }
    },

    handleRelationUpdated() {
      if (this.groupUsersQuery?.refetch) {
        this.groupUsersQuery.refetch();
      }
    },

    handleInvitationCreated() {
      if (this.groupInvitationsQuery?.refetch) {
        this.groupInvitationsQuery.refetch();
      }
    },

    handleInvitationRevoked() {
      if (this.groupInvitationsQuery?.refetch) {
        this.groupInvitationsQuery.refetch();
      }
    },

    handleUserUpdated() {
      // Оновлення користувача через Vuex
    },

    handleShowInviteModal() {
      // Open invite modal in UserActiveInvitations component
      if (this.$refs.activeInvitationsComponent) {
        (this.$refs.activeInvitationsComponent as any).showInviteModal = true;
      }
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
