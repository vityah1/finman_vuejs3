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

<script>
import ImportService from "@/services/ImportService";

export default {
	name: "BankForm",
	data() {
		return {
			user: this.$route.query.user,
			selectedOption: "show",
			selectedBankType: "revolut",
			file: null,
			payments: [],
			paymentsWithCategories: [],
		};
	},
	computed: {
		currentUser() {
			return this.$store.state.auth.user;
		},
	},
	methods: {
		handleFileChange(event) {
			this.file = event.target.files[0];
			console.log("this.file = event.target.files[0];", this.file, event.target.files[0]);
		},
		handleButtonClick() {
			ImportService.UploadFile(this.file, this.selectedOption, this.selectedBankType)
				.then((response) => {
					this.payments = response.data;
					this.paymentsWithCategories = this.payments.map((payment) => {
						const category = this.$store.state.sprs.categories.find(
							(category) => category.id === payment.category_id,
						);
						return {
							...payment,
							category_name: category ? category.name : "Unknown Category",
						};
					});
					this.$refs.myAlert.showAlert("success", "File upload success");
				})
				.catch((e) => {
					console.log(e);
					this.$refs.myAlert.showAlert("danger", "File upload failed");
				});
		},
	},
	mounted() {
		if (!this.currentUser) {
			this.$router.push({ name: "login" });
		}
	},
};
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