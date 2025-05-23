<template>
	<div class="container">
		<alert-component ref="myAlert"></alert-component>
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
							<div class="bank-option" :class="{ active: selectedBankType === 'revolut' }" @click="selectedBankType = 'revolut'">
								<i class="fas fa-euro-sign"></i> Revolut
							</div>
							<div class="bank-option" :class="{ active: selectedBankType === 'wise' }" @click="selectedBankType = 'wise'">
								<i class="fas fa-euro-sign"></i> Wise
							</div>
							<div class="bank-option" :class="{ active: selectedBankType === 'p24' }" @click="selectedBankType = 'p24'">
								<img src="/p24.png" alt="P24" style="width: 25px; margin-right: 5px;" /> P24
							</div>
						</div>
						<label>Select file from <strong>{{ selectedBankType.charAt(0).toUpperCase() + selectedBankType.slice(1) }}:</strong></label>
						<input type="file" class="form-control" id="amount" @change="handleFileChange" />
						<select class="form-control mt-2" v-model="selectedOption">
							<option value="import">Import</option>
							<option value="show">Show</option>
						</select>
						<b-button variant="primary" class="mt-2" @click="handleButtonClick">Submit</b-button>
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
					<b-td>{{ payment.amount.toLocaleString() }}</b-td>
					<b-td><span v-if="payment.sql" style="color: green;">✔</span><span v-else style="color: red;">✘</span>
					</b-td>
				</b-tr>
			</b-tbody>
		</b-table-simple>
		<div v-if="(payments.length == 0)">...</div>
	</div>
</template>

<script lang="ts">
import ImportService from "@/services/ImportService";
import { ref, computed, onMounted, defineComponent } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import { useMutation } from '@tanstack/vue-query';

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

		const currentUser = computed(() => store.state.auth.user);

		// Використовуємо useMutation для завантаження файлу
		const uploadMutation = useMutation({
			mutationFn: async () => {
				if (!file.value) {
					throw new Error('Файл не вибрано');
				}
				// Перетворюємо відповідь у формат, очікуваний useMutation
				const axiosResponse = await ImportService.UploadFile(
					file.value, 
					selectedOption.value, 
					selectedBankType.value
				);
				return { data: axiosResponse.data };
			},
			onSuccess: (response: { data: Payment[] }) => {
				payments.value = response.data;
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
					myAlert.value.showAlert("success", "File upload success");
				}
			},
			onError: (error) => {
				console.log(error);
				if (myAlert.value) {
					myAlert.value.showAlert("danger", "File upload failed");
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
			uploadMutation.mutate();
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
</style>