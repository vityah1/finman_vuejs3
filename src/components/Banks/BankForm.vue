<template>
	<div>
		<alert-component ref="myAlert"></alert-component>

		<!-- Індикатор завантаження -->
		<div v-if="isLoading" class="loading-overlay">
			<div class="loading-content">
				<ProgressSpinner style="width: 50px; height: 50px" strokeWidth="8" />
				<p style="margin-top: 1rem; margin-bottom: 0;">Обробка файлу...</p>
			</div>
		</div>

		<PCard>
			<template #header>
				<div style="padding: 1rem; display: flex; align-items: center; gap: 0.5rem;">
					<i class="pi pi-upload" style="font-size: 1.5rem; color: var(--primary-color);"></i>
					<span style="font-weight: 600;">Імпорт банківських виписок</span>
				</div>
			</template>

			<template #content>
				<div v-if="currentUser">
					<div style="margin-bottom: 1.5rem;">
						<label style="font-weight: 600; margin-bottom: 0.5rem; display: block;">
							<i class="pi pi-building" style="color: var(--primary-color); margin-right: 0.5rem;"></i>
							Оберіть тип банку:
						</label>
						<div class="bank-selector" style="margin-bottom: 1rem;">
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
							<div
								class="bank-option"
								:class="{ active: selectedBankType === 'raiffeisen', disabled: isLoading }"
								@click="!isLoading && (selectedBankType = 'raiffeisen')"
							>
								<i class="fas fa-university"></i> Raiffeisen Bank
							</div>
						</div>
						
						<!-- Підказки для кожного банку -->
						<Message v-if="selectedBankType" severity="info" :closable="false" style="margin-top: 1rem; margin-bottom: 1rem;">
							<h6 style="margin: 0 0 0.5rem 0; font-weight: 600;">
								<i class="pi pi-info-circle" style="margin-right: 0.5rem;"></i>
								Як отримати виписку:
							</h6>
							<div v-if="selectedBankType === 'revolut'">
								<ol style="margin-bottom: 0; padding-left: 1.25rem;">
									<li>Відкрийте додаток Revolut</li>
									<li>Перейдіть в Accounts → виберіть рахунок</li>
									<li>Натисніть More → Statement</li>
									<li>Виберіть період та формат Excel</li>
									<li>Завантажте файл</li>
								</ol>
							</div>
							<div v-else-if="selectedBankType === 'wise'">
								<ol style="margin-bottom: 0; padding-left: 1.25rem;">
									<li>Зайдіть в Wise</li>
									<li>Перейдіть в рахунок</li>
									<li>Натисніть три крапки зверху справа</li>
									<li>Виберіть "Statements and reports"</li>
									<li>Натисніть "Statement"</li>
									<li>Задайте період і тип файлу (CSV або Excel)</li>
								</ol>
							</div>
							<div v-else-if="selectedBankType === 'p24'">
								<ol style="margin-bottom: 0; padding-left: 1.25rem;">
									<li>Увійдіть в Приват24</li>
									<li>Перейдіть в "Усі виписки"</li>
									<li>Виберіть картку та період</li>
									<li>Завантажте виписку в форматі XLS/XLSX</li>
								</ol>
							</div>
							<div v-else-if="selectedBankType === 'pumb'">
								<ol style="margin-bottom: 0; padding-left: 1.25rem;">
									<li>Відкрийте додаток ПУМБ</li>
									<li>Перейдіть до потрібної картки</li>
									<li>Натисніть три крапки справа зверху</li>
									<li>Виберіть "Сформувати виписку"</li>
									<li>Вкажіть період та натисніть "Поділитись"</li>
									<li>Збережіть отриманий PDF файл</li>
								</ol>
								<small style="color: var(--text-color-secondary);">Підтримуються PDF виписки з додатку ПУМБ</small>
							</div>
							<div v-else-if="selectedBankType === 'erste'">
								<ol style="margin-bottom: 0; padding-left: 1.25rem;">
									<li>Увійдіть в George (Erste Bank)</li>
									<li>Перейдіть в Accounts → Transaction history</li>
									<li>Виберіть рахунок та період</li>
									<li>Експортуйте в форматі PDF</li>
								</ol>
								<small style="color: var(--text-color-secondary);">Автоматична конвертація EUR → UAH за курсом НБУ</small>
							</div>
							<div v-else-if="selectedBankType === 'raiffeisen'">
								<ol style="margin-bottom: 0; padding-left: 1.25rem;">
									<li>Увійдіть в Raiffeisen Online</li>
									<li>Перейдіть до розділу "Рахунки"</li>
									<li>Виберіть потрібний рахунок</li>
									<li>Натисніть "Довідка про рух коштів"</li>
									<li>Вкажіть період та завантажте у форматі CSV</li>
								</ol>
								<small style="color: var(--text-color-secondary);">Підтримуються CSV виписки з Raiffeisen Online Banking</small>
							</div>
						</Message>
					</div>

					<div style="margin-bottom: 1.5rem;">
						<label style="font-weight: 600; margin-bottom: 0.5rem; display: block;">
							<i class="pi pi-file" style="color: var(--primary-color); margin-right: 0.5rem;"></i>
							Завантажити файл виписки {{ selectedBankType.charAt(0).toUpperCase() + selectedBankType.slice(1) }}:
						</label>
						<FileUpload
							mode="basic"
							:multiple="false"
							:disabled="isLoading"
							@select="handleFileSelect"
							accept=".csv,.xlsx,.xls,.pdf"
							:auto="false"
							chooseLabel="Оберіть файл"
							class="p-button-outlined"
						/>
					</div>

					<div style="margin-bottom: 1.5rem;">
						<label style="font-weight: 600; margin-bottom: 0.5rem; display: block;">
							<i class="pi pi-cog" style="color: var(--primary-color); margin-right: 0.5rem;"></i>
							Дія:
						</label>
						<Dropdown
							v-model="selectedOption"
							:options="actionOptions"
							optionLabel="label"
							optionValue="value"
							placeholder="Оберіть дію"
							:disabled="isLoading"
							style="width: 100%;"
						/>
					</div>

					<PButton
						label="Виконати"
						icon="pi pi-play"
						@click="handleButtonClick"
						:loading="isLoading"
						:disabled="!file"
						style="width: 100%;"
					/>
				</div>
			</template>
		</PCard>

		<!-- Результати обробки -->
		<PCard v-if="paymentsWithCategories.length > 0" style="margin-top: 1.5rem;">
			<template #header>
				<div style="padding: 1rem; display: flex; align-items: center; gap: 0.5rem;">
					<i class="pi pi-list" style="font-size: 1.5rem; color: var(--primary-color);"></i>
					<span style="font-weight: 600;">Результати обробки файлу</span>
					<PTag :value="paymentsWithCategories.length" severity="info" />
				</div>
			</template>

			<template #content>
				<DataTable
					:value="paymentsWithCategories"
					dataKey="id"
					stripedRows
					:paginator="paymentsWithCategories.length > 10"
					:rows="10"
					:rowsPerPageOptions="[10, 25, 50]"
					paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
					currentPageReportTemplate="Показано {first} - {last} з {totalRecords} платежів"
				>
					<template #empty>
						<div style="text-align: center; padding: 2rem; color: var(--text-color-secondary);">
							<i class="pi pi-inbox" style="font-size: 2rem; margin-bottom: 1rem; display: block;"></i>
							<span>Немає даних для відображення</span>
						</div>
					</template>

					<Column field="rdate" header="Дата" style="width: 120px;" sortable>
						<template #body="{ data }">
							<span>{{ formatDate(data.rdate) }}</span>
						</template>
					</Column>

					<Column field="category_id" header="ID" style="width: 80px;" sortable>
						<template #body="{ data }">
							<PTag :value="data.category_id" severity="secondary" />
						</template>
					</Column>

					<Column field="category_name" header="Категорія" sortable>
						<template #body="{ data }">
							<div style="display: flex; align-items: center; gap: 0.5rem;">
								<i class="pi pi-tag" style="color: var(--primary-color);"></i>
								<span>{{ data.category_name }}</span>
							</div>
						</template>
					</Column>

					<Column field="mydesc" header="Опис" sortable>
						<template #body="{ data }">
							<span>{{ data.mydesc }}</span>
						</template>
					</Column>

					<Column field="currency_amount" header="Сума" style="width: 120px; text-align: right;" sortable>
						<template #body="{ data }">
							<span style="font-weight: 600;">{{ data.currency_amount?.toLocaleString() || 0 }}</span>
						</template>
					</Column>

					<Column field="sql" header="Статус" style="width: 80px; text-align: center;">
						<template #body="{ data }">
							<i
								:class="data.sql ? 'pi pi-check' : 'pi pi-times'"
								:style="{ color: data.sql ? 'var(--green-500)' : 'var(--red-500)' }"
							></i>
						</template>
					</Column>

					<Column v-if="selectedOption === 'show'" header="Дії" style="width: 100px;">
						<template #body="{ data }">
							<PButton
								icon="pi pi-tag"
								size="small"
								severity="secondary"
								outlined
								@click="openCategoryRuleModal(data)"
								:disabled="isLoading"
								v-tooltip.top="'Створити правило категоризації'"
							/>
						</template>
					</Column>
				</DataTable>
			</template>
		</PCard>

		<!-- Модальне вікно для створення правила категоризації -->
		<Dialog
			v-model:visible="showCategoryRuleModal"
			header="Створити правило категоризації"
			modal
			style="width: 50rem"
			:breakpoints="{ '1199px': '75vw', '575px': '90vw' }"
			class="category-rule-dialog"
		>
			<div v-if="selectedPaymentForRule" style="margin-bottom: 1rem;">
				<div style="margin-bottom: 1rem;">
					<label style="font-weight: 600; margin-bottom: 0.5rem; display: block;">
						<i class="pi pi-file-edit" style="color: var(--primary-color); margin-right: 0.5rem;"></i>
						Опис транзакції:
					</label>
					<InputText
						v-model="categoryRuleForm.description"
						placeholder="Введіть опис або його частину для правила"
						style="width: 100%;"
					/>
					<small style="color: var(--text-color-secondary);">Можете редагувати опис для точнішого правила (наприклад, залишити тільки частину)</small>
				</div>

				<div style="margin-bottom: 1rem;">
					<label style="font-weight: 600; margin-bottom: 0.5rem; display: block;">
						<i class="pi pi-tag" style="color: var(--primary-color); margin-right: 0.5rem;"></i>
						Категорія для присвоєння:
					</label>
					<Dropdown
						v-model="categoryRuleForm.categoryId"
						:options="formattedCategories"
						optionLabel="name"
						optionValue="id"
						placeholder="Оберіть категорію..."
						style="width: 100%;"
					/>
				</div>
			</div>

			<template #footer>
				<PButton label="Скасувати" icon="pi pi-times" text @click="showCategoryRuleModal = false" />
				<PButton label="Зберегти" icon="pi pi-check" @click="saveCategoryRule" />
			</template>
		</Dialog>
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

// PrimeVue imports
import Card from 'primevue/card';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import Dropdown from 'primevue/dropdown';
import FileUpload from 'primevue/fileupload';
import Message from 'primevue/message';
import Tag from 'primevue/tag';
import ProgressSpinner from 'primevue/progressspinner';

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
	components: {
		PCard: Card,
		DataTable,
		Column,
		PButton: Button,
		Dialog,
		InputText,
		Dropdown,
		FileUpload,
		Message,
		PTag: Tag,
		ProgressSpinner
	},
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

		// Опції для дій
		const actionOptions = ref([
			{ label: 'Імпортувати', value: 'import' },
			{ label: 'Показати', value: 'show' }
		]);



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

		// Обробка вибору файлу через PrimeVue FileUpload
		const handleFileSelect = (event: any) => {
			if (event.files && event.files.length > 0) {
				file.value = event.files[0];
				console.log("File selected:", file.value);
			}
		};

		// Форматування дати
		const formatDate = (dateString: string) => {
			if (!dateString) return '';
			const date = new Date(dateString);
			return date.toLocaleDateString('uk-UA', { day: '2-digit', month: 'short' });
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
		const formatCategories = (categories: any[], parentId: number | null = null, level = 0): any[] => {
			if (!Array.isArray(categories)) {
				return [];
			}

			return categories.reduce((acc, category) => {
				if ((category.parent_id === parentId) || (parentId === null && !category.parent_id)) {
					const indent = level > 0 ? "└─ ".repeat(level) : "";
					acc.push({
						id: category.id,
						name: indent + category.name
					});
					const children = formatCategories(categories, category.id, level + 1);
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
			actionOptions,
			handleFileChange,
			handleFileSelect,
			handleButtonClick,
			openCategoryRuleModal,
			saveCategoryRule,
			formatDate,
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