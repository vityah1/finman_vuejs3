<template>
  <!-- Інформація про запрошення користувача -->
  <div v-if="userInvitations && userInvitations.length > 0" class="mb-4">
    <Message severity="info" :closable="false">
      <div class="d-flex justify-content-between align-items-center w-100">
        <div>
          <i class="pi pi-envelope me-2"></i>
          <strong>У вас є запрошення до групи!</strong>
        </div>
        <Button :label="`Переглянути ( ${userInvitations.length} )`" size="small" @click="showInvitationsModal = true" />
      </div>
    </Message>
  </div>

  <!-- Модальне вікно для запрошень -->
  <Dialog v-model:visible="showInvitationsModal" header="Ваші запрошення" :modal="true" :style="{width: '600px'}">
    <div v-if="userInvitations && userInvitations.length > 0">
      <div v-for="invitation in userInvitations" :key="invitation.id" class="invitation-card mb-3 p-3 border rounded">
        <h5>Запрошення до групи: {{ invitation.group?.name }}</h5>
        <p v-if="invitation.group?.description" class="text-muted">{{ invitation.group.description }}</p>

        <div class="d-flex mb-2">
          <span class="text-muted me-2">Від:</span>
          <strong>{{ invitation.creator?.fullname || invitation.creator?.login }}</strong>
        </div>

        <div v-if="invitation.expires" class="d-flex mb-2">
          <span class="text-muted me-2">Дійсне до:</span>
          <strong>{{ formatDate(invitation.expires) }}</strong>
        </div>

        <div class="mt-3">
          <Button label="Прийняти" icon="pi pi-check" severity="success" @click="acceptInvitation(invitation.invitation_code)" :loading="acceptInvitationMutation.isPending.value" />
          <Button label="Ігнорувати" icon="pi pi-times" severity="secondary" outlined class="ms-2" @click="ignoreInvitation(invitation.id)" :loading="ignoreInvitationMutation.isPending.value" />
        </div>
      </div>
    </div>

    <div v-else class="text-center py-3">
      <p class="mb-0">Немає активних запрошень</p>
    </div>

    <template #footer>
      <Button label="Закрити" icon="pi pi-times" text @click="showInvitationsModal = false" />
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { PropType } from 'vue';
import moment from 'moment';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import Message from 'primevue/message';
import {
  useAcceptInvitationApiInvitationsInvitationCodeAcceptPost,
  useIgnoreInvitationApiInvitationsInvitationIdIgnorePost
} from '@/api/invitations/invitations';
import type {
  AcceptInvitationApiInvitationsInvitationCodeAcceptPostBody,
  IgnoreInvitationApiInvitationsInvitationIdIgnorePostBody
} from '@/api/model';

// --- Interfaces ---
interface Invitation {
  id: number;
  invitation_code: string;
  email?: string;
  expires?: string;
  created: string;
  group?: { name?: string; description?: string };
  creator?: { fullname?: string; login?: string };
}

// --- Props & Emits ---
const props = defineProps({
  userInvitations: {
    type: Array as PropType<Invitation[]>,
    default: () => []
  }
});

const emit = defineEmits(['invitation-accepted', 'show-alert']);

// --- API Mutations ---
const acceptInvitationMutation = useAcceptInvitationApiInvitationsInvitationCodeAcceptPost();
const ignoreInvitationMutation = useIgnoreInvitationApiInvitationsInvitationIdIgnorePost();

// --- Component State ---
const showInvitationsModal = ref(false);

// --- Methods ---
const formatDate = (dateString: string | undefined | null): string => {
  if (!dateString) return '';
  return moment(dateString).format("DD.MM.YYYY HH:mm");
};

const acceptInvitation = async (invitationCode: string) => {
  try {
    const acceptData: AcceptInvitationApiInvitationsInvitationCodeAcceptPostBody = {};
    await acceptInvitationMutation.mutateAsync({
      invitationCode,
      data: acceptData
    });
    emit('show-alert', 'success', 'Ви успішно приєднались до групи');
    showInvitationsModal.value = false;
    emit('invitation-accepted');
  } catch (error) {
    console.error('Помилка при приєднанні до групи:', error);
    emit('show-alert', 'danger', 'Помилка при приєднанні до групи');
  }
};

const ignoreInvitation = async (invitationId: number) => {
  try {
    const ignoreData: IgnoreInvitationApiInvitationsInvitationIdIgnorePostBody = {};
    await ignoreInvitationMutation.mutateAsync({
      invitationId,
      data: ignoreData
    });
    emit('show-alert', 'info', 'Запрошення проігноровано');
    emit('invitation-accepted'); // To refetch the invitations list
  } catch (error) {
    console.error('Помилка при ігноруванні запрошення:', error);
    emit('show-alert', 'danger', 'Помилка при ігноруванні запрошення');
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
</style>