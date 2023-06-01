<template>

    <b-alert ref="myAlert" 
    class="mt-2"
    dismissible @click="dismissAlert"
    :model-value="alertVisible"
    :variant="alertVariant"
    fade="true"
    mb-1
    >{{alertContent}}
    </b-alert> 

</template>

<script>
export default { 
  name: "AlertComponent",
  // components: "AlertComponent",
  data() {
    return {
      alertContent: "",
      alertVariant: "",
      alertVisible: false,
    };
  },
  methods: {
    dismissAlert() {this.alertVisible=false;},
    showAlert(variant, content) {
      console.log('showAlert');
      this.alertContent = content;
      this.alertVariant = variant;
      this.alertVisible = true;
      setTimeout(() => {
        this.alertVisible = false;
      }, 5000);
    },
  },
};
</script>
