<template>
  <div>
    <alert-component ref="myAlert"></alert-component>

    <!-- Modal -->
    <Dialog
      v-if="currentCategory"
      v-model:visible="showModal"
      :header="okTitle + ' категорію'"
      modal
      style="width: 50rem"
      :breakpoints="{ '1199px': '75vw', '575px': '90vw' }"
    >
      <div v-if="currentCategory" style="margin-bottom: 1rem;">
        <div style="margin-bottom: 1rem;">
          <label style="font-weight: 600; margin-bottom: 0.5rem; display: block;">
            <i class="pi pi-tag" style="color: var(--primary-color); margin-right: 0.5rem;"></i>
            Назва категорії:
          </label>
          <InputText v-model="currentCategory.name" style="width: 100%;" />
        </div>

        <div style="margin-bottom: 1rem;">
          <label style="font-weight: 600; margin-bottom: 0.5rem; display: block;">
            <i class="pi pi-sitemap" style="color: var(--primary-color); margin-right: 0.5rem;"></i>
            Батьківська категорія:
          </label>
          <Dropdown
            v-model="currentCategory.parent_id"
            :options="parentCategoryOptions"
            optionLabel="name"
            optionValue="id"
            placeholder="Без батьківської категорії"
            style="width: 100%;"
            :showClear="true"
          />
        </div>

        <div style="margin-bottom: 1rem;">
          <div style="display: flex; align-items: center; gap: 0.5rem;">
            <Checkbox
              v-model="currentCategory.is_fuel"
              :binary="true"
              inputId="is_fuel"
            />
            <label for="is_fuel" style="font-weight: 600;">
              <i class="pi pi-bolt" style="color: var(--orange-500); margin-right: 0.5rem;"></i>
              Пальне
            </label>
          </div>
          <small style="color: var(--text-color-secondary);">Позначте, якщо це категорія для пального</small>
        </div>
      </div>

      <template #footer>
        <PButton label="Скасувати" icon="pi pi-times" text @click="showModal = false" />
        <PButton v-if="currentCategory.action === 'edit'" label="Видалити" icon="pi pi-trash" severity="danger" @click="deleteCategory" />
        <PButton :label="okTitle" icon="pi pi-check" @click="do_form_action" />
      </template>
    </Dialog>

    <PCard>
      <template #header>
        <div style="padding: 1rem; display: flex; align-items: center; justify-content: space-between;">
          <div style="display: flex; align-items: center; gap: 0.5rem;">
            <i class="pi pi-tags" style="font-size: 1.5rem; color: var(--primary-color);"></i>
            <span style="font-weight: 600;">Категорії користувача</span>
          </div>
          <PButton
            @click="open_form_add_category()"
            icon="pi pi-plus"
            label="Додати категорію"
            size="small"
          />
        </div>
      </template>

      <template #content>
        <DataTable
          :value="formattedCategories"
          @row-click="(event) => open_form_edit_category(event.data.id)"
          dataKey="id"
          stripedRows
          style="cursor: pointer;"
          :paginator="formattedCategories.length > 10"
          :rows="10"
          :rowsPerPageOptions="[10, 25, 50]"
          paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
          currentPageReportTemplate="Показано {first} - {last} з {totalRecords} категорій"
        >
          <template #empty>
            <div style="text-align: center; padding: 2rem; color: var(--text-color-secondary);">
              <i class="pi pi-inbox" style="font-size: 2rem; margin-bottom: 1rem; display: block;"></i>
              Категорії завантажуються...
            </div>
          </template>

          <Column field="id" header="ID" style="width: 80px;" sortable>
            <template #body="{ data }">
              <PTag :value="'#' + data.id" severity="secondary" />
            </template>
          </Column>

          <Column field="name" header="Назва категорії" sortable>
            <template #body="{ data }">
              <div style="display: flex; align-items: center; gap: 0.5rem;">
                <i class="pi pi-tag" style="color: var(--primary-color);"></i>
                <span>{{ data.name }}</span>
                <PTag v-if="data.is_fuel" value="Пальне" severity="warning" size="small" />
              </div>
            </template>
          </Column>

          <Column field="parent_id" header="Батьківська категорія" sortable>
            <template #body="{ data }">
              <span v-if="data.parent_id">{{ findParentCategoryName(data.parent_id) }}</span>
              <span v-else style="color: var(--text-color-secondary); font-style: italic;">Головна категорія</span>
            </template>
          </Column>
        </DataTable>
      </template>
    </PCard>
  </div>
</template>

<script lang="ts">
import CategoryService from "../../services/CategoryService";
import { defineComponent } from 'vue';

// PrimeVue imports
import Dialog from 'primevue/dialog';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Dropdown from 'primevue/dropdown';
import Checkbox from 'primevue/checkbox';
import Tag from 'primevue/tag';
import Card from 'primevue/card';

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
  components: {
    Dialog,
    DataTable,
    Column,
    PButton: Button,
    InputText,
    Dropdown,
    Checkbox,
    PTag: Tag,
    PCard: Card
  },
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
    parentCategoryOptions() {
      if (!Array.isArray(this.categories)) {
        return [];
      }
      return [
        { name: 'Без батьківської категорії', id: null },
        ...this.categories.map(category => ({
          name: category.name,
          id: category.id
        }))
      ];
    }
  },
  methods: {
    formatCategories(categories: Category[], parentId: number | null = null, level = 0): Category[] {
      // Додаткова перевірка, що categories є масивом
      if (!Array.isArray(categories)) {
        console.warn('formatCategories: categories is not an array:', categories);
        return [];
      }

      return categories.reduce((acc, category) => {
        if ((category.parent_id === parentId) || (parentId === null && !category.parent_id)) {
          const indent = level > 0 ? "└─ ".repeat(level) : "";
          acc.push({
            ...category,
            name: indent + category.name
          });
          const children = this.formatCategories(categories, category.id, level + 1);
          acc = acc.concat(children);
        }
        return acc;
      }, []);
    },
    findParentCategoryName(parentId: number | null): string {
      if (!parentId || !Array.isArray(this.categories)) {
        return '';
      }
      const parent = this.categories.find(cat => cat.id === parentId);
      return parent ? parent.name : '';
    },
    do_form_action(): void {
      if (this.currentCategory.action === 'add') {
        this.addCategory();
      } else if (this.currentCategory.action === 'edit') {
        this.updateCategory();
      }
    },
    open_form_add_category(): void {
      this.currentCategory = { parent_id: null, name: '', is_fuel: false, action: 'add' };
      this.okTitle = 'Додати';
      this.showModal = true;
    },
    async open_form_edit_category(id: number): Promise<void> {
      CategoryService.getCategory(id)
        .then((response) => {
          // Перевіряємо, що response.data є об'єктом перед використанням spread оператора
          const categoryData = response.data && typeof response.data === 'object' ? response.data : {};
          this.currentCategory = { ...categoryData, action: 'edit' };
          this.okTitle = 'Оновити';
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
          (this.$refs.myAlert as AlertComponent).showAlert('success', 'Категорію оновлено');
        })
        .catch((e) => {
          console.error('Error updating category:', e);
          (this.$refs.myAlert as AlertComponent).showAlert('danger', 'Помилка оновлення');
        });
      this.showModal = false;
    },
    async addCategory(): Promise<void> {
      CategoryService.addCategory(this.currentCategory)
        .then(() => {
          this.refreshCategories();
          (this.$refs.myAlert as AlertComponent).showAlert('success', 'Категорію додано');
        })
        .catch((e) => {
          console.error('Error updating category:', e);
          (this.$refs.myAlert as AlertComponent).showAlert('danger', 'Помилка додавання');
        });
      this.showModal = false;
    },
    async deleteCategory(): Promise<void> {
      CategoryService.deleteCategory(this.currentCategory.id)
        .then(() => {
          this.refreshCategories();
          (this.$refs.myAlert as AlertComponent).showAlert('success', 'Категорію видалено');
        })
        .catch((e) => {
          console.error('Error updating category:', e);
          (this.$refs.myAlert as AlertComponent).showAlert('danger', 'Помилка видалення');
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
