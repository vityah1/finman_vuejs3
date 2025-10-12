<template>
  <!-- Секція інформації про групу -->
  <Card class="mb-4">
    <template #title>
      <div class="d-flex justify-content-between align-items-center">
        <h4 class="mb-0">Моя сімейна група</h4>
        <div v-if="!userGroup">
          <Button
              label="Створити групу"
              icon="pi pi-plus"
              severity="success"
              @click="showCreateGroupModal = true"
          />
        </div>
      </div>
    </template>
    <template #content>
      <!-- Якщо користувач у групі -->
      <div v-if="userGroup" class="group-info">
        <h5>{{ userGroup.name }}</h5>
        <p class="text-muted">{{ userGroup.description }}</p>

        <div class="d-flex align-items-center mb-3">
          <Tag :value="isGroupOwner ? 'Власник' : 'Учасник'" severity="info" />
          <div v-if="isGroupOwner" class="ms-auto">
            <Button
                label="Редагувати"
                icon="pi pi-pencil"
                size="small"
                outlined
                severity="primary"
                @click="showEditGroupModal = true"
            />
          </div>
          <div v-else class="ms-auto">
            <Button
                label="Вийти з групи"
                icon="pi pi-sign-out"
                size="small"
                outlined
                severity="danger"
                @click="promptLeaveGroup"
            />
          </div>
        </div>
      </div>

      <!-- Якщо користувач не у групі -->
      <div v-else class="text-center py-4">
        <p class="mb-3">Ви ще не є учасником жодної групи</p>
        <Button
            label="Приєднатися до існуючої групи"
            outlined
            severity="primary"
            @click="emit('show-join-modal')"
        />
      </div>
    </template>
  </Card>

  <!-- Модальні вікна для створення та редагування групи -->
  <Dialog v-model:visible="showCreateGroupModal" header="Створення сімейної групи" :modal="true" :style="{width: '450px'}">
    <div class="p-fluid">
      <div class="p-field mb-3">
        <label for="group-name">Назва групи</label>
        <InputText id="group-name" v-model="newGroup.name" required autofocus />
      </div>
      <div class="p-field">
        <label for="group-description">Опис</label>
        <Textarea id="group-description" v-model="newGroup.description" rows="3" />
      </div>
    </div>
    <template #footer>
      <Button label="Скасувати" icon="pi pi-times" text @click="showCreateGroupModal = false"/>
      <Button label="Створити" icon="pi pi-check" @click="createGroup" :loading="createGroupMutation.isPending.value"/>
    </template>
  </Dialog>

  <Dialog v-model:visible="showEditGroupModal" header="Редагування групи" :modal="true" :style="{width: '450px'}">
    <div class="p-fluid">
      <div class="p-field mb-3">
        <label for="edit-group-name">Назва групи</label>
        <InputText id="edit-group-name" v-model="editingGroup.name" required autofocus />
      </div>
      <div class="p-field">
        <label for="edit-group-description">Опис</label>
        <Textarea id="edit-group-description" v-model="editingGroup.description" rows="3" />
      </div>
    </div>
    <template #footer>
      <Button label="Скасувати" icon="pi pi-times" text @click="showEditGroupModal = false"/>
      <Button label="Зберегти" icon="pi pi-check" @click="updateGroup" :loading="updateGroupMutation.isPending.value"/>
    </template>
  </Dialog>

  <!-- Модальне вікно підтвердження виходу з групи -->
  <Dialog v-model:visible="showLeaveConfirmModal" header="Підтвердження дії" :modal="true" :style="{width: '350px'}">
    <p>Ви впевнені, що хочете вийти з групи <strong>{{ userGroup ? userGroup.name : '' }}</strong>?</p>
    <p class="text-muted small">Цю дію не можна буде скасувати.</p>
    <template #footer>
      <Button label="Ні" icon="pi pi-times" text @click="showLeaveConfirmModal = false"/>
      <Button label="Так, вийти" icon="pi pi-check" severity="danger" @click="handleLeaveGroupConfirm" :loading="leaveGroupMutation.isPending.value"/>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import type { PropType } from 'vue';
import Card from 'primevue/card';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import Textarea from 'primevue/textarea';
import Tag from 'primevue/tag';
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

const props = defineProps({
  userGroup: {
    type: Object as PropType<Group | null>,
    default: null
  },
  isGroupOwner: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['group-created', 'group-updated', 'group-left', 'show-alert', 'show-join-modal']);

// API Mutations
const createGroupMutation = useCreateGroupApiGroupsPost();
const updateGroupMutation = useUpdateGroupApiGroupsGroupIdPatch();
const leaveGroupMutation = useLeaveGroupApiGroupsGroupIdLeavePost();

// Component State
const showCreateGroupModal = ref(false);
const showEditGroupModal = ref(false);
const showLeaveConfirmModal = ref(false);

const newGroup = ref({
  name: '',
  description: ''
});

const editingGroup = ref({
  name: '',
  description: ''
});

// Watchers
watch(() => props.userGroup, (newVal) => {
  if (newVal) {
    editingGroup.value = {
      name: newVal.name || '',
      description: newVal.description || ''
    };
  }
}, { immediate: true });

// Methods
const createGroup = async () => {
  try {
    const groupData: GroupCreate = {
      name: newGroup.value.name,
      description: newGroup.value.description || undefined
    };

    await createGroupMutation.mutateAsync({ data: groupData });
    emit('show-alert', 'success', 'Група успішно створена');
    emit('group-created');
    newGroup.value = { name: '', description: '' };
    showCreateGroupModal.value = false;
  } catch (error) {
    console.error('Помилка при створенні групи:', error);
    emit('show-alert', 'danger', 'Помилка при створенні групи');
  }
};

const updateGroup = async () => {
  if (!props.userGroup) return;

  try {
    const updateData: GroupUpdate = {
      name: editingGroup.value.name,
      description: editingGroup.value.description || undefined
    };

    const updatedGroup = await updateGroupMutation.mutateAsync({
      groupId: props.userGroup.id,
      data: updateData
    });
    emit('show-alert', 'success', 'Група успішно оновлена');
    emit('group-updated', updatedGroup.data);
    showEditGroupModal.value = false;
  } catch (error) {
    console.error('Помилка при оновленні групи:', error);
    emit('show-alert', 'danger', 'Помилка при оновленні групи');
  }
};

const promptLeaveGroup = () => {
  showLeaveConfirmModal.value = true;
};

const handleLeaveGroupConfirm = async () => {
  if (!props.userGroup) return;

  try {
    await leaveGroupMutation.mutateAsync({ groupId: props.userGroup.id });
    emit('show-alert', 'success', 'Ви вийшли з групи');
    emit('group-left');
    showLeaveConfirmModal.value = false;
  } catch (error) {
    console.error('Помилка при виході з групи:', error);
    emit('show-alert', 'danger', 'Помилка при виході з групи');
  }
};

</script>

<style scoped>
.group-info {
  border-left: 4px solid var(--primary-color);
  padding-left: 15px;
}
</style>
