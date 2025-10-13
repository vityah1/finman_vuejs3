<template>
  <Card class="mb-4">
    <template #title>
      <div class="flex justify-content-between align-items-center">
        <h4 class="m-0">Активні запрошення</h4>
        <Button label="Створити запрошення" icon="pi pi-user-plus" severity="success" @click="showInviteModal = true" />
      </div>
    </template>
    <template #content>
      <div v-if="loading" class="text-center py-4">
        <ProgressSpinner />
        <p class="mt-2">Завантаження запрошень...</p>
      </div>

      <div v-else-if="!activeInvitations || activeInvitations.length === 0" class="text-center py-4">
        <p>Немає активних запрошень</p>
      </div>

      <div v-else class="invitations-list">
        <div v-for="invitation in activeInvitations" :key="invitation.id" class="invitation-card p-3 mb-2 border rounded flex align-items-center justify-content-between">
          <div class="flex-grow-1">
            <div class="code mb-1">
              <strong>Код:</strong> {{ invitation.invitation_code }}
            </div>
            <div v-if="invitation.email" class="email">
              <strong>Email:</strong> {{ invitation.email }}
            </div>
            <div class="created small text-muted">
              Створено: {{ formatDate(invitation.created) }}
            </div>
            <div v-if="invitation.expires" class="expires small text-muted">
              Діє до: {{ formatDate(invitation.expires) }}
            </div>
          </div>
          <div class="flex gap-2">
            <Button icon="pi pi-copy" text rounded @click="copyInvitationLink(invitation)" />
            <Button icon="pi pi-times" severity="danger" text rounded @click="promptRevokeInvitation(invitation)" />
          </div>
        </div>
      </div>
    </template>
  </Card>

  <!-- Модальне вікно для створення запрошення -->
  <Dialog v-model:visible="showInviteModal" header="Запросити до групи" :modal="true" :style="{width: '450px'}">
    <div class="p-fluid">
      <div class="p-field mb-3">
        <label for="invite-email">Електронна пошта (необов'язково)</label>
        <InputText id="invite-email" v-model="newInvitation.email" type="email" />
      </div>
      <div class="p-field">
        <label for="invite-expires">Термін дії</label>
        <Dropdown id="invite-expires" v-model="newInvitation.expiresOption" :options="expiresOptions" optionLabel="label" optionValue="value" />
      </div>
    </div>
    <template #footer>
      <Button label="Скасувати" icon="pi pi-times" text @click="showInviteModal = false"/>
      <Button label="Створити" icon="pi pi-check" @click="createInvitation" :loading="createInvitationMutation.isPending.value"/>
    </template>
  </Dialog>

  <!-- Інформація про створене запрошення -->
  <Dialog v-model:visible="showInvitationInfoModal" header="Інформація про запрошення" :modal="true" :style="{width: '500px'}" v-if="lastCreatedInvitation">
    <p>Запрошення успішно створено!</p>
    <div class="p-fluid mt-3">
      <div class="p-field mb-3">
        <label for="invitation-code">Код запрошення</label>
        <InputGroup>
          <InputText id="invitation-code" readonly :value="lastCreatedInvitation?.invitation_code || ''" />
          <Button icon="pi pi-copy" @click="copyToClipboard(lastCreatedInvitation?.invitation_code || '')" />
        </InputGroup>
      </div>
      <div class="p-field">
        <label for="invitation-link">Посилання</label>
        <InputGroup>
          <InputText id="invitation-link" readonly :value="invitationLink" />
          <Button icon="pi pi-copy" @click="copyToClipboard(invitationLink)" />
        </InputGroup>
      </div>
    </div>
    <div class="mt-3 small">
      Поділіться цим кодом або посиланням з користувачем, щоб він міг приєднатись до вашої групи.
      <div v-if="lastCreatedInvitation?.email" class="text-muted mt-2">
        Запрошення буде пов'язане з користувачем, який має email: {{ lastCreatedInvitation.email }}
      </div>
    </div>
    <template #footer>
      <Button label="OK" @click="showInvitationInfoModal = false" autofocus/>
    </template>
  </Dialog>

  <!-- Модальне вікно підтвердження скасування запрошення -->
  <Dialog v-model:visible="showRevokeConfirmModal" header="Підтвердження дії" :modal="true" :style="{width: '350px'}">
    <p>Ви впевнені, що хочете скасувати це запрошення?</p>
    <div v-if="invitationToRevoke">
      <strong>Код:</strong> {{ invitationToRevoke.invitation_code }}<br>
      <strong v-if="invitationToRevoke.email">Email:</strong> {{ invitationToRevoke.email }}
    </div>
    <template #footer>
      <Button label="Ні" icon="pi pi-times" text @click="showRevokeConfirmModal = false"/>
      <Button label="Так, скасувати" icon="pi pi-check" severity="danger" @click="handleRevokeConfirm" :loading="deleteInvitationMutation.isPending.value"/>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import type { PropType } from 'vue';
import moment from 'moment';
import Card from 'primevue/card';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import Dropdown from 'primevue/dropdown';
import ProgressSpinner from 'primevue/progressspinner';
import InputGroup from 'primevue/inputgroup';
import {
  useCreateGroupInvitationApiGroupsGroupIdInvitationsPost
} from '@/api/groups/groups';
import {
  useDeleteInvitationApiInvitationsInvitationIdDelete
} from '@/api/invitations/invitations';
import type { GroupInvitationCreate, GroupInvitationResponse } from '@/api/model';

// --- Interfaces ---
interface Group {
  id: number;
  name: string;
  description?: string;
  owner_id: number;
}

interface Invitation {
  id: number;
  invitation_code: string;
  email?: string;
  expires?: string;
  created: string;
}

// --- Props & Emits ---
const props = defineProps({
  userGroup: { type: Object as PropType<Group>, required: true },
  activeInvitations: { type: Array as PropType<Invitation[]>, default: () => [] },
  loading: { type: Boolean, default: false }
});

const emit = defineEmits(['invitation-created', 'invitation-revoked', 'show-alert']);

// --- API Mutations ---
const createInvitationMutation = useCreateGroupInvitationApiGroupsGroupIdInvitationsPost();
const deleteInvitationMutation = useDeleteInvitationApiInvitationsInvitationIdDelete();

// --- Component State ---
const showInviteModal = ref(false);
const showInvitationInfoModal = ref(false);
const showRevokeConfirmModal = ref(false);
const invitationToRevoke = ref<Invitation | null>(null);
const lastCreatedInvitation = ref<Invitation | null>(null);

const newInvitation = ref({
  email: '',
  expiresOption: 'week'
});

const expiresOptions = ref([
  { label: 'Без обмеження', value: 'never' },
  { label: '1 день', value: 'day' },
  { label: '1 тиждень', value: 'week' },
  { label: '1 місяць', value: 'month' }
]);

const expiresMapping: Record<string, string | null> = {
  'never': null,
  'day': moment().add(1, 'days').toISOString(),
  'week': moment().add(7, 'days').toISOString(),
  'month': moment().add(1, 'month').toISOString(),
};

// --- Computed ---
const invitationLink = computed(() => {
  if (!lastCreatedInvitation.value?.invitation_code) return '';
  return `${window.location.origin}/join-group/${lastCreatedInvitation.value.invitation_code}`;
});

// --- Methods ---
const formatDate = (dateString: string | undefined | null): string => {
  if (!dateString) return '';
  return moment(dateString).format("DD.MM.YYYY HH:mm");
};

const createInvitation = async () => {
  if (!props.userGroup) return;

  try {
    const invitationData: GroupInvitationCreate = {
      email: newInvitation.value.email || undefined,
      expires: expiresMapping[newInvitation.value.expiresOption]
    };

    const response = await createInvitationMutation.mutateAsync({
      groupId: props.userGroup.id,
      data: invitationData
    });

    emit('show-alert', 'success', 'Запрошення створено');
    lastCreatedInvitation.value = response.data as Invitation;
    showInvitationInfoModal.value = true;
    emit('invitation-created');
    newInvitation.value = { email: '', expiresOption: 'week' };
    showInviteModal.value = false;
  } catch (error) {
    console.error('Помилка при створенні запрошення:', error);
    emit('show-alert', 'danger', 'Помилка при створенні запрошення');
  }
};

const copyToClipboard = (text: string) => {
  if (!text) return;
  navigator.clipboard.writeText(text);
  emit('show-alert', 'success', 'Скопійовано до буфера обміну');
};

const copyInvitationLink = (invitation: Invitation) => {
  const inviteUrl = `${window.location.origin}/join-group/${invitation.invitation_code}`;
  copyToClipboard(inviteUrl);
};

const promptRevokeInvitation = (invitation: Invitation) => {
  invitationToRevoke.value = invitation;
  showRevokeConfirmModal.value = true;
};

const handleRevokeConfirm = async () => {
  if (!invitationToRevoke.value) return;

  try {
    await deleteInvitationMutation.mutateAsync({ invitationId: invitationToRevoke.value.id });
    emit('show-alert', 'success', 'Запрошення скасовано');
    emit('invitation-revoked');
    showRevokeConfirmModal.value = false;
  } catch (error) {
    console.error('Помилка при скасуванні запрошення:', error);
    emit('show-alert', 'danger', 'Помилка при скасуванні запрошення');
  } finally {
    invitationToRevoke.value = null;
  }
};

</script>

<style scoped>
.invitation-card {
  transition: all 0.2s ease;
}

.invitation-card:hover {
  background-color: #f8f9fa;
}

.gap-2 {
    gap: 0.5rem;
}
</style>
