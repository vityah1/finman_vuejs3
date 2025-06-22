<template>
	<div class="period-selector">
		<div class="d-flex gap-2">
			<select 
				class="form-select"
				v-model="selectedMonth"
				@change="updatePeriod"
			>
				<option v-for="month in months" :key="month.value" :value="month.value">
					{{ month.label }}
				</option>
			</select>
			
			<select 
				class="form-select"
				v-model="selectedYear" 
				@change="updatePeriod"
			>
				<option v-for="year in years" :key="year" :value="year">
					{{ year }}
				</option>
			</select>
		</div>
	</div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, watch } from 'vue';

export default defineComponent({
	name: 'PeriodSelector',
	props: {
		modelValue: {
			type: String,
			required: true
		}
	},
	emits: ['update:modelValue'],
	setup(props, { emit }) {
		const months = [
			{ value: '01', label: 'Січень' },
			{ value: '02', label: 'Лютий' },
			{ value: '03', label: 'Березень' },
			{ value: '04', label: 'Квітень' },
			{ value: '05', label: 'Травень' },
			{ value: '06', label: 'Червень' },
			{ value: '07', label: 'Липень' },
			{ value: '08', label: 'Серпень' },
			{ value: '09', label: 'Вересень' },
			{ value: '10', label: 'Жовтень' },
			{ value: '11', label: 'Листопад' },
			{ value: '12', label: 'Грудень' }
		];

		// Parse initial value
		const [initialYear, initialMonth] = props.modelValue.split('-');
		const selectedMonth = ref(initialMonth || '01');
		const selectedYear = ref(parseInt(initialYear) || new Date().getFullYear());

		// Generate years list
		const currentYear = new Date().getFullYear();
		const years = computed(() => {
			const yearsList = [];
			for (let i = currentYear - 5; i <= currentYear + 1; i++) {
				yearsList.push(i);
			}
			return yearsList;
		});

		const updatePeriod = () => {
			const period = `${selectedYear.value}-${selectedMonth.value}`;
			emit('update:modelValue', period);
		};

		// Watch for external changes
		watch(() => props.modelValue, (newValue) => {
			const [year, month] = newValue.split('-');
			selectedMonth.value = month || '01';
			selectedYear.value = parseInt(year) || new Date().getFullYear();
		});

		return {
			months,
			years,
			selectedMonth,
			selectedYear,
			updatePeriod
		};
	}
});
</script>

<style scoped>
.period-selector .form-select {
	min-width: 120px;
}
</style>