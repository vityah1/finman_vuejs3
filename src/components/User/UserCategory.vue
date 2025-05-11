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

<script lang="ts">
import CategoryService from "../../services/CategoryService";
import { defineComponent } from 'vue';

interface Category {
  id?: number;
  name: string;
  parent_id?: number | null;
  is_fuel?: boolean;
  action?: 'add' | 'edit';
  [key: string]: any;
}

interface AlertComponent {
  showAlert: (type: string, message: string) => void;
  [key: string]: any;
}

export default defineComponent({
  name: "UserCategory",
  data() {
    return {
      okTitle: "",
      showModal: false,
      categories: (this.$store as any).state.sprs.categories || [] as Category[],
      currentCategory: {} as Category,
      // formattedCategories: [],
    };
  },
  computed: {
    formattedCategories() {
      // Перевіряємо, що categories є масивом перед викликом reduce
      if (!Array.isArray(this.categories)) {
        console.warn('categories is not an array:', this.categories);
        return [];
      }
      return this.formatCategories(this.categories);
    },
  },
  methods: {
    formatCategories(categories: Category[], parentId: number | null = null, prefix = ''): Category[] {
      // Додаткова перевірка, що categories є масивом
      if (!Array.isArray(categories)) {
        console.warn('formatCategories: categories is not an array:', categories);
        return [];
      }

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
    do_form_action(): void {
      if (this.currentCategory.action === 'add') {
        this.addCategory();
      } else if (this.currentCategory.action === 'edit') {
        this.updateCategory();
      }
    },
    open_form_add_category(): void {
      this.currentCategory = { parent_id: 0, name: '', is_fuel: false, action: 'add' };
      this.okTitle = 'Add';
      this.showModal = true;
    },
    async open_form_edit_category(id: number): Promise<void> {
      CategoryService.getCategory(id)
        .then((response) => {
          // Перевіряємо, що response.data є об'єктом перед використанням spread оператора
          const categoryData = response.data && typeof response.data === 'object' ? response.data : {};
          this.currentCategory = { ...categoryData, action: 'edit' };
          this.okTitle = 'Update';
          this.showModal = true;
        })
        .catch((e) => {
          console.error('Error loading category:', e);
        });
    },
    async updateCategory(): Promise<void> {
      CategoryService.updateCategory(this.currentCategory.id, this.currentCategory)
        .then(() => {
          this.refreshCategories();
          (this.$refs.myAlert as AlertComponent).showAlert('success', 'Category updated');
        })
        .catch((e) => {
          console.error('Error updating category:', e);
          (this.$refs.myAlert as AlertComponent).showAlert('danger', 'Update failed');
        });
      this.showModal = false;
    },
    async addCategory(): Promise<void> {
      CategoryService.addCategory(this.currentCategory)
        .then(() => {
          this.refreshCategories();
          (this.$refs.myAlert as AlertComponent).showAlert('success', 'Category added');
        })
        .catch((e) => {
          console.error('Error updating category:', e);
          (this.$refs.myAlert as AlertComponent).showAlert('danger', 'Add failed');
        });
      this.showModal = false;
    },
    async deleteCategory(): Promise<void> {
      CategoryService.deleteCategory(this.currentCategory.id)
        .then(() => {
          this.refreshCategories();
          (this.$refs.myAlert as AlertComponent).showAlert('success', 'Category deleted');
        })
        .catch((e) => {
          console.error('Error updating category:', e);
          (this.$refs.myAlert as AlertComponent).showAlert('danger', 'Delete failed');
        });
      this.showModal = false;
    },
    refreshCategories(): void {
      CategoryService.getCategories()
        .then(response => {
          if (response && response.data) {
            this.categories = response.data;
            console.log('refreshCategories => categories:', this.categories.length);
          } else {
            console.error('No data in response:', response);
            this.categories = [];
          }
        })
        .catch(e => {
          console.error('Error fetching categories:', e);
          this.categories = [];
        });
    }
  },
  mounted(): void {
    this.refreshCategories();
  },
});
</script>
