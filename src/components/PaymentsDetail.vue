<template>
  <div class="container">
    <alert-component ref="myAlert"></alert-component>
    <!-- Modal -->
    <b-modal v-model="showModal" 
    @ok="updatePayment()"
    title="Modal form"
    :okTitle="okTitle"
    >
          <template #modal-header>
            <h5 class="modal-title text-danger">
              Edit Payment [{{this.currentPayment.id}}]
            </h5>
          </template>
          <template #default>
            <b-form v-if="currentPayment">
              <div class="form-group">
                <label for="rdate">Date:</label>
                <input type="date" class="form-control" id="rdate" v-model="currentPayment.rdate" />
              </div>
              <div class="form-group">
                <label for="main_category">Category:</label>
                <select class="form-control" ref="main_category" id="main_category" name="main_category"
                  @change="change_category($event.target.value)">
                  <option value=""></option>
                </select>
              </div>

              <div class="form-group">
                <label for="sub_category">Sub Cat:</label>
                <select class="form-control" id="sub_category" ref="sub_category" name="sub_cat"
                  @change="change_category($event.target.value)">
                  <option value=""></option>
                </select>
              </div>

              <div v-if="isFuel" class="form-group">
                <label for="id_km">km:</label>
                <input type="text" class="form-control" id="id_km" v-model="currentPayment.refuel_data.km" />
                <label for="id_litres">Litres:</label>
                <input type="text" class="form-control" id="id_litres" v-model="currentPayment.refuel_data.litres" />
                <label for="id_price_val">Price (EUR):</label>
                <input type="text" class="form-control" id="id_price_val"
                  v-model="currentPayment.refuel_data.price_val" />
                <label for="id_name_station">Name station:</label>
                <input type="text" class="form-control" id="id_name_station"
                  v-model="currentPayment.refuel_data.station_name" />

              </div>

              <div v-if="!isFuel" class="form-group">
                <label for="mydesc">Description:</label>
                <input type="text" class="form-control" id="mydesc" v-model="currentPayment.mydesc" />
              </div>

              <div class="form-group">
                <label><strong>Amount:</strong></label>
                <input type="text" class="form-control" id="amount" v-model="currentPayment.amount" />
              </div>
            </b-form>

            <b-button variant="danger" class="mt-2" @click="deletePayment">
              Delete
            </b-button>
          </template>

    </b-modal>

    <div class="row">
      <div class="col-2">
        <router-link :to="{
          name: 'payments_period',
          query: { year: $route.query.year, month: $route.query.month, user: $route.query.user },
        }"><font-awesome-icon icon="angle-double-left" /></router-link>
      </div>
      <div class="col-10">
        <span class="text-small" v-if="this.$route.query.cat">[{{ this.$route.query.cat }}]</span>
        <span v-if="this.$route.query.year">[{{ this.$route.query.year }}]</span>
        <span v-if="this.$route.query.month">[{{ this.$route.query.month }}]</span>
        <span v-if="this.$route.query.user">[{{ this.$route.query.user }}]</span>
      </div>
    </div>
    <div class="row">
      <div class="col-2 h4 text-success">Total:</div>
      <div class="col-2 h4 text-danger">{{ total.toLocaleString() }} UAH</div>
      <div class="col-2">{{ total_cnt }}</div>
    </div>
    <b-table-simple hover small caption-top responsive>
      <caption>Table Head</caption>
      <colgroup>
        <col />
        <col />
        <col />
        <col />
      </colgroup>
      <b-thead head-variant="dark">
        <b-tr>
          <b-th @click="sortPayments(1)">Date</b-th>
          <b-th @click="sortPayments(2)">Category</b-th>
          <b-th>Descript</b-th>
          <b-th @click="sortPayments(3)">Amount</b-th>
        </b-tr>
      </b-thead>

      <b-tbody v-if="(payments.length > 0)">
        <b-tr v-for="(payment, index) in payments" :key="index"
          @click="get_payment(payment.id)">
          <b-td>
            <span>
              {{ $moment(payment.rdate).format("DD.MMM") }}
            </span>
          </b-td>
          <b-td>{{ payment.category_name }}</b-td>
          <b-td>{{ payment.mydesc }}</b-td>
          <b-td>{{ payment.amount.toLocaleString() }}</b-td>
        </b-tr>
      </b-tbody>
    </b-table-simple>
    <div v-if="(payments.length == 0)">Data loading...</div>
  </div>
</template>

<script>
import PaymentService from "../services/PaymentService";
import moment from "moment";

export default {
  name: "PaymentsDetail",
  data() {
    return {
      okTitle: "",
      showModal: false,      
      payments: [],
      q: this.$route.query.q || "",
      total: 0,
      total_cnt: 0,
      currentPayment: {},
      category: { name: '' },
      categories: [],
      user: this.$route.query.user,
    };
  },
  computed: {
    isFuel() {
      return this.category.name == 'Заправка';
    },
    currentUser() {
      return this.$store.state.auth.user;
    },
  },
  watch: {
    'category.name': function (newName, oldName) {
      // Викликається при зміні category.name
      console.log('Змінено category.name:', newName, oldName);
    },
  },
  methods: {
    async getCategories(mode) {
      PaymentService.categories(mode)
        .then((response) => {
          this.categories = response.data;
        })
        .catch((e) => {
          console.log(e);
        });
    },
    change_category(category_id) {
      this.currentPayment.category_id = category_id;
      this.$nextTick(() => {
        this.set_category();
      });
    },
    set_category() {
      var parent_category_id = undefined
      this.category = this.categories.find(obj => obj.id == this.currentPayment.category_id);

      if (this.category.parent_id == 0) { parent_category_id = this.category.id; }
      else { parent_category_id = this.category.parent_id; }

      var options = this.categories.filter(obj => obj.parent_id == 0);
      // console.log(`options: ${JSON.stringify(options)}`);

      var main_category = this.$refs.main_category;
      main_category.innerHTML = '';

      for (let i = 0; i < options.length; i++) {
        var option = document.createElement('option');
        option.value = options[i].id;
        option.text = options[i].name;
        if (options[i].id == parent_category_id) { option.selected = true; }
        main_category.appendChild(option);
      }

      var sub_options = this.categories.filter(obj => obj.parent_id != 0);
      var sub_category = this.$refs.sub_category;
      sub_category.innerHTML = '<option></option>';

      for (let i = 0; i < sub_options.length; i++) {
        if (sub_options[i].parent_id == parent_category_id) {
          var sub_option = document.createElement('option');
          sub_option.value = sub_options[i].id;
          sub_option.text = sub_options[i].name;
          if (sub_options[i].id == this.category.id) { sub_option.selected = true; }
          sub_category.appendChild(sub_option);
        }
      }
    },
    async get_payment(id) {
      PaymentService.getPayment(id)
        .then((response) => {
          response.data["rdate"] = moment(response.data["rdate"]).format(
            "YYYY-MM-DD"
          );
          this.currentPayment = response.data;
          this.set_category();
          console.log(response.data);
          // this.category.name == response.data.category_name;
          this.okTitle =  'Edit';
          this.$nextTick(() => {
            this.set_category();
          });
          this.showModal=true;
        })
        .catch((e) => {
          console.log(e);
        });
    },
    async updatePayment() {
      PaymentService.updatePayment(this.currentPayment.id, this.currentPayment)
        .then((response) => {
          this.currentPayment = response.data;
          this.payments.map((c, index) => {
            if (c.id == this.currentPayment.id) {
              this.payments[index] = {
                id: this.currentPayment.id,
                category_id: this.currentPayment.category_id,
                category_name: this.currentPayment.category_name,
                mydesc: this.currentPayment.mydesc,
                rdate: this.currentPayment.rdate,
                amount: this.currentPayment.amount,
              };
            }
          });
        })
        .catch((e) => {
          console.log(e);
        });
        this.showModal=false;
    },
    removeFromArrayOfHash(p_array_of_hash, p_key, p_value_to_remove) {
      return p_array_of_hash.filter((l_cur_row) => {
        return l_cur_row[p_key] != p_value_to_remove;
      });
    },
    async deletePayment() {
      PaymentService.deletePayment(this.currentPayment.id)
        .then((response) => {
          console.log(response.data.data);
          // this.$router.push({ name: "payments" });
          const index = this.payments
            .map(function (item) {
              return item.id;
            })
            .indexOf(this.currentPayment.id);

          this.payments.splice(index, 1);
        })
        .catch((e) => {
          console.log(e);
        });
    },
    async getPayments() {
      let sort = this.$route.query.sort || "";
      let year = this.$route.query.year || "";
      let month = this.$route.query.month || "";
      let category_id = this.$route.query.category_id || "";
      let q = this.$route.query.q || "";
      let user = this.$route.query.user || "";
      console.log(q, year, month, category_id, sort, user);
      PaymentService.getPayments({
        sort: sort,
        year: year,
        month: month,
        category_id: category_id,
        q: q,
        user: user,
      })
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
  },
  mounted() {
    if (!this.currentUser) {
      this.$router.push({ name: "login" });
    }
    this.getPayments();
    this.getCategories();
  },
};
</script>
