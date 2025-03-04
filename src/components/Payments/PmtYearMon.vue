<template>
	<div class="row">
		<div class="col-md-8">
			<selector-component
				@change="handleSelectChange"
			/>
			<b-table-simple caption-top hover responsive small>
				<colgroup>
					<col />
					<col />
					<col />
				</colgroup>
				<b-thead head-variant="dark">
					<b-tr>
						<b-th>Total:</b-th>
						<b-th>{{ total.toLocaleString() }}</b-th>
						<b-th>{{ total_cnt }}</b-th>
					</b-tr>
				</b-thead>
				<b-tbody>
					<b-tr v-for="(category, index) in catcosts" :key="index">
						<b-td>
							<router-link
								:to="{
                  name: 'payments',
                  params: { action: 'show', year: year, month: month, category_id: category.category_id },
                  query: { group_user_id: group_user_id }
                }"
							>
								{{ category.name }}
							</router-link>
						</b-td>
						<b-td>{{ category.amount.toLocaleString() }}</b-td>
						<b-td>{{ category.cnt }}</b-td>
					</b-tr>
				</b-tbody>
			</b-table-simple>
		</div>
	</div>
</template>

<script>
import SelectorComponent from "../SelectorComponent.vue";
import PaymentService from "../../services/PaymentService";

export default {
  name: "PaymentYearMonth",
  components: {
    SelectorComponent,
  },
  data() {
    return {
      catcosts: [],
      q: "",
      year: this.$route.params.year || new Date().getFullYear(),
      month: this.$route.params.month || new Date().getMonth() + 1,
      total: 0,
      total_cnt: 0,
      group_user_id: this.$route.query.group_user_id || localStorage.getItem('selectedGroupUserId') || undefined,
      lastRequest: null, // Для відстеження останнього запиту
      isRequestInProgress: false // Запобігання паралельним запитам
    };
  },
  methods: { areParamsValid(params) {
    return params && params.year && params.month;
  },

  // У методі safeApiRequest зробіть валюту частиною унікального ідентифікатора запиту
  async safeApiRequest(params) {
    console.log("Планується запит з параметрами:", params);

    if (!this.areParamsValid(params)) {
      console.warn("Пропуск запиту з невалідними параметрами", params);
      return null;
    }

    // Додайте валюту до параметрів для формування унікального ключа
    const fullParams = {
      ...params,
      currency: params.currency || this.$store.state.sprs.selectedCurrency
    };

    // Включіть валюту в requestKey
    const requestKey = JSON.stringify(fullParams);

    // Перезаписуйте lastRequest якщо валюта змінилася
    if (this.lastRequest === requestKey && !params.forceUpdate) {
      console.warn("Пропуск повторного запиту з тими самими параметрами");
      return null;
    }

    this.isRequestInProgress = true;
    this.lastRequest = requestKey;

    try {
      const response = await PaymentService.getPaymentsPeriod(fullParams);

      // Обробка результату як і раніше...
      this.catcosts = response.data;
      let total = 0;
      let total_cnt = 0;
      this.catcosts.forEach((val) => {
        total += Number(val.amount);
        total_cnt += Number(val.cnt);
      });
      this.total = total;
      this.total_cnt = total_cnt;

      return response;
    } catch (error) {
      console.error("Помилка API запиту:", error);
      throw error;
    } finally {
      this.isRequestInProgress = false;
    }
  },

    // Обробник події зміни фільтрів
    handleSelectChange(eventData) {
      if (!eventData || !eventData.year || !eventData.month) {
        console.warn("Пропуск обробки події з неповними даними", eventData);
        return;
      }

      console.log("Обробка події зміни фільтрів:", eventData);

      // Оновлення локальних параметрів
      this.year = eventData.year;
      this.month = eventData.month;
      this.group_user_id = eventData.group_user_id;

      // Зберігаємо у localStorage
      if (eventData.group_user_id) {
        localStorage.setItem('selectedGroupUserId', eventData.group_user_id);
      } else {
        localStorage.removeItem('selectedGroupUserId');
      }

      // Виконуємо запит
      this.safeApiRequest({
        year: this.year,
        month: this.month,
        group_user_id: this.group_user_id
      }).then(() => {
        // Оновлюємо URL ТІЛЬКИ після успішного запиту
        const query = {};
        if (this.group_user_id) query.group_user_id = this.group_user_id;

        // Використовуємо replace, щоб не створювати нову запись в історії
        this.$router.replace({
          name: 'payments_year_month',
          params: { year: this.year, month: this.month },
          query
        }).catch(err => {
          // Ігноруємо помилки навігації
          console.warn("Ігнорована помилка навігації:", err);
        });
      });
    }
  },
  mounted() {
    // При монтуванні компонента виконуємо початковий запит
    this.safeApiRequest({
      year: this.year,
      month: this.month,
      group_user_id: this.group_user_id
    });
  },
	watch: {
  '$store.state.sprs.selectedCurrency'(newCurrency) {
    // Передайте forceUpdate: true, щоб обійти перевірку на повторний запит
    this.safeApiRequest({
      year: this.year,
      month: this.month,
      group_user_id: this.group_user_id,
      currency: newCurrency,
      forceUpdate: true
    });
  }
},
};
</script>