<template>
  <div class="container mt-4">
    <alert-component ref="myAlert"></alert-component>

    <div v-if="isLoading" class="text-center my-5">
      <ProgressSpinner />
      <p class="mt-3">Перевірка запрошення...</p>
    </div>

    <div v-else-if="error" class="my-5">
      <Message severity="error" :closable="false">
        <h4>Помилка запрошення</h4>
        <p>{{ error.message }}</p>
        <Button label="Повернутися до профілю" @click="router.push({ name: 'profile' })" class="mt-3" />
      </Message>
    </div>

    <div v-else-if="invitationInfo">
      <Card class="my-5 shadow-2">
        <template #header>
          <div class="p-3 bg-primary text-white">
            <h3 class="m-0">Запрошення до групи</h3>
          </div>
        </template>
        <template #title>
          <div class="text-center">
            <i class="pi pi-users" style="font-size: 2.5rem"></i>
            <h4 class="mt-2">Вас запрошено приєднатися до сімейної групи</h4>
          </div>
        </template>
        <template #content>
          <div class="group-info p-3 mb-4">
            <div class="flex justify-content-between py-2 border-bottom-1 border-200">
              <span class="text-muted">Назва групи:</span>
              <span class="font-bold">{{ invitationInfo.group.name }}</span>
            </div>
            <div v-if="invitationInfo.group.description" class="flex justify-content-between py-2 border-bottom-1 border-200">
              <span class="text-muted">Опис:</span>
              <span>{{ invitationInfo.group.description }}</span>
            </div>
            <div class="flex justify-content-between py-2 border-bottom-1 border-200">
              <span class="text-muted">Власник групи:</span>
              <span>{{ invitationInfo.creator.fullname || invitationInfo.creator.login }}</span>
            </div>
            <div v-if="invitationInfo.expires" class="flex justify-content-between py-2">
              <span class="text-muted">Дійсне до:</span>
              <span>{{ formatDate(invitationInfo.expires) }}</span>
            </div>
          </div>

          <div class="text-center mt-4">
            <Button
                :label="acceptInvitationMutation.isPending.value ? 'Приєднання...' : 'Приєднатися до групи'"
                icon="pi pi-check"
                severity="success"
                size="large"
                @click="acceptInvitation"
                :loading="acceptInvitationMutation.isPending.value"
            />
            <div class="mt-3">
              <router-link :to="{ name: 'profile' }" class="text-muted">
                Повернутися до профілю
              </router-link>
            </div>
          </div>
        </template>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useStore } from 'vuex';
import moment from 'moment';
import Button from 'primevue/button';
import Card from 'primevue/card';
import ProgressSpinner from 'primevue/progressspinner';
import Message from 'primevue/message';
import AlertComponent from '@/components/AlertComponent.vue';
import {
  useGetInvitationInfoApiInvitationsInvitationCodeGet,
  useAcceptInvitationApiInvitationsInvitationCodeAcceptPost
} from '@/api/invitations/invitations';
import type { AcceptInvitationApiInvitationsInvitationCodeAcceptPostBody, GroupInvitationResponse } from "@/api/model";

const route = useRoute();
const router = useRouter();
const store = useStore();

const myAlert = ref<InstanceType<typeof AlertComponent> | null>(null);
const invitationCode = computed(() => route.params.code as string);

// --- API Calls ---
const { data: invitationInfo, error, isLoading } = useGetInvitationInfoApiInvitationsInvitationCodeGet(
    invitationCode,
    {
      query: {
        enabled: computed(() => !!invitationCode.value),
        retry: false,
      }
    }
);

const acceptInvitationMutation = useAcceptInvitationApiInvitationsInvitationCodeAcceptPost();

// --- Methods ---
const formatDate = (dateString: string) => {
  return moment(dateString).format('DD.MM.YYYY HH:mm');
};

const acceptInvitation = async () => {
  try {
    await acceptInvitationMutation.mutateAsync({ invitationCode: invitationCode.value, data: {} });
    myAlert.value?.showAlert('success', 'Ви успішно приєднались до групи');
    setTimeout(() => {
      router.push({ name: 'profile' });
    }, 1500);
  } catch (err) {
    console.error('Помилка при приєднанні до групи:', err);
    myAlert.value?.showAlert('danger', 'Помилка при приєднанні до групи');
  }
};

// --- Lifecycle ---
onMounted(() => {
  if (!store.state.auth.user) {
    router.push({
      name: 'login',
      query: { redirect: route.fullPath }
    });
  }
});

</script>

<style scoped>
.group-info {
  background-color: #f8f9fa;
  border-radius: 8px;
}
</style>
