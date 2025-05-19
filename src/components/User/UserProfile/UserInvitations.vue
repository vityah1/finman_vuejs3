<template>
  <!-- Інформація про запрошення користувача -->
  <div v-if="userInvitations && userInvitations.length > 0" class="alert alert-info mb-4">
    <div class="d-flex justify-content-between align-items-center">
      <div>
        <i class="fas fa-envelope-open-text me-2"></i>
        <strong>У вас є запрошення до групи!</strong>
      </div>
      <button class="btn btn-sm btn-primary" @click="showInvitationsModal = true">
        Переглянути запрошення ({{ userInvitations.length }})
      </button>
    </div>
  </div>

  <!-- Модальне вікно для запрошень -->
  <b-modal v-model="showInvitationsModal" title="Ваші запрошення" size="lg" scrollable>
    <div v-for="invitation in userInvitations" :key="invitation.id" class="invitation-card mb-4 p-3 border rounded">
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
        <b-button variant="success" @click="acceptInvitation(invitation.invitation_code)">
          Прийняти запрошення
        </b-button>
        <b-button variant="outline-secondary" class="ms-2" @click="ignoreInvitation(invitation.id)">
          Ігнорувати
        </b-button>
      </div>
    </div>

    <div v-if="userInvitations && userInvitations.length === 0" class="text-center py-3">
      <p class="mb-0">Немає активних запрошень</p>
    </div>

    <template #modal-footer>
      <b-button variant="secondary" @click="showInvitationsModal = false">Закрити</b-button>
    </template>
  </b-modal>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import moment from 'moment';
import {
  useAcceptInvitationApiInvitationsInvitationCodeAcceptPost,
  useIgnoreInvitationApiInvitationsInvitationIdIgnorePost
} from '@/api/invitations/invitations';
import type { 
  AcceptInvitationApiInvitationsInvitationCodeAcceptPostBody,
  IgnoreInvitationApiInvitationsInvitationIdIgnorePostBody
} from '@/api/model';

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
  name: 'UserInvitations',
  props: {
    userInvitations: {
      type: Array as PropType<Invitation[]>,
      default: () => []
    }
  },
  emits: ['invitation-accepted', 'show-alert'],
  setup() {
    const acceptInvitationMutation = useAcceptInvitationApiInvitationsInvitationCodeAcceptPost();
    const ignoreInvitationMutation = useIgnoreInvitationApiInvitationsInvitationIdIgnorePost();
    
    return {
      acceptInvitationMutation,
      ignoreInvitationMutation
    };
  },
  data() {
    return {
      showInvitationsModal: false
    };
  },
  methods: {
    formatDate(dateString: string | undefined | null) {
      if (!dateString) return '';
      return moment(dateString).format("DD.MM.YYYY HH:mm");
    },

    async acceptInvitation(invitationCode: string) {
      try {
        const acceptData: AcceptInvitationApiInvitationsInvitationCodeAcceptPostBody = {};
        await this.acceptInvitationMutation.mutateAsync({
          invitationCode,
          data: acceptData
        });
        this.$emit('show-alert', 'success', 'Ви успішно приєднались до групи');
        this.showInvitationsModal = false;
        this.$emit('invitation-accepted');
      } catch (error) {
        console.error('Помилка при приєднанні до групи:', error);
        this.$emit('show-alert', 'danger', 'Помилка при приєднанні до групи');
      }
    },

    async ignoreInvitation(invitationId: number) {
      try {
        const ignoreData: IgnoreInvitationApiInvitationsInvitationIdIgnorePostBody = {};
        await this.ignoreInvitationMutation.mutateAsync({
          invitationId,
          data: ignoreData
        });
        this.$emit('show-alert', 'success', 'Запрошення проігноровано');
        this.$emit('invitation-accepted'); // Оновлює список запрошень
      } catch (error) {
        console.error('Помилка при ігноруванні запрошення:', error);
        this.$emit('show-alert', 'danger', 'Помилка при ігноруванні запрошення');
      }
    }
  }
});
</script>

<style scoped>
.invitation-card {
  transition: all 0.2s ease;
}

.invitation-card:hover {
  background-color: #f8f9fa;
}
</style>
