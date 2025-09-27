<template>
	<div>
		<alert-component ref="myAlert"></alert-component>

		<!-- Modal for config editing/adding -->
		<Dialog
			v-model:visible="showModal"
			:header="okTitle"
			modal
			style="width: 50rem"
			:breakpoints="{ '1199px': '75vw', '575px': '90vw' }"
		>

			<div v-if="currentConfig">
				<div style="margin-bottom: 1rem;">
					<label style="font-weight: 600; margin-bottom: 0.5rem; display: block;">{{ currentConfig.name }}</label>
				</div>

				<div style="margin-bottom: 1rem;">
					<label style="font-weight: 600; margin-bottom: 0.5rem; display: block;">{{ currentConfig.type_data === 'category_replace' ? 'Опис транзакції:' : 'Значення:' }}</label>
					<InputText v-model="currentConfig.value_data" style="width: 100%;" />
				</div>

				<div v-if="currentConfig.is_need_add_value" style="margin-bottom: 1rem;">
					<label style="font-weight: 600; margin-bottom: 0.5rem; display: block;">{{ currentConfig.type_data === 'category_replace' ? 'Категорія для присвоєння:' : 'Додаткове значення:' }}</label>
					<Dropdown
						v-if="currentConfig.type_data === 'category_replace'"
						v-model="currentConfig.add_value"
						:options="formattedCategories"
						optionLabel="name"
						optionValue="id"
						placeholder="Оберіть категорію..."
						style="width: 100%;"
					/>
					<InputText
						v-else
						v-model="currentConfig.add_value"
						style="width: 100%;"
					/>
				</div>
			</div>

			<template #footer>
				<PButton label="Скасувати" icon="pi pi-times" text @click="showModal = false" />
				<PButton label="Видалити" icon="pi pi-trash" severity="danger" @click="deleteConfig" />
				<PButton :label="okTitle" icon="pi pi-check" @click="handleOk" />
			</template>
		</Dialog>

		<!-- Main settings interface -->
		<PCard>
			<template #header>
				<div style="padding: 1rem; display: flex; align-items: center; gap: 0.5rem;">
					<i class="pi pi-cog" style="font-size: 1.5rem; color: var(--primary-color);"></i>
					<span style="font-weight: 600;">Налаштування користувача</span>
					<PButton
						v-if="selectedConfigType && selectedConfigType.type_data !== null"
						icon="pi pi-arrow-left"
						label="Назад"
						text
						@click="backToDashboard"
						style="margin-left: auto;"
					/>
				</div>
			</template>

			<template #content>
				<div v-if="configs.length === 0" style="text-align: center; padding: 2rem;">
					<ProgressSpinner style="width: 50px; height: 50px" />
					<div style="margin-top: 1rem; color: var(--text-color-secondary);">Завантаження налаштувань...</div>
				</div>

				<!-- Dashboard view -->
				<div v-else-if="!selectedConfigType || selectedConfigType.type_data === null">
					<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1rem;">
						<!-- Banking Settings Card -->
						<PCard
							v-if="getBankingConfigTypes().length > 0"
							style="cursor: pointer; transition: all 0.3s ease;"
							@click="selectConfigType('mono')"
							class="hover:shadow-lg"
						>
							<template #header>
								<div style="padding: 1rem; text-align: center;">
									<i class="pi pi-credit-card" style="font-size: 3rem; color: var(--blue-500); margin-bottom: 0.5rem;"></i>
									<h3 style="margin: 0; color: var(--text-color); font-size: 1.25rem;">Інтеграція з Моно</h3>
								</div>
							</template>
							<template #content>
								<div style="text-align: center;">
									<p style="color: var(--text-color-secondary); margin-bottom: 1rem;">
										Налаштування ID рахунків Монобанку для обробки webhook-ів і імпорту транзакцій.
									</p>
									<div style="display: flex; align-items: center; justify-content: center; gap: 0.5rem;">
										<i class="pi pi-arrow-right" style="color: var(--primary-color);"></i>
									</div>
								</div>
							</template>
						</PCard>

						<!-- Telegram Settings Card -->
						<PCard
							v-if="getTelegramConfigTypes().length > 0"
							style="cursor: pointer; transition: all 0.3s ease;"
							@click="selectConfigType('telegram')"
							class="hover:shadow-lg"
						>
							<template #header>
								<div style="padding: 1rem; text-align: center;">
									<i class="pi pi-send" style="font-size: 3rem; color: var(--indigo-500); margin-bottom: 0.5rem;"></i>
									<h3 style="margin: 0; color: var(--text-color); font-size: 1.25rem;">Telegram бот</h3>
								</div>
							</template>
							<template #content>
								<div style="text-align: center;">
									<p style="color: var(--text-color-secondary); margin-bottom: 1rem;">
										Налаштування Telegram бота. Вкажіть токен і чат ID для сповіщень.
									</p>
									<div style="display: flex; align-items: center; justify-content: center; gap: 0.5rem;">
										<PTag :value="getTelegramConfigsCount() + ' налаштувань'" severity="info" />
										<i class="pi pi-arrow-right" style="color: var(--primary-color);"></i>
									</div>
								</div>
							</template>
						</PCard>

						<!-- Transaction Settings Card -->
						<PCard
							v-if="getTransactionConfigTypes().length > 0"
							style="cursor: pointer; transition: all 0.3s ease;"
							@click="selectConfigType('transaction')"
							class="hover:shadow-lg"
						>
							<template #header>
								<div style="padding: 1rem; text-align: center;">
									<i class="pi pi-chart-line" style="font-size: 3rem; color: var(--green-500); margin-bottom: 0.5rem;"></i>
									<h3 style="margin: 0; color: var(--text-color); font-size: 1.25rem;">Обробка транзакцій</h3>
								</div>
							</template>
							<template #content>
								<div style="text-align: center;">
									<p style="color: var(--text-color-secondary); margin-bottom: 1rem;">
										Правила категоризації, вилучення з статистики та автоматичного видалення транзакцій.
									</p>
									<div style="display: flex; align-items: center; justify-content: center; gap: 0.5rem;">
										<PTag :value="getTransactionConfigsCount() + ' правил'" severity="info" />
										<i class="pi pi-arrow-right" style="color: var(--primary-color);"></i>
									</div>
								</div>
							</template>
						</PCard>

						<!-- Personal Settings Card -->
						<PCard
							v-if="getPersonalConfigTypes().length > 0"
							style="cursor: pointer; transition: all 0.3s ease;"
							@click="selectConfigType('personal')"
							class="hover:shadow-lg"
						>
							<template #header>
								<div style="padding: 1rem; text-align: center;">
									<i class="pi pi-user" style="font-size: 3rem; color: var(--purple-500); margin-bottom: 0.5rem;"></i>
									<h3 style="margin: 0; color: var(--text-color); font-size: 1.25rem;">Телефон → Ім'я</h3>
								</div>
							</template>
							<template #content>
								<div style="text-align: center;">
									<p style="color: var(--text-color-secondary); margin-bottom: 1rem;">
										Зіставлення номерів телефонів з іменами. У транзакціях замість номера буде показано ім'я.
									</p>
									<div style="display: flex; align-items: center; justify-content: center; gap: 0.5rem;">
										<PTag :value="getPersonalConfigsCount() + ' налаштувань'" severity="info" />
										<i class="pi pi-arrow-right" style="color: var(--primary-color);"></i>
									</div>
								</div>
							</template>
						</PCard>
					</div>
				</div>

				<!-- Detail view for specific config type -->
				<div v-else>
					<div style="margin-bottom: 1rem;">
						<Message :severity="getConfigTypeInfo(selectedConfigType.type_data).severity">
							{{ getConfigTypeInfo(selectedConfigType.type_data).description }}
						</Message>
					</div>

					<!-- Special telegram forms view -->
					<div v-if="selectedConfigType.type_data === 'telegram'">
						<PCard>
							<template #header>
								<div style="padding: 1rem; display: flex; align-items: center; gap: 0.5rem;">
									<i class="pi pi-send" style="color: var(--primary-color);"></i>
									<h4 style="margin: 0; color: var(--text-color);">Налаштування Telegram бота</h4>
								</div>
							</template>
							<template #content>
								<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1rem; margin-bottom: 1.5rem;">
									<!-- Telegram Token -->
									<div>
										<label style="font-weight: 600; margin-bottom: 0.5rem; display: flex; align-items: center; gap: 0.5rem;">
											<i class="pi pi-key" style="color: var(--primary-color);"></i>
											Токен бота:
											<i
												class="pi pi-question-circle"
												style="color: var(--text-color-secondary); cursor: help;"
												v-tooltip.top="'Створіть бота через @BotFather у Telegram, отримайте токен вигляду: 123456789:AAGqp9YmhqLAWA1SXRPE-HlPur6FMVo9ENQ'"
											></i>
										</label>
										<InputText
											v-model="telegramToken"
											placeholder="123456789:AAGqp9YmhqLAWA1SXRPE-HlPur6FMVo9ENQ"
											style="width: 100%; font-family: monospace;"
										/>
									</div>

									<!-- Telegram Chat ID -->
									<div>
										<label style="font-weight: 600; margin-bottom: 0.5rem; display: flex; align-items: center; gap: 0.5rem;">
											<i class="pi pi-comments" style="color: var(--primary-color);"></i>
											Чат ID:
											<i
												class="pi pi-question-circle"
												style="color: var(--text-color-secondary); cursor: help;"
												v-tooltip.top="'Напишіть @userinfobot у Telegram та надішліть йому будь-яке повідомлення, щоб отримати ваш Chat ID'"
											></i>
										</label>
										<InputText
											v-model="telegramChatId"
											placeholder="190722186"
											style="width: 100%; font-family: monospace;"
										/>
									</div>
								</div>

								<PButton
									label="Оновити налаштування"
									icon="pi pi-save"
									@click="saveTelegramSettings"
									style="width: 100%;"
								/>
							</template>
						</PCard>
					</div>

					<!-- Special mono dashboard view -->
					<div v-else-if="selectedConfigType.type_data === 'mono'">
						<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1rem;">
							<!-- Mono Account IDs -->
							<PCard style="cursor: pointer; transition: all 0.3s ease;" @click="selectConfigType('banking')" class="hover:shadow-lg">
								<template #header>
									<div style="padding: 1rem; text-align: center;">
										<i class="pi pi-list" style="font-size: 2rem; color: var(--blue-500); margin-bottom: 0.5rem;"></i>
										<h4 style="margin: 0; color: var(--text-color);">ID рахунків</h4>
									</div>
								</template>
								<template #content>
									<div style="text-align: center;">
										<p style="color: var(--text-color-secondary); margin-bottom: 1rem;">
											Налаштування ID рахунків для webhook-ів
										</p>
										<div style="display: flex; align-items: center; justify-content: center; gap: 0.5rem;">
											<i class="pi pi-arrow-right" style="color: var(--primary-color);"></i>
										</div>
									</div>
								</template>
							</PCard>

							<!-- Mono Users -->
							<PCard style="cursor: pointer; transition: all 0.3s ease;" @click="navigateToMonoUsers" class="hover:shadow-lg">
								<template #header>
									<div style="padding: 1rem; text-align: center;">
										<i class="pi pi-users" style="font-size: 2rem; color: var(--green-500); margin-bottom: 0.5rem;"></i>
										<h4 style="margin: 0; color: var(--text-color);">Моно користувачі</h4>
									</div>
								</template>
								<template #content>
									<div style="text-align: center;">
										<p style="color: var(--text-color-secondary); margin-bottom: 1rem;">
											Управління користувачами Монобанку
										</p>
										<div style="display: flex; align-items: center; justify-content: center; gap: 0.5rem;">
											<i class="pi pi-external-link" style="color: var(--primary-color);"></i>
										</div>
									</div>
								</template>
							</PCard>

							<!-- Mono Tokens -->
							<PCard style="cursor: pointer; transition: all 0.3s ease;" @click="navigateToMonoTokens" class="hover:shadow-lg">
								<template #header>
									<div style="padding: 1rem; text-align: center;">
										<i class="pi pi-key" style="font-size: 2rem; color: var(--orange-500); margin-bottom: 0.5rem;"></i>
										<h4 style="margin: 0; color: var(--text-color);">Моно токени</h4>
									</div>
								</template>
								<template #content>
									<div style="text-align: center;">
										<p style="color: var(--text-color-secondary); margin-bottom: 1rem;">
											Управління токенами доступу до API
										</p>
										<div style="display: flex; align-items: center; justify-content: center; gap: 0.5rem;">
											<i class="pi pi-external-link" style="color: var(--primary-color);"></i>
										</div>
									</div>
								</template>
							</PCard>
						</div>
					</div>

					<!-- Standard config types view for other sections -->
					<div v-else v-for="config_type in getCurrentConfigTypes()" :key="config_type.type_data">
						<PCard style="margin-bottom: 1rem;">
							<template #header>
								<div style="padding: 1rem; display: flex; align-items: center; justify-content: space-between;">
									<h4 style="margin: 0; color: var(--text-color);">
										{{ getConfigTypeName(config_type) }}
									</h4>
									<PButton
										v-if="config_type.is_multiple || filteredConfigs(config_type.type_data).length === 0"
										@click="addConfigForm(config_type.type_data, config_type.is_need_add_value, config_type.name)"
										icon="pi pi-plus"
										label="Додати"
										size="small"
									/>
								</div>
							</template>

							<template #content>
								<DataTable
									:value="filteredConfigs(config_type.type_data)"
									@row-click="(event) => editConfigForm(event.data.id, config_type.is_need_add_value, config_type.name)"
									dataKey="id"
									stripedRows
									style="cursor: pointer;"
									sortMode="multiple"
									removableSort
									:paginator="filteredConfigs(config_type.type_data).length > 10"
									:rows="10"
									:rowsPerPageOptions="[10, 25, 50]"
									paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
									currentPageReportTemplate="Показано {first} - {last} з {totalRecords} записів"
									filterDisplay="row"
									v-model:filters="tableFilters[config_type.type_data]"
								>
									<template #empty>
										<div style="text-align: center; padding: 2rem; color: var(--text-color-secondary);">
											<i class="pi pi-inbox" style="font-size: 2rem; margin-bottom: 1rem; display: block;"></i>
											Немає налаштувань цього типу
										</div>
									</template>

									<Column field="id" header="ID" style="width: 80px;" sortable>
										<template #body="{ data }">
											<PTag :value="'#' + data.id" severity="secondary" />
										</template>
									</Column>

									<Column
										field="value_data"
										:header="getValueHeader(config_type.type_data)"
										sortable
										:showFilterMatchModes="false"
									>
										<template #filter="{ filterModel, filterCallback }">
											<InputText
												v-model="filterModel.value"
												@input="filterCallback()"
												:placeholder="'Пошук у полі ' + getValueHeader(config_type.type_data).toLowerCase()"
											/>
										</template>
									</Column>

									<Column
										v-if="config_type.is_need_add_value"
										field="add_value"
										:header="getAddValueHeader(config_type.type_data)"
										sortable
										:showFilterMatchModes="false"
									>
										<template #body="{ data }">
											<span v-if="config_type.type_data === 'category_replace' && data.add_value">
												→ {{ findCategoryNameById(data.add_value) }}
											</span>
											<span v-else-if="data.add_value">
												→ {{ data.add_value }}
											</span>
										</template>
										<template #filter="{ filterModel, filterCallback }">
											<!-- Category dropdown filter for category_replace -->
											<Dropdown
												v-if="config_type.type_data === 'category_replace'"
												v-model="filterModel.value"
												@change="filterCallback()"
												:options="formattedCategories"
												optionLabel="name"
												optionValue="id"
												placeholder="Оберіть категорію..."
												:showClear="true"
												style="width: 100%;"
											/>
											<!-- Text input for other types -->
											<InputText
												v-else
												v-model="filterModel.value"
												@input="filterCallback()"
												:placeholder="'Пошук у полі ' + getAddValueHeader(config_type.type_data).toLowerCase()"
											/>
										</template>
									</Column>
								</DataTable>
							</template>
						</PCard>
					</div>
				</div>
			</template>
		</PCard>
	</div>
</template>

<style>
/* DataTable header improvements */
.p-datatable .p-datatable-thead > tr > th {
	background-color: var(--surface-50) !important;
	color: var(--text-color) !important;
	border-bottom: 1px solid var(--surface-200) !important;
}

.p-datatable .p-datatable-thead > tr > th .p-column-header-content {
	color: var(--text-color) !important;
}

.p-datatable .p-datatable-thead > tr > th .p-sortable-column-icon {
	color: var(--text-color-secondary) !important;
}

.p-datatable .p-datatable-thead > tr > th:hover .p-sortable-column-icon {
	color: var(--primary-color) !important;
}

/* Filter row styling */
.p-datatable .p-datatable-thead > tr.p-filter-row > th {
	background-color: var(--surface-0) !important;
	border-bottom: 1px solid var(--surface-200) !important;
}

/* Better filter input styling */
.p-datatable .p-filter-row .p-column-filter {
	width: 100%;
}
</style>

<script lang="ts">
import ConfigService from "../../services/ConfigService";
import { defineComponent } from 'vue';
import type { ConfigCreate } from '@/api/model/configCreate';
import type { ConfigUpdate } from '@/api/model/configUpdate';
import type { CategoryCreate } from '@/api/model/categoryCreate';
import type { CategoryUpdate } from '@/api/model/categoryUpdate';

// PrimeVue imports
import Card from 'primevue/card';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import Dropdown from 'primevue/dropdown';
import Tag from 'primevue/tag';
import Message from 'primevue/message';
import ProgressSpinner from 'primevue/progressspinner';

// Additional components
import AlertComponent from '../AlertComponent.vue';

// Використовуємо інтерфейс для типів конфігурацій, які повертає API
interface ConfigType {
	type_data: string;
	name: string;
	is_need_add_value: boolean;
	is_multiple: boolean;
}

// Локальний інтерфейс для категорій
interface Category {
	id: number;
	name: string;
	parent_id?: number | null;
	children?: Category[];
}

// Використовуємо типи з Orval безпосередньо
type Config = ConfigCreate & {
	id?: number;
	is_need_add_value?: boolean;
	name?: string;
	action?: 'add' | 'edit';
}

interface AlertComponent {
	showAlert: (type: string, message: string) => void;
}

export default defineComponent({
	name: "ConfigUser",
	components: {
		PCard: Card,
		DataTable,
		Column,
		PButton: Button,
		Dialog,
		InputText,
		Dropdown,
		PTag: Tag,
		Message,
		ProgressSpinner,
		AlertComponent
	},
	data() {
		return {
			okTitle: "",
			configs: [] as Config[],
			config_types: [] as ConfigType[],
			q: this.$route.query.q || "",
			currentConfig: {} as Config,
			user: this.$route.query.user,
			showModal: false,
			categories: [] as Category[],
			selectedConfigType: null as { type_data: string | null } | null,
			telegramToken: '',
			telegramChatId: '',
			tableFilters: {} as Record<string, any>,
		};
	},
	computed: {
		currentUser() {
			return (this.$store as any).state.auth.user;
		},
		filteredConfigs() {
			return (type_data) => {
				return this.configs.filter(config => config.type_data === type_data);
			};
		},
		formattedCategories() {
			return this.formatCategories(this.categories);
		}
	},
	methods: {
		// Group filtering methods
		getBankingConfigTypes() {
			return this.config_types.filter(type =>
				['mono_account'].includes(type.type_data)
			);
		},
		getTelegramConfigTypes() {
			return this.config_types.filter(type =>
				['telegram_token', 'telegram_chat_id'].includes(type.type_data)
			);
		},
		getTransactionConfigTypes() {
			return this.config_types.filter(type =>
				['category_replace', 'exclude_from_stat', 'is_deleted_by_description'].includes(type.type_data)
			);
		},
		getPersonalConfigTypes() {
			return this.config_types.filter(type =>
				['phone_to_name'].includes(type.type_data)
			);
		},
		handleOk() {
			if (this.currentConfig.action === 'edit') {
				this.updateConfig();
			} else if (this.currentConfig.action === 'add') {
				this.addConfig();
			}
		},
		async getConfigTypes() {
			try {
				const response = await ConfigService.getConfigTypes();
				this.config_types = response.data;
				// Initialize filters after config types are loaded
				this.initializeFilters();
			} catch (e) {
				console.log(e);
				(this.$refs.myAlert as AlertComponent).showAlert("danger", "Помилка завантаження типів налаштувань");
			}
		},
		async addConfigForm(type_data: string, is_need_add_value: boolean, name: string) {
			// Створюємо новий об'єкт з правильними типами
			this.currentConfig = {
				id: null,
				type_data: type_data,
				value_data: "",
				add_value: null,
				is_need_add_value: is_need_add_value,
				name: name,
				action: "add"
			};
			this.okTitle = "Add";
			this.showModal = true;
		},
		async editConfigForm(id: number, is_need_add_value: boolean, name: string) {
			try {
				const response = await ConfigService.getConfig(id);
				this.currentConfig = response.data;
				this.currentConfig.is_need_add_value = is_need_add_value;
				this.currentConfig.name = name;
				this.currentConfig.action = "edit";

				// Convert add_value to number for category_replace to match dropdown optionValue
				if (this.currentConfig.type_data === 'category_replace' && this.currentConfig.add_value) {
					this.currentConfig.add_value = parseInt(this.currentConfig.add_value);
				}

				console.log(response.data);
				this.okTitle = "Оновити";
				this.showModal = true;
			} catch (e) {
				console.log(e);
				(this.$refs.myAlert as AlertComponent).showAlert("danger", "Помилка завантаження налаштування");
			}
		},
		async updateConfig() {
			try {
				const configData = {
					type_data: this.currentConfig.type_data,
					value_data: this.currentConfig.value_data,
					add_value: this.currentConfig.add_value,
					action: this.currentConfig.action
				};

				const response = await ConfigService.updateConfig(this.currentConfig.id, configData);
				console.log(`user config: ${response}`);
				await this.getUserConfig();
				(this.$refs.myAlert as AlertComponent).showAlert("success", "Налаштування оновлено");
				this.showModal = false;
			} catch (e) {
				console.log(e);
				let errorMessage = "Помилка оновлення налаштування";
				if (e.response && e.response.data && e.response.data.message) {
					errorMessage = e.response.data.message;
				}
				(this.$refs.myAlert as AlertComponent).showAlert("danger", errorMessage);
				this.showModal = false;
			}
		},
		async addConfig() {
			try {
				const configData = {
					type_data: this.currentConfig.type_data,
					value_data: this.currentConfig.value_data,
					add_value: this.currentConfig.add_value,
					action: this.currentConfig.action
				};

				const response = await ConfigService.addConfig(configData as ConfigCreate);
				console.log(`user config: ${response}`);
				await this.getUserConfig();
				(this.$refs.myAlert as AlertComponent).showAlert("success", "Налаштування додано");
				this.showModal = false;
			} catch (e) {
				console.log(e);
				let errorMessage = "Помилка додавання налаштування";
				if (e.response && e.response.data && e.response.data.message) {
					errorMessage = e.response.data.message;
				}
				(this.$refs.myAlert as AlertComponent).showAlert("danger", errorMessage);
				this.showModal = false;
			}
		},
		async deleteConfig() {
			try {
				const response = await ConfigService.deleteConfig(this.currentConfig.id);
				console.log(response.data.data);

				const index = this.configs.findIndex(item => item.id === this.currentConfig.id);
				if (index !== -1) {
					this.configs.splice(index, 1);
				}

				(this.$refs.myAlert as AlertComponent).showAlert("success", "Налаштування видалено");
				this.showModal = false;
			} catch (e) {
				console.log(e);
				(this.$refs.myAlert as AlertComponent).showAlert("danger", "Помилка видалення налаштування");
				this.showModal = false;
			}
		},
		async getUserConfig() {
			try {
				const response = await ConfigService.getUserConfig();
				this.configs = response.data;
				console.log(response.data);
				// Initialize telegram form values
				this.telegramToken = this.getTelegramTokenConfig()?.value_data || '';
				this.telegramChatId = this.getTelegramChatIdConfig()?.value_data || '';
			} catch (e) {
				console.log(e);
				(this.$refs.myAlert as AlertComponent).showAlert("danger", "Помилка завантаження налаштувань");
			}
		},
		findCategoryNameById(categoryId: number | string): string {
            const catId = typeof categoryId === 'string' ? parseInt(categoryId, 10) : categoryId;
            const category = this.categories.find(c => c.id === catId);
            return category ? category.name : '';
        },
		formatCategories(categories: Category[], parentId: number | null = null, level = 0): Category[] {
			return categories.reduce((acc, category) => {
				if (category.parent_id === parentId || (parentId === null && !category.parent_id)) {
					const indent = level > 0 ? "└─ ".repeat(level) : "";
					acc.push({ ...category, name: indent + category.name });
					const children = this.formatCategories(categories, category.id, level + 1);
					acc = acc.concat(children);
				}
				return acc;
			}, []);
		},
		// Dashboard methods
		getBankingConfigsCount() {
			return this.configs.filter(config =>
				['mono_account'].includes(config.type_data)
			).length;
		},
		getTelegramConfigsCount() {
			return this.configs.filter(config =>
				['telegram_token', 'telegram_chat_id'].includes(config.type_data)
			).length;
		},
		getTransactionConfigsCount() {
			return this.configs.filter(config =>
				['category_replace', 'exclude_from_stat', 'is_deleted_by_description'].includes(config.type_data)
			).length;
		},
		getPersonalConfigsCount() {
			return this.configs.filter(config =>
				['phone_to_name'].includes(config.type_data)
			).length;
		},
		// Navigation methods
		selectConfigType(type: string) {
			this.selectedConfigType = { type_data: type };
		},
		backToDashboard() {
			this.selectedConfigType = null;
		},
		getCurrentConfigTypes() {
			if (!this.selectedConfigType || this.selectedConfigType.type_data === null) {
				return [];
			}
			switch (this.selectedConfigType.type_data) {
				case 'banking':
					return this.getBankingConfigTypes();
				case 'telegram':
					return this.getTelegramConfigTypes();
				case 'transaction':
					return this.getTransactionConfigTypes();
				case 'personal':
					return this.getPersonalConfigTypes();
				default:
					return [];
			}
		},
		getConfigTypeInfo(type: string) {
			switch (type) {
				case 'mono':
					return {
						description: 'Комплексні налаштування інтеграції з Монобанком. Включає управління ID рахунків, користувачами та токенами доступу до API.',
						severity: 'info'
					};
				case 'banking':
					return {
						description: 'Налаштування ID рахунків Монобанку для обробки webhook-ів і автоматичного імпорту транзакцій. Вкажіть ідентифікатори рахунків які потрібно відстежувати.',
						severity: 'info'
					};
				case 'telegram':
					return {
						description: 'Налаштування Telegram бота для отримання сповіщень про транзакції, зміни балансу та інші важливі події.',
						severity: 'info'
					};
				case 'transaction':
					return {
						description: 'Правила та налаштування для автоматичної обробки транзакцій. Категоризація, фільтрація і автоматичне видалення.',
						severity: 'warn'
					};
				case 'personal':
					return {
						description: 'Зіставлення номерів телефонів з іменами контактів. У транзакціях замість номера телефону буде показано відповідне ім\'я.',
						severity: 'info'
					};
				default:
					return {
						description: 'Налаштування системи',
						severity: 'info'
					};
			}
		},
		getValueHeader(type_data: string) {
			switch (type_data) {
				case 'category_replace':
					return 'Текст у транзакції';
				case 'telegram_token':
					return 'Токен бота';
				case 'telegram_chat_id':
					return 'Чат ID';
				case 'phone_to_name':
					return 'Номер телефону';
				default:
					return 'Значення';
			}
		},
		getAddValueHeader(type_data: string) {
			switch (type_data) {
				case 'category_replace':
					return 'Призначити категорію';
				case 'phone_to_name':
					return "Ім'я";
				default:
					return 'Додаткове значення';
			}
		},
		// Methods for direct telegram forms
		getTelegramTokenConfig() {
			return this.configs.find(config => config.type_data === 'telegram_token') || null;
		},
		getTelegramChatIdConfig() {
			return this.configs.find(config => config.type_data === 'telegram_chat_id') || null;
		},
		async saveTelegramSettings() {
			const tokenValue = this.telegramToken.trim();
			const chatIdValue = this.telegramChatId.trim();

			if (!tokenValue && !chatIdValue) {
				(this.$refs.myAlert as AlertComponent).showAlert("warn", "Введіть принаймні один параметр (токен або чат ID)");
				return;
			}

			try {
				let savedCount = 0;

				// Save token if provided
				if (tokenValue) {
					await this.saveTelegramConfig('telegram_token', tokenValue);
					savedCount++;
				}

				// Save chat ID if provided
				if (chatIdValue) {
					await this.saveTelegramConfig('telegram_chat_id', chatIdValue);
					savedCount++;
				}

				if (savedCount > 0) {
					(this.$refs.myAlert as AlertComponent).showAlert("success", "Налаштування Telegram оновлено");
				}
			} catch (e) {
				console.log(e);
				(this.$refs.myAlert as AlertComponent).showAlert("danger", "Помилка збереження налаштувань Telegram");
			}
		},
		async saveTelegramConfig(type_data: string, value_data: string) {
			const existingConfig = this.configs.find(config => config.type_data === type_data);
			const configData = {
				type_data: type_data,
				value_data: value_data,
				add_value: null
			};

			if (existingConfig) {
				// Update existing config
				await ConfigService.updateConfig(existingConfig.id, {
					...configData,
					action: 'edit'
				});
			} else {
				// Create new config
				await ConfigService.addConfig({
					...configData,
					action: 'add'
				});
			}

			// Reload configs
			await this.getUserConfig();
		},
		// Navigation methods for Mono dashboard
		navigateToMonoUsers() {
			this.$router.push({ name: 'mono_users' });
		},
		navigateToMonoTokens() {
			this.$router.push({ name: 'mono_user_token' });
		},
		getConfigTypeName(config_type: any) {
			switch (config_type.type_data) {
				case 'category_replace':
					return 'Автоматична категоризація транзакцій';
				case 'exclude_from_stat':
					return 'Виключення зі статистики';
				case 'is_deleted_by_description':
					return 'Автовидалення по тексту';
				case 'phone_to_name':
					return 'Зіставлення телефонів з іменами';
				default:
					return config_type.name || 'Налаштування';
			}
		},
		initializeFilters() {
			// Initialize filters for each config type
			this.config_types.forEach(config_type => {
				if (!this.tableFilters[config_type.type_data]) {
					this.tableFilters[config_type.type_data] = {
						value_data: { value: null, matchMode: 'contains' }
					};

					if (config_type.is_need_add_value) {
						// Use 'equals' for category_replace (dropdown), 'contains' for others (text input)
						const matchMode = config_type.type_data === 'category_replace' ? 'equals' : 'contains';
						this.tableFilters[config_type.type_data].add_value = { value: null, matchMode: matchMode };
					}
				}
			});
		}
	},
	mounted() {
		if (!this.currentUser) {
			this.$router.push({ name: "login" });
		}
		this.categories = (this.$store as any).state.sprs.categories || [];
		this.getConfigTypes();
		this.getUserConfig();

		// Auto-open section from query parameter
		const section = this.$route.query.section as string;
		if (section) {
			this.selectConfigType(section);
		}
	},
});
</script>
