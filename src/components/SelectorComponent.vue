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
		<div class="col-auto">
			<select
				id="mono_user"
				v-model="localMonoUserId"
				class="form-control w-auto"
				name="mono_user"
				@change="emitChange"
			>
				<option value="">All</option>
				<option v-for="mono_user in mono_users" :key="mono_user.id" :value="mono_user.id">
					{{ mono_user.name }}
				</option>
			</select>
		</div>
	</div>
</template>

<script>
import MonoUsersService from "@/services/MonoUsersService";
import PaymentService from "@/services/PaymentService";
import store from "@/store";

export default {
	name: "SelectorComponent",
	data() {
		return {
			localYear: undefined,
			localMonth: undefined,
			localMonoUserId: undefined,
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
			mono_users: [],
		};
	},
	methods: {
		emitChange() {
			this.$emit("change", {
				year: this.localYear,
				month: this.localMonth,
				mono_user_id: this.localMonoUserId,
			});
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
		async getMonoUsers() {
			MonoUsersService.getMonoUsers()
				.then((response) => {
					this.mono_users = response.data;
				})
				.catch((e) => {
					console.log(e);
				});
		},
	},
	mounted() {
		this.getPaymentsYears();
		this.getMonoUsers();
        this.localYear = this.$route.params.year || new Date().getFullYear();
        this.localMonth = this.$route.params.month || new Date().getMonth() + 1;
	},
};
</script>
