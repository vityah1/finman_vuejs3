<template>
  <!-- Секція інформації про групу -->
  <div class="card mb-4">
    <div class="card-header d-flex justify-content-between align-items-center">
      <h4 class="mb-0">Моя сімейна група</h4>
      <div v-if="!userGroup">
        <b-button variant="success" @click="showCreateGroupModal = true">
          <i class="fas fa-plus"></i> Створити групу
        </b-button>
      </div>
    </div>

    <div class="card-body">
      <!-- Якщо користувач у групі -->
      <div v-if="userGroup" class="group-info">
        <h5>{{ userGroup.name }}</h5>
        <p class="text-muted">{{ userGroup.description }}</p>

        <div class="d-flex align-items-center mb-3">
          <span class="badge bg-primary me-2">{{ isGroupOwner ? "Власник" : "Учасник" }}</span>
          <div v-if="isGroupOwner" class="ms-auto">
            <b-button size="sm" variant="outline-primary" @click="showEditGroupModal = true">
              <i class="fas fa-edit"></i> Редагувати
            </b-button>
          </div>
          <div v-else class="ms-auto">
            <b-button size="sm" variant="outline-danger" @click="promptLeaveGroup">
              <i class="fas fa-sign-out-alt"></i> Вийти з групи
            </b-button>
          </div>
        </div>
      </div>

      <!-- Якщо користувач не у групі -->
      <div v-else class="text-center py-4">
        <p class="mb-3">Ви ще не є учасником жодної групи</p>
        <b-button variant="outline-primary" @click="$emit('show-join-modal')">
          Приєднатися до існуючої групи
        </b-button>
      </div>
    </div>
  </div>

  <!-- Модальні вікна для створення та редагування групи -->
  <b-modal v-model="showCreateGroupModal" cancel-title="Скасувати" ok-title="Створити" title="Створення сімейної групи" @ok="createGroup">
    <b-form>
      <b-form-group label="Назва групи:" label-for="group-name">
        <b-form-input id="group-name" v-model="newGroup.name" placeholder="Введіть назву групи" required></b-form-input>
      </b-form-group>
      <b-form-group label="Опис:" label-for="group-description">
        <b-form-textarea id="group-description" v-model="newGroup.description" placeholder="Опис групи (необов'язково)"></b-form-textarea>
      </b-form-group>
    </b-form>
  </b-modal>

  <b-modal v-model="showEditGroupModal" cancel-title="Скасувати" ok-title="Зберегти" title="Редагування групи" @ok="updateGroup">
    <b-form>
      <b-form-group label="Назва групи:" label-for="edit-group-name">
        <b-form-input id="edit-group-name" v-model="editingGroup.name" placeholder="Введіть назву групи" required></b-form-input>
      </b-form-group>
      <b-form-group label="Опис:" label-for="edit-group-description">
        <b-form-textarea id="edit-group-description" v-model="editingGroup.description" placeholder="Опис групи"></b-form-textarea>
      </b-form-group>
    </b-form>
  </b-modal>

  <!-- Модальне вікно підтвердження виходу з групи -->
  <b-modal
      v-model="showLeaveConfirmModal"
      id="leave-group-confirm-modal"
      title="Підтвердження дії"
      ok-title="Так, вийти"
      ok-variant="danger"
      cancel-title="Ні"
      @ok="handleLeaveGroupConfirm"
  >
    <p>Ви впевнені, що хочете вийти з групи <strong>{{ userGroup ? userGroup.name : '' }}</strong>?</p>
    <p class="text-muted small">Цю дію не можна буде скасувати.</p>
  </b-modal>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import {
  useCreateGroupApiGroupsPost,
  useUpdateGroupApiGroupsGroupIdPatch,
  useLeaveGroupApiGroupsGroupIdLeavePost
} from '@/api/groups/groups';
import type { GroupCreate, GroupUpdate } from '@/api/model';

interface Group {
  id: number;
  name: string;
  description?: string;
  owner_id: number;
  [key: string]: any;
}

export default defineComponent({
  name: 'UserGroupSection',
  props: {
    userGroup: {
      type: Object as PropType<Group | null>,
      default: null
    },
    isGroupOwner: {
      type: Boolean,
      default: false
    }
  },
  emits: ['group-created', 'group-updated', 'group-left', 'show-alert', 'show-join-modal'],
  setup() {
    const createGroupMutation = useCreateGroupApiGroupsPost();
    const updateGroupMutation = useUpdateGroupApiGroupsGroupIdPatch();
    const leaveGroupMutation = useLeaveGroupApiGroupsGroupIdLeavePost();
    
    return {
      createGroupMutation,
      updateGroupMutation,
      leaveGroupMutation
    };
  },
  data() {
    return {
      showCreateGroupModal: false,
      showEditGroupModal: false,
      showLeaveConfirmModal: false,
      newGroup: {
        name: '',
        description: ''
      },
      editingGroup: {
        name: '',
        description: ''
      }
    };
  },
  watch: {
    userGroup: {
      handler(newGroup) {
        if (newGroup) {
          this.editingGroup = { 
            name: newGroup.name || '',
            description: newGroup.description || ''
          };
        }
      },
      immediate: true
    }
  },
  methods: {
    async createGroup() {
      try {
        const groupData: GroupCreate = {
          name: this.newGroup.name,
          description: this.newGroup.description || undefined
        };

        await this.createGroupMutation.mutateAsync({ data: groupData });
        this.$emit('show-alert', 'success', 'Група успішно створена');
        this.$emit('group-created');
        this.newGroup = { name: '', description: '' };
      } catch (error) {
        console.error('Помилка при створенні групи:', error);
        this.$emit('show-alert', 'danger', 'Помилка при створенні групи');
      }
    },

    async updateGroup() {
      if (!this.userGroup) return;
      
      try {
        const updateData: GroupUpdate = {
          name: this.editingGroup.name,
          description: this.editingGroup.description || undefined
        };

        await this.updateGroupMutation.mutateAsync({ 
          groupId: this.userGroup.id, 
          data: updateData 
        });
        this.$emit('show-alert', 'success', 'Група успішно оновлена');
        this.$emit('group-updated', { ...this.userGroup, ...this.editingGroup });
      } catch (error) {
        console.error('Помилка при оновленні групи:', error);
        this.$emit('show-alert', 'danger', 'Помилка при оновленні групи');
      }
    },

    promptLeaveGroup() {
      this.showLeaveConfirmModal = true;
    },

    async handleLeaveGroupConfirm() {
      if (!this.userGroup) return;

      try {
        await this.leaveGroupMutation.mutateAsync({ groupId: this.userGroup.id });
        this.$emit('show-alert', 'success', 'Ви вийшли з групи');
        this.$emit('group-left');
      } catch (error) {
        console.error('Помилка при виході з групи:', error);
        this.$emit('show-alert', 'danger', 'Помилка при виході з групи');
      }
    }
  }
});
</script>

<style scoped>
.group-info {
  border-left: 4px solid #007bff;
  padding-left: 15px;
}
</style>