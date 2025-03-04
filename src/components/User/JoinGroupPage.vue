<template>
  <div class="container">
    <alert-component ref="myAlert"></alert-component>

    <div v-if="loading" class="text-center my-5">
      <b-spinner variant="primary"></b-spinner>
      <p class="mt-3">Перевірка запрошення...</p>
    </div>

    <div v-else-if="error" class="text-center my-5">
      <div class="alert alert-danger">
        <i class="fas fa-exclamation-circle fa-2x mb-3"></i>
        <h4>Помилка запрошення</h4>
        <p>{{ error }}</p>
        <router-link :to="{ name: 'profile' }" class="btn btn-primary mt-3">
          Повернутися до профілю
        </router-link>
      </div>
    </div>

    <div v-else-if="invitationInfo" class="card my-5 border-0 shadow">
      <div class="card-header bg-primary text-white">
        <h3 class="mb-0">Запрошення до групи</h3>
      </div>

      <div class="card-body p-4">
        <div class="text-center mb-4">
          <i class="fas fa-users fa-3x text-primary mb-3"></i>
          <h4>Вас запрошено приєднатися до сімейної групи</h4>
        </div>

        <div class="group-info mb-4">
          <div class="row">
            <div class="col-md-4 text-muted">Назва групи:</div>
            <div class="col-md-8 fw-bold">{{ invitationInfo.group.name }}</div>
          </div>

          <div class="row mt-2" v-if="invitationInfo.group.description">
            <div class="col-md-4 text-muted">Опис:</div>
            <div class="col-md-8">{{ invitationInfo.group.description }}</div>
          </div>

          <div class="row mt-2">
            <div class="col-md-4 text-muted">Власник групи:</div>
            <div class="col-md-8">{{ invitationInfo.creator.fullname || invitationInfo.creator.login }}</div>
          </div>

          <div class="row mt-2" v-if="invitationInfo.expires">
            <div class="col-md-4 text-muted">Дійсне до:</div>
            <div class="col-md-8">{{ formatDate(invitationInfo.expires) }}</div>
          </div>
        </div>

        <div class="text-center mt-4">
          <b-button variant="success" size="lg" @click="acceptInvitation" :disabled="joining">
            <b-spinner small v-if="joining"></b-spinner>
            {{ joining ? 'Приєднання...' : 'Приєднатися до групи' }}
          </b-button>

          <div class="mt-3">
            <router-link :to="{ name: 'profile' }" class="text-muted">
              Повернутися до профілю
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import GroupService from '@/services/GroupService';
import moment from 'moment';

export default {
  name: 'JoinGroupPage',
  data() {
    return {
      loading: true,
      joining: false,
      error: null,
      invitationInfo: null
    };
  },
  computed: {
    invitationCode() {
      return this.$route.params.code;
    }
  },
  methods: {
    formatDate(dateString) {
      return moment(dateString).format('DD.MM.YYYY HH:mm');
    },

    async checkInvitation() {
      this.loading = true;
      this.error = null;

      try {
        const response = await GroupService.checkInvitation(this.invitationCode);
        this.invitationInfo = response.data;

        // Перевіряємо, чи не прострочене запрошення
        if (this.invitationInfo.expires && moment(this.invitationInfo.expires).isBefore(moment())) {
          this.error = 'Термін дії запрошення закінчився';
          this.invitationInfo = null;
        }
      } catch (error) {
        console.error('Помилка при перевірці запрошення:', error);
        this.error = 'Запрошення недійсне або його термін закінчився';
      } finally {
        this.loading = false;
      }
    },

    async acceptInvitation() {
      this.joining = true;

      try {
        await GroupService.acceptInvitation(this.invitationCode);
        this.$refs.myAlert.showAlert('success', 'Ви успішно приєднались до групи');
        setTimeout(() => {
          this.$router.push({ name: 'profile' });
        }, 1500);
      } catch (error) {
        console.error('Помилка при приєднанні до групи:', error);
        this.$refs.myAlert.showAlert('danger', 'Помилка при приєднанні до групи');
        this.joining = false;
      }
    }
  },
  mounted() {
    if (!this.$store.state.auth.user) {
      this.$router.push({
        name: 'login',
        query: { redirect: this.$route.fullPath }
      });
      return;
    }

    this.checkInvitation();
  }
};
</script>

<style scoped>
.group-info {
  background-color: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
}
</style>