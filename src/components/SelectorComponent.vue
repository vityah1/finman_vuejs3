<template>
	<div>
		<div>
			<Dropdown
				v-model="localYear"
				:options="years"
				placeholder="Рік"
				@change="emitChange"
			/>
			<Dropdown
				v-model="localMonth"
				:options="monthOptions"
				optionLabel="label"
				optionValue="value"
				placeholder="Місяць"
				@change="emitChange"
			/>
			<Dropdown
				v-if="userGroup"
				v-model="localGroupUserId"
				:options="groupUserOptions"
				optionLabel="label"
				optionValue="value"
				placeholder="Користувач"
				@change="emitChange"
			/>
			<PButton
				icon="pi pi-calendar"
				label="Період"
				@click="openCustomPeriodModal"
			/>
		</div>

		<!-- Custom Period Dialog -->
		<Dialog
			v-model:visible="showModal"
			header="Вибрати кастомний період"
			:modal="true"
			:closable="true"
			:style="{ width: '450px' }"
		>
			<div>
				<div>
					<label for="start_date">Дата початку:</label>
					<Calendar
						v-model="modalStartDate"
						id="start_date"
						dateFormat="yy-mm-dd"
						showIcon
					/>
				</div>
				<div>
					<label for="end_date">Дата кінця:</label>
					<Calendar
						v-model="modalEndDate"
						id="end_date"
						dateFormat="yy-mm-dd"
						showIcon
					/>
				</div>
			</div>
			<template #footer>
				<PButton label="Скасувати" icon="pi pi-times" @click="closeModal" />
				<PButton label="Застосувати" icon="pi pi-check" @click="applyCustomPeriod" />
			</template>
		</Dialog>
	</div>
</template>

<script>
import GroupService from "@/services/GroupService";
import PaymentService from "@/services/PaymentService";
import Dialog from 'primevue/dialog';
import Calendar from 'primevue/calendar';
import Dropdown from 'primevue/dropdown';
import store from "@/store";

export default {
	name: "SelectorComponent",
	props: {
		currentYear: {
			type: [Number, String],
			default: null
		},
		currentMonth: {
			type: [Number, String],
			default: null
		}
	},
	components: {
		Dialog,
		Calendar,
		Dropdown
	},
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
		},
		monthOptions() {
			return this.months.map(m => ({
				label: `[${m.number}] ${m.name}`,
				value: m.number
			}));
		},
		groupUserOptions() {
			return [
				{ label: 'Всі користувачі групи', value: '' },
				...this.groupUsers.map(user => ({
					label: user.fullname || user.login,
					value: user.id
				}))
			];
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

  // Використовуємо пропси якщо вони передані, інакше беремо з роуту або поточну дату
  // Переконуємося що значення конвертуються до чисел
  this.localYear = parseInt(this.currentYear || this.$route.params.year || new Date().getFullYear());
  this.localMonth = parseInt(this.currentMonth || this.$route.params.month || new Date().getMonth() + 1);
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
		},
		currentYear(newVal) {
			if (newVal && newVal !== this.localYear) {
				this.localYear = newVal;
			}
		},
		currentMonth(newVal) {
			if (newVal && newVal !== this.localMonth) {
				this.localMonth = newVal;
			}
		}
	}
};
</script>

<style scoped>
/* NO CUSTOM STYLES - USING PURE PRIMEVUE DEFAULTS */
</style>