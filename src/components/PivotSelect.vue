<template>
  <div class="col-auto">
    <select
      class="form-control w-auto ms-3"
      v-model="selectedPivot"
      @change="navigateToPivot"
    >
		<option value="" selected>None</option>
      <option value="PivotData">Pivot Data</option>
      <option value="PivotData2">Pivot Data 2</option>
      <option value="PivotData3">Pivot Data 3</option>
      <option value="PivotData4">Pivot Data 4</option>
      <option value="PivotData5">Pivot Data 5</option>
      <option value="PivotData6">Pivot Data 6</option>
      <option value="PivotData7">Pivot Data 7</option>
    </select>
  </div>
</template>

<script>
export default {
  name: 'PivotSelect',
  props: {
    year: {
      type: Number,
      required: true
    },
    month: {
      type: Number,
      required: true
    },
    monoUserId: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      selectedPivot: 'PivotData',
    };
  },
  methods: {
    navigateToPivot() {
      const pivotRoutes = {
        PivotData: 'pivot_payments',
        PivotData2: 'pivot_payments_2',
        PivotData3: 'pivot_payments_3',
        PivotData4: 'pivot_payments_4',
        PivotData5: 'pivot_payments_5',
        PivotData6: 'pivot_payments_6',
        PivotData7: 'pivot_payments_7',
      };
      this.$router.push({
        name: pivotRoutes[this.selectedPivot],
        params: {
          action: 'show',
          year: this.year,
          month: this.month,
          mono_user_id: this.monoUserId,
        }
      });
    }
  }
};
</script>
