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
            <form v-if="currentCost">
              <div class="form-group">
                <label for="rdate">Date:</label>
                <input type="date" class="form-control" id="rdate" v-model="currentCost.rdate" />
              </div>
              <div class="form-group">
                <label for="cat">Category:</label>
                <select v-model="currentCost.parent_category_id" class="form-control" id="cat" name="cat"
                  @change="selSubCats(currentCost.category_id)">
                  <option v-for="category in catsOptions" :value="category.id" :key="category.id"
                    :selected="(category.id === currentCost.category_id)">
                    {{ category.name }}
                  </option>
                </select>
              </div>

              <div class="form-group">
                <label for="sub_cat">Sub Cat:</label>
                <select class="form-control" id="sub_cat" name="sub_cat" v-model="currentCost.category_id">
                  <option value=""></option>
                  <option v-for="sub_cat in subcatsOptions" :value="sub_cat.id" :key="sub_cat.id"
                    :selected="(sub_cat.id === currentCost.category_id)">
                    {{ sub_cat.name }}
                  </option>
                </select>
              </div>

              <div v-if="this.currentCost.sub_cat == 'Заправка'" class="form-group">
                <label for="id_km">km:</label>
                <input type="text" class="form-control" id="id_km" v-model="currentCost.km" />
                <label for="id_litres">Litres:</label>
                <input type="text" class="form-control" id="id_litres" v-model="currentCost.litres" />
                <label for="id_price_val">Price (EUR):</label>
                <input type="text" class="form-control" id="id_price_val" v-model="currentCost.price_val" />

                <label for="id_name_station">Name station:</label>
                <input type="text" class="form-control" id="id_name_station" v-model="currentCost.station" />

              </div>

              <div v-if="this.currentCost.sub_cat != 'Заправка'" class="form-group">
                <label for="description">Description:</label>
                <input type="text" class="form-control" id="description" v-model="currentCost.description" />
              </div>              

              <div class="form-group">
                <label><strong>Value:</strong></label>
                <input type="text" class="form-control" id="amount" v-model="currentCost.amount" />
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
          @click="getCost(cost.id)">
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
      payments: [],
      q: this.$route.query.q || "",
      total: 0,
      total_cnt: 0,
      currentCost: null,
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
    async pullCats() {
      console.log("exec pullCats");
      CostDataService.cats()
        .then((response) => {
          this.catsOptions = response.data;
          console.log(response.data);
        })
        .catch((e) => {
          console.log(e);
        });
    },
    async pullSubCats(category_id) {
      // var cat = this.cat.val();
      console.log("exec pullSubCats");
      CostDataService.subcats(category_id)
        .then((response) => {
          this.subcatsOptions = response.data;
          console.log(response.data);
        })
        .catch((e) => {
          console.log(e);
        });
    },
    selSubCats(category_id) {
      console.log(`Exec selSubCats, category_id: ${category_id}`);
      // console.log(`this.catsOptions: ${JSON.stringify(this.catsOptions)}`);
      let selectedCat = this.catsOptions.find(obj => obj.id === category_id);
      console.log(`selectedCat: ${JSON.stringify(selectedCat)}`);
      this.subcatsOptions = this.subAllcatsOptions.filter(function (item) {
        return item.parent_id === selectedCat.id;
      });
      // if (this.subcatsOptions && is_edit) {
      //   this.currentCost.sub_cat = '';
      // }
      console.log('this.subcatsOptions => ', JSON.stringify(this.subcatsOptions));
    },
    async pullAllSubCats() {
      // var cat = this.cat.val();
      console.log("exec pullAllSubCats");
      CostDataService.subcats()
        .then((response) => {
          this.subAllcatsOptions = response.data;
          console.log(response.data);
        })
        .catch((e) => {
          console.log(e);
        });
    },
    async getCost(id) {
      CostDataService.get(id)
        .then((response) => {
          response.data["rdate"] = moment(response.data["rdate"]).format(
            "YYYY-MM-DD"
          );
          this.currentCost = response.data;
          console.log(response.data);
          this.selSubCats(this.currentCost.category_id);
        })
        .catch((e) => {
          console.log(e);
        });
    },
    updateCost() {
      CostDataService.update(this.currentCost.id, this.currentCost)
        .then((response) => {
          console.log(response.data.data);
          this.message = response.data.data;

          this.payments.map((c, index) => {
            if (c.id === this.currentCost.id) {
              this.payments[index] = {
                id: this.currentCost.id,
                category_id: this.currentCost.category_id,
                description: this.currentCost.description,
                rdate: this.currentCost.rdate,
                amount: this.currentCost.amount,
                km: this.currentCost.km,
                litres: this.currentCost.litres,
                price_val: this.currentCost.price_val,
                station: this.currentCost.station,
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
      CostDataService.delete(this.currentCost.id)
        .then((response) => {
          console.log(response.data.data);
          this.message = response.data.data;
          // this.$router.push({ name: "payments" });
          const index = this.payments
            .map(function (item) {
              return item.id;
            })
            .indexOf(this.currentCost.id);

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
    this.pullCats();
    this.pullAllSubCats();
  },
};
</script>
