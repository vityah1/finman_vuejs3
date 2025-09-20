<template>
  <Card class="summary-card" :class="cardClass">
    <template #content>
      <div class="summary-content">
        <div class="summary-header">
          <div class="summary-icon" v-if="icon">
            <i :class="icon"></i>
          </div>
          <div class="summary-text">
            <h6 class="summary-title">{{ title }}</h6>
            <p class="summary-subtitle" v-if="subtitle">{{ subtitle }}</p>
          </div>
        </div>

        <div class="summary-value" :class="valueClass">
          <span class="value-amount">{{ formattedValue }}</span>
          <span class="value-currency" v-if="showCurrency">{{ currency }}</span>
        </div>

        <div class="summary-footer" v-if="$slots.footer || footerText">
          <slot name="footer">
            <small class="text-muted">{{ footerText }}</small>
          </slot>
        </div>
      </div>
    </template>
  </Card>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';
import Card from 'primevue/card';

export default defineComponent({
  name: 'SummaryCard',
  components: {
    Card
  },
  props: {
    title: {
      type: String,
      required: true
    },
    subtitle: {
      type: String,
      default: ''
    },
    value: {
      type: [Number, String],
      required: true
    },
    currency: {
      type: String,
      default: 'UAH'
    },
    showCurrency: {
      type: Boolean,
      default: true
    },
    icon: {
      type: String,
      default: ''
    },
    footerText: {
      type: String,
      default: ''
    },
    variant: {
      type: String,
      default: 'default',
      validator: (value: string) => ['default', 'success', 'danger', 'warning', 'info'].includes(value)
    },
    format: {
      type: String,
      default: 'currency',
      validator: (value: string) => ['currency', 'number', 'percent', 'custom'].includes(value)
    },
    compact: {
      type: Boolean,
      default: false
    }
  },
  setup(props) {
    const formattedValue = computed(() => {
      if (props.format === 'custom' || typeof props.value === 'string') {
        return props.value;
      }

      const numValue = Number(props.value);

      switch (props.format) {
        case 'currency':
          return new Intl.NumberFormat('uk-UA', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
          }).format(numValue);

        case 'percent':
          return new Intl.NumberFormat('uk-UA', {
            style: 'percent',
            minimumFractionDigits: 0,
            maximumFractionDigits: 1
          }).format(numValue / 100);

        case 'number':
        default:
          return new Intl.NumberFormat('uk-UA').format(numValue);
      }
    });

    const cardClass = computed(() => ({
      [`summary-${props.variant}`]: props.variant !== 'default',
      'summary-compact': props.compact
    }));

    const valueClass = computed(() => ({
      [`text-${props.variant}`]: props.variant !== 'default'
    }));

    return {
      formattedValue,
      cardClass,
      valueClass
    };
  }
});
</script>

<style scoped>
.summary-card {
  margin-bottom: var(--spacing-md);
  border: 1px solid var(--border-color);
  box-shadow: var(--shadow-sm);
  transition: var(--transition-base);
}

.summary-card:hover {
  box-shadow: var(--shadow-md);
}

.summary-compact :deep(.p-card-body) {
  padding: var(--spacing-sm);
}

.summary-content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.summary-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.summary-icon {
  font-size: 1.5rem;
  color: var(--color-primary);
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(25, 118, 210, 0.1);
  border-radius: var(--border-radius-md);
}

.summary-text {
  flex: 1;
}

.summary-title {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--text-secondary);
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.summary-subtitle {
  font-size: var(--font-size-xs);
  color: var(--text-muted);
  margin: 2px 0 0 0;
}

.summary-value {
  display: flex;
  align-items: baseline;
  gap: var(--spacing-xs);
  font-size: var(--font-size-xxl);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
}

.value-amount {
  font-size: inherit;
  font-weight: inherit;
}

.value-currency {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-normal);
  color: var(--text-secondary);
}

.summary-footer {
  padding-top: var(--spacing-sm);
  border-top: 1px solid var(--border-color);
  font-size: var(--font-size-xs);
}

/* Variant styles */
.summary-success {
  border-color: var(--color-success);
}

.summary-success .summary-icon {
  color: var(--color-success);
  background: rgba(40, 167, 69, 0.1);
}

.text-success {
  color: var(--color-success) !important;
}

.summary-danger {
  border-color: var(--color-danger);
}

.summary-danger .summary-icon {
  color: var(--color-danger);
  background: rgba(220, 53, 69, 0.1);
}

.text-danger {
  color: var(--color-danger) !important;
}

.summary-warning {
  border-color: var(--color-warning);
}

.summary-warning .summary-icon {
  color: var(--color-warning);
  background: rgba(255, 193, 7, 0.1);
}

.text-warning {
  color: var(--color-warning) !important;
}

.summary-info {
  border-color: var(--color-info);
}

.summary-info .summary-icon {
  color: var(--color-info);
  background: rgba(23, 162, 184, 0.1);
}

.text-info {
  color: var(--color-info) !important;
}

/* Mobile responsive */
@media (max-width: 768px) {
  .summary-value {
    font-size: var(--font-size-xl);
  }

  .value-currency {
    font-size: var(--font-size-sm);
  }
}
</style>