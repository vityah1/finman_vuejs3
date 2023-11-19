<template>
  <div class="container">
    <alert-component ref="myAlert"></alert-component>
    <!-- Modal -->
    <b-modal 
    v-if="currentCategory" 
    v-model="showModal" 
    @ok="do_form_action()" 
    :title="okTitle" 
    :okTitle="okTitle"
    >
      <div>
        <h5 class="modal-title text-danger">
          {{ okTitle }} {{ currentCategory.name }} [{{ currentCategory.id }}]
        </h5>
      </div>
      <div>
        <form v-if="currentCategory">
          <div class="form-group">
            <label>{{ currentCategory.name }}</label>
          </div>

          <div class="form-group">
            <label><strong>Name:</strong></label>
            <input type="text" class="form-control" id="category_name" v-model="currentCategory.name" />
          </div>
          <div class="form-group">
            <label><strong>parent id:</strong></label>
            <select v-model="currentCategory.parent_id" class="form-select">
              <option value="0"></option>
              <option v-for="category in categories" :value=category.id :key=category.id>{{ category.name }}</option>
            </select>
          </div>
        </form>
        <b-button variant="danger" class="mt-2" @click="deleteCategory">
          Delete
        </b-button>
      </div>
    </b-modal>

    <b-table-simple hover small caption-top responsive>
      <caption>User categories
        <b-button @click="open_form_add_category()" variant="outline-primary"
          class="btn-sm"> ➕ </b-button>
      </caption>
      <b-thead>
      </b-thead>
      <b-tbody v-if="(categories.length > 0)">
        <b-tr v-for="(category, index) in categories" 
        :key="index" 
        @click="open_form_edit_category(category.id, category.name, category.parent_id)"
        >
          <b-td class="col-1"><span v-if="category.id">
              [{{ category.id }}]</span>
          </b-td>
          <b-td class="text-start col-6 col-md-8">
            {{ category.name }}</b-td>

          <b-td class="text-start col-4 col-md-6">
            {{ category.parent_id }}
          </b-td>
        </b-tr>
      </b-tbody>
      <b-tfoot></b-tfoot>
    </b-table-simple>

    <div v-if="(categories.length == 0)">Loading...</div>
  </div>
</template>

<script>
import CategoryService from "../services/CategoryService";

export default {
  name: "UserCategory",
  data() {
    return {
      okTitle: "",
      q: this.$route.query.q || "",
      user: this.$route.query.user,
      showModal: false,
      categories: [],
      currentCategory: {},
    };
  },
  computed: {
    currentUser() {
      return this.$store.state.auth.user;
    },
  },
  methods: {
    do_form_action() {
      if (this.currentCategory.action === 'add'){this.addCategory();}
      else if (this.currentCategory.action === 'edit'){this.updateCategory();}
    },    
    open_form_add_category() {
      this.currentCategory.parent_id = 0;
      this.currentCategory.name = '';
      this.currentCategory.action = 'add';
      this.okTitle = 'Add';
      this.showModal = true;
    },
    async open_form_edit_category(id, parent_id, name) {
      CategoryService.getCategory(id)
        .then((response) => {
          this.currentCategory = response.data;
          this.currentCategory.name = name;
          this.currentCategory.parent_id = parent_id;
          this.currentCategory.action = 'edit';
          console.log(response.data);
          this.okTitle = 'Update';
          this.showModal = true;
        })
        .catch((e) => {
          console.log(e);
        });
    },
    async updateCategory() {
      CategoryService.updateCategory(
        this.currentCategory.id, this.currentCategory)
        .then((response) => {
          console.log(`user category: ${response}`)
          this.getUserCategory()
          this.$refs.myAlert.showAlert('success', 'category updated');
        })
        .catch((e) => {
          console.log(e);
          this.$refs.myAlert.showAlert('danger', 'category update failed');
        });
      this.showModal = false;
    },
    async addCategory() {
      CategoryService.addCategory(
        this.currentCategory.id, this.currentCategory)
        .then((response) => {
          console.log(`user category: ${response}`)
          this.getUserCategory()
          this.$refs.myAlert.showAlert('success', 'category added');
        })
        .catch((e) => {
          console.log(e);
          this.$refs.myAlert.showAlert('danger', 'category added failed');
        });
      this.showModal = false;
    },
    async deleteCategory() {
      CategoryService.deleteCategory(this.currentCategory.id)
        .then((response) => {
          console.log(response.data.data);
          this.message = response.data.data;
          const index = this.categories
            .map(function (item) {
              return item.id;
            })
            .indexOf(this.currentCategory.id);

          this.categories.splice(index, 1);
          this.$refs.myAlert.showAlert('success', 'category deleted');
        })
        .catch((e) => {
          console.log(e);
          this.$refs.myAlert.showAlert('danger', 'category delete failed');
        });
      this.showModal = false;
    },
    findCategoryNameById(categoryId) {
      for (let i = 0; i < this.categories.length; i++) {
        if (this.categories[i].id === categoryId) {
          return this.categories[i].name;
        }
      }
      return null;
    }
  },
  mounted() {
    if (!this.currentUser) {
      this.$router.push({ name: "login" });
    }
    this.categories = this.$store.state.sprs.categories;
  },
};
</script>
