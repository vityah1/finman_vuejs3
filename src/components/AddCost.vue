<template>
  <div class="submit-form">
    <div v-if="!submitted">
      <div class="form-group">
        <label for="rdate">Date</label>
        <input
          type="date"
          class="form-control"
          id="rdate"
          v-model="cost.rdate"
        />
      </div>
      <div v-if="catsOptions" class="form-group">
        <label for="cat">Cat</label>
        <select
          v-model="cost.cat"
          class="form-control"
          id="cat"
          name="cat"
          @change="selSubCats(cost.cat)"
        >
          <option
            v-for="cat in catsOptions"
            :value="cat.name"
            :key="cat.id"
            :selected="cat.name === cost.cat"
          >
            {{ cat.name }}
            <!-- <span v-if="cat.sub_cat">[{{ cat.sub_cat }}]</span> -->
          </option>
        </select>
        <h2>{{ cost.cat }}</h2>
      </div>

      <div class="form-group">
        <label for="sub_cat">Sub cat</label>
        <select
          class="form-control"
          id="sub_cat"
          name="sub_cat"
          v-model="cost.sub_cat"
        >
          <option
            v-for="sub_cat in subcatsOptions"
            :value="sub_cat.name"
            :key="sub_cat.id"
            :selected="sub_cat.name === cost.sub_cat"
          >
            {{ sub_cat.name }}
          </option>
        </select>
        <h2>{{ cost.sub_cat }}</h2>
      </div>

      <div class="form-group">
        <label for="mydesc">Desc</label>
        <input
          class="form-control"
          id="mydesc"
          required
          v-model="cost.mydesc"
          name="mydesc"
        />
      </div>

      <div class="form-group">
        <label for="suma">Value</label>
        <input
          class="form-control"
          id="suma"
          required
          v-model="cost.suma"
          name="suma"
        />
      </div>
      <p></p>
      <button @click="saveCost" class="btn btn-success">Submit</button>
    </div>

    <div v-else>
      <h4>You submitted successfully! {{ result }}</h4>
      <button class="btn btn-success" @click="newCost">Add</button>
    </div>
  </div>
</template>

<script>
import CostDataService from "../services/CostDataService";
import moment from "moment";
// import Select2 from "vue3-select2-component";

export default {
  name: "add-cost",
  data() {
    return {
      cost: {
        id: null,
        rdate: moment(Date()).format("YYYY-MM-DD"),
        cat: "",
        sub_cat: "",
        mydesc: "",
        suma: 0,
      },
      catsOptions: [],
      subcatsOptions: [],
      submitted: false,
      result: "",
      subAllcatsOptions: [],
    };
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
    async saveCost() {
      var data = {
        rdate: this.cost.rdate,
        cat: this.cost.cat,
        sub_cat: this.cost.sub_cat,
        mydesc: this.cost.mydesc,
        suma: this.cost.suma,
      };
      console.log(data);
      CostDataService.create(data)
        .then((response) => {
          this.cost.id = response.data.id;
          console.log(response.data.data);
          this.result = response.data.data;
          this.submitted = true;
        })
        .catch((e) => {
          console.log(e);
        });
    },
    newCost() {
      this.submitted = false;
      this.cost = {};
      // this.pullCats();
    },
    // created() {
    //   this.pullCats();
    // },
  },
  mounted() {
    console.log("mounted");
    this.pullCats();
    this.pullAllSubCats();
  },
};
</script>

<style>
.submit-form {
  max-width: 300px;
  margin: auto;
}
</style>