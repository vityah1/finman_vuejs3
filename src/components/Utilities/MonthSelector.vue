<template>
	<div class="month-selector">
		<div class="input-group">
			<select v-model="selectedMonth" class="form-select" @change="updateValue">
				<option value="">Всі періоди</option>
				<option v-for="month in availableMonths" :key="month.value" :value="month.value">
					{{ month.label }}
				</option>
			</select>
			<button class="btn btn-outline-secondary" type="button" @click="goToPrevious" :disabled="!canGoPrevious">
				<i class="fas fa-chevron-left"></i>
			</button>
			<button class="btn btn-outline-secondary" type="button" @click="goToNext" :disabled="!canGoNext">
				<i class="fas fa-chevron-right"></i>
			</button>
		</div>
	</div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, watch } from 'vue';

export default defineComponent({
	name: 'MonthSelector',
	props: {
		modelValue: {
			type: String,
			default: ''
		},
		maxMonths: {
			type: Number,
			default: 60 // Показувати останні 60 місяців (5 років)
		}
	},
	emits: ['update:modelValue'],
	setup(props, { emit }) {
		const selectedMonth = ref(props.modelValue || '');
		
		// НЕ встановлюємо автоматично місяць - чекаємо на дані з API
		
		// Українські назви місяців
		const monthNames = [
			'Січень', 'Лютий', 'Березень', 'Квітень', 'Травень', 'Червень',
			'Липень', 'Серпень', 'Вересень', 'Жовтень', 'Листопад', 'Грудень'
		];
				
		// Генеруємо список доступних місяців
		const availableMonths = computed(() => {
			const months = [];
			const now = new Date();
			
			for (let i = 0; i < props.maxMonths; i++) {
				const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
				// ВАЖЛИВО: використовуємо локальний час, не UTC!
				const year = date.getFullYear();
				const month = String(date.getMonth() + 1).padStart(2, '0'); // +1 бо JS місяці з 0
				const value = `${year}-${month}`;
				const monthName = monthNames[date.getMonth()];
				const label = `${monthName} ${year}`;
				
				months.push({ value, label });
			}
			
			// Додаємо поточне значення якщо його немає в списку
			if (selectedMonth.value && !months.find(m => m.value === selectedMonth.value)) {
				const [year, month] = selectedMonth.value.split('-');
				const monthIndex = parseInt(month) - 1; // JS місяці починаються з 0
				const monthName = monthNames[monthIndex];
				months.push({
					value: selectedMonth.value,
					label: `${monthName} ${year}`
				});
				console.log('MonthSelector: додано місяць', selectedMonth.value, `${monthName} ${year}`);
				// Сортуємо за датою в зворотньому порядку
				months.sort((a, b) => b.value.localeCompare(a.value));
			}
			
			return months;
		});
		
		// Обчислюємо індекс поточного місяця
		const currentMonthIndex = computed(() => {
			return availableMonths.value.findIndex(m => m.value === selectedMonth.value);
		});
		
		// Перевіряємо можливість навігації
		const canGoPrevious = computed(() => {
			return currentMonthIndex.value >= 0 && currentMonthIndex.value < availableMonths.value.length - 1;
		});
		
		const canGoNext = computed(() => {
			return currentMonthIndex.value > 0;
		});
				
		// Методи навігації
		const goToPrevious = () => {
			if (canGoPrevious.value) {
				const newIndex = currentMonthIndex.value + 1;
				selectedMonth.value = availableMonths.value[newIndex].value;
				updateValue();
			}
		};
		
		const goToNext = () => {
			if (canGoNext.value) {
				const newIndex = currentMonthIndex.value - 1;
				selectedMonth.value = availableMonths.value[newIndex].value;
				updateValue();
			}
		};
		
		// Оновлюємо значення
		const updateValue = () => {
			console.log('MonthSelector updateValue:', selectedMonth.value);
			emit('update:modelValue', selectedMonth.value);
		};
		
		// Слідкуємо за зміною пропсів
		watch(() => props.modelValue, (newValue) => {
			selectedMonth.value = newValue;
		});
		
		return {
			selectedMonth,
			availableMonths,
			canGoPrevious,
			canGoNext,
			goToPrevious,
			goToNext,
			updateValue
		};
	}
});
</script>

<style scoped>
.month-selector .input-group {
	width: 100%;
}

.month-selector .form-select {
	flex: 1;
}
</style>