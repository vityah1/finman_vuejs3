<template>
  <div class="data-table-wrapper">
    <!-- Desktop table view -->
    <div class="desktop-only">
      <DataTable
        :value="data"
        :paginator="paginator"
        :rows="rows"
        :rowsPerPageOptions="[10, 25, 50]"
        :loading="loading"
        :sortField="sortField"
        :sortOrder="sortOrder"
        :globalFilterFields="globalFilterFields"
        :filters="filters"
        :selection="selection"
        @update:selection="$emit('update:selection', $event)"
        @sort="$emit('sort', $event)"
        class="p-datatable-sm p-datatable-compact"
        :scrollable="scrollable"
        scrollHeight="calc(100vh - 250px)"
        responsiveLayout="stack"
        breakpoint="768px"
      >
        <!-- Column definitions from parent -->
        <slot name="columns"></slot>

        <!-- Empty message -->
        <template #empty>
          <div class="text-center py-4">
            <i class="pi pi-inbox text-4xl text-muted mb-2"></i>
            <p class="text-muted">Немає даних для відображення</p>
          </div>
        </template>

        <!-- Loading -->
        <template #loading>
          <div class="text-center py-4">
            <i class="pi pi-spin pi-spinner text-4xl text-primary"></i>
            <p class="mt-2">Завантаження...</p>
          </div>
        </template>
      </DataTable>
    </div>

    <!-- Mobile card view -->
    <div class="mobile-only">
      <div v-if="loading" class="text-center py-4">
        <i class="pi pi-spin pi-spinner text-4xl text-primary"></i>
        <p class="mt-2">Завантаження...</p>
      </div>

      <div v-else-if="!data || data.length === 0" class="text-center py-4">
        <i class="pi pi-inbox text-4xl text-muted mb-2"></i>
        <p class="text-muted">Немає даних для відображення</p>
      </div>

      <div v-else>
        <!-- Mobile cards -->
        <div v-for="(item, index) in paginatedData" :key="index" class="mobile-card">
          <slot name="mobile-card" :data="item" :index="index">
            <!-- Default mobile card layout -->
            <div class="card-row">
              <div class="card-content">
                <div class="text-truncate-2">{{ item.name || item.title || 'Item ' + (index + 1) }}</div>
                <small class="text-muted">{{ formatMobileSubtext(item) }}</small>
              </div>
              <div class="card-amount-col" v-if="item.amount">
                {{ formatAmount(item.amount) }}
              </div>
            </div>
          </slot>
        </div>

        <!-- Mobile pagination -->
        <div v-if="paginator" class="d-flex justify-content-center mt-3">
          <Paginator
            :rows="rows"
            :totalRecords="data.length"
            v-model:first="first"
            :rowsPerPageOptions="[10, 25, 50]"
            template="FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
            currentPageReportTemplate="{first}-{last} з {totalRecords}"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, ref, watch } from 'vue';
import DataTable from 'primevue/datatable';
import Paginator from 'primevue/paginator';

export default defineComponent({
  name: 'SharedDataTable',
  components: {
    DataTable,
    Paginator
  },
  props: {
    data: {
      type: Array,
      default: () => []
    },
    loading: {
      type: Boolean,
      default: false
    },
    paginator: {
      type: Boolean,
      default: true
    },
    rows: {
      type: Number,
      default: 25
    },
    sortField: {
      type: String,
      default: null
    },
    sortOrder: {
      type: Number,
      default: 1
    },
    globalFilterFields: {
      type: Array,
      default: () => []
    },
    filters: {
      type: Object,
      default: () => ({})
    },
    selection: {
      type: [Array, Object],
      default: null
    },
    scrollable: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:selection', 'sort'],
  setup(props) {
    const first = ref(0);

    const paginatedData = computed(() => {
      if (!props.paginator) return props.data;
      const start = first.value;
      const end = start + props.rows;
      return props.data.slice(start, end);
    });

    const formatAmount = (amount: number) => {
      return new Intl.NumberFormat('uk-UA', {
        style: 'currency',
        currency: 'UAH',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(amount);
    };

    const formatMobileSubtext = (item: any) => {
      // Try to find a suitable subtext
      if (item.description) return item.description;
      if (item.category) return item.category;
      if (item.date) return new Date(item.date).toLocaleDateString('uk-UA');
      if (item.period) return item.period;
      return '';
    };

    // Reset pagination when data changes
    watch(() => props.data, () => {
      first.value = 0;
    });

    return {
      first,
      paginatedData,
      formatAmount,
      formatMobileSubtext
    };
  }
});
</script>

<style scoped>
.data-table-wrapper {
  width: 100%;
}

/* PrimeVue table customization for compact design */
:deep(.p-datatable-sm .p-datatable-thead > tr > th) {
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--table-header-bg);
  color: var(--table-header-color);
  font-weight: var(--font-weight-semibold);
  font-size: var(--font-size-sm);
  border: none;
}

:deep(.p-datatable-sm .p-datatable-tbody > tr > td) {
  padding: var(--spacing-sm) var(--spacing-md);
  font-size: var(--font-size-sm);
  vertical-align: middle;
}

:deep(.p-datatable-sm .p-datatable-tbody > tr:hover) {
  background: var(--bg-hover);
}

:deep(.p-paginator) {
  padding: var(--spacing-sm);
  font-size: var(--font-size-sm);
}

:deep(.p-paginator .p-paginator-element) {
  min-width: 28px;
  height: 28px;
  padding: 0;
}

/* Mobile card styles */
.mobile-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-md);
  padding: var(--spacing-sm);
  margin-bottom: var(--spacing-sm);
  transition: var(--transition-fast);
}

.mobile-card:hover {
  background: var(--bg-hover);
  box-shadow: var(--shadow-md);
}

.card-row {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  min-height: 48px;
}

.card-content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.card-amount-col {
  flex-shrink: 0;
  text-align: right;
  font-weight: var(--font-weight-semibold);
  color: var(--color-success);
  font-size: var(--font-size-base);
}
</style>