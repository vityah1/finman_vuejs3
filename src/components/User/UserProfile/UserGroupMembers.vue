<template>
  <Card class="mb-4">
    <template #title>
      <div class="d-flex justify-content-between align-items-center">
        <h4 class="mb-0">Учасники групи</h4>
        <div v-if="isGroupOwner">
          <Button label="Запросити" icon="pi pi-user-plus" severity="success" @click="emit('show-invite-modal')" />
        </div>
      </div>
    </template>
    <template #content>
      <div v-if="loading" class="text-center py-4">
        <ProgressSpinner />
        <p class="mt-2">Завантаження учасників...</p>
      </div>

      <div v-else-if="!groupUsers || groupUsers.length === 0" class="text-center py-4">
        <p>У групі поки немає учасників</p>
      </div>

      <div v-else class="group-members">
        <div v-for="user in groupUsers" :key="user.id" class="user-card p-3 mb-2 border rounded d-flex align-items-center">
          <Avatar icon="pi pi-user" size="large" shape="circle" class="me-3" />
          <div class="flex-grow-1">
            <h5 class="mb-1">{{ user.fullname || user.login }}</h5>
            <div class="d-flex align-items-center flex-wrap gap-2">
              <Tag :value="getFormattedRole(user)" :severity="user.role === 'owner' ? 'danger' : 'info'" />
              <Tag v-if="user.relation_type" :value="getFormattedRelation(user)" severity="success" />
            </div>
            <div class="user-details small text-muted mt-2">
              <div v-if="user.email"><i class="pi pi-envelope me-1"></i> {{ user.email }}</div>
              <div v-if="user.phone"><i class="pi pi-phone me-1"></i> {{ user.phone }}</div>
            </div>
          </div>
          <div v-if="isGroupOwner && user.id !== currentUserId" class="ms-auto">
            <Button icon="pi pi-ellipsis-v" text rounded @click="(event) => toggleUserMenu(event, user)" />
          </div>
        </div>
      </div>
    </template>
  </Card>

  <!-- User Action Menu (outside the loop) -->
  <Menu ref="userActionMenu" :model="userMenuItems" :popup="true" />

  <!-- Модальне вікно для встановлення відносин -->
  <Dialog v-if="selectedUser" v-model:visible="showSetRelationModal" :header="`Встановити відносини: ${selectedUser.fullname || selectedUser.login}`" :modal="true" :style="{width: '450px'}">
    <div class="p-fluid">
      <div class="p-field">
        <label for="relation-type">Тип відносин</label>
        <Dropdown id="relation-type" v-model="newRelationType" :options="relationOptions" optionLabel="label" optionValue="value" placeholder="Оберіть тип" />
      </div>
    </div>
    <template #footer>
      <Button label="Скасувати" icon="pi pi-times" text @click="showSetRelationModal = false"/>
      <Button label="Зберегти" icon="pi pi-check" @click="updateUserRelation" :loading="updateUserRelationMutation.isPending.value"/>
    </template>
  </Dialog>

  <!-- Модальне вікно підтвердження видалення учасника -->
  <Dialog v-model:visible="showRemoveConfirmModal" header="Підтвердження дії" :modal="true" :style="{width: '350px'}">
    <p>Ви впевнені, що хочете видалити користувача <strong>{{ userToRemove ? (userToRemove.fullname || userToRemove.login) : '' }}</strong> з групи?</p>
    <template #footer>
      <Button label="Ні" icon="pi pi-times" text @click="showRemoveConfirmModal = false"/>
      <Button label="Так, видалити" icon="pi pi-check" severity="danger" @click="handleRemoveUserConfirm" :loading="removeUserMutation.isPending.value"/>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { PropType } from 'vue';
import Card from 'primevue/card';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import Dropdown from 'primevue/dropdown';
import Menu from 'primevue/menu';
import Avatar from 'primevue/avatar';
import Tag from 'primevue/tag';
import ProgressSpinner from 'primevue/progressspinner';
import InputText from "primevue/inputtext";
import {
  useUpdateUserRelationApiGroupsGroupIdUsersUserIdPatch,
  useRemoveUserFromGroupApiGroupsGroupIdUsersUserIdToRemoveDelete
} from '@/api/groups/groups';
import type { GroupUserUpdate } from '@/api/model';

// --- Interfaces ---
interface Group {
  id: number;
  name: string;
  description?: string;
  owner_id: number;
}

interface GroupUser {
  id: number;
  login: string;
  fullname?: string;
  email?: string;
  phone?: string;
  role?: string;
  relation_type?: string;
}

// --- Props & Emits ---
const props = defineProps({
  userGroup: { type: Object as PropType<Group>, required: true },
  groupUsers: { type: Array as PropType<GroupUser[]>, default: () => [] },
  isGroupOwner: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
  currentUserId: { type: Number, required: true }
});

const emit = defineEmits(['member-removed', 'relation-updated', 'show-alert', 'show-invite-modal']);

// --- API Mutations ---
const updateUserRelationMutation = useUpdateUserRelationApiGroupsGroupIdUsersUserIdPatch();
const removeUserMutation = useRemoveUserFromGroupApiGroupsGroupIdUsersUserIdToRemoveDelete();

// --- Component State ---
const showSetRelationModal = ref(false);
const selectedUser = ref<GroupUser | null>(null);
const newRelationType = ref('');

const showRemoveConfirmModal = ref(false);
const userToRemove = ref<GroupUser | null>(null);

const userActionMenu = ref();
const userMenuItems = ref([
  {
    label: 'Встановити відносини',
    icon: 'pi pi-user-edit',
    command: () => openSetRelationModal()
  },
  {
    label: 'Видалити з групи',
    icon: 'pi pi-user-minus',
    command: () => promptRemoveUser()
  }
]);

const relationOptions = ref([
  { label: 'Не вказано', value: '' },
  { label: 'Чоловік/Дружина', value: 'spouse' },
  { label: 'Дитина', value: 'child' },
  { label: 'Батько/Мати', value: 'parent' },
  { label: 'Родич', value: 'relative' },
  { label: 'Друг', value: 'friend' }
]);

// --- Methods ---
const getFormattedRole = (user: GroupUser): string => {
  const roleMap: Record<string, string> = {
    'owner': 'Власник',
    'member': 'Учасник',
  };
  return roleMap[user.role || ''] || user.role || '';
};

const getFormattedRelation = (user: GroupUser): string => {
  if (!user.relation_type) return '';
  const option = relationOptions.value.find(opt => opt.value === user.relation_type);
  return option ? option.label : user.relation_type;
};

const toggleUserMenu = (event: Event, user: GroupUser) => {
  selectedUser.value = user;
  userToRemove.value = user;
  userActionMenu.value.toggle(event);
};

const openSetRelationModal = () => {
  if (!selectedUser.value) return;
  newRelationType.value = selectedUser.value.relation_type || '';
  showSetRelationModal.value = true;
};

const updateUserRelation = async () => {
  if (!props.userGroup || !selectedUser.value) return;

  try {
    const updateData: GroupUserUpdate = {
      relation_type: newRelationType.value
    };
    await updateUserRelationMutation.mutateAsync({
      groupId: props.userGroup.id,
      userId: selectedUser.value.id,
      data: updateData
    });
    emit('show-alert', 'success', 'Відносини оновлено');
    emit('relation-updated');
    showSetRelationModal.value = false;
  } catch (error) {
    console.error('Помилка при оновленні відносин:', error);
    emit('show-alert', 'danger', 'Помилка при оновленні відносин');
  }
};

const promptRemoveUser = () => {
  if (!userToRemove.value) return;
  showRemoveConfirmModal.value = true;
};

const handleRemoveUserConfirm = async () => {
  if (!props.userGroup || !userToRemove.value) return;

  try {
    await removeUserMutation.mutateAsync({
      groupId: props.userGroup.id,
      userIdToRemove: userToRemove.value.id
    });
    emit('show-alert', 'success', 'Користувача видалено з групи');
    emit('member-removed');
    showRemoveConfirmModal.value = false;
  } catch (error) {
    console.error('Помилка при видаленні користувача:', error);
    emit('show-alert', 'danger', 'Помилка при видаленні користувача');
  } finally {
    userToRemove.value = null;
  }
};

</script>

<style scoped>
.user-card {
  transition: all 0.2s ease;
}

.user-card:hover {
  background-color: #f8f9fa;
}

.gap-2 {
  gap: 0.5rem;
}
</style>
