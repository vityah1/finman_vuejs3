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
						
						<!-- Підказки для кожного банку -->
						<div v-if="selectedBankType" class="alert alert-info mt-3 mb-3">
							<h6 class="alert-heading"><i class="fas fa-info-circle me-2"></i>Як отримати виписку:</h6>
							<div v-if="selectedBankType === 'revolut'">
								<ol class="mb-0">
									<li>Відкрийте додаток Revolut</li>
									<li>Перейдіть в Accounts → виберіть рахунок</li>
									<li>Натисніть More → Statement</li>
									<li>Виберіть період та формат Excel</li>
									<li>Завантажте файл</li>
								</ol>
							</div>
							<div v-else-if="selectedBankType === 'wise'">
								<ol class="mb-0">
									<li>Зайдіть в Wise</li>
									<li>Перейдіть в рахунок</li>
									<li>Натисніть три крапки зверху справа</li>
									<li>Виберіть "Statements and reports"</li>
									<li>Натисніть "Statement"</li>
									<li>Задайте період і тип файлу (CSV або Excel)</li>
								</ol>
							</div>
							<div v-else-if="selectedBankType === 'p24'">
								<ol class="mb-0">
									<li>Увійдіть в Приват24</li>
									<li>Перейдіть в "Усі виписки"</li>
									<li>Виберіть картку та період</li>
									<li>Завантажте виписку в форматі XLS/XLSX</li>
								</ol>
							</div>
							<div v-else-if="selectedBankType === 'pumb'">
								<ol class="mb-0">
									<li>Відкрийте додаток ПУМБ</li>
									<li>Перейдіть до потрібної картки</li>
									<li>Натисніть три крапки справа зверху</li>
									<li>Виберіть "Сформувати виписку"</li>
									<li>Вкажіть період та натисніть "Поділитись"</li>
									<li>Збережіть отриманий PDF файл</li>
								</ol>
								<small class="text-muted">Підтримуються PDF виписки з додатку ПУМБ</small>
							</div>
							<div v-else-if="selectedBankType === 'erste'">
								<ol class="mb-0">
									<li>Увійдіть в George (Erste Bank)</li>
									<li>Перейдіть в Accounts → Transaction history</li>
									<li>Виберіть рахунок та період</li>
									<li>Експортуйте в форматі PDF</li>
								</ol>
								<small class="text-muted">Автоматична конвертація EUR → UAH за курсом НБУ</small>
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
					<b-td v-if="selectedOption === 'show'">
						<b-button 
							size="sm" 
							variant="outline-primary" 
							@click="openCategoryRuleModal(payment)"
							:disabled="isLoading"
						>
							<i class="fas fa-tag"></i>
						</b-button>
					</b-td>
				</b-tr>
			</b-tbody>
		</b-table-simple>
		<div v-if="(payments.length == 0)">...</div>
		
		<!-- Модальне вікно для створення правила категоризації -->
		<b-modal v-model="showCategoryRuleModal" title="Створити правило категоризації" @ok="saveCategoryRule">
			<div v-if="selectedPaymentForRule" class="category-rule-form">
				<div class="form-group">
					<label><strong>Опис транзакції:</strong></label>
					<input 
						type="text" 
						class="form-control" 
						v-model="categoryRuleForm.description"
						placeholder="Введіть опис або його частину для правила"
					/>
					<small class="text-muted">Можете редагувати опис для точнішого правила (наприклад, залишити тільки частину)</small>
				</div>
				
				<div class="form-group mt-3">
					<label><strong>Категорія для присвоєння:</strong></label>
					<select v-model="categoryRuleForm.categoryId" class="form-select" required>
						<option disabled value="">Оберіть категорію...</option>
						<option v-for="category in formattedCategories" :value="category.id" :key="category.id">
							{{ category.name }}
						</option>
					</select>
				</div>
			</div>
		</b-modal>
	</div>
</template>

<script lang="ts">
import { ref, computed, onMounted, defineComponent, nextTick } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import { useImportBankStatementApiImportPost } from '@/api/default/default';
import type { BodyImportBankStatementApiImportPost } from '@/api/model/bodyImportBankStatementApiImportPost';
import type { BodyImportBankStatementApiImportPostMode } from '@/api/model/bodyImportBankStatementApiImportPostMode';
import type { HTTPValidationError } from '@/api/model/hTTPValidationError';
import type { AxiosError } from 'axios';
import { getErrorMessage, logError } from '@/utils/errorHandler';
import ConfigService from '@/services/ConfigService';
import { useGetCategoriesApiCategoriesGet } from '@/api/categories/categories';

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
		const showCategoryRuleModal = ref<boolean>(false);
		const selectedPaymentForRule = ref<Payment | null>(null);
		const categoryRuleForm = ref({
			description: '',
			categoryId: ''
		});

		const currentUser = computed(() => store.state.auth.user);
		
		// Використовуємо Orval хук для завантаження категорій
		const { data: categoriesData } = useGetCategoriesApiCategoriesGet();



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
					console.log("Error response data:", error.response?.data);
					const errorMessage = getErrorMessage(error, "Помилка завантаження файлу");
					console.log("Extracted error message:", errorMessage);
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

		// Функція для форматування категорій з ієрархією
		const formatCategories = (categories: any[], parentId: number | null = null, prefix = ''): any[] => {
			if (!Array.isArray(categories)) {
				return [];
			}
			
			return categories.reduce((acc, category) => {
				if ((category.parent_id === parentId) || (parentId === null && !category.parent_id)) {
					acc.push({
						id: category.id,
						name: prefix + category.name
					});
					const children = formatCategories(categories, category.id, prefix + '--');
					acc = acc.concat(children);
				}
				return acc;
			}, []);
		};

		// Computed property для форматованих категорій
		const formattedCategories = computed(() => {
			const categoriesArray = categoriesData.value?.data || [];
			if (!Array.isArray(categoriesArray) || categoriesArray.length === 0) {
				return [];
			}
			return formatCategories(categoriesArray);
		});

		// Відкрити модальне вікно для створення правила категоризації
		const openCategoryRuleModal = (payment: Payment) => {
			selectedPaymentForRule.value = payment;
			categoryRuleForm.value.description = payment.mydesc || '';
			categoryRuleForm.value.categoryId = payment.category_id?.toString() || '';
			showCategoryRuleModal.value = true;
		};

		// Зберегти правило категоризації
		const saveCategoryRule = async () => {
			if (!categoryRuleForm.value.categoryId || !categoryRuleForm.value.description) {
				if (myAlert.value) {
					myAlert.value.showAlert("danger", "Заповніть всі поля");
				}
				return;
			}

			try {
				const configData = {
					type_data: 'category_replace',
					value_data: categoryRuleForm.value.description,
					add_value: categoryRuleForm.value.categoryId
				};

				await ConfigService.addConfig(configData);
				
				if (myAlert.value) {
					myAlert.value.showAlert("success", "Правило категоризації створено успішно");
				}
				
				// Оновити категорію у всіх платежах, які містять цей опис
				await nextTick();
				if (selectedPaymentForRule.value && categoryRuleForm.value.description) {
					const category = formattedCategories.value.find(
						c => c.id === parseInt(categoryRuleForm.value.categoryId)
					);
					if (category) {
						const searchDescription = categoryRuleForm.value.description.trim();
						// Створюємо новий масив замість мутації існуючого
						paymentsWithCategories.value = paymentsWithCategories.value.map(payment => {
							if (payment.mydesc && payment.mydesc.includes(searchDescription)) {
								return {
									...payment,
									category_id: category.id,
									category_name: category.name
								};
							}
							return payment;
						});
					}
				}
				
				showCategoryRuleModal.value = false;
			} catch (error) {
				console.error('Error creating category rule:', error);
				if (myAlert.value) {
					myAlert.value.showAlert("danger", "Помилка при створенні правила");
				}
			}
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
			showCategoryRuleModal,
			selectedPaymentForRule,
			categoryRuleForm,
			formattedCategories,
			handleFileChange,
			handleButtonClick,
			openCategoryRuleModal,
			saveCategoryRule,
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

.alert-info {
	background-color: #f0f8ff;
	border-color: #bee5eb;
}

.alert-info h6 {
	color: #0c5460;
	font-weight: 600;
}

.alert-info ol {
	padding-left: 20px;
}

.alert-info ol li {
	margin-bottom: 5px;
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