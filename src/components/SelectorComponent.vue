<template>
	<div class="filter-container mb-3">
		<div class="input-group mb-2">
			<div class="col-auto">
				<select
					id="year"
					v-model="localYear"
					class="form-control w-auto"
					name="year"
					@change="emitChange"
				>
					<option v-for="(y, index) in years" :key="index" :value="y">
						{{ y }}
					</option>
				</select>
			</div>
			&nbsp;
			<div class="col-auto">
				<select
					id="month"
					v-model="localMonth"
					class="form-control w-auto"
					name="month"
					@change="emitChange"
				>
					<option v-for="m in months" :key="m.number" :value="m.number">
						[{{ m.number }}] {{ m.name }}
					</option>
				</select>
			</div>
			&nbsp;
			<div class="col-auto" v-if="userGroup">
				<select
					id="group_user"
					v-model="localGroupUserId"
					class="form-control w-auto"
					name="group_user"
					@change="emitChange"
				>
					<option value="">Всі користувачі групи</option>
					<option v-for="user in groupUsers" :key="user.id" :value="user.id">
						{{ user.fullname || user.login }}
					</option>
				</select>
			</div>
			&nbsp;
			<div class="col-auto">
				<button 
					type="button" 
					class="btn btn-outline-primary btn-sm"
					@click="openCustomPeriodModal"
				>
					<i class="fas fa-calendar-alt"></i> Кастомний період
				</button>
			</div>
		</div>

		<!-- Модалка для кастомного періоду -->
		<div v-if="showModal" class="modal fade show d-block" tabindex="-1" style="background-color: rgba(0,0,0,0.5);">
			<div class="modal-dialog">
				<div class="modal-content">
					<div class="modal-header">
						<h5 class="modal-title">Вибрати кастомний період</h5>
						<button type="button" class="btn-close" @click="closeModal" aria-label="Close"></button>
					</div>
					<div class="modal-body">
						<div class="row">
							<div class="col-md-6">
								<label for="modal_start_date" class="form-label">Дата початку:</label>
								<input 
									type="date" 
									id="modal_start_date" 
									v-model="modalStartDate"
									class="form-control"
								>
							</div>
							<div class="col-md-6">
								<label for="modal_end_date" class="form-label">Дата кінця:</label>
								<input 
									type="date" 
									id="modal_end_date" 
									v-model="modalEndDate"
									class="form-control"
								>
							</div>
						</div>
					</div>
					<div class="modal-footer">
						<button type="button" class="btn btn-secondary" @click="closeModal">Скасувати</button>
						<button type="button" class="btn btn-primary" @click="applyCustomPeriod">Застосувати</button>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import GroupService from "@/services/GroupService";
import PaymentService from "@/services/PaymentService";
import store from "@/store";

export default {
	name: "SelectorComponent",
	data() {
		return {
			localYear: undefined,
			localMonth: undefined,
			localGroupUserId: undefined,
			modalStartDate: '',
			modalEndDate: '',
			showModal: false,
			userGroup: null, // Група користувача
			years: [],
			months: [
				{ number: 1, name: "Січень" },
				{ number: 2, name: "Лютий" },
				{ number: 3, name: "Березень" },
				{ number: 4, name: "Квітень" },
				{ number: 5, name: "Травень" },
				{ number: 6, name: "Червень" },
				{ number: 7, name: "Липень" },
				{ number: 8, name: "Серпень" },
				{ number: 9, name: "Вересень" },
				{ number: 10, name: "Жовтень" },
				{ number: 11, name: "Листопад" },
				{ number: 12, name: "Грудень" },
				{ number: 99, name: "Всі" },
			],
			groupUsers: [],
			isInitializing: true,
		};
	},
	computed: {
		currentUser() {
			return this.$store.state.auth.user;
		}
	},
	methods: {
		openCustomPeriodModal() {
			// Встановлюємо дати за замовчуванням відповідно до поточного вибраного місяця
			this.setDefaultModalDates();
			
			// Відкриваємо модалку
			this.showModal = true;
		},

		closeModal() {
			this.showModal = false;
		},

		setDefaultModalDates() {
			if (this.localYear && this.localMonth) {
				const year = parseInt(this.localYear);
				const month = parseInt(this.localMonth);
				
				// Початок місяця
				this.modalStartDate = `${year}-${month.toString().padStart(2, '0')}-01`;
				
				// Кінець місяця
				const nextMonth = month === 12 ? 1 : month + 1;
				const nextYear = month === 12 ? year + 1 : year;
				const lastDay = new Date(nextYear, nextMonth - 1, 0).getDate();
				this.modalEndDate = `${year}-${month.toString().padStart(2, '0')}-${lastDay.toString().padStart(2, '0')}`;
			}
		},

		applyCustomPeriod() {
			if (!this.modalStartDate || !this.modalEndDate) {
				alert('Заповніть обидві дати');
				return;
			}

			if (this.modalStartDate > this.modalEndDate) {
				alert('Дата початку не може бути пізніше дати кінця');
				return;
			}

			// Закриваємо модалку
			this.showModal = false;

			// Відправляємо дані з кастомним періодом
			const eventData = Object.freeze({
				mode: 'custom',
				start_date: this.modalStartDate,
				end_date: this.modalEndDate,
				group_user_id: this.localGroupUserId,
			});

			console.log("Відправляємо кастомний період:", eventData);
			this.$emit("change", eventData);
		},

		emitChange() {
			if (this.isInitializing) {
				console.log("Ігнорується emitChange під час ініціалізації");
				return;
			}

			// Звичайний режим місяць/рік
			const eventData = Object.freeze({
				mode: 'period',
				year: this.localYear,
				month: this.localMonth,
				group_user_id: this.localGroupUserId,
			});

			console.log("Відправляємо дані з селектора:", eventData);
			this.$emit("change", eventData);
		},
		async getPaymentsYears() {
			PaymentService.getPaymentsYears({ currency: store.state.sprs.selectedCurrency || "UAH", grouped: true })
				.then((response) => {
					let filteredYears = response.data.filter(obj => obj.year > 1900);
					this.years = filteredYears.map(obj => obj.year);
				})
				.catch((e) => {
					console.log(e);
				});
		},
		// В методі getUserGroup
async getUserGroup() {
  GroupService.getGroups()
    .then((response) => {
      if (response.data && response.data.length > 0) {
        // Беремо першу групу, до якої належить користувач
        this.userGroup = response.data[0];
        // Завантажуємо користувачів цієї групи
        this.getGroupUsers(this.userGroup.id);

        // Переконуємося, що ще в процесі ініціалізації
        if (this.isInitializing) {
          // Якщо у локальному сховищі вже є збережений ідентифікатор користувача групи,
          // використовуємо його, але не ініціюємо додаткову подію
          const savedGroupUserId = localStorage.getItem('selectedGroupUserId');
          if (savedGroupUserId) {
            this.localGroupUserId = savedGroupUserId;
          }
        }
      }
    })
    .catch((e) => {
      console.log("Помилка при отриманні груп користувача:", e);
    });
},
		async getGroupUsers(groupId) {
			GroupService.getGroupUsers(groupId)
				.then((response) => {
					this.groupUsers = response.data;
				})
				.catch((e) => {
					console.log("Помилка при отриманні користувачів групи:", e);
				});
		},
	},
	mounted() {
  this.isInitializing = true;

  this.getPaymentsYears();
  this.getUserGroup();

  this.localYear = this.$route.params.year || new Date().getFullYear();
  this.localMonth = this.$route.params.month || new Date().getMonth() + 1;
  this.localGroupUserId = this.$route.query.group_user_id || localStorage.getItem('selectedGroupUserId') || "";

  // Ключова зміна: чекаємо достатньо часу перед розблокуванням подій
  setTimeout(() => {
    this.isInitializing = false;
    console.log("Ініціалізацію завершено, події розблоковано");
  }, 800); // Значно збільшити затримку
},
	watch: {
		localGroupUserId(newVal) {
			if (newVal) {
				localStorage.setItem('selectedGroupUserId', newVal);
			} else {
				localStorage.removeItem('selectedGroupUserId');
			}
		}
	}
};
</script>