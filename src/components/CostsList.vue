<template>
  <div class="container">
    <!-- Modal -->
    <div
      class="modal fade"
      id="editModal"
      tabindex="-1"
      aria-labelledby="exampleModalLabel"
      aria-hidden="true"
    >
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title text-danger" id="exampleModalLabel">
              Edit Form
            </h5>
            <button
              type="button"
              class="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
            ></button>
          </div>
          <div class="modal-body">
            <form v-if="currentCost">
              <div class="form-group">
                <label for="cat">date</label>
                <input
                  type="date"
                  class="form-control"
                  id="rdate"
                  v-model="currentCost.rdate"
                />
              </div>
              <div class="form-group">
                <label for="cat">Cat</label>
                <select
                  v-model="currentCost.cat"
                  class="form-control"
                  id="cat"
                  name="cat"
                  @change="selSubCats(currentCost.cat)"
                >
                  <option
                    v-for="cat in catsOptions"
                    :value="cat.name"
                    :key="cat.id"
                    :selected="cat.name === currentCost.cat"
                  >
                    {{ cat.name }}
                  </option>
                </select>
              </div>

              <div class="form-group">
                <label for="cat">Sub Cat</label>
                <select
                  v-if="
                    subcatsOptions.some((e) => e.name == currentCost.sub_cat) ||
                    currentCost.sub_cat == ''
                  "
                  class="form-control"
                  id="sub_cat"
                  name="sub_cat"
                  v-model="currentCost.sub_cat"
                >
                  <option value=""></option>
                  <option
                    v-for="sub_cat in subcatsOptions"
                    :value="sub_cat.name"
                    :key="sub_cat.id"
                    :selected="sub_cat.name === currentCost.sub_cat"
                  >
                    {{ sub_cat.name }}
                  </option>
                </select>

                <input
                  :load="
                    log(
                      'input -> subcatsOptions.includes(currentCost.sub_cat): ' +
                        Object.values(subcatsOptions).includes(
                          currentCost.sub_cat
                        ) +
                        ', subcatsOptions.some(e=>e.id==currentCost.sub_cat):' +
                        subcatsOptions.some(
                          (e) => e.name == currentCost.sub_cat
                        ) +
                        ', subcatsOptions.map(a=>a.id).includes(currentCost.sub_cat):' +
                        subcatsOptions
                          .map((a) => a.name)
                          .includes(currentCost.sub_cat) +
                        ', subcatsOptions: ' +
                        Object.values(subcatsOptions).toString() +
                        ', currentCost.sub_cat: ' +
                        currentCost.sub_cat +
                        ', subcatsOptions.map((a)=>a.id):' +
                        subcatsOptions.map((a) => a[a.name])
                    )
                  "
                  v-if="
                    !(
                      subcatsOptions.some(
                        (e) => e.name == currentCost.sub_cat
                      ) || currentCost.sub_cat == ''
                    )
                  "
                  type="text"
                  class="form-control"
                  id="sub_cat"
                  v-model="currentCost.sub_cat"
                />
              </div>
              <div class="form-group">
                <label for="mydesc">Description</label>
                <input
                  type="text"
                  class="form-control"
                  id="mydesc"
                  v-model="currentCost.mydesc"
                />
              </div>

              <div class="form-group">
                <label><strong>Value:</strong></label>
                <input
                  type="text"
                  class="form-control"
                  id="suma"
                  v-model="currentCost.suma"
                />
              </div>
            </form>
            <p></p>
            <button
              class="btn btn-danger mr-2"
              @click="deleteCost"
              data-bs-dismiss="modal"
            >
              Delete
            </button>
            &nbsp;&nbsp;
            <button
              type="submit"
              class="btn btn-success"
              @click="updateCost"
              data-bs-dismiss="modal"
            >
              Update
            </button>
          </div>
          <div class="modal-footer">
            <button
              type="button"
              class="btn btn-warning"
              data-bs-dismiss="modal"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="row">
      <div class="col-2">
        <router-link
          :to="{
            name: 'catcosts',
            query: { year: $route.query.year, month: $route.query.month, user: $route.query.user },
          }"
          ><font-awesome-icon icon="angle-double-left"
        /></router-link>
      </div>
      <div class="col-10">
        <!-- <span v-if="this.$route.query.period"
        >[{{ this.$route.query.period }}]</span
      > -->
        <span class="text-small" v-if="this.$route.query.cat"
          >[{{ this.$route.query.cat }}]</span
        >
        <span v-if="this.$route.query.year"
          >[{{ this.$route.query.year }}]</span
        >
        <span v-if="this.$route.query.month"
          >[{{ this.$route.query.month }}]</span
        >
        <span v-if="this.$route.query.user"
          >[{{ this.$route.query.user }}]</span
        >        
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
        <th @click="sortCosts(1)">Дата</th>
        <th @click="sortCosts(2)">Розділ</th>
        <th>Опис</th>
        <th @click="sortCosts(3)">Сума</th>
      </thead>

      <tbody>
        <tr
          v-for="(cost, index) in costs"
          :key="index"
          data-bs-toggle="modal"
          data-bs-target="#editModal"
          @click="getCost(cost.id)"
        >
          <td>
            <span>
              {{ $moment(cost.rdate).format("DD.MMM") }}
            </span>
          </td>
          <td>{{ cost.sub_cat }}</td>
          <td>{{ cost.mydesc }}</td>
          <td>{{ cost.suma.toLocaleString() }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import CostDataService from "../services/CostDataService";
import moment from "moment";

export default {
  name: "costs-list",
  data() {
    return {
      costs: [],
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
    async pullSubCats(cat) {
      // var cat = this.cat.val();
      console.log("exec pullSubCats");
      CostDataService.subcats(cat)
        .then((response) => {
          this.subcatsOptions = response.data;
          console.log(response.data);
        })
        .catch((e) => {
          console.log(e);
        });
    },
    selSubCats(cat) {
      // var cat = this.cat.val();
      console.log("exec selSubCats");
      // console.log('cat => ', cat);
      // console.log('catsOptions => ', this.catsOptions);
      let selectedCat = this.catsOptions.find(obj => obj.name === cat);
      // console.log('selectedCat => ', selectedCat);
      // console.log('this.subAllcatsOptions => ', this.subAllcatsOptions);
      this.subcatsOptions = this.subAllcatsOptions.filter(function(item) {
  return item.id_cat === selectedCat.id;
});
      console.log('this.subcatsOptions => ', this.subcatsOptions);
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
          response.data[0]["rdate"] = moment(response.data[0]["rdate"]).format(
            "YYYY-MM-DD"
          );
          this.currentCost = response.data[0];
          console.log(response.data);
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

          this.costs.map((c, index) => {
            if (c.id === this.currentCost.id) {
              this.costs[index] = {
                id: this.currentCost.id,
                cat: this.currentCost.cat,
                sub_cat: this.currentCost.sub_cat,
                mydesc: this.currentCost.mydesc,
                rdate: this.currentCost.rdate,
                suma: this.currentCost.suma,
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
          // this.$router.push({ name: "costs" });
          const index = this.costs
            .map(function (item) {
              return item.id;
            })
            .indexOf(this.currentCost.id);

          this.costs.splice(index, 1);
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
      let cat = this.$route.query.cat || "";
      let q = this.$route.query.q || "";
      let user = this.$route.query.user || "";
      console.log(q, year, month, cat, sort, user);
      CostDataService.showCost({
        sort: sort,
        year: year,
        month: month,
        cat: cat,
        q: q,
        user: user,
      })
        // CostDataService.getAll({sort:sort})
        .then((response) => {
          this.costs = response.data;
          console.log(response.data);
          let total = 0;
          let total_cnt = 0;
          this.costs.forEach((val) => {
            total += Number(val.suma);
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
          this.costs = response.data;
          console.log(response.data);
        })
        .catch((e) => {
          console.log(e);
        });
    },
  },
  watch: {
    // $route(to, from) {
    //   // react to route changes...
    //   if (to !== from) {
    //     location.reload();
    //   }
    // },
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
