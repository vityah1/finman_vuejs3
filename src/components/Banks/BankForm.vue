<template>
	<div class="container">
		<alert-component ref="myAlert"></alert-component>

		<!-- Індикатор завантаження -->
		<div v-if="isLoading" class="loading-overlay">
			<div class="loading-content">
				<div class="spinner-border text-primary" role="status">
					<span class="visually-hidden">Завантаження...</span>
				</div>
				<p class="mt-2 mb-0">Обробка файлу...</p>
			</div>
		</div>

		<b-form v-model="showModal" :title="`Upload ${selectedBankType} file`">
			<template #modal-header>
				<h5 class="modal-title text-danger">
					Upload {{ selectedBankType }} xlsx file statements...
				</h5>
			</template>
			<template #default>
				<b-form v-if="currentUser">
					<div class="form-group">
						<label>{{ currentUser.login }}</label>
					</div>
					<div class="form-group">
						<label>Select bank type:</label>
						<div class="bank-selector mb-2">
							<div
								class="bank-option"
								:class="{ active: selectedBankType === 'revolut', disabled: isLoading }"
								@click="!isLoading && (selectedBankType = 'revolut')"
							>
								<i class="fas fa-euro-sign"></i> Revolut
							</div>
							<div
								class="bank-option"
								:class="{ active: selectedBankType === 'wise', disabled: isLoading }"
								@click="!isLoading && (selectedBankType = 'wise')"
							>
								<i class="fas fa-euro-sign"></i> Wise
							</div>
							<div
								class="bank-option"
								:class="{ active: selectedBankType === 'p24', disabled: isLoading }"
								@click="!isLoading && (selectedBankType = 'p24')"
							>
								<img src="/p24.png" alt="P24" style="width: 25px; margin-right: 5px;" /> P24
							</div>
							<div
								class="bank-option"
								:class="{ active: selectedBankType === 'pumb', disabled: isLoading }"
								@click="!isLoading && (selectedBankType = 'pumb')"
							>
								<img
									src="https://cdn.brandfetch.io/id_oJO480-/w/820/h/322/theme/dark/logo.png?c=1bxid64Mup7aczewSAYMX&t=1742726827527"
									alt="Логотип ПУМБ"
									style="width: 75px; margin-right: 5px;">
							</div>
							<div
								class="bank-option"
								:class="{ active: selectedBankType === 'erste', disabled: isLoading }"
								@click="!isLoading && (selectedBankType = 'erste')"
							>
								<i class="fas fa-euro-sign"></i> ERSTE Bank
							</div>
						</div>
						<label>Select file from <strong>{{ selectedBankType.charAt(0).toUpperCase() + selectedBankType.slice(1) }}:</strong></label>
						<input
							type="file"
							class="form-control"
							id="amount"
							@change="handleFileChange"
							:disabled="isLoading"
						/>
						<select
							class="form-control mt-2"
							v-model="selectedOption"
							:disabled="isLoading"
						>
							<option value="import">Import</option>
							<option value="show">Show</option>
						</select>
						<b-button
							variant="primary"
							class="mt-2"
							@click="handleButtonClick"
							:disabled="isLoading"
						>
							<span v-if="isLoading" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
							{{ isLoading ? 'Обробка...' : 'Submit' }}
						</b-button>
					</div>
				</b-form>
				<div></div>
			</template>
		</b-form>
		<b-table-simple>
			<b-tbody v-if="(payments.length > 0)">
				<b-tr v-for="(payment, index) in paymentsWithCategories" :key="index">
					<b-td>
						<span> {{ $moment(payment.rdate).format("DD.MMM") }} </span>
					</b-td>
					<b-td>{{ payment.category_id }}</b-td>
					<b-td>{{ payment.category_name }}</b-td>
					<b-td>{{ payment.mydesc }}</b-td>
					<b-td>{{ payment.currency_amount.toLocaleString() }}</b-td>
					<b-td><span v-if="payment.sql" style="color: green;">✔</span><span v-else style="color: red;">✘</span>
					</b-td>
				</b-tr>
			</b-tbody>
		</b-table-simple>
		<div v-if="(payments.length == 0)">...</div>
	</div>
</template>

<script lang="ts">
import { ref, computed, onMounted, defineComponent } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import { useImportBankStatementApiImportPost } from '@/api/default/default';
import type { BodyImportBankStatementApiImportPost } from '@/api/model/bodyImportBankStatementApiImportPost';
import type { BodyImportBankStatementApiImportPostMode } from '@/api/model/bodyImportBankStatementApiImportPostMode';
import type { HTTPValidationError } from '@/api/model/hTTPValidationError';
import type { AxiosError } from 'axios';
import { getErrorMessage, logError } from '@/utils/errorHandler';

interface Payment {
	id: number;
	amount: number;
	description?: string;
	mydesc?: string;
	category_id?: number;
	rdate: string;
	sql?: boolean;
	[key: string]: any;
}

interface PaymentWithCategory extends Payment {
	category_name: string;
}

interface AlertComponent {
	showAlert: (type: string, message: string) => void;
	[key: string]: any;
}

export default defineComponent({
	name: "BankForm",
	setup() {
		const store = useStore();
		const router = useRouter();
		const myAlert = ref<AlertComponent | null>(null);

		const user = ref<string | undefined>(router.currentRoute.value.query.user as string | undefined);
		const selectedOption = ref<string>("show");
		const selectedBankType = ref<string>("revolut");
		const file = ref<File | null>(null);
		const payments = ref<Payment[]>([]);
		const paymentsWithCategories = ref<PaymentWithCategory[]>([]);
		const showModal = ref<boolean>(true);

		const currentUser = computed(() => store.state.auth.user);



		// Використовуємо Orval-генерований хук для завантаження файлу
		const uploadMutation = useImportBankStatementApiImportPost({
			mutation: {
				onSuccess: (response) => {
					payments.value = response.data as Payment[];
					paymentsWithCategories.value = payments.value.map((payment: Payment) => {
						const category = store.state.sprs.categories.find(
							(category) => category.id === payment.category_id
						);
						return {
							...payment,
							category_name: category ? category.name : "Unknown Category",
						};
					});
					if (myAlert.value) {
						myAlert.value.showAlert("success", "Файл успішно завантажено та оброблено");
					}
				},
				onError: (error: AxiosError<HTTPValidationError | any>) => {
					logError(error, "BankForm file upload");
					const errorMessage = getErrorMessage(error, "Помилка завантаження файлу");
					if (myAlert.value) {
						myAlert.value.showAlert("danger", errorMessage);
					}
				}
			}
		});

		const handleFileChange = (event: Event) => {
			const target = event.target as HTMLInputElement;
			if (target.files && target.files.length > 0) {
				file.value = target.files[0];
				console.log("File selected:", file.value);
			}
		};

		const handleButtonClick = (): void => {
			if (!file.value) {
				if (myAlert.value) {
					myAlert.value.showAlert("danger", "Файл не вибрано");
				}
				return;
			}

			const requestData: BodyImportBankStatementApiImportPost = {
				file: file.value,
				mode: selectedBankType.value as BodyImportBankStatementApiImportPostMode,
				action: selectedOption.value
			};

			uploadMutation.mutate({ data: requestData });
		};

		onMounted((): void => {
			if (!currentUser.value) {
				router.push({ name: "login" });
			}
		});

		return {
			myAlert,
			user,
			selectedOption,
			selectedBankType,
			file,
			payments,
			paymentsWithCategories,
			currentUser,
			showModal,
			handleFileChange,
			handleButtonClick,
			isLoading: computed<boolean>(() => uploadMutation.isPending.value)
		};
	},
})
</script>

<style scoped>
.bank-selector {
	display: flex;
	flex-wrap: wrap;
	gap: 10px;
	margin-bottom: 15px;
}

.bank-option {
	padding: 10px 15px;
	border: 1px solid #ccc;
	border-radius: 5px;
	cursor: pointer;
	display: flex;
	align-items: center;
	transition: all 0.2s ease;
}

.bank-option:hover {
	background-color: #f5f5f5;
}

.bank-option.active {
	background-color: #e7f4ff;
	border-color: #007bff;
	color: #007bff;
}

.bank-option.disabled {
	opacity: 0.6;
	cursor: not-allowed;
	pointer-events: none;
}

.bank-option.disabled:hover {
	background-color: inherit;
}

.loading-overlay {
	position: fixed;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	background-color: rgba(0, 0, 0, 0.5);
	display: flex;
	justify-content: center;
	align-items: center;
	z-index: 9999;
}

.loading-content {
	background-color: white;
	padding: 30px;
	border-radius: 10px;
	text-align: center;
	box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.loading-content p {
	color: #6c757d;
	font-weight: 500;
}
</style>