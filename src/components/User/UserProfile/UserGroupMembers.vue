<template>
  <div class="card mb-4">
    <div class="card-header d-flex justify-content-between align-items-center">
      <h4 class="mb-0">Учасники групи</h4>
      <div v-if="isGroupOwner">
        <b-button variant="success" @click="$emit('show-invite-modal')">
          <i class="fas fa-user-plus"></i> Запросити
        </b-button>
      </div>
    </div>

    <div class="card-body">
      <div v-if="loading" class="text-center py-4">
        <b-spinner variant="primary"></b-spinner>
        <p class="mt-2">Завантаження учасників...</p>
      </div>

      <div v-else-if="!groupUsers || groupUsers.length === 0" class="text-center py-4">
        <p>У групі поки немає учасників</p>
      </div>

      <div v-else class="group-members">
        <div v-for="user in groupUsers" :key="user.id" class="user-card p-3 mb-2 border rounded d-flex align-items-center">
          <div class="avatar me-3">
            <i class="fas fa-user-circle fa-2x"></i>
          </div>
          <div class="flex-grow-1">
            <h5 class="mb-1">{{ user.fullname || user.login }}</h5>
            <div class="d-flex align-items-center">
              <span :class="getRoleBadgeClass(user)" class="badge">
                {{ getFormattedRole(user) }}
              </span>
              <span v-if="user.relation_type" class="badge bg-info ms-2">
                {{ getFormattedRelation(user) }}
              </span>
            </div>
            <div class="user-details small text-muted mt-1">
              <div v-if="user.email"><i class="fas fa-envelope me-1"></i> {{ user.email }}</div>
              <div v-if="user.phone"><i class="fas fa-phone me-1"></i> {{ user.phone }}</div>
            </div>
          </div>
          <div v-if="isGroupOwner && user.id !== currentUserId" class="actions">
            <b-dropdown no-caret right toggle-class="text-decoration-none p-0" variant="link">
              <template #button-content>
                <i class="fas fa-ellipsis-v"></i>
              </template>
              <b-dropdown-item @click="openSetRelationModal(user)">
                <i class="fas fa-user-tag"></i> Встановити відносини
              </b-dropdown-item>
              <b-dropdown-item variant="danger" @click="confirmRemoveUser(user)">
                <i class="fas fa-user-times text-danger"></i> Видалити з групи
              </b-dropdown-item>
            </b-dropdown>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Модальне вікно для встановлення відносин -->
  <b-modal v-if="selectedUser" v-model="showSetRelationModal" :title="`Встановити відносини: ${selectedUser.fullname || selectedUser.login}`" cancel-title="Скасувати" ok-title="Зберегти" @ok="updateUserRelation">
    <b-form>
      <b-form-group label="Тип відносин:" label-for="relation-type">
        <b-form-select id="relation-type" v-model="newRelationType">
          <option value="">Не вказано</option>
          <option value="spouse">Чоловік/Дружина</option>
          <option value="child">Дитина</option>
          <option value="parent">Батько/Мати</option>
          <option value="relative">Родич</option>
          <option value="friend">Друг</option>
        </b-form-select>
      </b-form-group>
    </b-form>
  </b-modal>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import {
  useUpdateUserRelationApiGroupsGroupIdUsersUserIdPatch,
  useRemoveUserFromGroupApiGroupsGroupIdUsersUserIdToRemoveDelete
} from '@/api/groups/groups';
import type { GroupUserUpdate } from '@/api/model';

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

export default defineComponent({
  name: 'UserGroupMembers',
  props: {
    userGroup: {
      type: Object as PropType<Group>,
      required: true
    },
    groupUsers: {
      type: Array as PropType<GroupUser[]>,
      default: () => []
    },
    isGroupOwner: {
      type: Boolean,
      default: false
    },
    loading: {
      type: Boolean,
      default: false
    },
    currentUserId: {
      type: Number,
      required: true
    }
  },
  emits: ['member-removed', 'relation-updated', 'show-alert', 'show-invite-modal'],
  setup() {
    const updateUserRelationMutation = useUpdateUserRelationApiGroupsGroupIdUsersUserIdPatch();
    const removeUserMutation = useRemoveUserFromGroupApiGroupsGroupIdUsersUserIdToRemoveDelete();
    
    return {
      updateUserRelationMutation,
      removeUserMutation
    };
  },
  data() {
    return {
      showSetRelationModal: false,
      selectedUser: null as GroupUser | null,
      newRelationType: ''
    };
  },
  methods: {
    getRoleBadgeClass(user: GroupUser) {
      return user.role === 'owner' ? 'bg-danger' : 'bg-secondary';
    },

    getFormattedRole(user: GroupUser) {
      const roleMap: Record<string, string> = {
        'owner': 'Власник',
        'member': 'Учасник',
      };
      return roleMap[user.role || ''] || user.role;
    },

    getFormattedRelation(user: GroupUser) {
      if (!user.relation_type) return '';
      const relationMap: Record<string, string> = {
        'spouse': 'Чоловік/Дружина',
        'child': 'Дитина',
        'parent': 'Батько/Мати',
        'relative': 'Родич',
        'friend': 'Друг',
      };
      return relationMap[user.relation_type] || user.relation_type;
    },

    openSetRelationModal(user: GroupUser) {
      this.selectedUser = user;
      this.newRelationType = user.relation_type || '';
      this.showSetRelationModal = true;
    },

    async updateUserRelation() {
      if (!this.userGroup || !this.selectedUser) return;
      
      try {
        const updateData: GroupUserUpdate = {
          relation_type: this.newRelationType
        };

        await this.updateUserRelationMutation.mutateAsync({
          groupId: this.userGroup.id,
          userId: this.selectedUser.id,
          data: updateData
        });

        this.$emit('show-alert', 'success', 'Відносини оновлено');
        this.$emit('relation-updated');
      } catch (error) {
        console.error('Помилка при оновленні відносин:', error);
        this.$emit('show-alert', 'danger', 'Помилка при оновленні відносин');
      }
    },

    async confirmRemoveUser(user: GroupUser) {
      if (!this.userGroup) return;
      
      if (confirm(`Видалити користувача ${user.fullname || user.login} з групи?`)) {
        try {
          await this.removeUserMutation.mutateAsync({
            groupId: this.userGroup.id,
            userIdToRemove: user.id
          });

          this.$emit('show-alert', 'success', 'Користувача видалено з групи');
          this.$emit('member-removed');
        } catch (error) {
          console.error('Помилка при видаленні користувача:', error);
          this.$emit('show-alert', 'danger', 'Помилка при видаленні користувача');
        }
      }
    }
  }
});
</script>

<style scoped>
.user-card {
  transition: all 0.2s ease;
}

.user-card:hover {
  background-color: #f8f9fa;
}
</style>
