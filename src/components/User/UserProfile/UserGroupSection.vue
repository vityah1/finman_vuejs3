<template>
  <!-- Секція інформації про групу -->
  <Card class="mb-4">
    <template #title>
      <div class="flex justify-content-between align-items-center">
        <h4 class="m-0">Моя сімейна група</h4>
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

        <div class="flex align-items-center justify-content-between mb-3">
          <Tag :value="isGroupOwner ? 'Власник' : 'Учасник'" severity="info" />
          <div v-if="isGroupOwner">
            <Button
                label="Редагувати"
                icon="pi pi-pencil"
                size="small"
                outlined
                severity="primary"
                @click="showEditGroupModal = true"
            />
          </div>
          <div v-else>
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
  <Dialog
    v-model:visible="showCreateGroupModal"
    header="Створення сімейної групи"
    :modal="true"
    :style="{width: '540px'}"
  >
    <div class="flex flex-col gap-4 py-2">
      <div class="field-group">
        <label for="group-name" class="field-label">Назва групи</label>
        <InputText
          id="group-name"
          v-model="newGroup.name"
          placeholder="Наприклад: Сім'я Іваненків"
          required
          autofocus
          class="w-full"
        />
      </div>

      <div class="field-group">
        <label for="group-description" class="field-label">
          Опис
          <span class="optional-label">(необов'язково)</span>
        </label>
        <Textarea
          id="group-description"
          v-model="newGroup.description"
          placeholder="Короткий опис групи"
          rows="3"
          auto-resize
          class="w-full"
        />
      </div>
    </div>

    <template #footer>
      <div class="flex justify-content-end gap-3">
        <Button
          label="Скасувати"
          icon="pi pi-times"
          severity="secondary"
          outlined
          @click="showCreateGroupModal = false"
        />
        <Button
          label="Створити"
          icon="pi pi-check"
          severity="success"
          @click="createGroup"
          :loading="createGroupMutation.isPending.value"
        />
      </div>
    </template>
  </Dialog>

  <Dialog
    v-model:visible="showEditGroupModal"
    header="Редагування групи"
    :modal="true"
    :style="{width: '540px'}"
  >
    <div class="flex flex-col gap-4 py-2">
      <div class="field-group">
        <label for="edit-group-name" class="field-label">Назва групи</label>
        <InputText
          id="edit-group-name"
          v-model="editingGroup.name"
          placeholder="Наприклад: Сім'я Іваненків"
          required
          autofocus
          class="w-full"
        />
      </div>

      <div class="field-group">
        <label for="edit-group-description" class="field-label">
          Опис
          <span class="optional-label">(необов'язково)</span>
        </label>
        <Textarea
          id="edit-group-description"
          v-model="editingGroup.description"
          placeholder="Короткий опис групи"
          rows="3"
          auto-resize
          class="w-full"
        />
      </div>
    </div>

    <template #footer>
      <div class="flex justify-content-end gap-3">
        <Button
          label="Скасувати"
          icon="pi pi-times"
          severity="secondary"
          outlined
          @click="showEditGroupModal = false"
        />
        <Button
          label="Зберегти"
          icon="pi pi-check"
          severity="success"
          @click="updateGroup"
          :loading="updateGroupMutation.isPending.value"
        />
      </div>
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

/* Form field styling */
.field-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.field-label {
  display: block;
  font-weight: 600;
  font-size: 0.95rem;
  color: #2c3e50;
  margin-bottom: 0.25rem;
}

.optional-label {
  font-weight: 400;
  color: #6c757d;
  font-size: 0.875rem;
  margin-left: 0.25rem;
}
</style>
