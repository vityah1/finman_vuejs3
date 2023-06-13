<template>
  <div class="container">
    <alert-component ref="myAlert"></alert-component>
    <!-- Modal -->
    <b-modal v-model="showModal" @ok="doFormAction()" title="Modal form" :okTitle="okTitle">
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
            <select class="form-control" ref="main_category" id="main_category" name="main_category"
              @change="changeCategory($event.target.value)">
              <option value=""></option>
            </select>
          </div>

          <div class="form-row">
            <label for="sub_category">Sub Cat:</label>
            <select class="form-control" id="sub_category" ref="sub_category" name="sub_cat"
              @change="changeCategory($event.target.value)">
              <option value=""></option>
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
            <input type="text" class="form-control" id="id_name_station"
              v-model="currentPayment.refuel_data.station_name" />

          </div>

          <div v-if="!isFuel" class="form-row">
            <label for="mydesc">Description:</label>
            <input type="text" class="form-control" id="mydesc" v-model="currentPayment.mydesc" />
          </div>

          <div class="row">
            <div class="col-md-4">
              <label for="amount"><strong>Amount:</strong></label>
              <input type="text" class="form-control" id="amount" v-model="currentPayment.amount" />
            </div>

            <div class="col-md-4">
              <label for="source">Source:</label>
              <select class="form-control" id="source" ref="source" name="source" v-model="currentPayment.source">
                <option v-for="item in sources" :value="item.source" :key="item.id">{{ item.source }}</option>
              </select>
            </div>

            <div class="col-md-4">
              <label for="currency">Currency:</label>
              <select class="form-control" id="currency" ref="currency" name="currency"
                v-model="currentPayment.currencyCode">
                <option v-for="item in currencies" :value="item.currencyCode" :key="item.currencyCode">{{ item.currency
                }}</option>
              </select>
            </div>
          </div>

        </b-form>
        <b-button v-if="currentPayment.action == 'edit'" variant="danger" class="mt-2" @click="delPayment">
          Delete
        </b-button>
      </template>
    </b-modal>
    <div class="row">
      <div class="col-4">
        <b-button variant="primary" @click="openFormAddPayment()"> Add Payment</b-button>
      </div>
    </div>
    <div class="row">
      <div class="col-2">
        <router-link :to="{
          name: 'payments_period',
          query: { year: $route.query.year, month: $route.query.month },
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
        <b-tr v-for="(payment, index) in payments" :key="index" @click="openFormEditPayment(payment.id)">
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
      currentPayment: {
        "category_id": 0,
        "rdate": this.formatDate(new Date().toLocaleDateString()),
        "refuel_data": { "km": '', "litres": '', "price_val": '', "station_name": '' },
        "amount": 0,
        "mydesc": '',
        "currencyCode": 980,
        "source": "pwa",
      },
      category: { name: '' },
      categories: [],
      sources: [],
      currencies: [],
    };
  },
  computed: {
    isFuel() {
      return this.category && this.category.name == 'Заправка';
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
    formatDate(dateString) {
      const parts = dateString.split('/');
      const formattedDate = `${parts[2]}-${parts[0].padStart(2, '0')}-${parts[1].padStart(2, '0')}`;
      return formattedDate;
    },
    changeCategory(category_id) {
      this.currentPayment.category_id = category_id;
      this.$nextTick(() => {
        this.setCategory();
      });
    },
    setCategory() {
      var parent_category_id = undefined
      this.category = this.categories.find(obj => obj.id == this.currentPayment.category_id);
      if (!this.category) { this.category = this.categories[0].id; }

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
    openFormAddPayment() {
      console.log('this.categories', this.categories);
      // this.currentPayment = {
      //   "category_id": this.categories[0].id,
      //   "rdate": this.formatDate(new Date().toLocaleDateString()),
      //   "refuel_data": {"km": '', "litres": '', "price_val": '', "station_name": ''},
      //   "amount": 0,
      //   "mydesc": '',
      // }
      this.setCategory();
      this.okTitle = 'Add';
      this.currentPayment.action = 'add';
      this.currentPayment.currencyCode = 978;
      this.currentPayment.refuel_data = { "km": '', "litres": '', "price_val": '', "station_name": '' };
      this.showModal = true;
    },
    async openFormEditPayment(id) {
      PaymentService.getPayment(id)
        .then((response) => {
          response.data["rdate"] = moment(response.data["rdate"]).format(
            "YYYY-MM-DD"
          );
          this.currentPayment = response.data;
          this.currentPayment.action = 'edit';
          if (!this.currentPayment.refuel_data) {
            this.currentPayment.refuel_data = { "km": '', "litres": '', "price_val": '', "station_name": '' };
          }
          this.setCategory();
          console.log(response.data);
          this.okTitle = 'Edit';
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
      console.log('this.currentPayment.action: ', this.currentPayment.action)
      if (this.currentPayment.action == 'edit') { this.doUpdatePayment(); }
      else if (this.currentPayment.action == 'add') { this.doAddPayment(); }
    },
    async doAddPayment() {
      PaymentService.addPayment(this.currentPayment)
        .then((response) => {
          // this.currentPayment = response.data;
          console.log('response after add pmt: ', response.data);
          this.$refs.myAlert.showAlert('success', 'Payment added');
        })
        .catch((e) => {
          console.log(e);
          this.$refs.myAlert.showAlert('danger', 'Payment add failed');
        });
      this.showModal = false;
      this.category = undefined;
      this.isFuel = false;
    },
    async doUpdatePayment() {
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
          this.$refs.myAlert.showAlert('success', 'Payment updated');
        })
        .catch((e) => {
          console.log(e);
          this.$refs.myAlert.showAlert('danger', 'Payment update failed');
        });
      this.showModal = false;
    },
    removeFromArrayOfHash(p_array_of_hash, p_key, p_value_to_remove) {
      return p_array_of_hash.filter((l_cur_row) => {
        return l_cur_row[p_key] != p_value_to_remove;
      });
    },
    async delPayment() {
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
      this.showModal = false;
    },
    async getPayments() {
      let data = {
        sort: this.$route.query.sort || "",
        year: this.$route.query.year || "",
        month: this.$route.query.month || "",
        category_id: this.$route.query.category_id || "",
        q: this.$route.query.q || "",
      }
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
  },
  async mounted() {
    if (!this.currentUser) {
      this.$router.push({ name: "login" });
    }
    // await this.getCategories();
    this.categories = this.$store.state.sprs.categories;
    this.currencies = this.$store.state.sprs.currencies;
    this.sources = this.$store.state.sprs.sources;
    console.log(this.sources)
    if (!this.$route.query.action) {
      this.getPayments();
    } else {
      this.openFormAddPayment();
    }
  },
  // created() {this.categories = this.$store.state.sprs.categories;}
};
</script>
