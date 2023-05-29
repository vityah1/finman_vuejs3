<template>
  <div class="container">
    <!-- Modal -->
    <div class="modal fade" id="editModal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title text-danger" id="exampleModalLabel">
              Edit Form
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <form v-if="currentPayment">
              <div class="form-group">
                <label for="rdate">Date:</label>
                <input type="date" class="form-control" id="rdate" v-model="currentPayment.rdate" />
              </div>
              <div class="form-group">
                <label for="main_category">Category:</label>
                <select class="form-control" ref="main_category" id="main_category" name="main_category"
                  @change="change_category()">
                  <option value=""></option>
                </select>
              </div>

              <div class="form-group">
                <label for="sub_category">Sub Cat:</label>
                <select class="form-control" id="sub_category" ref="sub_category" name="sub_cat"
                @change="change_category()">
                  <option value=""></option>
                </select>
              </div>

              <div v-if="this.currentPayment.sub_cat == 'Заправка'" class="form-group">
                <label for="id_km">km:</label>
                <input type="text" class="form-control" id="id_km" v-model="currentPayment.km" />
                <label for="id_litres">Litres:</label>
                <input type="text" class="form-control" id="id_litres" v-model="currentPayment.litres" />
                <label for="id_price_val">Price (EUR):</label>
                <input type="text" class="form-control" id="id_price_val" v-model="currentPayment.price_val" />

                <label for="id_name_station">Name station:</label>
                <input type="text" class="form-control" id="id_name_station" v-model="currentPayment.station" />

              </div>

              <div v-if="this.currentPayment.sub_cat != 'Заправка'" class="form-group">
                <label for="description">Description:</label>
                <input type="text" class="form-control" id="description" v-model="currentPayment.description" />
              </div>              

              <div class="form-group">
                <label><strong>Value:</strong></label>
                <input type="text" class="form-control" id="amount" v-model="currentPayment.amount" />
              </div>
            </form>
            <p></p>
            <button class="btn btn-danger mr-2" @click="deleteCost" data-bs-dismiss="modal">
              Delete
            </button>
            &nbsp;&nbsp;
            <button type="submit" class="btn btn-success" @click="updateCost" data-bs-dismiss="modal">
              Update
            </button>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-warning" data-bs-dismiss="modal">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="row">
      <div class="col-2">
        <router-link :to="{
          name: 'payments_period',
          query: { year: $route.query.year, month: $route.query.month, user: $route.query.user },
        }"><font-awesome-icon icon="angle-double-left" /></router-link>
      </div>
      <div class="col-10">
        <!-- <span v-if="this.$route.query.period"
        >[{{ this.$route.query.period }}]</span
      > -->
        <span class="text-small" v-if="this.$route.query.cat">[{{ this.$route.query.cat }}]</span>
        <span v-if="this.$route.query.year">[{{ this.$route.query.year }}]</span>
        <span v-if="this.$route.query.month">[{{ this.$route.query.month }}]</span>
        <span v-if="this.$route.query.user">[{{ this.$route.query.user }}]</span>
      </div>
    </div>
    <p>{{ message }}</p>
    <div class="row">
      <div class="col-2 h4 text-success">Всього:</div>
      <div class="col-2 h4 text-danger">{{ total.toLocaleString() }} грн</div>
      <div class="col-2">{{ total_cnt }}</div>
    </div>
    <table class="table-sm table-hover">
      <thead>
        <th @click="sortCosts(1)">Date</th>
        <th @click="sortCosts(2)">Category</th>
        <th>Descript</th>
        <th @click="sortCosts(3)">Amount</th>
      </thead>

      <tbody>
        <tr v-for="(cost, index) in payments" :key="index" data-bs-toggle="modal" data-bs-target="#editModal"
          @click="get_payment(cost.id)">
          <td>
            <span>
              {{ $moment(cost.rdate).format("DD.MMM") }}
            </span>
          </td>
          <td>{{ cost.sub_cat }}</td>
          <td>{{ cost.description }}</td>
          <td>{{ cost.amount.toLocaleString() }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import CostDataService from "../services/CostDataService";
import moment from "moment";

export default {
  name: "payments-list",
  data() {
    return {
      // main_category: null,
      // sub_category: null,
      payments: [],
      q: this.$route.query.q || "",
      total: 0,
      total_cnt: 0,
      currentPayment: null,
      categories: [],
      catsOptions: [],
      subcatsOptions: [],
      subAllcatsOptions: [],
      message: "",
      user: this.$route.query.user || 'all',
    };
  },
  computed: {
    currentUser() {
      return this.$store.state.auth.user;
    },
  },
  methods: {
    async get_categories(mode) {
      console.log("exec categories");
      CostDataService.categories(mode)
        .then((response) => {
          this.categories = response.data;
          this.subAllcatsOptions = response.data.find(obj => obj.parent_id != 0);
          // console.log(response.data);
        })
        .catch((e) => {
          console.log(e);
        });
    }, 
    change_category(category_id) {
      console.log(`Exec selSubCats, category_id: ${category_id}`);
    },
    async get_payment(id) {
      CostDataService.get(id)
        .then((response) => {
          response.data["rdate"] = moment(response.data["rdate"]).format(
            "YYYY-MM-DD"
          );            
          this.currentPayment = response.data;          
          console.log(response.data);
          this.$nextTick(() => {
          this.select_category();
      });
        })
        .catch((e) => {
          console.log(e);
        });
    },    
    select_category() {
      console.log(`Exec select_category`);
      var parent_category_id = undefined
      var category = this.categories.find(obj => obj.id === this.currentPayment.category_id);
      console.log(`category: ${JSON.stringify(category)}`);
      
      if (category.parent_id == 0) {parent_category_id = category.id; }
      else {parent_category_id = category.parent_id;}
      console.log(`parent_category_id: ${JSON.stringify(parent_category_id)}`);   
      
      var options = this.categories.filter(obj => obj.parent_id == 0);
      // console.log(`options: ${JSON.stringify(options)}`);

      // var main_category = document.getElementById('main_category');
      var main_category = this.$refs.main_category;
      main_category.innerHTML = '';
      // console.log(`main_category: ${JSON.stringify(main_category)}`);
      for (let i = 0; i < options.length; i++) {
        console.log(`option: ${options[i].name}`);
        var option = document.createElement('option');
        option.value = options[i].id;
        option.text = options[i].name;
        if (options[i].id == parent_category_id) {
          option.selected = true;
          console.log(`selected option: ${option.text}`);
        }
        main_category.appendChild(option);
      }

      var sub_options = this.categories.filter(obj => obj.parent_id != 0);
      console.log(`sub_options: ${JSON.stringify(sub_options)}`);
      // var sub_category = document.getElementById('sub_category');
      var sub_category = this.$refs.sub_category;
      sub_category.innerHTML = '';
      console.log(`sub_category: ${JSON.stringify(sub_category)}`);
      for (let i = 0; i < sub_options.length; i++) {
        console.log(`sub_options[i].parent_id: ${sub_options[i].parent_id} == `);
        console.log(`category.id: ${category.id}`)
        if (sub_options[i].parent_id == category.id) {
        var sub_option = document.createElement('option');
        sub_option.value = sub_options[i].id;
        sub_option.text = sub_options[i].name;
        if (sub_options[i].id == this.currentPayment.category_id) {sub_option.selected = true;}
        sub_category.appendChild(sub_option);
        }
      }
    },
    updateCost() {
      CostDataService.update(this.currentPayment.id, this.currentPayment)
        .then((response) => {
          console.log(response.data.data);
          this.message = response.data.data;

          this.payments.map((c, index) => {
            if (c.id === this.currentPayment.id) {
              this.payments[index] = {
                id: this.currentPayment.id,
                category_id: this.currentPayment.category_id,
                description: this.currentPayment.description,
                rdate: this.currentPayment.rdate,
                amount: this.currentPayment.amount,
                km: this.currentPayment.km,
                litres: this.currentPayment.litres,
                price_val: this.currentPayment.price_val,
                station: this.currentPayment.station,
              };
            }
          });
        })
        .catch((e) => {
          console.log(e);
        });
    },
    removeFromArrayOfHash(p_array_of_hash, p_key, p_value_to_remove) {
      return p_array_of_hash.filter((l_cur_row) => {
        return l_cur_row[p_key] != p_value_to_remove;
      });
    },
    deleteCost() {
      CostDataService.delete(this.currentPayment.id)
        .then((response) => {
          console.log(response.data.data);
          this.message = response.data.data;
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
    log(item) {
      console.log(item);
    },
    retrieveCosts() {
      let sort = this.$route.query.sort || "";
      let year = this.$route.query.year || "";
      let month = this.$route.query.month || "";
      let category_id = this.$route.query.category_id || "";
      let q = this.$route.query.q || "";
      let user = this.$route.query.user || "";
      console.log(q, year, month, category_id, sort, user);
      CostDataService.showCost({
        sort: sort,
        year: year,
        month: month,
        category_id: category_id,
        q: q,
        user: user,
      })
        // CostDataService.getAll({sort:sort})
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
    refreshList() {
      this.retrieveCosts();
    },
    sortCosts(sort_table) {
      console.log(sort_table);
    },
    searchCost() {
      CostDataService.showCost({ q: this.q })
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
    this.retrieveCosts();
    this.get_categories();  
  },
};
</script>
