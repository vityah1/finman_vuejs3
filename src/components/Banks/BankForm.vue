<template>
	<div class="container">
		<alert-component ref="myAlert"></alert-component>
		<b-form v-model="showModal" :title="`Upload ${bankName} file`">
			<template #modal-header>
				<h5 class="modal-title text-danger">
					Upload {{ bankName }} xlsx file statements...
				</h5>
			</template>
			<template #default>
				<b-form v-if="currentUser">
					<div class="form-group">
						<label>{{ currentUser.login }}</label>
					</div>
					<div class="form-group">
						<label>Select file from <strong>{{ bankName.charAt(0).toUpperCase() + bankName.slice(1) }}:</strong></label>
						<input type="file" class="form-control" id="amount" @change="handleFileChange" />
						<select class="form-control" v-model="selectedOption">
							<option value="import">Import</option>
							<option value="show">Show</option>
						</select>
						<b-button variant="primary" @click="handleButtonClick">Submit</b-button>
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
			file: null,
			payments: [],
			paymentsWithCategories: [],
			bankName: this.$route.meta.bankName,
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
			ImportService.UploadFile(this.file, this.selectedOption, this.bankName)
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