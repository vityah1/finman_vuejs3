<template>
  <div class="container">
    <alert-component ref="myAlert"></alert-component>
    <!-- Modal -->
    <b-modal v-if="currentCategory" v-model="showModal" @ok="do_form_action()" :title="okTitle" :okTitle="okTitle">
      <div>
        <h5 class="modal-title text-danger">
          {{ okTitle }} {{ currentCategory.name }} [{{ currentCategory.id }}]
        </h5>
      </div>
      <div>
        <form v-if="currentCategory">
          <div class="form-group">
            <!-- <label>{{ currentCategory.name }}</label> -->
          </div>

          <div class="form-group">
            <label><strong>Name:</strong></label>
            <input type="text" class="form-control" id="category_name" v-model="currentCategory.name" />
          </div>
          <div class="form-group">
            <label><strong>Parent Category:</strong></label>
            <select v-model="currentCategory.parent_id" class="form-select">
              <option value="0">(No Parent)</option>
              <option v-for="category in formattedCategories" :value="category.id" :key="category.id">
                {{ category.name }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label class="me-2"><strong>Is Fuel:</strong></label>
            <input type="checkbox" class="form-check-input" id="is_fuel" v-model="currentCategory.is_fuel" />
          </div>
        </form>
        <b-button variant="danger" class="mt-2" @click="deleteCategory">
          Delete
        </b-button>
      </div>
    </b-modal>

    <b-table-simple hover small caption-top responsive>
      <caption>User categories
        <b-button @click="open_form_add_category()" variant="outline-primary" class="btn-sm">➕</b-button>
      </caption>
      <b-thead>
        <b-tr>
          <b-th>ID</b-th>
          <b-th>Name</b-th>
          <b-th>Parent ID</b-th>
        </b-tr>
      </b-thead>
      <b-tbody v-if="formattedCategories && formattedCategories.length > 0">
        <b-tr v-for="category in formattedCategories" :key="category.id" @click="open_form_edit_category(category.id)">
          <b-td>{{ category.id }}</b-td>
          <b-td>{{ category.name }}</b-td>
          <b-td>{{ category.parent_id }}</b-td>
        </b-tr>
      </b-tbody>
      <b-tfoot></b-tfoot>
    </b-table-simple>

    <div v-if="!formattedCategories || formattedCategories.length === 0">Loading...</div>
  </div>
</template>

<script>
import CategoryService from "../services/CategoryService";

export default {
  name: "UserCategory",
  data() {
    return {
      okTitle: "",
      showModal: false,
      categories: this.$store.state.sprs.categories || [],
      currentCategory: {},
      // formattedCategories: [],
    };
  },
  computed: {
    formattedCategories() {
      return this.formatCategories(this.categories || []);
    },
  },
  methods: {
    formatCategories(categories, parentId = null, prefix = '') {
			return categories.reduce((acc, category) => {
				if ((category.parent_id === parentId) || (parentId === null && !category.parent_id)) {
					acc.push({
						...category,
						name: prefix + category.name
					});
					const children = this.formatCategories(categories, category.id, prefix + '--');
					acc = acc.concat(children);
				}
				return acc;
			}, []);
		},
    do_form_action() {
      if (this.currentCategory.action === 'add') {
        this.addCategory();
      } else if (this.currentCategory.action === 'edit') {
        this.updateCategory();
      }
    },
    open_form_add_category() {
      this.currentCategory = { parent_id: 0, name: '', is_fuel: false, action: 'add' };
      this.okTitle = 'Add';
      this.showModal = true;
    },
    async open_form_edit_category(id) {
      CategoryService.getCategory(id)
        .then((response) => {
          this.currentCategory = { ...response.data, action: 'edit' };
          this.okTitle = 'Update';
          this.showModal = true;
        })
        .catch((e) => {
          console.error('Error loading category:', e);
        });
    },
    async updateCategory() {
      CategoryService.updateCategory(this.currentCategory.id, this.currentCategory)
        .then(() => {
          this.refreshCategories();
          this.$refs.myAlert.showAlert('success', 'Category updated');
        })
        .catch((e) => {
          console.error('Error updating category:', e);
          this.$refs.myAlert.showAlert('danger', 'Update failed');
        });
      this.showModal = false;
    },
    async addCategory() {
      CategoryService.addCategory(this.currentCategory)
        .then(() => {
          this.refreshCategories();
          this.$refs.myAlert.showAlert('success', 'Category added');
        })
        .catch((e) => {
          console.error('Error updating category:', e);
          this.$refs.myAlert.showAlert('danger', 'Add failed');
        });
      this.showModal = false;
    },
    async deleteCategory() {
      CategoryService.deleteCategory(this.currentCategory.id)
        .then(() => {
          this.refreshCategories();
          this.$refs.myAlert.showAlert('success', 'Category deleted');
        })
        .catch((e) => {
          console.error('Error updating category:', e);
          this.$refs.myAlert.showAlert('danger', 'Delete failed');
        });
      this.showModal = false;
    },
    refreshCategories() {
      CategoryService.getCategories()
        .then(response => {
          this.categories = response;
          console.log('refreshCategories => response:', response.length);
        })
        .catch(e => {
          console.error('Error fetching categories:', e);
        });
    }
  },
  mounted() {
    this.refreshCategories();
  },
};
</script>
