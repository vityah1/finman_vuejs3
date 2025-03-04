<template>
	<div class="input-group mb-3">
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
		// В методі emitChange розкоментуємо перевірку ініціалізації
emitChange() {
  if (this.isInitializing) {
    console.log("Ігнорується emitChange під час ініціалізації");
    return;
  }

  // Створюємо незмінювану копію даних
  const eventData = Object.freeze({
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