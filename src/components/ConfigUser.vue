<template>
  <div class="container">
    <alert-component ref="myAlert"></alert-component>
    <!-- Modal -->
    <b-modal v-if="currentConfig.name" v-model="showModal" 
    @ok="updateConfig(currentConfig.name, currentConfig.is_need_add_value)" 
    :title="okTitle" 
    :okTitle="okTitle"
    >
      <div>
        <h5 class="modal-title text-danger">
          Edit {{ this.currentConfig.name }} [{{ this.currentConfig.id }}]
        </h5>
      </div>
      <div>
        <form v-if="currentConfig">
          <div class="form-group">
            <label>{{ currentConfig.name }}</label>
          </div>

          <div class="form-group">
            <label><strong>Value:</strong></label>
            <input type="text" class="form-control" id="amount" v-model="currentConfig.value_data" />
          </div>

          <div v-if="currentConfig.is_need_add_value" class="form-group">
            <label for="description"><strong>Add value:</strong></label>
            <input type="text" class="form-control" id="description" v-model="currentConfig.add_value" />
          </div>
        </form>
        <b-button variant="danger" class="mt-2" @click="deleteConfig">
          Delete
        </b-button>
      </div>
    </b-modal>

    <b-table-simple hover small caption-top responsive>
      <caption>User settings</caption>
      <b-thead>
        <!-- <b-th>Name</b-th>
        <b-th>Value</b-th>
        <b-th>Add value</b-th> -->
      </b-thead>
      <b-tbody v-if="(configs.length > 0)">
        <b-tr v-for="(config, index) in configs" :key="index">
          <b-td>
          {{ console.log(config) }}
          <table class="w-100">
          <b-tr>
          <b-td colspan="3"><span class="fw-bold text-dark">{{ config.name }}: </span>
            <b-button v-if="(!(config.id) || (config.is_multiple))"
            @click="add_config(config.type_data, config.is_need_add_value, config.name)"
            variant="outline-primary"
            class="btn-sm"
            > ➕ </b-button>
          </b-td>
          </b-tr>
          <b-tr 
          @click="get_config(config.id, config.is_need_add_value, config.name)"
          
          >
           <b-td class="col-1"><span v-if="config.id">
          [{{ config.id }}]</span>
        </b-td>
          <b-td class="text-start col-7">{{ config.value_data }}</b-td>
          <b-td class="text-start col-4">
            <span v-if="(config.is_need_add_value)"
          > -> [{{ config.add_value }}]
        </span>
        </b-td>
        </b-tr>
      </table>
        </b-td>
      </b-tr>
      </b-tbody>
      <b-tfoot></b-tfoot>
    </b-table-simple>

    <div v-if="(configs.length == 0)">Loading...</div>
  </div>
</template>

<script>
import ConfigService from "../services/ConfigService";

export default {
  name: "ConfigUser",
  data() {
    return {
      okTitle: "",
      configs: [],
      config_types: [],
      q: this.$route.query.q || "",
      currentConfig: {},
      // type_data: { name: '' },
      // config: {is_need_add_value: null},
      user: this.$route.query.user,
      showModal: false,
    };
  },
  computed: {
    currentUser() {
      return this.$store.state.auth.user;
    },
  },
  methods: {
    async getConfigTypes(mode) {
      ConfigService.getConfigTypes(mode)
        .then((response) => {
          this.config_types = response.data;
        })
        .catch((e) => {
          console.log(e);
        });
    },
    async add_config(type_data, is_need_add_value, name) {
      this.currentConfig.value_data = '';
      this.currentConfig.type_data = type_data;
      this.currentConfig.is_need_add_value = is_need_add_value;
      this.currentConfig.name = name;
      this.currentConfig.action = 'add';
      this.currentConfig.add_value = '';
      this.okTitle = 'Add';
      this.showModal = true;
    },
    async get_config(id, is_need_add_value, name) {
      ConfigService.getConfig(id)
        .then((response) => {
          this.currentConfig = response.data;
          this.currentConfig.is_need_add_value = is_need_add_value;
          this.currentConfig.name = name;
          this.currentConfig.action = 'edit';
          console.log(response.data);
          this.okTitle = 'Update';
          this.showModal = true;
        })
        .catch((e) => {
          console.log(e);
        });
    },
    async updateConfig(name, is_need_add_value) {
      ConfigService.updateConfig(this.currentConfig.id, this.currentConfig)
        .then((response) => {
          this.currentConfig = response.data;
          this.currentConfig.name = name;
          this.currentConfig.is_need_add_value = is_need_add_value;          
          this.configs.map((c, index) => {
            if (c.id == this.currentConfig.id) {
              this.configs[index] =  this.currentConfig;
            }
          });
          this.$refs.myAlert.showAlert('success', 'config updated');
        })
        .catch((e) => {
          console.log(e);
          this.$refs.myAlert.showAlert('danger', 'config update failed');
        });
        this.showModal = false;
    },
    async deleteConfig() {
      ConfigService.deleteConfig(this.currentConfig.id)
        .then((response) => {
          console.log(response.data.data);
          this.message = response.data.data;
          const index = this.configs
            .map(function (item) {
              return item.id;
            })
            .indexOf(this.currentConfig.id);

          this.configs.splice(index, 1);
          this.$refs.myAlert.showAlert('success', 'config deleted');
        })
        .catch((e) => {
          console.log(e);
          this.$refs.myAlert.showAlert('danger', 'config delete failed');
        });
        this.showModal = false;
    },
    async getUserConfig() {
      ConfigService.getUserConfig()
        .then((response) => {
          this.configs = response.data;
          console.log(response.data);
        })
        .catch((e) => {
          console.log(e);
        });
    },
  },
  mounted() {
    if (!this.currentUser) {
      this.$router.push({ name: "login" });
    }
    this.getConfigTypes();
    this.getUserConfig();
  },
};
</script>
