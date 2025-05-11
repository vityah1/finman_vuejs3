<template>
	<div class="container">
		<alert-component ref="myAlert"></alert-component>
		<!-- Modal -->
		<b-modal v-model="showModal" :title="okTitle" @ok="doFormAction()">
			<template #modal-header>
				<h5 class="modal-title text-danger">
					{{ okTitle }} Payment [{{ currentPayment.id }}]
				</h5>
			</template>
			<template #default>
				<b-form v-if="currentPayment">
					<div class="form-row">
						<label for="rdate">Date:</label>
						<input id="rdate" v-model="currentPayment.rdate" class="form-control" type="date" />
					</div>
					<div class="form-row">
						<label for="main_category">Category:</label>
						<select id="main_category" v-model="selectedCategoryId" class="form-control"
								name="main_category">
							<option disabled value="">Select category...</option>
							<template v-for="category in formattedCategories" :key="category.id">
								<option :value="category.id">{{ category.name }}</option>
							</template>
						</select>
					</div>
					<div v-if="isFuel" class="form-row">
						<label for="id_km">km:</label>
						<input id="id_km" v-model="currentPayment.refuel_data.km" class="form-control" type="text" />
						<label for="id_litres">Litres:</label>
						<input id="id_litres" v-model="currentPayment.refuel_data.litres" class="form-control" type="text" />
						<label for="id_price_val">Price (EUR):</label>
						<input id="id_price_val" v-model="currentPayment.refuel_data.price_val" class="form-control" type="text" />
						<label for="id_name_station">Name station:</label>
						<input id="id_name_station" v-model="currentPayment.refuel_data.station_name"
                           class="form-control" type="text" />
					</div>
					<div v-if="!isFuel" class="form-row">
						<label for="mydesc">Description:</label>
						<input id="mydesc" v-model="currentPayment.mydesc" class="form-control" type="text" />
					</div>
					<div class="row">
						<div class="col-md-4">
							<label for="amount"><strong>Amount:</strong></label>
							<input id="amount" v-model="currentPayment.currency_amount" class="form-control" type="text" />
						</div>
						<div class="col-md-4">
							<label for="source">Source:</label>
							<select id="source" ref="source" v-model="currentPayment.source" class="form-control"
									name="source">
								<option v-for="item in sources" :key="item.id" :value="item.source">{{ item.source }}
								</option>
							</select>
						</div>
						<div class="col-md-4">
							<label for="currency">Currency:</label>
							<select id="currency" ref="currency" v-model="currentPayment.currency" class="form-control"
									name="currency">
								<option value="USD">USD</option>
								<option value="EUR">EUR</option>
								<option value="UAH">UAH</option>
							</select>
						</div>
					</div>
				</b-form>
				<b-button v-if="currentPayment.action === 'edit'" class="mt-2" variant="danger" @click="delPayment">
					Delete
				</b-button>
			</template>
		</b-modal>

		<div class="row">
			<div class="col-1">
				<router-link
					:to="{ name: 'payments_year_month', params: { year: $route.params.year, month: $route.params.month } }">
					<i class="fas fa-angle-double-left"></i>
				</router-link>
			</div>
			<div class="col">
				<span v-if="category_name" class="text-small primary me-2">{{ category_name }}</span>
				<span v-if="$route.params.year" class="text-primary">{{ $route.params.year }}-</span>
				<span v-if="$route.params.month" class="text-primary">{{ $route.params.month }}</span>
				<span v-if="$route.query.user">[{{ $route.query.user }}]</span>
			</div>
		</div>
		<div v-if="total" class="row">
			<div class="col-2 h4 text-success">Total:</div>
			<div class="col-4 h4 text-danger">{{ total.toLocaleString() }} {{ selectedCurrency || "" }}</div>
			<div class="col-4">{{ total_cnt }}</div>
		</div>
		<div v-if="hasSelectedPayments" class="row mb-3">
			<div class="col-md-8">
				<div class="d-flex">
					<b-dropdown :text="`Операції з вибраними (${selectedPaymentsCount})`" variant="primary" class="mr-2">
						<b-dropdown-item @click="showChangeCategoryModal">
							<i class="fas fa-tag mr-2"></i> Змінити категорію
						</b-dropdown-item>
						<b-dropdown-item @click="showBulkDeleteConfirmModal">
							<i class="fas fa-trash-alt mr-2"></i> Видалити
						</b-dropdown-item>
					</b-dropdown>
				</div>
			</div>
		</div>

		<!-- Модальне вікно для зміни категорії вибраних платежів -->
		<b-modal v-model="showCategoryModal" title="Зміна категорії для платежів" @ok="changeCategory">
			<template #modal-header>
				<h5 class="modal-title">Зміна категорії для платежів ({{ selectedPaymentsCount }})</h5>
			</template>
			<template #default>
				<div class="mb-3">
					<label class="form-label">Виберіть нову категорію:</label>
					<select v-model="newCategoryId" class="form-control">
						<option disabled value="">Оберіть категорію...</option>
						<template v-for="category in formattedCategories" :key="category.id">
							<option :value="category.id">{{ category.name }}</option>
						</template>
					</select>
				</div>
				<div class="mb-3">
					<h6>Вибрані платежі:</h6>
					<ul class="list-group">
						<li v-for="payment in selectedPaymentsList" :key="payment.id" class="list-group-item d-flex justify-content-between align-items-center">
							<div>
								<small>{{ formatDate(payment.rdate) }}</small>:
								{{ payment.mydesc || payment.category_name }}
							</div>
							<span class="badge bg-primary rounded-pill">
								{{ payment.amount ? payment.amount.toLocaleString() : '0' }}
							</span>
						</li>
					</ul>
				</div>
			</template>
		</b-modal>

		<!-- Модальне вікно для підтвердження масового видалення платежів -->
		<b-modal v-model="showDeleteModal" title="Підтвердження видалення" @ok="bulkDeletePayments">
			<template #modal-header>
				<h5 class="modal-title text-danger">Підтвердження видалення платежів</h5>
			</template>
			<template #default>
				<div class="alert alert-warning">
					<i class="fas fa-exclamation-triangle mr-2"></i> Ви дійсно бажаєте видалити {{ selectedPaymentsCount }} платежів? Ця дія безворотна.
				</div>
				<div class="mb-3">
					<h6>Вибрані платежі для видалення:</h6>
					<ul class="list-group">
						<li v-for="payment in selectedPaymentsList" :key="payment.id" class="list-group-item d-flex justify-content-between align-items-center">
							<div>
								<small>{{ formatDate(payment.rdate) }}</small>:
								{{ payment.mydesc || payment.category_name }}
							</div>
							<span class="badge bg-danger rounded-pill">
								{{ payment.amount ? payment.amount.toLocaleString() : '0' }}
							</span>
						</li>
					</ul>
				</div>
			</template>
			<template #modal-footer="{ ok, cancel }">
				<b-button variant="secondary" @click="cancel()">
					Скасувати
				</b-button>
				<b-button variant="danger" @click="ok()">
					Видалити
				</b-button>
			</template>
		</b-modal>

		<div class="row">
			<div class="col-md-8">
				<b-table-simple caption-top hover responsive small>
					<colgroup>
						<col />
						<col />
						<col />
						<col />
					</colgroup>
					<b-thead head-variant="dark">
						<b-tr>
<b-th style="width: 40px;">
	<input type="checkbox" v-model="selectAll" @change="toggleSelectAll" />
</b-th>
<b-th @click="sortBy('rdate')">Date&nbsp;↑↓</b-th>
<b-th>Sub Category</b-th>
<b-th @click="sortBy('mydesc')">Description&nbsp;↑↓</b-th>
<b-th @click="sortBy('amount')">Amount&nbsp;↑↓</b-th>
<b-th>User</b-th>
						</b-tr>
					</b-thead>
					<b-tbody v-if="payments.length > 0">
						<b-tr v-for="(payment, index) in sortedPayments" :key="index">
							<b-td style="width: 40px;" @click.stop>
								<input type="checkbox" :checked="isPaymentSelected(payment.id)" @change="togglePaymentSelection(payment.id)" />
							</b-td>
							<b-td @click="openFormEditPayment(payment.id)">{{ formatDate(payment.rdate) }}</b-td>
							<b-td @click="openFormEditPayment(payment.id)"><span v-if="payment.category_name !== category_name">{{ payment.category_name
								}}</span></b-td>
							<b-td @click="openFormEditPayment(payment.id)">{{ payment.mydesc }}</b-td>
							<b-td @click="openFormEditPayment(payment.id)">{{ payment.amount ? payment.amount.toLocaleString() : '0' }}</b-td>
							<b-td @click="openFormEditPayment(payment.id)">{{ payment.user_login }}</b-td>
						</b-tr>
					</b-tbody>
				</b-table-simple>
				<div v-if="payments.length === 0">Data loading...</div>
			</div>
		</div>
	</div>
</template>

<script>
import PaymentService from "../../services/PaymentService";
import moment from "moment";
import store from "../../store";
// import { formatDate } from "@vueuse/shared";

export default {
	name: "PaymentsDetail",
	data() {
		return {
			selectedCategoryId: "",
			okTitle: "",
			showModal: false,
			showCategoryModal: false,
			showDeleteModal: false,
			newCategoryId: "",
			payments: [],
			q: this.$route.query.q || "",
			total: 0,
			total_cnt: 0,
			currentPayment: {
				category_id: this.$store.state.sprs.categories && this.$store.state.sprs.categories.length > 0 ? this.$store.state.sprs.categories[0].id : null,
				rdate: this.getCurrentDate(),
				refuel_data: { km: "", litres: "", price_val: "", station_name: "" },
				currency_amount: 0,
				mydesc: "",
				currency: "UAH",
				source: "pwa",
			},
			selectedCategory: { name: "" },
			categories: [],
			sources: [],
			currencies: [],
			category_name: "",
			sortKey: "",
			sortOrder: 1,
			selectedPayments: {},
			selectAll: false,
		};
	},
	computed: {
		formattedCategories() {
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
		sortedPayments() {
    if (!this.sortKey) return this.payments;
    return [...this.payments].sort((a, b) => {
      let aValue = a[this.sortKey];
      let bValue = b[this.sortKey];
      if (this.sortKey === 'rdate') {
        aValue = this.parseDate(aValue);
        bValue = this.parseDate(bValue);
      }
      let result = 0;
      if (aValue < bValue) result = -1;
      if (aValue > bValue) result = 1;
      return result * this.sortOrder;
    });
  },
		hasSelectedPayments() {
			return this.selectedPaymentsCount > 0;
		},
		selectedPaymentsCount() {
			return Object.values(this.selectedPayments).filter(value => value).length;
		},
		selectedPaymentsList() {
			return this.payments.filter(payment => this.selectedPayments[payment.id]);
		},
		selectedPaymentIds() {
			return Object.keys(this.selectedPayments)
				.filter(key => this.selectedPayments[key])
				.map(key => parseInt(key));
		},
	},
	watch: {
		selectedCategoryId(newCategoryId) {
			this.currentPayment.category_id = parseInt(newCategoryId);
			// Перевіряємо, чи categories є масивом перед викликом find
			if (Array.isArray(this.categories)) {
				this.selectedCategory = this.categories.find(category => category.id === parseInt(newCategoryId)) || { name: "" };
			} else {
				console.error('categories не є масивом:', this.categories);
				this.selectedCategory = { name: "" };
			}
			if (this.isFuel && !this.currentPayment.refuel_data.km && this.currentPayment.mydesc) {
				this.currentPayment.refuel_data.station_name = this.currentPayment.mydesc;
			}
		},
		'$store.state.sprs.selectedCurrency'() {
        this.getPayments();
    },
		"$route.query.action"(newAction) {
			if (newAction === "add") {
				this.openFormAddPayment();
			}
		},
		"$route.path"() {
			this.getPayments();
		},
		"$store.state.buttonClicked"(newAction) {
			if (newAction) {
				this.openFormAddPayment();
				this.$store.commit("setButtonClicked", false);
			}
		}
		},
	methods: {
		formatDate(date) {
			return moment(date).format('DD.MM.YYYY');
		},
		parseDate(date) {
			// Використовуємо moment без вказання формату, щоб він ідентифікував формат автоматично
			return moment(date).toDate();
		},
		formatCategories(categories, parentId = null, prefix = "") {
			if (!Array.isArray(categories)) {
				return [];
			}
			return categories.reduce((acc, category) => {
				if (category.parent_id === parentId || (parentId === null && !category.parent_id)) {
					acc.push({ ...category, name: prefix + category.name });
					const children = this.formatCategories(categories, category.id, prefix + "--");
					acc = acc.concat(children);
				}
				return acc;
			}, []);
		},
		getCurrentDate() {
			const date = new Date();
			return date.toISOString().split("T")[0];
		},
		setCategory() {
			// Просто використовуємо категорії зі store
			this.categories = this.$store.state.sprs.categories;
			console.log('Категорії отримано зі store:', this.categories.length);
		},
		openFormAddPayment() {
			// Отримуємо категорії зі store
			this.setCategory();

			// Перевіряємо, чи є категорії
			if (this.categories.length === 0) {
				console.error('Немає доступних категорій для вибору');
				this.$refs.myAlert.showAlert('danger', 'Немає доступних категорій. Спробуйте оновити сторінку.');
				return;
			}

			this.okTitle = "Add";
			this.currentPayment = {
				category_id: this.categories[0].id,
				rdate: this.getCurrentDate(),
				refuel_data: { km: "", litres: "", price_val: "", station_name: "" },
				currency_amount: 0,
				mydesc: "",
				currency: "UAH",
				source: "pwa",
				action: "add",
			};

			// Встановлюємо початкову категорію в селекторі
			this.selectedCategoryId = this.categories[0].id.toString();
			console.log('Встановлено початкову категорію:', this.selectedCategoryId);

			this.showModal = true;
		},
		async openFormEditPayment(id) {
			try {
				// Отримуємо категорії зі store
				this.setCategory();

				// Отримуємо дані платежу
				const response = await PaymentService.getPayment(id);
				this.currentPayment = {
					...response.data,
					rdate: moment(response.data.rdate).format("YYYY-MM-DD"),
					action: "edit",
				};
				if (!this.currentPayment.refuel_data) {
					this.currentPayment.refuel_data = { km: "", litres: "", price_val: "", station_name: "" };
				}

				// Встановлюємо ID категорії для вибору в селекторі
				const categoryId = this.currentPayment.category_id;
				console.log('Встановлюємо категорію:', categoryId);
				this.selectedCategoryId = categoryId ? categoryId.toString() : "";

				this.okTitle = "Edit";
				this.showModal = true;
			} catch (e) {
				console.error('Помилка відкриття форми редагування:', e);
			}
		},
		async doFormAction() {
			if (this.currentPayment.action === "edit") {
				await this.doUpdatePayment();
			} else if (this.currentPayment.action === "add") {
				await this.doAddPayment();
			}
		},
		async doAddPayment() {
			try {
				await PaymentService.addPayment(this.currentPayment);
				this.$refs.myAlert.showAlert("success", "Payment added");
				const [year, month] = this.currentPayment.rdate.split("-").slice(0, 2);
				const formattedMonth = month.replace(/^0+/, "");
				if (this.$route.params.year !== year || this.$route.params.month !== formattedMonth || this.$route.params.category_id !== this.currentPayment.category_id) {
					this.$router.push({
						name: "payments",
						params: { year, month: formattedMonth, category_id: this.currentPayment.category_id },
					});
				}
				this.showModal = false;
			} catch (e) {
				console.log(e);
				this.$refs.myAlert.showAlert("danger", "Payment add failed");
			}
		},
		async doUpdatePayment() {
			try {
				// Зберігаємо стару категорію для порівняння
				const oldCategoryId = this.$route.params.category_id;

				await PaymentService.updatePayment(this.currentPayment.id, this.currentPayment);

				// Перевіряємо, чи змінилася категорія
				if (oldCategoryId && this.currentPayment.category_id.toString() !== oldCategoryId.toString()) {
					// Якщо категорія змінилася і ми знаходимося в списку конкретної категорії,
					// потрібно оновити весь список
					this.$refs.myAlert.showAlert("success", "Payment updated");
					this.showModal = false;
					// Оновлюємо список платежів
					this.getPayments();
				} else {
					// Якщо категорія не змінилася, просто оновлюємо платіж у списку
					this.payments = this.payments.map(c => (c.id === this.currentPayment.id ? this.currentPayment : c));
					this.$refs.myAlert.showAlert("success", "Payment updated");
					this.showModal = false;
				}
			} catch (e) {
				console.log(e);
				this.$refs.myAlert.showAlert("danger", "Payment update failed");
			}
		},
		async delPayment() {
			try {
				await PaymentService.deletePayment(this.currentPayment.id);
				this.payments = this.payments.filter(c => c.id !== this.currentPayment.id);
				this.showModal = false;
			} catch (e) {
				console.log(e);
			}
		},
		async getPayments() {
    let data = {
        sort: this.$route.query.sort || "",
        year: this.$route.params.year || "",
        month: this.$route.params.month || "",
        category_id: this.$route.params.category_id || "",
        q: this.$route.query.q || "",
        currency: store.state.sprs.selectedCurrency || "UAH",
        group_user_id: this.$route.query.group_user_id || ""
    };
    try {
        const response = await PaymentService.getPayments(data);
        this.payments = response.data;
        this.total = this.payments.reduce((sum, val) => sum + Number(val.amount), 0);
        this.total_cnt = this.payments.length;
    } catch (e) {
        console.log(e);
    }
},
		sortBy(key) {
			if (this.sortKey === key) {
				this.sortOrder *= -1;
			} else {
				this.sortKey = key;
				this.sortOrder = 1;
			}
		},
		findCategoryNameById(categoryId) {
			if (!Array.isArray(this.categories) || !this.categories.length) {
				return "";
			}
			return this.categories.find(category => category.id === parseInt(categoryId))?.name || "";
		},
		isPaymentSelected(paymentId) {
			return Boolean(this.selectedPayments[paymentId]);
		},

		togglePaymentSelection(paymentId) {
			// У Vue 3 ми можемо просто присвоїти значення
			const newValue = !this.isPaymentSelected(paymentId);
			// Створюємо новий об'єкт для реактивності
			this.selectedPayments = { ...this.selectedPayments, [paymentId]: newValue };
			console.log(`Платіж ${paymentId} ${newValue ? 'вибрано' : 'знято'}`);
		},

		toggleSelectAll() {
			const newValue = this.selectAll;
			const newSelectedPayments = {};
			this.payments.forEach(payment => {
				newSelectedPayments[payment.id] = newValue;
			});
			this.selectedPayments = newSelectedPayments;
			console.log(`${newValue ? 'Вибрано' : 'Знято'} всі платежі`);
		},
		showChangeCategoryModal() {
			this.newCategoryId = "";
			this.showCategoryModal = true;
		},
		showBulkDeleteConfirmModal() {
			this.showDeleteModal = true;
		},
		bulkDeletePayments() {
			const payload = {
				payment_ids: this.selectedPaymentIds
			};

			PaymentService.bulkDeletePayments(payload)
				.then(response => {
					if (response.data.status === "ok") {
						this.$refs.myAlert.showAlert('success', response.data.message);
						// Оновлюємо список платежів
						this.getPayments();
						// Скидаємо вибрані платежі
						this.selectedPayments = {};
						this.selectAll = false;
					} else {
						this.$refs.myAlert.showAlert('danger', 'Не вдалося видалити платежі');
					}
				})
				.catch(error => {
					console.error("Error deleting payments:", error);
					this.$refs.myAlert.showAlert('danger', 'Не вдалося видалити платежі: ' + error.message);
				});
		},
		changeCategory() {
			if (!this.newCategoryId) {
				this.$refs.myAlert.showAlert('danger', 'Виберіть категорію');
				return;
			}

			const payload = {
				payment_ids: this.selectedPaymentIds,
				category_id: parseInt(this.newCategoryId)
			};

			PaymentService.changePaymentsCategory(payload)
				.then(response => {
					if (response.data.status === "ok") {
						this.$refs.myAlert.showAlert('success', response.data.message);
						// Оновлення даних після зміни категорії
						this.getPayments();
						// Скидаємо вибрані платежі
						this.selectedPayments = {};
						this.selectAll = false;
					} else {
						this.$refs.myAlert.showAlert('danger', 'Не вдалося змінити категорію');
					}
				})
				.catch(error => {
					console.error("Error changing category:", error);
					this.$refs.myAlert.showAlert('danger', 'Не вдалося змінити категорію: ' + error.message);
				});
		},
	},
	async mounted() {
		if (!this.currentUser) {
			this.$router.push({ name: "login" });
		}
		// Перевіряємо, чи дані з store є масивами
		const storeCategories = this.$store.state.sprs.categories;
		this.categories = Array.isArray(storeCategories) ? storeCategories : [];

		const storeCurrencies = this.$store.state.sprs.currencies;
		this.currencies = Array.isArray(storeCurrencies) ? storeCurrencies : [];

		const storeSources = this.$store.state.sprs.sources;
		this.sources = Array.isArray(storeSources) ? storeSources : [];

		console.log('Категорії завантажено:', this.categories.length);

		this.category_name = this.findCategoryNameById(this.$route.params.category_id);
		await this.getPayments();
		if (this.$route.query.action === "add") {
			this.openFormAddPayment();
		}

	},
};
</script>