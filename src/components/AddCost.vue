<template>
  <div class="submit-form">
    <div v-if="!submitted">
      <div class="form-group">
        <label for="cat">date</label>
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
          :value="catValue"
          v-bind="{
            ...$attrs,
            onChange: ($event) => {
              $emit('update:catValue', $event.target.value);
            },
          }"
        >
          <option
            v-for="opt in catsOptions"
            :value="opt.id"
            :key="opt.id"
            :selected="opt.id === catValue"
          >
            {{ opt.name }} <span v-if="opt.sub_cat">[{{ opt.sub_cat }}]</span>
          </option>
        </select>
        <h2>{{ catValue }}</h2>
      </div>

      <!-- <div class="form-group">
        <label for="sub_cat">Sub cat</label>
        <Select2
          class="form-control"
          id="sub_cat"
          name="sub_cat"
          v-model="sub_cat"
          :options="sub_catsOptions"
          @change="ChangeSubCatEvent($event)"
          @select="SelectSubCatEvent($event)"
        />
        <h2>{{ sub_cat }}</h2> -->

      <!-- <select
          class="form-control"
          id="sub_cat"
          required
          v-model="cost.sub_cat"
          name="sub_cat"
        >{{options}}
        </select> 
      </div>-->

      <div class="form-group">
        <label for="desc">Desc</label>
        <input
          class="form-control"
          id="mydesc"
          required
          v-model="cost.mydesc"
          name="desc"
        />
      </div>

      <div class="form-group">
        <label for="desc">Value</label>
        <input
          class="form-control"
          id="suma"
          required
          v-model="cost.suma"
          name="suma"
        />
      </div>

      <button @click="saveCost" class="btn btn-success">Submit</button>
    </div>

    <div v-else>
      <h4>You submitted successfully!</h4>
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
        rdate: moment(Date()).format("DD.MM.YYYY"),
        cat: "",
        // sub_cat: "",
        mydesc: "",
        suma: 0,
      },
      catValue: "",
      //   sub_cat: "",
      catsOptions: [],
      //   sub_catsOptions: [],
      submitted: false,
    };
  },
  //   setup() {
  //     console.log("Component is mounted!");
  //     this.pullCats();
  //     // mounted
  //     // onMounted(() => {
  //     //   console.log('Component is mounted!')
  //     // })
  //   },

  //   setup() {
  //     console.log("Component is mounted!");
  //     let catsOptions = [];
  //     catsOptions = this.pullCats();
  //     return catsOptions;
  //   },
  methods: {
    ChangeCatEvent(val) {
      console.log(val);
    },
    SelectCatEvent({ id, text }) {
      console.log({ id, text });
    },
    saveCost() {
      var data = {
        rdate: this.cost.rdate,
        cat: this.cost.cat,
        sub_cat: this.cost.sub_cat,
        desc: this.cost.mydesc,
        suma: this.cost.suma,
      };
      CostDataService.create(data)
        .then((response) => {
          this.cost.id = response.data.id;
          console.log(response.data);
          this.submitted = true;
        })
        .catch((e) => {
          console.log(e);
        });
    },
    pullCats() {
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
    // pullSubCats() {
    //   var cat = this.cat.val();
    //   CostDataService.subcats(cat)
    //     .then((response) => {
    //       this.options = response;
    //       console.log(response.data);
    //     })
    //     .catch((e) => {
    //       console.log(e);
    //     });
    // },
    newCost() {
      this.submitted = false;
      this.cost = {};
      this.pullCats();
    },
    // created() {
    //   this.pullCats();
    // },
  },
  mounted() {
    console.log("mounted");
    this.pullCats();
  },
};
</script>

<style>
.submit-form {
  max-width: 300px;
  margin: auto;
}
</style>