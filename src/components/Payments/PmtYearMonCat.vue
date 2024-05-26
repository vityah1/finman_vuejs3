<template>
	<div class="container">
		<alert-component ref="myAlert"></alert-component>
		<!-- Modal -->
		<b-modal v-model="showModal" @ok="doFormAction()" title="Editing expense" :okTitle="okTitle">
			<template #modal-header>
				<h5 class="modal-title text-danger">
					{{ okTitle }} Payment [{{ this.currentPayment.id }}]
				</h5>
			</template>
			<template #default>
				<b-form v-if="currentPayment">
					<div class="form-row">
						<label for="rdate">Date:</label>
						<input type="date" class="form-control" id="rdate" v-model="currentPayment.rdate" />
					</div>
					<div class="form-row">
						<label for="main_category">Category:</label>
						<select v-model="selectedCategoryId" class="form-control" name="main_category"
								id="main_category">
							<option disabled value="">Select category...</option>
							<template v-for="category in formattedCategories" :key="category.id">
								<option :value="category.id">{{ category.name }}</option>
							</template>
						</select>
					</div>

					<div v-if="isFuel" class="form-row">
						<label for="id_km">km:</label>
						<input type="text" class="form-control" id="id_km" v-model="currentPayment.refuel_data.km" />
						<label for="id_litres">Litres:</label>
						<input type="text" class="form-control" id="id_litres" v-model="currentPayment.refuel_data.litres" />
						<label for="id_price_val">Price (EUR):</label>
						<input type="text" class="form-control" id="id_price_val" v-model="currentPayment.refuel_data.price_val" />
						<label for="id_name_station">Name station:</label>
						<input type="text" class="form-control" id="id_name_station" v-model="currentPayment.refuel_data.station_name" />

					</div>

					<div v-if="!isFuel" class="form-row">
						<label for="mydesc">Description:</label>
						<input type="text" class="form-control" id="mydesc" v-model="currentPayment.mydesc" />
					</div>

					<div class="row">
						<div class="col-md-4">
							<label for="amount"><strong>Amount:</strong></label>
							<input type="text" class="form-control" id="amount" v-model="currentPayment.currency_amount" />
						</div>

						<div class="col-md-4">
							<label for="source">Source:</label>
							<select class="form-control" id="source" ref="source" name="source"
									v-model="currentPayment.source">
								<option v-for="item in sources" :value="item.source" :key="item.id">{{ item.source }}
								</option>
							</select>
						</div>

						<div class="col-md-4">
							<label for="currency">Currency:</label>
							<select class="form-control" id="currency" ref="currency" name="currency"
									v-model="currentPayment.currency">
								<option value="USD">USD</option>
								<option value="EUR">EUR</option>
								<option value="UAH">UAH</option>
							</select>
						</div>
					</div>

				</b-form>
				<b-button v-if="currentPayment.action === 'edit'" variant="danger" class="mt-2" @click="delPayment">
					Delete
				</b-button>
			</template>
		</b-modal>

		<div class="row">
			<div class="col-1">
				<router-link :to="{
					name: 'payments_year_month',
					params: { year: $route.params.year, month: $route.params.month },
				}"><i class="fas fa-angle-double-left"></i></router-link>
			</div>
			<div class="col">
				<span class="text-small primary me-2" v-if="this.category_name">{{ this.category_name }}</span>
				<span v-if="this.$route.params.year" class="text-primary">{{ this.$route.params.year }}-</span>
				<span v-if="this.$route.params.month" class="text-primary">{{ this.$route.params.month }}</span>
				<span v-if="this.$route.query.user">[{{ this.$route.query.user }}]</span>
			</div>
		</div>
		<div class="row" v-if="this.total">
			<div class="col-2 h4 text-success">Total:</div>
			<div class="col-4 h4 text-danger">{{ this.total.toLocaleString() }} {{ selectedCurrency || "" }}</div>
			<div class="col-4">{{ this.total_cnt }}</div>
		</div>
		<div class="row">
			<div class="col-md-8">
				<b-table-simple hover small caption-top responsive>
					<!-- <caption>category: {{ category_name }}</caption> -->
					<colgroup>
						<col />
						<col />
						<col />
						<col />
					</colgroup>
					<b-thead head-variant="dark">
						<b-tr>
							<b-th @click="sortPayments(1)">Date</b-th>
							<b-th @click="sortPayments(2)">Sub Category</b-th>
							<b-th>Descript</b-th>
							<b-th @click="sortPayments(3)">Amount</b-th>
							<b-th>Mono user</b-th>
						</b-tr>
					</b-thead>

					<b-tbody v-if="(payments.length > 0)">
						<b-tr v-for="(payment, index) in payments" :key="index" @click="openFormEditPayment(payment.id)">
							<b-td>
						<span>
							{{ $moment(payment.rdate).format("DD.MMM") }}
						</span>
							</b-td>
							<b-td><span v-if="payment.category_name !== category_name">{{ payment.category_name }}</span></b-td>
							<b-td>{{ payment.mydesc }}</b-td>
							<b-td>{{ payment.amount.toLocaleString() || 0 }}</b-td>
							<b-td>{{ payment.mono_user_name }}</b-td>
						</b-tr>
					</b-tbody>
				</b-table-simple>
				<div v-if="(payments.length === 0)">Data loading...</div>
			</div>
		</div>
	</div>
</template>

<script>
import PaymentService from "../../services/PaymentService";
import moment from "moment";
import store from "../../store";

export default {
	name: "PaymentsDetail",
	data() {
		return {
			selectedCategoryId: "",
			okTitle: "",
			showModal: false,
			payments: [],
			q: this.$route.query.q || "",
			total: 0,
			total_cnt: 0,
			currentPayment: {
				"category_id": this.$store.state.sprs.categories[0].id,
				// "rdate": this.formatDate(new Date().toLocaleDateString()),
				"rdate": this.getCurrentDate(),
				"refuel_data": { "km": "", "litres": "", "price_val": "", "station_name": "" },
				"currency_amount": 0,
				"mydesc": "",
				"currency": "UAH",
				"source": "pwa",
			},
			selectedCategory: { name: "" },
			categories: [],
			sources: [],
			currencies: [],
			category_name: "",
		};
	},
	created() {
	},
	computed: {
		formattedCategories() {
			console.log("formattedCategories => ()", this.categories);
			return this.formatCategories(this.categories);
		},
		isFuel() {
			return this.selectedCategory && this.selectedCategory.is_fuel;
		},
		currentUser() {
			return this.$store.state.auth.user;
		},
		selectedCurrency() {
			return store.state.sprs.selectedCurrency;
		},
	},
	watch: {
		"selectedCategory.name": function(newName, oldName) {
			console.log("Change category.name to", newName, " from: ", oldName);
		},
		"selectedCategoryId": function(newCategoryId, oldCategoryId) {
			console.log("Change selectedCategoryId to", newCategoryId, " from: ", oldCategoryId);
			this.currentPayment.category_id = parseInt(newCategoryId);
			this.selectedCategory = this.categories.find(category => category.id === parseInt(newCategoryId));
			if (this.isFuel && !this.currentPayment.refuel_data.km && this.currentPayment.mydesc) {
				this.currentPayment.refuel_data.station_name = this.currentPayment.mydesc;
			}
		},
		"$route.query.action": function(newAction, oldAction) {
			console.log("oldAction: ", oldAction);
			if (newAction === "add") {
				this.openFormAddPayment();
			}
		},
		"$route.path": function(newPath, oldPath) {
			console.log("Change route.path to", newPath, " from: ", oldPath);
			this.getPayments();
		},
		"$store.state.buttonClicked": function(newAction, oldAction) {
			console.log("Change buttonClicked to", newAction, " from: ", oldAction);
			if (newAction) {
				this.openFormAddPayment();
				this.$store.commit("setButtonClicked", false);
			}
		},
	},
	methods: {
		formatCategories(categories, parentId = null, prefix = "") {
			return categories.reduce((acc, category) => {
				if ((category.parent_id === parentId) || (parentId === null && !category.parent_id)) {
					acc.push({
						...category,
						name: prefix + category.name,
					});
					const children = this.formatCategories(categories, category.id, prefix + "--");
					acc = acc.concat(children);
				}
				return acc;
			}, []);
		},
		getCurrentDate() {
			const date = new Date();
			const formattedDate = date.toISOString().split("T")[0];
			console.log(formattedDate);
			return formattedDate;
		},
		setCategory() {
			if (!this.categories) {
				this.categories = this.$store.state.sprs.categories;
			}
		},
		openFormAddPayment() {
			console.log("this.categories", this.categories);
			this.setCategory();
			this.okTitle = "Add";
			this.currentPayment.rdate = this.getCurrentDate();
			this.currentPayment.action = "add";
			this.currentPayment.category_id = this.categories[0].id;
			this.currentPayment.currency = "UAH";
			this.currentPayment.refuel_data = { "km": "", "litres": "", "price_val": "", "station_name": "" };
			this.showModal = true;
		},
		async openFormEditPayment(id) {
			PaymentService.getPayment(id)
				.then((response) => {
					response.data["rdate"] = moment(response.data["rdate"]).format(
						"YYYY-MM-DD",
					);
					this.currentPayment = response.data;
					this.currentPayment.action = "edit";
					if (!this.currentPayment.refuel_data) {
						this.currentPayment.refuel_data = {
							"km": "",
							"litres": "",
							"price_val": "",
							"station_name": "",
						};
					}
					this.setCategory();
					this.selectedCategoryId = this.currentPayment.category_id;
					console.log(response.data);
					this.okTitle = "Edit";
					this.$nextTick(() => {
						this.setCategory();
					});
					this.showModal = true;
				})
				.catch((e) => {
					console.log(e);
				});
		},
		doFormAction() {
			console.log("this.currentPayment.action: ", this.currentPayment.action);
			if (this.currentPayment.action === "edit") {
				this.doUpdatePayment();
			} else if (this.currentPayment.action === "add") {
				this.doAddPayment();
			}
		},
		async doAddPayment() {
			PaymentService.addPayment(this.currentPayment)
				.then((response) => {
					console.log("response.data.rdate: ", response.data.rdate);
					this.$refs.myAlert.showAlert("success", "Payment added");
					const [year, month] = this.currentPayment.rdate.split("-").slice(0, 2);
					const formattedMonth = month.replace(/^0+/, "");
					if (
						(this.$route.params.year !== year) ||
						(this.$route.params.month !== formattedMonth) ||
						(this.$route.params.category_id !== this.currentPayment.category_id)
					) {
						this.$router.push({
							name: "payments",
							params: {
								year: year,
								month: formattedMonth,
								category_id: this.currentPayment.category_id,
							},
						});
					}
				})
				.catch((e) => {
					console.log(e);
					this.$refs.myAlert.showAlert("danger", "Payment add failed");
				});
			this.showModal = false;
			this.selectedCategory = undefined;
			this.isFuel = false;

		},
		async doUpdatePayment() {
			PaymentService.updatePayment(this.currentPayment.id, this.currentPayment)
				.then((response) => {
					this.currentPayment = response.data;
					this.payments.map((c, index) => {
						if (c.id === this.currentPayment.id) {
							this.payments[index] = {
								id: this.currentPayment.id,
								category_id: this.currentPayment.category_id,
								category_name: this.currentPayment.category_name,
								mydesc: this.currentPayment.mydesc,
								rdate: this.currentPayment.rdate,
								amount: this.currentPayment.currency_amount,
							};
						}
					});
					this.$refs.myAlert.showAlert("success", "Payment updated");
				})
				.catch((e) => {
					console.log(e);
					this.$refs.myAlert.showAlert("danger", "Payment update failed");
				});
			this.showModal = false;
		},
		async delPayment() {
			PaymentService.deletePayment(this.currentPayment.id)
				.then((response) => {
					console.log(response.data.data);
					const index = this.payments
						.map(function(item) {
							return item.id;
						})
						.indexOf(this.currentPayment.id);
					this.payments.splice(index, 1);
				})
				.catch((e) => {
					console.log(e);
				});
			this.showModal = false;
		},
		async getPayments() {
			console.log(`getPayments => store.state.sprs.selectedCurrency=${store.state.sprs.selectedCurrency}`);
			let data = {
				sort: this.$route.query.sort || "",
				year: this.$route.params.year || "",
				month: this.$route.params.month || "",
				category_id: this.$route.params.category_id || "",
				q: this.$route.query.q || "",
				currency: store.state.sprs.selectedCurrency || "UAH",
			};
			console.log(data);
			PaymentService.getPayments(data)
				.then((response) => {
					this.payments = response.data;
					console.log(response.data);
					let total = 0;
					let total_cnt = 0;
					this.payments.forEach((val) => {
						total += Number(val.amount);
						total_cnt += 1;
						//or if you pass float numbers , use parseFloat()
					});
					this.total = total;
					this.total_cnt = total_cnt;
					console.log(total);
				})
				.catch((e) => {
					console.log(e);
				});
		},
		sortPayments(sort_table) {
			console.log(sort_table);
		},
		async searchPayments() {
			PaymentService.getPayments({ q: this.q })
				.then((response) => {
					this.payments = response.data;
					console.log(response.data);
				})
				.catch((e) => {
					console.log(e);
				});
		},
		findCategoryNameById(categoryId) {
            const category = this.categories.find(category => category.id === parseInt(categoryId));
            return category ? category.name : null;
        }
	},
	async mounted() {
		if (!this.currentUser) {
			this.$router.push({ name: "login" });
		}
		this.categories = this.$store.state.sprs.categories;
		this.currencies = this.$store.state.sprs.currencies;
		this.sources = this.$store.state.sprs.sources;
		this.action = this.$route.query.action;
		this.category_name = this.findCategoryNameById(this.$route.params.category_id);
		console.log("this.action : ", this.action);
		await this.getPayments();
		if (this.action === "add") {
			this.openFormAddPayment();
		}
	},
};
</script>
