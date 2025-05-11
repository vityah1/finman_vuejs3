<template>
	<div class="container">
		<alert-component ref="myAlert"></alert-component>
		<!-- Modal -->
		<b-modal v-if="currentConfig.name" v-model="showModal" @ok="handleOk()" :title="okTitle" :okTitle="okTitle">
			<div v-if="this.currentConfig.action === 'edit'">
				<h5 class="modal-title text-danger">
					Edit {{ this.currentConfig.name }}
					<span v-if="this.currentConfig.id">[{{ this.currentConfig.id }}]</span>
				</h5>
			</div>
			<div>
				<form v-if="currentConfig">
					<div class="form-group">
						<label>{{ currentConfig.name }}</label>
					</div>

					<div class="form-group">
						<label><strong>Value:</strong></label>
						<input type="text" class="form-control" id="amount" v-model="currentConfig.value_data" />
					</div>

					<div v-if="currentConfig.is_need_add_value" class="form-group">
						<label for="description"><strong>Add value:</strong></label>
						<template v-if="currentConfig.type_data === 'category_replace'">
							<select v-model="currentConfig.add_value" class="form-select">
								<option disabled value="">Оберіть категорію...</option>
								<option v-for="category in formattedCategories" :value=category.id :key=category.id
								>{{ category.name }}
								</option>
							</select>
						</template>
						<template v-else>
							<input type="text" class="form-control" id="description" v-model="currentConfig.add_value" />
						</template>
					</div>
				</form>
				<b-button variant="danger" class="mt-2" @click="deleteConfig">
					Delete
				</b-button>
			</div>
		</b-modal>

<b-table-simple hover small caption-top responsive>
  <caption>User settings</caption>

  <b-tbody v-if="(configs.length > 0)">
    <b-tr v-for="(config_type, index) in config_types" :key="index">
      <b-td>
        <table class="w-100">
          <b-tr>
              <b-td colspan="10">
            <!-- Show config name only for the first occurrence -->
              <span class="fw-bold text-dark">{{ config_type.name }}: </span>
									<b-button
										v-if="config_type.is_multiple || filteredConfigs(config_type.type_data).length === 0"
                                       @click="addConfigForm(config_type.type_data, config_type.is_need_add_value, config_type.name)"
                                       variant="outline-primary"
                                       class="btn-sm"
									> ➕
									</b-button>
              </b-td>
          </b-tr>
		<b-tr v-for="(config, i) in filteredConfigs(config_type.type_data)" :key="i" @click="editConfigForm(config.id, config_type.is_need_add_value, config_type.name)">
            <b-td class="col-1"><span v-if="config.id">[{{ config.id }}]</span></b-td>
            <b-td v-if="!config_type.is_need_add_value" class="text-start col-12">{{ config.value_data }}</b-td>
            <b-td v-else class="text-start col-2 col-md-3">{{ config.value_data }}</b-td>
            <b-td class="text-start col-4 col-md-6">
              <span v-if="(config_type.is_need_add_value && config.add_value && config_type.type_data === 'category_replace')">
                -> [{{ findCategoryNameById(config.add_value) }}]
              </span>
              <span v-else-if="(config_type.is_need_add_value && config.add_value)" class="text-bold">
                -> {{ config.add_value }}
              </span>
            </b-td>
          </b-tr>
        </table>
      </b-td>
    </b-tr>
  </b-tbody>
  <b-tfoot></b-tfoot>
</b-table-simple>

		<div v-if="(configs.length === 0)">Loading...</div>
	</div>
</template>

<script lang="ts">
import ConfigService from "../../services/ConfigService";
import { defineComponent } from 'vue';
import type { ConfigCreate, ConfigUpdate, CategoryCreate, CategoryUpdate } from '../../api/model';

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
	data() {
		return {
			okTitle: "",
			configs: [] as Config[],
			config_types: [] as ConfigType[],
			q: this.$route.query.q || "",
			currentConfig: {} as Config,
			// type_data: { name: '' },
			// config: {is_need_add_value: null},
			user: this.$route.query.user,
			showModal: false,
			categories: [] as Category[],
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
		handleOk() {
            if (this.currentConfig.action === 'edit') {
                this.updateConfig();
            } else if (this.currentConfig.action === 'add') {
                this.addConfig();
            }
        },
		async getConfigTypes() {
			ConfigService.getConfigTypes()
				.then((response) => {
					this.config_types = response.data;
				})
				.catch((e) => {
					console.log(e);
				});
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
			ConfigService.getConfig(id)
				.then((response) => {
					this.currentConfig = response.data;
					this.currentConfig.is_need_add_value = is_need_add_value;
					this.currentConfig.name = name;
					this.currentConfig.action = "edit";
					console.log(response.data);
					this.okTitle = "Update";
					this.showModal = true;
				})
				.catch((e) => {
					console.log(e);
				});
		},
		async updateConfig() {
			// Створюємо об'єкт з необхідними полями
			const configData = {
				type_data: this.currentConfig.type_data,
				value_data: this.currentConfig.value_data,
				add_value: this.currentConfig.add_value,
				action: this.currentConfig.action
			};

			ConfigService.updateConfig(this.currentConfig.id, configData)
				.then((response) => {
					console.log(`user config: ${response}`);
					this.getUserConfig();
					(this.$refs.myAlert as AlertComponent).showAlert("success", "config updated");
					this.showModal = false;
				})
				.catch((e) => {
					console.log(e);
					let errorMessage = "config update failed";
					if (e.response && e.response.data && e.response.data.message) {
						errorMessage = e.response.data.message;
					}
					(this.$refs.myAlert as AlertComponent).showAlert("danger", errorMessage);
					this.showModal = false;
				});
		},
		async addConfig() {
			// Створюємо об'єкт з необхідними полями
			const configData = {
				type_data: this.currentConfig.type_data,
				value_data: this.currentConfig.value_data,
				add_value: this.currentConfig.add_value,
				action: this.currentConfig.action
			};

			ConfigService.addConfig(configData as ConfigCreate)
				.then((response) => {
					console.log(`user config: ${response}`);
					this.getUserConfig();
					(this.$refs.myAlert as AlertComponent).showAlert("success", "config added");
					this.showModal = false;
				})
				.catch((e) => {
					console.log(e);
					let errorMessage = "config add failed";
					if (e.response && e.response.data && e.response.data.message) {
						errorMessage = e.response.data.message;
					}
					(this.$refs.myAlert as AlertComponent).showAlert("danger", errorMessage);
					this.showModal = false;
				});
		},
		async deleteConfig() {
			ConfigService.deleteConfig(this.currentConfig.id)
				.then((response) => {
					console.log(response.data.data);
					this.message = response.data.data;
					const index = this.configs
						.map(function(item) {
							return item.id;
						})
						.indexOf(this.currentConfig.id);

					this.configs.splice(index, 1);
					(this.$refs.myAlert as AlertComponent).showAlert("success", "config deleted");
				})
				.catch((e) => {
					console.log(e);
					(this.$refs.myAlert as AlertComponent).showAlert("danger", "config delete failed");
				});
			this.showModal = false;
		},
		async getUserConfig() {
			ConfigService.getUserConfig()
				.then((response) => {
					this.configs = response.data;
					console.log(response.data);
				})
				.catch((e) => {
					console.log(e);
				});
		},
		findCategoryNameById(categoryId: number | string): string {
            const catId = typeof categoryId === 'string' ? parseInt(categoryId, 10) : categoryId;
            const category = this.categories.find(c => c.id === catId);
            return category ? category.name : '';
        },
		formatCategories(categories: Category[], parentId: number | null = null, prefix = ""): Category[] {
			return categories.reduce((acc, category) => {
				if (category.parent_id === parentId || (parentId === null && !category.parent_id)) {
					acc.push({ ...category, name: prefix + category.name });
					const children = this.formatCategories(categories, category.id, prefix + "--");
					acc = acc.concat(children);
				}
				return acc;
			}, []);
		}
	},
	mounted() {
		if (!this.currentUser) {
			this.$router.push({ name: "login" });
		}
		this.categories = (this.$store as any).state.sprs.categories || [];
		this.getConfigTypes();
		this.getUserConfig();
	},
});
</script>
