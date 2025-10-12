<template>
  <div class="card mb-4">
    <div class="card-header d-flex justify-content-between align-items-center">
      <h4 class="mb-0">Активні запрошення</h4>
      <b-button variant="success" @click="showInviteModal = true">
        <i class="fas fa-user-plus"></i> Створити запрошення
      </b-button>
    </div>

    <div class="card-body">
      <div v-if="loading" class="text-center py-4">
        <b-spinner variant="primary"></b-spinner>
        <p class="mt-2">Завантаження запрошень...</p>
      </div>

      <div v-else-if="!activeInvitations || activeInvitations.length === 0" class="text-center py-4">
        <p>Немає активних запрошень</p>
      </div>

      <div v-else class="invitations-list">
        <div v-for="invitation in activeInvitations" :key="invitation.id" class="invitation-card p-3 mb-2 border rounded d-flex align-items-center">
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
          <div class="actions">
            <b-button size="sm" variant="outline-secondary" @click="copyInvitationLink(invitation)">
              <i class="fas fa-copy"></i>
            </b-button>
            <b-button class="ms-2" size="sm" variant="outline-danger" @click="promptRevokeInvitation(invitation)">
              <i class="fas fa-times"></i>
            </b-button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Модальне вікно для створення запрошення -->
  <b-modal v-model="showInviteModal" cancel-title="Скасувати" ok-title="Створити запрошення" title="Запросити до групи" @ok="createInvitation">
    <b-form>
      <b-form-group label="Електронна пошта (необов'язково):" label-for="invite-email">
        <b-form-input id="invite-email" v-model="newInvitation.email" placeholder="Введіть email (необов'язково)" type="email"></b-form-input>
      </b-form-group>
      <b-form-group label="Термін дії:" label-for="invite-expires">
        <b-form-select id="invite-expires" v-model="newInvitation.expiresOption">
          <option value="never">Без обмеження</option>
          <option value="day">1 день</option>
          <option value="week">1 тиждень</option>
          <option value="month">1 місяць</option>
        </b-form-select>
      </b-form-group>
    </b-form>
  </b-modal>

  <!-- Інформація про створене запрошення -->
  <b-modal v-model="showInvitationInfoModal" title="Інформація про запрошення" ok-only v-if="lastCreatedInvitation">
    <p>Запрошення успішно створено!</p>

    <div class="invitation-details mt-3">
      <div class="form-group">
        <label for="invitation-code"><strong>Код запрошення:</strong></label>
        <div class="input-group">
          <input id="invitation-code" class="form-control" type="text" readonly :value="lastCreatedInvitation?.invitation_code || ''">
          <div class="input-group-append">
            <button class="btn btn-outline-secondary" @click="copyToClipboard(lastCreatedInvitation?.invitation_code || '')">
              <i class="fas fa-copy"></i>
            </button>
          </div>
        </div>
      </div>

      <div class="form-group mt-3">
        <label for="invitation-link"><strong>Посилання:</strong></label>
        <div class="input-group">
          <input id="invitation-link" class="form-control" type="text" readonly :value="invitationLink">
          <div class="input-group-append">
            <button class="btn btn-outline-secondary" @click="copyToClipboard(invitationLink)">
              <i class="fas fa-copy"></i>
            </button>
          </div>
        </div>
      </div>

      <div class="mt-3 small">
        Поділіться цим кодом або посиланням з користувачем, щоб він міг приєднатись до вашої групи.
        <div v-if="lastCreatedInvitation?.email" class="text-muted mt-2">
          Запрошення буде пов'язане з користувачем, який має email: {{ lastCreatedInvitation.email }}
        </div>
      </div>
    </div>
  </b-modal>
  
  <!-- Модальне вікно підтвердження скасування запрошення -->
  <b-modal
      v-model="showRevokeConfirmModal"
      id="revoke-confirm-modal"
      title="Підтвердження дії"
      ok-title="Так, скасувати"
      ok-variant="danger"
      cancel-title="Ні"
      @ok="handleRevokeConfirm"
  >
    <p>Ви впевнені, що хочете скасувати це запрошення?</p>
    <div v-if="invitationToRevoke">
      <strong>Код:</strong> {{ invitationToRevoke.invitation_code }}<br>
      <strong v-if="invitationToRevoke.email">Email:</strong> {{ invitationToRevoke.email }}
    </div>
  </b-modal>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import moment from 'moment';
import {
  useCreateGroupInvitationApiGroupsGroupIdInvitationsPost
} from '@/api/groups/groups';
import {
  useDeleteInvitationApiInvitationsInvitationIdDelete
} from '@/api/invitations/invitations';
import type { GroupInvitationCreate } from '@/api/model/groupInvitationCreate';

interface Group {
  id: number;
  name: string;
  description?: string;
  owner_id: number;
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
  name: 'UserActiveInvitations',
  props: {
    userGroup: {
      type: Object as PropType<Group>,
      required: true
    },
    activeInvitations: {
      type: Array as PropType<Invitation[]>,
      default: () => []
    },
    loading: {
      type: Boolean,
      default: false
    }
  },
  emits: ['invitation-created', 'invitation-revoked', 'show-alert'],
  setup() {
    const createInvitationMutation = useCreateGroupInvitationApiGroupsGroupIdInvitationsPost();
    const deleteInvitationMutation = useDeleteInvitationApiInvitationsInvitationIdDelete();
    
    return {
      createInvitationMutation,
      deleteInvitationMutation
    };
  },
  data() {
    return {
      showInviteModal: false,
      showInvitationInfoModal: false,
      showRevokeConfirmModal: false,
      invitationToRevoke: null as Invitation | null,
      lastCreatedInvitation: null as Invitation | null,
      newInvitation: {
        email: '',
        expiresOption: 'week'
      },
      expiresMapping: {
        'never': null,
        'day': moment().add(1, 'days').toISOString(),
        'week': moment().add(7, 'days').toISOString(),
        'month': moment().add(1, 'month').toISOString(),
      } as Record<string, string | null>
    };
  },
  computed: {
    invitationLink() {
      if (!this.lastCreatedInvitation || !this.lastCreatedInvitation.invitation_code) return '';
      return `${window.location.origin}/join-group/${this.lastCreatedInvitation.invitation_code}`;
    }
  },
  methods: {
    formatDate(dateString: string | undefined | null) {
      if (!dateString) return '';
      return moment(dateString).format("DD.MM.YYYY HH:mm");
    },

    async createInvitation() {
      if (!this.userGroup) return;
      
      try {
        const invitationData: GroupInvitationCreate = {
          email: this.newInvitation.email || undefined,
          expires: this.expiresMapping[this.newInvitation.expiresOption]
        };

        const response = await this.createInvitationMutation.mutateAsync({
          groupId: this.userGroup.id,
          data: invitationData
        });

        this.$emit('show-alert', 'success', 'Запрошення створено');
        this.lastCreatedInvitation = (response as any).data;
        this.showInvitationInfoModal = true;
        this.$emit('invitation-created');
        this.newInvitation = { email: '', expiresOption: 'week' };
      } catch (error) {
        console.error('Помилка при створенні запрошення:', error);
        this.$emit('show-alert', 'danger', 'Помилка при створенні запрошення');
      }
    },

    copyToClipboard(text: string) {
      if (!text) return;
      navigator.clipboard.writeText(text);
      this.$emit('show-alert', 'success', 'Скопійовано до буфера обміну');
    },

    copyInvitationLink(invitation: Invitation) {
      const inviteUrl = `${window.location.origin}/join-group/${invitation.invitation_code}`;
      this.copyToClipboard(inviteUrl);
    },

    promptRevokeInvitation(invitation: Invitation) {
      this.invitationToRevoke = invitation;
      this.showRevokeConfirmModal = true;
    },

    async handleRevokeConfirm() {
      if (!this.invitationToRevoke) return;

      try {
        await this.deleteInvitationMutation.mutateAsync({ invitationId: this.invitationToRevoke.id });
        this.$emit('show-alert', 'success', 'Запрошення скасовано');
        this.$emit('invitation-revoked');
      } catch (error) {
        console.error('Помилка при скасуванні запрошення:', error);
        this.$emit('show-alert', 'danger', 'Помилка при скасуванні запрошення');
      } finally {
        this.invitationToRevoke = null;
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