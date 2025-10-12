<template>
  <Dialog :visible="props.visible" @update:visible="(value) => emit('update:visible', value)" header="Приєднатися до групи" :modal="true" :style="{width: '450px'}">
    <div class="p-fluid">
      <div class="p-field">
        <label for="invitation-code">Код запрошення</label>
        <InputText id="invitation-code" v-model="invitationCode" required autofocus />
      </div>
    </div>
    <template #footer>
      <Button label="Скасувати" icon="pi pi-times" text @click="closeModal"/>
      <Button label="Приєднатися" icon="pi pi-check" @click="joinGroup" :loading="acceptInvitationMutation.isPending.value"/>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import Dialog from 'primevue/dialog';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import {
  useAcceptInvitationApiInvitationsInvitationCodeAcceptPost
} from '@/api/invitations/invitations';
import type { AcceptInvitationApiInvitationsInvitationCodeAcceptPostBody } from '@/api/model/acceptInvitationApiInvitationsInvitationCodeAcceptPostBody';

// --- Props & Emits ---
const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['update:visible', 'join-group', 'show-alert']);

// --- API Mutations ---
const acceptInvitationMutation = useAcceptInvitationApiInvitationsInvitationCodeAcceptPost();

// --- Component State ---
const invitationCode = ref('');

// --- Methods ---
const closeModal = () => {
  emit('update:visible', false);
};

const joinGroup = async () => {
  if (!invitationCode.value) {
    emit('show-alert', 'warn', 'Введіть код запрошення');
    return;
  }
  try {
    const acceptData: AcceptInvitationApiInvitationsInvitationCodeAcceptPostBody = {};
    await acceptInvitationMutation.mutateAsync({
      invitationCode: invitationCode.value,
      data: acceptData
    });
    emit('show-alert', 'success', 'Ви успішно приєднались до групи');
    emit('join-group');
    invitationCode.value = '';
    closeModal();
  } catch (error) {
    console.error('Помилка при приєднанні до групи:', error);
    emit('show-alert', 'danger', 'Помилка при приєднанні до групи');
  }
};

</script>