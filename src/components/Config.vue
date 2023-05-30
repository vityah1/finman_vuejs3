<template>
  <div class="container">
    <!-- Modal -->
    <div class="modal fade" id="editModal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title text-danger" id="exampleModalLabel">
              Edit {{this.currentConfig.name}} [{{this.currentConfig.id}}]
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <form v-if="currentConfig">
              <div class="form-group">
                <label>{{currentConfig.name}}</label>
              </div>             

              <div class="form-group">
                <label><strong>Value:</strong></label>
                <input type="text" class="form-control" id="amount" v-model="currentConfig.value_data" />
              </div>

              <div v-if="currentConfig.is_need_add_value" class="form-group">
                <label for="description">Add value:</label>
                <input type="text" class="form-control" id="description" v-model="currentConfig.add_value" />
              </div> 

            </form>
            <p></p>
            <button class="btn btn-danger mr-2" @click="deleteConfig" data-bs-dismiss="modal">
              Delete
            </button>
            &nbsp;&nbsp;
            <button type="submit" class="btn btn-success" @click="updateConfig" data-bs-dismiss="modal">
              Update
            </button>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-warning" data-bs-dismiss="modal">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="row">
      <div class="col-2 h4 text-success"><p>{{ message }}</p></div>
    </div>

      <div class="row">
        <div class="col">Name</div>
          <div class="col">Value</div>
            <div class="col">Add value</div>
      </div>

      <div v-for="(config, index) in configs" :key="index" data-bs-toggle="modal" data-bs-target="#editModal">
          <div class="row mb-2">
            <div class="col"> {{ config.name }}: </div>
            <div v-if="(!(config.id) || (config.is_multiple))" class="col" 
            @click="add_config(config.type_data, config.is_need_add_value, config.name)">
              <button class="btn btn-primary" style="height: 25px;"> + </button> </div>
          </div>
          <div class="row mb-2" @click="get_config(config.id, config.is_need_add_value, config.name)">
            <div class="col-1">{{ config.id }}</div>
            <div class="col">{{ config.value_data }}</div>
            <div v-if="config.is_need_add_value" class="col"> {{ config.add_value }}</div>
          </div>
        </div>
  </div>
</template>

<script>
import ConfigService from "../services/ConfigService";

export default {
  name: "configs",
  data() {
    return {
      configs: [],
      cinfig_types: [],
      q: this.$route.query.q || "",
      currentConfig: {},
      type_data: {name: ''},
      message: "",
      user: this.$route.query.user,
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
      if (is_need_add_value) {
        this.currentConfig.add_value = '';
      } else {this.currentConfig.add_value = ''}
    },    
    async get_config(id, is_need_add_value, name) {
      ConfigService.getConfig(id )
        .then((response) => {          
          this.currentConfig = response.data;
          this.currentConfig.is_need_add_value = is_need_add_value;
          this.currentConfig.name = name;           
          this.currentConfig.action = 'edit';         
          console.log(response.data);
        })
        .catch((e) => {
          console.log(e);
        });
    },
    async updateConfig() {
      ConfigService.updateConfig(this.currentConfig.id, this.currentConfig)
        .then((response) => {
          this.currentConfig = response.data;
          this.configs.map((c, index) => {
            if (c.id == this.currentConfig.id) {
              this.configs[index] = {
                id: this.currentConfig.id,
                type_data: this.currentConfig.type_data,
                value_data: this.currentConfig.value_data,
                add_value: this.currentConfig.add_value,
              };
            }
          });
        })
        .catch((e) => {
          console.log(e);
        });
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
        })
        .catch((e) => {
          console.log(e);
        });
    },
    log(item) {
      console.log(item);
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
