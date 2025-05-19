<template>
  <!-- Приєднання до групи -->
  <b-modal v-model="showJoinModal" cancel-title="Скасувати" ok-title="Приєднатися" title="Приєднатися до групи" @ok="joinGroup">
    <b-form>
      <b-form-group label="Код запрошення:" label-for="invitation-code">
        <b-form-input id="invitation-code" v-model="invitationCode" placeholder="Введіть код запрошення" required></b-form-input>
      </b-form-group>
    </b-form>
  </b-modal>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import {
  useAcceptInvitationApiInvitationsInvitationCodeAcceptPost
} from '@/api/invitations/invitations';
import type { AcceptInvitationApiInvitationsInvitationCodeAcceptPostBody } from '@/api/model';

export default defineComponent({
  name: 'GroupModals',
  props: {
    showJoinModal: {
      type: Boolean,
      default: false
    }
  },
  emits: ['join-group', 'close-join-modal', 'show-alert'],
  setup() {
    const acceptInvitationMutation = useAcceptInvitationApiInvitationsInvitationCodeAcceptPost();
    
    return {
      acceptInvitationMutation
    };
  },
  data() {
    return {
      invitationCode: ''
    };
  },
  methods: {
    async joinGroup() {
      try {
        const acceptData: AcceptInvitationApiInvitationsInvitationCodeAcceptPostBody = {};
        await this.acceptInvitationMutation.mutateAsync({
          invitationCode: this.invitationCode,
          data: acceptData
        });
        this.$emit('show-alert', 'success', 'Ви успішно приєднались до групи');
        this.$emit('join-group');
        this.invitationCode = '';
        this.$emit('close-join-modal');
      } catch (error) {
        console.error('Помилка при приєднанні до групи:', error);
        this.$emit('show-alert', 'danger', 'Помилка при приєднанні до групи');
      }
    }
  }
});
</script>
