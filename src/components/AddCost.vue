<template>
  <div class="submit-form">
    <div v-if="!submitted">
      <div class="form-group">
        <label for="rdate">Date</label>
        <input
          type="date"
          class="form-control"
          id="rdate"
          v-model="currentCost.rdate"
        />
      </div>
      <div v-if="catsOptions" class="form-group">
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
            <!-- <span v-if="cat.sub_cat">[{{ cat.sub_cat }}]</span> -->
          </option>
        </select>
        <h2>{{ currentCost.cat }}</h2>
      </div>

      <div class="form-group">
        <label for="sub_cat">Sub cat</label>
        <select
          class="form-control"
          id="sub_cat"
          name="sub_cat"
          v-model="currentCost.sub_cat"
        >
          <option
            v-for="sub_cat in subcatsOptions"
            :value="sub_cat.name"
            :key="sub_cat.id"
            :selected="sub_cat.name === currentCost.sub_cat"
          >
            {{ sub_cat.name }}
          </option>
        </select>
        <h2>{{ currentCost.sub_cat }}</h2>
      </div>

      <div 
      :load="log('currentCost.sub_cat: ' + currentCost.sub_cat + 
      ', currentCost.cat: ' + currentCost.cat
      )"
      v-if="is_sub_cat_refuel" class="form-group">
                <label for="id_km">km:</label>
                <input type="text" class="form-control" id="id_km" v-model="currentCost.km" />
                <label for="id_litres">Litres:</label>
                <input type="text" class="form-control" id="id_litres" v-model="currentCost.litres" />
                <label for="id_price_val">Price (EUR):</label>
                <input type="text" class="form-control" id="id_price_val" v-model="currentCost.price_val" />
                <label for="id_name_station">Name station:</label>
                <input type="text" class="form-control" id="id_name_station" v-model="currentCost.station" />
              </div>

      <div 
      v-if="!is_sub_cat_refuel" class="form-group"
      >
        <label for="mydesc">Desc</label>
        <input
          class="form-control"
          id="mydesc"
          required
          v-model="currentCost.mydesc"
          name="mydesc"
        />
      </div>

      <div class="form-group">
        <label for="suma">Value</label>
        <input
          class="form-control"
          id="suma"
          required
          v-model="currentCost.suma"
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
      currentCost: {
        id: null,
        rdate: moment(Date()).format("YYYY-MM-DD"),
        cat: "",
        sub_cat: "",
        mydesc: "",
        suma: 0,
        km: "",
        litres: "",
        price_val: "",
        station: "",
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
        rdate: this.currentCost.rdate,
        cat: this.currentCost.cat,
        sub_cat: this.currentCost.sub_cat,
        mydesc: this.currentCost.mydesc,
        suma: this.currentCost.suma,
        km: this.currentCost.km,
        litres: this.currentCost.litres,
        price_val: this.currentCost.price_val,        
      };
      console.log(data);
      CostDataService.create(data)
        .then((response) => {
          this.currentCost.id = response.data.id;
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
      this.currentCost = {};
      // this.pullCats();
    },
    log(item) {
      console.log(item);
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
  computed: {
    is_sub_cat_refuel () {
      console.log('this.currentCost.sub_cat: ' + this.currentCost.sub_cat);
      if (this.currentCost.sub_cat === 'Заправка') 
      {console.log('is refuel!!!');
        return true}
      else 
      {console.log('Not refuel!!!');
        return false}
    }
  }
}
</script>

<style>
.submit-form {
  max-width: 300px;
  margin: auto;
}
</style>